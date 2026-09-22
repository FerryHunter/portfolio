#!/usr/bin/env python3
"""
Generator preview statis — case study: Nanovest · US Stocks IPO.

Sepasang dengan komponennya di components/cases/NanovestUsStocksIpo.tsx.
Susunan section-nya sama dengan case_nanovest_limit_order.py — itu yang
dipakai sebagai cetakan — dan aset di sini juga layar ponsel potret
utuh (750 × 1624, ar 0.4618), jadi tidak ada satu pun gambar yang
dipotong, yang dibatasi adalah lebarnya (lihat `media()`).

"next" menaut lewat next.href di JSON (case_href()).
Sini ("nanovest-us-stocks-ipo") ada di siklus sebelas case: nanovest-calendar → nanovest-limit-order →
nanovest-us-stocks-ipo → crypto-locked-staking →
nanovest-investment-app → amazon → game-interface-study →
game-quest → rampage-evolution-card → hris-dashboard → stiqy-dashboard → game-deployer →
(kembali ke nanovest-calendar).

Konten dari content/<lang>.json → "cases" → SLUG. Nav, footer,
preloader, dan cookie banner dari scripts/chrome.py — tidak disalin,
supaya tidak menyimpang dari halaman index.

Jalankan:  python3 scripts/case_nanovest_us_stocks_ipo.py [lang]
Sajikan :  python3 -m http.server 4321   →  /preview/nanovest-us-stocks-ipo.html
"""
import json
import pathlib
import sys

from chrome import arrow, case_href, shell, words

ROOT = pathlib.Path(__file__).resolve().parent.parent
LANG = sys.argv[1] if len(sys.argv) > 1 else "en"
SLUG = "nanovest-us-stocks-ipo"

D = json.loads((ROOT / "content" / f"{LANG}.json").read_text(encoding="utf-8"))
C = D["cases"][SLUG]

HOME = "index.html" if LANG == "en" else f"index.{LANG}.html"


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

  {figure(C['cover'], C['cover']['alt'],
          extra="case-fig--shot", eager=True)}
</section>
'''

# ---------- overview (dipinjam dari §6.5 tagline) ----------
# Tanpa section--divided: hairline-nya bertabrakan dengan lengkung
# bawah dua ponsel hero di atasnya.
overview = f'''
<section class="section tagline-section">
  <div class="tagline-grid reveal" data-stagger="18">
    <div>
      <p class="t-label">{C['overview']['label']}</p>
      <p class="t-meta" style="color:var(--ink-muted); margin-top:8px">{C['overview']['meta']}</p>
    </div>
    <p class="t-tagline tagline">{words(C['overview']['text'])}</p>
  </div>
</section>
'''

# ---------- mockup (satu shot promosi antara overview dan scope) ----------
mockup = f'''
<section class="section section--divided">
  {figure(C['mockup'], C['mockup']['alt'], extra="case-fig--shot")}
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
def block(b):
    paras = "".join(f'<p class="case-p">{p}</p>' for p in b["body"])
    return f'''
<section class="section section--divided">
  <div class="case-note reveal">
    <div class="case-note-side">
      <h2 class="t-label">{b['label']}</h2>
      <p class="t-meta" style="color:var(--ink-muted); margin-top:8px">{b['meta']}</p>
    </div>
    <div class="case-note-body">
      <h3 class="t-detail-h case-note-h">{b['heading']}</h3>
      {paras}
    </div>
  </div>
</section>
'''


blocks = "".join(block(b) for b in C["blocks"])

# ---------- galeri ----------
# Kolom sempit (case-gallery--phones): layar potret di dua kolom
# lebar penuh akan berdiri sangat tinggi masing-masing.
gallery_items = "".join(figure(g, C["title"]) for g in C["gallery"]["items"])

gallery = f'''
<section class="section section--divided">
  <div class="section-head reveal">
    <h2 class="t-label">{C['gallery']['label']}</h2>
    <p class="t-meta">{C['gallery']['meta']}</p>
  </div>
  <div class="case-gallery case-gallery--phones">{gallery_items}</div>
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
# Rekamannya belum ada, jadi seluruh section disembunyikan dulu
# (bukan ditampilkan sebagai placeholder kosong) sampai video.src
# terisi di content/*.json begitu rekamannya ada di
# public/work/nanovest-us-stocks-ipo/.
V = C["video"]

if V["src"]:
    poster = f'../public{V["poster"]}' if V["poster"].startswith("/") else V["poster"]
    src = f'../public{V["src"]}' if V["src"].startswith("/") else V["src"]
    video = f'''
<section class="section section--divided case-video" aria-labelledby="case-video-label">
  <div class="section-head reveal">
    <h2 class="t-label" id="case-video-label">{V['label']}</h2>
    <p class="t-meta">{V['meta']}</p>
  </div>
  <div class="reel-wrap" data-reel data-dark
       style="--ar:{V['ar']}; --focus:{V['posterFocus']}">
    <video class="reel-media" data-reel-media data-src="{src}"
           poster="{poster}" muted loop playsinline preload="none"></video>
    <div class="reel-overlay">
      <span class="reel-tag t-eyebrow">{V['tag']}</span>
      <span class="reel-year t-eyebrow">{V['year']}</span>
    </div>
    <button class="reel-mute" data-reel-mute aria-pressed="false"
            aria-label="{D["reel"]["unmute"]}">
      <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true" fill="none">
        <path d="M1 4.5h2L6 2v8L3 7.5H1z" stroke="currentColor" stroke-width="1.1"/>
        <path d="M8.5 4.2 11 6.8M11 4.2 8.5 6.8" stroke="currentColor" stroke-width="1.1"/>
      </svg>
    </button>
  </div>
  <p class="t-meta case-cap">{V['caption']}</p>
</section>
'''
else:
    video = ""

# ---------- hasil (section gelap) ----------
metric_items = "".join(
    f'<div class="case-metric"><span class="case-metric-v">{m["v"]}</span>'
    f'<span class="case-metric-k t-meta">{m["k"]}</span></div>'
    for m in C["metrics"]["items"])

metrics = f'''
<section class="section case-metrics grain" data-dark data-reveal>
  <div class="section-head">
    <h2 class="t-label">{C['metrics']['label']}</h2>
    <p class="t-meta">{C['metrics']['meta']}</p>
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

# "next" menaut lewat next.href di JSON, direwrite case_href() dari
# path internal (/work/{slug}) ke nama berkas statis — bagian dari
# siklus enam case di content/*.json.
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
    f"{hero}{overview}{mockup}{scope}{blocks}{gallery}{metrics}{deliverables}{nxt}",
    title=C["meta"]["title"],
    description=C["meta"]["description"],
    home=HOME,
)

name = f"{SLUG}.html" if LANG == "en" else f"{SLUG}.{LANG}.html"
out = ROOT / "preview" / name
out.write_text(html, encoding="utf-8")
print(f"→ {out.relative_to(ROOT)}  ({len(html):,} bytes)")
