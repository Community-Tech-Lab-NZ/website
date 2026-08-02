"use client";

import { clsx } from "clsx";
import { Caret } from "../Caret";
import { StageNav, type StageMark } from "./StageNav";
import { useDisclosure } from "@/hooks/useDisclosure";

/* The stage rail below lg, where there is no room for a column.
 *
 * Something has to give on a phone: six rows of nav is 288px before the first
 * field, on every one of the six sections. So the rail collapses to a bar that
 * still answers both questions at a glance — where am I (03 / 06, named), and
 * how far through am I (six marks, Fern once a section has everything it
 * needs) — and expands to the full list when someone wants to jump.
 *
 * The construction is SiteHeader's mobile nav, deliberately: a caret toggle
 * because the caret is this brand's only glyph, a panel dropping from the bar
 * rather than a sliding drawer so there is no scrim and no scroll-locking, and
 * Oat throughout. The two are worth keeping identical — they are the same
 * control, and an applicant meets both on the same screen — so the behaviour is
 * literally shared rather than merely matched: useDisclosure holds it, and
 * .ctl-drop holds the fold.
 *
 * Floating earns more here than it does in the header. In flow, expanding the
 * bar pushed the field you were about to answer down by six rows — on the one
 * screen where the whole point of opening the list is to look at something
 * WITHOUT losing your place.
 *
 * Sticky, which the site header is not: on a 50-minute form the section you are
 * in is worth a permanent 56px, and it means the jump list is one tap away from
 * the bottom of a long section rather than a scroll back to the top.
 */

type StageBarProps = {
  stages: readonly { id: string; label: string }[];
  current: number;
  marks: readonly StageMark[];
  onSelect: (index: number) => void;
};

export function StageBar({ stages, current, marks, onSelect }: StageBarProps) {
  // Escape, outside dismiss and the aria wiring are the header's, shared. The
  // outside dismiss earns the most here: what this panel covers is a form.
  const { open, close, rootRef, triggerProps, panelProps } =
    useDisclosure<HTMLDivElement>();
  const done = marks.filter((m) => m === "done").length;
  const attention = marks.filter((m) => m === "attention").length;

  return (
    /* -mx-gutter reaches past Section's inner padding so the bar spans the
       viewport edge to edge, then puts the padding back inside. */
    <div ref={rootRef} className="sticky top-0 z-10 -mx-gutter mt-6 bg-oat lg:hidden">
      {/* Two rows rather than one. On a 390px phone the stage name and the
          marks fought for the same line and both wrapped; stacked, the name
          gets the width it needs and the marks read as a progress row. */}
      <button
        {...triggerProps}
        className={clsx(
          "flex min-h-[var(--tap-target)] w-full cursor-pointer flex-col justify-center gap-1",
          "border-0 border-b-2 border-solid border-b-kowhai bg-transparent px-gutter py-2 text-left",
        )}
      >
        <span className="flex items-center gap-3">
          <span className="whitespace-nowrap font-meta text-label tracking-[var(--tracking-step)] text-muted">
            {String(current + 1).padStart(2, "0")} / {String(stages.length).padStart(2, "0")}
          </span>
          <span className="font-heading text-body-md font-bold text-ink">
            {stages[current].label}
          </span>
          <Caret
            direction={open ? "up" : "down"}
            size={12}
            thickness={2}
            color="var(--ctl-ink)"
            className="ml-auto transition-transform duration-[var(--duration-fast)] ease-brand"
          />
        </span>

        {/* Six marks, one per section. Too small for the tick and the ring the
            rail rows carry, so the same three states arrive as colour: Fern
            done, Kowhai still to finish, faint Ink not opened yet. The cursor
            block from the lockup is the brand's other shape and the 8px
            spacing base is derived from it, so a square is the right unit.
            Decoration only — the sr-only line below is the real version. */}
        <span aria-hidden="true" className="flex items-center gap-1">
          {stages.map((stage, i) => (
            <span
              key={stage.id}
              className={clsx(
                "h-2 w-2",
                marks[i] === "done"
                  ? "bg-fern"
                  : marks[i] === "attention"
                    ? "bg-kowhai"
                    : "bg-ink-16",
              )}
            />
          ))}
        </span>

        <span className="sr-only">
          {done} of {stages.length} sections complete
          {attention ? `, ${attention} still to finish` : ""}.{" "}
          {open ? "Hide all sections" : "Show all sections"}
        </span>
      </button>

      {/* No `relative` needed on the wrapper: position:sticky is already a
          positioned value, so it is the containing block for this. top-full
          therefore lands just under the toggle's Kowhai rule. The wrapper's
          own z-10 is the stacking context the panel's z-20 lives in, which is
          all it needs — that context as a whole already paints over the
          fields. */}
      <div
        {...panelProps}
        className="ctl-drop absolute inset-x-0 top-full z-20 border-b border-solid border-hairline bg-oat px-gutter pb-4 pt-2 shadow-dialog"
      >
        <StageNav
          stages={stages}
          current={current}
          marks={marks}
          onSelect={(i) => {
            close();
            onSelect(i);
          }}
        />
      </div>
    </div>
  );
}
