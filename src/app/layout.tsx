import type { Metadata, Viewport } from "next";
import { Syne, DM_Mono } from "next/font/google";
import "./globals.css";

// Self-hosted at build time: no render-blocking request to Google Fonts
const syne = Syne({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-syne",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

const SITE_TITLE = "Aaryan Jain | Software Engineer";
const SITE_DESCRIPTION =
  "Portfolio of Aaryan Jain — Software Engineer, Full-Stack Developer, and Algorithm Enthusiast.";

export const metadata: Metadata = {
  // Absolute base for link-preview URLs. On Vercel, Next.js falls back to the
  // production domain automatically when NEXT_PUBLIC_SITE_URL is not set.
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
    : undefined,
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  authors: [{ name: "Aaryan Jain", url: "https://github.com/NottAstro" }],
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    siteName: "Aaryan Jain",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#0d0d0d",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${syne.variable} ${dmMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
