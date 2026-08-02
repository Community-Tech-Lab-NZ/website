import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { KeyDatesCard } from "@/components/KeyDatesCard";
import { ScoringTable, SCORING_APPLY } from "@/components/ScoringTable";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { StatusTag } from "@/components/StatusTag";
import { Body, Eyebrow, Heading } from "@/components/Typography";
import { ApplyTabs } from "@/components/form/ApplyTabs";
import { getWindowState, WINDOW_COPY } from "@/lib/application-window";
import { APPLICATION_WINDOW_LABEL } from "@/lib/navigation";

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
    <>
      {/* The page runs in one column now, where it used to be a main column with
          Key dates and How we choose riding beside it.
          The community application gained a stage rail down its left side, and
          the old main column had no width for one: inside the 1120px container
          it measured ~580px, already under the 620px form measure, and
          rail + form + aside will not share a line at any split. So the form
          takes the full container and the two reference cards close the page.
          They are reinforcement here rather than the only copy — the status
          pill states the window above, and both cards also appear on the home
          page and /organisations. */}
      <Section drift="hero">
        <Reveal>
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <StatusTag tone={copy.tone}>{copy.tag}</StatusTag>
            {/* mb-0 matters here. Eyebrow renders a <p>, base.css gives every
                <p> a 16px bottom margin, and flexbox centres the MARGIN box —
                so items-center was lifting this text 8px above the pill. */}
            <Eyebrow className="mb-0">{APPLICATION_WINDOW_LABEL}</Eyebrow>
          </div>

          <Heading level={2} as="h1">
            {copy.heading}
          </Heading>

          {state === "closed" ? <Body className="mt-4">{copy.body}</Body> : null}

          {/* max-w-measure on the Card, not only on the paragraph inside it.
              Out here the heading block spans the container, and a 1024px card
              wrapped around 560px of text is mostly empty card. */}
          {state === "before" ? (
            <Card tone="sunk" className="mt-5 max-w-measure">
              <p className="font-sans text-body-sm text-body">{copy.body}</p>
            </Card>
          ) : null}

          {state !== "closed" ? <ApplyTabs canSubmit={canSubmit} /> : null}
        </Reveal>
      </Section>

      {/* Flush: same Oat surface, so the hero's own bottom padding is the only
          separation the two need. */}
      <Section flush tight>
        <Reveal className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <KeyDatesCard />

          {state !== "closed" ? (
            <ScoringTable rows={SCORING_APPLY}>
              <p className="mt-4 max-w-measure font-sans text-body-sm text-muted">
                Something that could help several organisations, not just one, is
                especially welcome. If you are unsure whether your idea fits, apply anyway
                and we will talk it through.
              </p>
            </ScoringTable>
          ) : null}
        </Reveal>
      </Section>
    </>
  );
}
