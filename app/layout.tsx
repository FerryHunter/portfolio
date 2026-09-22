import type { Metadata } from "next";
import "./globals.css";

/**
 * Aeonik (situs referensi) berlisensi komersial CoType Foundry →
 * disubstitusi Switzer + JetBrains Mono sesuai §0.
 * font-display: swap ditangani oleh kedua penyedia.
 *
 * openGraph/twitter di sini sengaja tidak menyebut title/description
 * sendiri — Next.js mengambilnya dari title/description yang di-
 * resolve tiap route (root, [lang], case study), og:image tetap satu
 * gambar sitewide yang diwarisi turunan tanpa perlu diulang di sana.
 */
export const metadata: Metadata = {
  metadataBase: new URL("https://www.ferryworks.space"),
  title: "Ferry Works",
  description: "UI/UX product designer — 7+ years.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    siteName: "Ferry Works",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/og-image.png"],
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
