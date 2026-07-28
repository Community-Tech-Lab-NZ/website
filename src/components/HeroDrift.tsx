/* Hero ambient layer: faint carets drifting upward.
 *
 * MOTION OVERRIDE 3 (see the register in tokens/utilities.css): the closest
 * this site comes to "particles", translated into the brand's own glyph. The
 * carets rise the way the entry motion rises and the way the mark points.
 *
 * Bounds that keep it an accent rather than a screensaver:
 *   - fourteen carets, none above 16% opacity (--ctl-oat-16)
 *   - every delay + duration x count below five seconds, so the layer is
 *     completely still before the WCAG 2.2.2 line — it performs once on
 *     arrival and then gets out of the way
 *   - display:none under prefers-reduced-motion, not paused mid-air
 *   - aria-hidden, pointer-events:none, behind the content
 *
 * Positions are a hardcoded constellation rather than Math.random: render
 * purity aside, a randomised scatter reads worse than a composed one more
 * often than not.
 */

type Drifter = {
  left: string;
  top: string;
  size: number;
  delay: number;
  duration: number;
  count: number;
};

// delay + duration * count <= 5000 for every row.
const DRIFTERS: Drifter[] = [
  { left: "4%", top: "78%", size: 9, delay: 300, duration: 2300, count: 2 },
  { left: "11%", top: "62%", size: 12, delay: 900, duration: 4000, count: 1 },
  { left: "19%", top: "84%", size: 8, delay: 0, duration: 2400, count: 2 },
  { left: "27%", top: "70%", size: 11, delay: 1400, duration: 3500, count: 1 },
  { left: "36%", top: "88%", size: 9, delay: 600, duration: 2100, count: 2 },
  { left: "44%", top: "64%", size: 13, delay: 200, duration: 4600, count: 1 },
  { left: "53%", top: "80%", size: 8, delay: 1100, duration: 1900, count: 2 },
  { left: "61%", top: "72%", size: 10, delay: 500, duration: 4300, count: 1 },
  { left: "69%", top: "86%", size: 9, delay: 1600, duration: 3300, count: 1 },
  { left: "76%", top: "66%", size: 12, delay: 0, duration: 2400, count: 2 },
  { left: "83%", top: "82%", size: 8, delay: 800, duration: 4100, count: 1 },
  { left: "89%", top: "74%", size: 11, delay: 1200, duration: 3700, count: 1 },
  { left: "94%", top: "60%", size: 9, delay: 400, duration: 2200, count: 2 },
  { left: "98%", top: "85%", size: 10, delay: 1000, duration: 3900, count: 1 },
];

export function HeroDrift() {
  return (
    <div aria-hidden="true" className="ctl-drift-layer">
      {DRIFTERS.map((d, i) => (
        <span
          key={i}
          className="ctl-drift"
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            animationDelay: `${d.delay}ms`,
            animationDuration: `${d.duration}ms`,
            animationIterationCount: d.count,
          }}
        />
      ))}
    </div>
  );
}
