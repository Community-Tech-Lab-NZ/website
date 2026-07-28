"use client";

import { useCallback, useEffect, useRef } from "react";

/* Shared sliding underline for tab strips: the header nav, the community form
 * step nav and the apply tabs.
 *
 * The comment in CommunityForm always claimed the underline "slides between
 * sections"; until this hook it was actually a colour cross-fade between two
 * separate borders. This makes the claim true: one indicator bar, measured
 * against the active item and translated.
 *
 * Like useRiseOnScroll, the hook writes to the DOM directly instead of holding
 * React state — positioning a 2px bar is not something to re-render for.
 * Each item keeps its own border classes as the no-JS fallback; once the hook
 * runs it marks the strip `ctl-tabs-live`, which suppresses the per-item
 * borders and leaves the bar as the single source of the underline.
 *
 * Reduced motion needs no special handling: the bar's transition runs on
 * --duration-base, which the token layer zeroes.
 */

export function useTabIndicator<T extends HTMLElement = HTMLElement>(
  activeKey: string | number,
) {
  const stripRef = useRef<T | null>(null);
  const barRef = useRef<HTMLSpanElement | null>(null);

  const moveTo = useCallback((el: HTMLElement | null) => {
    const bar = barRef.current;
    if (!bar) return;
    if (!el) {
      bar.style.opacity = "0";
      return;
    }
    // Coming back from hidden, or being placed for the first time: position
    // instantly rather than gliding in from wherever the bar last was.
    const instant = bar.style.opacity === "0" || !bar.dataset.placed;
    if (instant) bar.style.transition = "none";
    bar.style.opacity = "1";
    bar.style.left = `${el.offsetLeft}px`;
    bar.style.width = `${el.offsetWidth}px`;
    if (instant) {
      void bar.getBoundingClientRect();
      bar.style.transition = "";
      bar.dataset.placed = "1";
    }
  }, []);

  /** Return the bar to the active item (or hide it if there is none). */
  const rest = useCallback(() => {
    const strip = stripRef.current;
    if (!strip) return;
    moveTo(strip.querySelector<HTMLElement>('[data-tab-active="true"]'));
  }, [moveTo]);

  useEffect(() => {
    stripRef.current?.classList.add("ctl-tabs-live");
    rest();
    // Web fonts landing after first paint change every measurement.
    document.fonts?.ready.then(rest);
    window.addEventListener("resize", rest);
    return () => window.removeEventListener("resize", rest);
  }, [rest, activeKey]);

  return { stripRef, barRef, moveTo, rest };
}
