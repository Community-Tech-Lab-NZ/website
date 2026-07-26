"use client";

import { usePathname } from "next/navigation";

/* Cross-route fade, approved in design review: the six routes should read as
 * one surface rather than six separate page loads.
 *
 * Keying on the pathname remounts the subtree on navigation, which replays the
 * CSS animation. Deliberately simple, and it beats the View Transitions API
 * here on two counts: it works in Firefox, which has no support for that API,
 * and it animates on --duration-base, so prefers-reduced-motion zeroes it
 * through the token layer instead of needing its own escape hatch.
 */

export function RouteFade({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div key={pathname} className="ctl-route-fade flex-1">
      {children}
    </div>
  );
}
