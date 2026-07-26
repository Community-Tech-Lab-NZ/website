import { clsx } from "clsx";

/* The caret from the mark, redrawn in CSS as a structural marker.
 *
 * This is the brand's ONLY glyph. The handoff is explicit that no icon set
 * exists in this brand and none was invented, so anywhere a UI affordance needs
 * a symbol — list bullets, timeline nodes, the mobile nav toggle — it uses this
 * rather than reaching for an icon library.
 *
 * Size and thickness are numeric props rather than tokens because callers scale
 * the mark to its context; the caret-mark utility in globals.css carries the
 * static border geometry.
 */

const ROTATION = {
  up: "-45deg",
  right: "45deg",
  down: "135deg",
  left: "225deg",
} as const;

type CaretProps = {
  size?: number;
  color?: string;
  thickness?: number;
  direction?: keyof typeof ROTATION;
  className?: string;
  style?: React.CSSProperties;
};

export function Caret({
  size = 10,
  color = "var(--ctl-kowhai)",
  thickness = 2,
  direction = "up",
  className,
  style,
}: CaretProps) {
  return (
    <span
      aria-hidden="true"
      className={clsx("caret-mark shrink-0", className)}
      style={{
        width: size,
        height: size,
        borderColor: color,
        borderWidth: `${thickness}px ${thickness}px 0 0`,
        transform: `rotate(${ROTATION[direction]})`,
        ...style,
      }}
    />
  );
}
