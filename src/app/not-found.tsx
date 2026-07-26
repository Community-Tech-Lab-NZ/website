import type { Metadata } from "next";
import { Button } from "@/components/Button";
import { CaretList } from "@/components/CaretList";
import { Section } from "@/components/Section";
import { Body, Eyebrow, Heading } from "@/components/Typography";

/* 404.
 *
 * Next ships a bare default that looks nothing like the site. A branded page
 * with real routes out matters more than usual here, because the most likely way
 * to land on it is a mistyped or stale link to the application form, shared in a
 * newsletter or a community Facebook group, by someone who then has to decide
 * whether this programme is real.
 *
 * Every link goes somewhere useful. No "go back" and no dead end.
 */

export const metadata: Metadata = {
  title: "Page not found",
  // Nothing at a broken URL is worth indexing.
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <Section>
      <div className="max-w-measure">
        <Eyebrow className="mb-4">404</Eyebrow>
        <Heading level={1} fluid>
          That page is not here.
        </Heading>
        <Body className="mt-6">
          The link may be out of date, or we may have moved something. Everything the
          programme has is below.
        </Body>

        <div className="mt-7">
          <CaretList
            items={[
              { content: "Apply, if applications are open", href: "/apply" },
              { content: "What is involved for community organisations", href: "/organisations" },
              { content: "The paid developer roles", href: "/developers" },
              { content: "Why the programme exists", href: "/about" },
              { content: "Programme terms", href: "/terms" },
            ]}
          />
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <Button variant="secondary" href="/">
            Back to the start
          </Button>
          <Button variant="outline" href="/apply">
            Apply now
          </Button>
        </div>
      </div>
    </Section>
  );
}
