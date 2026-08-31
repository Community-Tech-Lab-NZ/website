import { CalloutBanner } from "./CalloutBanner";
import { Section } from "./Section";
import { getWindowState, WINDOW_COPY } from "@/lib/application-window";

/* The Ink band that closes every content page: same window eyebrow, same
 * action, only the title and note vary per page. Extracted so the window
 * dates live in one string and a sixth page cannot drift the arrangement.
 *
 * actionHref is the one exception, and it exists for /developers: a page that
 * has just described three roles should close on the developer form, not on the
 * community one. Everything else takes the default.
 *
 * ONCE THE WINDOW CLOSES the per-page copy is dropped and every page closes on
 * the same band. Five invitations to apply ("Ready when you are", "Bring us a
 * real problem") are five small lies the morning after the deadline, and there
 * is nothing page-specific left to say: what happens next is the same wherever
 * you were reading. The button leads to /apply, which is the one page that
 * carries the whole answer, including how to reach us if you missed it.
 */

export function ClosingCta({
  title,
  note,
  actionHref = "/apply",
}: {
  title: string;
  note: string;
  actionHref?: string;
}) {
  const state = getWindowState();
  const copy = WINDOW_COPY[state];
  const closed = state === "closed";

  return (
    <Section tone="ink" tight>
      <CalloutBanner
        bare
        eyebrow={copy.label}
        title={closed ? copy.heading : title}
        note={closed ? copy.body : note}
        actionLabel={copy.cta.label}
        actionHref={closed ? copy.cta.href : actionHref}
      />
    </Section>
  );
}
