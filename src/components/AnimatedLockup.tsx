"use client";

import { useRef } from "react";
import { clsx } from "clsx";
import { INK_LEFT } from "./Logo";

/* The header lockup, live.
 *
 * MOTION OVERRIDE 1 (see the register in tokens/utilities.css): the brand
 * guide lists blinking cursor animations under things to avoid, and the brand
 * owner chose to override it in this bounded form — the cursor block blinks
 * three times on first load and rests, and blinks once more when the lockup is
 * hovered. The mark is literally a text cursor, so of all the overrides this
 * one argues for itself.
 *
 * Construction: the static lockup files are single flat SVGs, so their cursor
 * block cannot be animated. This inline SVG rebuilds the same 520x140 geometry
 * from three layers — the wordmark-only file (same canvas, so registration is
 * exact), the caret polyline, and a separate <rect> for the block. Everything
 * except the blink matches Logo with align="optical" pixel for pixel: same
 * clear-space padding, same optical margin from INK_LEFT.
 *
 * Header only. The footer keeps the static Logo; two blinking cursors on one
 * page would be a tic, not a mark.
 */

type AnimatedLockupProps = {
  dark?: boolean;
  height?: number;
  className?: string;
};

export function AnimatedLockup({ dark = false, height = 68, className }: AnimatedLockupProps) {
  const blockRef = useRef<SVGRectElement>(null);

  const width = Math.round(height * (520 / 140));
  // Identical to Logo: clear space scaled with the mark, optical pull-left.
  const pad = Math.max(8, Math.round(height * 0.14));
  const opticalShift = -(pad + INK_LEFT.horizontal * (height / 140));

  const ink = dark ? "var(--ctl-kowhai)" : "var(--ctl-ink)";

  function blink() {
    const el = blockRef.current;
    if (!el) return;
    // Swap the three-blink settle for a single blink and restart it. The
    // reflow read is what lets the same animation run again.
    el.classList.remove("ctl-cursor-settle", "ctl-cursor-blink-once");
    void el.getBoundingClientRect();
    el.classList.add("ctl-cursor-blink-once");
  }

  return (
    <span
      onMouseEnter={blink}
      className={clsx("block", className)}
      style={{ padding: pad, marginLeft: opticalShift }}
    >
      <svg
        aria-hidden="true"
        width={width}
        height={height}
        viewBox="0 0 520 140"
        className="block"
      >
        <image
          href={`/logos/wordmark-horizontal-${dark ? "dark" : "light"}.svg`}
          x={0}
          y={0}
          width={520}
          height={140}
        />
        {/* Same geometry as the lockup files: nested 90px caret at (30,25). */}
        <g transform="translate(30,25) scale(0.9)">
          <polyline
            points="20,62 50,30 80,62"
            fill="none"
            stroke={ink}
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect ref={blockRef} className="ctl-cursor-settle" x={44} y={76} width={12} height={10} fill={ink} />
        </g>
      </svg>
    </span>
  );
}
