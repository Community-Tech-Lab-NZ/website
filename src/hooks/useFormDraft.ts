"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/* Local draft autosave for the community application.
 *
 * The form estimates 45 to 60 minutes of work and there is no account behind it,
 * so a refresh, a closed tab, a flat battery or a stray back button would
 * otherwise destroy the lot. This is the single highest-value piece of
 * resilience on the site.
 *
 * Deliberate choices:
 *
 * - localStorage only, no server round-trip. A server-side resume link would be
 *   better, but needs email delivery and tokens, and the window opens in weeks.
 *   The UI says "on this device" so the promise made is the one kept.
 * - The declaration checkbox and the eligibility gates are NOT persisted.
 *   Restoring a pre-ticked legal declaration someone did not tick in this
 *   session would be wrong.
 * - Saves are debounced, so typing a 150-word answer does not thrash storage.
 * - Restoring is explicit: the draft loads, and the user is told, with the
 *   option to discard. Silently repopulating a form is disorienting.
 */

const DEBOUNCE_MS = 500;

export type DraftState<T> = {
  value: T;
  setValue: (updater: T | ((prev: T) => T)) => void;
  /** True when a draft from a previous visit was loaded. */
  restored: boolean;
  /** ISO timestamp of the restored draft, if any. */
  restoredAt: string | null;
  discard: () => void;
  clear: () => void;
};

export function useFormDraft<T extends Record<string, unknown>>(
  key: string,
  initial: T,
  /** Keys never written to storage, e.g. legal confirmations. */
  omit: (keyof T)[] = [],
): DraftState<T> {
  // One state object rather than three, so restoring a draft is a single update
  // rather than a cascade of three renders.
  const [state, setState] = useState<{
    value: T;
    restored: boolean;
    restoredAt: string | null;
  }>({ value: initial, restored: false, restoredAt: null });

  const { value, restored, restoredAt } = state;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /* Only a real edit writes to storage. Was `loaded`, which merely meant the
     component had mounted, and that let two empty drafts get written — an empty
     draft being still a draft, both of which surfaced as "we restored your
     progress" over a blank form on the NEXT visit:
       - opening the page and touching nothing wrote one 500ms later;
       - Start over emptied the values, which is itself a change, so the
         debounce put the empty form straight back.
     Restoring a draft does not count as an edit either, so arriving, reading
     and leaving never rewrites what is already there. */
  const dirty = useRef(false);

  // Reading localStorage HAS to happen in an effect, not in a lazy useState
  // initialiser: the server has no localStorage, so initialising from it would
  // render different markup on server and client and break hydration. That makes
  // one setState-in-effect unavoidable here, and it is a single combined update
  // rather than a cascade.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return;

      const parsed = JSON.parse(raw) as { savedAt: string; data: Partial<T> };
      if (!parsed?.data) return;

      // eslint-disable-next-line react-hooks/set-state-in-effect -- see above
      setState((prev) => ({
        value: { ...prev.value, ...parsed.data },
        restored: true,
        restoredAt: parsed.savedAt ?? null,
      }));
    } catch {
      // A corrupt draft is not worth surfacing. Start clean.
      window.localStorage.removeItem(key);
    }
  }, [key]);

  const setValue = useCallback((updater: T | ((prev: T) => T)) => {
    dirty.current = true;
    setState((prev) => ({
      ...prev,
      value:
        typeof updater === "function" ? (updater as (p: T) => T)(prev.value) : updater,
    }));
  }, []);

  // Debounced persist.
  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (!dirty.current) return;

    timer.current = setTimeout(() => {
      try {
        const data: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(value)) {
          if (omit.includes(k as keyof T)) continue;
          data[k] = v;
        }
        window.localStorage.setItem(
          key,
          JSON.stringify({ savedAt: new Date().toISOString(), data }),
        );
      } catch {
        // Storage full or blocked (private browsing). The form still works;
        // only the safety net is gone, so fail quietly rather than alarm anyone.
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [key, value, omit]);

  const clear = useCallback(() => {
    // A write still in the debounce would land after the removal and put the
    // draft straight back. Matters most on the submit path, where what came
    // back would be a copy of an application that has already been sent.
    if (timer.current) clearTimeout(timer.current);
    try {
      window.localStorage.removeItem(key);
    } catch {
      /* nothing to do */
    }
  }, [key]);

  const discard = useCallback(() => {
    clear();
    // An empty form is not an edit, so nothing is written until someone types.
    dirty.current = false;
    setState({ value: initial, restored: false, restoredAt: null });
  }, [clear, initial]);

  return { value, setValue, restored, restoredAt, discard, clear };
}
