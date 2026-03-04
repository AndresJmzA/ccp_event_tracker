"use client";

import { useEffect, useState } from "react";

/**
 * Devuelve la fecha/hora actual y se actualiza cada segundo.
 * Útil para countdowns y relojes en el HUD.
 */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return now;
}
