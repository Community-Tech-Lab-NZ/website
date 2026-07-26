"use client";

import { clsx } from "clsx";
import { useRiseOnScroll } from "@/hooks/useRiseOnScroll";

/* Wrapper applying the sanctioned entry animation: fade plus a 12px rise on
 * scroll, 420ms, --ease-out-soft.
 *
 * The brand system permits this and nothing more. No parallax, no staggered
 * cascades, no counters ticking up, no hover lift. Wrap whole sections rather
 * than individual cards — a cascade of cards animating one after another is
 * exactly what the guide rules out.
 */

type RevealProps = {
  children: React.ReactNode;
  as?: "div" | "section" | "li" | "article";
  className?: string;
};

export function Reveal({ children, as: Tag = "div", className }: RevealProps) {
  const ref = useRiseOnScroll<HTMLElement>();

  return (
    <Tag ref={ref as React.Ref<never>} className={clsx("ctl-rise", className)}>
      {children}
    </Tag>
  );
}
