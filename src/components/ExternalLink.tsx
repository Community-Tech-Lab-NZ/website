/* Anchor for anything that leaves the page: partner sites, the funder's page,
 * the SQL privacy policy, and the role description PDFs — those are same-origin
 * files rather than another site, but the promise being made is the same one.
 * Encodes it in one place — these links open in a new tab, so a half-finished
 * application is never navigated away from, and they say so to screen readers.
 *
 * Plain <a> rather than next/link: there is nothing to prefetch off-site.
 * The sr-only suffix joins whatever names the link (its text, or an image's
 * alt), so callers must not repeat the name in their own sr-only spans. */

export function ExternalLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
