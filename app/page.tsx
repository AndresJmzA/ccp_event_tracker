"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EVENTS } from "@/data/events";
import { getMapConfig, DEFAULT_MAP_ID } from "@/data/maps-registry";
import { HudHeader } from "@/components/layout/hud-header";
import { BottomNav, type MobileView } from "@/components/layout/bottom-nav";
import { Sidebar } from "@/components/dashboard/sidebar";
import {
  EventDetailsDrawer,
  EVENT_DETAILS_DRAWER_WIDTH,
} from "@/components/dashboard/event-details-drawer";
import { useNow } from "@/hooks/use-now";
import { useMediaQuery } from "@/hooks/use-media-query";
import { getNextOccurrence } from "@/lib/time-utils";
import { getNextMainEvent } from "@/lib/event-utils";
import type { GameEvent } from "@/types";

const GameMap = dynamic(
  () =>
    import("@/components/map/game-map").then((m) => m.GameMap),
  { ssr: false }
);

export default function Home() {
  const now = useNow();
  const isMd = useMediaQuery("(min-width: 768px)");
  const [selectedEvent, setSelectedEvent] = useState<GameEvent | null>(null);
  const [mobileView, setMobileView] = useState<MobileView>("LIST");
  const [activeMapId, setActiveMapId] = useState<string>(DEFAULT_MAP_ID);
  const [zoomTrigger, setZoomTrigger] = useState(0);
  const [fitBoundsTrigger, setFitBoundsTrigger] = useState(0);

  const isMapVisible = isMd || mobileView === "MAP";
  const isMobile = !isMd;

  const sortedEvents = useMemo(() => {
    return [...EVENTS].sort((a, b) => {
      const nextA = getNextOccurrence(a, now).getTime();
      const nextB = getNextOccurrence(b, now).getTime();
      return nextA - nextB;
    });
  }, [now]);

  const nextMain = useMemo(
    () => getNextMainEvent(sortedEvents, now),
    [sortedEvents, now]
  );
  const displayEvent = selectedEvent ?? nextMain;

  const hasSyncedInitialMap = useRef(false);
  useEffect(() => {
    if (hasSyncedInitialMap.current || !displayEvent) return;
    hasSyncedInitialMap.current = true;
    setActiveMapId(displayEvent.mapId);
  }, [displayEvent]);

  const handleSelectEvent = useCallback((event: GameEvent) => {
    setSelectedEvent(event);
    setActiveMapId((prev) => (event.mapId !== prev ? event.mapId : prev));
    setMobileView("MAP");
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedEvent(null);
    setMobileView("LIST");
  }, []);

  const handleGoToMap = useCallback(() => {
    setZoomTrigger(Date.now());
    setMobileView("MAP");
  }, []);

  const handleNavigateToLinkedEvent = useCallback((eventId: string) => {
    const linked = EVENTS.find((e) => e.id === eventId);
    if (!linked) return;
    setSelectedEvent(linked);
    setActiveMapId(linked.mapId);
    setZoomTrigger(Date.now());
    if (isMobile) setMobileView("MAP");
  }, [isMobile]);

  const handleNavigateToMap = useCallback((mapId: string, eventId: string) => {
    const linked = EVENTS.find((e) => e.id === eventId);
    if (!linked) return;
    setSelectedEvent(linked);
    setActiveMapId(mapId);
    setZoomTrigger(Date.now());
    setMobileView("MAP");
  }, []);

  const activeMapConfig = useMemo(
    () => getMapConfig(activeMapId),
    [activeMapId]
  );
  const eventsOnActiveMap = useMemo(
    () => sortedEvents.filter((e) => e.mapId === activeMapId),
    [sortedEvents, activeMapId]
  );
  const selectedOnThisMap =
    displayEvent?.mapId === activeMapId ? displayEvent : null;

  const showDrawer = isMd
    ? displayEvent != null
    : selectedEvent != null && mobileView === "DETAILS";

  return (
    <main className="flex h-screen w-screen flex-col overflow-hidden bg-background pb-16 md:pb-0">
      {/* Área de contenido: en móvil altura = viewport menos barra inferior (64px) para evitar doble scroll */}
      <div className="relative flex h-[calc(100vh-4rem)] min-h-0 flex-1 overflow-hidden md:h-full">
        {/* COLUMNA 1: Mapa — móvil: solo montar cuando mobileView === 'MAP' para evitar appendChild en pane oculto; desktop: siempre */}
        <div
          className={`relative flex min-w-0 flex-1 flex-col h-full ${
            mobileView === "MAP" ? "flex" : "hidden"
          } md:flex`}
        >
          {(isMd || mobileView === "MAP") && (
            <>
              <HudHeader
                now={now}
                activeMapId={activeMapId}
                onMapChange={setActiveMapId}
                isStatic
              />
              <div
                className="relative flex-1 min-h-0"
                style={{ background: "#0f1116" }}
              >
                <div key={activeMapId} className="h-full w-full">
                  <GameMap
                    mapConfig={activeMapConfig}
                    events={eventsOnActiveMap}
                    selectedEvent={selectedOnThisMap}
                    onSelectEvent={handleSelectEvent}
                    zoomTrigger={zoomTrigger}
                    fitBoundsTrigger={fitBoundsTrigger}
                    drawerWidth={showDrawer ? EVENT_DETAILS_DRAWER_WIDTH : 0}
                    isMapVisible={isMapVisible}
                    isMobile={isMobile}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* COLUMNA 2: Panel de detalles — desktop: si hay displayEvent; móvil: solo en pestaña INFO (DETAILS) con evento seleccionado */}
        {showDrawer && (
          <div className="flex h-full w-full flex-col border-l border-white/10 bg-surface/95 shadow-2xl backdrop-blur z-20 shrink-0 md:w-[400px]">
            <EventDetailsDrawer
              event={displayEvent!}
              now={now}
              onClose={handleCloseDetails}
              onGoToMap={handleGoToMap}
              onNavigateToLinkedEvent={handleNavigateToLinkedEvent}
              onNavigateToMap={handleNavigateToMap}
              isStatic
            />
          </div>
        )}

        {/* COLUMNA 3: Lista — móvil: solo si mobileView === 'LIST'; desktop: siempre */}
        <div
          className={`flex h-full w-full shrink-0 flex-col border-l border-white/10 bg-surface z-10 md:w-[350px] ${
            mobileView === "LIST" ? "flex" : "hidden"
          } md:flex`}
        >
          <Sidebar
            events={sortedEvents}
            selectedEvent={displayEvent}
            nextMainEvent={nextMain}
            onSelectEvent={handleSelectEvent}
            now={now}
            activeMapId={activeMapId}
          onZoomRequest={() => {
            setZoomTrigger(Date.now());
            setMobileView("MAP");
          }}
          onFitBoundsRequest={() => {
            setFitBoundsTrigger(Date.now());
            setMobileView("MAP");
          }}
            isStatic
          />
        </div>
      </div>

      <BottomNav
        currentView={mobileView}
        onViewChange={setMobileView}
        hasSelectedEvent={selectedEvent != null}
      />
    </main>
  );
}
