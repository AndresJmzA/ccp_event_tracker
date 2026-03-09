"use client";

import { useRef, useState, useEffect } from "react";
import { format } from "date-fns";
import { ChevronDown } from "lucide-react";
import { getMapList, getMapName } from "@/data/maps-registry";
import { SERVER_TIMEZONE } from "@/lib/time-utils";

interface HudHeaderProps {
  /** Fecha/hora actual (se actualiza cada segundo desde el padre) */
  now: Date;
  /** mapId del mapa actual (para el selector) */
  activeMapId: string;
  /** Llamado al elegir otro mapa en el dropdown */
  onMapChange: (mapId: string) => void;
  /** Si true, el header no es fixed y ocupa espacio en el flujo (layout de 3 columnas) */
  isStatic?: boolean;
}

/**
 * Barra superior: selector de zona (atlas), relojes LOC/SVR.
 * Dropdown con estilo HUD (fondo oscuro, borde sutil).
 */
export function HudHeader({ now, activeMapId, onMapChange, isStatic }: HudHeaderProps) {
  const localTime = format(now, "HH:mm:ss");
  const serverTime = now.toLocaleTimeString("es-ES", {
    timeZone: SERVER_TIMEZONE,
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const mapList = getMapList();
  const currentMapName = getMapName(activeMapId);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  return (
    <header
      className={`flex w-full max-w-full flex-wrap items-center justify-between gap-2 overflow-visible px-2 py-3 font-mono text-sm text-foreground/90 md:gap-4 md:px-4 ${isStatic ? "relative z-[1000] shrink-0" : "fixed left-0 right-0 top-0 z-50"}`}
      aria-label="Zona actual, reloj local y servidor"
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 md:gap-3">
        <span className="shrink-0 text-muted text-xs md:text-sm">ZONA:</span>
        <div className="relative min-w-0 flex-1 md:flex-initial" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex w-full min-w-0 items-center gap-1 rounded-md border border-surface bg-surface/95 px-2 py-1.5 text-left text-foreground transition-colors hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background md:gap-1.5 md:px-3"
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
            aria-label={`Zona actual: ${currentMapName}. Cambiar zona`}
          >
            <span className="truncate text-xs md:text-sm">{currentMapName}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 shrink-0 md:h-4 md:w-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              aria-hidden
            />
          </button>
          {dropdownOpen && (
            <ul
              className="absolute left-0 top-full z-[100] mt-1 min-w-[10rem] rounded-md border border-surface bg-surface py-1 shadow-xl"
              role="listbox"
            >
              {mapList.map(({ id, name }) => (
                <li key={id} role="option" aria-selected={id === activeMapId}>
                  <button
                    type="button"
                    onClick={() => {
                      onMapChange(id);
                      setDropdownOpen(false);
                    }}
                    className={`block w-full px-3 py-2 text-left text-sm transition-colors hover:bg-primary/20 hover:text-foreground ${
                      id === activeMapId ? "bg-primary/10 text-primary-light" : "text-foreground/90"
                    }`}
                  >
                    {name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        <div className="rounded-md border border-white/10 bg-black/40 px-2 py-1.5 md:px-4 md:py-2">
          <span className="mb-0.5 block text-[9px] font-bold uppercase tracking-widest text-primary md:text-[10px]">
            Hora local
          </span>
          <span className="font-mono text-sm font-bold tracking-tight tabular-nums text-foreground md:text-xl" suppressHydrationWarning>
            {localTime}
          </span>
        </div>
        <div className="hidden rounded-md border border-white/10 bg-black/40 px-4 py-2 md:block">
          <span className="mb-0.5 block text-[10px] font-bold uppercase tracking-widest text-primary">
            Hora servidor
          </span>
          <span className="font-mono text-xl font-bold tracking-tight tabular-nums text-foreground" suppressHydrationWarning>
            {serverTime}
          </span>
        </div>
      </div>
    </header>
  );
}
