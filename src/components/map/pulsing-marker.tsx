"use client";

import L from "leaflet";
import type { DivIcon } from "leaflet";

/**
 * Crea un L.divIcon para usar en <Marker icon={...} />.
 * Tamaño reducido para no tapar el mapa; activo con borde y ping sutil.
 */
export function createPulsingMarkerIcon(isSelected: boolean): DivIcon {
  const dotClass = isSelected ? "marker-dot marker-dot--selected" : "marker-dot";
  const wrapperClass = isSelected ? "marker-icon-wrapper marker-icon-wrapper--selected" : "marker-icon-wrapper";
  return L.divIcon({
    className: wrapperClass,
    html: `<div class="${dotClass}" role="presentation"></div>`,
    iconSize: isSelected ? [14, 14] : [10, 10],
    iconAnchor: isSelected ? [7, 7] : [5, 5],
  });
}
