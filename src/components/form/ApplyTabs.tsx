"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { CommunityForm } from "./CommunityForm";
import { DeveloperForm } from "./DeveloperForm";
import { Body } from "../Typography";
import { useTabIndicator } from "@/hooks/useTabIndicator";

/* The two-tab fork at the top of the apply page.
 *
 * The two audiences never share a form, so this is the last place the site
 * splits them. Tabs are real buttons in a tablist so keyboard and screen reader
 * users get the same fork everyone else does.
 */

const TABS = [
  { id: "community", label: "I am a community organisation" },
  { id: "developer", label: "I am a developer" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ApplyTabs({ canSubmit }: { canSubmit: boolean }) {
  const [path, setPath] = useState<TabId>("community");
  // Sliding Fern underline; the per-tab borders stay as the no-JS fallback.
  const { stripRef, barRef } = useTabIndicator(path);

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
        ref={stripRef as React.Ref<HTMLDivElement>}
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
            onClick={() => setPath(tab.id)}
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
