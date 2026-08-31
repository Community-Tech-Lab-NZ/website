/* The application window.
 *
 * Not in the handoff, and it has to exist: the site goes live BEFORE
 * applications open on 15 August and stays up after they close on 31 August, so
 * three states are real.
 *
 * Two things this gets deliberately right.
 *
 * TIME ZONE. "15 to 31 August" is a New Zealand date range. Boundaries are
 * declared with an explicit +12:00 offset rather than computed from the server
 * clock, because a UTC-based boundary would open the form at noon on the 15th
 * and close it at noon on the 31st, local time. New Zealand is on NZST (UTC+12)
 * for the whole of August — daylight saving ends in early April and resumes in
 * late September — so the offset is stable for this window. If a future round
 * crosses a DST boundary, use Pacific/Auckland via Intl rather than a literal
 * offset.
 *
 * INCLUSIVITY. The close boundary is the first instant of 1 September, so the
 * whole of 31 August counts as open. Someone submitting at 11:50pm on the last
 * night is inside the window, which is exactly when a 50-minute application gets
 * finished.
 */

export const WINDOW_OPENS = "2026-08-15T00:00:00+12:00";
export const WINDOW_CLOSES = "2026-09-01T00:00:00+12:00"; // exclusive

export type WindowState = "before" | "open" | "closed";

/**
 * Current state of the application window.
 *
 * `now` is injectable so tests and the verification pass can move the clock
 * without touching the system time.
 */
export function getWindowState(now: Date = new Date()): WindowState {
  // Testing override. The end-to-end submission test has to run against the real
  // Sheet BEFORE 15 August, and the window guard would otherwise reject it — so
  // without this there is no way to prove the pipeline works before the day it
  // matters.
  //
  // Server-side only: it reads an environment variable, so no visitor can set
  // it. MUST be unset before launch, or the form stays in whichever state it
  // names forever. The warning below is there to make a mistake noisy.
  const override = process.env.APPLICATION_WINDOW_OVERRIDE;
  if (override === "before" || override === "open" || override === "closed") {
    console.warn(
      `[application-window] OVERRIDE ACTIVE: forcing "${override}". Unset APPLICATION_WINDOW_OVERRIDE before launch.`,
    );
    return override;
  }

  const opens = new Date(WINDOW_OPENS).getTime();
  const closes = new Date(WINDOW_CLOSES).getTime();
  const t = now.getTime();

  if (t < opens) return "before";
  if (t >= closes) return "closed";
  return "open";
}

/* The address on the closed page, and the one exception to a brand rule.
 *
 * brand-guide.md: "No email address yet. There is no inbox that can receive
 * mail, so no address goes on the site or in the footer. All contact runs
 * through the application form until one exists." The reason it gives is that
 * no inbox exists — and this is one, so publishing it meets the reason rather
 * than defying it.
 *
 * It is still a departure, and it is a personal address on a public page, so it
 * is deliberately kept to /apply in the closed state only: not in the footer,
 * not on the closing band of five pages. Replace it the moment the programme
 * has an inbox of its own.
 *
 * It exists because closing the window otherwise closes the site's ONLY contact
 * route. Every other way in is the application form, and the closed page does
 * not render it. */
export const LATE_APPLICATION_EMAIL = "stephens.giovanni@gmail.com";

/** Copy for each state. Sentence case, no dashes, NZ English.
 *
 *  `label` and `cta` are read by the header, the footer, the home and developer
 *  heroes and the closing band on every page, which is what stops the rest of
 *  the site advertising an application that has closed. */
export const WINDOW_COPY = {
  before: {
    tag: "Opens 15 August",
    tone: "neutral" as const,
    label: "Applications open 15 to 31 August",
    cta: { label: "Apply now", href: "/apply" },
    heading: "Applications open on 15 August",
    body: "You can read every question now. Nothing can be submitted until the 15th, but coming prepared makes a real difference to a form this long.",
  },
  open: {
    tag: "Applications open",
    tone: "open" as const,
    label: "Applications open 15 to 31 August",
    cta: { label: "Apply now", href: "/apply" },
    heading: "Apply now",
    body: "Applications are open until 31 August.",
  },
  closed: {
    tag: "Applications closed",
    tone: "neutral" as const,
    label: "Applications closed 31 August",
    /* Not "Apply now" pointing at a page that cannot take one. The page it
     * leads to answers exactly this: what happens next, and what to do if you
     * missed it. */
    cta: { label: "What happens next", href: "/apply" },
    heading: "Applications have closed",
    body: "A local panel reads every application between 1 and 18 September, and the three builds are announced on 24 September. We reply to everyone.",
    /* Consideration, not acceptance. Promising a late application would be read
     * as a second deadline by everyone who made the first one. */
    contact: {
      lead: "If something got in the way, write to Giovanni at",
      email: LATE_APPLICATION_EMAIL,
      rest: "with your organisation and the problem you wanted solved, in a few sentences. Late applications are read case by case. We would rather hear from you than not.",
    },
  },
} satisfies Record<
  WindowState,
  {
    tag: string;
    tone: string;
    label: string;
    cta: { label: string; href: string };
    heading: string;
    body: string;
    /* Closed only. Optional here so the other two states stay free of it, while
     * `satisfies` still checks the shape of the one that has it. */
    contact?: { lead: string; email: string; rest: string };
  }
>;
