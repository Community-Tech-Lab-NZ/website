/* Anchor for an email address, and the counterpart to ExternalLink: this one
 * does NOT open a new tab, because a mail client opening is not a navigation
 * the reader needs warning about.
 *
 * A component rather than a bare <a> written inline, and that is not a style
 * choice. Prose here goes through splitWords (Typography), which crosses the
 * server/client boundary: a raw <a> nested in a Note is passed through untouched
 * on the server and wrapped in a word span on the client, and the page fails
 * hydration. A component takes the same path on both sides. ExternalLink inside
 * <Body> on /privacy is the same shape, and is why that one works. */

export function MailLink({ address, className }: { address: string; className?: string }) {
  return (
    <a href={`mailto:${address}`} className={className}>
      {address}
    </a>
  );
}
