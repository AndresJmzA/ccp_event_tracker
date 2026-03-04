/**
 * GameEventTracker - Tipos de dominio
 * Definiciones para eventos del juego (MAIN, DAILY, SECONDARY).
 */

/** Tipo de evento: principal, diario o secundario */
export type GameEventType = "MAIN" | "DAILY" | "SECONDARY";

/** Coordenadas en mapa con CRS.Simple (píxeles) */
export interface MapLocation {
  x: number;
  y: number;
}

/** Fuente de mapa: una sola imagen */
export interface MapSourceSingle {
  type: "single";
  url: string;
}

/** Fuente de mapa: grid 2x2. urls en orden [TopLeft, TopRight, BottomLeft, BottomRight] */
export interface MapSourceGrid {
  type: "grid";
  urls: [string, string, string, string];
}

export type MapSource = MapSourceSingle | MapSourceGrid;

/** Configuración del mapa: dimensiones y fuente(s) de imagen */
export interface MapConfig {
  width: number;
  height: number;
  source: MapSource;
}

/**
 * Programa de un evento MAIN: ocurre en una fecha/hora fija (UTC).
 */
export interface FixedSchedule {
  type: "fixed";
  /** Fecha y hora del evento en UTC */
  at: Date;
}

/**
 * Programa recurrente: se repite en un intervalo con offset opcional.
 * La referencia es domingo 00:00 hora servidor; offsetMinutes = minutos desde ahí (ej. 9835 = sábado 19:55 servidor).
 */
export interface RecurringSchedule {
  type: "recurring";
  /** Intervalo entre ocurrencias en minutos (ej. 10080 = 1 semana) */
  intervalMinutes: number;
  /** Minutos desde domingo 00:00 hora servidor para la ocurrencia en el ciclo (opcional) */
  offsetMinutes?: number;
}

/**
 * Programa mensual: un día concreto de cada mes a una hora (ej. día 1 a las 20:00).
 * La hora se interpreta en la zona horaria del servidor (America/Bogota).
 */
export interface MonthlySchedule {
  type: "monthly";
  /** Día del mes (1-31) */
  dayOfMonth: number;
  /** Minutos desde medianoche (ej. 20*60 = 1200 para las 20:00) en hora del servidor */
  offsetMinutesFromMidnight: number;
}

/**
 * Programa por slots semanales: varios horarios por día en días concretos de la semana.
 * Las horas se interpretan en la zona horaria del servidor (America/Bogota).
 */
export interface WeeklySlotsSchedule {
  type: "weeklySlots";
  /** Días en que aplica: 0 = Domingo, 1 = Lunes, …, 6 = Sábado. Ej. Lunes–Sábado = [1,2,3,4,5,6] */
  daysOfWeek: number[];
  /** Minutos desde medianoche (hora servidor) para cada slot. Ej. 12:30 → 750, 20:30 → 1230 */
  slotsMinutesFromMidnight: number[];
}

/** Schedule: fijo, recurrente, mensual o weeklySlots */
export type GameEventSchedule = FixedSchedule | RecurringSchedule | MonthlySchedule | WeeklySlotsSchedule;

/**
 * Evento del juego: mundo abierto, diario, secundario.
 * - MAIN: evento principal (ej. fecha fija o recurrente); alimenta "Próximo evento principal".
 * - DAILY: evento diario; listado con etiqueta "Diario".
 * - SECONDARY: evento menor (ej. spawn cada hora); listado como "Secundario".
 * schedule opcional: si no hay, el evento no tiene horario fijo (no countdown).
 */
export interface GameEvent {
  id: string;
  title: string;
  description: string;
  /** Notas adicionales (opcional) */
  notes: string;
  type: GameEventType;
  /** Identificador del mapa (ej. "tcmapa", "tcmapb") para mostrar en qué mapa está */
  mapId: string;
  /** Posición en el mapa (CRS.Simple, coordenadas en píxeles) */
  location: MapLocation;
  /** Coordenada visual del juego en texto (ej. "127:0") — opcional */
  gameCoordinates?: string;
  /** Rutas públicas de imágenes del evento (ej. "/flames_1.png") — opcional */
  images?: string[];
  /** Programa (opcional). Si no hay, no se muestra countdown. */
  schedule?: GameEventSchedule;
  /** Id del evento "entrada" (mapa por donde se ingresa). Si existe, se muestra botón "Ver por donde ingresar". */
  entryEventId?: string;
  /** Id del evento "destino" (mapa donde ocurre el evento). Si existe, se muestra botón "Ver a donde llegar". */
  destinationEventId?: string;
  /** Agrupa eventos en la lista: solo se muestra uno por valor (el del mapa activo o el primero). Ej.: "reina-de-hielo", "cajas". */
  listGroupKey?: string;
  /** Mapas posibles (ej. Cajas): al hacer clic/tap se cambia a ese mapa y se selecciona el evento con eventId. */
  possibleMaps?: { mapId: string; label: string; eventId: string }[];
}

/** Tipo de guardado para comprobar schedule en runtime */
export function isFixedSchedule(schedule: GameEventSchedule): schedule is FixedSchedule {
  return schedule.type === "fixed";
}

/** Tipo de guardado para comprobar schedule en runtime */
export function isRecurringSchedule(schedule: GameEventSchedule): schedule is RecurringSchedule {
  return schedule.type === "recurring";
}

/** Tipo de guardado para comprobar schedule en runtime */
export function isMonthlySchedule(schedule: GameEventSchedule): schedule is MonthlySchedule {
  return schedule.type === "monthly";
}

/** Tipo de guardado para comprobar schedule en runtime */
export function isWeeklySlotsSchedule(schedule: GameEventSchedule): schedule is WeeklySlotsSchedule {
  return schedule.type === "weeklySlots";
}
