import { CalloutBanner } from "./CalloutBanner";
import { Section } from "./Section";
import { APPLICATION_WINDOW_LABEL } from "@/lib/navigation";

/* The Ink band that closes every content page: same window eyebrow, same
 * action, only the title and note vary per page. Extracted so the window
 * dates live in one string and a sixth page cannot drift the arrangement.
 *
 * actionHref is the one exception, and it exists for /developers: a page that
 * has just described three roles should close on the developer form, not on the
 * community one. Everything else takes the default. */

export function ClosingCta({
  title,
  note,
  actionHref = "/apply",
}: {
  title: string;
  note: string;
  actionHref?: string;
}) {
  return (
    <Section tone="ink" tight>
      <CalloutBanner
        bare
        eyebrow={APPLICATION_WINDOW_LABEL}
        title={title}
        note={note}
        actionLabel="Apply now"
        actionHref={actionHref}
      />
    </Section>
  );
}
