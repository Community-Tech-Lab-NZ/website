"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { AnimatedLockup } from "./AnimatedLockup";
import { Button } from "./Button";
import { Caret } from "./Caret";
import { NAV } from "@/lib/navigation";
import { hoverCapable } from "@/lib/motion";
import { useDisclosure } from "@/hooks/useDisclosure";
import { useTabIndicator } from "@/hooks/useTabIndicator";

/* Site header.
 *
 * The desktop treatment is ported from the prototype: 96px min height, Oat
 * background, 1px bottom hairline, horizontal lockup on the left, Archivo 700
 * nav on the right, one action button. The active item carries a 2px Kowhai
 * bottom border.
 *
 * THE MOBILE TREATMENT IS NEW. The handoff flags it as missing and needing
 * design before build, and it is on the critical path — most applicants will
 * meet this site on a phone. Decisions, all staying inside the brand system:
 *
 *  - "Apply now" stays visible, and identical, at every width. It is the primary
 *    conversion and must never hide behind a menu. It carries the home hero's
 *    treatment — Kowhai, detached ring, same ping — so the CTA a visitor met in
 *    the hero is the CTA that follows them around the site. Only the scale
 *    differs: hero sizing would not sit in a 96px header. It briefly shortened
 *    to "Apply" on phones to buy the lockup room; cropping the lockup to its
 *    ink returned 108px to the row and the abbreviation stopped paying for
 *    itself.
 *  - The toggle is the Caret, rotated. The handoff is explicit that the caret is
 *    the only glyph in this brand and no icon set exists, so a hamburger would
 *    mean inventing one.
 *  - Opening reveals a full-width panel dropping from the header rather than a
 *    sliding drawer: no scroll-locking, no scrim, and it suits a flat,
 *    near-square system better than a sheet. It FLOATS over the page — an
 *    in-flow panel shunted the hero down by its own height on open and hauled
 *    it back up on close, so every tap on the menu bounced the page.
 *  - Floating means the last hairline is no longer the end of the header, it is
 *    a line drawn across whatever is beneath it. --shadow-overlay is the one
 *    shadow this brand permits, for exactly this: a surface over content.
 *  - No scrim, so nothing catches the tap on the page the panel covers — a
 *    pointerdown outside the header closes it.
 *  - It opens rather than appearing (.ctl-drop). The caret was already rotating
 *    over 120ms while the panel it controls snapped, which read as two halves
 *    of one gesture disagreeing — and floating sharpened it, because there is
 *    no longer any layout shift to explain where the panel came from.
 *  - The panel stays on Oat, honouring two-colours-per-surface.
 *  - The active item's Kowhai bottom border becomes a LEFT border in the
 *    vertical list, where a bottom border would read as a divider.
 *  - Escape closes and returns focus to the toggle; the panel is aria-linked.
 *
 * The last three are not written here. They are useDisclosure, shared with the
 * apply form's stage list, which is the same control met on the same screen.
 */

type SiteHeaderProps = {
  tone?: "oat" | "ink";
  actionLabel?: string;
  actionHref?: string;
};

export function SiteHeader({
  tone = "oat",
  actionLabel = "Apply now",
  actionHref = "/apply",
}: SiteHeaderProps) {
  const dark = tone === "ink";
  const pathname = usePathname();

  // Escape, the outside dismiss and the aria wiring are shared with StageBar's
  // stage list — see useDisclosure. Only the route rule below is the header's.
  const { open, close, rootRef, triggerProps, panelProps } =
    useDisclosure<HTMLElement>();

  // Route change closes the panel, otherwise it stays open over the new page.
  // Adjusted during render rather than in an effect: React re-runs this pass
  // before touching the DOM, so the panel never paints open on the new route.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    close();
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // Sliding underline: rests on the active route, glides to the hovered link,
  // returns on leave. Keyed on pathname so route changes re-measure.
  const { stripRef, barRef, moveTo, rest } = useTabIndicator(pathname);

  return (
    <header
      ref={rootRef}
      className={clsx(
        // relative, but deliberately no z-index: the panel's own z-20 then
        // competes in the root stacking context, where it clears the apply
        // form's sticky stage bar at z-10. A stacking context on the header
        // would also bury the skip link, which is a body-level sibling.
        "relative border-b border-solid",
        dark ? "bg-ink border-hairline-inverse" : "bg-oat border-hairline",
      )}
    >
      {/* THE ROW'S CONTRACT, in one place, because not having stated it is what
          made this header hard.

          Flex shrinks every item by default, so under pressure this row used to
          resolve a few missing pixels by squeezing whatever was easiest: the
          apply label broke over two lines, and the menu toggle's 48px target
          came down to 35px. Both are the things a phone user came to touch, and
          both failures were silent — the row still "fitted".

          So: the actions and the nav are shrink-0, and the lockup is the ONE
          element allowed to give (min-w-0 here, max-w-full on its svg). It is
          the only thing in the row that degrades gracefully — it just renders
          smaller — and it is the only thing that is not a tap target.

          That is also why there is one alignment mechanism instead of two. The
          lockup's mr-auto eats the slack; the nav and the actions simply follow
          it. Two competing ml-autos said the same thing twice. */}
      <div className="mx-auto flex min-h-[var(--header-height)] max-w-page items-center gap-3 px-gutter md:gap-7 lg:px-gutter-lg">
        <Link
          href="/"
          className="mr-auto min-w-0 no-underline"
          aria-label="Community Tech Lab, home"
        >
          {/* Optically aligned like Logo align="optical": the caret's left
              edge lands on the same column as the h1 below it. The cursor
              block blinks — motion override 1.

              THE WORDMARK DROPS BELOW 360px AND THE MARK STANDS ALONE. The ink
              box is 4.69 wide for every 1 tall, so 31px of wordmark is 153px of
              row — and the row also carries the gutters (48), the gap (12) and
              the apply button with the toggle (131 together, after the toggle's
              negative margin). That totals 344px of viewport, so 360 is the
              narrowest width the wordmark fits, with 16px to spare.

              It does not wrap when it does not fit, it overflows — and an
              overflowing header puts the whole PAGE into horizontal scroll.
              That is what the light strip down the right of every page was:
              each full-width surface stopping at the viewport edge while the
              document ran on past it. Below 360 the mark costs 57px instead of
              153, which holds the row down to ~250px.

              The mark is the same caret and cursor block, still linking home
              and still blinking on the same loop. Only the wordmark goes, and
              only where it would otherwise be illegible. --header-mark sizes
              the glyph to the caret it replaces rather than the two thirds the
              mark's own artboard would give. */}
          <AnimatedLockup dark={dark} className="max-xs:hidden" />
          {/* The mark keeps the optical alignment the wordmark has, and needs
              a second term to do it: the horizontal lockup cancels its clear
              space alone, where the mark's artwork also sits 16% in from the
              left of its own 100x100 box. Without both, the caret stood 14px
              right of the column every heading on the page starts on. */}
          <AnimatedLockup
            dark={dark}
            mark
            size="var(--header-mark)"
            className="ml-[calc(-1*(var(--lockup-pad)+var(--header-mark)*0.16))] xs:hidden"
          />
        </Link>

        {/* Desktop nav. onMouseLeave is deliberately NOT hover-guarded, where
            the enter below is: rest() is the corrective call — it puts the
            indicator back on the active route — so firing it when it was not
            needed is always harmless, and skipping it could strand the bar
            somewhere it does not belong. Guard the move, never the recovery. */}
        <nav
          ref={stripRef}
          aria-label="Main"
          onMouseLeave={rest}
          className="ctl-tab-strip hidden shrink-0 items-center gap-6 md:flex"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              data-tab-active={isActive(item.href) || undefined}
              onMouseEnter={(e) => { if (hoverCapable()) moveTo(e.currentTarget); }}
              className={clsx(
                // ctl-hit: the 20px line box is under the 24px target minimum.
                // ctl-tab-underline: the border is the no-JS fallback; once
                // the indicator mounts it takes over the underline.
                // No Tailwind transition utilities here: ctl-link-grow owns
                // the shorthand so the grow keeps its own slower timing.
                //
                // 16px, not 14. At 14 the nav read small against the lockup and
                // the Apply button on a wide screen, and it never needed to be
                // that small: this nav only exists from md, which is 900px
                // here, where 24px gutters leave 852px for a 153px lockup, two
                // 28px gaps, a 107px button and 341px of nav at 16 — 195px
                // spare. No breakpoint on the size, because there is no width
                // where this renders and cannot afford it.
                "ctl-hit ctl-tab-underline ctl-link-grow border-b-2 border-solid pb-px font-heading text-body-md font-bold no-underline",
                isActive(item.href) ? "border-b-kowhai" : "border-b-transparent",
                dark ? "text-oat hover:border-b-kowhai" : "text-ink hover:border-b-kowhai",
              )}
            >
              {item.label}
            </Link>
          ))}
          <span ref={barRef} aria-hidden="true" className="ctl-tab-indicator" />
        </nav>

        {/* No gap below md. The toggle is a 48px box around a 12px caret, so it
            carries 18px of its own clear space on the left already; a gap on
            top of that is width spent on nothing. */}
        <div className="flex shrink-0 items-center md:gap-4">
          {actionLabel ? (
            <Button
              variant="primary"
              size="sm"
              href={actionHref}
              className="ctl-cta-ping ctl-cta-ping--offbeat ring-detached"
            >
              {actionLabel}
            </Button>
          ) : null}

          <button
            {...triggerProps}
            className={clsx(
              // Its 48px target holds because the cluster around it is
              // shrink-0, not because this element defends itself.
              "flex h-[var(--tap-target)] w-[var(--tap-target)] items-center justify-center md:hidden",
              "-mr-3 cursor-pointer border-0 bg-transparent",
            )}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <Caret
              direction={open ? "up" : "down"}
              size={12}
              thickness={2}
              color={dark ? "var(--ctl-oat)" : "var(--ctl-ink)"}
              className="transition-transform duration-[var(--duration-fast)] ease-brand"
            />
          </button>
        </div>
      </div>

      {/* Mobile panel. top-full resolves against the header's padding box, so
          the panel starts on the header's own bottom hairline and its border-t
          lands in the same 1px — one line under the row, open or closed. */}
      <div
        {...panelProps}
        className={clsx(
          "ctl-drop absolute inset-x-0 top-full z-20 border-t border-solid shadow-dialog md:hidden",
          dark ? "bg-ink border-hairline-inverse" : "bg-oat border-hairline",
        )}
      >
        <nav aria-label="Main" className="mx-auto max-w-page px-gutter">
          <ul className="m-0 list-none p-0">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={clsx(
                    "flex min-h-[var(--tap-target)] items-center border-l-2 border-solid border-b border-b-solid pl-4",
                    "font-heading text-body-lg font-bold no-underline",
                    isActive(item.href) ? "border-l-kowhai" : "border-l-transparent",
                    dark
                      ? "text-oat border-b-hairline-inverse"
                      : "text-ink border-b-hairline",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
