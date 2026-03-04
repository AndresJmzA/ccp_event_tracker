"use client";

import { useEffect, useState } from "react";

/**
 * Devuelve true cuando el viewport cumple la media query (ej. min-width: 768px).
 * En SSR devuelve false; se actualiza tras el primer mount en cliente.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const m = window.matchMedia(query);
    setMatches(m.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    m.addEventListener("change", handler);
    return () => m.removeEventListener("change", handler);
  }, [query]);

  return matches;
}
