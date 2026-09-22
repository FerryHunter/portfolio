# Build Spec — Replikasi Arsitektur benorth.studio

**Referensi:** https://benorth.studio/es
**Tanggal audit:** 20 Agustus 2026
**Tujuan:** membangun ulang arsitektur, sistem token, dan mekanik interaksi situs referensi sebagai basis untuk brand/konten sendiri.

---

## 0. Scope & aturan main

| Boleh direplikasi | Harus diganti |
|---|---|
| Arsitektur folder & routing | Semua aset gambar (`cdn.sanity.io/*`, `/stickers/*`, wordmark SVG) |
| Sistem design token (warna, easing, spacing) | Font Aeonik → font berlisensi bebas |
| Teknik animasi & pola interaksi | Seluruh copy, nama klien, nama proyek |
| Struktur komponen & breakpoint | Logo, monogram, B-Corp mark |
| Pendekatan performa (native scroll, IO, rAF) | Video showreel |

**Font substitusi** (Aeonik itu lisensi komersial CoType Foundry):

- Display/body → **Switzer** atau **General Sans** (Fontshare, gratis komersial)
- Utility/mono → **JetBrains Mono** atau **Space Mono**

Ganti `--font` dan `Aeonik Mono` di seluruh spec ini dengan pilihan di atas.

---

## 1. Stack

```
Next.js 14+ (App Router)
├── app/
│   ├── layout.tsx                 # <html>, font, preloader mount
│   └── (site)/
│       └── [lang]/
│           ├── layout.tsx         # nav, cursor, cookie banner, footer
│           ├── page.tsx           # home
│           ├── not-found.tsx
│           ├── servicios/page.tsx
│           ├── estudio/page.tsx
│           ├── proyectos/
│           │   ├── page.tsx
│           │   └── [slug]/page.tsx
│           └── contacto/page.tsx
├── public/
│   ├── fonts/
│   ├── stickers/
│   └── wordmark.svg
└── styles/
    └── globals.css
```

**Keputusan yang ditiru:**

- **i18n lewat URL segment** (`[lang]`), bukan library i18n. Dictionary JSON per bahasa, di-import di server component. Ringan, zero runtime cost.
- **CSS biasa, bukan Tailwind.** Class semantik (`.hero-stage`, `.nav-pill`). Total CSS produksi situs referensi cuma ~32KB — bukti sistem token yang disiplin lebih ringan daripada utility class.
- **Deploy Vercel**, CMS headless (Sanity) buat konten proyek. Bisa diganti Contentful/Payload/MDX lokal kalau konten jarang berubah.
- **Nol animation library.** Tidak ada GSAP, Lenis, Framer Motion, Three.js. Semua pakai `requestAnimationFrame`, `IntersectionObserver`, `pointer events`, dan CSS keyframes. Ini keputusan arsitektur utama yang harus dipertahankan.

---

## 2. Design tokens

```css
:root {
  /* Warna */
  --bg:        #f4f3ef;              /* off-white hangat */
  --ink:       #0d0d0b;              /* near-black */
  --ink-muted: #6b6b67;
  --accent:    #ff7002;              /* orange */
  --white:     #fff;
  --border:    rgba(13, 13, 11, .12);

  /* Motion */
  --ease:      cubic-bezier(0.16, 1, 0.3, 1);    /* expo-out — reveal & transform */
  --ease-soft: cubic-bezier(0.33, 1, 0.68, 1);   /* micro-interaction */

  /* Layout */
  --font:      "Switzer", sans-serif;
  --nav-h:     56px;
  --gutter:    80px;                 /* 20px di ≤768px */
}

html { font-size: 16px; }

body {
  font-family: var(--font);
  background: var(--bg);
  color: var(--ink);
  overflow-x: hidden;
}

body.preloading { overflow: hidden; }

::selection { background: var(--accent); color: var(--white); }
```

**Catatan palet:** ini pada dasarnya duotone — ink + bg — dengan orange sebagai satu-satunya aksen. Aksen dipakai sangat hemat: link, nomor urut, caret, progress bar, hover state. Jangan tambah warna kelima; kekuatan sistem ini justru di kelangkaannya.

---

## 3. Type scale

Semua ukuran fluid pakai `clamp()`. Tidak ada breakpoint-based font-size sama sekali.

| Peran | Ukuran | Weight | Letter-spacing | Line-height |
|---|---|---|---|---|
| Hero wordmark | `clamp(88px, 15.5vw, 270px)` | 400 | `-.03em` | 1 |
| Footer claim | `clamp(34px, 5.2vw, 76px)` | 300 | `-.022em` | 1.08 |
| Tagline besar | `clamp(30px, 4.9vw, 70px)` | 400 | `-.022em` | 1.12 |
| Service title | `clamp(36px, 5vw, 64px)` | 300 | `-.022em` | — |
| Mobile menu link | `clamp(32px, 8.5vw, 46px)` | 300 | `-.02em` | 1.2 |
| Clients paragraph | `clamp(22px, 3.3vw, 44px)` | 300 | `-.012em` | 1.38 |
| Detail heading | `clamp(22px, 5.4vw, 27px)` | 400 | `-.01em` | — |
| Detail body | `clamp(17px, 4.5vw, 22.5px)` | 300 | — | 1.4 |
| Section label (mono) | `15px` uppercase | 400 | `.05em` | — |
| Pill / eyebrow | `11–12px` uppercase | 400 | `.08em` | — |
| Meta / legal | `11–13px` | 300–400 | `.02–.05em` | — |

**Aturan yang konsisten di seluruh situs:**

- Makin besar teks, makin negatif letter-spacing (`-.012em` → `-.03em`).
- Makin besar teks, makin ringan weight (300 untuk display, 400 untuk body).
- Mono dipakai **hanya** untuk data & label struktural: section label, alamat, kontak, hint "DRAG". Tidak pernah untuk prosa.
- `font-variant-numeric: tabular-nums` di counter preloader supaya angka tidak goyang.

---

## 4. Layout system

```css
/* Gutter global */
.section { padding: 64px var(--gutter) 72px; }

@media (max-width: 768px) {
  :root { --gutter: 20px; }
}
```

**Breakpoints (desktop-first, `max-width`):**

| Query | Perubahan |
|---|---|
| `900px` | Services grid 2 kolom → 1 kolom |
| `768px` | Gutter 80→20px, nav jadi burger, footer grid → `display: contents` untuk reorder |
| `600px` | Cookie banner full-width |
| `480px` | Sticker scaling lebih agresif |
| `(hover: hover)` | Aktifkan custom cursor + `cursor: none` |
| `(hover: none), (pointer: coarse)` | Matikan custom cursor & drag badge |
| `(prefers-reduced-motion: reduce)` | Lihat §9 |

**Section divider:** garis hairline pakai pseudo-element, bukan `border-top`, supaya bisa inset mengikuti gutter.

```css
.section::before {
  content: "";
  position: absolute;
  top: 0; left: var(--gutter); right: var(--gutter);
  height: 1px;
  background: var(--border);
}
```

---

## 5. Global behaviors

### 5.1 Preloader

- `position: fixed; inset: 0; z-index: 1000; background: var(--ink)`
- Keluar dengan `transform: translateY(-100%)`, durasi `.9s var(--ease)` — bukan fade.
- Wordmark: wrapper `overflow: hidden`, child `translateY(110%)` → `0`, delay `.15s`. Mask reveal klasik.
- Counter angka di kanan-bawah, `tabular-nums`, opacity ~45%.
- Progress line 2px accent di dasar layar, `width: 0` → `100%`.
- `body.preloading { overflow: hidden }` selama aktif; lepas dengan menambah `body.loaded`.

Setelah selesai, `body.loaded` memicu seluruh entrance hero (marquee reveal + meta fade).

### 5.2 Custom cursor

Satu elemen `#cursor` yang diposisikan via rAF, dengan tiga state ukuran:

| State | Ukuran | Isi |
|---|---|---|
| default | 10px dot, solid ink | — |
| `.expand` | 48px, `rgba(ink,.1)` + `backdrop-filter: blur(2px)` | — |
| `.view` | 76px, solid accent | label teks |
| `.on-dark` | invert ke `--bg` | — |

`cursor: none` hanya di-apply dalam `@media (hover: hover)`. Di touch device elemen ini `display: none` dan cursor native kembali normal.

**Implementasi posisi:**

```js
let tx = 0, ty = 0, cx = 0, cy = 0;
addEventListener("pointermove", e => { tx = e.clientX; ty = e.clientY; });

function tick() {
  cx += (tx - cx) * 0.18;          // easing manual, no library
  cy += (ty - cy) * 0.18;
  cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
  requestAnimationFrame(tick);
}
tick();
```

### 5.3 Reveal on scroll

Satu observer global untuk semua `.reveal`:

```css
.reveal {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity .9s var(--ease), transform .9s var(--ease);
}
.reveal.in { opacity: 1; transform: none; }
```

```js
const io = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }),
  { rootMargin: "0px 0px -12% 0px", threshold: 0.15 }
);
document.querySelectorAll(".reveal").forEach(el => io.observe(el));
```

`unobserve` setelah trigger — reveal sekali saja, tidak reverse.

### 5.4 Noise overlay

Tekstur grain tanpa file gambar sama sekali. Inline SVG `feTurbulence` sebagai data-URI, opacity `.04`, `pointer-events: none`.

```css
.grain::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  opacity: .04;
  pointer-events: none;
}
```

Dipakai di footer gelap saja. Nol network request, nol layout cost.

### 5.5 Arrow micro-interaction

Semua tombol pill punya panah yang "terbang keluar lalu masuk lagi" saat hover. Wrapper `overflow: hidden`, panah dianimasikan diagonal.

```css
.pill { overflow: hidden; }
.pill:hover svg { animation: pillArrow .5s var(--ease); }

@keyframes pillArrow {
  0%   { transform: translate(0);            opacity: 1; }
  45%  { transform: translate(130%, -130%);  opacity: 0; }
  50%  { transform: translate(-130%, 130%);  opacity: 0; }
  100% { transform: translate(0);            opacity: 1; }
}
```

Detail kecil tapi ini yang bikin situs terasa "dirancang". Pakai di semua CTA supaya konsisten.

---

## 6. Spesifikasi per section

### 6.1 Navigation

Fixed, tinggi `--nav-h` (56px), `display: grid`.

**Dua state yang saling silang di `grid-area: 1/1`** — ini trik utamanya. Nav punya dua set konten (top & scrolled) yang ditumpuk di grid cell yang sama, lalu cross-fade dengan translate ±12px. Tidak ada layout shift karena keduanya selalu ada di DOM.

| State | Perilaku |
|---|---|
| `.nav-state-top` | Konten default, terlihat di posisi scroll 0 |
| `.scrolled` | `background: rgba(bg, .85)`, `backdrop-filter: blur(14px)`, border bawah muncul; konten tukar ke versi ringkas |
| `.hidden` | `translateY(-100%)` — sembunyi saat scroll turun, muncul saat scroll naik |
| `.nav-dark` | Inversi warna saat nav berada di atas section gelap |

**Pill link:** `11px` uppercase, `letter-spacing: .08em`, padding `8px 14px`, `border-radius: 100px`, border `rgba(ink,.4)`, background semi-transparan + `blur(6px)`. Hover → solid accent.

**Drawer "More":** `max-width: 0` → `720px` dengan transisi `.6s var(--ease)` saat hover/open. Animasi `max-width` di sini aman karena kontennya `white-space: nowrap` + `flex-shrink: 0`.

**Language switch:** toggle fisik 56×28px, knob 22px yang geser `translateX(28px)`. Dua label absolute yang saling cross-fade opacity. Jauh lebih berkarakter daripada dropdown.

**Mobile (≤768px):** nav jadi flex sederhana dengan logo + burger. Fullscreen overlay `background: var(--ink)`, link stagger `translateY(20px)` → `0` dengan delay bertingkat `.07s / .12s / .17s / …`.

### 6.2 Hero

```
height: 100svh   ← svh, bukan vh (hindari jump di mobile browser chrome)
padding-top: var(--nav-h)
display: flex; flex-direction: column
overflow: hidden
```

**Marquee wordmark** — elemen utama halaman:

```css
.hero-track {
  display: flex;
  width: max-content;
  animation: heroMarquee 36s linear infinite;
  will-change: transform;
}
@keyframes heroMarquee { to { transform: translateX(-50%); } }
.hero-marquee:hover .hero-track { animation-play-state: paused; }
```

Konten track **diduplikasi persis 2×**, lalu digeser `-50%` — itu sebabnya loop-nya seamless. Durasi 36s.

**Entrance:** wrapper `overflow: hidden`, track `translateY(112%)` → `0` selama `1.25s var(--ease)`, dipicu `body.loaded`.

**Sticker layer** — dua layer parallax mengapit marquee:

```
.hero-stickers-back   z-index: 0   ← di belakang teks
.hero-stage           z-index: 1
.hero-stickers-front  z-index: 2   ← di depan teks
.hero-meta            z-index: 3
```

Tiap sticker diposisikan lewat CSS custom property, bukan class:

```css
.hsticker {
  position: absolute;
  left: calc(var(--x, 50) * 1%);
  top:  calc(var(--y, 50) * 1%);
  width: calc(var(--w, 10) * 1vw);
  will-change: transform;
}
.hsticker img {
  transform: translate(-50%, -50%) rotate(var(--r, 0deg));
  filter: drop-shadow(0 10px 26px rgba(0,0,0,.07));
  user-select: none;
}
```

```html
<div class="hsticker" style="--x:22; --y:38; --w:9; --r:-6deg">…</div>
```

Data-driven penuh — posisi bisa datang dari CMS tanpa nulis CSS baru. Parallax digerakkan JS yang menulis `transform` pada `.hsticker` berdasarkan `scrollY` × faktor kedalaman per layer.

**Meta bar** di dasar hero: koordinat geografis + tahun berdiri di kiri, link + scroll cue di kanan. Fade-in dengan delay `.85s` (setelah marquee selesai). Scroll cue pakai garis 1px 24px yang berdenyut:

```css
@keyframes scrollPulse {
  0%, 100% { transform: scaleY(.3); opacity: .4; }
  50%      { transform: scaleY(1);  opacity: 1; }
}
```

### 6.3 Sticker upload (signature element)

Fitur UGC: pengunjung upload gambar, muncul jadi sticker di hero.

**Flow:**
1. CTA sticker (rotate `-4deg`, hover → `rotate(0) scale(1.07)`) membuka modal.
2. Modal: dropzone dashed, hover/drag-over → border accent + background `color-mix(accent 7%)`.
3. Preview `max-height: 180px`.
4. Tombol "Place" (accent solid) → resize via `<canvas>` sebelum upload.
5. Hero masuk state `.placing` → semua sticker `opacity: 0` selama transisi masuk.

**Modal motion:**
```css
@keyframes smPop {
  from { opacity: 0; transform: translate(-50%, -46%) scale(.96); }
  to   { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
```
Backdrop `rgba(20,18,16,.55)` + `blur(3px)`, card `border-radius: 14px`, shadow `0 30px 80px rgba(0,0,0,.3)`.

**Wajib ditambahkan kalau direplikasi** (situs referensi tidak menunjukkan ini di client):
- Validasi MIME + magic bytes, bukan cuma ekstensi
- Batas ukuran file & dimensi
- Moderasi/antrian approval — konten publik dari anonim itu risiko
- Rate limit per IP

### 6.4 Showreel

```css
.reel-wrap {
  height: 88svh;
  min-height: 480px;
  border-radius: 4px;
  overflow: hidden;
  background: #0c0c0b;
  transform: scale(.9);       /* JS scale ke 1 saat masuk viewport */
  will-change: transform;
}
#reel-video {
  position: absolute;
  inset: -8% 0;               /* overscan */
  height: 116%;
  object-fit: cover;
}
```

Video di-overscan 8% atas-bawah supaya bisa digeser parallax di dalam frame tanpa memperlihatkan tepi. Wrapper mulai `scale(.9)` lalu membesar ke 1 saat scroll — efek "membuka".

Overlay: tag di kiri-bawah, tahun di kanan-atas, keduanya fade-in dengan delay `.9s` dan `1.05s` setelah `.in`.

**Jangan tiru hosting-nya.** Situs referensi menyajikan MP4 langsung dari Dropbox — rapuh, tidak ada adaptive bitrate, rawan rate limit. Pakai Mux, Cloudflare Stream, atau Vercel Blob dengan HLS. Sediakan poster frame supaya LCP tidak menunggu video.

### 6.5 Tagline (word-by-word reveal)

Tiap kata dibungkus mask sendiri:

```html
<p><span class="w"><span>Kata</span></span> <span class="w"><span>berikutnya</span></span> …</p>
```

```css
.w { display: inline-block; overflow: hidden; vertical-align: bottom;
     padding-bottom: .2em; margin-bottom: -.2em; }
.w span { display: inline-block; transform: translateY(110%);
          transition: transform .9s var(--ease); }
.in .w span { transform: none; }
.w em { font-style: normal; color: var(--accent); }
```

`padding-bottom` + `margin-bottom` negatif itu penting — tanpa itu descender huruf (g, y, p) kepotong oleh `overflow: hidden`.

Untuk stagger, tambahkan `transition-delay` inkremental per kata via inline style saat render (misal `index * 18ms`).

### 6.6 Services (accordion auto-advance)

Grid `1fr 1fr`, kiri daftar, kanan detail. Di ≤900px jadi satu kolom.

**Item state:**

| Properti | Idle | Active |
|---|---|---|
| `padding-left` | 0 | `36px` |
| `h3` color | `rgba(13,13,11,.26)` | `var(--ink)` |
| Nomor urut | `opacity: 0`, `translateX(-12px)` | visible, `translateX(0)` |
| Panah kanan | `opacity: 0`, offset `-16px` | visible |

**Auto-advance 6 detik** dengan progress bar sebagai afordans waktu:

```css
.service-item.active .service-progress {
  animation: progressFill 6s linear forwards;
}
@keyframes progressFill {
  from { width: 0; }
  to   { width: calc(100% - 36px); }
}
```

Detail panel: semua konten di-render bersamaan sebagai `position: absolute` yang saling menimpa, hanya yang `.visible` yang `opacity: 1` + `pointer-events: auto`. Tidak ada mount/unmount, jadi transisinya mulus.

**Tambahkan sendiri:** pause on hover/focus, dan hentikan auto-advance permanen setelah user klik manual. Carousel yang terus jalan sendiri setelah diinteraksi itu mengganggu.

Nomor 01/02/03 di sini valid karena ini benar-benar urutan proses (strategi → identitas → aktivasi), bukan dekorasi.

### 6.7 Projects (drag strip)

**Ini native horizontal scroll**, bukan transform carousel:

```css
.projects-strip {
  --strip-h: clamp(320px, 52vh, 520px);
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 0 var(--gutter) 8px;
  margin: 0 calc(var(--gutter) * -1);   /* full-bleed tapi konten tetap align gutter */
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.projects-strip::-webkit-scrollbar { display: none; }
```

Kombinasi `padding` + `margin` negatif ini yang bikin strip bisa bleed ke tepi layar tapi item pertama tetap sejajar gutter. Keuntungannya: momentum scroll native di mobile gratis, keyboard scroll jalan, tidak perlu physics engine.

Drag mouse ditambahkan di atasnya via `pointerdown` → `pointermove` → set `scrollLeft`. Tambah class `.dragging` untuk menonaktifkan pointer-events pada link agar drag tidak memicu navigasi.

**Item sizing pakai aspect ratio, bukan lebar tetap:**

```css
.p-item.p-ar { width: calc(var(--strip-h) * var(--ar)); }
```
```html
<a class="p-item p-ar" style="--ar: 1.5">…</a>
```

Tinggi seragam, lebar mengikuti rasio asli gambar. Strip jadi terasa editorial, bukan grid kaku.

**Reveal per item:**

```css
.p-media {
  height: var(--strip-h);
  clip-path: inset(10% 6% 10% 6% round 3px);
  transition: clip-path 1.1s var(--ease);
}
.p-item.in .p-media { clip-path: inset(0 0 0 0 round 3px); }

.p-img { transform: scale(1.18); transition: transform 1.3s var(--ease); }
.p-item.in .p-img { transform: scale(1.001); }
.p-item.in:hover .p-img { transform: scale(1.05); transition-duration: .7s; }
```

Clip-path membuka dari dalam sementara gambar zoom keluar — dua gerakan berlawanan arah yang terasi jauh lebih mahal daripada fade biasa. `scale(1.001)` bukan `scale(1)` untuk memaksa GPU layer tetap aktif.

**Drag badge:** pill gelap "DRAG" yang mengikuti cursor, hilang saat `.dragging` aktif:

```css
.projects-stage:has(.projects-strip.dragging) .drag-badge { opacity: 0; }
```

`:has()` di sini menghindari satu baris JS. Badge `display: none` di `(pointer: coarse)`.

### 6.8 Clients (typewriter)

Paragraf yang mengetik sendiri, dengan nama klien sebagai link inline.

**Trik anti layout-shift:** dua salinan teks ditumpuk.

```css
.ct-ghost { visibility: hidden; }              /* reserve tinggi final */
.ct-live  { position: absolute; inset: 0; }    /* teks yang diketik */
.ct-caret {
  display: inline-block;
  width: 2px; height: .85em;
  background: var(--accent);
  margin-left: 3px;
  animation: caretBlink .8s steps(1) infinite;
}
@keyframes caretBlink { 50% { opacity: 0; } }
```

Ghost menahan tinggi container sejak awal, jadi konten di bawahnya tidak melompat saat teks bertambah. Wajib ditiru — ini pembeda antara typewriter yang halus dan yang bikin halaman gemetar.

`steps(1)` pada caret memberi kedip mekanis, bukan fade.

### 6.9 Footer CTA

```css
#footer-cta {
  background: var(--ink);
  color: var(--bg);
  padding: 88px var(--gutter) 48px;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
```

Claim besar dengan **line-by-line stagger** (bukan per kata — skala lebih besar, gerakan lebih tenang):

```css
.line { display: block; overflow: hidden; padding-bottom: .14em; margin-bottom: -.14em; }
.line span { display: inline-block; transform: translateY(110%); transition: transform 1s var(--ease); }
.in .line:nth-child(1) span { transform: none; transition-delay: 0s; }
.in .line:nth-child(2) span { transform: none; transition-delay: .08s; }
.in .line:nth-child(3) span { transform: none; transition-delay: .16s; }
```

Noise overlay (§5.4) di-apply di sini.

**Footer nav underline** yang menyapu dari kanan ke kiri saat masuk, kiri ke kanan saat hover:

```css
.footer-nav a::after {
  content: "";
  position: absolute; bottom: -3px; left: 0;
  width: 100%; height: 1px;
  background: var(--bg);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform .35s var(--ease);
}
.footer-nav a:hover::after { transform: scaleX(1); transform-origin: left; }
```

**Mobile reorder:** di ≤768px, `.footer-top` diubah jadi `display: contents` sehingga anak-anaknya naik ke flex parent dan bisa diurutkan ulang dengan `order`. Cara paling bersih untuk reorder tanpa duplikasi markup.

### 6.10 Cookie banner

Card kiri-bawah, `max-width: 440px`, muncul dengan `translateY(16px)` → `0` selama `.5s`. Dua tombol setara lebar (`flex: 1 1 0`) — accept dan deny punya bobot visual sama. Di ≤600px jadi full-width dengan margin 12px.

Tombol deny tidak boleh dibuat lebih kecil atau lebih pudar dari accept — selain masalah kepatuhan, itu dark pattern.

---

## 7. Inventaris motion

| Nama | Target | Durasi | Easing | Trigger |
|---|---|---|---|---|
| `preBrandUp` | Wordmark preloader | .9s | `--ease` | Load |
| Preloader exit | `#preloader` | .9s | `--ease` | Assets ready |
| Hero reveal | `.hero-track` | 1.25s | `--ease` | `body.loaded` |
| `heroMarquee` | `.hero-track` | 36s | linear | Infinite |
| `scrollPulse` | Scroll cue | 1.8s | ease-in-out | Infinite |
| Reel scale | `.reel-wrap` | scroll-linked | — | rAF + scrollY |
| Word reveal | `.w span` | .9s | `--ease` | IO |
| `progressFill` | Service bar | 6s | linear | State active |
| Clip reveal | `.p-media` | 1.1s | `--ease` | IO |
| Image zoom-out | `.p-img` | 1.3s | `--ease` | IO |
| `caretBlink` | Typewriter caret | .8s | `steps(1)` | Infinite |
| Line stagger | `.line span` | 1s + 80ms | `--ease` | IO |
| `pillArrow` | Panah CTA | .5s | `--ease` | Hover |
| `smPop` / `smFade` | Modal | .3s / .25s | `--ease` | Open |
| `ccIn` | Cookie card | .5s | `--ease` | Mount |
| Generic reveal | `.reveal` | .9s | `--ease` | IO |

**Pola yang terlihat:** hampir semua gerakan besar memakai `--ease` (expo-out) dengan durasi 0.9–1.3s. Micro-interaction memakai `--ease-soft` dengan durasi 0.25–0.35s. Cuma dua kecepatan — itu yang bikin situs terasa satu kesatuan.

---

## 8. Performa

**Yang benar dan harus ditiru:**
- Native scroll, bukan virtual scroll — tidak merusak accessibility, tidak berat di low-end device
- Nol animation library
- Semua animasi di `transform` / `opacity` / `clip-path`
- `will-change` dipakai selektif, hanya pada elemen yang benar-benar bergerak terus
- `font-display: swap`
- CSS total ~32KB

**Yang salah di situs referensi dan harus diperbaiki:**

| Masalah | Perbaikan |
|---|---|
| Video MP4 dari Dropbox | Mux / Cloudflare Stream, HLS + poster |
| Hanya 1 `<img>` di HTML SSR, sisanya client-rendered | Render sticker & project di server; `priority` pada LCP image |
| Font `.ttf` / `.otf` (tidak terkompresi) | Konversi ke `.woff2` — hemat 40–60% |
| Tidak ada `ResizeObserver` | Recalculate lebar drag strip saat resize |
| `will-change` pada marquee permanen | Ini oke untuk marquee infinite, tapi jangan diperluas |

---

## 9. Accessibility

**Reduced motion** — situs referensi menangani ini dengan benar, tiru persis:

```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
  #preloader { display: none; }
  body.preloading { overflow: auto; }
  .hero-reveal, .p-img, .p-media, .reel-wrap { transform: none; clip-path: none; }
  .hero-track { animation: none; }
  .reveal, .hero-meta, .w span, .line span { opacity: 1; transform: none; }
}
```

Perhatikan: preloader **dimatikan sepenuhnya**, bukan dipercepat. Marquee **berhenti**, tidak jalan cepat.

**Yang harus ditambahkan sendiri** (celah di situs referensi):

- [ ] Focus ring terlihat pada semua interaktif — `cursor: none` global bikin keyboard user kehilangan orientasi kalau tidak ada `:focus-visible` yang kuat
- [ ] `aria-label` pada tombol ikon (mute, close, burger)
- [ ] Drag strip bisa di-scroll dengan panah keyboard (native `overflow-x` sudah membantu, pastikan strip `tabindex="0"` atau item-nya fokusabel)
- [ ] Services accordion: `aria-expanded`, pause auto-advance saat fokus masuk
- [ ] Skip-to-content link
- [ ] `prefers-contrast` — teks `rgba(13,13,11,.26)` pada service item idle itu di bawah 3:1
- [ ] Modal: focus trap + `Escape` + kembalikan fokus ke trigger

---

## 10. Urutan build

**Milestone 1 — Fondasi**
1. Scaffold Next.js App Router + route group `[lang]`
2. Font `.woff2` + `@font-face`
3. Token CSS lengkap (§2), reset, type scale
4. Layout shell: nav + footer statis, tanpa animasi

**Milestone 2 — Sistem motion**
5. Reveal observer global
6. Custom cursor + rAF loop
7. Preloader
8. Blok `prefers-reduced-motion`

**Milestone 3 — Section**
9. Hero: marquee → sticker layer → parallax
10. Tagline word reveal
11. Services accordion + auto-advance
12. Projects drag strip
13. Clients typewriter
14. Footer CTA + noise
15. Reel player

**Milestone 4 — Konten & polish**
16. Integrasi CMS
17. Cookie consent
18. Sticker upload + moderasi (kalau memang dipakai)
19. Audit a11y (§9)
20. Lighthouse: target LCP < 2.5s, CLS < 0.1

---

## 11. Aset yang harus disiapkan sendiri

| Aset | Spesifikasi |
|---|---|
| Wordmark | SVG, dipakai berulang di marquee — jaga optical height ~`clamp(64px, 11vw, 190px)` |
| Sticker set | PNG transparan, 500–900px, 6–10 buah, drop-shadow ditangani CSS |
| Project cover | Rasio bervariasi (`--ar` 0.8–1.8), tinggi seragam via `--strip-h` |
| Showreel | MP4/HLS, ~16:9, poster frame wajib |
| OG image | 1200×630 |
| Font | `.woff2`, 3 weight (300/400/500) + 1 mono |

---

## 12. Ringkasan: 8 teknik paling berharga

1. **Nav dua-state di satu grid cell** — cross-fade tanpa layout shift
2. **Sticker via CSS custom property** (`--x`, `--y`, `--w`, `--r`) — posisi data-driven dari CMS
3. **Marquee duplikasi 2× + `translateX(-50%)`** — loop seamless, murni CSS
4. **Full-bleed strip via padding + margin negatif** — native scroll, momentum gratis
5. **`clip-path` membuka + gambar zoom keluar** — dua arah berlawanan, terasa mahal
6. **Ghost text untuk typewriter** — nol CLS
7. **Noise via `feTurbulence` data-URI** — nol request
8. **Dua kecepatan easing saja** — `--ease` untuk besar, `--ease-soft` untuk kecil

---

*Spec ini mendokumentasikan arsitektur dan teknik implementasi. Seluruh aset visual, copy, dan identitas merek pada situs referensi adalah milik BeNorth.Studio dan tidak termasuk dalam cakupan replikasi.*
