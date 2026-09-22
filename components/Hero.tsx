import type { CSSProperties } from "react";
import type { Dict } from "@/lib/dict";
import { Arrow } from "./Arrow";
import StickerModal from "./StickerModal";

/**
 * §6.2 — Hero.
 * Posisi DAN bentuk sticker sepenuhnya data-driven: koordinat lewat
 * CSS custom property (--x, --y, --w, --r), ragam bentuk lewat
 * `kind`. Definisinya hidup di content/*.json, jadi bisa datang
 * dari CMS tanpa menulis satu baris CSS atau JSX baru.
 */
type Sticker = {
  kind: string;
  layer: string;
  x: number;
  y: number;
  w: number;
  r: number;
  ar?: number;
  seed?: string;
  text?: string;
  emoji?: string;
};

/** Ragam bentuk, semuanya tanpa satu pun file aset. */
const KIND_CLASS: Record<string, string> = {
  emoji: "hsticker--emoji",
  photo: "",
  round: "hsticker--round",
  "blob-a": "hsticker--blob hsticker--blob-a",
  "blob-b": "hsticker--blob hsticker--blob-b",
  "blob-c": "hsticker--blob hsticker--blob-c",
  word: "hsticker--word",
  "word-ink": "hsticker--word hsticker--ink",
  "word-paper": "hsticker--word hsticker--paper",
  mark: "hsticker--mark",
};

/** Gambar garis inline — nol request, ikut warna ink. */
function Mark() {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <path d="M20 4v32M4 20h32M8.7 8.7l22.6 22.6M31.3 8.7 8.7 31.3" />
      </g>
    </svg>
  );
}

function StickerBody({ s }: { s: Sticker }) {
  if (s.kind === "emoji") return <>{s.emoji}</>;
  if (s.kind.startsWith("word")) return <>{s.text}</>;
  if (s.kind === "mark") return <Mark />;
  const ar = s.ar ?? 1;
  return (
    /* Aset placeholder — ganti dengan PNG transparan sendiri (§11) */
    <img
      src={`https://picsum.photos/seed/${s.seed}/900/${Math.round(900 / ar)}`}
      alt=""
      style={{ "--ar": ar } as CSSProperties}
      loading="eager"
      decoding="async"
    />
  );
}

function StickerLayer({
  items,
  variant,
  depth,
  target,
}: {
  items: Sticker[];
  variant: "back" | "front";
  depth: number;
  target?: boolean;
}) {
  return (
    <div
      className={`hero-stickers hero-stickers--${variant}`}
      data-depth={depth}
      aria-hidden="true"
      {...(target ? { "data-sticker-target": "" } : {})}
    >
      {items.map((s, i) => (
        <div
          key={`${s.kind}-${i}`}
          className={`hsticker ${KIND_CLASS[s.kind] ?? ""}`.trim()}
          style={
            {
              "--x": s.x,
              "--y": s.y,
              "--w": s.w,
              "--r": `${s.r}deg`,
            } as CSSProperties
          }
        >
          <div className="hsticker-inner">
            <StickerBody s={s} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Hero({ dict }: { dict: Dict }) {
  const all = dict.hero.stickers as Sticker[];
  const back = all.filter((s) => s.layer === "back");
  const front = all.filter((s) => s.layer === "front");

  // Set diduplikasi PERSIS 2× → translateX(-50%) menghasilkan
  // loop seamless tanpa JS (§12.3).
  const set = [0, 1, 2];

  return (
    <section className="hero" id="top" data-hero>
      <StickerLayer items={back} variant="back" depth={0.12} />

      <div className="hero-stage">
        <div className="hero-marquee">
          <div className="hero-reveal">
            <div className="hero-track">
              {[0, 1].map((copy) => (
                <div key={copy} style={{ display: "flex" }} aria-hidden={copy === 1}>
                  {set.map((i) => (
                    <span key={i} className="t-hero hero-word">
                      {dict.brand}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <StickerLayer items={front} variant="front" depth={0.26} target />

      <div className="hero-meta">
        <div className="hero-meta-l">
          <span className="hero-roles t-meta">
            {dict.hero.roles.map((role) => (
              <span key={role}>{role}</span>
            ))}
          </span>
          <button className="sticker-cta t-eyebrow" data-sticker-cta>
            <span className="sticker-cta-plus" aria-hidden="true">
              +
            </span>
            <span>
              {dict.hero.sticker.line1}
              <br />
              {dict.hero.sticker.line2}
            </span>
          </button>
        </div>

        <div className="hero-meta-r">
          <a className="pill t-eyebrow" href="#about">
            {dict.tagline.label}
            <Arrow />
          </a>
          <span className="scroll-cue t-meta">
            <i aria-hidden="true" />
            {dict.hero.scroll}
          </span>
        </div>
      </div>

      <StickerModal dict={dict} />
    </section>
  );
}
