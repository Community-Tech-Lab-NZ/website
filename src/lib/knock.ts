import type { AnimationEvent, MouseEvent } from "react";

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
