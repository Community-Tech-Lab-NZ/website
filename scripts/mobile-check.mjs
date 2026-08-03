#!/usr/bin/env node
/**
 * Checks the rendered site at real phone widths, and at settings a desktop
 * browser cannot be talked into.
 *
 * WHY THIS EXISTS. A macOS Chrome window will not go below about 500px, so the
 * narrowest thing anyone can actually look at by dragging is roughly 600 CSS
 * px — well clear of the widths that break. An iframe will not do it either:
 * next.config sends X-Frame-Options DENY. So the mobile work was being checked
 * by arithmetic, and arithmetic is what produced the bugs in the first place.
 *
 * Emulation.setDeviceMetricsOverride sets the LAYOUT viewport independently of
 * the window, which is what devtools' own device toolbar uses, and
 * setEmulatedMedia forces pointer:coarse and prefers-reduced-motion — neither
 * of which any amount of resizing can reach.
 *
 * No dependencies. Node has had a global WebSocket since 22, so the DevTools
 * protocol needs nothing installed, and adding Playwright to download a second
 * Chrome for this would be most of a gigabyte for four assertions.
 *
 * It drives its OWN Chrome, headless, with its own --user-data-dir on a
 * non-default port, so it never touches the browser you have open and cannot
 * collide with a devtools session.
 *
 * Usage:  pnpm check:mobile            (expects a dev server on :3000)
 *         BASE=http://localhost:4000 pnpm check:mobile
 */

import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const BASE = process.env.BASE || "http://localhost:3000";
const PORT = Number(process.env.CDP_PORT || 9344);

/* The widths, and why each is here.
   320 is the narrowest phone still in use and the floor WCAG 1.4.10 reflow is
   measured at. 359/360 straddle --breakpoint-xs, where the header swaps the
   wordmark for the mark alone — the one boundary on the site where a single
   pixel changes what renders. 390 and 430 are the common iPhone widths. */
const WIDTHS = [320, 359, 360, 390, 430];

const ROUTES = ["/", "/about", "/organisations", "/developers", "/apply", "/terms", "/privacy"];

/* WCAG 2.5.8 AA, which is the line this has to hold. The brand aims higher —
   --tap-target is 48px for the mobile nav — but aiming and conforming are
   different jobs, and a check that fails the build every time a small button
   renders at 42 is a check people switch off.

   Measured WITH .ctl-hit, which is the only honest way to do it here: that
   class exists precisely so a 20px line box carries a 32px target, via an
   ::after inset -6px 0. getBoundingClientRect on the anchor cannot see a
   pseudo-element, so without accounting for it every nav and footer link on
   the site reports as a failure and the real thing hides in the noise. */
const MIN_TARGET = 24;
const CTL_HIT_BLEED = 12; // ::after inset:-6px 0 — see .ctl-hit in utilities.css

const CHROME =
  process.env.CHROME_PATH ||
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const failures = [];
const fail = (where, message) => failures.push(`${where}: ${message}`);

// --- CDP plumbing ----------------------------------------------------------

const profile = mkdtempSync(join(tmpdir(), "ctl-mobile-check-"));
const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-gpu",
    "about:blank",
  ],
  { stdio: "ignore" },
);
/* unref, or this script does its work and then hangs forever. A spawned child
   keeps the parent's event loop alive on its own, so the process would sit
   there after printing its result, waiting for a Chrome that is waiting to be
   killed by the exit handler that cannot run until the loop drains. */
chrome.unref();

const cleanup = () => {
  chrome.kill();
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    // A leftover temp profile is not worth failing the run over.
  }
};
process.on("exit", cleanup);
process.on("SIGINT", () => process.exit(130));

async function endpoint() {
  for (let i = 0; i < 50; i++) {
    try {
      const list = await fetch(`http://127.0.0.1:${PORT}/json/list`).then((r) => r.json());
      const page = list.find((t) => t.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch {
      // Chrome is still starting.
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`Chrome did not expose a debugging target on ${PORT}`);
}

const ws = new WebSocket(await endpoint());
await new Promise((res, rej) => {
  ws.onopen = res;
  ws.onerror = () => rej(new Error("could not attach to Chrome"));
});

let id = 0;
const pending = new Map();
let loaded = false;
ws.onmessage = (m) => {
  const msg = JSON.parse(m.data);
  if (msg.method === "Page.loadEventFired") loaded = true;
  const entry = pending.get(msg.id);
  if (!entry) return;
  pending.delete(msg.id);
  if (msg.error) entry.reject(new Error(JSON.stringify(msg.error)));
  else entry.resolve(msg.result);
};
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const n = ++id;
    pending.set(n, { resolve, reject });
    ws.send(JSON.stringify({ id: n, method, params }));
  });

await send("Page.enable");
await send("Runtime.enable");

async function evaluate(expression) {
  const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? "eval failed");
  return r.result.value;
}

async function goto(url) {
  loaded = false;
  await send("Page.navigate", { url });
  for (let i = 0; i < 60 && !loaded; i++) await new Promise((r) => setTimeout(r, 100));
  await new Promise((r) => setTimeout(r, 400)); // fonts, and the entry reveal
}

async function emulate({ width, height = 844, coarse = true, reduce = false }) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await send("Emulation.setTouchEmulationEnabled", { enabled: coarse, maxTouchPoints: 5 });
  await send("Emulation.setEmulatedMedia", {
    features: [
      { name: "pointer", value: coarse ? "coarse" : "fine" },
      { name: "any-pointer", value: coarse ? "coarse" : "fine" },
      { name: "hover", value: coarse ? "none" : "hover" },
      { name: "prefers-reduced-motion", value: reduce ? "reduce" : "no-preference" },
    ],
  });
}

// --- The page probe, run inside the browser --------------------------------

const PROBE = `(() => {
  const de = document.documentElement;
  const over = [];
  if (de.scrollWidth > de.clientWidth + 1) {
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect();
      if (r.right > de.clientWidth + 1 && r.width > 0) {
        over.push(el.tagName.toLowerCase() + '.' + String(el.className || '').slice(0, 40).trim());
      }
    }
  }
  const small = [];
  for (const el of document.querySelectorAll('a,button,select,input:not([type=file]),textarea,summary')) {
    // Skip anything visually hidden: the skip link is a 1px sr-only box until
    // it takes focus, and a hidden panel's rows are legitimately 0.
    if (el.closest('[hidden]') || /(^| )sr-only( |$)/.test(el.className || '')) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const bleed = /(^| )ctl-hit( |$)/.test(el.className || '') ? ${CTL_HIT_BLEED} : 0;
    const side = Math.min(r.width, r.height + bleed);
    if (side < ${MIN_TARGET}) {
      small.push(el.tagName.toLowerCase() + ' "' + (el.textContent || '').trim().slice(0, 24) + '" ' + Math.round(side) + 'px');
    }
  }
  const lockups = [...document.querySelectorAll('header .ctl-lockup')]
    .map(e => getComputedStyle(e).display !== 'none');
  return {
    overflow: de.scrollWidth - de.clientWidth,
    offenders: [...new Set(over)].slice(0, 4),
    small: [...new Set(small)].slice(0, 4),
    wordmarkShown: lockups[0] ?? null,
    markShown: lockups[1] ?? null,
    animations: document.getAnimations().filter(a => a.playState === 'running').length,
  };
})()`;

// --- Run -------------------------------------------------------------------

console.log(`mobile-check → ${BASE}`);

for (const width of WIDTHS) {
  await emulate({ width });
  for (const route of ROUTES) {
    await goto(BASE + route);
    const r = await evaluate(PROBE);
    const where = `${width}px ${route}`;

    if (r.overflow > 0) {
      fail(where, `${r.overflow}px of horizontal overflow — ${r.offenders.join(", ") || "source unknown"}`);
    }
    if (r.small.length) {
      fail(where, `tap target under ${MIN_TARGET}px — ${r.small.join(", ")}`);
    }
  }

  // The header swaps the wordmark for the mark alone below --breakpoint-xs.
  await goto(BASE + "/");
  const h = await evaluate(PROBE);
  const wantWordmark = width >= 360;
  if (h.wordmarkShown !== wantWordmark || h.markShown === wantWordmark) {
    fail(
      `${width}px header`,
      `expected ${wantWordmark ? "wordmark" : "mark only"}, got wordmark=${h.wordmarkShown} mark=${h.markShown}`,
    );
  }
  console.log(`  ${String(width).padStart(4)}px  ${ROUTES.length} routes`);
}

/* The regression test for the reduced-motion fix. That block lived in the
   middle of utilities.css for months, where four of its rules lost on source
   order to the very declarations they were written to switch off — including
   the hero CTA ring, which pulsed every 5.5s for the readers who had asked it
   not to. Nothing about that was visible in review; it needed counting. */
await emulate({ width: 390, reduce: true });
await goto(BASE + "/");
await new Promise((r) => setTimeout(r, 1200));
const still = await evaluate(PROBE);
if (still.animations > 0) {
  fail("prefers-reduced-motion", `${still.animations} animation(s) still running on /`);
}
console.log(`  reduced motion: ${still.animations} running animations`);

ws.close();

if (failures.length) {
  console.error(`\n✗ ${failures.length} problem${failures.length > 1 ? "s" : ""}:`);
  for (const f of failures) console.error(`  ${f}`);
} else {
  console.log("\n✓ No mobile drift. No overflow, targets hold, reduced motion is still.");
}

/* Explicit, and not just tidiness: an open WebSocket is also a live handle, so
   falling off the end of the module would leave the process running with
   nothing left to do. */
process.exit(failures.length ? 1 : 0);
