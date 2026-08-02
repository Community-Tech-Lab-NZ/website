"use client";

import { clsx } from "clsx";
import { useTabIndicator } from "@/hooks/useTabIndicator";

/* The application's six stages as a vertical rail.
 *
 * This replaces a three-by-two grid of tabs. The grid showed all six labels but
 * never read as a sequence — nothing in it said whether 04 followed 03 or sat
 * under it — and a 2px underline on a 14px label, inside a strip that already
 * carried its own bottom border, was easy to lose. Top to bottom fixes the
 * order for free, and a full-width row gives the active stage somewhere to be
 * marked properly.
 *
 * Decisions:
 *  - The active mark is a 2px Kowhai LEFT border, following SiteHeader's mobile
 *    list, where a bottom border would read as a divider between rows.
 *  - It carries an Oat-sunk fill as well, so the whole row reads as selected
 *    rather than one highlighted word. Sunk is a tint of Oat that Card already
 *    uses, so no colour enters the system.
 *  - The state marks are the checkbox's own two halves, not a new icon set.
 *    Done is Checkbox's caret-derived tick (a 9x5 box rotated -45deg, two
 *    borders) in Fern; needs-attention is Checkbox's empty box in Kowhai, which
 *    is also the 2px Kowhai border every errored field wears. Both are
 *    structural rather than text, so the 4.5:1 rule does not apply to them.
 *    An up-caret was tried here first and was misread as an arrow pointing at
 *    the row — a list of rows is the one place the brand's glyph cannot go.
 *  - A stepper (nav + ol + aria-current="step"), not a tablist. What it
 *    controls is a section of one form, not a tabpanel, and a roving tabindex
 *    would make Tab skip five of the six stages.
 *  - Every stage stays reachable, whatever state the form is in. Validation
 *    guards the guided path through Next; it does not lock anyone in.
 *
 * Rendered twice — the desktop rail and the mobile panel — so the stages arrive
 * as props and stay owned by CommunityForm.
 */

/** What a stage row shows on its right.
 *  "none" is the resting state: a section nobody has opened yet says nothing,
 *  which is the whole point — see the marks comment in CommunityForm. */
export type StageMark = "none" | "done" | "attention";

type StageNavProps = {
  stages: readonly { id: string; label: string }[];
  current: number;
  marks: readonly StageMark[];
  onSelect: (index: number) => void;
  /** Attach the sliding bar. Off inside the mobile panel, which dismisses on
   *  select: the slide would never be seen, and a display:none strip measures
   *  every row at zero. There the per-row border is the whole indicator. */
  indicator?: boolean;
  className?: string;
};

export function StageNav({
  stages,
  current,
  marks,
  onSelect,
  indicator = false,
  className,
}: StageNavProps) {
  const { stripRef, barRef } = useTabIndicator<HTMLOListElement>(current, "y");

  return (
    <nav aria-label="Application sections" className={className}>
      <ol
        ref={indicator ? stripRef : undefined}
        className="ctl-tab-strip m-0 list-none border-l border-solid border-hairline p-0"
      >
        {stages.map((stage, i) => (
          <li key={stage.id}>
            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-current={current === i ? "step" : undefined}
              data-tab-active={current === i || undefined}
              className={clsx(
                // -ml-px overlaps the spine the way the old strip's -mb-px
                // overlapped its bottom border. The border class is the no-JS
                // fallback; ctl-tabs-live hands the mark to the bar.
                "ctl-tab-underline--vertical -ml-px flex min-h-[var(--tap-target)] w-full cursor-pointer items-center gap-3",
                "border-0 border-l-2 border-solid py-2 pl-4 pr-3 text-left",
                "font-heading text-body-sm font-bold",
                "transition-[color,background-color,border-color] duration-[var(--duration-base)] ease-brand",
                current === i
                  ? "border-l-kowhai bg-surface-sunk text-ink"
                  : "border-l-transparent bg-transparent text-muted hover:text-ink",
              )}
            >
              <span className="font-meta text-label tracking-[var(--tracking-step)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex-1">{stage.label}</span>
              <StageMarkGlyph mark={marks[i]} />
            </button>
          </li>
        ))}
        {indicator ? (
          <span
            ref={barRef}
            aria-hidden="true"
            className="ctl-tab-indicator ctl-tab-indicator--vertical"
          />
        ) : null}
      </ol>
    </nav>
  );
}

/* The two state marks, lifted from Checkbox rather than drawn fresh.
 *
 * Done is Checkbox's tick — the same 9x5 box rotated -45deg wearing a bottom
 * and left border — recoloured Fern, because here it sits on Oat rather than
 * inside a filled Fern box. Needs-attention is Checkbox's unticked box, in the
 * 2px Kowhai the form already uses to ring an errored field. Reading the pair
 * as "one is filled in, one is not" is exactly the intent.
 *
 * Both are aria-hidden with a text equivalent beside them: Kowhai on Oat is
 * 1.8:1 and Fern on Oat is 3.58:1, so neither may ever be the only carrier.
 */
function StageMarkGlyph({ mark }: { mark: StageMark }) {
  if (mark === "done") {
    return (
      <>
        <span aria-hidden="true" className="grid h-3 w-3 shrink-0 place-items-center">
          <span className="h-[var(--checkbox-tick-h)] w-[var(--checkbox-tick-w)] rotate-[-45deg] border-b-2 border-l-2 border-solid border-fern" />
        </span>
        <span className="sr-only">complete</span>
      </>
    );
  }

  if (mark === "attention") {
    return (
      <>
        <span
          aria-hidden="true"
          className="h-3 w-3 shrink-0 rounded-card border-2 border-solid border-kowhai"
        />
        <span className="sr-only">not finished</span>
      </>
    );
  }

  return null;
}
