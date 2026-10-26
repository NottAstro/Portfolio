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

export const metadata: Metadata = {
  title: "Aaryan Jain | Software Engineer",
  description: "Portfolio of Aaryan Jain — Software Engineer, Full Stack Developer, and Algorithm Enthusiast.",
  authors: [{ name: "Aaryan Jain", url: "https://github.com/NottAstro" }],
  openGraph: {
    title: "Aaryan Jain | Software Engineer",
    description: "Portfolio of Aaryan Jain — Software Engineer, Full Stack Developer, and Algorithm Enthusiast.",
    type: "website",
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
