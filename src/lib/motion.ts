/* The two questions every motion handler on this site has to ask.
 *
 * Both were being asked inline, in four different files, with the media query
 * string written out by hand each time — and two of the five places that
 * needed them were not asking at all. One module, so a new effect has an
 * obvious thing to call and the strings cannot drift.
 *
 * PREDICATES, NOT HOOKS, and that is deliberate:
 *
 *  - window.matchMedia does not exist on the server. A hook would return false
 *    during SSR and the truth after mount, so using it to decide whether to
 *    attach a handler is a hydration mismatch. Doing it properly needs
 *    useSyncExternalStore with a server snapshot — a lot of machinery for a
 *    value only ever read inside an event handler, where the answer is
 *    available for free.
 *  - Three of the callers are plain functions, not components: knockEnter and
 *    winkEnter in lib/knock.ts, and breatheStart inside AnimatedLockup. A hook
 *    cannot serve them.
 *  - Read at event time, the answer is always current. Plug a trackpad into an
 *    iPad mid-session and the very next hover works; a hook would have
 *    snapshotted at mount unless it also carried a change listener.
 *
 * Call these from event handlers and effects only, never during render.
 */

/** True when the primary pointer can hover — a mouse or trackpad, not a finger.
 *
 *  `hover`, not `pointer: fine`, because hover capability is the actual
 *  question: on a touch screen `:hover` latches on tap and stays until the user
 *  taps something else, so a hover effect there is a stuck state rather than a
 *  transient one. (The select picker's `@media (pointer:coarse)` in
 *  tokens/utilities.css is a different question — target size, not hover — and
 *  the two should not be unified.)
 *
 *  Known limit, accepted: a touchscreen laptop reports hover capability, so a
 *  finger tap on one still runs the effect. The exact fix is checking
 *  `pointerType !== "touch"` on a pointerenter event, which means changing the
 *  event those five call sites listen to. Not worth mixing two mechanisms. */
export function hoverCapable(): boolean {
  return window.matchMedia("(hover: hover)").matches;
}

/** True when the reader has asked their system for less motion.
 *
 *  Checked in JS as well as CSS because several effects are driven by adding a
 *  class and removing it when its animation ends. Under reduced motion the CSS
 *  sets `animation: none`, so animationend never fires and the class would be
 *  added once and never cleared. The bail belongs before the class goes on. */
export function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
