/* Anchor for anything that leaves the site: partner sites, the funder's page,
 * the SQL privacy policy. Encodes the site-wide promise in one place —
 * external links open in a new tab, so a half-finished application is never
 * navigated away from, and they say so to screen readers.
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
