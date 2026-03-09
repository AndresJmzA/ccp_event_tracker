import type { GameEvent } from "@/types";
import { isFixedSchedule, isMonthlySchedule, isRecurringSchedule, isWeeklySlotsSchedule } from "@/types";

const MINUTE_MS = 60 * 1000;

/** Zona horaria del servidor del juego (EE.UU. Este, con horario de verano). */
export const SERVER_TIMEZONE = "America/New_York";

const SERVER_TZ_OPTS: Intl.DateTimeFormatOptions = {
  timeZone: SERVER_TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
};
const SERVER_TZ_OPTS_HM: Intl.DateTimeFormatOptions = {
  timeZone: SERVER_TIMEZONE,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
};

/** Devuelve la fecha (año, mes, día) "hoy" en hora servidor (con DST). */
function getServerDate(userNow: Date): { y: number; m: number; d: number } {
  const formatter = new Intl.DateTimeFormat("en-CA", SERVER_TZ_OPTS);
  const parts = formatter.formatToParts(userNow);
  const y = parseInt(parts.find((p) => p.type === "year")!.value, 10);
  const m = parseInt(parts.find((p) => p.type === "month")!.value, 10) - 1;
  const d = parseInt(parts.find((p) => p.type === "day")!.value, 10);
  return { y, m, d };
}

/** Minutos desde medianoche en hora servidor (para RECURRING intervalMinutes). */
function getServerMinutesFromMidnight(userNow: Date): number {
  const formatter = new Intl.DateTimeFormat("en-CA", SERVER_TZ_OPTS_HM);
  const parts = formatter.formatToParts(userNow);
  const hour = parseInt(parts.find((p) => p.type === "hour")!.value, 10);
  const minute = parseInt(parts.find((p) => p.type === "minute")!.value, 10);
  return hour * 60 + minute;
}

/** UTC timestamp de las 00:00 del día (y,m,d) en zona servidor. Mes m 0-11. */
function getMidnightInServerZone(y: number, m: number, d: number): number {
  for (const utcHour of [5, 4]) {
    const t = Date.UTC(y, m, d, utcHour, 0, 0);
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: SERVER_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = fmt.formatToParts(new Date(t));
    const sy = parseInt(parts.find((p) => p.type === "year")!.value, 10);
    const sm = parseInt(parts.find((p) => p.type === "month")!.value, 10);
    const sd = parseInt(parts.find((p) => p.type === "day")!.value, 10);
    const sh = parseInt(parts.find((p) => p.type === "hour")!.value, 10);
    if (sy === y && sm === m + 1 && sd === d && sh === 0) return t;
  }
  return Date.UTC(y, m, d, 5, 0, 0);
}

/** UTC timestamp de (y,m,d, hour, minute) en zona servidor. Mes m 0-11. */
function getTimestampInServerZone(y: number, m: number, d: number, hour: number, minute: number): number {
  for (const utcOffset of [5, 4]) {
    const t = Date.UTC(y, m, d, hour + utcOffset, minute, 0);
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: SERVER_TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = fmt.formatToParts(new Date(t));
    const sy = parseInt(parts.find((p) => p.type === "year")!.value, 10);
    const sm = parseInt(parts.find((p) => p.type === "month")!.value, 10);
    const sd = parseInt(parts.find((p) => p.type === "day")!.value, 10);
    const sh = parseInt(parts.find((p) => p.type === "hour")!.value, 10);
    const smin = parseInt(parts.find((p) => p.type === "minute")!.value, 10);
    if (sy === y && sm === m + 1 && sd === d && sh === hour && smin === minute) return t;
  }
  return Date.UTC(y, m, d, hour + 5, minute, 0);
}

const WEEKDAY_TO_NUM: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
};

/** Día de la semana (0-6) en zona servidor para el instante dado. */
function getDayOfWeekInServerZone(instant: Date): number {
  const w = new Intl.DateTimeFormat("en-US", { timeZone: SERVER_TIMEZONE, weekday: "long" }).format(instant);
  return WEEKDAY_TO_NUM[w] ?? 0;
}

/**
 * Obtiene la próxima ocurrencia de un evento a partir de una fecha de referencia (p. ej. "ahora" del usuario).
 *
 * - FIXED: devuelve la fecha fija `at`.
 * - RECURRING: día de la semana + hora en servidor; calcula desde "hoy servidor" la próxima ocurrencia.
 * - MONTHLY: próximo día del mes a la hora indicada (hora servidor).
 * - WEEKLY_SLOTS: próximo slot en los días/horas definidos (hora servidor).
 */
/** Fecha muy lejana para eventos sin horario (no countdown) */
const NO_SCHEDULE_FAR_FUTURE_MS = 10 * 365 * 24 * 60 * 60 * 1000;

export function getNextOccurrence(event: GameEvent, userNow: Date): Date {
  const schedule = event.schedule;
  if (!schedule) {
    return new Date(userNow.getTime() + NO_SCHEDULE_FAR_FUTURE_MS);
  }

  if (isFixedSchedule(schedule)) {
    const at = schedule.at instanceof Date ? schedule.at : new Date(schedule.at);
    if (at.getTime() > userNow.getTime()) return at;
    const dayMs = 24 * 60 * 60 * 1000;
    let next = new Date(at.getTime());
    while (next.getTime() <= userNow.getTime()) {
      next = new Date(next.getTime() + dayMs);
    }
    return next;
  }

  if (isRecurringSchedule(schedule)) {
    const nowMs = userNow.getTime();

    if (schedule.dayOfWeek !== undefined && schedule.minutesFromMidnight !== undefined) {
      const { y: serverY, m: serverM, d: serverD } = getServerDate(userNow);
      const baseMidnight = getMidnightInServerZone(serverY, serverM, serverD);
      const dayMs = 24 * 60 * 60 * 1000;
      for (let i = 0; i < 8; i++) {
        const instant = new Date(baseMidnight + i * dayMs);
        if (getDayOfWeekInServerZone(instant) !== schedule.dayOfWeek) continue;
        const { y, m, d } = getServerDate(instant);
        const midnightServerUtc = getMidnightInServerZone(y, m, d);
        const ts = midnightServerUtc + schedule.minutesFromMidnight * MINUTE_MS;
        if (ts > nowMs) return new Date(ts);
      }
      return userNow;
    }

    if (schedule.intervalMinutes !== undefined && schedule.offsetMinutes !== undefined) {
      const serverTimeOfDay = getServerMinutesFromMidnight(userNow);
      const serverHour = Math.floor(serverTimeOfDay / 60);
      const serverMinute = serverTimeOfDay % 60;
      const minutePastHour = schedule.offsetMinutes % 60;
      let nextHour = serverHour;
      let nextMinute = minutePastHour;
      if (serverMinute >= nextMinute) nextHour += 1;
      const { y, m, d } = getServerDate(userNow);
      const dayMs = 24 * 60 * MINUTE_MS;
      if (nextHour >= 24) {
        nextHour -= 24;
        const nextDayMidnight = getMidnightInServerZone(y, m, d) + dayMs;
        const nextDayDate = new Date(nextDayMidnight);
        const { y: ny, m: nm, d: nd } = getServerDate(nextDayDate);
        const midnightServerUtc = getMidnightInServerZone(ny, nm, nd);
        const ts = midnightServerUtc + (nextHour * 60 + nextMinute) * MINUTE_MS;
        return new Date(ts);
      }
      const midnightServerUtc = getMidnightInServerZone(y, m, d);
      const ts = midnightServerUtc + (nextHour * 60 + nextMinute) * MINUTE_MS;
      return ts > nowMs ? new Date(ts) : userNow;
    }

    return userNow;
  }

  if (isMonthlySchedule(schedule)) {
    const day = Math.min(schedule.dayOfMonth, 28);
    const minutesFromMidnight = schedule.offsetMinutesFromMidnight;
    const hours = Math.floor(minutesFromMidnight / 60);
    const minutes = minutesFromMidnight % 60;
    const { y: sy, m: sm, d: sd } = getServerDate(userNow);
    const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
    let y = sy;
    let m = sm;
    const d = Math.min(day, daysInMonth(m, y));
    let candidate = new Date(getTimestampInServerZone(y, m, d, hours, minutes));
    if (candidate <= userNow) {
      m += 1;
      if (m > 11) {
        m = 0;
        y += 1;
      }
      const nextD = Math.min(day, daysInMonth(m, y));
      candidate = new Date(getTimestampInServerZone(y, m, nextD, hours, minutes));
    }
    return candidate;
  }

  if (isWeeklySlotsSchedule(schedule)) {
    const { y: startY, m: startM, d: startD } = getServerDate(userNow);
    const baseMidnight = getMidnightInServerZone(startY, startM, startD);
    const dayMs = 24 * 60 * MINUTE_MS;
    const candidates: number[] = [];

    for (let i = 0; i < 8; i++) {
      const instant = new Date(baseMidnight + i * dayMs);
      if (!schedule.daysOfWeek.includes(getDayOfWeekInServerZone(instant))) continue;
      const { y, m, d } = getServerDate(instant);
      const midnightServerUtc = getMidnightInServerZone(y, m, d);
      for (const slot of schedule.slotsMinutesFromMidnight) {
        candidates.push(midnightServerUtc + slot * MINUTE_MS);
      }
    }

    candidates.sort((a, b) => a - b);
    const nowMs = userNow.getTime();
    const next = candidates.find((ms) => ms > nowMs);
    if (next != null) return new Date(next);
    if (candidates.length > 0) return new Date(candidates[0]);
  }

  // Fallback (no debería llegarse con tipos correctos)
  return userNow;
}

/**
 * Formatea el tiempo restante entre `from` y `until` como "H:MM:SS" o "0:00:00" si ya pasó.
 * Todo en UTC/timestamps.
 */
export function formatCountdown(from: Date, until: Date): string {
  const totalSeconds = Math.max(0, Math.floor((until.getTime() - from.getTime()) / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${hours}:${pad(minutes)}:${pad(seconds)}`;
}
