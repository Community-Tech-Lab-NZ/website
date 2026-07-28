import { clsx } from "clsx";
import { INK_LEFT } from "./Logo";

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
 * exact), the caret polyline, and a separate <rect> for the block. Everything
 * except the motion matches Logo with align="optical" pixel for pixel: same
 * clear-space padding, same optical margin from INK_LEFT.
 *
 * Entirely CSS-driven — no client JS, no event handlers, and reduced motion
 * stills both pieces through the usual media block.
 *
 * Header only. The footer keeps the static Logo; two blinking marks on one
 * page would be a tic, not a brand.
 */

type AnimatedLockupProps = {
  dark?: boolean;
  className?: string;
};

export function AnimatedLockup({ dark = false, className }: AnimatedLockupProps) {
  const ink = dark ? "var(--ctl-kowhai)" : "var(--ctl-ink)";

  /* Sizing lives in CSS so it can be responsive: --header-lockup is 44px on
     phones and 68px from md (see components.css — the 68px header overflowed
     small viewports). Padding is the scaled clear space and the negative
     margin is the optical pull-left, both derived from the same variable;
     0.3171 is INK_LEFT.horizontal / 140, kept in JS so the constant stays
     single-sourced. */
  const opticalShift = `calc(-1 * (var(--lockup-pad) + var(--header-lockup) * ${(
    INK_LEFT.horizontal / 140
  ).toFixed(4)}))`;

  return (
    <span
      className={clsx("ctl-lockup block", className)}
      style={{ padding: "var(--lockup-pad)", marginLeft: opticalShift }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 520 140"
        className="block w-auto"
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
        <g transform="translate(30,25) scale(0.9)">
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
          <rect className="ctl-lockup-block" x={44} y={76} width={12} height={10} fill={ink} />
        </g>
      </svg>
    </span>
  );
}
