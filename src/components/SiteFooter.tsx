import Link from "next/link";
import { Eyebrow } from "./Typography";
import { FunderCredit } from "./FunderCredit";
import { Logo } from "./Logo";
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
    <footer className="bg-ink py-6 text-body-inverse">
      <div className="mx-auto max-w-page px-gutter lg:px-gutter-lg">
        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[minmax(220px,1fr)_2fr]">
          <div>
            {/* crop, so height is the mark itself rather than the artboard.
                44% of that file is empty margin, which is why the logo read as
                small at a nominal 150px — the visible mark was 107px. At 215 it
                is genuinely twice the size and still shorter than the link
                columns beside it, so the row does not grow. */}
            <Logo variant="primary-dark" height={215} crop />
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(var(--footer-col-min),1fr))] gap-6">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <Eyebrow inverse>{col.title}</Eyebrow>
                <ul className="m-0 mt-4 grid list-none gap-3 p-0">
                  {col.links.map((link) => {
                    const style =
                      "font-sans text-body-sm text-body-inverse no-underline hover:text-kowhai";

                    /* Partner sites are absolute URLs and open in a new tab, so
                       a half-finished application is never navigated away from.
                       Plain <a>: next/link has nothing to prefetch off-site. */
                    if (link.href?.startsWith("http")) {
                      return (
                        <li key={link.label}>
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={style}
                          >
                            {link.label}
                            <span className="sr-only"> (opens in a new tab)</span>
                          </a>
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

        <div className="mt-6">
          <FunderCredit inverse />
        </div>

        <hr className="mt-6 border-0 border-t border-solid border-hairline-inverse" />

        <div className="mt-4 flex flex-wrap justify-between gap-4">
          <p className="font-meta text-label uppercase text-muted-inverse">{FOOTER_NOTE}</p>
          <p className="font-meta text-label uppercase text-muted-inverse">
            {OPEN_SOURCE_NOTE}
          </p>
        </div>
      </div>
    </footer>
  );
}
