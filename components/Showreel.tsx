import type { Dict } from "@/lib/dict";

/**
 * §6.4 — Showreel.
 *
 * Slot video sengaja dibiarkan kosong: isi `data-src` dengan URL
 * HLS dari Mux / Cloudflare Stream / Vercel Blob. JANGAN menyajikan
 * MP4 langsung dari Dropbox seperti situs referensi — tidak ada
 * adaptive bitrate dan rawan rate limit.
 *
 * Selama `data-src` kosong, poster yang tampil dan poster itulah
 * LCP-nya — bukan video.
 */
const REEL_SRC = ""; // ← isi dengan URL HLS/MP4 milik sendiri
const POSTER = "https://picsum.photos/seed/vs-reel/1920/1080";

export default function Showreel({ dict }: { dict: Dict }) {
  return (
    <section className="section reel-section" aria-label={dict.reel.tag}>
      <div className="reel-wrap" data-reel data-dark>
        {REEL_SRC ? (
          <video
            className="reel-media"
            data-reel-media
            data-src={REEL_SRC}
            poster={POSTER}
            muted
            loop
            playsInline
            preload="none"
          />
        ) : (
          <img
            className="reel-media"
            data-reel-media
            src={POSTER}
            alt=""
            loading="lazy"
            decoding="async"
          />
        )}

        <div className="reel-overlay">
          <span className="reel-tag t-eyebrow">{dict.reel.tag}</span>
          <span className="reel-year t-eyebrow">{dict.reel.year}</span>
        </div>

        {REEL_SRC ? (
          <button
            className="reel-mute"
            data-reel-mute
            aria-pressed="false"
            aria-label={dict.reel.unmute}
          >
            <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true" fill="none">
              <path d="M1 4.5h2L6 2v8L3 7.5H1z" stroke="currentColor" strokeWidth="1.1" />
              <path d="M8.5 4.2 11 6.8M11 4.2 8.5 6.8" stroke="currentColor" strokeWidth="1.1" />
            </svg>
          </button>
        ) : null}
      </div>
    </section>
  );
}
