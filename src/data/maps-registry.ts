import type { MapConfig } from "@/types";

/** Entrada del registro: configuración del mapa + nombre para la UI */
export interface MapRegistryEntry {
  config: MapConfig;
  name: string;
}

/**
 * Registro de mapas del atlas. La clave es el mapId referenciado por los eventos.
 * Permite cambiar el fondo del mapa según el evento seleccionado.
 */
export const MAPS_REGISTRY: Record<string, MapRegistryEntry> = {
  twin_city_map: {
    name: "Ciudad Dragon",
    config: {
      width: 1506,
      height: 1024,
      source: {
        type: "grid",
        urls: [
          "/maps/tcmap1.jpg",
          "/maps/tcmap2.jpg",
          "/maps/tcmap3.jpg",
          "/maps/tcmap4.jpg",
        ],
      },
    },
  },
  ape: {
    name: "Tigre",
    config: {
      width: 1428,
      height: 1074,
      source: {
        type: "grid",
        urls: [
          "/maps/ape1.jpg",
          "/maps/ape2.jpg",
          "/maps/ape3.jpg",
          "/maps/ape4.jpg",
        ],
      },
    },
  },

  desert_map: {
    name: "Desierto",
    config: {
      width: 998,
      height: 1076,
      source: {
        type: "grid",
        urls: [
          "/maps/deserta1.jpg",
          "/maps/deserta2.jpg",
          "/maps/deserta3.jpg",
          "/maps/deserta4.jpg",
        ],
      },
    },
  },
  forest_map: {
    name: "Castillo",
    config: {
      width: 1504,
      height: 1136,
      source: {
        type: "grid",
        urls: [
          "/maps/castle1.jpg",
          "/maps/castle2.jpg",
          "/maps/castle3.jpg",
          "/maps/castle4.jpg",
        ],
      },
    },
  },
  bird_island_map: {
    name: "Ave",
    config: {
      width: 800,
      height: 912,
      source: {
        type: "grid",
        urls: [
          "/maps/birdi1.jpg",
          "/maps/birdi2.jpg",
          "/maps/birdi3.jpg",
          "/maps/birdi4.jpg",
        ],
      },
    },
  },

  rasca_gruta_map: {  
    name: "Rasca Gruta",
    config: {
      width: 201,
      height: 142,
      source: {
        type: "single",
        url: "/maps/rasca.jpg",
      },
    },       
  },
  evil_queen_map: {  
    name: "Evil Queen",
    config: {
      width: 180,
      height: 129,
      source: {
        type: "single",
        url: "/maps/queenevil.jpg",
      },
    },       
  },
};

/** mapId por defecto si el registro no tiene la clave (Twin City / Ciudad Dragon es el principal). */
export const DEFAULT_MAP_ID = "twin_city_map";

/** Orden de mapas en la UI: Twin City primero, luego el resto. */
const MAP_ORDER: string[] = [
  "twin_city_map",
  "ape",
  "desert_map",
  "forest_map",
  "bird_island_map",
  "rasca_gruta_map",
  "evil_queen_map",
];

/** Obtiene la configuración del mapa para un mapId (con fallback). */
export function getMapConfig(mapId: string): MapRegistryEntry["config"] {
  return MAPS_REGISTRY[mapId]?.config ?? MAPS_REGISTRY[DEFAULT_MAP_ID]!.config;
}

/** Obtiene el nombre del mapa para la UI. */
export function getMapName(mapId: string): string {
  return MAPS_REGISTRY[mapId]?.name ?? mapId;
}

/** Lista de mapas para selectores/dropdowns: Twin City primero, luego el resto. */
export function getMapList(): { id: string; name: string }[] {
  const order = MAP_ORDER.filter((id) => id in MAPS_REGISTRY);
  return order.map((id) => ({
    id,
    name: MAPS_REGISTRY[id]!.name,
  }));
}
