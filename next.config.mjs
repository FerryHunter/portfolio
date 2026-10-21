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
};

export default nextConfig;
