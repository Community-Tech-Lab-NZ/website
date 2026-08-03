"use client";

import { useEffect, useRef } from "react";
import { hoverCapable, prefersReducedMotion } from "@/lib/motion";

/* Word knock (replaced the pond, which the owner disliked): each word the
 * pointer actually touches does a miniature version of the headers\' vase
 * wobble — a damped ±1.6° swing on its own baseline — and settles. Touch is
 * literal: pointermove events land on the word span itself, so brushing the
 * gaps between words or lines disturbs nothing. Each knock runs to
 * completion (class off on animationend), and a word cannot be re-knocked
 * mid-wobble.
 *
 * Off for reduced motion and pointerless devices.
 */

export function useWordKnock<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    if (prefersReducedMotion() || !hoverCapable()) return;

    const onMove = (event: PointerEvent) => {
      const t = event.target as HTMLElement;
      if (t !== host && t.classList?.contains("ctl-word") && !t.classList.contains("is-knocked")) {
        t.classList.add("is-knocked");
      }
    };
    const onEnd = (event: Event) => {
      const e = event as AnimationEvent;
      if (e.animationName !== "ctl-word-knock") return;
      (e.target as HTMLElement).classList.remove("is-knocked");
    };

    host.addEventListener("pointermove", onMove);
    host.addEventListener("animationend", onEnd);
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("animationend", onEnd);
    };
  }, []);

  return ref;
}
