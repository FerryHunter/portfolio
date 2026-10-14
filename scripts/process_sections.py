#!/usr/bin/env python3
"""
Section proses bersama (Research, Structure) untuk halaman case study.

Pasangannya di Next adalah components/cases/ProcessSections.tsx — dua
file yang harus tetap seragam. Konten dari content/<lang>.json →
cases.<slug>.research / .structure (skema: headline, p1, p2, figures[]),
label UI bersama dari content/<lang>.json → "process".

Perilaku gambar (spec §5–§6):
- `figures[].src` kosong → nama berkas yang diharapkan diturunkan dari
  `id`: /work/<slug>/<id>.webp. Taruh berkasnya di public/work/<slug>/
  lalu jalankan ulang generator — tidak perlu mengubah JSON.
- Ukuran asli berkas (webp) dibaca dari header-nya; `width`/`height`
  di JSON hanya ukuran TARGET untuk placeholder.
- Gambar belum ada: dev (default) → kotak putus-putus berisi nama
  berkas + caption. `--prod` → figure disembunyikan. Daftar gambar
  yang belum ada dicetak di akhir (warning build).
"""
import html
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
PROD = "--prod" in sys.argv

MISSING = []  # (slug, id, path)


def lang_arg(default="en"):
    """Argumen bahasa pertama yang bukan flag (`--prod` dst.)."""
    return next((a for a in sys.argv[1:] if not a.startswith("-")), default)


def numbering(keys):
    """Nomor eyebrow dari urutan render — tidak pernah ditulis tangan,
    jadi menambah/menghapus section tidak meninggalkan lubang."""
    return {k: f"{i:02d}" for i, k in enumerate(keys, 1)}


def webp_size(path):
    """(w, h) dari header webp. Algoritma yang sama dengan webpSize()
    di ProcessSections.tsx: VP8X / VP8L / VP8."""
    b = path.read_bytes()[:32]
    if len(b) < 30 or b[:4] != b"RIFF" or b[8:12] != b"WEBP":
        return None
    kind = b[12:16]
    if kind == b"VP8X":
        return (1 + int.from_bytes(b[24:27], "little"),
                1 + int.from_bytes(b[27:30], "little"))
    if kind == b"VP8L":
        b0, b1, b2, b3 = b[21], b[22], b[23], b[24]
        return (1 + (((b1 & 0x3F) << 8) | b0),
                1 + (((b3 & 0xF) << 10) | (b2 << 2) | ((b1 & 0xC0) >> 6)))
    if kind == b"VP8 ":
        return (int.from_bytes(b[26:28], "little") & 0x3FFF,
                int.from_bytes(b[28:30], "little") & 0x3FFF)
    return None


def resolve_figure(fig, slug):
    expected = f"/work/{slug}/{fig['id']}.webp"
    src = fig.get("src") or expected
    path = PUBLIC / src.lstrip("/")
    exists = path.is_file()
    w, h = fig.get("width") or 0, fig.get("height") or 0
    if exists and path.suffix == ".webp":
        real = webp_size(path)
        if real:
            w, h = real
    if not exists:
        MISSING.append((slug, fig["id"], src))
    return {**fig, "src": src, "exists": exists, "width": w, "height": h,
            "file": src.rsplit("/", 1)[-1]}


def visible(figs):
    return [f for f in figs if f["exists"] or not PROD]


def esc(s):
    return html.escape(s or "", quote=False)


def attr(s):
    return html.escape(s or "", quote=True)


ZOOM_ICON = (
    '<svg viewBox="0 0 14 14" width="14" height="14" fill="none" aria-hidden="true">'
    '<path d="M8.5 1.5h4v4M5.5 12.5h-4v-4M12.5 1.5 8 6M1.5 12.5 6 8" '
    'stroke="currentColor" stroke-width="1.2"/></svg>')


def figure_html(f, P):
    cap = f.get("caption", "")
    cap_html = f'<figcaption class="t-meta case-cap">{esc(cap)}</figcaption>' if cap else ""
    legend = f.get("legend", "")
    legend_html = (f'<p class="t-meta case-pfig-legend">{esc(legend)}</p>'
                   if legend else "")
    w, h = f["width"], f["height"]
    ar = f"{w / h:.4f}" if w and h else "1.6"

    if not f["exists"]:
        return (
            f'<figure class="case-pfig reveal" id="{attr(f["id"])}">'
            f'<div class="case-proc-placeholder" style="--ar:{ar}">'
            f'<span class="t-eyebrow case-pfig-ph-tag">{esc(P["missing"])}</span>'
            f'<span class="case-pfig-ph-file">{esc(f["file"])}</span>'
            f'<span>{w} × {h} · webp</span></div>'
            f'{cap_html}{legend_html}</figure>')

    dims = f' width="{w}" height="{h}"' if w and h else ""
    img = (f'<img src="../public{attr(f["src"])}" alt="{attr(f.get("alt", ""))}"'
           f'{dims} loading="lazy" decoding="async">')
    if f.get("zoom"):
        label = attr(f'{P["zoom"]}: {cap}' if cap else P["zoom"])
        frame = (f'<button type="button" class="case-pfig-btn" data-zoom '
                 f'aria-haspopup="dialog" aria-label="{label}">{img}'
                 f'<span class="case-pfig-hint" aria-hidden="true">{ZOOM_ICON}</span></button>')
    else:
        frame = f'<div class="case-pfig-static">{img}</div>'
    return (f'<figure class="case-pfig reveal" id="{attr(f["id"])}">'
            f'<div class="case-pfig-frame">{frame}</div>'
            f'{cap_html}{legend_html}</figure>')


def prepare(content, slug):
    """Figure yang sudah diresolusi + yang tampil. None kalau section
    tidak punya konten sama sekali (tanpa nomor, tanpa markup)."""
    figs = visible([resolve_figure(f, slug) for f in content.get("figures", [])])
    has_text = any(content.get(k) for k in ("headline", "p1", "p2"))
    if not has_text and not figs:
        return None
    return {**content, "figures": figs}


def section_html(key, prepared, label, num, P):
    # p1/p2 boleh berisi beberapa paragraf, dipisah baris kosong ("\n\n").
    chunks = [c.strip() for k in ("p1", "p2")
              for c in (prepared.get(k) or "").split("\n\n") if c.strip()]
    paras = "".join(f'<p class="case-p">{esc(c)}</p>' for c in chunks)
    figs = "".join(figure_html(f, P) for f in prepared["figures"])
    figs_html = f'<div class="case-pfigs">{figs}</div>' if figs else ""
    return f'''
<section class="section section--divided" id="process-{key}" aria-labelledby="process-{key}-label">
  <div class="case-note">
    <div class="case-note-side reveal">
      <h2 class="t-label" id="process-{key}-label">{esc(label)}</h2>
      <p class="t-meta" style="color:var(--ink-muted); margin-top:8px">{num} · {esc(P['tag'])}</p>
    </div>
    <div class="case-note-body">
      <div class="case-pfig-text reveal">
        <h3 class="t-detail-h case-note-h">{esc(prepared.get('headline', ''))}</h3>
        {paras}
      </div>
      {figs_html}
    </div>
  </div>
</section>
'''


def lightbox_html(P):
    """Satu <dialog> modal per halaman; motion/lightbox.js yang mengisinya."""
    return f'''
<dialog class="lb" data-lightbox aria-label="{attr(P['viewer'])}">
  <div class="lb-top">
    <span class="lb-count t-eyebrow" data-lb-count aria-live="polite"></span>
    <div class="lb-tools">
      <button type="button" data-lb-out aria-label="{attr(P['zoomOut'])}">−</button>
      <button type="button" data-lb-in aria-label="{attr(P['zoomIn'])}">+</button>
      <button type="button" data-lb-fit aria-label="{attr(P['fit'])}">1:1</button>
      <button type="button" data-lb-close aria-label="{attr(P['close'])}">×</button>
    </div>
  </div>
  <div class="lb-stage" data-lb-stage><img class="lb-img" alt="" draggable="false"></div>
  <button type="button" class="lb-nav lb-prev" data-lb-prev aria-label="{attr(P['prev'])}">‹</button>
  <button type="button" class="lb-nav lb-next" data-lb-next aria-label="{attr(P['next'])}">›</button>
  <p class="lb-cap t-meta" data-lb-cap></p>
</dialog>
'''


def build(D, C, slug, keys=("research", "structure")):
    """Dict {key: html} + (prepared per key). Nomor dipakai pemanggil."""
    P = D["process"]
    return {k: prepare(C[k], slug) for k in keys if C.get(k)}, P


def report_missing():
    if not MISSING:
        return
    mode = "disembunyikan (--prod)" if PROD else "placeholder (dev)"
    print(f"⚠ {len(MISSING)} gambar proses belum ada → {mode}:")
    for slug, fid, src in MISSING:
        print(f"    public{src}   [{slug} · {fid}]")
