"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";

/* Typed-on text with a resting block cursor.
 *
 * MOTION OVERRIDE 2 (see the register in tokens/utilities.css): the headline
 * types on once, the cursor blinks three times, then everything rests. The
 * brand mark is a text cursor, so a headline that was visibly typed is the
 * mark's story told once, not a gimmick on repeat.
 *
 * Three layers, each doing one job:
 *   - an sr-only span with the full text: what screen readers and crawlers
 *     get, immediately and stably, while the visual text churns
 *   - an invisible ghost reserving the final layout, so typing causes zero
 *     layout shift and the block after it never moves
 *   - the aria-hidden visual layer that actually types
 *
 * The server renders the full text, so no-JS visitors and the first paint see
 * the finished headline; hydration starts the typing. Reduced motion skips the
 * effect entirely — full text, resting cursor, nothing moves. This is the
 * repo's first piece of JS-driven motion, which is why it checks matchMedia
 * itself instead of relying on the token zeroing.
 */

type TypeOnProps = {
  text: string;
  /** Milliseconds per character. */
  speed?: number;
  className?: string;
};

export function TypeOn({ text, speed = 32, className }: TypeOnProps) {
  // -1 means "show everything": server render, reduced motion, or pre-effect.
  const [count, setCount] = useState(-1);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // All setState happens inside the interval, never synchronously in the
    // effect body; the full server-rendered text stays up until the first
    // tick, one character in.
    let c = 0;
    const id = setInterval(() => {
      c += 1;
      if (c > text.length) {
        clearInterval(id);
        return;
      }
      setCount(c);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);

  const done = count < 0 || count >= text.length;

  return (
    <span className={clsx("grid", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="invisible col-start-1 row-start-1">
        {text}
      </span>
      <span aria-hidden="true" className="col-start-1 row-start-1">
        {count < 0 ? text : text.slice(0, count)}
        <span
          className={clsx(
            "ml-[0.06em] inline-block h-[0.78em] w-[0.44em] translate-y-[0.08em] bg-current",
            done && count >= 0 && "ctl-cursor-settle",
          )}
        />
      </span>
    </span>
  );
}
