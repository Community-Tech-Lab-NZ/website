/* The Showcase Hui's details, shared by the site and the emails. Kept apart from
 * showcase-invite.ts so pages do not pull in the email code. */

export const RSVP_URL = "https://events.humanitix.com/community-tech-lab-showcase-hui";

// The draft scripts assert this, because a wrong date in an email cannot be recalled.
export const HUI_WHEN = "Thursday 26 November, 5:30pm to 9pm";
export const HUI_VENUE = "Queenstown Resort College";
export const HUI_ADDRESS = "7 Coronation Drive, Queenstown";

// +13:00 is NZDT.
export const SHOWCASE_START = "2026-11-26T17:30:00+13:00";
export const SHOWCASE_END = "2026-11-26T21:00:00+13:00";

/** Whether the site should still be asking people to RSVP. */
export function isShowcaseAhead(now: Date = new Date()): boolean {
  return now.getTime() < new Date(SHOWCASE_END).getTime();
}
