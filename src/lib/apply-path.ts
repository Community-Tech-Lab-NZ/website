/* Which of the two forms /apply opens on.
 *
 * The apply page forks into a community application and a developer one, and
 * the reader has almost always already chosen before they get there — they
 * clicked Apply next to a role, or off the developer page. Landing them on a
 * 50-minute community form and asking them to notice a tab is a real way to
 * lose someone who was one click from applying.
 *
 * So developer copy links to /apply?for=developer. Community copy links to a
 * bare /apply: community is the default, and the site's most-linked URL should
 * stay one URL rather than two that render the same thing.
 */

export const APPLY_PATHS = ["community", "developer"] as const;

export type ApplyPath = (typeof APPLY_PATHS)[number];

export const APPLY_PARAM = "for";

/** The apply URL that opens on a given form. */
export function applyHref(path: ApplyPath): string {
  return path === "community" ? "/apply" : `/apply?${APPLY_PARAM}=${path}`;
}

/** Anything unrecognised — a stale link, a hand-edited URL, a repeated param
 *  arriving as an array — falls through to the community form. A wrong value
 *  should cost a tab click, never an error page. */
export function parseApplyPath(value: string | string[] | undefined): ApplyPath {
  return APPLY_PATHS.find((path) => path === value) ?? "community";
}
