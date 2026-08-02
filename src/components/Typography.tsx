"use client";

import { clsx } from "clsx";
import { isValidElement, cloneElement } from "react";
import { knockEnd, knockEnter } from "@/lib/knock";
import { useWordKnock } from "@/hooks/useWordKnock";

/* Text primitives, ported from the design handoff prototype.
 *
 * Grouped in one file because they are four small components that share a single
 * concern and are almost always read together.
 *
 * Brand rule encoded here: body copy never moves into Archivo, however short the
 * paragraph. Heading uses font-heading; the prose ladder — Lede, Body, Note —
 * uses font-sans; Eyebrow uses font-meta. There is no prop to cross those over.
 *
 * The prose ladder is three rungs and only three: 18px Lede, 16px Body, 14px
 * Note. Anything smaller is Eyebrow's 11px, which is a label rather than prose.
 *
 * Every Heading and Eyebrow carries the vase-knock (owner request): brush the
 * pointer past any header, or the small caps line above one, and it tips on
 * its base and wobbles back to rest, finishing its swing whether or not the
 * pointer stays. Transform only, so nothing reflows, and stilled under
 * reduced motion with everything else.
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
/* Words wrapped for the word knock (useWordKnock). Strings split on
   whitespace with the whitespace kept as bare text nodes, so wrapping and
   selection behave; element children (links, strong) knock whole. Screen
   readers read inline spans as continuous text, so nothing changes for
   them. */
export function splitWords(children: React.ReactNode): React.ReactNode {
  let key = 0;
  const wrap = (node: React.ReactNode): React.ReactNode => {
    if (typeof node === "string") {
      return node.split(/(\s+)/).map((part) =>
        part === "" || /^\s+$/.test(part) ? (
          part
        ) : (
          <span key={key++} className="ctl-word">
            {part}
          </span>
        ),
      );
    }
    if (Array.isArray(node)) return node.map(wrap);
    if (isValidElement(node)) {
      // Plain markup (span, strong, em...) is recursed into so its words
      // knock individually. Anchors and buttons knock as one unit — not just
      // semantics: text-decoration cannot propagate into inline-block
      // children, so splitting an underlined link's text would erase the
      // underline beneath every word. Components knock whole too.
      const el = node as React.ReactElement<{ children?: React.ReactNode }>;
      if (
        typeof el.type === "string" &&
        el.type !== "a" &&
        el.type !== "button" &&
        el.props.children !== undefined
      ) {
        return cloneElement(el, { key: key++ }, wrap(el.props.children));
      }
      return (
        <span key={key++} className="ctl-word">
          {node}
        </span>
      );
    }
    return node;
  };
  return wrap(children);
}

/** Any prose element, joined to the word knock. For text that renders outside
 *  Body/Lede — footer notes, card asides — so server components can opt text
 *  in with one swap. */
export function WordKnockText({
  as: Tag = "p",
  className,
  children,
}: {
  as?: "p" | "div" | "span";
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useWordKnock<HTMLElement>();
  return (
    <Tag ref={ref as React.Ref<never>} className={className}>
      {splitWords(children)}
    </Tag>
  );
}

export function Lede({ children, inverse = false, className }: ProseProps) {
  return (
    <WordKnockText
      className={clsx(
        "max-w-measure font-sans text-body-lg",
        inverse ? "text-body-inverse" : "text-body",
        className,
      )}
    >
      {children}
    </WordKnockText>
  );
}

/** 16px body copy. Capped at the 700px reading measure. */
export function Body({ children, inverse = false, className }: ProseProps) {
  return (
    <WordKnockText
      className={clsx(
        "max-w-measure font-sans text-body-md",
        inverse ? "text-body-inverse" : "text-body",
        className,
      )}
    >
      {children}
    </WordKnockText>
  );
}

/* 14px prose: the rung below Body, and the one that was missing.
 *
 * Nineteen places were writing `font-sans text-body-sm` plus a colour plus,
 * usually, `max-w-measure` by hand — the privacy notes under both forms, the
 * "applications open on 15 August" lines, the role summaries, the section
 * intros on terms and privacy. One of them had given up and written
 * `<Body className="text-body-sm">`, which is the tell: the ladder had a gap
 * and callers were improvising across it.
 *
 * They had drifted in the way hand-copied classes do. Some capped the measure
 * and some did not. More tellingly, four carried the word-knock and the rest
 * did not, so the same rung of the same ladder answered the pointer or ignored
 * it depending on who wrote the line. Lede and Body both knock; this settles
 * the question the way they already answer it.
 *
 * `muted` rather than a second component, because the two are one rung in two
 * voices: plain is the content, still, only secondary — a role summary, a
 * section intro. Muted is an aside ABOUT the content — where the data is held,
 * when applications open. Colour is the whole difference and the token layer
 * already names it, so a boolean is the honest shape.
 *
 * A <p> by default, unlike Body and Lede, which are divs. No reason beyond
 * history for theirs, and every caller this replaces was already a paragraph.
 */
export function Note({
  children,
  muted = false,
  inverse = false,
  as = "p",
  className,
}: ProseProps & { muted?: boolean; as?: "p" | "div" | "span" }) {
  return (
    <WordKnockText
      as={as}
      className={clsx(
        "max-w-measure font-sans text-body-sm",
        muted
          ? inverse
            ? "text-muted-inverse"
            : "text-muted"
          : inverse
            ? "text-body-inverse"
            : "text-body",
        className,
      )}
    >
      {children}
    </WordKnockText>
  );
}

/** Non-heading text that carries the header vase-knock: card titles rendered
 *  as divs, the odd h3 with bespoke classes. Adds the class and the
 *  enter/end contract (see src/lib/knock.ts); callers keep their own type
 *  styles. */
export function KnockText({
  as: Tag = "div",
  className,
  children,
}: {
  as?: "div" | "h3" | "span";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Tag
      onMouseEnter={knockEnter}
      onAnimationEnd={knockEnd}
      className={clsx("ctl-knock", className)}
    >
      {children}
    </Tag>
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
   * h4 for the same reason one level down: the blocks inside a role description
   * ("What you'll do") sit under the role's own h3.
   */
  as?: "p" | "span" | "div" | "h2" | "h3" | "h4";
  className?: string;
};

/* Space Mono, 11px, 0.16em tracking, uppercase. Dates, meta and section labels.
 *
 * THE GAP BELOW ONE IS NOT ARBITRARY, and it is the caller's to set because it
 * depends on what the eyebrow is doing:
 *
 *   mb-4  labelling the heading directly beneath it. The two are one unit, so
 *         the gap is the tighter of the two and binds them together.
 *   mb-5  standing in for the heading itself (as="h2"), where what follows is a
 *         grid or a table rather than a line of type. Nothing below it to bind
 *         to, so it takes the section-heading gap instead.
 *   none  inside a Card, where the card's own layout already spaces it.
 *
 * Every eyebrow on the site follows this. One had drifted to mb-5 over a
 * heading, which is eight pixels of nothing that only shows up when you put the
 * pages side by side. */
export function Eyebrow({
  children,
  inverse = false,
  as: Tag = "p",
  className,
}: EyebrowProps) {
  return (
    <Tag
      onMouseEnter={knockEnter}
      onAnimationEnd={knockEnd}
      className={clsx(
        "ctl-knock font-meta text-label font-normal uppercase",
        inverse ? "text-muted-inverse" : "text-muted",
        className,
      )}
    >
      {children}
    </Tag>
  );
}
