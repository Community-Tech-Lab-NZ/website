"use client";

import { useEffect, useRef } from "react";

/* Ambient drift layers: the brand's own glyphs in slow, continuous motion.
 *
 * MOTION OVERRIDE 3 (see the register in tokens/utilities.css), extended at
 * the owner's direction from a one-off settle to continuous loops, placed so
 * the whole page has a pulse without any reading surface churning:
 *
 *   hero      carets rising, the way the mark points and the entry motion moves
 *   section   sparser carets drifting diagonally through the Ink CTA bands
 *   footer    the OTHER half of the mark — cursor blocks — floating gently
 *
 * What keeps it an accent rather than a screensaver: nothing above 16%
 * opacity (--ctl-oat-16), Ink surfaces only (Oat reading sections stay
 * still), display:none under prefers-reduced-motion, aria-hidden and
 * pointer-events:none, and every element is transform/opacity only.
 *
 * Positions are hardcoded constellations rather than Math.random: render
 * purity aside, a randomised scatter reads worse than a composed one more
 * often than not. Durations are mutually prime-ish so the loops never sync
 * into a visible pattern.
 *
 * The glyphs also dodge the pointer (owner request — "you could chase them"):
 * within ~110px they slide away, up to ~48px at point blank, easing back when
 * the pointer moves on. Each glyph sits in a slot: the slot takes position
 * and the repulsion translate, the glyph inside runs the drift loop, because
 * one transform cannot serve two masters. rAF-throttled, layout read from
 * offsetLeft/Top (transform-free), and skipped entirely under reduced motion.
 */

type Drifter = {
  left: string;
  top: string;
  size: number;
  delay: number;
  duration: number;
};

const HERO: Drifter[] = [
  { left: "4%", top: "78%", size: 9, delay: 300, duration: 5300 },
  { left: "11%", top: "62%", size: 12, delay: 2900, duration: 7100 },
  { left: "19%", top: "84%", size: 8, delay: 0, duration: 4600 },
  { left: "27%", top: "70%", size: 11, delay: 1400, duration: 6400 },
  { left: "36%", top: "88%", size: 9, delay: 3600, duration: 5100 },
  { left: "44%", top: "64%", size: 13, delay: 200, duration: 7900 },
  { left: "53%", top: "80%", size: 8, delay: 5100, duration: 4300 },
  { left: "61%", top: "72%", size: 10, delay: 500, duration: 6700 },
  { left: "69%", top: "86%", size: 9, delay: 1600, duration: 5900 },
  { left: "76%", top: "66%", size: 12, delay: 4100, duration: 5000 },
  { left: "83%", top: "82%", size: 8, delay: 800, duration: 7300 },
  { left: "89%", top: "74%", size: 11, delay: 2200, duration: 6100 },
  { left: "94%", top: "60%", size: 9, delay: 400, duration: 4700 },
  { left: "98%", top: "85%", size: 10, delay: 3300, duration: 6900 },
];

const SECTION: Drifter[] = [
  { left: "8%", top: "70%", size: 9, delay: 0, duration: 8100 },
  { left: "24%", top: "82%", size: 8, delay: 2600, duration: 6700 },
  { left: "41%", top: "66%", size: 11, delay: 900, duration: 9300 },
  { left: "58%", top: "78%", size: 8, delay: 4200, duration: 7500 },
  { left: "72%", top: "62%", size: 10, delay: 1800, duration: 8700 },
  { left: "86%", top: "74%", size: 9, delay: 3400, duration: 7100 },
  { left: "95%", top: "84%", size: 8, delay: 600, duration: 6300 },
];

const FOOTER: Drifter[] = [
  { left: "6%", top: "72%", size: 7, delay: 500, duration: 8300 },
  { left: "21%", top: "84%", size: 6, delay: 2900, duration: 7100 },
  { left: "38%", top: "66%", size: 8, delay: 0, duration: 9700 },
  { left: "52%", top: "80%", size: 6, delay: 4400, duration: 6900 },
  { left: "66%", top: "70%", size: 7, delay: 1700, duration: 8900 },
  { left: "79%", top: "86%", size: 6, delay: 3600, duration: 7700 },
  { left: "91%", top: "64%", size: 8, delay: 900, duration: 9100 },
  { left: "97%", top: "78%", size: 6, delay: 2300, duration: 6500 },
];

const PRESETS = {
  hero: { items: HERO, variant: "" },
  section: { items: SECTION, variant: "ctl-drift--diag" },
  footer: { items: FOOTER, variant: "ctl-drift--block" },
} as const;

const RADIUS = 110;
const PUSH = 48;

export function Drift({
  preset = "hero",
  onLight = false,
}: {
  preset?: keyof typeof PRESETS;
  /** Ink-tinted glyphs for Oat surfaces (the sub-page heroes). */
  onLight?: boolean;
}) {
  const { items, variant } = PRESETS[preset];
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const host = layer?.parentElement;
    if (!layer || !host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const slots = [...layer.children] as HTMLElement[];
    let raf = 0;

    const onMove = (event: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const lr = layer.getBoundingClientRect();
        for (const slot of slots) {
          const cx = lr.left + slot.offsetLeft + slot.offsetWidth / 2;
          const cy = lr.top + slot.offsetTop + slot.offsetHeight / 2;
          const dx = cx - event.clientX;
          const dy = cy - event.clientY;
          const d = Math.hypot(dx, dy);
          if (d < RADIUS && d > 0.01) {
            const f = ((1 - d / RADIUS) * PUSH) / d;
            slot.style.transform = `translate(${dx * f}px, ${dy * f}px)`;
          } else if (slot.style.transform) {
            slot.style.transform = "";
          }
        }
      });
    };
    const onLeave = () => {
      for (const slot of slots) slot.style.transform = "";
    };

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={layerRef} aria-hidden="true" className="ctl-drift-layer">
      {items.map((d, i) => (
        <span
          key={i}
          className="ctl-drift-slot"
          style={{ left: d.left, top: d.top, width: d.size, height: d.size }}
        >
          <span
            className={`ctl-drift ${variant}${onLight ? " ctl-drift--ink" : ""}`}
            style={{
              animationDelay: `${d.delay}ms`,
              animationDuration: `${d.duration}ms`,
              animationIterationCount: "infinite",
            }}
          />
        </span>
      ))}
    </div>
  );
}
