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

// Intrinsic aspect ratios, from each file's viewBox.
const RATIO = { horizontal: 520 / 140, primary: 520 / 360, icon: 1 } as const;

export type LogoVariant = keyof typeof LOGO_FILES;

type LogoProps = {
  variant?: LogoVariant;
  /** Rendered height in px. Below 16px use an icon variant, per the brand rules. */
  height?: number;
  clearSpace?: boolean;
  className?: string;
  priority?: boolean;
};

export function Logo({
  variant = "horizontal-light",
  height = 40,
  clearSpace = true,
  className,
  priority = false,
}: LogoProps) {
  const family = variant.startsWith("icon")
    ? "icon"
    : variant.startsWith("primary")
      ? "primary"
      : "horizontal";

  const width = Math.round(height * RATIO[family]);

  // Clear space equals the cursor-block height, scaled with the mark.
  const pad = clearSpace ? Math.max(8, Math.round(height * (family === "icon" ? 0.2 : 0.14))) : 0;

  return (
    <img
      src={`/logos/${LOGO_FILES[variant]}`}
      alt="Community Tech Lab"
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      className={clsx("block h-auto box-content", className)}
      style={{ height, width, padding: pad }}
    />
  );
}
