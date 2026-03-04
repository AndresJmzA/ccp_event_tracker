"use client";

import { Map, Info, List } from "lucide-react";

export type MobileView = "MAP" | "DETAILS" | "LIST";

interface BottomNavProps {
  currentView: MobileView;
  onViewChange: (view: MobileView) => void;
  /** Si true, se muestra un punto rojo en el botón Info (evento seleccionado) */
  hasSelectedEvent: boolean;
}

/**
 * Barra de navegación inferior para móvil: Mapa, Detalles, Lista.
 * Solo visible en viewports móviles (md:hidden en el padre).
 */
export function BottomNav({
  currentView,
  onViewChange,
  hasSelectedEvent,
}: BottomNavProps) {
  const tabs: { view: MobileView; label: string; icon: React.ReactNode }[] = [
    { view: "MAP", label: "Mapa", icon: <Map className="h-6 w-6" aria-hidden /> },
    {
      view: "DETAILS",
      label: "Info",
      icon: <Info className="h-6 w-6" aria-hidden /> },
    { view: "LIST", label: "Misiones", icon: <List className="h-6 w-6" aria-hidden /> },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-white/10 bg-surface md:hidden"
      aria-label="Navegación principal"
    >
      {tabs.map(({ view, label, icon }) => {
        const isActive = currentView === view;
        const showDot = view === "DETAILS" && hasSelectedEvent;
        return (
          <button
            key={view}
            type="button"
            onClick={() => onViewChange(view)}
            className={`relative flex flex-col items-center justify-center gap-0.5 px-6 py-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${
              isActive ? "text-primary" : "text-muted hover:text-foreground"
            }`}
            aria-current={isActive ? "page" : undefined}
            aria-label={label}
          >
            <span className="relative inline-flex">
              {icon}
              {showDot && (
                <span
                  className="absolute -right-1.5 -top-1 h-2 w-2 rounded-full bg-primary"
                  aria-hidden
                />
              )}
            </span>
            <span className="text-xs font-medium">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
