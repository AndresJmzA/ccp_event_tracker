"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Locate, Minimize2, MapPin } from "lucide-react";
import type { GameEvent } from "@/types";
import { getNextOccurrence, formatCountdown } from "@/lib/time-utils";
import { getNextDailyEvent } from "@/lib/event-utils";
import { EventCard } from "./event-card";
import { SearchBar } from "./search-bar";

interface SidebarProps {
  events: GameEvent[];
  /** Evento seleccionado (o displayEvent: seleccionado ?? próximo principal) para zoom y "en otra zona" */
  selectedEvent: GameEvent | null;
  /** Próximo evento principal: siempre se muestra su countdown y título en "Próximo evento principal" */
  nextMainEvent: GameEvent | null;
  onSelectEvent: (event: GameEvent) => void;
  /** Fecha/hora actual para countdown y orden */
  now: Date;
  /** mapId del mapa actual (para filtro "solo locales") */
  activeMapId: string;
  /** Llamado al pulsar el botón de enfocar (zoom al evento en el mapa) */
  onZoomRequest: () => void;
  /** Llamado al pulsar el botón para ver el mapa completo (zoom out) */
  onFitBoundsRequest: () => void;
  /** Si true, el panel no usa estilos flotantes (layout de 3 columnas) */
  isStatic?: boolean;
}

/** Agrupa por listGroupKey: muestra solo un evento por grupo (preferido el del mapa activo). Mantiene orden. */
function collapseByListGroup(events: GameEvent[], activeMapId: string): GameEvent[] {
  const result: GameEvent[] = [];
  const addedGroups = new Set<string>();
  for (const e of events) {
    if (!e.listGroupKey) {
      result.push(e);
      continue;
    }
    if (addedGroups.has(e.listGroupKey)) continue;
    addedGroups.add(e.listGroupKey);
    const group = events.filter((x) => x.listGroupKey === e.listGroupKey);
    const preferred = group.find((x) => x.mapId === activeMapId) ?? group[0]!;
    result.push(preferred);
  }
  return result;
}

/**
 * Panel lateral: countdown, controles de mapa, toggle de filtro y lista de eventos.
 * Si "Solo eventos locales" está activo, solo se muestran eventos del mapa actual.
 * Eventos con el mismo listGroupKey se muestran una sola vez (el del mapa activo o el primero).
 */
export function Sidebar({
  events,
  selectedEvent,
  nextMainEvent,
  onSelectEvent,
  now,
  activeMapId,
  onZoomRequest,
  onFitBoundsRequest,
  isStatic,
}: SidebarProps) {
  const [onlyLocal, setOnlyLocal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const listRef = useRef<HTMLUListElement>(null);

  const collapsedEvents = useMemo(
    () => collapseByListGroup(events, activeMapId),
    [events, activeMapId]
  );

  const displayedEvents = useMemo(() => {
    if (!onlyLocal) return collapsedEvents;
    return collapsedEvents.filter((e) => e.mapId === activeMapId);
  }, [collapsedEvents, onlyLocal, activeMapId]);

  const filteredEvents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return displayedEvents;
    return displayedEvents.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.description ?? "").toLowerCase().includes(q)
    );
  }, [displayedEvents, searchQuery]);

  useEffect(() => {
    if (searchQuery && listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [searchQuery]);

  const selectedIsInOtherZone =
    selectedEvent != null && selectedEvent.mapId !== activeMapId;

  const nextMainOccurrence = nextMainEvent?.schedule
    ? getNextOccurrence(nextMainEvent, now)
    : null;
  const countdownMainLabel =
    nextMainEvent == null
      ? "—"
      : !nextMainEvent.schedule
        ? "Sin horario"
        : formatCountdown(now, nextMainOccurrence!);

  const nextDailyEvent = useMemo(() => getNextDailyEvent(events, now), [events, now]);
  const nextDailyOccurrence = nextDailyEvent?.schedule
    ? getNextOccurrence(nextDailyEvent, now)
    : null;
  const countdownDaily =
    nextDailyEvent && nextDailyOccurrence
      ? formatCountdown(now, nextDailyOccurrence)
      : null;

  return (
    <aside
      className={`flex h-full w-full flex-col p-4 backdrop-blur-md ${isStatic ? "bg-surface/95" : "max-w-sm rounded-xl border border-surface bg-surface/90 shadow-xl"}`}
      aria-label="Panel de eventos"
    >
      <div className="mb-4 shrink-0">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Próximo evento principal
        </p>
        <p
          className="font-mono text-5xl font-black tabular-nums text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70"
          aria-live="polite"
          suppressHydrationWarning
        >
          {countdownMainLabel}
        </p>
        {nextMainEvent && (
          <p className="mt-2 truncate text-lg font-medium text-white/90">
            {nextMainEvent.title}
          </p>
        )}
        {selectedIsInOtherZone && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-muted" role="status">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            El evento seleccionado está en otra zona
          </p>
        )}
        <div className="mt-2 flex gap-2">
          {(selectedEvent ?? nextMainEvent) && (
            <button
              type="button"
              onClick={onZoomRequest}
              title="Ver ubicación"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-primary/50 bg-primary/10 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              aria-label="Ver ubicación"
            >
              <Locate className="h-4 w-4 shrink-0" aria-hidden />
              Ver ubicación
            </button>
          )}
          <button
            type="button"
            onClick={onFitBoundsRequest}
            title="Ver mapa completo"
            className="flex items-center justify-center gap-2 rounded-lg border border-surface bg-surface px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            aria-label="Ver mapa completo"
          >
            <Minimize2 className="h-4 w-4 shrink-0" aria-hidden />
            Ver mapa completo
          </button>
        </div>

        {nextDailyEvent && countdownDaily != null && (
          <div className="mt-3 border-t border-white/10 pt-3">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-muted">
              Próximo evento diario
            </p>
            <p className="flex items-baseline justify-between gap-2">
              <span className="truncate text-sm font-medium text-white/90">
                {nextDailyEvent.title}
              </span>
              <span className="shrink-0 font-mono text-sm tabular-nums text-muted" suppressHydrationWarning>
                {countdownDaily}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Toggle: Solo eventos locales */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted">Solo eventos locales</span>
        <button
          type="button"
          role="switch"
          aria-checked={onlyLocal}
          onClick={() => setOnlyLocal((v) => !v)}
          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
            onlyLocal ? "border-primary bg-primary" : "border-surface bg-surface"
          }`}
          aria-label={onlyLocal ? "Mostrar solo eventos de esta zona" : "Mostrar todos los eventos"}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 translate-y-0.5 rounded-full bg-foreground shadow transition-transform ${
              onlyLocal ? "translate-x-6" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="mb-2 flex items-center gap-2">
          <p className="shrink-0 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Eventos
          </p>
        </div>
        <div className="mb-3 shrink-0">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
        {filteredEvents.length === 0 ? (
          <div
            className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-surface bg-surface/50 px-4 py-8 text-center"
            role="status"
          >
            <MapPin className="mb-2 h-10 w-10 text-muted" aria-hidden />
            <p className="text-sm font-medium text-foreground">
              {searchQuery.trim()
                ? "No se encontraron misiones"
                : "No hay eventos activos en esta zona"}
            </p>
            <p className="mt-1 text-xs text-muted">
              {searchQuery.trim()
                ? "Prueba con otras palabras o limpia el buscador."
                : onlyLocal
                  ? "Desactiva el filtro para ver todos los eventos."
                  : "No hay eventos programados en este mapa."}
            </p>
          </div>
        ) : (
          <ul
            ref={listRef}
            className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1"
          >
            {filteredEvents.map((event) => {
              const nextLabel = event.schedule
                ? formatCountdown(now, getNextOccurrence(event, now))
                : "Sin horario";
              return (
                <li key={event.id}>
                  <EventCard
                    event={event}
                    isSelected={
                      selectedEvent?.id === event.id ||
                      (selectedEvent?.listGroupKey != null &&
                        selectedEvent.listGroupKey === event.listGroupKey)
                    }
                    onSelect={onSelectEvent}
                    nextOccurrenceLabel={nextLabel}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
