"use client";

import { useCallback } from "react";

/* Drives the one entry animation the brand system permits: a fade plus a 12px
 * rise, 420ms, --ease-out-soft. The .ctl-rise / .ctl-rise.is-in classes already
 * exist in tokens/utilities.css and nothing was driving them in the prototype.
 *
 * A single module-level observer serves every element on the page rather than
 * one observer each. Elements are unobserved once revealed — this is an entry
 * animation, so nothing re-hides on scroll back up.
 *
 * prefers-reduced-motion is handled by the token layer, which zeroes
 * --duration-entry and --rise-distance. The class still has to be applied for
 * the element to reach opacity 1, so the observer runs either way and the
 * transition simply takes no time.
 *
 * Robustness: .ctl-rise starts at opacity 0. If JS never runs, a <noscript>
 * block in the root layout neutralises the class so the page stays readable.
 */

const REVEALED = "is-in";

let observer: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver | null {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) return null;

  observer ??= new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add(REVEALED);
        obs.unobserve(entry.target);
      }
    },
    {
      // Fire slightly before the element reaches the viewport, so the motion
      // reads as the section arriving rather than catching up.
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.01,
    },
  );

  return observer;
}

/**
 * Ref callback that reveals the element when it scrolls into view.
 *
 * Falls back to revealing immediately where IntersectionObserver is missing,
 * so content is never left hidden.
 */
export function useRiseOnScroll<T extends HTMLElement>() {
  return useCallback((node: T | null) => {
    if (!node) return;

    const obs = getObserver();
    if (!obs) {
      node.classList.add(REVEALED);
      return;
    }

    // Already in view on first paint (above the fold): reveal without waiting.
    obs.observe(node);
  }, []);
}
