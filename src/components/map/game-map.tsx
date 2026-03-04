"use client";

import { useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, ImageOverlay, Marker, Tooltip, useMap } from "react-leaflet";
import type { GameEvent } from "@/types";
import type { MapConfig } from "@/types";
import { createPulsingMarkerIcon } from "./pulsing-marker";
import "leaflet/dist/leaflet.css";

/** En CRS.Simple, bounds son [[minY, minX], [maxY, maxX]] */
function toLatLngBounds(
  minY: number,
  minX: number,
  maxY: number,
  maxX: number
): L.LatLngBoundsExpression {
  return [
    [minY, minX] as L.LatLngTuple,
    [maxY, maxX] as L.LatLngTuple,
  ];
}

/** Precarga las 4 imágenes del grid y devuelve una promesa que se resuelve cuando todas cargaron (o fallaron). */
function preloadGridImages(urls: [string, string, string, string]): Promise<void> {
  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = url;
        })
    )
  ).then(() => {});
}

/** Renderiza ImageOverlay(s) solo cuando el mapa está visible y el overlayPane está listo (evita appendChild undefined). */
/** Para grid 2x2: precarga las 4 imágenes y solo muestra los overlays cuando todas están listas; durante zoom se ocultan y se muestran al terminar para evitar efecto de carga por esquinas. */
function ImageOverlaysWhenReady({
  source,
  h,
  w,
  isMapVisible,
}: {
  source: MapConfig["source"];
  h: number;
  w: number;
  isMapVisible: boolean;
}) {
  const map = useMap();
  const [mapReady, setMapReady] = useState(false);
  const [overlaysReady, setOverlaysReady] = useState(false);
  const [gridImagesLoaded, setGridImagesLoaded] = useState(false);
  const [isZooming, setIsZooming] = useState(false);

  useEffect(() => {
    const onZoomStart = () => setIsZooming(true);
    const onZoomEnd = () => setIsZooming(false);
    map.on("zoomstart", onZoomStart);
    map.on("zoomend", onZoomEnd);
    return () => {
      map.off("zoomstart", onZoomStart);
      map.off("zoomend", onZoomEnd);
    };
  }, [map]);

  useEffect(() => {
    if (!isMapVisible) {
      setMapReady(false);
      setOverlaysReady(false);
      setGridImagesLoaded(false);
      return;
    }
    let rafId2: number | null = null;
    let rafId3: number | null = null;
    let rafId4: number | null = null;
    const pane = map.getPane?.("overlayPane");
    const scheduleOverlaysReady = () => {
      rafId2 = requestAnimationFrame(() => {
        rafId3 = requestAnimationFrame(() => {
          rafId4 = requestAnimationFrame(() => {
            const paneAgain = map.getPane?.("overlayPane");
            const container = map.getContainer?.();
            if (paneAgain?.appendChild && container?.isConnected) setOverlaysReady(true);
          });
        });
      });
    };
    const cancelAll = () => {
      if (rafId2 != null) cancelAnimationFrame(rafId2);
      if (rafId3 != null) cancelAnimationFrame(rafId3);
      if (rafId4 != null) cancelAnimationFrame(rafId4);
    };
    if (pane && typeof pane.appendChild === "function") {
      setMapReady(true);
      scheduleOverlaysReady();
      return cancelAll;
    }
    const rafId = requestAnimationFrame(() => {
      setMapReady(true);
      scheduleOverlaysReady();
    });
    return () => {
      cancelAnimationFrame(rafId);
      cancelAll();
    };
  }, [map, isMapVisible]);

  useEffect(() => {
    if (!mapReady) setOverlaysReady(false);
  }, [mapReady]);

  useEffect(() => {
    if (source.type !== "grid") {
      setGridImagesLoaded(true);
      return;
    }
    setGridImagesLoaded(false);
    let cancelled = false;
    preloadGridImages(source.urls).then(() => {
      if (!cancelled) setGridImagesLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [source]);

  const paneAtRender = map?.getPane?.("overlayPane");
  const container = map?.getContainer?.();
  const paneSafe =
    paneAtRender != null &&
    typeof (paneAtRender as HTMLDivElement).appendChild === "function";
  const mapInDom = container?.isConnected === true;
  const safeToRender = Boolean(
    isMapVisible && mapReady && overlaysReady && paneSafe && mapInDom
  );

  if (!safeToRender) return null;

  if (source.type === "single") {
    return (
      <ImageOverlay url={source.url} bounds={toLatLngBounds(0, 0, h, w)} />
    );
  }

  if (!gridImagesLoaded || isZooming) return null;

  return (
    <>
      <ImageOverlay
        url={source.urls[0]}
        bounds={toLatLngBounds(h / 2, 0, h, w / 2)}
      />
      <ImageOverlay
        url={source.urls[1]}
        bounds={toLatLngBounds(h / 2, w / 2, h, w)}
      />
      <ImageOverlay
        url={source.urls[2]}
        bounds={toLatLngBounds(0, 0, h / 2, w / 2)}
      />
      <ImageOverlay
        url={source.urls[3]}
        bounds={toLatLngBounds(0, w / 2, h / 2, w)}
      />
    </>
  );
}

interface GameMapProps {
  mapConfig: MapConfig;
  events: GameEvent[];
  selectedEvent: GameEvent | null;
  onSelectEvent: (event: GameEvent) => void;
  /** Timestamp que al cambiar dispara flyTo al evento seleccionado (ej. botón "Ver ubicación") */
  zoomTrigger?: number;
  /** Timestamp que al cambiar ajusta la vista al mapa completo (zoom out) */
  fitBoundsTrigger?: number;
  /** Ancho del drawer derecho en px; si > 0, flyTo usa padding para centrado visual */
  drawerWidth?: number;
  /** Si el panel del mapa está visible (para invalidateSize al cambiar de pestaña en móvil) */
  isMapVisible?: boolean;
  /** En móvil permite más zoom out para ver todo el mapa en vertical */
  isMobile?: boolean;
}

/** Renderiza los Marker solo cuando el markerPane del mapa está listo (evita appendChild undefined). */
function MarkersWhenReady({
  events,
  selectedEvent,
  onSelectEvent,
  isMapVisible,
}: {
  events: GameEvent[];
  selectedEvent: GameEvent | null;
  onSelectEvent: (event: GameEvent) => void;
  isMapVisible: boolean;
}) {
  const map = useMap();
  const [markersReady, setMarkersReady] = useState(false);

  useEffect(() => {
    if (!isMapVisible) {
      setMarkersReady(false);
      return;
    }
    let raf1: number | null = null;
    let raf2: number | null = null;
    raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        const pane = map.getPane?.("markerPane");
        if (pane?.appendChild) setMarkersReady(true);
      });
    });
    return () => {
      if (raf1 != null) cancelAnimationFrame(raf1);
      if (raf2 != null) cancelAnimationFrame(raf2);
    };
  }, [map, isMapVisible]);

  if (!markersReady) return null;

  return (
    <>
      {events.map((event) => (
        <Marker
          key={event.id}
          position={[event.location.y, event.location.x]}
          icon={createPulsingMarkerIcon(selectedEvent?.id === event.id)}
          eventHandlers={{
            click: () => onSelectEvent(event),
          }}
        >
          <Tooltip direction="top" offset={[0, -8]} opacity={0.95} permanent={false}>
            {event.title}
          </Tooltip>
        </Marker>
      ))}
    </>
  );
}

/** Ajusta la vista al mapa completo cuando fitBoundsTrigger cambia (zoom out). */
function FitBoundsOnTrigger({
  height,
  width,
  fitBoundsTrigger,
}: {
  height: number;
  width: number;
  fitBoundsTrigger?: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (fitBoundsTrigger == null || fitBoundsTrigger === 0) return;
    const bounds = toLatLngBounds(0, 0, height, width);
    map.fitBounds(bounds, { animate: true, duration: 1.5 });
  }, [map, fitBoundsTrigger, height, width]);
  return null;
}

/** Al montar o al cambiar dimensiones del mapa, ajusta la vista al mapa completo (reset). */
function FitBoundsOnMount({
  height,
  width,
}: {
  height: number;
  width: number;
}) {
  const map = useMap();
  useEffect(() => {
    const bounds = toLatLngBounds(0, 0, height, width);
    map.fitBounds(bounds, { animate: false });
  }, [map, height, width]);
  return null;
}

/** Ejecuta flyTo al evento seleccionado cuando zoomTrigger cambia (zoom manual por botón). */
function FlyToOnTrigger({
  selectedEvent,
  zoomTrigger,
  drawerWidth = 0,
}: {
  selectedEvent: GameEvent | null;
  zoomTrigger?: number;
  drawerWidth?: number;
}) {
  const map = useMap();
  useEffect(() => {
    if (zoomTrigger == null || zoomTrigger === 0 || !selectedEvent) return;
    const { y, x } = selectedEvent.location;
    const options: L.ZoomPanOptions & { paddingBottomRight?: [number, number] } = {
      animate: true,
      duration: 1.5,
    };
    if (drawerWidth > 0) {
      options.paddingBottomRight = [0, drawerWidth];
    }
    map.flyTo([y, x], 2, options);
  }, [map, zoomTrigger, selectedEvent?.id, drawerWidth]);
  return null;
}

/** Invalida el tamaño del mapa cuando el panel del mapa pasa a ser visible (p. ej. cambio de pestaña en móvil). */
function InvalidateSizeOnVisible({ isMapVisible }: { isMapVisible: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!isMapVisible) return;
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);
    return () => clearTimeout(timer);
  }, [map, isMapVisible]);
  return null;
}

// #region agent log
/** Log de estado del mapa para diagnosticar appendChild (pane/container listos). */
function MapReadinessLogger({
  sourceType,
  url0,
  h,
  w,
  isMapVisible,
}: {
  sourceType: string;
  url0?: string;
  h: number;
  w: number;
  isMapVisible: boolean;
}) {
  const map = useMap();
  useEffect(() => {
    const overlayPane = map.getPane?.("overlayPane");
    const container = map.getContainer?.();
    fetch("http://127.0.0.1:7249/ingest/4c007677-e8fc-48c9-8882-2b2ea58c8b85", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: "game-map.tsx:MapReadinessLogger",
        message: "Map pane/container check",
        data: {
          hasOverlayPane: !!overlayPane,
          hasContainer: !!container,
          overlayPaneIsNode: overlayPane instanceof Node,
          sourceType,
          url0,
          h,
          w,
          isMapVisible,
        },
        timestamp: Date.now(),
        sessionId: "debug-session",
        hypothesisId: "H1",
      }),
    }).catch(() => {});
  }, [map, sourceType, url0, h, w, isMapVisible]);
  return null;
}
// #endregion

export function GameMap({
  mapConfig,
  events,
  selectedEvent,
  onSelectEvent,
  zoomTrigger,
  fitBoundsTrigger,
  drawerWidth = 0,
  isMapVisible = true,
  isMobile = false,
}: GameMapProps) {
  const { width: w, height: h, source } = mapConfig;

  const bounds = toLatLngBounds(0, 0, h, w);
  const minZoom = isMobile ? -2 : -1;
  const maxZoom = 2;

  return (
    <MapContainer
      crs={L.CRS.Simple}
      bounds={bounds}
      boundsOptions={{ padding: [0, 0] }}
      minZoom={minZoom}
      maxZoom={maxZoom}
      scrollWheelZoom={false}
      attributionControl={false}
      className="h-full w-full"
      style={{ background: "#0f1116" }}
    >
      <ImageOverlaysWhenReady source={source} h={h} w={w} isMapVisible={isMapVisible} />

      <MarkersWhenReady
        events={events}
        selectedEvent={selectedEvent}
        onSelectEvent={onSelectEvent}
        isMapVisible={isMapVisible}
      />

      <FitBoundsOnMount height={h} width={w} />
      <MapReadinessLogger
        sourceType={source.type}
        url0={source.type === "grid" ? source.urls[0] : undefined}
        h={h}
        w={w}
        isMapVisible={isMapVisible}
      />
      <InvalidateSizeOnVisible isMapVisible={isMapVisible} />
      <FlyToOnTrigger
        selectedEvent={selectedEvent}
        zoomTrigger={zoomTrigger}
        drawerWidth={drawerWidth}
      />
      <FitBoundsOnTrigger height={h} width={w} fitBoundsTrigger={fitBoundsTrigger} />
    </MapContainer>
  );
}
