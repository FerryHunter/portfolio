import type { CSSProperties } from "react";
import { Arrow } from "../Arrow";
import { Words } from "../Words";
import type { Cases } from "@/lib/dict";
import type { CaseProps } from "./types";

/**
 * Case study: Nanovest App Redesign (studi konsep, bukan klien).
 *
 * Satu komponen untuk satu proyek. Susunan section-nya sejajar
 * dengan NanovestCalendar, dan seluruh asetnya layar ponsel potret
 * utuh 780 × 1688 — tidak ada satu pun gambar yang dipotong, yang
 * dibatasi lebarnya (lihat <Media>).
 *
 * Pasangannya di preview statis adalah
 * scripts/case_nanovest_app_redesign.py — dua file yang harus tetap
 * seragam, mudah dibaca berdampingan.
 */

function Media({
  img,
  ar,
  alt = "",
  eager = false,
}: {
  img: string;
  ar: number;
  alt?: string;
  eager?: boolean;
}) {
  /* Semua aset di case ini layar ponsel utuh, jadi slotnya selalu
     --phone: rasio aslinya sendiri, nol pemotongan, dan tanpa
     latar — aset ponsel sudah membawa sudut membulatnya, dan latar
     slot akan terlihat sebagai empat siku abu-abu di ujungnya.
     Ukurannya diatur CSS lewat kelas di <figure>/kolomnya. */
  return (
    <div className="case-media case-media--phone" style={{ "--ar": ar } as CSSProperties}>
      <img src={img} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" />
    </div>
  );
}

function Figure({
  img,
  ar,
  cap,
  alt = "",
  extra = "",
  eager = false,
}: {
  img: string;
  ar: number;
  cap?: string;
  alt?: string;
  extra?: string;
  eager?: boolean;
}) {
  return (
    <figure className={`case-fig reveal ${extra}`.trim()}>
      <Media img={img} ar={ar} alt={alt} eager={eager} />
      {cap ? <figcaption className="t-meta case-cap">{cap}</figcaption> : null}
    </figure>
  );
}

export default function NanovestAppRedesign({
  dict,
  lang,
  data,
}: CaseProps<Cases["nanovest-app-redesign"]>) {
  const home = `/${lang}`;

  return (
    <>
      <section className="case-hero" id="top">
        <div className="case-hero-deco" aria-hidden="true">
          <div className="case-hero-deco-blob" />
        </div>
        <div className="case-hero-head reveal">
          <div className="case-back">
            <a className="pill t-eyebrow" href={`${home}#work`}>
              {data.back}
              <Arrow />
            </a>
            <span className="t-eyebrow case-eyebrow">{data.eyebrow}</span>
          </div>
          <h1 className="t-case-title case-title">
            <Words text={data.title} />
          </h1>
          <p className="t-detail-b case-lead">{data.lead}</p>

          {/* href kosong tidak dirender: tautan mati lebih buruk
              daripada tautan yang belum ada. */}
          {data.site.href ? (
            <a
              className="pill pill--lg t-eyebrow"
              href={data.site.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {data.site.label}
              <Arrow />
            </a>
          ) : null}
        </div>

        <dl className="case-facts reveal">
          {data.facts.map((f) => (
            <div className="case-fact" key={f.k}>
              <dt className="t-eyebrow">{f.k}</dt>
              <dd className="t-meta">{f.v}</dd>
            </div>
          ))}
        </dl>

        <Figure
          img={data.cover.img}
          ar={data.cover.ar}
          cap={data.cover.caption}
          alt={data.cover.alt}
          extra="case-fig--shot"
          eager
        />
      </section>

      <section className="section tagline-section">
        <div className="tagline-grid reveal" data-stagger="18">
          <div>
            <p className="t-label">{data.overview.label}</p>
            <p className="t-meta" style={{ color: "var(--ink-muted)", marginTop: 8 }}>
              {data.overview.meta}
            </p>
          </div>
          <p className="t-tagline tagline">
            <Words text={data.overview.text} />
          </p>
        </div>
      </section>

      {/* Satu shot besar, bukan galeri: mockup 3D dua ponsel yang
          memperlihatkan state diam & alert berdampingan. */}
      <section className="section section--divided">
        <div className="section-head reveal">
          <h2 className="t-label">{data.showcase.label}</h2>
          <p className="t-meta">{data.showcase.meta}</p>
        </div>
        <Figure
          img={data.showcase.img}
          ar={data.showcase.ar}
          cap={data.showcase.caption}
          alt={data.showcase.alt}
          extra="case-fig--shot"
        />
      </section>

      <section className="section section--divided">
        <div className="section-head reveal">
          <h2 className="t-label">{data.scope.label}</h2>
          <p className="t-meta">{data.scope.meta}</p>
        </div>
        <ol className="case-scope reveal">
          {data.scope.items.map((s, i) => (
            <li className="case-scope-item" key={s}>
              <span className="case-scope-num t-eyebrow">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="case-scope-label">{s}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* §6.4 — markup showreel, disembunyikan dulu: rekamannya belum
          ada, dan placeholder "MP4 · sementara" pun belum ingin
          ditampilkan untuk case ini. `data.video` tetap dipakai di
          bawah lewat `void` supaya lint tidak menandainya unused —
          buka kembali begitu rekamannya siap.
      <section
        className={`section section--divided case-video${
          data.video.src ? "" : " case-video--empty"
        }`}
        aria-labelledby="case-video-label"
      >
        <div className="section-head reveal">
          <h2 className="t-label" id="case-video-label">
            {data.video.label}
          </h2>
          <p className="t-meta">{data.video.meta}</p>
        </div>

        <div
          className="reel-wrap"
          data-reel
          data-dark
          style={
            { "--ar": data.video.ar, "--focus": data.video.posterFocus } as CSSProperties
          }
        >
          {data.video.src ? (
            <video
              className="reel-media"
              data-reel-media
              data-src={data.video.src}
              poster={data.video.poster}
              muted
              loop
              playsInline
              preload="none"
            />
          ) : (
            <img
              className="reel-media"
              data-reel-media
              src={data.video.poster}
              alt=""
              loading="lazy"
              decoding="async"
            />
          )}

          <div className="reel-overlay">
            <span className="reel-tag t-eyebrow">{data.video.tag}</span>
            <span className="reel-year t-eyebrow">{data.video.year}</span>
          </div>

          {data.video.src ? (
            <button
              className="reel-mute"
              data-reel-mute
              aria-pressed="false"
              aria-label={dict.reel.unmute}
            >
              <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true" fill="none">
                <path d="M1 4.5h2L6 2v8L3 7.5H1z" stroke="currentColor" strokeWidth="1.1" />
                <path
                  d="M8.5 4.2 11 6.8M11 4.2 8.5 6.8"
                  stroke="currentColor"
                  strokeWidth="1.1"
                />
              </svg>
            </button>
          ) : (
            <div className="case-video-badge" aria-hidden="true">
              <span className="t-eyebrow">{data.video.badge}</span>
            </div>
          )}
        </div>

        <p className="t-meta case-cap">{data.video.caption}</p>
      </section>
      */}

      {data.blocks.map((b) => (
        <section className="section section--divided" key={b.label}>
          <div className="case-note reveal">
            <div className="case-note-side">
              <h2 className="t-label">{b.label}</h2>
              <p className="t-meta" style={{ color: "var(--ink-muted)", marginTop: 8 }}>
                {b.meta}
              </p>
            </div>
            <div className="case-note-body">
              <h3 className="t-detail-h case-note-h">{b.heading}</h3>
              {b.body.map((p) => (
                <p className="case-p" key={p.slice(0, 32)}>
                  {p}
                </p>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="section section--divided">
        <div className="section-head reveal">
          <h2 className="t-label">{data.gallery.label}</h2>
          <p className="t-meta">{data.gallery.meta}</p>
        </div>
        <div className="case-gallery case-gallery--phones case-gallery--grid4">
          {data.gallery.items.map((g) => (
            <Figure key={g.img} img={g.img} ar={g.ar} cap={g.cap} alt={data.title} />
          ))}
        </div>
      </section>

      {/* data-dark: nav membalik warnanya di atas section ini (§6.1) */}
      <section className="section case-metrics grain" data-dark data-reveal>
        <div className="section-head">
          <h2 className="t-label">{data.metrics.label}</h2>
          <p className="t-meta">{data.metrics.meta}</p>
        </div>
        <div className="case-metrics-row">
          {data.metrics.items.map((m) => (
            <div className="case-metric" key={m.k}>
              <span className="case-metric-v">{m.v}</span>
              <span className="case-metric-k t-meta">{m.k}</span>
            </div>
          ))}
        </div>
        <p className="t-meta case-metrics-note">{data.metrics.note}</p>
      </section>

      <section className="section section--divided">
        <div className="section-head reveal">
          <h2 className="t-label">{data.deliverables.label}</h2>
          <p className="t-meta">{data.deliverables.meta}</p>
        </div>
        <ul className="service-tags case-deliverables reveal">
          {data.deliverables.items.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
      </section>

      <section className="section case-next-section">
        {/* Track diduplikasi PERSIS 2× lalu digeser -50%
            (@keyframes heroMarquee) → loop mulus, nol JS. */}
        <div className="case-marquee" aria-hidden="true">
          <div className="case-marquee-track">
            {[0, 1].map((set) => (
              <div style={{ display: "flex" }} key={set}>
                {[0, 1, 2, 3].map((i) => (
                  <span className="case-marquee-word" key={i}>
                    {data.marquee}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <a
          className="case-next reveal"
          href={data.next.href || `${home}#work`}
          {...(data.next.href ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          data-cursor="view"
          data-cursor-label={dict.projects.label}
        >
          <span className="case-next-text">
            <span className="case-next-label t-eyebrow">
              {data.next.label}
              <Arrow />
            </span>
            <span className="case-next-title t-service">{data.next.title}</span>
            <span className="case-next-cat t-meta">{data.next.cat}</span>
          </span>
          <span className="case-next-media">
            <img src={data.next.img} alt={data.next.title} loading="lazy" decoding="async" />
          </span>
        </a>
      </section>
    </>
  );
}
