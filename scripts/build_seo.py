#!/usr/bin/env python3
"""
Membuat berkas SEO statis di public/ dari content/*.json:

  public/sitemap.xml  — semua halaman EN + ID, lengkap dengan hreflang
  public/robots.txt   — izinkan semua crawler + tunjuk sitemap
  public/llms.txt     — ringkasan situs untuk mesin jawab AI (llms.txt)

Dijalankan ulang setiap menambah/menghapus halaman atau mengubah teks
meta:   python3 scripts/build_seo.py

Statis di public/ (bukan app/sitemap.ts) dengan sengaja: nol kode Next
tambahan yang bisa merusak build, dan sumbernya tetap satu, yaitu JSON.
"""
import datetime
import json
import pathlib
from xml.sax.saxutils import escape

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = "https://www.ferryworks.space"
LANGS = ("en", "id")
TODAY = datetime.date.today().isoformat()

D = {l: json.loads((ROOT / "content" / f"{l}.json").read_text(encoding="utf-8")) for l in LANGS}
slugs = list(D["en"]["cases"].keys())
assert slugs == list(D["id"]["cases"].keys()), "daftar case EN dan ID berbeda"

# ---------- sitemap.xml ----------
paths = [""] + [f"/work/{s}" for s in slugs]


def url_entry(lang, path):
    alts = "".join(
        f'    <xhtml:link rel="alternate" hreflang="{l}" href="{SITE}/{l}{path}"/>\n' for l in LANGS
    )
    alts += f'    <xhtml:link rel="alternate" hreflang="x-default" href="{SITE}/en{path}"/>\n'
    return (f"  <url>\n    <loc>{SITE}/{lang}{path}</loc>\n    <lastmod>{TODAY}</lastmod>\n{alts}  </url>\n")


sitemap = ('<?xml version="1.0" encoding="UTF-8"?>\n'
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
           'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
           + "".join(url_entry(l, p) for p in paths for l in LANGS)
           + "</urlset>\n")
(ROOT / "public" / "sitemap.xml").write_text(sitemap, encoding="utf-8")

# ---------- robots.txt ----------
robots = f"User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n"
(ROOT / "public" / "robots.txt").write_text(robots, encoding="utf-8")

# ---------- llms.txt ----------
E = D["en"]
elsewhere = [s for s in E["footer"]["social"] if s["href"].startswith("https://") and "wa.me" not in s["href"]]
addr = [line.strip() for line in E["footer"]["address"]]
avail = (" ".join(addr[:-1]) + ". " + addr[-1] + ".") if len(addr) > 1 else addr[0]
lines = [
    f"# {E['seo']['siteName']}",
    "",
    f"> Portfolio of {E['seo']['person']}, {E['seo']['jobTitle']}. {E['meta']['description']}",
    "",
    f"{avail}",
    "",
    "## Case studies",
    "",
]
for s in slugs:
    c = E["cases"][s]
    lines.append(f"- [{c['title']}]({SITE}/en/work/{s}): {c['meta']['description']}")
lines += ["", "## Expertise", ""] + [f"- {k}" for k in E["seo"]["knowsAbout"]]
lines += ["", "## Elsewhere", ""] + [f"- [{x['label']}]({x['href']})" for x in elsewhere]
lines += ["", "## Languages", "", f"- English: {SITE}/en", f"- Bahasa Indonesia: {SITE}/id", ""]
(ROOT / "public" / "llms.txt").write_text("\n".join(lines), encoding="utf-8")

print(f"sitemap.xml : {len(paths) * len(LANGS)} URL ({len(slugs)} case x {len(LANGS)} bahasa + 2 home)")
print("robots.txt  : ok")
print(f"llms.txt    : {len(lines)} baris")
