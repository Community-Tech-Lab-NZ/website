"use client";

import { clsx } from "clsx";
import { useRiseOnScroll } from "@/hooks/useRiseOnScroll";

/* Ported from the design handoff prototype.
 *
 * Tier-two motion (approved in review): the gold rule draws in horizontally as
 * the section enters, using the brand's own accent and its existing 420ms entry
 * timing. It is a scaleX from the left, not a new behaviour bolted on.
 *
 * Set `draw={false}` for rules used as plain separators inside a section, where
 * a drawing line would be noise rather than punctuation.
 */

const COLOUR = {
  gold: "border-t-kowhai",
  fern: "border-t-fern",
  hairline: "border-t-hairline",
  "hairline-inverse": "border-t-hairline-inverse",
} as const;

type SectionRuleProps = {
  variant?: keyof typeof COLOUR;
  angled?: boolean;
  draw?: boolean;
  className?: string;
};

export function SectionRule({
  variant = "gold",
  angled = false,
  draw = true,
  className,
}: SectionRuleProps) {
  const ref = useRiseOnScroll<HTMLElement>();
  const thick = variant === "gold" || variant === "fern";
  const animated = draw && thick;

  if (angled) {
    // A 48px inner rule rotated inside a 24px clipping window, overshooting the
    // width so the tilt reaches both edges.
    return (
      <div
        aria-hidden="true"
        className={clsx("h-[var(--rule-angled-window)] overflow-hidden", className)}
      >
        <div
          className={clsx(
            "h-[var(--rule-angled-inner)] w-[var(--rule-angled-overshoot)] origin-left rule-angled border-t-2 border-solid",
            COLOUR[variant],
          )}
        />
      </div>
    );
  }

  return (
    <hr
      ref={animated ? (ref as React.Ref<HTMLHRElement>) : undefined}
      className={clsx(
        "m-0 border-0 border-t border-solid",
        thick ? "border-t-2" : "border-t",
        COLOUR[variant],
        animated && "ctl-rule-draw",
        className,
      )}
    />
  );
}
