import type { GameEventType } from "@/types";

/** Etiquetas en español para mostrar el tipo de evento en la web */
export const EVENT_TYPE_LABELS: Record<GameEventType, string> = {
  MAIN: "Principal",
  DAILY: "Diario",
  SECONDARY: "Secundario",
};

export function getEventTypeLabel(type: GameEventType): string {
  return EVENT_TYPE_LABELS[type] ?? type;
}
