import type { NextConfig } from "next";

/* No experimental flags.
 *
 * The approved cross-route fade was originally planned on React's
 * <ViewTransition>, but that component ships only in React canary — this
 * project is on stable 19.2.4, and moving a civic site to a canary React weeks
 * before launch is not a trade worth making for a fade.
 *
 * src/components/RouteFade.tsx does the same job with a keyed CSS animation: it
 * works in every browser including Firefox (which has no View Transitions API),
 * and it reads --duration-base, so prefers-reduced-motion zeroes it through the
 * existing token rather than needing a separate opt-out.
 */

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // The site loads nothing from anywhere else: fonts are self-hosted by
          // next/font, there is no analytics, no tracking and no third-party
          // embeds. That makes a strict policy cheap to hold, and it is worth
          // holding on a page where community organisations type out details
          // about the people they serve.
          //
          // KNOWN TRADE-OFF. 'unsafe-inline' on script-src keeps Chrome's Issues
          // panel unhappy (Lighthouse Best Practices 96 rather than 100). The
          // strict alternative is a per-request nonce with 'strict-dynamic',
          // which needs middleware and forces every page to render dynamically —
          // giving up static generation on five of seven routes.
          //
          // Not worth it here. The site renders no user-generated content back
          // to visitors: applications go to a Sheet and are never displayed, so
          // the XSS surface this would defend is close to nil, while the cost is
          // slower pages for people on rural connections. Revisit if the site
          // ever starts showing submitted content, which would change the
          // calculation completely.
          //
          // 'unsafe-inline' on style-src is required by Next's inlined critical
          // CSS regardless.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self'",
              "connect-src 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "object-src 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          // Nothing here needs a camera, microphone or location, and an
          // application form should not be able to ask for them.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        // Applications must never be cached by a proxy or CDN.
        source: "/api/apply",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

export default nextConfig;
