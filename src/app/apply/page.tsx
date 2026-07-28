import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { ScoringTable, SCORING_APPLY } from "@/components/ScoringTable";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { StatusTag } from "@/components/StatusTag";
import { Timeline } from "@/components/Timeline";
import { Body, Eyebrow, Heading } from "@/components/Typography";
import { ApplyTabs } from "@/components/form/ApplyTabs";
import { getWindowState, WINDOW_COPY } from "@/lib/application-window";
import { TIMELINE } from "@/lib/navigation";

/* Apply.
 *
 * Rendered per request rather than at build time, because the page's state
 * depends on the date: the site goes live before applications open and stays up
 * after they close. Prerendering would bake in whichever state happened to be
 * true at deploy time.
 *
 * Before the window opens the forms are readable but not submittable. That is
 * deliberate — letting an organisation see all six sections in advance is a real
 * quality lever on a 50-minute application, and far better than a bare
 * "come back on the 15th".
 */

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  // The deadline is the most useful thing a searcher can see in a result.
  title: "Apply by 31 August",
  description:
    "Applications are open 15 to 31 August for community organisations and developers in the Queenstown Lakes district. You do not need to be technical.",
  alternates: { canonical: "/apply" },
};

export default function ApplyPage() {
  const state = getWindowState();
  const copy = WINDOW_COPY[state];
  const canSubmit = state === "open";

  return (
    <Section>
      <Reveal className="grid grid-cols-1 items-start gap-9 lg:grid-cols-[minmax(var(--col-min-wide),1fr)_minmax(var(--col-min-narrow),0.6fr)]">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <StatusTag tone={copy.tone}>{copy.tag}</StatusTag>
            {/* mb-0 matters here. Eyebrow renders a <p>, base.css gives every
                <p> a 16px bottom margin, and flexbox centres the MARGIN box —
                so items-center was lifting this text 8px above the pill. */}
            <Eyebrow className="mb-0">Applications open 15 to 31 August</Eyebrow>
          </div>

          <Heading level={2} as="h1">
            {copy.heading}
          </Heading>

          {state === "closed" ? (
            <Body className="mt-4">{copy.body}</Body>
          ) : (
            <>
              {state === "before" ? (
                <Card tone="sunk" className="mt-5">
                  <p className="max-w-measure font-sans text-body-sm text-body">
                    {copy.body}
                  </p>
                </Card>
              ) : null}
              <ApplyTabs canSubmit={canSubmit} />
            </>
          )}
        </div>

        <div className="grid gap-6">
          <Card tone="light" accentRule>
            <Eyebrow className="mb-5">Key dates</Eyebrow>
            <Timeline steps={TIMELINE} />
          </Card>

          {state !== "closed" ? (
            <ScoringTable rows={SCORING_APPLY}>
              <p className="mt-4 max-w-measure font-sans text-body-sm text-muted">
                Something that could help several organisations, not just one, is
                especially welcome. If you are unsure whether your idea fits, apply anyway
                and we will talk it through.
              </p>
            </ScoringTable>
          ) : null}
        </div>
      </Reveal>
    </Section>
  );
}
