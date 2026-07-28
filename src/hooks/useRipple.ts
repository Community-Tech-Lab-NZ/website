"use client";

import { useEffect, useRef } from "react";

/* The pond (motion override, owner's finale): dragging the pointer through a
 * paragraph displaces the words nearest it a few pixels outward, and each
 * word drifts back over ~700ms — like drawing a stick slowly through still
 * water, where the slow closing behind it is the wake. Displacement caps at
 * 6px, so the text sways without ever becoming hard to read.
 *
 * Each word is an inline-block span (splitRipple in Typography.tsx); this
 * hook owns the physics. Positions are read from offsetLeft/Top, which
 * ignore transforms, against the host made position:relative — so a pushed
 * word still knows where home is. rAF-throttled; the soft 700ms transition
 * (see .ctl-ripple-word) provides both the lagged push, which reads as water
 * resistance, and the slow return.
 *
 * Off entirely for reduced motion and for pointerless devices.
 */

const RADIUS = 80;
const PUSH = 6;

export function useRipple<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(hover: hover)").matches) return;

    host.style.position = "relative";
    const words = [...host.querySelectorAll<HTMLElement>(".ctl-ripple-word")];
    if (!words.length) return;
    let raf = 0;

    const onMove = (event: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const hr = host.getBoundingClientRect();
        for (const word of words) {
          const cx = hr.left + word.offsetLeft + word.offsetWidth / 2;
          const cy = hr.top + word.offsetTop + word.offsetHeight / 2;
          const dx = cx - event.clientX;
          const dy = cy - event.clientY;
          const d = Math.hypot(dx, dy);
          if (d < RADIUS && d > 0.01) {
            const f = ((1 - d / RADIUS) * PUSH) / d;
            word.style.transform = `translate(${dx * f}px, ${dy * f}px)`;
          } else if (word.style.transform) {
            word.style.transform = "";
          }
        }
      });
    };
    const onLeave = () => {
      for (const word of words) word.style.transform = "";
    };

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return ref;
}
