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

/* Trailing punctuation, stripped.
 *
 * Chat apps decide for themselves where a pasted link ends, and they get it
 * wrong when the link is written inside brackets. Sharing the site as
 * "(check out the website I made: https://www.communitytechlab.co.nz/)"
 * linkifies as ".../)" — the closing bracket has no opening bracket *inside*
 * the URL to balance against, so it is read as part of the path.
 *
 * The trailing slash is what makes that land here rather than fail harmlessly.
 * Without it the bracket would parse as part of the hostname and the browser
 * would fall back to a search; with it, "/)" is a perfectly legal path, so the
 * request arrives, matches no route, and the reader gets the 404 page.
 *
 * This is not hypothetical — it is how the first person to be sent the link
 * from overseas arrived. A near-miss on the one URL the programme asks people
 * to share should not be a dead end, and it is not something you can fix by
 * asking everyone to write links outside their brackets forever.
 *
 * Enumerated over the real routes rather than matched with a catch-all: the
 * routes are flat and none of them are dynamic, so the cross product is exact,
 * it is readable in the build output, and it cannot construct a redirect that
 * loops back onto itself.
 */

/* The characters a linkifier will swallow off the end of a URL written inside
 * running prose. "?" is absent on purpose: it opens a query string, so it never
 * reaches the path, and Next passes query values through to the destination
 * already. */
const TRAILING_PUNCTUATION = [")", "]", "}", ">", ".", ",", ";", "!"];

/* Both spellings of each character, because redirect sources are matched
 * against the path as it arrives on the wire, not a decoded copy of it, and
 * browsers disagree about which of these need encoding. Chrome sends ")" and
 * "." through untouched — they are legal path characters — but percent-encodes
 * ">" and "}". Matching only the literal would leave half of this list quietly
 * doing nothing, which is worse than not having it: it reads as covered.
 *
 * encodeURIComponent returns several of them unchanged, so the set collapses to
 * one source for those. */
function spellings(character: string): string[] {
  return [...new Set([character, encodeURIComponent(character)])];
}

/* path-to-regexp treats "(", ")", "{", "}", ":", "*", "+" and "?" as pattern
 * syntax, so a literal one in a source has to be escaped. Everything else is
 * escaped by path-to-regexp itself and must be left alone here — escaping it
 * twice would match a backslash. */
const PATTERN_CHARS = new Set(["(", ")", "{", "}", ":", "*", "+", "?"]);

function escapeSource(text: string): string {
  return [...text].map((c) => (PATTERN_CHARS.has(c) ? `\\${c}` : c)).join("");
}

const nextConfig: NextConfig = {
  async redirects() {
    /* Routes are listed here rather than imported from src/lib/site.ts: the
     * config is loaded by the build before any path alias exists, and a stray
     * import here fails the whole build rather than one page. Seven literals
     * that change about once a year is the cheaper side of that trade. */
    const routes = [
      "",
      "apply",
      /* Needs this more than any other route: the late form is distributed ONLY
       * as a link pasted into an email or a chat message, which is exactly the
       * case the comment above was written for. */
      "apply/late",
      "organisations",
      "developers",
      "about",
      "terms",
      "privacy",
    ];

    return routes.flatMap((route) =>
      TRAILING_PUNCTUATION.flatMap(spellings).map((suffix) => ({
        source: `/${route}${escapeSource(suffix)}`,
        destination: `/${route}`,
        /* 308. A bracket on the end of a URL is permanently a mistake and the
         * page it meant is permanently this one, so the mapping will not
         * change, and saying so consolidates anything that accidentally got
         * indexed onto the real URL. */
        permanent: true,
      })),
    );
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // The site loads nothing from anywhere else: fonts are self-hosted by
          // next/font and there are no third-party embeds. That makes a strict
          // policy cheap to hold, and it is worth holding on a page where
          // community organisations type out details about the people they
          // serve.
          //
          // Vercel Web Analytics is the one exception, and it costs this policy
          // nothing because it is not third-party at run time: in production the
          // script is served from /_vercel/insights/script.js and beacons to
          // /_vercel/insights/view, both same-origin, so 'self' already covers
          // them on script-src and connect-src.
          //
          // In DEV ONLY it loads script.debug.js from va.vercel-scripts.com,
          // which this policy blocks and which shows up as a console error on
          // localhost. That is the policy working, not a fault. Do not add the
          // host to script-src to quieten it: production does not need it, and
          // adding it would widen the policy for every visitor to fix a message
          // only developers ever see.
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
