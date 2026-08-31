#!/usr/bin/env node
/**
 * Logic checks for the submission pipeline.
 *
 * These cover the parts that cannot be verified by looking at the page: the
 * window boundaries in New Zealand time, the eligibility gates, and the
 * anti-spam rules. Each one guards a failure that would be invisible until it
 * had already cost someone their application.
 *
 * Run: pnpm check:logic
 */

import { execSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const dir = mkdtempSync(join(tmpdir(), "ctl-logic-"));
const entry = join(dir, "run.mjs");

writeFileSync(
  entry,
  `
import { getWindowState, isLateWindowOpen, WINDOW_COPY, LATE_APPLICATION_EMAIL } from ${JSON.stringify(join(process.cwd(), "src/lib/application-window.ts"))};
import { communitySchema, developerSchema, questionSchema } from ${JSON.stringify(join(process.cwd(), "src/lib/schemas.ts"))};

const results = [];
const check = (name, actual, expected) => {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  results.push({ name, pass, actual, expected });
};

// --- Window boundaries, in New Zealand time -------------------------------
// August is NZST (UTC+12) throughout, so these are the true local boundaries.
check("day before opening", getWindowState(new Date("2026-08-14T23:59:59+12:00")), "before");
check("first instant open", getWindowState(new Date("2026-08-15T00:00:00+12:00")), "open");
check("mid window", getWindowState(new Date("2026-08-20T12:00:00+12:00")), "open");
check("last night, 11:50pm", getWindowState(new Date("2026-08-31T23:50:00+12:00")), "open");
check("last second of 31 Aug", getWindowState(new Date("2026-08-31T23:59:59+12:00")), "open");
check("first instant of 1 Sep", getWindowState(new Date("2026-09-01T00:00:00+12:00")), "closed");

// The bug a UTC boundary would cause: noon UTC on the 14th is midnight on the
// 15th in NZ, so a naive implementation opens a day early for some users.
check("UTC midnight on 15 Aug is still the 15th in NZ",
  getWindowState(new Date("2026-08-15T00:00:00Z")), "open");
check("14 Aug 1pm UTC is 15 Aug 1am NZ, so open",
  getWindowState(new Date("2026-08-14T13:00:00Z")), "open");
check("14 Aug 11am UTC is 14 Aug 11pm NZ, so not yet",
  getWindowState(new Date("2026-08-14T11:00:00Z")), "before");

// --- The late window ------------------------------------------------------
// One more week behind the deadline, for people sent the /apply/late URL. The
// route accepts a submission on the strength of this, so its boundaries carry
// the same weight as the main window's.
check("late window is shut while the main one is open",
  isLateWindowOpen(new Date("2026-08-20T12:00:00+12:00")), false);
check("still shut on the last night of the real deadline",
  isLateWindowOpen(new Date("2026-08-31T23:59:59+12:00")), false);
check("open the moment applications close",
  isLateWindowOpen(new Date("2026-09-01T00:00:00+12:00")), true);
check("open mid week", isLateWindowOpen(new Date("2026-09-03T12:00:00+12:00")), true);
check("open for the whole of 6 September",
  isLateWindowOpen(new Date("2026-09-06T23:59:59+12:00")), true);
check("shut at the first instant of 7 September",
  isLateWindowOpen(new Date("2026-09-07T00:00:00+12:00")), false);
check("stays shut afterwards, with no deploy needed",
  isLateWindowOpen(new Date("2026-10-01T12:00:00+12:00")), false);
// Same UTC trap as the main window: 6 Sep 1pm UTC is 7 Sep 1am in NZ.
check("6 Sep 1pm UTC is 7 Sep in NZ, so shut",
  isLateWindowOpen(new Date("2026-09-06T13:00:00Z")), false);

// --- Window copy ----------------------------------------------------------
// The header, the footer, both heroes and the closing band on every page read
// these. A stale label here is the whole site advertising a closed application.
check("open state says apply", WINDOW_COPY.open.cta.label, "Apply now");
check("before state says apply", WINDOW_COPY.before.cta.label, "Apply now");
check("closed state does NOT say apply",
  WINDOW_COPY.closed.cta.label.toLowerCase().includes("apply"), false);
check("closed label does not claim the window is open",
  WINDOW_COPY.closed.label.toLowerCase().includes("open"), false);
check("open label states the window", WINDOW_COPY.open.label,
  "Applications open 15 to 31 August");

// Closing the window closes the site's only contact route: /apply stops
// rendering the forms, and the question form goes with them. This address is
// what is left, so it has to be there and it has to be reachable.
check("closed state carries a contact address",
  WINDOW_COPY.closed.contact.email, LATE_APPLICATION_EMAIL);
check("the address looks like an address",
  /^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(LATE_APPLICATION_EMAIL), true);
check("no address is published while applications are open",
  "contact" in WINDOW_COPY.open || "contact" in WINDOW_COPY.before, false);

// --- Eligibility gates ----------------------------------------------------
const baseCommunity = {
  formType: "community",
  submissionId: "11111111-1111-4111-8111-111111111111",
  orgName: "Wakatipu Community Trust",
  contactName: "A Person",
  contactEmail: "a@example.nz",
  problem: "Volunteer hours are tracked on paper.",
  readinessContact: "Our coordinator, two hours a week.",
  declarationName: "A Person",
  declared: true,
  gates: [true, true, true, true, true, true],
};

check("all six gates passes", communitySchema.safeParse(baseCommunity).success, true);
check("one gate unticked fails",
  communitySchema.safeParse({ ...baseCommunity, gates: [true, true, true, true, true, false] }).success,
  false);
check("wrong number of gates fails",
  communitySchema.safeParse({ ...baseCommunity, gates: [true, true, true] }).success, false);
check("undeclared fails",
  communitySchema.safeParse({ ...baseCommunity, declared: false }).success, false);

// --- Leniency where it matters -------------------------------------------
// Every optional field absent must still validate: a community organisation
// should never lose an application to a question it was told was optional.
check("all optional fields omitted still passes",
  communitySchema.safeParse(baseCommunity).success, true);
check("unusual but valid email accepted",
  communitySchema.safeParse({ ...baseCommunity, contactEmail: "a.b+tag@sub.domain.co.nz" }).success,
  true);
check("obvious non-email rejected",
  communitySchema.safeParse({ ...baseCommunity, contactEmail: "not-an-email" }).success, false);

// --- Developer form -------------------------------------------------------
const baseDev = {
  formType: "developer",
  submissionId: "22222222-2222-4222-8222-222222222222",
  seat: "Junior developer or designer, paid",
  shipped: "github.com/example/thing",
  name: "Dev Person",
  email: "dev@example.nz",
  understood: true,
  aiUnderstood: true,
};
check("developer form passes", developerSchema.safeParse(baseDev).success, true);
check("unchecked understanding fails",
  developerSchema.safeParse({ ...baseDev, understood: false }).success, false);

check("developer must acknowledge the AI disclosure",
  developerSchema.safeParse({ ...baseDev, aiUnderstood: false }).success, false);
check("invented seat rejected",
  developerSchema.safeParse({ ...baseDev, seat: "Chief Executive" }).success, false);

// --- Question form --------------------------------------------------------
check("question form passes", questionSchema.safeParse({
  formType: "question",
  submissionId: "33333333-3333-4333-8333-333333333333",
  name: "Asker",
  email: "ask@example.nz",
  question: "We are a business but the tool serves the community, do we qualify?",
}).success, true);

// --- Honeypot -------------------------------------------------------------
// The schema must ACCEPT a filled honeypot. Rejecting it here would return a
// 400 naming the field, which tells a bot exactly what to stop filling in. The
// route discards it after validation and returns a normal success instead.
check("filled honeypot passes schema, so the route can discard it silently",
  communitySchema.safeParse({ ...baseCommunity, website: "spam" }).success, true);
check("empty honeypot accepted",
  communitySchema.safeParse({ ...baseCommunity, website: "" }).success, true);

console.log(JSON.stringify(results));
`,
);

let raw;
try {
  raw = execSync(`npx tsx ${entry}`, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
} catch (error) {
  console.error("Could not run logic checks:\n", error.stderr?.toString() ?? error.message);
  process.exit(1);
}

const results = JSON.parse(raw.trim().split("\n").pop());
const failed = results.filter((r) => !r.pass);

for (const r of results) {
  console.log(`  ${r.pass ? "✓" : "✗"} ${r.name}`);
  if (!r.pass) console.log(`      expected ${JSON.stringify(r.expected)}, got ${JSON.stringify(r.actual)}`);
}

console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
