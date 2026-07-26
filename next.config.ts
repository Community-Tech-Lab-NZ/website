import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* No experimental flags.
   *
   * The approved cross-route fade was originally planned on React's
   * <ViewTransition>, but that component ships only in React canary — this
   * project is on stable 19.2.4, and moving a civic site to a canary React
   * weeks before launch is not a trade worth making for a fade.
   *
   * src/components/RouteFade.tsx does the same job with a keyed CSS animation:
   * it works in every browser including Firefox (which has no View Transitions
   * API), and it reads --duration-base, so prefers-reduced-motion zeroes it
   * through the existing token rather than needing a separate opt-out.
   */
};

export default nextConfig;
