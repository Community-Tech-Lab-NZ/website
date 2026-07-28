/* eslint-disable @next/next/no-img-element */
import { clsx } from "clsx";

/* Logo C, "The Caret".
 *
 * Horizontal lockup for headers, primary lockup for footers and heroes, icon
 * alone below 16px. Clear space equals the cursor-block height on all sides.
 *
 * Brand rules: Ink or Kowhai gold only, never stretched, never recoloured off
 * palette, and never with a drop shadow.
 *
 * Plain <img> rather than next/image: these are SVGs, so there is nothing for
 * the raster pipeline to optimise. Intrinsic dimensions come from each file's
 * viewBox and are declared here so the browser reserves the right box and the
 * lockup causes no layout shift.
 */

const LOGO_FILES = {
  "horizontal-light": "lockup-horizontal-light-bg.svg",
  "horizontal-dark": "lockup-horizontal-dark-bg.svg",
  "horizontal-transparent": "lockup-horizontal-transparent.svg",
  "primary-light": "lockup-primary-light-bg.svg",
  "primary-dark": "lockup-primary-dark-bg.svg",
  "primary-transparent": "lockup-primary-transparent.svg",
  "icon-ink": "icon-ink.svg",
  "icon-kowhai": "icon-kowhai.svg",
  "icon-white": "icon-white.svg",
} as const;

// Intrinsic dimensions, from each file's viewBox.
const VIEWBOX = {
  horizontal: { w: 520, h: 140 },
  primary: { w: 520, h: 360 },
  icon: { w: 100, h: 100 },
} as const;

/* Distance from the viewBox's left edge to the first painted pixel, in viewBox
 * units — the whitespace the artboard carries inside itself.
 *
 * This is why `align="optical"` exists. The horizontal lockup's caret begins
 * 44.4 units into a 520-unit-wide box: 30 units of artboard margin, plus the
 * 14.4 the caret is inset within its own 90-unit group. Rendered at 56px tall
 * that is 17.8px of nothing. Line the <img> box up with a text column and the
 * logo looks indented by exactly that much, which is what it was doing in the
 * header.
 *
 * Verified by rasterising each file at 4x and scanning for the first column
 * that is not the background fill, not by reading the markup — the round
 * linecap on the caret's stroke extends it half a stroke-width further left
 * than its coordinates suggest.
 *
 * `primary` is deliberately null. Its wordmark is `text-anchor="middle"`, so
 * the leftmost ink is the end of a centred line of text and moves with the
 * font's metrics. There is no stable value to hard-code, and a centred lockup
 * has no business being left-aligned to a text column anyway.
 */
const INK_LEFT = { horizontal: 44.4, primary: null, icon: 16 } as const;

export type LogoVariant = keyof typeof LOGO_FILES;

type LogoProps = {
  variant?: LogoVariant;
  /** Rendered height in px. Below 16px use an icon variant, per the brand rules. */
  height?: number;
  clearSpace?: boolean;
  /**
   * `box` aligns the file's edge, `optical` aligns the first painted pixel.
   * Use `optical` anywhere the logo shares a left edge with text.
   */
  align?: "box" | "optical";
  className?: string;
  priority?: boolean;
};

export function Logo({
  variant = "horizontal-light",
  height = 40,
  clearSpace = true,
  align = "box",
  className,
  priority = false,
}: LogoProps) {
  const family = variant.startsWith("icon")
    ? "icon"
    : variant.startsWith("primary")
      ? "primary"
      : "horizontal";

  const view = VIEWBOX[family];
  const width = Math.round(height * (view.w / view.h));

  // Clear space equals the cursor-block height, scaled with the mark.
  const pad = clearSpace ? Math.max(8, Math.round(height * (family === "icon" ? 0.2 : 0.14))) : 0;

  /* Pull the box left by everything that sits before the first painted pixel:
     the clear-space padding, plus the artboard's own margin scaled to the
     rendered size. The clear space is not lost, it just overhangs into the page
     gutter, which is empty by definition. */
  const inkLeft = INK_LEFT[family];
  const opticalShift =
    align === "optical" && inkLeft !== null ? -(pad + inkLeft * (height / view.h)) : 0;

  return (
    <img
      src={`/logos/${LOGO_FILES[variant]}`}
      alt="Community Tech Lab"
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      className={clsx("block h-auto box-content", className)}
      style={{ height, width, padding: pad, marginLeft: opticalShift || undefined }}
    />
  );
}
