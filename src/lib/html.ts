/* Escaping for the two places this site assembles HTML as strings rather than
 * as JSX: the transactional emails, and the JobPosting `description` in the
 * JSON-LD.
 *
 * Everywhere else, React escapes for us and none of this is needed — which is
 * exactly why it is worth having one copy. A second, subtly different escape
 * written the next time someone needs one is how the first hole appears.
 *
 * NOT a sanitiser. It assumes the input is text that must survive as text, and
 * turns every character that could start markup into an entity. Passing it
 * markup you meant to keep will show the reader the tags.
 */

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Escaped, with the writer's own line breaks kept. Someone typing five
 *  paragraphs into a textarea should get five paragraphs back. */
export function escapeMultiline(value: string): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br>");
}
