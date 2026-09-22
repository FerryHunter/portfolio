#!/usr/bin/env python3
"""
Generator preview statis — case study: Nanovest · Crypto Locked Staking.

Sepasang dengan komponennya di
components/cases/CryptoLockedStaking.tsx, dan berdiri sejajar dengan
scripts/case_nanovest_calendar.py: susunan section-nya sama persis
(hero, overview, scope, video, blocks, gallery, metrics,
deliverables, next), termasuk konvensi asetnya — semua ponsel
potret 750 × 1624 (§6.11), jadi tidak ada satu pun gambar yang
dipotong, yang dibatasi adalah lebarnya.

Konten dari content/<lang>.json → "cases" → "crypto-locked-staking".
Nav, footer, preloader, dan cookie banner dari scripts/chrome.py.

Jalankan:  python3 scripts/case_crypto_locked_staking.py [lang]
Sajikan :  python3 -m http.server 4321   →  /preview/crypto-locked-staking.html
"""
import json
import pathlib
import sys

from chrome import arrow, case_href, shell, words

ROOT = pathlib.Path(__file__).resolve().parent.parent
LANG = sys.argv[1] if len(sys.argv) > 1 else "en"
SLUG = "crypto-locked-staking"

D = json.loads((ROOT / "content" / f"{LANG}.json").read_text(encoding="utf-8"))
C = D["cases"][SLUG]

HOME = "index.html" if LANG == "en" else f"index.{LANG}.html"


def media(item, alt="", eager=False):
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

# ---------- overview ----------
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


# ---------- blok prosa (problem, approach) ----------
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

# Motion belum tersedia — section disembunyikan sampai rekamannya
# ada, bukan dihapus dari data (content/*.json → "video").
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
    f"{hero}{overview}{scope}{video}{blocks}{gallery}{metrics}{deliverables}{nxt}",
    title=C["meta"]["title"],
    description=C["meta"]["description"],
    home=HOME,
)

name = f"{SLUG}.html" if LANG == "en" else f"{SLUG}.{LANG}.html"
out = ROOT / "preview" / name
out.write_text(html, encoding="utf-8")
print(f"→ {out.relative_to(ROOT)}  ({len(html):,} bytes)")
