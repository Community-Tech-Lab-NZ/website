"use client";

import { clsx } from "clsx";
import { useRiseOnScroll } from "@/hooks/useRiseOnScroll";

/* Wrapper applying the sanctioned entry animation: fade plus a 12px rise on
 * scroll, 420ms, --ease-out-soft.
 *
 * Wrap whole sections rather than individual cards — a cascade of cards
 * animating one after another is what the guide rules out.
 *
 * `delay` exists for one purpose: the hero entrance sequence, where the lede,
 * CTA and stats rise while the headline is still typing. It offsets a whole
 * block, it does not stagger the block's children. Reduced motion zeroes it
 * along with the duration.
 */

type RevealProps = {
  children: React.ReactNode;
  as?: "div" | "section" | "li" | "article";
  /** Milliseconds before the rise starts once the element is in view. */
  delay?: number;
  className?: string;
};

export function Reveal({ children, as: Tag = "div", delay, className }: RevealProps) {
  const ref = useRiseOnScroll<HTMLElement>();

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={clsx("ctl-rise", className)}
      style={delay ? ({ "--rise-delay": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
