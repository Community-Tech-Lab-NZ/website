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

export function Drift({
  preset = "hero",
  onLight = false,
}: {
  preset?: keyof typeof PRESETS;
  /** Ink-tinted glyphs for Oat surfaces (the sub-page heroes). */
  onLight?: boolean;
}) {
  const { items, variant } = PRESETS[preset];

  return (
    <div aria-hidden="true" className="ctl-drift-layer">
      {items.map((d, i) => (
        <span
          key={i}
          className={`ctl-drift ${variant}${onLight ? " ctl-drift--ink" : ""}`}
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            animationDelay: `${d.delay}ms`,
            animationDuration: `${d.duration}ms`,
            animationIterationCount: "infinite",
          }}
        />
      ))}
    </div>
  );
}
