import type { Dict } from "@/lib/dict";

/**
 * §6.8 — Clients typewriter.
 * Ghost menahan tinggi final container sejak render pertama → nol
 * CLS. motion/typewriter.js mengklon ghost jadi live, lalu memotong
 * text node secara progresif sehingga link tetap link.
 */
export default function Clients({ dict }: { dict: Dict }) {
  const segments = dict.clients.segments.map((seg, i) =>
    "href" in seg && seg.href ? (
      <a key={i} href={seg.href} data-cursor="expand">
        {seg.t}
      </a>
    ) : (
      <span key={i}>{seg.t}</span>
    )
  );

  return (
    <section
      className="section section--divided sectors-section"
      aria-labelledby="clients-label"
    >
      {/* Ornamen line art, terpotong setengah di tepi kanan.
          Dekoratif murni, jadi disembunyikan dari screen reader. */}
      <div className="sector-orbit" aria-hidden="true">
        <i className="sector-orbit-art" />
      </div>

      <div className="section-head reveal">
        <h2 className="t-label" id="clients-label">
          {dict.clients.label}
        </h2>
        <p className="t-meta">{dict.clients.meta}</p>
      </div>

      <div className="ct-stage" data-typewriter>
        <p className="ct-copy ct-ghost" aria-hidden="true">
          {segments}
        </p>
        {/* Diisi oleh motion/typewriter.js; ini yang dibaca screen reader. */}
        <p className="ct-copy ct-live">
          <span className="ct-caret" aria-hidden="true" />
        </p>
      </div>
    </section>
  );
}
