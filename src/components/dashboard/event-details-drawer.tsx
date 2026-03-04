"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Locate, ChevronLeft, ChevronRight, DoorOpen, MapPin } from "lucide-react";
import type { GameEvent } from "@/types";
import { getMapName } from "@/data/maps-registry";
import { getEventTypeLabel } from "@/lib/event-type-labels";
import { clsx } from "clsx";

const DRAWER_WIDTH_PX = 380;

export const EVENT_DETAILS_DRAWER_WIDTH = 400;

interface EventDetailsDrawerProps {
  event: GameEvent | null;
  onClose: () => void;
  /** Si true, el drawer no usa fixed y rellena el contenedor (layout de 3 columnas) */
  isStatic?: boolean;
  /** En móvil: al pulsar "Ver ubicación" se hace flyTo y se cambia a vista MAP */
  onGoToMap?: () => void;
  /** Al pulsar "Ver por donde ingresar" o "Ver a donde llegar", navega al evento enlazado (cambia mapa, selecciona evento y hace flyTo) */
  onNavigateToLinkedEvent?: (eventId: string) => void;
  /** Al pulsar un mapa en "Posibles mapas", cambia a ese mapa y selecciona el evento (eventId) */
  onNavigateToMap?: (mapId: string, eventId: string) => void;
  /** Si true, se renderiza como bottom sheet (redondeado arriba, altura limitada) */
  variant?: "default" | "bottomSheet";
}

/**
 * Cajón lateral derecho con detalles del evento seleccionado.
 * Glassmorphism; con isStatic rellena el contenedor, si no es fixed con animación.
 */
export function EventDetailsDrawer({
  event,
  onClose,
  isStatic,
  onGoToMap,
  onNavigateToLinkedEvent,
  onNavigateToMap,
  variant = "default",
}: EventDetailsDrawerProps) {
  const [mounted, setMounted] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  useEffect(() => {
    if (isStatic) return;
    const t = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(t);
  }, [isStatic]);

  useEffect(() => {
    setImageIndex(0);
  }, [event?.id]);

  if (event == null) return null;

  const isBottomSheet = variant === "bottomSheet";
  const images = event.images ?? [];

  return (
    <>
    <div
      className={clsx(
        "flex flex-col bg-surface/95 backdrop-blur-md",
        isBottomSheet
          ? "fixed inset-x-0 bottom-16 z-30 flex max-h-[50vh] min-h-0 flex-col rounded-t-xl border-t border-white/10 shadow-2xl"
          : clsx(
              "h-full",
              isStatic
                ? "w-full"
                : clsx(
                    "fixed top-0 right-0 z-30 w-[380px] border-l border-white/10 shadow-2xl transition-transform duration-300 ease-out",
                    mounted ? "translate-x-0" : "translate-x-full"
                  )
            )
      )}
      aria-label="Detalles del evento"
      role="dialog"
    >
      {/* Header */}
      <div className="flex shrink-0 items-start justify-between gap-2 border-b border-surface p-4">
        <div className="min-w-0 flex-1">
          <span
            className={clsx(
              "inline-block rounded border px-2 py-0.5 text-xs font-bold uppercase tracking-wider",
              event.type === "MAIN" && "border-primary/50 bg-primary/20 text-primary",
              event.type === "DAILY" && "border-primary-light/30 bg-primary-light/10 text-primary-light",
              event.type === "SECONDARY" && "border-muted/40 bg-muted/20 text-muted"
            )}
          >
            {getEventTypeLabel(event.type)}
          </span>
          <h2 className="mt-2 text-3xl font-black leading-tight text-white mb-2">
            {event.title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded p-1.5 text-muted transition-colors hover:bg-surface hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          aria-label="Cerrar detalles"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>
      </div>

      {/* Contenido con scroll */}
      <div className="flex-1 overflow-y-auto p-4">
        {event.description && (
          <section>
            <h3 className="mb-3 mt-6 border-b border-white/5 pb-2 text-xs font-bold uppercase tracking-widest text-muted first:mt-0">
              Descripción
            </h3>
            <div className="space-y-3">
              {event.description
                .split(/\n\s*\n/)
                .filter((block) => block.trim())
                .map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-sm leading-relaxed text-foreground"
                  >
                    {paragraph.trim()}
                  </p>
                ))}
            </div>
          </section>
        )}

        {event.notes && (
          <section>
            <h3 className="mb-3 mt-6 border-b border-white/5 pb-2 text-xs font-bold uppercase tracking-widest text-muted">
              Notas
            </h3>
            <div className="rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
              <ul className="list-inside list-disc space-y-1 text-sm text-foreground">
                {event.notes
                  .split("\n")
                  .map((line) => line.replace(/^\s*-\s*/, "").trim())
                  .filter((line) => line.length > 0)
                  .map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
              </ul>
            </div>
          </section>
        )}

        {event.images && event.images.length > 0 && (
          <section>
            <h3 className="mb-3 mt-6 border-b border-white/5 pb-2 text-xs font-bold uppercase tracking-widest text-muted">
              Imágenes
            </h3>
            <div className="overflow-hidden rounded-lg border border-white/10 bg-black/20">
              <div
                className="relative flex cursor-pointer items-center justify-center"
                role="button"
                tabIndex={0}
                onClick={() => setImageModalOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setImageModalOpen(true);
                  }
                }}
                aria-label="Abrir imagen en pantalla completa"
              >
                <img
                  src={event.images[imageIndex]}
                  alt={`Imagen ${imageIndex + 1} de ${event.title}`}
                  className="max-h-[40vh] w-full max-w-full object-contain"
                  draggable={false}
                />
                {event.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageIndex((i) =>
                          i <= 0 ? event.images!.length - 1 : i - 1
                        );
                      }}
                      className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label="Imagen anterior"
                    >
                      <ChevronLeft className="h-5 w-5" aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageIndex((i) =>
                          i >= event.images!.length - 1 ? 0 : i + 1
                        );
                      }}
                      className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-1.5 text-white transition-colors hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label="Imagen siguiente"
                    >
                      <ChevronRight className="h-5 w-5" aria-hidden />
                    </button>
                  </>
                )}
              </div>
              {event.images.length > 1 && (
                <p className="border-t border-white/10 px-2 py-1.5 text-center text-xs text-muted">
                  {imageIndex + 1} / {event.images.length}
                </p>
              )}
            </div>
          </section>
        )}

        <section>
          <h3 className="mb-3 mt-6 border-b border-white/5 pb-2 text-xs font-bold uppercase tracking-widest text-muted">
            Ubicación
          </h3>
          <p className="text-sm text-foreground">
            Mapa: <span className="text-muted">{getMapName(event.mapId)}</span>
          </p>
          {event.gameCoordinates != null && event.gameCoordinates !== "" && (
            <>
              <p className="mt-2 text-xs text-muted">
                Coordenadas en el juego:
              </p>
              <p className="mt-1">
                <span className="inline-block rounded bg-black/20 px-2 py-1 font-mono text-sm text-foreground/90">
                  {event.gameCoordinates}
                </span>
              </p>
            </>
          )}
          {(event.entryEventId || event.destinationEventId) && onNavigateToLinkedEvent && (
            <div className="mt-3 flex flex-col gap-2">
              {event.entryEventId && (
                <button
                  type="button"
                  onClick={() => onNavigateToLinkedEvent(event.entryEventId!)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary/50 bg-primary/10 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                  aria-label="Ver por donde ingresar"
                >
                  <DoorOpen className="h-4 w-4 shrink-0" aria-hidden />
                  Ver por donde ingresar
                </button>
              )}
              {event.destinationEventId && (
                <button
                  type="button"
                  onClick={() => onNavigateToLinkedEvent(event.destinationEventId!)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-primary/50 bg-primary/10 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                  aria-label="Ver a donde llegar"
                >
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                  Ver a donde llegar
                </button>
              )}
            </div>
          )}
          {event.possibleMaps && event.possibleMaps.length > 0 && onNavigateToMap && (
            <div className="mt-3">
              <p className="mb-2 text-xs font-medium text-muted">Posibles mapas</p>
              <div className="flex flex-wrap gap-2">
                {event.possibleMaps.map(({ mapId, label, eventId }) => (
                  <button
                    key={mapId}
                    type="button"
                    onClick={() => onNavigateToMap(mapId, eventId)}
                    className="rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary/20 hover:border-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                    aria-label={`Ir al mapa ${label}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}
          {onGoToMap && (
            <button
              type="button"
              onClick={onGoToMap}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-primary/50 bg-primary/10 px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              aria-label="Ver ubicación en el mapa"
            >
              <Locate className="h-4 w-4 shrink-0" aria-hidden />
              Ver ubicación
            </button>
          )}
        </section>
      </div>
    </div>

      {imageModalOpen && images.length > 0 && typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Vista de imagen"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setImageModalOpen(false)}
          >
            <div
              className="relative flex h-full w-full items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                className="absolute right-4 top-4 z-10 rounded-full bg-black/80 p-2 text-white transition-colors hover:bg-black focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label="Cerrar"
              >
                <X className="h-6 w-6" aria-hidden />
              </button>
              <img
                src={images[imageIndex]}
                alt={`Imagen ${imageIndex + 1} de ${event.title}`}
                className="max-h-full max-w-full object-contain"
                draggable={false}
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setImageIndex((i) =>
                        i <= 0 ? images.length - 1 : i - 1
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft className="h-8 w-8" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setImageIndex((i) =>
                        i >= images.length - 1 ? 0 : i + 1
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white transition-colors hover:bg-black/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    aria-label="Imagen siguiente"
                  >
                    <ChevronRight className="h-8 w-8" aria-hidden />
                  </button>
                  <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded bg-black/60 px-3 py-1.5 text-sm text-white">
                    {imageIndex + 1} / {images.length}
                  </span>
                </>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
