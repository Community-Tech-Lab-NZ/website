import { clsx } from "clsx";

/* The caret from the mark, as a structural marker.
 *
 * This is the brand's ONLY glyph. The handoff is explicit that no icon set
 * exists in this brand and none was invented, so anywhere a UI affordance needs
 * a symbol — list bullets, timeline nodes, the mobile nav toggle — it uses this
 * rather than reaching for an icon library.
 *
 * Second construction. The first was a rotated bordered square, which could
 * only "blink" by scale-squashing — and a squash reads as the glyph tilting
 * into depth, which the owner rejected for the logo and again here. This is
 * now the logo's own polyline (same 47° legs, round caps, scaled to fill the
 * box), and `wink` adds a dormant SMIL point animation: the apex descends to
 * the baseline and rises, legs pivoting at their feet, exactly the lockup's
 * eye. It runs only when something calls beginElement() on it (see winkEnter
 * in src/lib/knock.ts) — SMIL cannot hear prefers-reduced-motion, so the
 * trigger checks it instead, and `restart="whenNotActive"` stops a re-hover
 * from interrupting a blink in progress.
 *
 * The glyph paints in currentColor; `color` sets it on the svg, so contexts
 * can restyle it with text colour utilities.
 */

const ROTATION = {
  up: 0,
  right: 90,
  down: 180,
  left: 270,
} as const;

type CaretProps = {
  size?: number;
  color?: string;
  thickness?: number;
  direction?: keyof typeof ROTATION;
  /** Carry a dormant eye-blink, triggered via winkEnter on an ancestor. */
  wink?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export function Caret({
  size = 10,
  color = "var(--ctl-kowhai)",
  thickness = 2,
  direction = "up",
  wink = false,
  className,
  style,
}: CaretProps) {
  // Stroke thickness in viewBox units, so the rendered line weight matches
  // what the border construction gave the same props.
  const stroke = (thickness / size) * 100;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={clsx("caret-mark shrink-0", className)}
      style={{
        color,
        transform: direction === "up" ? undefined : `rotate(${ROTATION[direction]}deg)`,
        ...style,
      }}
    >
      <polyline
        points="11,68 50,26 89,68"
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {wink ? (
          <animate
            data-wink="true"
            attributeName="points"
            begin="indefinite"
            restart="whenNotActive"
            dur="700ms"
            values="11,68 50,26 89,68; 11,68 50,66 89,68; 11,68 50,26 89,68"
            keyTimes="0;0.45;1"
            calcMode="spline"
            keySplines="0.22 0.61 0.36 1;0.22 0.61 0.36 1"
          />
        ) : null}
      </polyline>
    </svg>
  );
}
