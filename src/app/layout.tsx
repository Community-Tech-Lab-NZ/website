import type { Metadata, Viewport } from "next";
import { Archivo, Source_Sans_3, Space_Mono } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { RouteFade } from "@/components/RouteFade";
import { IS_PRODUCTION, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import {
  JsonLd,
  organizationSchema,
  programmeSchema,
  websiteSchema,
} from "@/lib/structured-data";
import "./globals.css";

/* Three faces, fixed jobs, no fourth. The --ff-* variable names stay clear of
   Tailwind's --font-* theme namespace; tokens/typography.css maps them onto
   --font-display / --font-body / --font-mono. */

const archivo = Archivo({
  variable: "--ff-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const sourceSans = Source_Sans_3({
  variable: "--ff-source-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  /* Normal only. The italic face was declared, downloaded and PRELOADED on
     every route, and nothing rendered it: no <em>, no <i>, no font-style rule,
     no italic utility anywhere in src. That is a preloaded font file on the
     critical path of every page for a face the site never draws.
     Re-add the moment something genuinely needs italics — but a real <em>
     should land in the markup in the same commit. */
  style: ["normal"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--ff-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

/* Phone browser chrome.
 *
 * manifest.ts already carries a theme_color, but that one only applies once
 * someone has installed the site to a home screen. The tag below is what mobile
 * Safari and Chrome actually read to tint the toolbar around a normal tab, and
 * without it they pick their own colour — a grey bar over an Oat page.
 *
 * Oat, not Ink: the header sits at the top of every route (SiteHeader defaults
 * to tone="oat" and nothing overrides it), so Oat is the colour the toolbar is
 * continuous with. The manifest's Ink is for the standalone splash, which is a
 * different surface.
 *
 * colorScheme is declared light because the site has no dark theme. Left unset,
 * a phone in dark mode is free to render native form controls dark against the
 * white fills in control.ts — and the application form is 32 controls long.
 *
 * Deliberately NO maximumScale or userScalable: locking zoom is a WCAG 1.4.4
 * failure, and this form is read by people who need to pinch in on it. */
export const viewport: Viewport = {
  themeColor: "#F3EFE3", // --ctl-oat, the header surface
  colorScheme: "light",
  /* The page paints to the physical screen edges instead of being letterboxed
     inside the safe area. Two things want it, and one thing depends on it.
     - Full-bleed Ink is a core device here (Section tone="ink", SiteFooter).
       Without cover, on a notched phone IN LANDSCAPE those bands stop short and
       Safari fills the gap with the page background — an Oat bar down each side
       of a black band. That is the brand device failing in exactly the
       orientation someone fills a long form in.
     - manifest.ts is display:standalone, which iOS honours. Installed, the Oat
       background_color paints a strip below the Ink footer.
     - Every env(safe-area-inset-*) resolves to 0px until this is set, so the
       select sheet's bottom padding in utilities.css was inert dead code that
       read as if it worked.

     Everything that reaches an edge already clears the cutouts, from the
     previous commit: --gutter and --gutter-lg carry max(..., env(left|right)),
     the body carries --safe-top, the footer --safe-bottom. A new full-bleed
     surface goes through those tokens or it goes under a notch.

     Deliberately NOT adding interactiveWidget. iOS ignores it, and on Android
     resizes-content would shrink the layout viewport when the keyboard opens,
     which keeps the sticky stage bar pinned inside the shrunken area and
     COVERING the field — the opposite of what StageBar's comment wants.

     And still no maximumScale or userScalable: locking zoom is a WCAG 1.4.4
     failure and this form gets pinched into. */
  viewportFit: "cover",
};

export const metadata: Metadata = {
  // Required for Open Graph: social crawlers need absolute URLs, and a relative
  // image path simply renders no card at all.
  metadataBase: new URL(SITE_URL),
  title: {
    // Brand first, place second. Almost nobody knows the programme by name yet,
    // so the place is what makes a brand search resolvable and tells a search
    // engine this is a Queenstown Lakes thing rather than a software product.
    default: `${SITE_NAME} · Queenstown Lakes`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  // Production is indexed; previews are not. robots.txt already blocks previews,
  // but a direct link to a preview page bypasses robots.txt entirely — the meta
  // tag is what actually keeps it out of the index.
  robots: IS_PRODUCTION
    ? {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, "max-image-preview": "large" },
      }
    : { index: false, follow: false },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_NZ",
    url: SITE_URL,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  /* Two different surfaces, two different assets — the transparent mark is only
     correct on one of them.
     - icon: the browser tab and Google's result list. Both composite a
       transparent PNG onto white, so the Ink-on-transparent mark is right here.
       src/app/favicon.ico is picked up by file convention alongside these and
       carries 16/32/48/256 for anything that wants an .ico.
     - apple: the iOS home screen, which composites onto BLACK and does not
       round or pad for you. The transparent Ink mark was invisible there —
       a near-black chevron on a black tile. The darkbg asset is the opaque Ink
       tile with the kowhai mark, which is what a home-screen icon needs. */
  icons: {
    icon: [
      { url: "/favicons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicons/favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/favicons/favicon-darkbg-192.png", sizes: "192x192" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-NZ"
      className={`${archivo.variable} ${sourceSans.variable} ${spaceMono.variable} h-full`}
    >
      <head>
        {/* .ctl-rise starts at opacity 0 and is revealed by an
            IntersectionObserver. Without JS nothing would ever reveal it, so
            neutralise the class entirely rather than leave a civic site blank. */}
        <noscript>
          <style>{`.ctl-rise,.ctl-rule-draw,.ctl-spine-draw,.ctl-node-fade{opacity:1!important;transform:none!important}.ctl-sweep-gold{background-size:100% .28em!important}`}</style>
        </noscript>
        {/* Site-wide structured data. Page-specific schemas are added by the
            routes that need them. */}
        <JsonLd data={[organizationSchema(), websiteSchema(), programmeSchema()]} />
      </head>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-10 focus:m-3 focus:rounded-card focus:bg-ink focus:px-4 focus:py-3 focus:font-heading focus:text-body-sm focus:font-bold focus:text-oat"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex flex-1 flex-col">
          <RouteFade>{children}</RouteFade>
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
