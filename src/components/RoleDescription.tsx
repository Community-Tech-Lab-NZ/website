import { Caret } from "./Caret";
import { CaretList } from "./CaretList";
import { Card } from "./Card";
import { ExternalLink } from "./ExternalLink";
import { Body, Eyebrow, Note } from "./Typography";
import type { Role, RoleBlock } from "@/lib/roles";

/* The full job description for one role, folded away under its row.
 *
 * Native <details>, which is the first on this site — StageBar, the mobile nav
 * and EligibilityQuestion all hand-roll the disclosure with useState and
 * aria-expanded. They are right to: every one of them already sits inside a
 * client tree and has state to coordinate. This does not. It is static copy on
 * a static page, the repo's rule is server by default, and <details> is
 * keyboard-correct, findable by the browser's own Ctrl+F, and free of
 * hydration. Three of these on the page would otherwise be three client
 * components rendering nothing but text.
 *
 * It still opens with motion rather than snapping — see .ctl-disclosure in
 * utilities.css, which animates the panel through ::details-content. That is
 * the one thing hand-rolling would have made easier, and it is now a dozen
 * lines of CSS instead of a client component per role.
 *
 * No `name` attribute, so these are NOT an exclusive accordion. Someone
 * choosing between the senior and the junior seat wants both open at once, and
 * an accordion that shuts the description they were reading to show the one
 * they just opened is the whole reason people distrust them.
 *
 * The PDF is the same content, signed off, portable and forwardable — a JD
 * often gets sent to someone else before it gets acted on. It opens in a new
 * tab rather than downloading: nothing lands in a Downloads folder unasked, and
 * every PDF viewer has a save button. ExternalLink is reused for that even
 * though the file is same-origin; the promise it encodes — new tab, and say so
 * to screen readers — is exactly the one being made here.
 */

type RoleDescriptionProps = {
  role: Role;
};

/* One titled block. "Who we're looking for" is a paragraph with no list, which
   is why items can be empty — every heading in the panel then comes from the
   same place and gets the same straight apostrophe. */
function Block({ title, block }: { title: string; block: RoleBlock }) {
  return (
    <div>
      <Eyebrow as="h4" className="mb-4">
        {title}
      </Eyebrow>
      {block.lede ? (
        <Body className={block.items.length ? "mb-4" : undefined}>{block.lede}</Body>
      ) : null}
      {block.items.length ? <CaretList items={block.items} /> : null}
      {block.note ? (
        <Note muted className="mt-4">
          {block.note}
        </Note>
      ) : null}
    </div>
  );
}

export function RoleDescription({ role }: RoleDescriptionProps) {
  const kb = Math.round(role.pdf.bytes / 1024);
  const blocks: { title: string; block: RoleBlock }[] = [
    { title: "Who we're looking for", block: { lede: role.lookingFor, items: [] } },
    { title: "What you'll do", block: role.doing },
    { title: "What we're hoping you bring", block: role.bringing },
    { title: "What you'll get", block: role.getting },
  ];

  return (
    <details className="ctl-disclosure mt-5">
      {/* inline-flex removes the list-item display the marker rides on, but
          Safari draws its own on top of that, hence the webkit rule. The grow
          and the underline sit on the label rather than the summary so the
          caret is not swept up in either. ctl-hit because a 14px line is a
          20px target, six short of WCAG 2.2's minimum. */}
      <summary className="ctl-hit group inline-flex cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden">
        <Caret
          size={12}
          thickness={2}
          color="var(--ctl-ink)"
          className="ctl-disclosure-caret"
        />
        <span className="ctl-link-grow font-sans text-body-sm text-ink underline decoration-kowhai underline-offset-[var(--link-underline-offset)] group-hover:decoration-fern">
          Read the full description
        </span>
      </summary>

      {/* Sunk rather than another hairline box: the rows already sit in a
          hairline frame, and a second border inside one of them turns the
          table into a grid of boxes. */}
      <Card tone="sunk" className="mt-5">
        <div className="grid gap-6">
          {blocks.map((b) => (
            <Block key={b.title} title={b.title} block={b.block} />
          ))}

          <ExternalLink
            href={role.pdf.href}
            className="ctl-hit ctl-link-grow justify-self-start font-sans text-body-sm text-ink underline decoration-kowhai underline-offset-[var(--link-underline-offset)] hover:decoration-fern"
          >
            Download the full description (PDF, {kb} KB)
          </ExternalLink>
        </div>
      </Card>
    </details>
  );
}
