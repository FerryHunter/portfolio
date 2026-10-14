import fs from "node:fs";
import path from "node:path";
import type { CSSProperties } from "react";
import type { Dict } from "@/lib/dict";

/**
 * Section proses bersama: Research + Structure.
 *
 * Pasangannya di preview statis adalah scripts/process_sections.py —
 * dua file yang harus tetap seragam. Konten dari
 * content/<lang>.json → cases.<slug>.research / .structure (headline,
 * p1, p2, figures[]); label UI bersama dari "process".
 *
 * Pemakaian di komponen case (urutan spec: Problem → Research →
 * Structure → Approach):
 *
 *   const R = resolveProcess(data.research, "nanovest-x");
 *   const S = resolveProcess(data.structure, "nanovest-x");
 *   const num = sectionNumbers(["overview", "problem",
 *     R && "research", S && "structure", "approach", "metrics"]);
 *   ...
 *   <ProcessSections dict={dict} research={R} structure={S} numbers={num} />
 *
 * Gambar: `src` kosong → /work/<slug>/<id>.webp. Berkas ada di
 * public/ → dipakai, ukuran aslinya dibaca dari header webp. Belum
 * ada → dev: placeholder putus-putus; production: figure
 * disembunyikan + console.warn saat build.
 */

export type ProcessFigure = {
  id: string;
  src: string;
  alt: string;
  caption: string;
  zoom: boolean;
  width: number;
  height: number;
  legend: string;
};

export type ProcessContent = {
  headline: string;
  p1: string;
  p2: string;
  figures: ProcessFigure[];
};

export type ResolvedFigure = ProcessFigure & { exists: boolean; file: string };
export type ResolvedProcess = Omit<ProcessContent, "figures"> & {
  figures: ResolvedFigure[];
};

const IS_PROD = process.env.NODE_ENV === "production";
const warned = new Set<string>();

/** Nomor eyebrow dari urutan render. Entri falsy dilewati — section
 *  tanpa konten tidak memesan nomor. */
export function sectionNumbers(
  keys: Array<string | null | undefined | false>
): Record<string, string> {
  const out: Record<string, string> = {};
  keys
    .filter((k): k is string => Boolean(k))
    .forEach((k, i) => {
      out[k] = String(i + 1).padStart(2, "0");
    });
  return out;
}

/** (w, h) dari header webp — VP8X / VP8L / VP8. Algoritma yang sama
 *  dengan webp_size() di scripts/process_sections.py. */
function webpSize(b: Buffer): [number, number] | null {
  if (b.length < 30) return null;
  if (b.toString("ascii", 0, 4) !== "RIFF" || b.toString("ascii", 8, 12) !== "WEBP") {
    return null;
  }
  const kind = b.toString("ascii", 12, 16);
  if (kind === "VP8X") {
    return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
  }
  if (kind === "VP8L") {
    const b0 = b[21];
    const b1 = b[22];
    const b2 = b[23];
    const b3 = b[24];
    return [
      1 + (((b1 & 0x3f) << 8) | b0),
      1 + (((b3 & 0xf) << 10) | (b2 << 2) | ((b1 & 0xc0) >> 6)),
    ];
  }
  if (kind === "VP8 ") {
    return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  }
  return null;
}

function headerOf(file: string): Buffer {
  const fd = fs.openSync(file, "r");
  try {
    const buf = Buffer.alloc(32);
    fs.readSync(fd, buf, 0, 32, 0);
    return buf;
  } finally {
    fs.closeSync(fd);
  }
}

/** Resolusi figure terhadap public/. null = section tanpa konten sama
 *  sekali (tanpa teks, tanpa figure yang tampil) → jangan dirender. */
export function resolveProcess(
  content: ProcessContent | undefined,
  slug: string
): ResolvedProcess | null {
  if (!content) return null;

  const figures: ResolvedFigure[] = [];
  for (const f of content.figures) {
    const src = f.src || `/work/${slug}/${f.id}.webp`;
    const abs = path.join(process.cwd(), "public", src);
    const exists = fs.existsSync(abs);

    let { width, height } = f;
    if (exists && src.endsWith(".webp")) {
      const real = webpSize(headerOf(abs));
      if (real) {
        width = real[0];
        height = real[1];
      }
    }

    if (!exists && IS_PROD) {
      if (!warned.has(src)) {
        warned.add(src);
        console.warn(`[process] gambar belum ada, figure disembunyikan: public${src}`);
      }
      continue;
    }
    figures.push({ ...f, src, width, height, exists, file: src.split("/").pop() ?? src });
  }

  const hasText = Boolean(content.headline || content.p1 || content.p2);
  if (!hasText && figures.length === 0) return null;
  return { headline: content.headline, p1: content.p1, p2: content.p2, figures };
}

type Labels = Dict["process"];

/** p1/p2 boleh berisi beberapa paragraf, dipisah baris kosong ("\n\n"). */
function paragraphs(...fields: string[]): string[] {
  return fields.flatMap((f) =>
    (f || "")
      .split("\n\n")
      .map((c) => c.trim())
      .filter(Boolean)
  );
}

function Figure({ f, P }: { f: ResolvedFigure; P: Labels }) {
  const ar = f.width && f.height ? f.width / f.height : 1.6;
  const caption = f.caption ? (
    <figcaption className="t-meta case-cap">{f.caption}</figcaption>
  ) : null;
  const legend = f.legend ? <p className="t-meta case-pfig-legend">{f.legend}</p> : null;

  if (!f.exists) {
    return (
      <figure className="case-pfig reveal" id={f.id}>
        <div className="case-proc-placeholder" style={{ "--ar": ar } as CSSProperties}>
          <span className="t-eyebrow case-pfig-ph-tag">{P.missing}</span>
          <span className="case-pfig-ph-file">{f.file}</span>
          <span>{`${f.width} × ${f.height} · webp`}</span>
        </div>
        {caption}
        {legend}
      </figure>
    );
  }

  const img = (
    <img
      src={f.src}
      alt={f.alt}
      width={f.width || undefined}
      height={f.height || undefined}
      loading="lazy"
      decoding="async"
    />
  );

  return (
    <figure
      className="case-pfig reveal"
      id={f.id}
    >
      <div className="case-pfig-frame">
        {f.zoom ? (
          <button
            type="button"
            className="case-pfig-btn"
            data-zoom
            aria-haspopup="dialog"
            aria-label={f.caption ? `${P.zoom}: ${f.caption}` : P.zoom}
          >
            {img}
            <span className="case-pfig-hint" aria-hidden="true">
              <svg viewBox="0 0 14 14" width="14" height="14" fill="none" aria-hidden="true">
                <path
                  d="M8.5 1.5h4v4M5.5 12.5h-4v-4M12.5 1.5 8 6M1.5 12.5 6 8"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
              </svg>
            </span>
          </button>
        ) : (
          <div className="case-pfig-static">{img}</div>
        )}
      </div>
      {caption}
      {legend}
    </figure>
  );
}

function ProcessSection({
  id,
  label,
  num,
  data,
  P,
}: {
  id: string;
  label: string;
  num: string;
  data: ResolvedProcess;
  P: Labels;
}) {
  return (
    <section
      className="section section--divided"
      id={`process-${id}`}
      aria-labelledby={`process-${id}-label`}
    >
      <div className="case-note">
        <div className="case-note-side reveal">
          <h2 className="t-label" id={`process-${id}-label`}>
            {label}
          </h2>
          <p className="t-meta" style={{ color: "var(--ink-muted)", marginTop: 8 }}>
            {`${num} · ${P.tag}`}
          </p>
        </div>
        <div className="case-note-body">
          <div className="case-pfig-text reveal">
            <h3 className="t-detail-h case-note-h">{data.headline}</h3>
            {paragraphs(data.p1, data.p2).map((text, i) => (
              <p className="case-p" key={i}>
                {text}
              </p>
            ))}
          </div>
          {data.figures.length ? (
            <div className="case-pfigs">
              {data.figures.map((f) => (
                <Figure key={f.id} f={f} P={P} />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/** Satu <dialog> modal per halaman; motion/lightbox.js yang mengisinya. */
function Lightbox({ P }: { P: Labels }) {
  return (
    <dialog className="lb" data-lightbox aria-label={P.viewer}>
      <div className="lb-top">
        <span className="lb-count t-eyebrow" data-lb-count aria-live="polite" />
        <div className="lb-tools">
          <button type="button" data-lb-out aria-label={P.zoomOut}>
            −
          </button>
          <button type="button" data-lb-in aria-label={P.zoomIn}>
            +
          </button>
          <button type="button" data-lb-fit aria-label={P.fit}>
            1:1
          </button>
          <button type="button" data-lb-close aria-label={P.close}>
            ×
          </button>
        </div>
      </div>
      <div className="lb-stage" data-lb-stage>
        <img className="lb-img" alt="" draggable={false} />
      </div>
      <button type="button" className="lb-nav lb-prev" data-lb-prev aria-label={P.prev}>
        ‹
      </button>
      <button type="button" className="lb-nav lb-next" data-lb-next aria-label={P.next}>
        ›
      </button>
      <p className="lb-cap t-meta" data-lb-cap />
    </dialog>
  );
}

export default function ProcessSections({
  dict,
  research,
  structure,
  numbers,
  order = ["research", "structure"],
}: {
  dict: Dict;
  research: ResolvedProcess | null;
  structure: ResolvedProcess | null;
  numbers: Record<string, string>;
  /** Urutan render; default Research → Structure. Nomor tetap urusan
   *  pemanggil lewat sectionNumbers() dengan urutan yang sama. */
  order?: Array<"research" | "structure">;
}) {
  const P = dict.process;
  const data = { research, structure };
  const zoomable = [research, structure].some((s) =>
    s?.figures.some((f) => f.exists && f.zoom)
  );

  return (
    <>
      {order.map((key) => {
        const d = data[key];
        return d ? (
          <ProcessSection
            key={key}
            id={key}
            label={P[key]}
            num={numbers[key]}
            data={d}
            P={P}
          />
        ) : null;
      })}
      {zoomable ? <Lightbox P={P} /> : null}
    </>
  );
}
