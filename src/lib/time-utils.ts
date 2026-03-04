import type { GameEvent } from "@/types";
import { isFixedSchedule, isMonthlySchedule, isRecurringSchedule, isWeeklySlotsSchedule } from "@/types";

const MINUTE_MS = 60 * 1000;
/** Colombia: UTC-5. Medianoche Bogotá = 05:00 UTC. */
const BOGOTA_UTC_OFFSET_HOURS = 5;
const BOGOTA_OFFSET_MS = BOGOTA_UTC_OFFSET_HOURS * 60 * 60 * 1000;

/** Devuelve la fecha (año, mes, día) "hoy" en hora servidor (Bogotá). */
function getServerDate(userNow: Date): { y: number; m: number; d: number } {
  const serverNow = new Date(userNow.getTime() - BOGOTA_OFFSET_MS);
  return {
    y: serverNow.getUTCFullYear(),
    m: serverNow.getUTCMonth(),
    d: serverNow.getUTCDate(),
  };
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
      for (let i = 0; i < 8; i++) {
        const nextDate = new Date(Date.UTC(serverY, serverM, serverD + i));
        const y = nextDate.getUTCFullYear();
        const m = nextDate.getUTCMonth();
        const day = nextDate.getUTCDate();
        const midnightServerUtc = Date.UTC(y, m, day, BOGOTA_UTC_OFFSET_HOURS, 0, 0);
        if (new Date(midnightServerUtc).getUTCDay() !== schedule.dayOfWeek) continue;

        const ts = midnightServerUtc + schedule.minutesFromMidnight * MINUTE_MS;
        if (ts > nowMs) return new Date(ts);
      }
      return userNow;
    }

    if (schedule.intervalMinutes !== undefined && schedule.offsetMinutes !== undefined) {
      const serverTotalMinutes = Math.floor(userNow.getTime() / MINUTE_MS) - BOGOTA_UTC_OFFSET_HOURS * 60;
      const serverTimeOfDay = ((serverTotalMinutes % (24 * 60)) + 24 * 60) % (24 * 60);
      const serverHour = Math.floor(serverTimeOfDay / 60);
      const serverMinute = serverTimeOfDay % 60;
      const minutePastHour = schedule.offsetMinutes % 60;
      let nextHour = serverHour;
      let nextMinute = minutePastHour;
      if (serverMinute >= nextMinute) nextHour += 1;
      const { y, m, d } = getServerDate(userNow);
      if (nextHour >= 24) {
        nextHour -= 24;
        const nextDay = new Date(Date.UTC(y, m, d + 1));
        const midnightServerUtc = Date.UTC(
          nextDay.getUTCFullYear(),
          nextDay.getUTCMonth(),
          nextDay.getUTCDate(),
          BOGOTA_UTC_OFFSET_HOURS,
          0,
          0
        );
        const ts = midnightServerUtc + (nextHour * 60 + nextMinute) * MINUTE_MS;
        return new Date(ts);
      }
      const midnightServerUtc = Date.UTC(y, m, d, BOGOTA_UTC_OFFSET_HOURS, 0, 0);
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
    const utcHours = hours + BOGOTA_UTC_OFFSET_HOURS;
    let y = userNow.getUTCFullYear();
    let m = userNow.getUTCMonth();
    const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
    const d = Math.min(day, daysInMonth(m, y));
    let candidate = new Date(Date.UTC(y, m, d, utcHours, minutes, 0));
    if (candidate <= userNow) {
      m += 1;
      if (m > 11) {
        m = 0;
        y += 1;
      }
      const nextD = Math.min(day, daysInMonth(m, y));
      candidate = new Date(Date.UTC(y, m, nextD, utcHours, minutes, 0));
    }
    return candidate;
  }

  if (isWeeklySlotsSchedule(schedule)) {
    const { y: startY, m: startM, d: startD } = getServerDate(userNow);
    const candidates: number[] = [];

    for (let i = 0; i < 8; i++) {
      const d = new Date(Date.UTC(startY, startM, startD + i));
      const y = d.getUTCFullYear();
      const m = d.getUTCMonth();
      const day = d.getUTCDate();
      const midnightServerUtc = Date.UTC(y, m, day, BOGOTA_UTC_OFFSET_HOURS, 0, 0);
      const dayOfWeek = new Date(midnightServerUtc).getUTCDay();
      if (!schedule.daysOfWeek.includes(dayOfWeek)) continue;

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
