"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { CommunityForm } from "./CommunityForm";
import { DeveloperForm } from "./DeveloperForm";
import { Body } from "../Typography";
import { useTabIndicator } from "@/hooks/useTabIndicator";
import { applyHref, type ApplyPath } from "@/lib/apply-path";

/* The two-tab fork at the top of the apply page.
 *
 * The two audiences never share a form, so this is the last place the site
 * splits them. Tabs are real buttons in a tablist so keyboard and screen reader
 * users get the same fork everyone else does.
 *
 * Which tab opens is the page's call, not this component's: developer copy
 * links to ?for=developer and arrives here already forked. See lib/apply-path.
 */

const TABS: { id: ApplyPath; label: string }[] = [
  { id: "community", label: "I am a community organisation" },
  { id: "developer", label: "I am a developer" },
];

export function ApplyTabs({
  canSubmit,
  initialPath = "community",
}: {
  canSubmit: boolean;
  initialPath?: ApplyPath;
}) {
  const [path, setPath] = useState<ApplyPath>(initialPath);

  /* The URL leads, in both directions.
   *
   * `initialPath` seeding useState only covers the first mount, and this
   * component survives navigations that change the parameter — it stays in the
   * same position in the tree, so React reconciles rather than remounts and the
   * state outlives the prop. Landing on ?for=developer and then tapping the
   * header's Apply now (a bare /apply) left the developer form open under a URL
   * claiming otherwise: the CTA looked broken, and a refresh would have thrown
   * the reader onto the other form.
   *
   * Adjusted during render rather than in an effect, the same way SiteHeader
   * closes its panel on a route change: React re-runs this pass before touching
   * the DOM, so the right form is in the first paint of the new URL. Converges
   * after one pass — the guard can only fire when the prop actually moves, and
   * `choose` below changes the URL without re-rendering the page, so a tab
   * click never trips it. */
  const [lastFromUrl, setLastFromUrl] = useState(initialPath);
  if (lastFromUrl !== initialPath) {
    setLastFromUrl(initialPath);
    setPath(initialPath);
  }

  // Sliding Fern underline; the per-tab borders stay as the no-JS fallback.
  const { stripRef, barRef } = useTabIndicator<HTMLDivElement>(path);

  function choose(next: ApplyPath) {
    setPath(next);
    // Keep the URL honest, so a refresh or a shared link comes back to the form
    // the reader is actually looking at. replaceState rather than router.replace:
    // Next syncs it into the router without re-running this force-dynamic page,
    // which would otherwise remount both forms and lose whatever is typed in
    // them. Replace, not push, so Back still leaves the page rather than
    // walking the reader through every tab they tried.
    window.history.replaceState(null, "", applyHref(next));
  }

  return (
    <div>
      <Body className="mt-4">
        {path === "community"
          ? "Six sections, about 45 to 60 minutes. You do not need to be technical, and you do not need to know how it would be built. Focus on the problem you are trying to solve."
          : "A few minutes. Tell us which seat fits and point us at something you have shipped."}
      </Body>

      <div
        role="tablist"
        aria-label="Which kind of application"
        ref={stripRef}
        className="ctl-tab-strip mt-6 flex gap-5 border-b border-solid border-hairline"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            type="button"
            id={`tab-${tab.id}`}
            aria-selected={path === tab.id}
            data-tab-active={path === tab.id || undefined}
            aria-controls={`panel-${tab.id}`}
            onClick={() => choose(tab.id)}
            className={clsx(
              "ctl-tab-underline -mb-px cursor-pointer border-0 border-b-2 border-solid bg-transparent px-1 py-3",
              "font-heading text-body-md font-extrabold",
              "transition-[color,border-color] duration-[var(--duration-base)] ease-brand",
              path === tab.id ? "border-b-fern text-ink" : "border-b-transparent text-muted",
            )}
          >
            {tab.label}
          </button>
        ))}
        <span
          ref={barRef}
          aria-hidden="true"
          className="ctl-tab-indicator ctl-tab-indicator--fern"
        />
      </div>

      <div
        role="tabpanel"
        id={`panel-${path}`}
        aria-labelledby={`tab-${path}`}
        tabIndex={-1}
      >
        {path === "community" ? (
          <CommunityForm canSubmit={canSubmit} />
        ) : (
          <DeveloperForm canSubmit={canSubmit} />
        )}
      </div>
    </div>
  );
}
