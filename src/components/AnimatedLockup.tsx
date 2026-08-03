"use client";

import { useRef } from "react";
import { clsx } from "clsx";
import { INK_BOX } from "./Logo";
import { hoverCapable, prefersReducedMotion } from "@/lib/motion";

/* The header lockup, alive.
 *
 * MOTION OVERRIDE 1 (see the register in tokens/utilities.css), in its second
 * form after the owner slowed it down twice: the caret blinks like an eye on
 * a slow loop — the APEX DESCENDS until the angle flattens to a line and
 * rises again, legs pivoting at their feet exactly as an eyelid closes. Not a
 * squash: a scale transform thins the stroke and reads as the glyph receding,
 * which is what the owner rejected. The closure takes ~720ms, holds shut a
 * beat, reopens over ~720ms, once every eight seconds.
 *
 * The point animation is SMIL (<animate attributeName="points">), the one
 * mechanism that can move polyline geometry with no JS in every browser.
 * SMIL cannot hear prefers-reduced-motion, so the markup carries an animated
 * and a static caret and the ctl-motion-only / ctl-still-only classes swap
 * them under the media query.
 *
 * Hovering the lockup makes the cursor block breathe, a gentle fade out and
 * back that runs only while the pointer stays.
 *
 * Construction: the static lockup files are single flat SVGs, so their parts
 * cannot be animated. This inline SVG rebuilds the same 520x140 geometry from
 * three layers — the wordmark-only file (same canvas, so registration is
 * exact), the caret polyline, and a separate <rect> for the block. It then
 * shows only the ink box of that canvas, the way Logo does with crop, and
 * lines the result up with the text column below it — see the note on the
 * viewBox further down for why cropping is what makes the alignment simple.
 *
 * The blink is CSS/SMIL; the breathe needs three small handlers so that when
 * the pointer leaves mid-breath, the cycle in progress completes and stops at
 * its iteration boundary (opacity back at 1) instead of snapping. Reduced
 * motion stills everything through the usual media block.
 *
 * Used in the header and, at the owner's request, the footer — where it
 * replaces the static primary lockup. The two blink out of phase (the footer
 * starts its cycle four seconds later), so the page never winks with both
 * eyes at once.
 */

type AnimatedLockupProps = {
  dark?: boolean;
  /** CSS length overriding the responsive --header-lockup height. */
  size?: string;
  /** SMIL begin offset for the blink, to de-phase multiple lockups. */
  blinkOffset?: string;
  /** Mark only: the big house-caret and its block, no wordmark. The footer
   *  wears this large — the owner missed the old primary lockup's caret. */
  mark?: boolean;
  className?: string;
};

export function AnimatedLockup({
  dark = false,
  size,
  blinkOffset,
  mark = false,
  className,
}: AnimatedLockupProps) {
  const ink = dark ? "var(--ctl-kowhai)" : "var(--ctl-ink)";

  /* Sizing lives in CSS so it can be responsive, and --header-lockup is the
     height of the VISIBLE MARK rather than of the file (see components.css).

     That distinction is the whole point. The wordmark artboard is 520x140 and
     its ink occupies 297.5x63.5 of it, so 43% of the file is empty canvas — a
     third of it in a band down the right-hand side. Rendering the artboard
     whole made that band part of the lockup's footprint: the header reserved
     width for nothing, the mark came out 45% smaller than the row allowed, and
     there was a permanent gap between the wordmark and the Apply button that no
     amount of sizing arithmetic could close, because the arithmetic was sizing
     the emptiness too.

     So the viewBox is the ink box, not the file. Same idea as Logo's `crop`,
     and INK_BOX is imported from it so this artwork is measured in one place.
     The <image> below still places the file whole at its own coordinates; the
     viewBox is simply a narrower window onto it.

     Cropping also retires the optical pull-left. That existed to cancel the
     file's own left margin so the caret landed on the page's content edge. With
     the ink box as the viewBox there is no left margin left to cancel, and the
     only thing displacing the mark is the clear-space padding — so the negative
     margin is now exactly that, and the alignment is unchanged. */
  const inkBox = INK_BOX.horizontal;
  const opticalShift = "calc(-1 * var(--lockup-pad))";

  const blockRef = useRef<SVGRectElement>(null);

  /* Graceful breathe: entering starts it; leaving only FLAGS it to stop, and
     the animationiteration handler removes the class at the next cycle
     boundary, where opacity is back at 1 — so a breath in progress always
     completes instead of snapping.

     THAT DESIGN IS WHY THIS NEEDS GUARDING, and it is the worst case of it on
     the site. The animation is infinite, and the only thing that ever removes
     the class is an animationiteration that follows a real mouseleave. Neither
     is reliable:

       - On touch, the browser synthesises a mouseenter after touchend for
         compatibility, so a TAP starts the breathing — but the matching
         mouseleave may never arrive. The lockup is inside a Link in both the
         header and the footer, so it is tapped often, and the footer mark is
         up to 200px. A tapped logo could breathe forever.
       - Under reduced motion the CSS sets animation:none, so there are no
         iterations at all and the class, once added, is permanent.

     Both are answered before the class goes on rather than after. */
  function breatheStart() {
    if (prefersReducedMotion() || !hoverCapable()) return;
    const b = blockRef.current;
    if (!b) return;
    delete b.dataset.stop;
    b.classList.add("is-breathing");
  }
  function breatheStop() {
    const b = blockRef.current;
    if (!b) return;
    // Belt and braces for the case above: if nothing is actually animating,
    // there is no iteration coming to clear the flag, so clear it now.
    if (b.getAnimations().length === 0) {
      b.classList.remove("is-breathing");
      delete b.dataset.stop;
      return;
    }
    b.dataset.stop = "1";
  }
  function breatheIteration() {
    const b = blockRef.current;
    if (b?.dataset.stop) {
      b.classList.remove("is-breathing");
      delete b.dataset.stop;
    }
  }

  const caretAndBlock = (
    <>
      <polyline
            className="ctl-motion-only"
            points="20,62 50,30 80,62"
            fill="none"
            stroke={ink}
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <animate
              attributeName="points"
              dur="8s"
              begin={blinkOffset}
              repeatCount="indefinite"
              values="20,62 50,30 80,62; 20,62 50,30 80,62; 20,62 50,60 80,62; 20,62 50,60 80,62; 20,62 50,30 80,62; 20,62 50,30 80,62"
              keyTimes="0;0.7;0.79;0.83;0.92;1"
              calcMode="spline"
              keySplines="0 0 1 1;0.22 0.61 0.36 1;0 0 1 1;0.22 0.61 0.36 1;0 0 1 1"
            />
          </polyline>
          <polyline
            className="ctl-still-only"
            points="20,62 50,30 80,62"
            fill="none"
            stroke={ink}
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
      <rect
        ref={blockRef}
        onAnimationIteration={breatheIteration}
        className="ctl-lockup-block"
        x={44}
        y={76}
        width={12}
        height={10}
        fill={ink}
      />
    </>
  );

  if (mark) {
    return (
      <span
        onMouseEnter={breatheStart}
        onMouseLeave={breatheStop}
        className={clsx("ctl-lockup block", className)}
        style={{
          padding: "var(--lockup-pad)",
          ...(size ? ({ "--header-lockup": size } as React.CSSProperties) : null),
        }}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          className="block w-auto"
          style={{ height: "var(--header-lockup)" }}
        >
          {caretAndBlock}
        </svg>
      </span>
    );
  }

  return (
    <span
      onMouseEnter={breatheStart}
      onMouseLeave={breatheStop}
      className={clsx("ctl-lockup block", className)}
      style={{
        padding: "var(--lockup-pad)",
        marginLeft: opticalShift,
        ...(size ? ({ "--header-lockup": size } as React.CSSProperties) : null),
      }}
    >
      <svg
        aria-hidden="true"
        viewBox={`${inkBox.x} ${inkBox.y} ${inkBox.w} ${inkBox.h}`}
        // max-w-full is what makes the header's "the lockup is the one element
        // that gives" contract true (see SiteHeader). Without it this svg holds
        // its intrinsic width whatever the row does, and the shortfall lands on
        // a tap target instead. With it, a row that runs short simply renders a
        // smaller mark. Insurance rather than routine: at every width the
        // wordmark actually appears at, it has room.
        className="block w-auto max-w-full"
        style={{ height: "var(--header-lockup)" }}
      >
        <image
          href={`/logos/wordmark-horizontal-${dark ? "dark" : "light"}.svg`}
          x={0}
          y={0}
          width={520}
          height={140}
        />
        {/* Same geometry as the lockup files: nested 90px caret at (30,25). */}
        <g transform="translate(30,25) scale(0.9)">{caretAndBlock}</g>
      </svg>
    </span>
  );
}
