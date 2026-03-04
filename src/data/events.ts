import type { GameEvent } from "@/types";

/**
 * Archivo maestro de eventos del juego.
 * Fuente única de verdad para todos los eventos (MAIN, DAILY, SECONDARY).
 */
export const EVENTS: GameEvent[] = [
  {
    id: "skill-team-pk",
    title: "Skill Team PK",
    description:
      "Evento en donde se forman equipos para enfrentarse a un PK, en este evento el daño de los personajes es reducido.\nPara poder ingresar, debes de formar un equipo, ya sea con más jugadores o solo, pero debes tener un grupo creado.\n\nUna vez adentro, el sistema empareja a los equipos en un team vs team y el que gana pasa a la siguiente ronda",
    notes:
      "- En la sala de espera se pueden comprar pots\n- Puedes abrir los almacenes remotos si tienes VIP\n- Cuando entran a la partida, entran en pk, cambien a grupo\n- Los waters pueden revivir aliados",
    type: "MAIN",
    mapId: "twin_city_map",
    location: { x: 1119.25, y: 776.79 },
    gameCoordinates: "441, 241",
    schedule: {
      type: "recurring",
      intervalMinutes: 10080,
      offsetMinutes: 9835,
    },
  },
  {
    id: "group-pk",
    title: "Group PK",
    description:
      "Evento en donde se forman equipos para enfrentarse a un PK.\nPara poder ingresar, debes de formar un equipo, ya sea con más jugadores o solo, pero debes tener un grupo creado.\n\nUna vez adentro, el sistema empareja a los equipos en un team vs team y el que gana pasa a la siguiente ronda",
    notes:
      "- En la sala de espera se pueden comprar pots\n- Puedes abrir los almacenes remotos si tienes VIP\n- Cuando entran a la partida, entran en pk, cambien a grupo\n- Los waters pueden revivir aliados",
    type: "MAIN",
    mapId: "twin_city_map",
    location: { x: 1079.5, y: 797.7912678772881 },
    gameCoordinates: "441, 241",
    schedule: {
      type: "recurring",
      intervalMinutes: 10080,
      offsetMinutes: 4075,
    },
  },
  {
    id: "pk-esposo",
    title: "Pk Esposo",
    description:
      "Para poder ingresar debes tener un grupo creado con tu esposo o esposa. No es eliminación directa: todos los participantes entran en el mismo mapa.\n\nSolo ganan los que quedan hasta el final; los últimos en pie reclaman los premios.",
    notes:
      "- En la sala de espera se pueden comprar pots\n- Puedes abrir los almacenes remotos si tienes VIP\n- Cuando entran a la partida, entran en pk, cambien a grupo\n- Los waters no pueden revivir aliados",
    type: "MAIN",
    mapId: "twin_city_map",
    location: { x: 1003, y: 745.6303540885767 },
    gameCoordinates: "455, 241",
    schedule: {
      type: "recurring",
      intervalMinutes: 10080,
      offsetMinutes: 1195,
    },
  },
  {
    id: "weekly-pk-war",
    title: "Weekly PK War",
    description:
      "Puedes participar una vez por semana. Habla con General Bravery para ingresar. Misma mecánica que el Monthly PK War: arena por nivel, tres mapas, último en pie gana.",
    notes:
      "- Horario: sábados 22:00 (hora del servidor)\n- Entrada: hablar con el NPC General Bravery (Twin City 446,246)\n- Premios por nivel: 1-99 → 215 CPs, 1 EXP Ball, Class 1 Money Bag (300k)\n- Premios 100-119: 215 CPs, 2 EXP Balls, Class 2 (800k)\n- Premios 120-129: 215 CPs, 3 EXP Balls, Class 3 (1.2M)\n- Premios 130+: 215 CPs, 5 EXP Balls, Class 4 (1.8M) + HALO\n- Tener cuidado al salir del torneo, ya que sales en el centro de dragon y en modo pk, por lo que te puedes poner rojo",
    type: "MAIN",
    mapId: "twin_city_map",
    location: { x: 980.5, y: 758.6329742712617 },
    gameCoordinates: "446, 246",
    schedule: {
      type: "weeklySlots",
      daysOfWeek: [6],
      slotsMinutesFromMidnight: [22 * 60],
    },
  },
  {
    id: "monthly-pk-war",
    title: "Monthly PK War",
    description:
      "Puedes participar una vez por mes. Habla con General Bravery para ingresar. Misma mecánica que el Weekly PK War: arena por nivel, tres mapas, último en pie gana.",
    notes:
      "- Entrada: hablar con el NPC General Bravery (Twin City 446,246)\n- Premios por nivel: 1-99 → 215 CPs, 2 EXP Balls, Class 1 (300k)\n- Premios 100-119: 215 CPs, 3 EXP Balls, Class 2 (800k)\n- Premios 120-129: 215 CPs, Power EXP Ball, Class 3 (1.2M)\n- Premios 130+: 215 CPs, 2 Power EXP Balls, Class 5 (5M) + HALO\n- Tener cuidado al salir del torneo, ya que sales en el centro de dragon y en modo pk, por lo que te puedes poner rojo",
    type: "MAIN",
    mapId: "twin_city_map",
    location: { x: 994, y: 750.6303540885767 },
    gameCoordinates: "446, 246",
    schedule: {
      type: "monthly",
      dayOfMonth: 1,
      offsetMinutesFromMidnight: 20 * 60,
    },
  },
  {
    id: "class-pk",
    title: "Class PK",
    description:
      "Cada clase tiene su propia guerra PK una vez por semana. Hay dos rondas por clase, comenzando a las 19:00 (hora del servidor).\n\nSolo competirás contra personajes de tu misma clase, lo que hace que el torneo sea una verdadera prueba de habilidad y poder individual.",
    notes:
      "- Horario: todos los días a las 19:00 (hora del servidor)\n- Lunes → Trojans | Martes → Warriors | Miércoles → Archers | Jueves → Fire Taoists | Viernes → Water Taoists\n- Entrada: PremioPKNPC (Twin City 436,243)\n- Premios 0-99: 215 CPs y 1 EXP Ball\n- Premios 100-119: 390 CPs y 3 EXP Balls\n- Premios 120-129: 510 CPs y 5 EXP Balls\n- Premios 130+: 730 CPs y 10 EXP Balls + TOP\n- Los enemigos suelen matar fuera del evento para no dejarte entrar, intenta estar puntual y bajo un guardia\n- Ayuda a los de tu clan y aliados a eliminar a los otros personajes, despues, ponganse de acuerdo para la reparticion del premio",
    type: "DAILY",
    mapId: "twin_city_map",
    location: { x: 1111.5, y: 780.7864369154627 },
    gameCoordinates: "436, 243",
    schedule: {
      type: "recurring",
      intervalMinutes: 1440,
      offsetMinutes: 0,
    },
  },
  {
    id: "elite-pk",
    title: "Elite PK",
    description:
      "Cada viernes, héroes de todos los niveles se enfrentan en combates PK según su categoría (1-99, 100-119, 120-129, 130+).\n\nAcepta la invitación del sistema y habla con AdminTorneoDeHeroes para entrar. Te transporta al mapa del evento, compites por rondas y al final los primeros puestos reclaman premio con el mismo NPC antes del siguiente torneo.",
    notes:
      "- Entrada y premios: AdminTorneoDeHeroes (Ciudad de Dragón 412,242)\n- Transportador: información, venta de medicinas y salida del mapa del torneo\n- Grupos por nivel: 1-99, 100-119, 120-129, 130+\n- Horario: todos los viernes a las 19:55 (hora del servidor)\n- Eliminatoria: es por rondas. Cada ronda dura 5 minutos; pasa a la siguiente el que tenga más puntos al acabar o el que mate al rival. Así hasta llegar a la final\n- Premios especiales del 1º al 8º (sin ítems de encantamiento). Reclamar con AdminTorneoDeHeroes antes del siguiente torneo",
    type: "MAIN",
    mapId: "twin_city_map",
    location: { x: 1084.5, y: 784.6599949052004 },
    gameCoordinates: "412, 242",
    schedule: {
      type: "recurring",
      intervalMinutes: 10080,
      offsetMinutes: 2935,
    },
  },
  {
    id: "treasure-in-the-blue",
    title: "Treasure in the Blue",
    description:
      "Recolecta monedas antiguas en el Proud Sea. Cada tipo de moneda (Gold, Silver, Copper) da recompensas distintas. El jefe Gold Octopus aparece al minuto 01 y al 45 de cada sesión con premios exclusivos.\n\nHabla con Squidward Tentacles para que te transporte al mapa. El evento tiene lugar de lunes a sábado en los horarios indicados.",
    notes:
      "- Horario: Lunes–Sábado 12:30–13:30 y 20:30–21:30 (hora del servidor)\n- Requisito: nivel 80 o superior\n- Entrada: Squidward Tentacles (Twin City 301,529)\n- Gold Coin: DragonBall, Lottery Ticket, armas/garment aleatorios, Class 3 Money Bag, CleanWater, +1 ItemBox\n- Silver Coin: Class 2 Money Bag, Exp Ball Scrap, 5 Meteors, +1 ItemBox\n- Copper Coin: 1-2 Meteors, Class 1 Money Bag, Exp Ball Scrap\n- Solo un premio aleatorio por moneda\n- Gold Octopus (min 01 y 45 de cada sesión): DragonBall, Penitence Amulet, Exp Ball, 20 Meteors, 2 Lottery Tickets, 1 Gold Coin",
    type: "DAILY",
    mapId: "twin_city_map",
    location: { x: 950, y: 736.3753411696204 },
    gameCoordinates: "301, 529",
    schedule: {
      type: "weeklySlots",
      daysOfWeek: [1, 2, 3, 4, 5, 6],
      slotsMinutesFromMidnight: [750, 1230],
    },
  },
  {
    id: "guild-war",
    title: "Guild War",
    description:
      "Entra al área de Guild hablando con el Guild Controller (Twin City 350,337). Cruza el puente hasta la fortaleza del Guild Pole (90,100). Solo puede atacarse durante la guerra: mantén Ctrl y clic en el Pole. El clan que más daño cause al Pole se convierte en dueño de la zona; recompensas incluyen control del NPC Guild Conductress, 5.000 CPs (Guild Beast) y Estatua de Clan. El Pole y la puerta se reconstruyen tras cada captura; los fantasmas reviven cada media hora o con Water Taoists.",
    notes:
      "- Horario: domingo 13:00–18:00 (hora del servidor)\n- Entrada: Guild Controller (Twin City 350,337)\n- Guild Pole en la fortaleza (90,100); atacar con Ctrl + clic\n- Guerreros y Trojans daño; Fire Taoists y Archers defienden; Water Taoists reviven\n- Recompensas: control Guild Conductress, 5.000 CPs (Guild Beast), Estatua de Clan\n- Atacar el Pole da dinero al clan; si Guild Fund llega a 0, el Pole recibe 10x más daño\n- El clan que capture el Pole recibe el 10% del Guild Fund del clan anterior\n- Guild Funds: donaciones de miembros; reducen pérdida de EXP al morir en PK",
    type: "MAIN",
    mapId: "twin_city_map",
    location: { x: 783, y: 768.2250081880709 },
    gameCoordinates: "350, 337",
    schedule: {
      type: "recurring",
      intervalMinutes: 10080,
      offsetMinutes: 5400,
    },
  },
  {
    id: "queen-evil",
    title: "Queen Evil",
    description:
      "Entra hablando con el NPC General Ly en Dragon (coordenadas 415, 384). Al ingresar llegas a una Safe Zone donde no te pueden atacar; el límite del área son troncos con picos en las salidas norte y sur.\n\nEn el mapa del evento debes encontrar a la reina en las coordenadas 706, 710, matarla y tomar los premios. El evento se desarrolla en el mapa Evil Queen.",
    notes:
      "- Horario: todos los días 20:30 y 23:30 (hora del servidor)\n- Entrada: General Ly (Dragon / Twin City 415, 384)\n- Mapa del evento: Evil Queen; reina en coordenadas 706, 710\n- La coordinación con aliados y tu clan es la base para ganar este evento\n- La reina tiene distintos ataques y se puede curar\n- La zona es libre de PK: puedes matar y no suman puntos PK\n- Al salir de la reina sales en modo PK; no olvides cambiarte a captura o paz",
    type: "DAILY",
    mapId: "twin_city_map",
    location: { x: 809.5, y: 672.1046435459806 },
    gameCoordinates: "415, 384",
    images: ["/queen-evil-npc.png"],
    destinationEventId: "queen-evil-map",
    listGroupKey: "queen-evil",
    schedule: {
      type: "weeklySlots",
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      slotsMinutesFromMidnight: [20 * 60 + 30, 23 * 60 + 30],
    },
  },
  {
    id: "queen-evil-map",
    title: "Queen Evil",
    listGroupKey: "queen-evil",
    description:
      "Entra hablando con el NPC General Ly en Dragon (coordenadas 415, 384). Al ingresar llegas a una Safe Zone donde no te pueden atacar; el límite del área son troncos con picos en las salidas norte y sur.\n\nEn el mapa del evento debes encontrar a la reina en las coordenadas 706, 710, matarla y tomar los premios. El evento se desarrolla en el mapa Evil Queen.",
    notes:
      "- Horario: todos los días 20:30 y 23:30 (hora del servidor)\n- Entrada: General Ly (Dragon / Twin City 415, 384)\n- Mapa del evento: Evil Queen; reina en coordenadas 706, 710\n- La coordinación con aliados y tu clan es la base para ganar este evento\n- La reina tiene distintos ataques y se puede curar\n- La zona es libre de PK: puedes matar y no suman puntos PK\n- Al salir de la reina sales en modo PK; no olvides cambiarte a captura o paz",
    type: "DAILY",
    mapId: "evil_queen_map",
    location: { x: 87.25, y: 15.519160085883783 },
    gameCoordinates: "706, 710",
    images: ["/queen-evil-npc.png"],
    entryEventId: "queen-evil",
    schedule: {
      type: "weeklySlots",
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      slotsMinutesFromMidnight: [20 * 60 + 30, 23 * 60 + 30],
    },
  },
  {
    id: "reina-de-hielo",
    title: "Reina De Hielo",
    description:
      "Para entrar ve a Desert City (Desierto) a las coordenadas 471, 648, habla con el NPC y pide que te lleve a Gruta Congelada 2. Una vez dentro, ve al centro del mapa a las coordenadas 343, 364. Ahí aparece el monstruo Snow Banshee (Reina de Hielo): mátalo y recoge los premios.",
    notes:
      "- Horario: todos los días, cada hora a los 27 min (ej. 1:27, 2:27, 3:27 — hora del servidor)\n- Entrada: Desert City 471, 648 (hablar con el NPC → Gruta Congelada 2)\n- Spawn del jefe: mapa Rasca Gruta (Gruta Congelada) coordenadas 343, 364\n- Sí es zona PK: matar jugadores suma puntos PK; mucha gente se pone roja, cuidado con el PK\n- Crea grupos con distintas personas para poder tomar el premio más fácil",
    type: "DAILY",
    mapId: "desert_map",
    location: { x: 228, y: 418.2423668983588 },
    gameCoordinates: "471, 648",
    destinationEventId: "reina-de-hielo-gruta",
    listGroupKey: "reina-de-hielo",
    schedule: {
      type: "recurring",
      intervalMinutes: 60,
      offsetMinutes: 5 * 60 + 27,
    },
  },
  {
    id: "reina-de-hielo-gruta",
    title: "Reina De Hielo",
    description:
      "Para entrar ve a Desert City (Desierto) a las coordenadas 471, 648, habla con el NPC y pide que te lleve a Gruta Congelada 2. Una vez dentro, ve al centro del mapa a las coordenadas 343, 364. Ahí aparece el monstruo Snow Banshee (Reina de Hielo): mátalo y recoge los premios.",
    notes:
      "- Horario: todos los días, cada hora a los 27 min (ej. 1:27, 2:27, 3:27 — hora del servidor)\n- Entrada: Desert City 471, 648 (hablar con el NPC → Gruta Congelada 2)\n- Spawn del jefe: mapa Rasca Gruta (Gruta Congelada) coordenadas 343, 364\n- Sí es zona PK: matar jugadores suma puntos PK; mucha gente se pone roja, cuidado con el PK\n- Crea grupos con distintas personas para poder tomar el premio más fácil",
    type: "DAILY",
    mapId: "rasca_gruta_map",
    location: { x: 94.75, y: 66.78381673277777 },
    gameCoordinates: "343, 364",
    entryEventId: "reina-de-hielo",
    listGroupKey: "reina-de-hielo",
    schedule: {
      type: "recurring",
      intervalMinutes: 60,
      offsetMinutes: 5 * 60 + 27,
    },
  },
  {
    id: "cajas-ape",
    title: "Cajas",
    listGroupKey: "cajas",
    description:
      "En este evento aparece una caja al centro de la ciudad seleccionada (aleatoria entre 5 ciudades). La ciudad se convierte en zona libre de PK: no te suma puntos PK si matas a alguien. Debes destruir la caja y tomar los premios que bota.",
    notes:
      "- Horario: todos los días 10:00, 13:00, 15:00, 17:00 y 21:00 (hora del servidor)\n- La ciudad es PK-free mientras está la caja y 40 segundos más después de destruirla; un contador azul en pantalla indica el tiempo restante\n- Cuidado: cuando termina el PK-free muchos siguen matando y es fácil ponerse rojo\n- Posibles mapas (aleatorio uno por vez): Tigre (Ape) 688,314 | Ciudad Dragon 750,564 | Desierto 196,392 | Bosque (Castillo) 662,988 | Bird Island 610,262",
    type: "DAILY",
    mapId: "ape",
    location: { x: 688, y: 314.2083045234542 },
    gameCoordinates: "688, 314",
    possibleMaps: [
      { mapId: "ape", label: "Tigre (Ape)", eventId: "cajas-ape" },
      { mapId: "twin_city_map", label: "Ciudad Dragon", eventId: "cajas-twin-city" },
      { mapId: "desert_map", label: "Desierto", eventId: "cajas-desert" },
      { mapId: "forest_map", label: "Bosque (Castillo)", eventId: "cajas-forest" },
      { mapId: "bird_island_map", label: "Bird Island", eventId: "cajas-bird-island" },
    ],
    schedule: {
      type: "weeklySlots",
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      slotsMinutesFromMidnight: [10 * 60, 13 * 60, 15 * 60, 17 * 60, 21 * 60],
    },
  },
  {
    id: "cajas-twin-city",
    title: "Cajas",
    listGroupKey: "cajas",
    description:
      "En este evento aparece una caja al centro de la ciudad seleccionada (aleatoria entre 5 ciudades). La ciudad se convierte en zona libre de PK: no te suma puntos PK si matas a alguien. Debes destruir la caja y tomar los premios que bota.",
    notes:
      "- Horario: todos los días 10:00, 13:00, 15:00, 17:00 y 21:00 (hora del servidor)\n- La ciudad es PK-free mientras está la caja y 40 segundos más después de destruirla; un contador azul en pantalla indica el tiempo restante\n- Cuidado: cuando termina el PK-free muchos siguen matando y es fácil ponerse rojo\n- Posibles mapas (aleatorio uno por vez): Tigre (Ape) 688,314 | Ciudad Dragon 750,564 | Desierto 196,392 | Bosque (Castillo) 662,988 | Bird Island 610,262",
    type: "DAILY",
    mapId: "twin_city_map",
    location: { x: 750, y: 564.2987008260855 },
    gameCoordinates: "750, 564",
    possibleMaps: [
      { mapId: "ape", label: "Tigre (Ape)", eventId: "cajas-ape" },
      { mapId: "twin_city_map", label: "Ciudad Dragon", eventId: "cajas-twin-city" },
      { mapId: "desert_map", label: "Desierto", eventId: "cajas-desert" },
      { mapId: "forest_map", label: "Bosque (Castillo)", eventId: "cajas-forest" },
      { mapId: "bird_island_map", label: "Bird Island", eventId: "cajas-bird-island" },
    ],
    schedule: {
      type: "weeklySlots",
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      slotsMinutesFromMidnight: [10 * 60, 13 * 60, 15 * 60, 17 * 60, 21 * 60],
    },
  },
  {
    id: "cajas-desert",
    title: "Cajas",
    listGroupKey: "cajas",
    description:
      "En este evento aparece una caja al centro de la ciudad seleccionada (aleatoria entre 5 ciudades). La ciudad se convierte en zona libre de PK: no te suma puntos PK si matas a alguien. Debes destruir la caja y tomar los premios que bota.",
    notes:
      "- Horario: todos los días 10:00, 13:00, 15:00, 17:00 y 21:00 (hora del servidor)\n- La ciudad es PK-free mientras está la caja y 40 segundos más después de destruirla; un contador azul en pantalla indica el tiempo restante\n- Cuidado: cuando termina el PK-free muchos siguen matando y es fácil ponerse rojo\n- Posibles mapas (aleatorio uno por vez): Tigre (Ape) 688,314 | Ciudad Dragon 750,564 | Desierto 196,392 | Bosque (Castillo) 662,988 | Bird Island 610,262",
    type: "DAILY",
    mapId: "desert_map",
    location: { x: 196, y: 392.2338513046327 },
    gameCoordinates: "196, 392",
    possibleMaps: [
      { mapId: "ape", label: "Tigre (Ape)", eventId: "cajas-ape" },
      { mapId: "twin_city_map", label: "Ciudad Dragon", eventId: "cajas-twin-city" },
      { mapId: "desert_map", label: "Desierto", eventId: "cajas-desert" },
      { mapId: "forest_map", label: "Bosque (Castillo)", eventId: "cajas-forest" },
      { mapId: "bird_island_map", label: "Bird Island", eventId: "cajas-bird-island" },
    ],
    schedule: {
      type: "weeklySlots",
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      slotsMinutesFromMidnight: [10 * 60, 13 * 60, 15 * 60, 17 * 60, 21 * 60],
    },
  },
  {
    id: "cajas-forest",
    title: "Cajas",
    listGroupKey: "cajas",
    description:
      "En este evento aparece una caja al centro de la ciudad seleccionada (aleatoria entre 5 ciudades). La ciudad se convierte en zona libre de PK: no te suma puntos PK si matas a alguien. Debes destruir la caja y tomar los premios que bota.",
    notes:
      "- Horario: todos los días 10:00, 13:00, 15:00, 17:00 y 21:00 (hora del servidor)\n- La ciudad es PK-free mientras está la caja y 40 segundos más después de destruirla; un contador azul en pantalla indica el tiempo restante\n- Cuidado: cuando termina el PK-free muchos siguen matando y es fácil ponerse rojo\n- Posibles mapas (aleatorio uno por vez): Tigre (Ape) 688,314 | Ciudad Dragon 750,564 | Desierto 196,392 | Bosque (Castillo) 662,988 | Bird Island 610,262",
    type: "DAILY",
    mapId: "forest_map",
    location: { x: 662, y: 988.4192292295935 },
    gameCoordinates: "662, 988",
    possibleMaps: [
      { mapId: "ape", label: "Tigre (Ape)", eventId: "cajas-ape" },
      { mapId: "twin_city_map", label: "Ciudad Dragon", eventId: "cajas-twin-city" },
      { mapId: "desert_map", label: "Desierto", eventId: "cajas-desert" },
      { mapId: "forest_map", label: "Bosque (Castillo)", eventId: "cajas-forest" },
      { mapId: "bird_island_map", label: "Bird Island", eventId: "cajas-bird-island" },
    ],
    schedule: {
      type: "weeklySlots",
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      slotsMinutesFromMidnight: [10 * 60, 13 * 60, 15 * 60, 17 * 60, 21 * 60],
    },
  },
  {
    id: "cajas-bird-island",
    title: "Cajas",
    listGroupKey: "cajas",
    description:
      "En este evento aparece una caja al centro de la ciudad seleccionada (aleatoria entre 5 ciudades). La ciudad se convierte en zona libre de PK: no te suma puntos PK si matas a alguien. Debes destruir la caja y tomar los premios que bota.",
    notes:
      "- Horario: todos los días 10:00, 13:00, 15:00, 17:00 y 21:00 (hora del servidor)\n- La ciudad es PK-free mientras está la caja y 40 segundos más después de destruirla; un contador azul en pantalla indica el tiempo restante\n- Cuidado: cuando termina el PK-free muchos siguen matando y es fácil ponerse rojo\n- Posibles mapas (aleatorio uno por vez): Tigre (Ape) 688,314 | Ciudad Dragon 750,564 | Desierto 196,392 | Bosque (Castillo) 662,988 | Bird Island 610,262",
    type: "DAILY",
    mapId: "bird_island_map",
    location: { x: 610, y: 262.218130208523 },
    gameCoordinates: "610, 262",
    possibleMaps: [
      { mapId: "ape", label: "Tigre (Ape)", eventId: "cajas-ape" },
      { mapId: "twin_city_map", label: "Ciudad Dragon", eventId: "cajas-twin-city" },
      { mapId: "desert_map", label: "Desierto", eventId: "cajas-desert" },
      { mapId: "forest_map", label: "Bosque (Castillo)", eventId: "cajas-forest" },
      { mapId: "bird_island_map", label: "Bird Island", eventId: "cajas-bird-island" },
    ],
    schedule: {
      type: "weeklySlots",
      daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
      slotsMinutesFromMidnight: [10 * 60, 13 * 60, 15 * 60, 17 * 60, 21 * 60],
    },
  },
  {
    id: "flame-lit",
    title: "Flame Lit (Llama Encendida)",
    description:
      "Ocurre durante la Guild War (domingo). Habla con el Flame Taoist al iniciar el evento (16:00) para recibir la Jade Rune. Enciende las llamas siguiendo las coordenadas de cada runa; la 10ª llama solo puede encenderse de 17:30 a 18:00. Al terminar (18:00), entrega tu última runa al NPC para recibir experiencia según la runa (no se entregan EXP Balls físicas).",
    notes:
      "- Horario: domingo 16:00–18:00 (hora del servidor); durante la Guild War\n- La 10ª llama solo se puede encender de 17:30 a 18:00\n- Entrada: Flame Taoist (Twin City 353,325)\n- Objetos de misión: Jade Rune → Gold Rune → Spirit Rune → Heaven Rune → Dragon Rune\n- Recompensa: experiencia según la última runa al terminar (equivalente en EXP, no ítems)\n- Si tiras una runa reinicias el progreso; se puede completar una vez por semana\n- Llamas en Twin City y mapa de Guild",
    type: "SECONDARY",
    mapId: "twin_city_map",
    location: { x: 808, y: 780.6586848138579 },
    gameCoordinates: "353, 325",
    images: ["/flames_1.png", "/flames_2.png"],
    schedule: {
      type: "recurring",
      intervalMinutes: 10080,
      offsetMinutes: 5580,
    },
  },
];
