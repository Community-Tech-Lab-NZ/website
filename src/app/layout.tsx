import type { Metadata } from "next";
import { Archivo, Source_Sans_3, Space_Mono } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { RouteFade } from "@/components/RouteFade";
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
  style: ["normal", "italic"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--ff-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Community Tech Lab",
    template: "%s · Community Tech Lab",
  },
  description:
    "A civic tech initiative in the Queenstown Lakes District. We pair senior developer mentors with juniors to build open-source digital tools for local community organisations.",
  icons: {
    icon: [
      { url: "/favicons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicons/favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/favicons/favicon-192.png", sizes: "192x192" }],
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
          <style>{`.ctl-rise{opacity:1!important;transform:none!important}`}</style>
        </noscript>
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
