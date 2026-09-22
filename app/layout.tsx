import type { Metadata } from "next";
import "./globals.css";

/**
 * Aeonik (situs referensi) berlisensi komersial CoType Foundry →
 * disubstitusi Switzer + JetBrains Mono sesuai §0.
 * font-display: swap ditangani oleh kedua penyedia.
 */
export const metadata: Metadata = {
  title: "Ferry Works",
  description: "UI/UX product designer — 7+ years.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=switzer@300,400,500&display=swap"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400&display=swap"
        />
      </head>
      <body className="preloading">{children}</body>
    </html>
  );
}
