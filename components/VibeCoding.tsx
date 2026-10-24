import type { Dict } from "@/lib/dict";

/**
 * Section highlight "Vibe coding", tepat di bawah Work.
 *
 * Masih placeholder: slot media berupa kotak putus-putus (gaya yang
 * sama dengan .case-proc-placeholder) dan teksnya contoh. Isi
 * `vibeCoding.items` di content/*.json begitu highlight aslinya ada.
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
        {v.items.map((it, i) => (
          <article className="vibe-card" key={i}>
            <div className="vibe-media" aria-hidden="true">
              <span className="t-eyebrow">{v.placeholder}</span>
            </div>
            <div className="vibe-foot">
              <div className="vibe-head">
                <span className="t-eyebrow vibe-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="t-eyebrow vibe-tag">{it.tag}</span>
              </div>
              <h3 className="vibe-title">{it.title}</h3>
              <p className="vibe-text">{it.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
