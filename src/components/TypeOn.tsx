"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";

/* Typed-on text with a block cursor.
 *
 * MOTION OVERRIDE 2 (see the register in tokens/utilities.css). With `loop`
 * the headline types, rests with a blinking cursor for a long beat, deletes
 * itself and types again — a text cursor doing what text cursors do. The
 * unhurried rest is most of each cycle, so the page reads as calm with a
 * heartbeat rather than busy.
 *
 * Three layers, each doing one job:
 *   - an sr-only span with the full text: what screen readers and crawlers
 *     get, immediately and stably, while the visual text churns
 *   - an invisible ghost reserving the final layout, so typing causes zero
 *     layout shift and the block after it never moves
 *   - the aria-hidden visual layer that actually types
 *
 * The server renders the full text, so no-JS visitors and the first paint see
 * the finished headline; hydration starts the cycle. Reduced motion skips
 * everything — full text, resting cursor, nothing moves — and the loop holds
 * its breath while the tab is hidden rather than churning in the background.
 */

type TypeOnProps = {
  text: string;
  /** Milliseconds per character while typing. */
  speed?: number;
  /** Retype forever: type, rest, delete, repeat. */
  loop?: boolean;
  className?: string;
};

const REST_MS = 6500;
const DELETE_SPEED = 20;
const EMPTY_PAUSE_MS = 500;

type Phase = "typing" | "resting" | "deleting";

export function TypeOn({ text, speed = 34, loop = false, className }: TypeOnProps) {
  // -1 means "show everything": server render, reduced motion, or pre-effect.
  const [count, setCount] = useState(-1);
  const [phase, setPhase] = useState<Phase>("typing");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let c = 0;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = (fn: () => void, ms: number) => {
      timer = setTimeout(() => {
        // Hold position while the tab is hidden; check again in a moment.
        if (document.hidden) schedule(fn, 400);
        else fn();
      }, ms);
    };

    const type = () => {
      c += 1;
      setCount(c);
      if (c < text.length) {
        schedule(type, speed);
      } else if (loop) {
        setPhase("resting");
        schedule(startDelete, REST_MS);
      }
    };
    const startDelete = () => {
      setPhase("deleting");
      erase();
    };
    const erase = () => {
      c -= 1;
      setCount(c);
      if (c > 0) {
        schedule(erase, DELETE_SPEED);
      } else {
        setPhase("typing");
        schedule(type, EMPTY_PAUSE_MS);
      }
    };

    schedule(type, speed);
    return () => clearTimeout(timer);
  }, [text, speed, loop]);

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
            "ml-[var(--type-cursor-gap)] inline-block h-[var(--type-cursor-h)] w-[var(--type-cursor-w)] translate-y-[var(--type-cursor-drop)] bg-current",
            // One-shot: settle and rest. Looping: blink through the rest
            // phase, solid while typing or deleting.
            done && count >= 0 && !loop && "ctl-cursor-settle",
            loop && phase === "resting" && "ctl-cursor-blink",
          )}
        />
      </span>
    </span>
  );
}
