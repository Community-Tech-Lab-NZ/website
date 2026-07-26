import type { Metadata } from "next";
import { Archivo, Source_Sans_3, Space_Mono } from "next/font/google";
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
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
