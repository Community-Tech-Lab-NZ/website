import Link from "next/link";
import { Eyebrow, WordKnockText } from "./Typography";
import { Drift } from "./Drift";
import { ExternalLink } from "./ExternalLink";
import { FunderCredit } from "./FunderCredit";
import { AnimatedLockup } from "./AnimatedLockup";
import { FOOTER_COLUMNS, FOOTER_NOTE, OPEN_SOURCE_NOTE } from "@/lib/navigation";

/* Site footer on Ink: primary lockup, link columns, funder credit.
 *
 * There is deliberately NO email address here. The programme publishes no inbox,
 * and the handoff is explicit that any contact route has to be a form rather
 * than a mailto: link. The prototype's optional `email` prop is not carried
 * over, so it cannot be switched on by accident.
 *
 * The funder credit is mandatory on any page promoting the programme.
 */

export function SiteFooter() {
  return (
    /* py-6, not py-8. The 8 step is 64px, so the old padding alone was 128px of
       the footer's 700. Same reasoning for the mt-6 gaps below. */
    <footer className="relative bg-ink pt-6 pb-[var(--footer-pad-block-end)] text-body-inverse">
      {/* The footer's ambient layer is the OTHER half of the mark: cursor
          blocks floating, where the hero has carets rising. */}
      <Drift preset="footer" />
      <div className="relative mx-auto max-w-page px-gutter lg:px-gutter-lg">
        {/* auto column: the logo takes its own width and the links take the
            rest. The old minmax(220px,1fr) column was nearly twice the logo's
            width, which read as a hole in the middle of the footer. On md+ the
            link columns hug their content and sit flush right, so the row is
            logo hard left, links hard right, and the space between is one
            deliberate gap rather than three accidental ones. */}
        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[auto_1fr]">
          <div>
            {/* The big house — the caret from the old primary lockup the
                owner missed — now alive: the same blinking eye and breathing
                block as the header, without the wordmark. Out of phase with
                the header's blink, and linking home like it always did. */}
            <Link
              href="/"
              className="inline-block no-underline"
              aria-label="Community Tech Lab, home"
            >
              <AnimatedLockup dark mark size="clamp(140px, 32vw, 200px)" blinkOffset="4s" />
            </Link>
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(var(--footer-col-min),1fr))] gap-6 md:grid-cols-[repeat(3,max-content)] md:justify-end md:gap-x-12">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <Eyebrow inverse>{col.title}</Eyebrow>
                <ul className="m-0 mt-4 grid list-none gap-3 p-0">
                  {col.links.map((link) => {
                    // ctl-hit: 20px line boxes on a 32px pitch; the utility
                    // brings each to 32px of clickable height, exactly abutting.
                    const style =
                      "ctl-hit ctl-link-grow font-sans text-body-sm text-body-inverse no-underline hover:text-kowhai";

                    // Partner sites are absolute URLs; ExternalLink carries
                    // the new-tab treatment and the screen reader note.
                    if (link.href?.startsWith("http")) {
                      return (
                        <li key={link.label}>
                          <ExternalLink href={link.href} className={style}>
                            {link.label}
                          </ExternalLink>
                        </li>
                      );
                    }

                    return (
                      <li key={link.label}>
                        {link.href ? (
                          <Link href={link.href} className={style}>
                            {link.label}
                          </Link>
                        ) : (
                          <span className="font-sans text-body-sm text-body-inverse">
                            {link.label}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <hr className="mt-6 border-0 border-t border-solid border-hairline-inverse" />

        {/* One bottom bar: funder credit left, meta notes right. The credit
            used to float alone between the links and the rule, and the two
            notes wrapped onto separate left-aligned lines below it — three
            strays instead of one balanced row. The note block is capped so it
            wraps to two right-aligned lines beside the credit rather than
            forcing the row apart. */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-6">
          <FunderCredit inverse />
          <div className="max-w-[var(--footer-note-max)] md:text-right">
            <WordKnockText className="font-meta text-label uppercase text-muted-inverse">
              {FOOTER_NOTE}
            </WordKnockText>
            <WordKnockText className="mt-2 font-meta text-label uppercase text-muted-inverse">
              {OPEN_SOURCE_NOTE}
            </WordKnockText>
          </div>
        </div>
      </div>
    </footer>
  );
}
