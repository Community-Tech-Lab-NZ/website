import type { AnimationEvent, MouseEvent } from "react";
import { hoverCapable, prefersReducedMotion } from "./motion";

/* The vase-knock contract (see .ctl-knock in tokens/utilities.css).
 *
 * Pointer entry starts the wobble by adding is-knocked; animationend removes
 * it so the element can be knocked again. The class outlives the hover on
 * purpose — a knocked vase finishes wobbling whether or not the hand is still
 * nearby. The guard stops a re-entry mid-wobble from restarting it.
 *
 * Import these only from client components.
 */

export function knockEnter(event: MouseEvent<HTMLElement>) {
  /* Two bails before the class goes on.
     Reduced motion: the CSS sets animation:none, so animationend never fires
     and knockEnd never runs — the class would go on once and stay forever.
     Hover capability: React's onMouseEnter is a real event on touch, because
     browsers synthesise mouse events after touchend for compatibility, so
     without this a tap wobbles a heading nobody pointed at. */
  if (prefersReducedMotion() || !hoverCapable()) return;
  const zone = event.currentTarget;
  const target = zone.classList.contains("ctl-knock")
    ? zone
    : zone.querySelector<HTMLElement>(".ctl-knock");
  if (target && !target.classList.contains("is-knocked")) {
    target.classList.add("is-knocked");
  }
}

export function knockEnd(event: AnimationEvent<HTMLElement>) {
  if (event.animationName !== "ctl-knock") return;
  (event.target as HTMLElement).classList.remove("is-knocked");
}

/* The list-marker wink is SMIL point animation (see Caret's wink prop): the
 * apex descends and rises like the lockup's eye. Hovering the row starts it
 * with beginElement(); SMIL runs to completion on its own, and
 * restart="whenNotActive" refuses a re-trigger mid-blink. SMIL cannot hear
 * prefers-reduced-motion, so the trigger checks it here. */

export function winkEnter(event: MouseEvent<HTMLElement>) {
  if (prefersReducedMotion() || !hoverCapable()) return;
  const anim = event.currentTarget.querySelector<SVGAnimateElement>("animate[data-wink]");
  anim?.beginElement();
}
