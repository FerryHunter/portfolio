#!/usr/bin/env python3
"""
Generator preview statis — halaman index.

Menghasilkan preview/index.html dari content/<lang>.json dengan
markup yang mencerminkan components/*.tsx, lalu memuat
app/globals.css dan motion/index.js yang SAMA PERSIS dengan yang
dipakai Next.js. Tujuannya: bisa melihat & menguji seluruh
interaksi tanpa Node terpasang, tanpa risiko markup menyimpang.

Nav, footer, preloader, cookie banner, dan shell <html> datang
dari scripts/chrome.py — dipakai bersama halaman case study.

Jalankan:  python3 scripts/build_preview.py
Sajikan :  python3 -m http.server 4321   →  /preview/
"""
import json
import pathlib
import sys

from chrome import arrow, case_page, pill, shell, words

ROOT = pathlib.Path(__file__).resolve().parent.parent
LANG = sys.argv[1] if len(sys.argv) > 1 else "en"
D = json.loads((ROOT / "content" / f"{LANG}.json").read_text(encoding="utf-8"))



# ---------- hero (§6.2) ----------
# Ragam bentuk sticker, semuanya tanpa satu pun file aset.
KIND_CLASS = {
    "emoji": "hsticker--emoji",
    "photo": "",
    "round": "hsticker--round",
    "blob-a": "hsticker--blob hsticker--blob-a",
    "blob-b": "hsticker--blob hsticker--blob-b",
    "blob-c": "hsticker--blob hsticker--blob-c",
    "word": "hsticker--word",
    "word-ink": "hsticker--word hsticker--ink",
    "word-paper": "hsticker--word hsticker--paper",
    "mark": "hsticker--mark",
}

MARK_SVG = (
    '<svg viewBox="0 0 40 40" fill="none" aria-hidden="true">'
    '<g stroke="currentColor" stroke-width="2.4" stroke-linecap="round">'
    '<path d="M20 4v32M4 20h32M8.7 8.7l22.6 22.6M31.3 8.7 8.7 31.3"/></g></svg>'
)


def sticker_body(s):
    if s["kind"] == "emoji":
        return s["emoji"]
    if s["kind"].startswith("word"):
        return s["text"]
    if s["kind"] == "mark":
        return MARK_SVG
    ar = s.get("ar", 1)
    h = round(900 / ar)
    return (f'<img src="https://picsum.photos/seed/{s["seed"]}/900/{h}" alt="" '
            f'style="--ar:{ar}" loading="eager" decoding="async">')


def sticker_layer(variant, depth, target=False):
    items = [s for s in D["hero"]["stickers"] if s["layer"] == variant]
    inner = ""
    for s in items:
        cls = ("hsticker " + KIND_CLASS.get(s["kind"], "")).strip()
        inner += (
            f'<div class="{cls}" style="--x:{s["x"]}; --y:{s["y"]}; '
            f'--w:{s["w"]}; --r:{s["r"]}deg">'
            f'<div class="hsticker-inner">{sticker_body(s)}</div></div>'
        )
    attr = " data-sticker-target" if target else ""
    return (f'<div class="hero-stickers hero-stickers--{variant}" data-depth="{depth}" '
            f'aria-hidden="true"{attr}>{inner}</div>')


wordmark_set = "".join(f'<span class="t-hero hero-word">{D["brand"]}</span>' for _ in range(3))

hero = f'''
<section class="hero" id="top" data-hero>
  {sticker_layer("back", 0.12)}

  <div class="hero-stage">
    <div class="hero-marquee">
      <div class="hero-reveal">
        <div class="hero-track">
          <div style="display:flex">{wordmark_set}</div>
          <div style="display:flex" aria-hidden="true">{wordmark_set}</div>
        </div>
      </div>
    </div>
  </div>

  {sticker_layer("front", 0.26, target=True)}

  <div class="hero-meta">
    <div class="hero-meta-l">
      <span class="hero-roles t-meta">{"".join(f"<span>{r}</span>" for r in D['hero']['roles'])}</span>
      <button class="sticker-cta t-eyebrow" data-sticker-cta>
        <span class="sticker-cta-plus" aria-hidden="true">+</span>
        <span>{D['hero']['sticker']['line1']}<br>{D['hero']['sticker']['line2']}</span>
      </button>
    </div>
    <div class="hero-meta-r">
      {pill(D['tagline']['label'], '#about')}
      <span class="scroll-cue t-meta"><i aria-hidden="true"></i>{D['hero']['scroll']}</span>
    </div>
  </div>

  <div class="sm-backdrop" data-sm-backdrop hidden></div>
  <div class="sm-card" data-sm-card hidden role="dialog" aria-modal="true" aria-labelledby="sm-title"
       data-msg-large="{D['ui']['errTooLarge']}" data-msg-format="{D['ui']['errFormat']}"
       data-msg-process="{D['ui']['errProcess']}">
    <div class="sm-head">
      <h2 class="sm-title" id="sm-title">{D['hero']['sticker']['line1']} {D['hero']['sticker']['line2']}</h2>
      <button class="sm-close" data-sm-close aria-label="{D['ui']['close']}">
        <svg viewBox="0 0 10 10" width="9" height="9" aria-hidden="true">
          <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" stroke-width="1.2"/></svg>
      </button>
    </div>
    <p class="sm-sub">{D['ui']['stickerNote']}</p>
    <label class="sm-drop" data-sm-drop tabindex="0">
      <input type="file" accept="image/png,image/jpeg,image/gif,image/webp">
      <span class="t-eyebrow">{D['ui']['chooseFile']}</span>
      <span class="sm-drop-hint">{D['ui']['dropHint']}</span>
    </label>
    <div class="sm-preview" data-sm-preview hidden><img alt="{D['ui']['previewAlt']}"></div>
    <p class="sm-error t-meta" data-sm-error role="status" aria-live="polite"></p>
    <div class="sm-actions">
      <button class="pill t-eyebrow" data-sm-cancel type="button">{D['ui']['cancel']}</button>
      <button class="pill pill--solid t-eyebrow" data-sm-place type="button" disabled>
        {D['ui']['place']}{arrow()}</button>
    </div>
  </div>
</section>
'''

# ---------- tagline (§6.5) ----------
tagline = f'''
<section class="section section--divided tagline-section" id="about">
  <div class="tagline-grid reveal" data-stagger="18">
    <div>
      <p class="t-label">{D['tagline']['label']}</p>
      <p class="t-meta" style="color:var(--ink-muted); margin-top:8px">{D['tagline']['meta']}</p>
    </div>
    <p class="t-tagline tagline">{words(D['tagline']['text'])}</p>
  </div>
</section>
'''

# ---------- services (§6.6) ----------
items_html = ""
details_html = ""
for i, it in enumerate(D["services"]["items"]):
    active = " active" if i == 0 else ""
    items_html += f'''
      <button class="service-item{active}" data-service="{i}" role="tab" type="button"
              aria-selected="{'true' if i == 0 else 'false'}" id="service-tab-{i}"
              aria-controls="service-detail-{i}" tabindex="{0 if i == 0 else -1}">
        <span class="service-num">{it['num']}</span>
        <h3 class="t-service">{it['title']}</h3>
        {arrow('service-arrow')}
        <span class="service-progress-track" aria-hidden="true"><span class="service-progress"></span></span>
      </button>'''
    tags = "".join(f"<li>{t}</li>" for t in it["tags"])
    details_html += f'''
      <div class="service-detail{' visible' if i == 0 else ''}" data-detail="{i}"
           id="service-detail-{i}" role="tabpanel" aria-labelledby="service-tab-{i}"
           aria-hidden="{'false' if i == 0 else 'true'}">
        <h4 class="t-detail-h">{it['heading']}</h4>
        <p class="t-detail-b">{it['body']}</p>
        <ul class="service-tags">{tags}</ul>
      </div>'''

services = f'''
<section class="section section--divided" id="process">
  <div class="section-head reveal">
    <h2 class="t-label">{D['services']['label']}</h2>
    <p class="t-meta">{D['services']['meta']}</p>
  </div>
  <div class="services-grid reveal" data-services role="tablist" aria-orientation="vertical">
    <div>{items_html}</div>
    <div class="service-detail-stage">{details_html}</div>
  </div>
</section>
'''

# ---------- projects (§6.7) ----------
cards = ""
for p in D["projects"]["items"]:
    # Aset lokal ditulis relatif terhadap /public di JSON (Next
    # memakainya apa adanya); halaman preview duduk di /preview/.
    img = f'../public{p["img"]}' if p["img"].startswith("/") else p["img"]

    if p.get("comingSoon"):
        # Proyek yang belum siap dirender sebagai <div>, bukan <a>
        # — bukan href yang dimatikan, elemen ini memang bukan link.
        cards += f'''
      <div class="p-item p-ar p-item--soon" style="--ar:{p['ar']}"
           aria-label="{p['title']} — {D['projects']['comingSoon']}">
        <div class="p-media">
          <img class="p-img" src="{img}" alt="" loading="lazy" decoding="async">
          <div class="p-soon-badge" aria-hidden="true">
            <span class="t-eyebrow">{D['projects']['comingSoon']}</span>
          </div>
        </div>
        <div class="p-foot">
          <span class="p-title">{p['title']}</span>
          <span class="p-cat t-eyebrow">{p['cat']}</span>
        </div>
      </div>'''
        continue

    # Proyek yang punya case study di situs ini menang atas tautan
    # eksternal: halaman sendiri tidak dibuka di tab baru.
    internal = bool(p.get("case"))
    href = case_page(p["case"], LANG) if internal else (p["href"] or "#work")
    blank = 'target="_blank" rel="noopener noreferrer"' if p["href"] and not internal else ""
    cards += f'''
      <a class="p-item p-ar" href="{href}" data-cursor="view"
         {blank}
         data-cursor-label="{D['projects']['label']}" style="--ar:{p['ar']}">
        <div class="p-media">
          <img class="p-img" src="{img}"
               alt="{p['title']}" loading="lazy" decoding="async">
        </div>
        <div class="p-foot">
          <span class="p-title">{p['title']}</span>
          <span class="p-cat t-eyebrow">{p['cat']}</span>
        </div>
      </a>'''

projects = f'''
<section class="section section--divided" id="work">
  <div class="section-head reveal">
    <h2 class="t-label">{D['projects']['label']}</h2>
    <p class="t-meta">{D['projects']['meta']}</p>
  </div>
  <div class="projects-stage" data-strip-stage>
    <span class="drag-badge" data-drag-badge aria-hidden="true">{D['projects']['hint']}</span>
    <div class="projects-strip" data-strip tabindex="0" role="region"
         aria-label="{D['projects']['label']}">{cards}</div>

    <div class="strip-hint" data-strip-hint aria-hidden="true">
      <span class="strip-count t-meta" data-strip-count>01 / {len(D['projects']['items']):02d}</span>
      <span class="strip-track"><i class="strip-thumb" data-strip-thumb></i></span>
      <span class="strip-swipe t-eyebrow">{D['projects']['swipe']}
        <svg viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M1 5h7M5.5 2 8.5 5l-3 3" stroke="currentColor" stroke-width="1.2"/>
        </svg>
      </span>
    </div>
  </div>
</section>
'''

# ---------- companies ----------
companies = f"""
<section class="section section--divided" aria-labelledby="companies-label">
  <div class="section-head reveal">
    <h2 class="t-label" id="companies-label">{D['companies']['label']}</h2>
    <p class="t-meta">{D['companies']['meta']}</p>
  </div>
  <div class="companies-row reveal">
    {"".join(
        f'<span class="company"><a class="company-link" href="{c["href"]}" '
        f'target="_blank" rel="noopener noreferrer" data-cursor="expand">{c["name"]}</a></span>'
        if c.get("href") else f'<span class="company">{c["name"]}</span>'
        for c in D['companies']['items'])}
  </div>
</section>
"""

# ---------- showreel (§6.4) ----------
# data-src dibiarkan kosong: poster jadi LCP, bukan video.
REEL_SRC = ""
POSTER = "https://picsum.photos/seed/vs-reel/1920/1080"
reel_media = (
    f'<video class="reel-media" data-reel-media data-src="{REEL_SRC}" '
    f'poster="{POSTER}" muted loop playsinline preload="none"></video>'
    if REEL_SRC else
    f'<img class="reel-media" data-reel-media src="{POSTER}" alt="" '
    f'loading="lazy" decoding="async">'
)
reel_mute = (
    f'<button class="reel-mute" data-reel-mute aria-pressed="false" '
    f'aria-label="{D["reel"]["unmute"]}">'
    '<svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true" fill="none">'
    '<path d="M1 4.5h2L6 2v8L3 7.5H1z" stroke="currentColor" stroke-width="1.1"/>'
    '<path d="M8.5 4.2 11 6.8M11 4.2 8.5 6.8" stroke="currentColor" stroke-width="1.1"/>'
    '</svg></button>'
) if REEL_SRC else ""

reel = f"""
<section class="section reel-section" aria-label="{D['reel']['tag']}">
  <div class="reel-wrap" data-reel data-dark>
    {reel_media}
    <div class="reel-overlay">
      <span class="reel-tag t-eyebrow">{D['reel']['tag']}</span>
      <span class="reel-year t-eyebrow">{D['reel']['year']}</span>
    </div>
    {reel_mute}
  </div>
</section>
"""

# ---------- clients typewriter (§6.8) ----------
segs = "".join(
    (f'<a href="{s["href"]}" data-cursor="expand">{s["t"]}</a>' if s.get("href")
     else f'<span>{s["t"]}</span>')
    for s in D["clients"]["segments"]
)
clients = f"""
<section class="section section--divided sectors-section" aria-labelledby="clients-label">
  <div class="sector-orbit" aria-hidden="true"><i class="sector-orbit-art"></i></div>
  <div class="section-head reveal">
    <h2 class="t-label" id="clients-label">{D['clients']['label']}</h2>
    <p class="t-meta">{D['clients']['meta']}</p>
  </div>
  <div class="ct-stage" data-typewriter>
    <p class="ct-copy ct-ghost" aria-hidden="true">{segs}</p>
    <p class="ct-copy ct-live"><span class="ct-caret" aria-hidden="true"></span></p>
  </div>
</section>
"""

html = shell(D, LANG, f"""
{hero}
{reel}
{tagline}
{services}
{projects}
{clients}
{companies}
""")

out = ROOT / "preview" / ("index.html" if LANG == "en" else f"index.{LANG}.html")
out.write_text(html, encoding="utf-8")
print(f"→ {out.relative_to(ROOT)}  ({len(html):,} bytes)")
