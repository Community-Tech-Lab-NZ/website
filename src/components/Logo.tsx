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
 * `primary` is deliberately null. Its wordmark is centred under the caret, so
 * its leftmost ink is the edge of a centred line — a stable number now that
 * the text is outlined, but a centred lockup has no business being optically
 * left-aligned to a text column, so no value is offered.
 */
const INK_LEFT = { horizontal: 44.4, primary: null, icon: 16 } as const;

/* The full ink box within each artboard, in viewBox units, for `crop`.
 *
 * The primary lockup is the reason this exists: its artwork occupies 201.5 of
 * 360 units vertically, so 44% of that file is empty. Rendered at a 150px box
 * the visible mark was only 107px, and simply setting a bigger height would
 * have grown the empty margin at the same rate — a mark twice the size would
 * have needed a 384px box.
 *
 * With `crop` the `height` prop means the height of the visible mark rather
 * than the height of the file, so the box tracks the artwork.
 *
 * Measured the same way as INK_LEFT: rasterise, scan for non-background pixels.
 * These values are stable now: the lockup files carry the wordmark as outlined
 * Archivo Black paths rather than <text>, so nothing in them depends on which
 * fonts a machine has installed. Re-measure only if the lockup files change.
 */
const INK_BOX = {
  horizontal: { x: 44, y: 43, w: 297.5, h: 63.5 },
  primary: { x: 148.5, y: 71.5, w: 224.5, h: 201 },
  icon: { x: 16, y: 26, w: 68, h: 60 },
} as const;

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
  /**
   * Trim the artboard's empty margin. With this on, `height` is the height of
   * the visible mark rather than of the file. Clear space then has to come from
   * the surrounding layout, so `clearSpace` is ignored.
   */
  crop?: boolean;
  className?: string;
  priority?: boolean;
};

export function Logo({
  variant = "horizontal-light",
  height = 40,
  clearSpace = true,
  align = "box",
  crop = false,
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

  if (crop) {
    /* Scale so the ink box is `height` tall, then show only that window of the
       file. The file itself still renders whole; overflow hides the margin. */
    const box = INK_BOX[family];
    const scale = height / box.h;

    return (
      <span
        className={clsx("block overflow-hidden", className)}
        style={{ width: box.w * scale, height: box.h * scale }}
      >
        <img
          src={`/logos/${LOGO_FILES[variant]}`}
          alt="Community Tech Lab"
          width={Math.round(view.w * scale)}
          height={Math.round(view.h * scale)}
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : undefined}
          className="block max-w-none"
          style={{
            width: view.w * scale,
            height: view.h * scale,
            marginLeft: -box.x * scale,
            marginTop: -box.y * scale,
          }}
        />
      </span>
    );
  }

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
