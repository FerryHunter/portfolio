/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Gambar proyek berasal dari portfolio Framer sendiri.
      { protocol: "https", hostname: "framerusercontent.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // Rute aslinya /[lang]/work/[slug]; tautan tanpa prefiks bahasa
  // (mis. hasil share) diarahkan ke bahasa default, sama seperti `/`.
  async redirects() {
    return [{ source: "/work/:slug", destination: "/en/work/:slug", permanent: false }];
  },
  // Aset di /public disajikan Vercel dengan `max-age=0, must-revalidate`,
  // jadi tiap kunjungan ulang memvalidasi puluhan gambar satu per satu.
  // Nama berkasnya tidak ber-hash, jadi gambar memakai masa segar 1 hari
  // + stale-while-revalidate 7 hari (gambar yang diganti muncul paling
  // lambat besoknya); font tidak pernah ditimpa, jadi immutable.
  async headers() {
    const img = "public, max-age=86400, stale-while-revalidate=604800";
    const keep = (value) => [{ key: "Cache-Control", value }];
    return [
      { source: "/fonts/:path*", headers: keep("public, max-age=31536000, immutable") },
      { source: "/work/:path*", headers: keep(img) },
      { source: "/hero/:path*", headers: keep(img) },
      { source: "/favicon.ico", headers: keep(img) },
      { source: "/favicon.svg", headers: keep(img) },
      { source: "/apple-touch-icon.png", headers: keep(img) },
      { source: "/og-image.png", headers: keep(img) },
      { source: "/sitemap.xml", headers: keep("public, max-age=3600") },
      { source: "/robots.txt", headers: keep("public, max-age=3600") },
      { source: "/llms.txt", headers: keep("public, max-age=3600") },
    ];
  },
};

export default nextConfig;
