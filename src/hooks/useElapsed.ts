"use client";

import { useCallback, useEffect, useRef } from "react";

/* Milliseconds since the form mounted, used as a spam signal.
 *
 * `Date.now()` cannot be called during render — it is impure, and React's
 * compiler rules reject it, correctly: a render may run more than once or be
 * thrown away, so a timestamp captured there is not the one you think it is.
 * The clock is read in an effect instead, which runs once after mount.
 *
 * Returns 0 before the effect has run, and the route treats a missing or zero
 * elapsed time as "unknown" rather than "suspicious" — a real applicant whose JS
 * timing is odd must never be silently dropped.
 */
export function useElapsed(): () => number {
  const mountedAt = useRef(0);

  useEffect(() => {
    mountedAt.current = Date.now();
  }, []);

  return useCallback(() => {
    if (!mountedAt.current) return 0;
    return Date.now() - mountedAt.current;
  }, []);
}
