"use client";

import { clsx } from "clsx";
import { winkEnd, winkEnter } from "@/lib/knock";
import { Caret } from "./Caret";

/* List using the caret as the marker in place of a bullet.
 *
 * Marker colour follows the surface: Fern on Oat, Kowhai on Ink. That is the
 * two-colours-per-surface rule doing its work — gold on Oat is 1.8:1 and fails
 * contrast, so it is only used on the dark surface.
 *
 * Tier-three motion: where an item is genuinely a link, its marker takes a
 * colour step on hover. Items that are plain text get no hover treatment,
 * because motion on non-interactive copy is noise.
 */

export type CaretListItem = React.ReactNode | { content: React.ReactNode; href: string };

type CaretListProps = {
  items: CaretListItem[];
  inverse?: boolean;
  markerColor?: string;
  className?: string;
};

function isLink(item: CaretListItem): item is { content: React.ReactNode; href: string } {
  return typeof item === "object" && item !== null && "href" in item;
}

export function CaretList({ items, inverse = false, markerColor, className }: CaretListProps) {
  const marker = markerColor ?? (inverse ? "var(--ctl-kowhai)" : "var(--ctl-fern)");

  return (
    <ul className={clsx("m-0 grid max-w-measure list-none gap-3 p-0", className)}>
      {items.map((item, i) => {
        const linked = isLink(item);
        const content = linked ? item.content : item;

        const body = (
          <>
            <Caret
              size={9}
              thickness={2}
              color={marker}
              className="mt-[var(--caret-list-marker-offset)] transition-[border-color] duration-[var(--duration-fast)] ease-brand"
            />
            <span
              className={clsx(
                "font-sans text-body-md",
                inverse ? "text-body-inverse" : "text-body",
              )}
            >
              {content}
            </span>
          </>
        );

        return (
          <li key={i} onMouseEnter={winkEnter} onAnimationEnd={winkEnd} className="flex items-start gap-3">
            {linked ? (
              <a
                href={item.href}
                className="group flex items-start gap-3 no-underline hover:[&_.caret-mark]:border-kowhai"
              >
                {body}
              </a>
            ) : (
              body
            )}
          </li>
        );
      })}
    </ul>
  );
}
