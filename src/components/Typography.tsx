"use client";

import { clsx } from "clsx";
import { knockEnd, knockEnter } from "@/lib/knock";

/* Text primitives, ported from the design handoff prototype.
 *
 * Grouped in one file because they are four small components that share a single
 * concern and are almost always read together.
 *
 * Brand rule encoded here: body copy never moves into Archivo, however short the
 * paragraph. Heading uses font-heading; Lede and Body use font-sans; Eyebrow uses
 * font-meta. There is no prop to cross those over.
 *
 * Every Heading carries the vase-knock (owner request): brush the pointer past
 * any header and it tips on its base and wobbles back to rest, finishing its
 * swing whether or not the pointer stays. Transform only, so nothing reflows,
 * and stilled under reduced motion with everything else.
 */

type HeadingProps = {
  children: React.ReactNode;
  /** Visual level. Use `as` when the heading rank needs to differ from the size. */
  level?: 1 | 2 | 3;
  as?: "h1" | "h2" | "h3" | "h4";
  inverse?: boolean;
  fluid?: boolean;
  className?: string;
  id?: string;
};

const HEADING_SIZE = {
  1: "text-display font-black",
  2: "text-headline font-extrabold",
  3: "text-subhead font-bold",
} as const;

export function Heading({
  children,
  level = 2,
  as,
  inverse = false,
  fluid = false,
  className,
  id,
}: HeadingProps) {
  const Tag = as ?? (`h${level}` as const);

  return (
    <Tag
      id={id}
      onMouseEnter={knockEnter}
      onAnimationEnd={knockEnd}
      className={clsx(
        "ctl-knock font-heading",
        // The fluid clamp exists for hero display type, where 52px would
        // otherwise overflow a narrow viewport.
        fluid && level === 1 ? "text-display-fluid font-black" : HEADING_SIZE[level],
        inverse ? "text-heading-inverse" : "text-heading",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

type ProseProps = {
  children: React.ReactNode;
  inverse?: boolean;
  className?: string;
};

/** 18px opening paragraph. Capped at the 700px reading measure. */
export function Lede({ children, inverse = false, className }: ProseProps) {
  return (
    <p
      className={clsx(
        "max-w-measure font-sans text-body-lg",
        inverse ? "text-body-inverse" : "text-body",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** 16px body copy. Capped at the 700px reading measure. */
export function Body({ children, inverse = false, className }: ProseProps) {
  return (
    <p
      className={clsx(
        "max-w-measure font-sans text-body-md",
        inverse ? "text-body-inverse" : "text-body",
        className,
      )}
    >
      {children}
    </p>
  );
}

type EyebrowProps = {
  children: React.ReactNode;
  inverse?: boolean;
  /**
   * Heading tags are allowed and sometimes required. Several eyebrows do the
   * visual job of a section heading ("Two ways in", "The roles", "Who is behind
   * it") with only h3s beneath them, which left an H1-to-H3 jump in the outline.
   * Rendering those as h2 fixes the document structure without changing a pixel.
   */
  as?: "p" | "span" | "div" | "h2" | "h3";
  className?: string;
};

/** Space Mono, 11px, 0.16em tracking, uppercase. Dates, meta and section labels. */
export function Eyebrow({
  children,
  inverse = false,
  as: Tag = "p",
  className,
}: EyebrowProps) {
  return (
    <Tag
      className={clsx(
        "font-meta text-label font-normal uppercase",
        inverse ? "text-muted-inverse" : "text-muted",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
