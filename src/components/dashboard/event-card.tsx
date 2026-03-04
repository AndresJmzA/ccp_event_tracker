"use client";

import { Clock } from "lucide-react";
import type { GameEvent } from "@/types";
import { getEventTypeLabel } from "@/lib/event-type-labels";
import { clsx } from "clsx";

interface EventCardProps {
  event: GameEvent;
  isSelected: boolean;
  onSelect: (event: GameEvent) => void;
  /** Etiqueta de próxima ocurrencia (ej. countdown "1:23:45") */
  nextOccurrenceLabel?: string;
}

/** Estilos del badge por tipo de evento */
const typeBadgeClass: Record<GameEvent["type"], string> = {
  MAIN: "bg-primary text-white",
  DAILY: "bg-primary-light/20 text-primary-light",
  SECONDARY: "bg-muted/30 text-muted",
};

/**
 * Tarjeta de un evento en la lista del sidebar.
 * Muestra tipo traducido (Principal/Diario/Secundario) y estado activo.
 */
export function EventCard({ event, isSelected, onSelect, nextOccurrenceLabel }: EventCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(event)}
      className={clsx(
        "w-full rounded-lg border px-3 py-2.5 text-left transition-colors",
        "border-surface bg-surface/80 hover:bg-surface",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isSelected && "border-primary bg-surface ring-1 ring-primary/30",
      )}
      aria-pressed={isSelected}
      aria-label={`Seleccionar evento: ${event.title}`}
    >
      <div className="flex items-center gap-2">
        <span
          className={clsx(
            "rounded px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wider",
            typeBadgeClass[event.type],
          )}
        >
          {getEventTypeLabel(event.type)}
        </span>
        <span className="truncate text-sm font-bold text-white">
          {event.title}
        </span>
      </div>
      {(nextOccurrenceLabel != null && nextOccurrenceLabel !== "") && (
        <p className="mt-1 flex items-center gap-1.5 font-mono text-xs text-primary-light">
          <Clock className="h-3 w-3 shrink-0" aria-hidden />
          {nextOccurrenceLabel}
        </p>
      )}
      {event.description && (
        <p className="mt-1 line-clamp-2 text-xs text-muted">
          {event.description}
        </p>
      )}
    </button>
  );
}
