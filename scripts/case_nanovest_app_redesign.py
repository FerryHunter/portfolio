#!/usr/bin/env python3
"""
Generator preview statis — case study: Nanovest App Redesign.

Sepasang dengan komponennya di components/cases/NanovestAppRedesign.tsx.
Susunan section-nya sama dengan case_nanovest_calendar.py (hero →
overview → scope → video → blocks → gallery → steps → metrics →
deliverables → next) — itu yang dipakai sebagai cetakan, karena aset
di sini juga layar ponsel potret utuh 780 × 1688, jadi tidak ada satu
pun gambar yang dipotong, yang dibatasi adalah lebarnya (lihat
`media()`).

Studi konsep (bukan proyek klien, lihat `facts.Client` di JSON):
perombakan home Nanovest jadi shell yang bereaksi ke performa
portofolio, rail wawasan AI, dan wallet lintas enam mata uang.

Konten dari content/<lang>.json → "cases" → SLUG. Nav, footer,
preloader, dan cookie banner dari scripts/chrome.py — tidak disalin,
supaya tidak menyimpang dari halaman index.

Jalankan:  python3 scripts/case_nanovest_app_redesign.py [lang] [--prod]
           --prod menyembunyikan figure proses yang gambarnya belum ada
           (default dev: placeholder putus-putus).
Sajikan :  python3 -m http.server 4321   →  /preview/nanovest-app-redesign.html
"""
import json
import pathlib
import sys

from chrome import arrow, case_href, shell, words
from process_sections import (build, lang_arg, lightbox_html, numbering,
                              report_missing, section_html)

ROOT = pathlib.Path(__file__).resolve().parent.parent
LANG = lang_arg()
SLUG = "nanovest-app-redesign"

D = json.loads((ROOT / "content" / f"{LANG}.json").read_text(encoding="utf-8"))
C = D["cases"][SLUG]

# Research & Structure: section proses (scripts/process_sections.py).
# Nomor eyebrow diturunkan dari urutan render, bukan ditulis tangan di
# JSON — section tanpa konten tidak memesan nomor.
PROC, P = build(D, C, SLUG)
N = numbering(["overview", "problem"]
              + [k for k in ("research", "structure") if PROC.get(k)]
              + ["approach", "gallery", "metrics"])

HOME = "index.html" if LANG == "en" else f"index.{LANG}.html"

# Poin yang perlu konfirmasi Ferry (nanovest-case-study-copy-update.md,
# "Needs confirmation"): teks halaman TIDAK diubah, hanya diberi komentar
# HTML supaya gampang dicari.
TODO = {
    'team': 'Team shows "1 design · 3 eng", but the work involved the product team too. Needs the real line-up.',
    'role': 'Role says "Senior Product Designer". Confirm it matches the title held at Nanovest.',
    'bench': 'Benchmark numbers: the text says "more than 70" screens, the captions say "thirty". Could both be true (70 total, 30 in finance), but state it clearly.',
    'tabbar': 'Tab bar: section 04 describes Home, Invest, Grow, Wallet, but the screens in section 06 include Account and Social, and section 05 mentions "Home, Invest, Wallet or Account". These do not match.',
    'ask': '"What people can ask" paragraph is a proposed expansion. Confirm it matches what the design actually shows.',
    'static': '"Previously a static brand mark" for the centre tab icon: confirm this is accurate.',
    'naming': 'Naming: "Ask anything" and "Ask Anything" are both used. If it is a feature name, use "Ask Anything" everywhere.',
    'metrics': 'Metrics: "5 → 1" surfaces and "6 currencies". Section 04 lists four products under Invest (Crypto, Web3, Stocks, Gold). Confirm the numbers.',
}


def todo(*keys):
    return "".join(f"<!-- TODO(Ferry): {TODO[k]} -->" for k in keys)



def media(item, alt="", eager=False):
    """Slot gambar ber-aspect-ratio tetap (--ar) → nol layout shift.

    Semua aset di case ini layar ponsel utuh, jadi slotnya selalu
    `case-media--phone`: rasio aslinya sendiri, nol pemotongan, dan
    tanpa latar — aset ponsel sudah membawa sudut membulatnya, dan
    latar slot akan terlihat sebagai empat siku abu-abu di ujungnya.
    Yang mengatur ukurannya CSS, lewat kelas di elemen <figure>/kolomnya.

    Aset ditulis relatif terhadap /public di JSON supaya Next bisa
    memakainya apa adanya; halaman preview duduk di /preview/, jadi
    ia yang menambahkan prefiks.
    """
    ar = item["ar"]
    src = f'../public{item["img"]}'
    loading = "eager" if eager else "lazy"
    return (f'<div class="case-media case-media--phone" style="--ar:{ar}">'
            f'<img src="{src}" alt="{alt}" '
            f'loading="{loading}" decoding="async"></div>')


def figure(item, alt="", extra="", eager=False):
    cap = item.get("cap") or item.get("caption") or ""
    cap_html = f'<figcaption class="t-meta case-cap">{cap}</figcaption>' if cap else ""
    cls = ("case-fig reveal " + extra).strip()
    return (f'<figure class="{cls}">{media(item, alt, eager)}'
            f'{cap_html}</figure>')


# ---------- hero ----------
facts = "".join(
    f'<div class="case-fact"><dt class="t-eyebrow">{f["k"]}</dt>'
    f'<dd class="t-meta">{f["v"]}</dd></div>' for f in C["facts"])

# href kosong tidak dirender: tautan mati lebih buruk daripada
# tautan yang belum ada (sama seperti footer di halaman index).
site_link = ""
if C.get("site", {}).get("href"):
    site_link = (f'<a class="pill pill--lg t-eyebrow" href="{C["site"]["href"]}" '
                 f'target="_blank" rel="noopener noreferrer">{C["site"]["label"]}{arrow()}</a>')

hero = f'''
<section class="case-hero" id="top">
  <div class="case-hero-deco" aria-hidden="true"><div class="case-hero-deco-blob"></div></div>
  <div class="case-hero-head reveal">
    <div class="case-back">
      <a class="pill t-eyebrow" href="{HOME}#work">{C['back']}{arrow()}</a>
      <span class="t-eyebrow case-eyebrow">{C['eyebrow']}</span>
    </div>
    <h1 class="t-case-title case-title">{words(C['title'])}</h1>
    <p class="t-detail-b case-lead">{C['lead']}</p>
    {site_link}
  </div>

  <dl class="case-facts reveal">{facts}</dl>
  {todo("team", "role")}

  {figure(C['cover'], C['cover']['alt'],
          extra="case-fig--shot", eager=True)}
</section>
'''

# ---------- overview (dipinjam dari §6.5 tagline) ----------
overview = f'''
<section class="section tagline-section">
  <div class="tagline-grid reveal" data-stagger="18">
    <div>
      <p class="t-label">{C['overview']['label']}</p>
      <p class="t-meta" style="color:var(--ink-muted); margin-top:8px">{N['overview']} · {C['overview']['meta']}</p>
    </div>
    <p class="t-tagline tagline">{words(C['overview']['text'])}</p>
  </div>
</section>
'''

# ---------- showcase (satu shot besar, bukan galeri) ----------
S = C["showcase"]
showcase = f'''
<section class="section section--divided">
  <div class="section-head reveal">
    <h2 class="t-label">{S['label']}</h2>
    <p class="t-meta">{S['meta']}</p>
  </div>
  {figure(S, S['alt'], extra="case-fig--shot")}
</section>
'''

# ---------- scope ----------
scope_items = "".join(
    f'<li class="case-scope-item"><span class="case-scope-num t-eyebrow">{i:02d}</span>'
    f'<span class="case-scope-label">{s}</span></li>'
    for i, s in enumerate(C["scope"]["items"], 1))

scope = f'''
<section class="section section--divided">
  <div class="section-head reveal">
    <h2 class="t-label">{C['scope']['label']}</h2>
    <p class="t-meta">{C['scope']['meta']}</p>
  </div>
  <ol class="case-scope reveal">{scope_items}</ol>
</section>
'''


# ---------- blok prosa (problem, approach, …) ----------
def block(b, num):
    paras = "".join(f'<p class="case-p">{p}</p>' for p in b["body"])
    return f'''
<section class="section section--divided">
  <div class="case-note reveal">
    <div class="case-note-side">
      <h2 class="t-label">{b['label']}</h2>
      <p class="t-meta" style="color:var(--ink-muted); margin-top:8px">{num} · {b['meta']}</p>
    </div>
    <div class="case-note-body">
      <h3 class="t-detail-h case-note-h">{b['heading']}</h3>
      {paras}
    </div>
  </div>
</section>
'''


problem = block(C["blocks"][0], N["problem"])
approach = todo("static", "naming", "tabbar") + block(C["blocks"][1], N["approach"])

# ---------- 03/04 · Research + Structure ----------
# Urutan spec: Problem → Research → Structure → Approach. Lightbox
# hanya dirender kalau ada figure yang bisa di-zoom.
TODO_PROC = {"research": ("bench",), "structure": ("tabbar", "ask")}
process = "".join(
    todo(*TODO_PROC[k]) + section_html(k, PROC[k], P[k], N[k], P)
    for k in ("research", "structure") if PROC.get(k))
if any(f.get("zoom") for k in PROC for f in PROC[k]["figures"] if f["exists"]):
    process += lightbox_html(P)

# ---------- galeri ----------
# Kolom sempit (case-gallery--phones): layar potret di dua kolom
# lebar penuh akan berdiri setinggi 1.200px masing-masing.
gallery_items = "".join(figure(g, C["title"]) for g in C["gallery"]["items"])

gallery = todo("tabbar") + f'''
<section class="section section--divided">
  <div class="section-head reveal">
    <h2 class="t-label">{C['gallery']['label']}</h2>
    <p class="t-meta">{N['gallery']} · {C['gallery']['meta']}</p>
  </div>
  <div class="case-gallery case-gallery--phones case-gallery--grid4">{gallery_items}</div>
</section>
'''

# ---------- anatomi (langkah bernomor + satu ponsel utuh) ----------
# Bukan pita lanskap: memotong layar jadi kotak menyembunyikan
# bentuk layar yang justru sedang dibicarakan di paragrafnya.
steps_items = "".join(f'''
  <article class="case-step reveal">
    <div class="case-step-text">
      <span class="case-step-num t-eyebrow">{s['num']}</span>
      <h3 class="t-detail-h">{s['title']}</h3>
      <p class="case-p">{s['body']}</p>
    </div>
    {media(s, s['title'])}
  </article>''' for s in C["steps"]["items"])

steps = f'''
<section class="section section--divided">
  <div class="section-head reveal">
    <h2 class="t-label">{C['steps']['label']}</h2>
    <p class="t-meta">{C['steps']['meta']}</p>
  </div>
  <div class="case-steps case-steps--bento">{steps_items}</div>
</section>
'''

# ---------- video interaksi (§6.4, markup showreel) ----------
# `src` kosong = placeholder: poster yang diredupkan + badge, tanpa
# <video> sama sekali. Isi `video.src` di content/*.json begitu
# rekamannya ada di public/work/nanovest-app-redesign/ — markup-nya
# berubah sendiri, dan motion/reel.js yang meng-attach video saat
# frame mendekati viewport.
V = C["video"]
poster = f'../public{V["poster"]}' if V["poster"].startswith("/") else V["poster"]

if V["src"]:
    src = f'../public{V["src"]}' if V["src"].startswith("/") else V["src"]
    video_media = (
        f'<video class="reel-media" data-reel-media data-src="{src}" '
        f'poster="{poster}" muted loop playsinline preload="none"></video>')
    video_extra = (
        f'<button class="reel-mute" data-reel-mute aria-pressed="false" '
        f'aria-label="{D["reel"]["unmute"]}">'
        '<svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true" fill="none">'
        '<path d="M1 4.5h2L6 2v8L3 7.5H1z" stroke="currentColor" stroke-width="1.1"/>'
        '<path d="M8.5 4.2 11 6.8M11 4.2 8.5 6.8" stroke="currentColor" stroke-width="1.1"/>'
        '</svg></button>')
    empty = ""
else:
    video_media = (f'<img class="reel-media" data-reel-media src="{poster}" alt="" '
                   f'loading="lazy" decoding="async">')
    video_extra = (f'<div class="case-video-badge" aria-hidden="true">'
                   f'<span class="t-eyebrow">{V["badge"]}</span></div>')
    empty = " case-video--empty"

video = f'''
<section class="section section--divided case-video{empty}" aria-labelledby="case-video-label">
  <div class="section-head reveal">
    <h2 class="t-label" id="case-video-label">{V['label']}</h2>
    <p class="t-meta">{V['meta']}</p>
  </div>
  <div class="reel-wrap" data-reel data-dark
       style="--ar:{V['ar']}; --focus:{V['posterFocus']}">
    {video_media}
    <div class="reel-overlay">
      <span class="reel-tag t-eyebrow">{V['tag']}</span>
      <span class="reel-year t-eyebrow">{V['year']}</span>
    </div>
    {video_extra}
  </div>
  <p class="t-meta case-cap">{V['caption']}</p>
</section>
'''

# ---------- hasil (section gelap) ----------
metric_items = "".join(
    f'<div class="case-metric"><span class="case-metric-v">{m["v"]}</span>'
    f'<span class="case-metric-k t-meta">{m["k"]}</span></div>'
    for m in C["metrics"]["items"])

metrics = todo("metrics") + f'''
<section class="section case-metrics grain" data-dark data-reveal>
  <div class="section-head">
    <h2 class="t-label">{C['metrics']['label']}</h2>
    <p class="t-meta">{N['metrics']} · {C['metrics']['meta']}</p>
  </div>
  <div class="case-metrics-row">{metric_items}</div>
  <p class="t-meta case-metrics-note">{C['metrics']['note']}</p>
</section>
'''

# ---------- deliverables ----------
deliverables = f'''
<section class="section section--divided">
  <div class="section-head reveal">
    <h2 class="t-label">{C['deliverables']['label']}</h2>
    <p class="t-meta">{C['deliverables']['meta']}</p>
  </div>
  <ul class="service-tags case-deliverables reveal">
    {"".join(f"<li>{d}</li>" for d in C["deliverables"]["items"])}
  </ul>
</section>
'''

# ---------- marquee + next ----------
# Track diduplikasi PERSIS 2× lalu digeser -50% (@keyframes
# heroMarquee) → loop mulus tanpa satu baris JS.
marquee_set = "".join(f'<span class="case-marquee-word">{C["marquee"]}</span>' for _ in range(4))

n = C["next"]
nxt = f'''
<section class="section case-next-section">
  <div class="case-marquee" aria-hidden="true">
    <div class="case-marquee-track">
      <div style="display:flex">{marquee_set}</div>
      <div style="display:flex">{marquee_set}</div>
    </div>
  </div>

  <a class="case-next reveal" href="{case_href(n['href'], LANG, HOME)}"
     data-cursor="view" data-cursor-label="{D['projects']['label']}">
    <span class="case-next-text">
      <span class="case-next-label t-eyebrow">{n['label']}{arrow()}</span>
      <span class="case-next-title t-service">{n['title']}</span>
      <span class="case-next-cat t-meta">{n['cat']}</span>
    </span>
    <span class="case-next-media"><img src="../public{n['img']}" alt="{n['title']}"
          loading="lazy" decoding="async"></span>
  </a>
</section>
'''

html = shell(
    D, LANG,
    # `video` sengaja tidak disambung: rekamannya belum ada, dan
    # placeholder "MP4 · sementara" pun belum ingin ditampilkan untuk
    # case ini. Data tetap dihitung supaya tinggal disambung lagi
    # begitu rekamannya siap.
    f"{hero}{overview}{showcase}{scope}{problem}{process}{approach}{gallery}{metrics}{deliverables}{nxt}",
    title=C["meta"]["title"],
    description=C["meta"]["description"],
    home=HOME,
)

name = f"{SLUG}.html" if LANG == "en" else f"{SLUG}.{LANG}.html"
out = ROOT / "preview" / name
out.write_text(html, encoding="utf-8")
print(f"→ {out.relative_to(ROOT)}  ({len(html):,} bytes)")
report_missing()
