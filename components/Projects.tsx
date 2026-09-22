import type { CSSProperties } from "react";
import type { Dict, Lang } from "@/lib/dict";

/**
 * §6.7 — Native horizontal scroll, bukan transform carousel.
 * Item pakai aspect ratio (--ar), bukan lebar tetap: tinggi
 * seragam, lebar mengikuti rasio asli → strip terasa editorial.
 */
export default function Projects({ dict, lang }: { dict: Dict; lang: Lang }) {
  return (
    <section className="section section--divided" id="work">
      <div className="section-head reveal">
        <h2 className="t-label">{dict.projects.label}</h2>
        <p className="t-meta">{dict.projects.meta}</p>
      </div>

      <div className="projects-stage" data-strip-stage>
        <span className="drag-badge" data-drag-badge aria-hidden="true">
          {dict.projects.hint}
        </span>

        <div
          className="projects-strip"
          data-strip
          tabIndex={0}
          role="region"
          aria-label={dict.projects.label}
        >
          {dict.projects.items.map((p) => {
            // Proyek yang belum siap dirender sebagai <div>, bukan
            // <a> — bukan href yang dimatikan, elemen ini memang
            // bukan link. Nol navigasi, nol fokus keyboard tak
            // berguna, nol cursor "view" yang menjanjikan sesuatu
            // untuk dibuka (lihat §6.7 di CSS).
            if (p.comingSoon) {
              return (
                <div
                  key={p.title}
                  className="p-item p-ar p-item--soon"
                  style={{ "--ar": p.ar } as CSSProperties}
                  aria-label={`${p.title} — ${dict.projects.comingSoon}`}
                >
                  <div className="p-media">
                    <img
                      className="p-img"
                      src={p.img}
                      alt=""
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="p-soon-badge" aria-hidden="true">
                      <span className="t-eyebrow">{dict.projects.comingSoon}</span>
                    </div>
                  </div>
                  <div className="p-foot">
                    <span className="p-title">{p.title}</span>
                    <span className="p-cat t-eyebrow">{p.cat}</span>
                  </div>
                </div>
              );
            }

            // Case study di situs ini menang atas tautan eksternal,
            // dan halaman sendiri tidak dibuka di tab baru.
            const internal = Boolean(p.case);
            const href = internal ? `/${lang}/work/${p.case}` : p.href || "#work";
            return (
              <a
                key={p.title}
                className="p-item p-ar"
                href={href}
                {...(p.href && !internal
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                style={{ "--ar": p.ar } as CSSProperties}
                data-cursor="view"
                data-cursor-label={dict.projects.label}
              >
                <div className="p-media">
                  {/* clip-path membuka sementara gambar zoom keluar:
                      dua gerakan berlawanan arah (§12.5) */}
                  <img
                    className="p-img"
                    src={p.img}
                    alt={p.title}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="p-foot">
                  <span className="p-title">{p.title}</span>
                  <span className="p-cat t-eyebrow">{p.cat}</span>
                </div>
              </a>
            );
          })}
        </div>

        {/* Afordans scroll untuk layar sentuh: di pointer coarse
            .drag-badge disembunyikan, jadi tanpa ini strip tidak
            punya penanda bahwa masih ada lanjutannya. */}
        <div className="strip-hint" data-strip-hint aria-hidden="true">
          <span className="strip-count t-meta" data-strip-count>
            01 / {String(dict.projects.items.length).padStart(2, "0")}
          </span>
          <span className="strip-track">
            <i className="strip-thumb" data-strip-thumb />
          </span>
          <span className="strip-swipe t-eyebrow">
            {dict.projects.swipe}
            <svg viewBox="0 0 10 10" fill="none" aria-hidden="true">
              <path d="M1 5h7M5.5 2 8.5 5l-3 3" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </span>
        </div>
      </div>
    </section>
  );
}
