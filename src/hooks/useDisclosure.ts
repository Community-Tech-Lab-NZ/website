"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";

/* A panel that floats over the page, with a caret button that opens it.
 *
 * There are two of these and an applicant meets both on the same screen: the
 * mobile nav dropping out of SiteHeader, and the stage list dropping out of
 * StageBar. They were written twice, and by the time both had grown an outside
 * dismiss they were the same thirty lines with two different ref names. That is
 * the kind of duplication that stays correct right up until one of them gets a
 * fix the other does not.
 *
 * WHY NATIVE <details> IS NOT USED HERE, unlike RoleDescription: both of these
 * coordinate state their trigger also reads. The header's panel has to close on
 * a route change, and the stage bar's has to close when a row inside it is
 * chosen — neither is expressible against an element the browser owns.
 *
 * What the hook owns:
 *
 *  - Escape closes and hands focus back to the toggle. It is the only dismissal
 *    that owes the toggle back: a keyboard user has nowhere else to be.
 *  - A pointerdown outside dismisses. Neither panel has a scrim, so nothing
 *    else catches the tap on the content underneath. pointerdown rather than
 *    click, deliberately — the panel should be gone before the thing under the
 *    finger reacts, so reaching for a covered control is one gesture and not
 *    two. That matters most on the apply form, where what the panel covers is a
 *    field. No focus return on this path: the tap has already moved the
 *    reader's attention somewhere else.
 *  - The aria wiring, as prop bundles rather than advice. aria-controls has to
 *    name the panel and aria-expanded has to track the state, and a hook that
 *    hands over the id but leaves the caller to remember both is a hook that
 *    has solved the easy half.
 *
 * What it deliberately does not own: the fold. That is .ctl-drop in
 * tokens/utilities.css, applied by the caller alongside its own positioning,
 * because where the panel hangs from differs and the animation does not.
 *
 * The listeners are only attached while open, so a closed panel costs nothing.
 */
export function useDisclosure<T extends HTMLElement = HTMLElement>() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  /** Put this on whatever counts as "inside": a pointerdown anywhere within it
   *  leaves the panel open. Both callers use the element wrapping the toggle
   *  AND the panel, so tapping the toggle to close does not race the outside
   *  handler. */
  const rootRef = useRef<T>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      toggleRef.current?.focus();
    }

    function onPointerDown(event: PointerEvent) {
      if (rootRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return {
    open,
    close,
    rootRef,
    /** Spread onto the button that opens the panel. */
    triggerProps: {
      ref: toggleRef,
      type: "button" as const,
      "aria-expanded": open,
      "aria-controls": panelId,
      onClick: () => setOpen((v) => !v),
    },
    /** Spread onto the panel itself. Give it .ctl-drop and its own positioning. */
    panelProps: { id: panelId, hidden: !open },
  };
}
