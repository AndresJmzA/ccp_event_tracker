import type { GameEvent } from "@/types";
import { getNextOccurrence } from "@/lib/time-utils";

/**
 * Obtiene el próximo evento de tipo MAIN con horario: el que tenga la ocurrencia futura más cercana a `now`.
 * Solo se consideran eventos MAIN que tengan schedule. Si no hay MAIN futuros, devuelve el último pasado o null.
 */
export function getNextMainEvent(
  events: GameEvent[],
  now: Date
): GameEvent | null {
  const mainEvents = events.filter((e) => e.type === "MAIN" && e.schedule);
  if (mainEvents.length === 0) return null;

  const nowMs = now.getTime();
  const withNext = mainEvents.map((event) => ({
    event,
    nextAt: getNextOccurrence(event, now).getTime(),
  }));

  const future = withNext.filter((x) => x.nextAt >= nowMs);
  if (future.length > 0) {
    future.sort((a, b) => a.nextAt - b.nextAt);
    return future[0]!.event;
  }

  const past = withNext.sort((a, b) => b.nextAt - a.nextAt);
  return past[0]!.event;
}

/**
 * Obtiene el próximo evento de tipo DAILY con horario: el que tenga la ocurrencia futura más cercana a `now`.
 * Solo se consideran eventos DAILY que tengan schedule. Si no hay DAILY futuros, devuelve el último pasado o null.
 */
export function getNextDailyEvent(
  events: GameEvent[],
  now: Date
): GameEvent | null {
  const dailyEvents = events.filter((e) => e.type === "DAILY" && e.schedule);
  if (dailyEvents.length === 0) return null;

  const nowMs = now.getTime();
  const withNext = dailyEvents.map((event) => ({
    event,
    nextAt: getNextOccurrence(event, now).getTime(),
  }));

  const future = withNext.filter((x) => x.nextAt >= nowMs);
  if (future.length > 0) {
    future.sort((a, b) => a.nextAt - b.nextAt);
    return future[0]!.event;
  }

  const past = withNext.sort((a, b) => b.nextAt - a.nextAt);
  return past[0]!.event;
}
