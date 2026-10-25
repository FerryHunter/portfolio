import type { Metadata } from "next";
import "./globals.css";

/**
 * Aeonik (situs referensi) berlisensi komersial CoType Foundry →
 * disubstitusi Switzer + D-DIN (label, pengganti DIN komersial) sesuai §0. Fontnya di-host
 * sendiri (public/fonts, @font-face di globals.css) dan hanya dua yang
 * di-preload: Switzer 400 (wordmark + teks isi) dan D-DIN
 * 400 (label nav di atas lipatan).
 *
 * metadata di sini hanya nilai bawaan (ikon, robots, fallback OG).
 * Judul, deskripsi, canonical, hreflang, Open Graph, dan Twitter tiap
 * halaman disusun oleh pageMetadata() di lib/seo.ts, karena Next
 * mengganti objek openGraph anak secara utuh, bukan menggabungkannya.
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
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
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

// Jalan sebelum cat pertama: kalau preloader sudah pernah selesai di sesi
// ini, tandai <html> supaya CSS langsung menyembunyikannya (tanpa kilatan).
const SEEN_SCRIPT =
  "try{if(sessionStorage.getItem('fw-pre'))document.documentElement.setAttribute('data-seen','')}catch(e){}";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SEEN_SCRIPT }} />
        <link
          rel="preload"
          href="/fonts/switzer-400.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/d-din-400.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
      <body className="preloading">{children}</body>
    </html>
  );
}
