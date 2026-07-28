"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { AnimatedLockup } from "./AnimatedLockup";
import { Button } from "./Button";
import { Caret } from "./Caret";
import { NAV } from "@/lib/navigation";
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
 *  - "Apply now" stays visible at every width. It is the primary conversion and
 *    must never hide behind a menu.
 *  - The toggle is the Caret, rotated. The handoff is explicit that the caret is
 *    the only glyph in this brand and no icon set exists, so a hamburger would
 *    mean inventing one.
 *  - Opening reveals a full-width panel below the header rather than an overlay
 *    drawer: no scroll-locking, no scrim, and it suits a flat, near-square
 *    system better than a sliding sheet.
 *  - The panel stays on Oat, honouring two-colours-per-surface.
 *  - The active item's Kowhai bottom border becomes a LEFT border in the
 *    vertical list, where a bottom border would read as a divider.
 *  - Escape closes and returns focus to the toggle; the panel is aria-linked.
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
  const panelId = useId();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Route change closes the panel, otherwise it stays open over the new page.
  // Adjusted during render rather than in an effect: React re-runs this pass
  // before touching the DOM, so the panel never paints open on the new route.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // Sliding underline: rests on the active route, glides to the hovered link,
  // returns on leave. Keyed on pathname so route changes re-measure.
  const { stripRef, barRef, moveTo, rest } = useTabIndicator(pathname);

  return (
    <header
      className={clsx(
        "border-b border-solid",
        dark ? "bg-ink border-hairline-inverse" : "bg-oat border-hairline",
      )}
    >
      <div className="mx-auto flex min-h-[var(--header-height)] max-w-page items-center gap-4 px-gutter md:gap-7 lg:px-gutter-lg">
        <Link href="/" className="block no-underline" aria-label="Community Tech Lab, home">
          {/* Optically aligned like Logo align="optical": the caret's left
              edge lands on the same column as the h1 below it. The cursor
              block blinks — motion override 1. */}
          <AnimatedLockup dark={dark} />
        </Link>

        {/* Desktop nav */}
        <nav
          ref={stripRef as React.Ref<HTMLElement>}
          aria-label="Main"
          onMouseLeave={rest}
          className="ctl-tab-strip ml-auto hidden items-center gap-6 md:flex"
        >
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              data-tab-active={isActive(item.href) || undefined}
              onMouseEnter={(e) => moveTo(e.currentTarget)}
              className={clsx(
                // ctl-hit: the 20px line box is under the 24px target minimum.
                // ctl-tab-underline: the border is the no-JS fallback; once
                // the indicator mounts it takes over the underline.
                // No Tailwind transition utilities here: ctl-link-grow owns
                // the shorthand so the grow keeps its own slower timing.
                "ctl-hit ctl-tab-underline ctl-link-grow border-b-2 border-solid pb-px font-heading text-body-sm font-bold no-underline",
                isActive(item.href) ? "border-b-kowhai" : "border-b-transparent",
                dark ? "text-oat hover:border-b-kowhai" : "text-ink hover:border-b-kowhai",
              )}
            >
              {item.label}
            </Link>
          ))}
          <span ref={barRef} aria-hidden="true" className="ctl-tab-indicator" />
        </nav>

        <div className="ml-auto flex items-center gap-4 md:ml-0">
          {actionLabel ? (
            <Button
              variant={dark ? "primary" : "secondary"}
              size="sm"
              href={actionHref}
              className="ctl-cta-ping ctl-cta-ping--tight"
            >
              {actionLabel}
            </Button>
          ) : null}

          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls={panelId}
            className={clsx(
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

      {/* Mobile panel */}
      <div
        id={panelId}
        hidden={!open}
        className={clsx(
          "border-t border-solid md:hidden",
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
