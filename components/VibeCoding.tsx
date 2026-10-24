import type { Dict } from "@/lib/dict";
import { Arrow } from "./Arrow";

/**
 * Section highlight "Vibe coding", tepat di bawah Work.
 *
 * Item dengan `href` dirender sebagai link keluar (tab baru), item
 * dengan `img` menampilkan gambarnya; item tanpa keduanya tetap jadi
 * kartu placeholder putus-putus. Isi `vibeCoding.items` di
 * content/*.json untuk menambah highlight.
 *
 * Pasangannya di preview statis ada di scripts/build_preview.py
 * (`vibe`) — dua file yang harus tetap seragam.
 */
export default function VibeCoding({ dict }: { dict: Dict }) {
  const v = dict.vibeCoding;

  return (
    <section
      className="section section--divided"
      id="vibe-coding"
      aria-labelledby="vibe-label"
    >
      <div className="section-head reveal">
        <h2 className="t-label" id="vibe-label">
          {v.label}
        </h2>
        <p className="t-meta">{v.meta}</p>
      </div>

      <div className="vibe-grid reveal">
        {v.items.map((it, i) => {
          const body = (
            <>
              <div
                className={it.img ? "vibe-media vibe-media--img" : "vibe-media"}
                aria-hidden={it.img ? undefined : "true"}
              >
                {it.img ? (
                  <img src={it.img} alt={it.alt} loading="lazy" decoding="async" />
                ) : (
                  <span className="t-eyebrow">{v.placeholder}</span>
                )}
              </div>
              <div className="vibe-foot">
                <div className="vibe-head">
                  <span className="t-eyebrow vibe-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="t-eyebrow vibe-tag">{it.tag}</span>
                </div>
                <h3 className="vibe-title t-detail-h">{it.title}</h3>
                <p className="vibe-text t-detail-b">{it.text}</p>
                {it.href ? (
                  <span className="vibe-cta t-eyebrow">
                    {v.visit}
                    <Arrow />
                  </span>
                ) : null}
              </div>
            </>
          );

          return it.href ? (
            <a
              className="vibe-card"
              href={it.href}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="view"
              key={i}
            >
              {body}
            </a>
          ) : (
            <article className="vibe-card" key={i}>
              {body}
            </article>
          );
        })}
      </div>
    </section>
  );
}
