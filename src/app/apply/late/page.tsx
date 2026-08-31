import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { KeyDatesCard } from "@/components/KeyDatesCard";
import { MailLink } from "@/components/MailLink";
import { Section } from "@/components/Section";
import { Reveal } from "@/components/Reveal";
import { StatusTag } from "@/components/StatusTag";
import { Body, Eyebrow, Heading, Note } from "@/components/Typography";
import { ApplyTabs } from "@/components/form/ApplyTabs";
import { APPLY_PARAM, parseApplyPath } from "@/lib/apply-path";
import { isLateWindowOpen, LATE_COPY, WINDOW_COPY } from "@/lib/application-window";

/* Late submissions. Both forms, one more week, by invitation.
 *
 * NOT LINKED AND NOT INDEXED, and that is the whole design. Nothing on the site
 * points here, sitemap.ts leaves it out, and the metadata below carries
 * noindex — so the 31 August deadline stays true for everyone who reads the
 * site, including the organisations that met it. The URL is handed to people
 * individually.
 *
 * It reuses CommunityForm and DeveloperForm exactly as /apply does, which is
 * worth more than it looks: the community draft lives in localStorage under a
 * constant key, so somebody who got four sections in on 30 August and ran out of
 * time gets all of it back here, on the same browser, for free.
 *
 * There is no 404 branch. Someone clicking this link a day late is exactly the
 * person it was sent to, and a dead end is a worse answer than an address.
 */

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  return {
    title: "Late submissions",
    /* The noindex, and the only mechanism keeping this page out of search.
       Deliberately NOT also a robots.txt disallow: that file is public, so a
       disallow line would publish the URL of the page it is hiding. */
    robots: { index: false, follow: false },
  };
}

const CONTACT = WINDOW_COPY.closed.contact;

export default async function LateApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const path = parseApplyPath((await searchParams)[APPLY_PARAM]);
  const open = isLateWindowOpen();
  const copy = open ? LATE_COPY.open : LATE_COPY.closed;

  return (
    <>
      <Section drift="hero">
        <Reveal>
          <div className="mb-4 flex flex-wrap items-center gap-4">
            <StatusTag tone={open ? "open" : "neutral"}>{copy.tag}</StatusTag>
          </div>

          <Heading level={2} as="h1">
            {copy.heading}
          </Heading>

          <Body className="mt-4">{copy.body}</Body>

          {open ? (
            <ApplyTabs canSubmit initialPath={path} basePath="/apply/late" />
          ) : (
            <Card tone="sunk" className="mt-6 max-w-measure">
              <Eyebrow>Still want to talk to us?</Eyebrow>
              <Note className="mt-3">
                {CONTACT.lead}{" "}
                <MailLink
                  address={CONTACT.email}
                  className="ctl-hit ctl-link-grow text-ink underline decoration-kowhai underline-offset-[var(--link-underline-offset)] hover:decoration-fern"
                />{" "}
                {CONTACT.rest}
              </Note>
            </Card>
          )}
        </Reveal>
      </Section>

      <Section flush tight>
        <Reveal>
          <KeyDatesCard />
        </Reveal>
      </Section>
    </>
  );
}
