import type { GameEvent } from "@/types";
import { isFixedSchedule, isMonthlySchedule, isRecurringSchedule, isWeeklySlotsSchedule } from "@/types";

const MINUTE_MS = 60 * 1000;
/** Colombia: UTC-5. 20:00 Bogotá = 01:00 UTC (día siguiente). */
const BOGOTA_UTC_OFFSET_HOURS = 5;

/**
 * Obtiene la próxima ocurrencia de un evento a partir de una fecha de referencia (p. ej. "ahora" del usuario).
 * Cálculos internos en UTC (timestamps).
 *
 * - FIXED: devuelve la fecha fija `at`. Si ya pasó, se devuelve igual (la UI puede marcar como "terminado").
 * - RECURRING: devuelve la siguiente ocurrencia según intervalMinutes y offsetMinutes (epoch UTC).
 * - MONTHLY: devuelve el próximo día del mes a la hora indicada (en hora del servidor).
 * - WEEKLY_SLOTS: devuelve el próximo slot en los días y horas definidos (hora servidor).
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
    const offsetMs = (schedule.offsetMinutes ?? 0) * MINUTE_MS;
    const intervalMs = schedule.intervalMinutes * MINUTE_MS;
    const nowMs = userNow.getTime();

    // Ocurrencias: epoch + offset + k * interval (k = 0, 1, 2, ...)
    const elapsedSinceEpoch = nowMs - offsetMs;
    const k =
      elapsedSinceEpoch < 0
        ? 0
        : Math.ceil(elapsedSinceEpoch / intervalMs);

    const nextMs = offsetMs + k * intervalMs;
    return new Date(nextMs);
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
    const BOGOTA_OFFSET_MS = BOGOTA_UTC_OFFSET_HOURS * 60 * 60 * 1000;
    const bogotaNow = new Date(userNow.getTime() + BOGOTA_OFFSET_MS);
    const startY = bogotaNow.getUTCFullYear();
    const startM = bogotaNow.getUTCMonth();
    const startD = bogotaNow.getUTCDate();
    const candidates: number[] = [];

    for (let i = 0; i < 8; i++) {
      const d = new Date(Date.UTC(startY, startM, startD + i));
      const y = d.getUTCFullYear();
      const m = d.getUTCMonth();
      const day = d.getUTCDate();
      const midnightBogotaUtc = Date.UTC(y, m, day, BOGOTA_UTC_OFFSET_HOURS, 0, 0);
      const dayOfWeek = new Date(midnightBogotaUtc).getUTCDay();
      if (!schedule.daysOfWeek.includes(dayOfWeek)) continue;

      for (const slot of schedule.slotsMinutesFromMidnight) {
        const hours = Math.floor(slot / 60);
        const minutes = slot % 60;
        const utcMs = Date.UTC(y, m, day, hours + BOGOTA_UTC_OFFSET_HOURS, minutes, 0);
        candidates.push(utcMs);
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
