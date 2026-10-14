import type { CSSProperties } from "react";
import { Arrow } from "../Arrow";
import { Words } from "../Words";
import type { Cases } from "@/lib/dict";
import type { CaseProps } from "./types";

/**
 * §6.11 — Case study: Nanovest · Event Calendar.
 *
 * Satu komponen untuk satu proyek, bukan template generik.
 * Seluruh aset layar ponsel adalah potret 780 × 1688 — tidak ada satu
 * pun gambar yang dipotong, yang dibatasi lebarnya.
 *
 * Pasangannya di preview statis adalah
 * scripts/case_nanovest_calendar.py — dua file yang harus tetap
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

/**
 * Process figure — wide diagram slot (IA, flows, research maps).
 * Hides entirely if src is empty (production-safe).
 * For the static preview generator the Python side shows the placeholder.
 */
function ProcFigure({
  src,
  ar = 1.6,
  alt,
  caption,
  wide = false,
}: {
  src: string;
  ar?: number;
  alt: string;
  caption?: string;
  wide?: boolean;
}) {
  if (!src) return null;
  return (
    <figure className={`case-fig reveal${wide ? " case-fig--wide" : ""}`.trim()}>
      <div className="case-media" style={{ "--ar": ar } as CSSProperties}>
        <img src={src} alt={alt} loading="lazy" decoding="async" />
      </div>
      {caption ? <figcaption className="t-meta case-cap">{caption}</figcaption> : null}
    </figure>
  );
}

/**
 * One before/after iteration block.
 * Hidden entirely when both before and after images are missing.
 */
function IterBlock({
  label,
  before,
  after,
  seen,
  changed,
  tagBefore,
  tagAfter,
}: {
  label: string;
  before: { img: string; ar: number; alt: string };
  after: { img: string; ar: number; alt: string };
  seen: string;
  changed: string;
  tagBefore: string;
  tagAfter: string;
}) {
  if (!before.img && !after.img) return null;
  return (
    <div className="case-iter">
      <p className="t-eyebrow case-iter-label">{label}</p>
      <div className="case-iter-pair">
        <div>
          <span className="t-eyebrow case-iter-slot-tag">{tagBefore}</span>
          {before.img ? (
            <div
              className={`case-media${before.ar < 1 ? " case-media--phone" : ""}`}
              style={{ "--ar": before.ar } as CSSProperties}
            >
              <img src={before.img} alt={before.alt} loading="lazy" decoding="async" />
            </div>
          ) : null}
        </div>
        <div>
          <span className="t-eyebrow case-iter-slot-tag">{tagAfter}</span>
          {after.img ? (
            <div
              className={`case-media${after.ar < 1 ? " case-media--phone" : ""}`}
              style={{ "--ar": after.ar } as CSSProperties}
            >
              <img src={after.img} alt={after.alt} loading="lazy" decoding="async" />
            </div>
          ) : null}
        </div>
      </div>
      {(seen || changed) ? (
        <div className="case-iter-notes">
          {seen ? <p>{seen}</p> : <span />}
          {changed ? <p>{changed}</p> : <span />}
        </div>
      ) : null}
    </div>
  );
}

/** Shared prose-block renderer for the .case-note grid layout. */
function NoteBlock({ b }: { b: { label: string; meta: string; heading: string; body: string[] } }) {
  return (
    <section className="section section--divided">
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
  );
}

export default function NanovestCalendar({
  dict,
  lang,
  data,
}: CaseProps<Cases["nanovest-calendar"]>) {
  const home = `/${lang}`;
  const [problem, approach] = data.blocks;
  const R = data.research;
  const S = data.structure;

  return (
    <>
      {/* ── hero ──────────────────────────────────────────────── */}
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

      {/* ── 01 · The brief — overview ─────────────────────────── */}
      <section className="section section--divided tagline-section">
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

      {/* mockup — wide figure */}
      <figure className="case-fig reveal case-fig--wide">
        <div className="case-media" style={{ "--ar": 3200 / 2400 } as CSSProperties}>
          <img
            src="/work/nanovest-calendar/event-calendar-mockup.webp"
            alt={data.title}
            loading="lazy"
            decoding="async"
          />
        </div>
      </figure>

      {/* scope list */}
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

      {/* ── video (hidden until src is filled) ────────────────── */}
      {data.video.src ? (
        <section
          className="section section--divided case-video"
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
            <div className="reel-overlay">
              <span className="reel-tag t-eyebrow">{data.video.tag}</span>
              <span className="reel-year t-eyebrow">{data.video.year}</span>
            </div>
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
          </div>

          <p className="t-meta case-cap">{data.video.caption}</p>
        </section>
      ) : null}

      {/* ── 02 · Where it broke — Problem ─────────────────────── */}
      <NoteBlock b={problem} />

      {/* ── 03 · Structure ────────────────────────────────────── */}
      {(S.ia.img || S.flow.img || S.wireframes.items.some((w) => w.img)) ? (
        <section className="section section--divided">
          <div className="case-note reveal">
            <div className="case-note-side">
              <h2 className="t-label">{S.label}</h2>
              <p className="t-meta" style={{ color: "var(--ink-muted)", marginTop: 8 }}>
                {S.meta}
              </p>
            </div>
            <div className="case-note-body">
              <div className="case-proc-head">
                <h3 className="t-detail-h case-note-h">{S.heading}</h3>
                {S.lead ? S.lead.split("\n\n").map((p, i) => (
                  <p key={i} className="case-p">{p}</p>
                )) : null}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
                {S.ia.img ? (
                  <>
                    {S.iaPath?.img ? <ProcFigure src={S.iaPath.img} ar={S.iaPath.ar} alt={S.iaPath.alt} wide /> : null}
                    <ProcFigure src={S.ia.img} ar={S.ia.ar} alt={S.ia.alt} wide />
                  </>
                ) : null}
                {S.flow.img ? (
                  <>
                    {S.flowPath?.img ? <ProcFigure src={S.flowPath.img} ar={S.flowPath.ar} alt={S.flowPath.alt} wide /> : null}
                    <ProcFigure src={S.flow.img} ar={S.flow.ar} alt={S.flow.alt} wide />
                  </>
                ) : null}
                {S.wireframes.items.some((w) => w.img) ? (
                  <div className="case-proc-row">
                    {S.wireframes.items.map((w, i) =>
                      w.img ? (
                        <figure className="case-fig reveal" key={i}>
                          <div
                            className="case-media case-media--phone"
                            style={{ "--ar": w.ar } as CSSProperties}
                          >
                            <img src={w.img} alt={w.alt} loading="lazy" decoding="async" />
                          </div>
                        </figure>
                      ) : null
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ── 04 · Research ─────────────────────────────────────── */}
      {(R.benchmark.img || R.benchmarkGaps.img) ? (
        <section className="section section--divided">
          <div className="case-note reveal">
            <div className="case-note-side">
              <h2 className="t-label">{R.label}</h2>
              <p className="t-meta" style={{ color: "var(--ink-muted)", marginTop: 8 }}>
                {R.meta}
              </p>
            </div>
            <div className="case-note-body">
              <div className="case-proc-head">
                <h3 className="t-detail-h case-note-h">{R.heading}</h3>
                {R.lead ? R.lead.split("\n\n").map((p, i) => (
                  <p key={i} className="case-p">{p}</p>
                )) : null}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
                {R.benchmark.img ? (
                  <ProcFigure
                    src={R.benchmark.img}
                    ar={R.benchmark.ar}
                    alt={R.benchmark.alt}
                    wide
                  />
                ) : null}
                {R.benchmarkGaps.img ? (
                  <ProcFigure
                    src={R.benchmarkGaps.img}
                    ar={R.benchmarkGaps.ar}
                    alt={R.benchmarkGaps.alt}
                  />
                ) : null}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ── 05 · How I worked — Approach ──────────────────────── */}
      <NoteBlock b={approach} />

      {/* ── Screens (unnumbered) ───────────────────────────────── */}
      <section className="section section--divided">
        <div className="section-head reveal">
          <h2 className="t-label">{data.gallery.label}</h2>
          <p className="t-meta">{data.gallery.meta}</p>
        </div>
        <div className="case-gallery case-gallery--phones">
          {data.gallery.items.map((g) => (
            <Figure key={g.img} img={g.img} ar={g.ar} cap={g.cap} alt={data.title} />
          ))}
        </div>
      </section>

      {/* ── 06 · After three months — Results ─────────────────── */}
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
