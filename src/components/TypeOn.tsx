"use client";

import { useEffect, useState } from "react";
import { clsx } from "clsx";
import { prefersReducedMotion } from "@/lib/motion";

/* Typed-on text with a block cursor.
 *
 * MOTION OVERRIDE 2 (see the register in tokens/utilities.css). With `loop`
 * the headline types, rests with a blinking cursor for a long beat, deletes
 * itself and types again — a text cursor doing what text cursors do. The
 * unhurried rest is most of each cycle, so the page reads as calm with a
 * heartbeat rather than busy.
 *
 * The cadence is deliberately not constant. Typing carries a fixed jitter
 * pattern (not Math.random: the same text always types the same way), pauses
 * to settle after each word, and leans on the first keystroke of a cycle.
 * Deleting is a held backspace key: the first few characters go slowly, then
 * the repeat rate kicks in and accelerates. Constant-rate typing is what
 * makes a fake typewriter feel fake.
 *
 * The visual layer renders the FULL text always, with the untyped remainder
 * invisible rather than absent. Wrap points therefore never move while the
 * text appears — the fix for mobile, where growing text used to hop between
 * lines as words completed. The cursor is absolutely positioned from a
 * zero-width anchor at the boundary, so it adds no width and cannot disturb
 * the wrapping either. An sr-only span gives screen readers and crawlers the
 * text immediately and stably.
 *
 * Holding that promise takes two things beyond zero width, both of which only
 * ever showed on phones, where the headline is the one place it wraps:
 *
 *   1. The anchor must not be an atomic inline. A line can break either side
 *      of an inline-block, so an inline-block anchor hands the browser a break
 *      opportunity that travels with the cursor: mid-word breaks that walk one
 *      letter per keystroke, and a cursor that teleports to the start of the
 *      next line while its word is still on this one.
 *   2. The headline breaks greedily rather than inheriting `text-wrap: pretty`.
 *      Pretty's scoring reads the inline structure, so it broke the split text
 *      in one place and the finished text — one text node, no split — in
 *      another, re-wrapping the headline every time a cycle finished or
 *      started. Greedy breaking asks only how wide the words are, which is the
 *      same question all cycle, so the break holds still. It lands where the
 *      finished headline already sat, so nothing about the resting line looks
 *      different; balance was the other candidate and moves it.
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
const EMPTY_PAUSE_MS = 500;

/* Per-character rhythm, cycled by position. Averages ~1. */
const JITTER = [1, 0.8, 1.25, 0.9, 1.1, 0.7, 1.3, 0.85, 1.05, 0.95];

/** Delay before typing the character at `index`. */
function typeDelay(index: number, text: string, base: number) {
  if (index === 0) return 350; // finding the first key
  let d = base * JITTER[index % JITTER.length];
  if (text[index - 1] === " ") d += 140; // settling into the next word
  return d;
}

/** Held backspace: slow singles, then the key repeat takes over. */
function deleteDelay(removed: number) {
  return removed < 3 ? 130 : Math.max(24, 110 - removed * 12);
}

type Phase = "typing" | "resting" | "deleting";

export function TypeOn({ text, speed = 52, loop = false, className }: TypeOnProps) {
  // -1 means "show everything": server render, reduced motion, or pre-effect.
  const [count, setCount] = useState(-1);
  const [phase, setPhase] = useState<Phase>("typing");

  useEffect(() => {
    if (prefersReducedMotion()) return;

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
        schedule(type, typeDelay(c, text, speed));
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
        schedule(erase, deleteDelay(text.length - c));
      } else {
        setPhase("typing");
        schedule(type, EMPTY_PAUSE_MS);
      }
    };

    schedule(type, typeDelay(0, text, speed));
    return () => clearTimeout(timer);
  }, [text, speed, loop]);

  const done = count < 0 || count >= text.length;

  const shown = count < 0 ? text.length : count;

  return (
    <span className={clsx("block text-wrap [--type-cursor-em:1em]", className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.slice(0, shown)}
        {/* Zero-size anchor: the cursor hangs off it without occupying any
            inline space, so wrap points stay exactly where the finished
            headline puts them. `font-size: 0` is what makes it zero-size, and
            it is doing two jobs at once. An inline box's bottom edge is the
            descender line, so at any other font size the cursor would hang a
            full descent (0.21em in Archivo) below the text; with no font there
            is no descent, and the box sits on the baseline the drop token is
            measured from. And it stays a plain inline while doing it, so it
            adds no break opportunity — an inline-block would sit on the
            baseline too, and break the line at the cursor.

            The cursor takes its em back from --type-cursor-em, which the
            headline captured before the anchor zeroed it out. */}
        <span className="relative [font-size:0]">
          <span
            className={clsx(
              "absolute bottom-[calc(-1*var(--type-cursor-drop))] left-[var(--type-cursor-gap)] h-[var(--type-cursor-h)] w-[var(--type-cursor-w)] bg-current [font-size:var(--type-cursor-em)]",
              // One-shot: settle and rest. Looping: blink through the rest
              // phase, solid while typing or deleting.
              done && count >= 0 && !loop && "ctl-cursor-settle",
              loop && phase === "resting" && "ctl-cursor-blink",
            )}
          />
        </span>
        <span className="invisible">{text.slice(shown)}</span>
      </span>
    </span>
  );
}
