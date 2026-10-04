import type { CSSProperties } from "react";
import { Arrow } from "../Arrow";
import { Words } from "../Words";
import type { Cases } from "@/lib/dict";
import type { CaseProps } from "./types";

/**
 * Case study: Rampage Evolution Card · level-up ability card system.
 *
 * Susunan section-nya mengikuti cetakan GameQuest (hero → overview →
 * scope → blocks → gallery → metrics → deliverables → next) —
 * proyek lain dari game yang sama, Rampage — dengan satu beda
 * sengaja: video interaksinya duduk di antara overview dan scope,
 * bukan sesudah blocks, karena klip "choose one to upgrade" ini
 * meringkas keseluruhan sistem kartu dalam satu napas, jadi lebih
 * pas sebagai pembuka sebelum scope merinci cakupannya. Asetnya
 * tangkapan layar landscape, jadi <Media> memakai slot
 * `.case-media` biasa, bukan varian `--phone`.
 *
 * Pasangannya di preview statis adalah
 * scripts/case_rampage_evolution_card.py — dua file yang harus
 * tetap seragam, mudah dibaca berdampingan.
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
  return (
    <div className="case-media" style={{ "--ar": ar } as CSSProperties}>
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

export default function RampageEvolutionCard({
  dict,
  lang,
  data,
}: CaseProps<Cases["rampage-evolution-card"]>) {
  const home = `/${lang}`;

  return (
    <>
      <section className="case-hero" id="top">
        <div className="case-hero-deco case-hero-deco--rampage-evolution-card" aria-hidden="true">
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
          extra="case-fig--shot case-fig--rounded-lg"
          eager
        />
      </section>

      {/* No section--divided here: the hairline sat right under the
          cover's own dark edge and read as a stray line inside it. */}
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

      {/* §6.4 — markup showreel. Duduk di sini, bukan sesudah
          blocks seperti di GameQuest: klip "choose one to upgrade"
          ini meringkas keseluruhan sistem kartu dalam satu napas,
          jadi lebih pas sebagai pembuka sebelum scope merinci
          cakupannya. Tanpa caption di bawah frame: label + tahun
          di overlay sudah cukup menjelaskan. */}
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
            // autoplay di atas attach-via-JS (bukan pengganti): beberapa
            // browser menata ulang kelayakan autoplay saat src diisi
            // lewat JS kalau atributnya memang ada sejak awal, jadi ini
            // lapisan kedua di samping media.play() di motion/reel.js.
            <video
              className="reel-media"
              data-reel-media
              data-src={data.video.src}
              poster={data.video.poster}
              autoPlay
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

          {/* Spinner loading: motion/reel.js menyembunyikannya lewat
              kelas `.loaded` begitu event `playing` menyala. */}
          {data.video.src ? (
            <div className="reel-loading" data-reel-loading aria-hidden="true">
              <span className="reel-loading-pill">
                <span className="reel-spinner" />
                <span className="t-eyebrow">{dict.ui.loading}</span>
              </span>
            </div>
          ) : null}

          {/* Tanpa tombol mute: rekamannya tidak punya trek audio, dan
              tombolnya menutupi ikon Recover HP di pojok kanan bawah. */}
          {data.video.src ? null : (
            <div className="case-video-badge" aria-hidden="true">
              <span className="t-eyebrow">{data.video.badge}</span>
            </div>
          )}
        </div>
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

      {/* Grid 2×2, bukan case-fig--wide: empat layar berdampingan
          dua-dua terbaca lebih cepat sebagai satu set state
          daripada ditumpuk satu kolom penuh per baris. */}
      <section className="section section--divided">
        <div className="section-head reveal">
          <h2 className="t-label">{data.gallery.label}</h2>
          <p className="t-meta">{data.gallery.meta}</p>
        </div>
        <div className="case-gallery">
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

        {/* data.next.href adalah path internal ("/work/{slug}").
            Sini ("rampage-evolution-card") disisipkan di siklus
            dua belas case, tepat setelah game-quest — sesama proyek
            Rampage: … → game-interface-study → game-quest →
            rampage-evolution-card → hris-dashboard →
            stiqy-dashboard → game-deployer →
            (kembali ke nanovest-calendar). */}
        <a
          className="case-next reveal"
          href={`${home}${data.next.href}`}
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
