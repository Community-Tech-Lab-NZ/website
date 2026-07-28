"use client";

import { clsx } from "clsx";
import { Caret } from "./Caret";
import { useRiseOnScroll } from "@/hooks/useRiseOnScroll";

/* Programme timeline. Space Mono dates, caret nodes on a hairline spine.
 *
 * `done` renders a gold node. The spine is suppressed on the final step so the
 * line terminates at the last node rather than trailing past it.
 *
 * On entry the spine segments draw downward and the nodes then fade in as one
 * group — two phases, not a per-item cascade. The component observes itself
 * (same hook as SectionRule) so it still animates when used outside a Reveal,
 * and never strands itself invisible.
 */

export type TimelineStep = {
  date: string;
  label: string;
  done?: boolean;
};

type TimelineProps = {
  steps: TimelineStep[];
  inverse?: boolean;
  className?: string;
};

export function Timeline({ steps, inverse = false, className }: TimelineProps) {
  const ref = useRiseOnScroll<HTMLOListElement>();

  return (
    <ol ref={ref} className={clsx("ctl-focus-list m-0 list-none p-0", className)}>
      {steps.map((step, i) => {
        const last = i === steps.length - 1;

        return (
          <li
            key={`${step.date}-${step.label}`}
            className="grid grid-cols-[var(--timeline-column)_1fr] gap-4"
          >
            <div className="grid grid-rows-[auto_1fr] justify-items-center">
              <Caret
                size={9}
                thickness={2}
                color={step.done ? "var(--ctl-kowhai)" : "var(--ctl-fern)"}
                className="ctl-node-fade mt-[var(--timeline-node-offset)]"
              />
              <span
                className={clsx(
                  "ctl-spine-draw mt-[var(--timeline-spine-offset)] w-px",
                  last
                    ? "bg-transparent"
                    : inverse
                      ? "bg-hairline-inverse"
                      : "bg-hairline",
                )}
              />
            </div>

            <div className={clsx(!last && "pb-5")}>
              <div
                className={clsx(
                  "font-meta text-body-sm font-bold tracking-meta",
                  inverse ? "text-kowhai" : "text-ink",
                )}
              >
                {step.date}
              </div>
              <div
                className={clsx(
                  "mt-px font-sans text-body-md",
                  inverse ? "text-body-inverse" : "text-body",
                )}
              >
                {step.label}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
