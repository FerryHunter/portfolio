#!/usr/bin/env python3
"""
Chrome bersama untuk semua halaman preview statis.

Nav, footer, preloader, cursor, cookie banner, dan shell <html>
hanya boleh ditulis SEKALI. Halaman index (build_preview.py) dan
tiap halaman case study (case_<slug>.py) mengimpor dari sini,
supaya menambah halaman baru tidak pernah berarti menyalin markup
nav — salinan itulah yang biasanya menyimpang lebih dulu.

Satu-satunya perbedaan antar halaman adalah `home`: di index
tautan "#work" menunjuk ke dirinya sendiri, di halaman anak ia
harus menunjuk balik ke index. Semua fungsi di sini menerima
parameter itu dan tidak menebak.
"""

ARROW = ('<svg viewBox="0 0 10 10" fill="none" aria-hidden="true"{cls}>'
         '<path d="M1 9 9 1" stroke="currentColor" stroke-width="1.2"/>'
         '<path d="M3.4 1H9v5.6" stroke="currentColor" stroke-width="1.2"/></svg>')


def arrow(cls=""):
    return ARROW.format(cls=f' class="{cls}"' if cls else "")


def link(href, home=""):
    """Anchor lokal diprefiks `home` saat halaman bukan index."""
    return f"{home}{href}" if href.startswith("#") else href


def case_page(slug, lang):
    """Nama berkas preview statis satu case, diturunkan dari slug
    + bahasa. Dipakai bersama oleh build_preview.py (kartu strip)
    dan setiap case_<slug>.py (tautan "next case"): keduanya harus
    memakai satu fungsi yang sama, bukan menyalinnya, supaya proyek
    kedua yang punya halaman sendiri tidak diam-diam menunjuk ke
    halaman yang salah tanpa satu pun error."""
    return f"{slug}.html" if lang == "en" else f"{slug}.{lang}.html"


def case_href(href, lang, home=""):
    """Tautan "next case" dari satu halaman case ke case lain.

    Data di content/*.json menyimpan href sebagai path internal
    (/work/{slug}) begitu case study tujuannya sudah dibangun, atau
    URL eksternal / string kosong sebelum itu. Path internal HARUS
    direwrite ke nama berkas statis lewat case_page() — kalau
    ditulis apa adanya, browser mencoba me-load /work/{slug} yang
    tidak pernah ada di server statis ini dan berakhir 404.

    `home` TIDAK ikut ditempel di jalur ini: semua halaman case
    duduk sebagai sibling flat file di /preview/, case_page() sudah
    mengembalikan nama berkas yang valid dari sibling mana pun.
    `home` hanya berlaku untuk jalur anchor (`#work` di bawah),
    karena anchor semacam itu cuma ada di halaman index."""
    if href and href.startswith("/work/"):
        slug = href.rsplit("/", 1)[-1]
        return case_page(slug, lang)
    return link(href, home) if href else f"{home}#work"


def words(text):
    """Mask reveal per kata (§6.5).

    Dua hal yang mudah salah di sini:
    - `replace`, bukan `strip`: pada "*ship*," karakter terakhirnya
      koma, jadi strip("*") hanya membuang asterisk yang pertama.
    - spasi ditaruh DI LUAR `.w`. Di dalamnya ia hilang, karena
      `.w` inline-block dengan overflow:hidden dan spasi di ujung
      inline-block dibuang saat pembentukan line box.
    """
    out = []
    for w in text.split():
        if "*" in w:
            first, last = w.index("*"), w.rindex("*")
            if first == last:
                lead, mid, tail = "", w.replace("*", ""), ""
            else:
                # Tanda baca di luar penanda tetap di luar <em> —
                # koma berwarna aksen terbaca seperti cacat.
                lead = w[:first]
                mid = w[first + 1:last].replace("*", "")
                tail = w[last + 1:]
            inner = f"{lead}<em>{mid}</em>{tail}"
        else:
            inner = w
        out.append(f'<span class="w"><span>{inner}</span></span> ')
    return "".join(out)


def lines(items):
    return "".join(f'<span class="line"><span>{l}</span></span>' for l in items)


def pill(label, href="#", solid=False, size=""):
    cls = "pill" + (" pill--solid" if solid else "") + (f" pill--{size}" if size else "")
    return f'<a class="{cls} t-eyebrow" href="{href}">{label}{arrow()}</a>'


def coords_lines(D):
    """Baris peran (bisa >1) ditumpuk seperti .hero-roles — bukan
    digabung jadi satu baris dengan tanda pemisah."""
    lines = "".join(f"<span>{line}</span>" for line in D["nav"]["coords"])
    return f'<span class="nav-coords-lines">{lines}</span>'


# ---------- nav (§6.1) ----------
def nav(D, lang, home=""):
    def p(i):
        return pill(i["label"], link(i["href"], home))

    return f'''
<nav class="nav" data-nav aria-label="{D['nav']['menu']}">
  <div class="nav-inner">

    <div class="nav-layer nav-layer--top">
      <div class="nav-group">
        {"".join(p(i) for i in D["nav"]["primary"])}
      </div>
      <div class="nav-group nav-coords t-eyebrow">
        {coords_lines(D)}<span>{D['nav']['est']}</span>
      </div>
      <div class="nav-group">
        <div class="nav-drawer-zone">
          <button class="nav-more" data-more aria-expanded="false" aria-label="{D['nav']['more']}">
            <span class="nav-more-bars" aria-hidden="true"><i></i><i></i><i></i></span>
          </button>
          <div class="nav-drawer" data-drawer>
            {"".join(p(i) for i in D["nav"]["drawer"])}
          </div>
        </div>
      </div>
    </div>

    <div class="nav-layer nav-layer--scrolled">
      <a class="nav-wordmark" href="{link('#top', home)}">{D['brand']}</a>
      <div class="nav-group">
        {pill(D['nav']['cta'], link('#contact', home))}
      </div>
    </div>

    <div class="nav-mobile-bar">
      <a class="nav-wordmark" href="{link('#top', home)}">{D['brand']}</a>
      <button class="burger" data-burger aria-expanded="false" aria-controls="mobile-menu"
              aria-label="{D['nav']['menu']}"><i></i><i></i></button>
    </div>

  </div>
</nav>

<div class="mobile-menu" id="mobile-menu" data-mobile-menu>
  <div>
    {"".join(f'<a class="t-menu" href="{link(i["href"], home)}">{i["label"]}</a>'
             for i in D["nav"]["primary"] + D["nav"]["drawer"])}
  </div>
  <div class="mobile-menu-foot t-eyebrow">
    {coords_lines(D)}<span>{D['nav']['est']}</span>
  </div>
</div>
'''


# ---------- footer (§6.9) ----------
def footer(D, home=""):
    addr = "".join(f"{l}<br>" for l in D["footer"]["address"])
    # Item "Résumé" (action="resume") jadi <button data-resume-cta>,
    # bukan <a> — ia memicu modal, bukan navigasi. Disamakan gayanya
    # lewat CSS bersama (.footer-nav a, .footer-nav button).
    fnav = "".join(
        '<button type="button" data-resume-cta>{}</button>'.format(i["label"])
        if i.get("action") == "resume" else
        f'<a href="{link(i["href"], home)}">{i["label"]}</a>'
        for i in D["footer"]["nav"]
    )

    # href kosong tidak dirender: tautan mati lebih buruk daripada
    # tautan yang belum ada.
    cv_link = ""
    if D["footer"]["cvHref"]:
        cv_link = (f'<a class="pill pill--lg t-eyebrow" href="{D["footer"]["cvHref"]}" download>'
                   f'{D["footer"]["cvLabel"]}{arrow()}</a>')

    social = [x for x in D["footer"]["social"] if x["href"]]
    social_block = ""
    if social:
        pills = "".join(
            f'<a class="pill t-eyebrow" href="{x["href"]}" target="_blank" '
            f'rel="noopener noreferrer">{x["label"]}{arrow()}</a>' for x in social)
        social_block = (f'<div><span class="footer-links-label t-eyebrow">'
                        f'{D["footer"]["socialLabel"]}</span>'
                        f'<div class="footer-links">{pills}</div></div>')

    return f'''
<footer class="grain" id="footer-cta" data-dark data-reveal>
  <div class="footer-top">
    <h2 class="t-claim footer-claim">{lines(D['footer']['claim'])}</h2>
    <div class="footer-contact t-meta" id="contact">
      <address>{addr}</address>
      <a href="mailto:{D['footer']['email']}">{D['footer']['email']}</a>
      <div class="footer-actions">
        <a class="pill pill--solid pill--lg t-eyebrow" href="{D['footer']['contactHref']}">
          {D['footer']['contactLabel']}{arrow()}</a>
        {cv_link}
      </div>
      {social_block}
    </div>
  </div>
  <div class="footer-bottom t-meta">
    <nav class="footer-nav" aria-label="{D['footer']['cta']}">{fnav}</nav>
    <span>{D['footer']['legal']}</span>
  </div>
</footer>

<div class="resume-backdrop" data-resume-backdrop hidden></div>
<div class="resume-card" data-resume-card hidden role="dialog" aria-modal="true"
     aria-labelledby="resume-title" data-email="{D['footer']['email']}">
  <div class="resume-head">
    <h2 class="resume-title" id="resume-title">{D['ui']['resumeTitle']}</h2>
    <button class="resume-close" data-resume-close aria-label="{D['ui']['close']}">
      <svg viewBox="0 0 10 10" width="9" height="9" aria-hidden="true">
        <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" stroke-width="1.2"/></svg>
    </button>
  </div>
  <p class="resume-sub">{D['ui']['resumeSub']}</p>
  <form data-resume-form>
    <label class="resume-field">
      <span class="resume-field-label t-eyebrow">{D['ui']['resumeEmailLabel']}</span>
      <input type="email" name="email" required placeholder="you@company.com">
    </label>
    <label class="resume-field">
      <span class="resume-field-label t-eyebrow">{D['ui']['resumeCompanyLabel']}</span>
      <input type="text" name="company" placeholder="Acme Inc. · Recruiter">
    </label>
    <div class="resume-actions">
      <button class="pill t-eyebrow" data-resume-cancel type="button">{D['ui']['cancel']}</button>
      <button class="pill pill--solid t-eyebrow" type="submit">
        {D['ui']['resumeSend']}{arrow()}</button>
    </div>
  </form>
  <p class="resume-note">{D['ui']['resumeNote']}</p>
</div>
'''


# ---------- preloader (§5.1) + cursor (§5.2) ----------
def preloader(D):
    return f"""
<div id="preloader" data-preloader role="status" aria-label="{D['ui']['loading']}">
  <div class="pre-brand"><span>{D['brand']}</span></div>
  <span class="pre-count" data-pre-count aria-hidden="true">000</span>
  <span class="pre-bar" data-pre-bar aria-hidden="true"></span>
</div>
<div id="cursor" data-cursor-el data-label-default="{D['ui']['cursorView']}" aria-hidden="true">
  <span class="cursor-label" data-cursor-label></span>
</div>
"""


# ---------- cookie banner (§6.10) ----------
def cookies(D, home=""):
    cc_links = "".join(f'<a href="{link(l["href"], home)}">{l["label"]}</a>'
                       for l in D["cookies"]["links"])
    return f"""
<div class="cc" data-cookies hidden role="dialog" aria-labelledby="cc-title" aria-live="polite">
  <h2 class="cc-title" id="cc-title">{D['cookies']['title']}</h2>
  <p class="cc-body">{D['cookies']['body']}</p>
  <div class="cc-actions">
    <button class="pill t-eyebrow" data-cc-deny type="button">{D['cookies']['deny']}</button>
    <button class="pill t-eyebrow" data-cc-accept type="button">{D['cookies']['accept']}</button>
  </div>
  <div class="cc-links">{cc_links}</div>
</div>
"""


def shell(D, lang, body, title=None, description=None, home=""):
    """Dokumen lengkap: CSS dan modul motion yang SAMA PERSIS
    dengan yang dipakai Next.js — nol drift antara dua render."""
    return f'''<!DOCTYPE html>

<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title or D['meta']['title']}</title>
<meta name="description" content="{description or D['meta']['description']}">
<link rel="icon" href="../public/favicon.svg" type="image/svg+xml">
<link rel="icon" href="../public/favicon.ico" sizes="any">
<link rel="apple-touch-icon" href="../public/apple-touch-icon.png">
<link rel="preconnect" href="https://api.fontshare.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://api.fontshare.com/v2/css?f[]=switzer@300,400,500&display=swap">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400&display=swap">
<!-- CSS yang sama persis dengan yang dipakai Next.js -->
<link rel="stylesheet" href="../app/globals.css">
</head>
<body class="preloading">
{preloader(D)}
<a class="skip-link" href="#main">{D['ui']['skip']}</a>
{nav(D, lang, home)}
<main id="main">
{body}
</main>
{footer(D, home)}
{cookies(D, home)}
<!-- Modul motion yang sama persis dengan yang dipakai Next.js -->
<script type="module">
  import {{ initAll }} from "../motion/index.js";
  initAll(document);
</script>
</body>
</html>
'''
