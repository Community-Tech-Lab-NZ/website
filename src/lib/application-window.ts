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

/** Copy for each state. Sentence case, no dashes, NZ English. */
export const WINDOW_COPY = {
  before: {
    tag: "Opens 15 August",
    tone: "neutral" as const,
    heading: "Applications open on 15 August",
    body: "You can read every question now. Nothing can be submitted until the 15th, but coming prepared makes a real difference to a form this long.",
  },
  open: {
    tag: "Applications open",
    tone: "open" as const,
    heading: "Apply now",
    body: "Applications are open until 31 August.",
  },
  closed: {
    tag: "Applications closed",
    tone: "neutral" as const,
    heading: "Applications have closed",
    body: "A local panel reads every application between 1 and 18 September, and the three builds are announced on 24 September. We reply to everyone.",
  },
} satisfies Record<WindowState, { tag: string; tone: string; heading: string; body: string }>;
