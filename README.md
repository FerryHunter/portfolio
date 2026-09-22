# Ferry Works — portfolio

Portfolio UI/UX product designer untuk **Mochamad Feriansyah**
(mr.feriansyah@gmail.com), 7+ tahun pengalaman.

Arsitektur, sistem token, dan mekanik interaksi mengikuti
`benorth-clone-spec.md`. Seluruh copy ditulis untuk portfolio ini;
identitas merek situs referensi tidak termasuk cakupan (§0).

Sumber data konten: portfolio lama di
<https://ferryworks.framer.website/> — daftar proyek, peran, dan
pengalaman diambil dari sana, wording-nya ditulis ulang.

---

## Cara menjalankan

### A. Preview statis — tanpa Node

Node tidak wajib untuk melihat dan menguji seluruh interaksi.

```bash
python3 -m http.server 4321
```

Buka <http://localhost:4321/preview/> (versi ID: `/preview/index.id.html`).
Halaman case study: `/preview/stiqy-questing.html` dan
`/preview/nanovest-calendar.html` (versi ID: berkas yang sama
dengan sisipan `.id`).

Halaman ini memuat `app/globals.css` dan `motion/*.js` **yang sama
persis** dengan yang dipakai Next.js. Markup-nya digenerate dari
`content/*.json`:

```bash
python3 scripts/build_preview.py            # index, en (default)
python3 scripts/build_preview.py id         # index, id
python3 scripts/case_stiqy_questing.py      # case Stiqy, en
python3 scripts/case_stiqy_questing.py id   # case Stiqy, id
python3 scripts/case_nanovest_calendar.py     # case Nanovest, en
python3 scripts/case_nanovest_calendar.py id  # case Nanovest, id
```

Satu generator per proyek (`scripts/case_<slug>.py`), sepasang
dengan komponennya di `components/cases/`.

Regenerate setiap kali `content/*.json` berubah.

### B. Next.js

Butuh Node 18.17+. Mesin ini belum punya Node maupun Homebrew.
Pasang salah satu:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
```

lalu `nvm install --lts`. Alternatif: installer resmi dari
<https://nodejs.org> (butuh password admin).

```bash
npm install
npm run dev     # http://localhost:3000 → redirect ke /en
```

---

## Struktur

```
app/
  layout.tsx                  <html>, font Switzer + JetBrains Mono
  globals.css                 seluruh design system (§2–§9), ~1.200 baris
  page.tsx                    redirect / → /en
  (site)/[lang]/
    layout.tsx                nav + footer + MotionRoot
    page.tsx                  hero, tagline, services, projects
    work/[slug]/page.tsx      case study, komponennya dari registry
    not-found.tsx
components/                   server component, nol state React
  Nav Hero StickerModal Tagline Services Projects FooterCta Words Arrow
  MotionRoot.tsx              satu-satunya "use client"
  cases/                      satu komponen per proyek
    index.ts                  registry slug → komponen
    types.ts                  CaseProps
    StiqyQuesting.tsx         Stiqy · Questing Dashboard (§6.11)
    NanovestCalendar.tsx      Nanovest · Event Calendar (§6.11)
motion/                       ← sumber kebenaran tunggal untuk interaksi
  index.js reveal.js nav.js hero.js services.js strip.js stickers.js
content/en.json content/id.json
lib/dict.ts                   i18n via URL segment, tanpa library
preview/                      hasil generate, jangan diedit manual
scripts/chrome.py             nav, footer, preloader, cookie, shell
scripts/build_preview.py      halaman index
scripts/case_stiqy_questing.py    halaman case Stiqy
scripts/case_nanovest_calendar.py halaman case Nanovest
```

### Aset case study

Berkas mentah dari desainer disimpan di `Source/<Proyek>/`; yang
benar-benar dipakai halaman disalin ke `public/work/<slug>/`.
Di `content/*.json` jalurnya ditulis relatif terhadap `/public`
(`/work/stiqy/home.png`) supaya Next bisa memakainya apa adanya —
halaman preview duduk di `/preview/`, jadi generator yang
menambahkan prefiks `../public`.

Tiga jenis slot gambar:

| Slot | Isi | Catatan |
| --- | --- | --- |
| `img` | aset asli | `ar` = rasio asli aset → nol pemotongan |
| `seed` | picsum | slot yang materinya belum ada, nol file dummy |
| `img` + `focus` | potongan 1:1 | `focus` = `object-position`, mis. `"35% 27%"` |

**Aset ponsel.** Layar potret 9:19,5 tidak dipotong sama sekali —
yang dibatasi lebarnya. Tiga kelas di §6.11 (dipakai case
Nanovest, lihat `case_nanovest_calendar.py`):

- `.case-media--phone` — slot tanpa latar dan tanpa bingkai. Aset
  ponsel sudah membawa sudut membulatnya sendiri; latar slot akan
  terlihat sebagai empat siku abu-abu di ujung layar.
- `.case-fig--phone` — cover dibatasi 380px. Satu layar 9:19,5
  selebar 1.120px berdiri setinggi tiga layar desktop.
- `.case-gallery--phones` — kolom auto-fit sempit untuk galeri
  layar potret.

Di anatomi, slotnya 320px dan di tengah kolomnya
(`.case-step .case-media--phone`): memotong layar jadi kotak
lanskap menyembunyikan bentuk layar yang justru sedang dibicarakan
paragrafnya.

**Video interaksi.** `cases.<slug>.video.src` kosong = placeholder:
poster diredupkan plus badge, tanpa elemen `<video>` sama sekali.
Untuk mengisinya: taruh `interaction.mp4` di `public/work/<slug>/`,
set `"src": "/work/<slug>/interaction.mp4"`, lalu regenerate
preview. Markup-nya berganti sendiri, dan `motion/reel.js` yang
meng-attach video saat frame mendekati viewport (poster tetap LCP).

### Menambah proyek baru

Empat berkas, tidak ada template generik yang perlu ditambah flag:

1. `content/en.json` + `content/id.json` → satu entri di `cases`,
   dan `case: "<slug>"` pada item proyek terkait.
2. `components/cases/<Nama>.tsx` — layout halamannya, bebas
   berbeda dari case lain.
3. Satu baris di `components/cases/index.ts`.
4. `scripts/case_<slug>.py` — pasangan preview statisnya.

Nav dan footer hanya ditulis sekali, di `scripts/chrome.py`.
Halaman preview baru mengimpor dari sana, tidak menyalin markup —
salinan itulah yang paling cepat menyimpang.

### Kenapa interaksi ada di `motion/*.js`, bukan di dalam komponen

Supaya satu implementasi dipakai dua konsumen: komponen React dan
halaman preview statis. Tidak ada logika yang ditulis dua kali,
jadi tidak ada kemungkinan menyimpang. Konsekuensinya komponen jadi
server component semua — sejalan dengan §8 (render di server).

---

## Cakupan build ini

Seluruh section dalam spec sudah terpasang:

| Spec | Status |
|---|---|
| §5.1 Preloader | ada |
| §5.2 Custom cursor | ada |
| §5.3 Reveal observer | ada |
| §5.4 Noise overlay | ada |
| §5.5 Arrow micro-interaction | ada |
| §6.1 Navigation dua-state | ada |
| §6.2 Hero marquee + sticker parallax | ada |
| §6.3 Sticker upload | ada (client-only) |
| §6.4 Showreel | ada (slot video kosong) |
| §6.5 Tagline word-reveal | ada |
| §6.6 Services accordion | ada |
| §6.7 Projects drag strip | ada |
| §6.8 Clients typewriter | ada |
| §6.9 Footer CTA | ada |
| §6.10 Cookie banner | ada |
| §9 Reduced motion + a11y | ada |

### Dua hal yang perlu diisi sendiri

**Video showreel.** `components/Showreel.tsx` dan
`scripts/build_preview.py` punya konstanta `REEL_SRC` yang masih
kosong. Selama kosong, yang dirender adalah `<img>` poster —
poster itulah LCP, bukan video. Isi dengan URL HLS dari Mux /
Cloudflare Stream / Vercel Blob; jangan MP4 langsung dari Dropbox
seperti situs referensi (§6.4). Begitu diisi, `<video>` plus
tombol mute otomatis muncul dan `motion/reel.js` meng-attach
sumbernya hanya saat mendekati viewport.

**Sticker PNG transparan.** Sekarang masih foto picsum dengan
border putih, jadi terbaca sebagai polaroid, bukan sticker.
Spesifikasinya di §11: PNG transparan 500–900px, 6–10 buah.

### Konten

Semua teks ada di `content/en.json` dan `content/id.json` — nol
copy yang hardcoded di komponen maupun di modul motion. Struktur
kunci kedua file identik (dicek dengan perbandingan set kunci),
jadi menambah bahasa = satu file JSON + satu baris di
`lib/dict.ts`.

Pesan error upload sticker dan label cursor ikut lewat markup
(`data-msg-*`, `data-label-default`), jadi `motion/*.js`
sepenuhnya bebas bahasa.

Kalau situsnya mau satu bahasa saja: hapus `content/id.json`,
hapus `id` dari `LANGS` di `lib/dict.ts`, dan hapus `langToggle`
di `components/Nav.tsx`.

### Pemetaan section

| Section | Anchor | Isi |
|---|---|---|
| Hero | `#top` | marquee "Ferry Works" + sticker |
| Showreel | — | poster; `REEL_SRC` masih kosong |
| About | `#about` | pernyataan posisi, word-reveal |
| Process | `#process` | Discovery / Design / Delivery |
| Work | `#work` | 8 proyek dari portfolio lama |
| Range | — | typewriter lintas industri |
| Contact | `#contact` | footer CTA + email |

### Tautan: kosong berarti tidak dirender

`footer.social[].href` dan `footer.cvHref` yang masih kosong
sengaja tidak dirender sama sekali. Tautan mati lebih buruk
daripada tautan yang belum ada, terutama di portfolio. Begitu
nilainya diisi, tombolnya muncul sendiri.

Status saat ini:

| Tautan | Sumber | Status |
|---|---|---|
| LinkedIn | portfolio Framer | terisi |
| WhatsApp | portfolio Framer | terisi |
| Contact | mailto dengan template dari portfolio Framer | terisi |
| Dribbble | — | **belum ada URL** |
| Download CV | — | **belum ada berkas** |

Untuk CV: taruh berkasnya di `public/cv/`, lalu isi `footer.cvHref`
di kedua file content dengan path-nya.

### Ornamen orbit di section Sectors

Line art di sisi kanan, terpotong tepat setengah, berputar 90s
linear. Beberapa keputusan yang tidak sembarang:

**Dipakai lewat CSS `mask`, bukan inline SVG.** `public/orbit.svg`
jadi sumber tunggal untuk komponen React dan generator preview,
jadi tidak ada markup SVG yang diduplikasi di dua tempat.
Warnanya tetap ikut token (`background: var(--ink)`), bukan warna
mati di dalam berkas.

**URL mask-nya relatif** (`url("../public/orbit.svg")`), bukan
`/orbit.svg`. Di Next, path absolut ke `public/` memang lazim,
tapi path relatif inilah yang membuat CSS yang sama juga bekerja
di preview statis yang disajikan `python -m http.server`. Webpack
tetap memancarkan asetnya seperti biasa.

**Bentuknya asimetris dengan sengaja** — tiga jeruji pada sudut
tak beraturan, satu busur tebal, satu busur putus-putus, dan tiga
titik. Lingkaran konsentris yang benar-benar simetris akan
terlihat diam saat diputar.

**Wrapper memegang posisi, anaknya memegang rotasi.** Satu elemen
tidak bisa memegang dua transform dengan tujuan berbeda:
`translate(50%, -50%)` untuk memotong setengah, dan `rotate()`
untuk animasi. Potongannya sendiri dari `overflow: hidden` pada
section.

Disembunyikan di ≤900px, karena di sana teks memakai seluruh
lebar dan sisi kanan tidak lagi kosong. Rotasi mati pada
`prefers-reduced-motion`.

### Daftar company

Delapan nama, semuanya berlink. URL-nya diverifikasi lewat
pencarian, bukan ditebak: menautkan portfolio ke domain yang salah
lebih buruk daripada tidak menautkan sama sekali.

| Company | URL | Catatan |
|---|---|---|
| Nanovest | nanovest.io | |
| Stiqy | stiqy.io | |
| Pluang | pluang.com | |
| Bukalapak | bukalapak.com | situs korporatnya `about.bukalapak.com` |
| Argus Labs | argus.gg | pembuat World Engine |
| Reku | reku.id | |
| Tricor | tricorglobal.com | **rebrand ke Vistra, Maret 2024** |
| KB Bank | kbbank.co.id | **entitas berganti nama jadi PT Bank KB Indonesia, Agustus 2025** |

Dua baris terakhir mungkin perlu diarahkan ulang kalau kamu ingin
menunjuk brand yang sekarang.

Nama dirender sebagai wordmark tipografis, bukan logo: situs ini
duotone dan tidak punya aset logo pihak ketiga.

**Struktur markup penting.** `.company` adalah wrapper, `<a>` ada
di dalamnya. Separator `·` hidup di wrapper sebagai `::after`.
Kalau separator dipasang di elemen link, titiknya ikut masuk ke
dalam `<a>` sehingga ikut ter-underline dan ikut bisa diklik.

Separator juga memakai `::after` pada item non-terakhir, bukan
`::before` pada item non-pertama. Saat daftar wrap, versi
`::before` membuat titik pindah ke awal baris berikutnya dan
terbaca sebagai bullet.

Entri dengan `href` kosong dirender sebagai teks biasa, bukan link
mati.

### Cursor kustom hilang saat hover di atas modal

Dilaporkan: kursor sepenuhnya menghilang saat hover di atas modal
résumé. Penyebabnya bug layering `z-index`, dan bukan cuma di modal
résumé — `#cursor` punya `z-index: 950`, sementara SEMUA overlay di
situs ini duduk lebih tinggi: preloader `1000`, cookie banner
`1050`, kedua modal (sticker upload DAN résumé) `1100`/`1101`.
Kursor tetap mengikuti mouse dengan benar (JS tidak salah), tapi
secara visual tertutup di balik lapisan apa pun yang lebih tinggi
— dan karena `cursor: none` tetap aktif di `body` terlepas dari
itu, hasilnya benar-benar nol kursor sama sekali, bukan kembali ke
kursor native.

Diperbaiki dengan satu perubahan: `#cursor` dinaikkan ke
`z-index: 2001` — di atas SEMUA overlay di situs ini, hanya di
bawah `.skip-link` (`2000`, elemen aksesibilitas keyboard-only yang
toh tidak pernah tumpang tindih dengan `cursor:none` yang khusus
untuk mouse).

**Modal sticker upload (§6.3) punya bug identik dan ikut
terselesaikan oleh perubahan yang sama** — tidak pernah dilaporkan,
karena keduanya berbagi elemen `#cursor` yang sama secara sitewide,
satu perbaikan z-index otomatis menuntaskan keduanya sekaligus,
bukan dua perbaikan terpisah.

Diverifikasi lewat screenshot visual nyata (bukan cuma nilai
`z-index` di CSS): kursor mode idle (titik kecil) terlihat jelas
di atas form modal résumé; digerakkan ke tombol "Send request",
kursor beralih ke mode expand (lingkaran semi-transparan besar) dan
tetap terlihat menimpa tombol tersebut. Diuji ulang identik di
modal sticker upload dengan hasil sama.

### "Nanovest App Redesign" tidak bisa diklik — case study lengkap tapi tidak tersambung

Dilaporkan lewat screenshot: kartu ini terlihat normal tapi klik
tidak melakukan apa pun. Audit membuktikan ini BUKAN situasi
"belum siap" — case study lengkap untuk proyek ini sudah ada
sepenuhnya: `components/cases/NanovestAppRedesign.tsx` sudah
terdaftar di registry, `scripts/case_nanovest_app_redesign.py`
sudah ada, `content/*.json → cases.nanovest-app-redesign` sudah
lengkap (cover, poster, 8 item galeri), 8 aset WebP asli sudah ada
di `public/work/nanovest-app-redesign/`, bahkan halaman preview
statisnya sudah pernah ter-generate. Satu-satunya yang hilang:
entri strip proyeknya sendiri (`projects.items[].href` dan
`.case`) masih string kosong — case study-nya yatim piatu, tidak
ada yang menaut ke sana.

**Petunjuk yang mengarahkan ke solusi yang benar**: field
`cases.nanovest-app-redesign.next` ternyata sudah pre-configured
menunjuk ke "Amazon Checkout Redesign" — sinyal kuat bahwa proyek
ini memang dirancang duduk di antara "Nanovest Investment App" dan
"Amazon" dalam siklus "next case", bukan proyek yang sengaja
ditinggalkan belum jadi.

Diperbaiki dengan tiga baris data, bukan membangun apa pun dari
nol: `href`/`case` entri strip disambungkan ke case study yang
sudah ada, dan `cases.nanovest-investment-app.next` di-reroute
dari langsung-ke-Amazon menjadi lewat proyek ini dulu, menyisipkan
node ke-14 ke siklus "next case" yang sebelumnya 13-node tertutup.
`cases.nanovest-app-redesign.next` sendiri tidak perlu diubah,
sudah benar sejak awal.

Diverifikasi end-to-end: siklus 14-node ditelusuri dari awal
sampai tertutup kembali lewat fetch berantai, semua `200`, "Nanovest
App Redesign" muncul tepat di posisi yang benar di antara Investment
App dan Amazon. Kartu strip dikonfirmasi sudah jadi `<a>` sungguhan
(bukan lagi jatuh ke `#work`), 10 gambar di halaman case study-nya
(cover + poster + 8 galeri) dikonfirmasi termuat nyata di browser,
nol gagal.

### Modal permintaan résumé

Tombol "Résumé" di footer nav dulunya cuma `<a href="#contact">`
tanpa perilaku khusus. Sekarang membuka modal: perekrut mengisi
email (wajib) dan perusahaan/posisi (opsional), lalu "Send request"
menyusun draft `mailto:` ke `mr.feriansyah@gmail.com` berisi kedua
data itu dan membuka aplikasi email PEREKRUT sendiri — bukan
mengirim apa pun otomatis dari server, karena situs ini tidak
punya backend.

**Jujur soal batasannya, ditulis langsung di modal**: "Opens your
email app with a message ready to send. Nothing is submitted
automatically." CV sendiri TIDAK ikut terlampir — `mailto:` tidak
bisa melampirkan berkas sama sekali. Alurnya: perekrut kirim
permintaan → pesan mendarat di inbox Ferry → Ferry membalas manual
dengan PDF terlampir. Ini yang diminta secara eksplisit ("mereka
harus request dulu"), bukan keterbatasan yang disembunyikan.

**Arsitektur menaut ke modal sticker upload (§6.3) yang sudah
ada** — bukan implementasi baru dari nol. `components/
ResumeModal.tsx` dan `motion/resume.js` mengikuti pola identik
(markup tanpa state React, backdrop + card + focus trap + Escape +
kembalikan fokus ke trigger persis sama), dan CSS-nya memakai ulang
keyframe `smPop`/`smFade` APA ADANYA, bukan duplikasi — supaya dua
modal di situs ini terasa sebagai satu sistem.

**Bug ditemukan sambil membangun ini, memengaruhi modal sticker
juga**: `.sm-card`/`.resume-card` memakai `top:50%; left:50%` tanpa
`transform` dasar di base rule, hanya di keyframe `smPop`. Karena
`animation-fill-mode` defaultnya `none`, begitu animasi pop-in
selesai transform-nya balik ke `none` — kotak melompat dari
"tampak di tengah" ke "sudut kiri-atas kotak persis di tengah
layar" (bukan tengah kotaknya). Diperbaiki di KEDUA modal dengan
menambah `transform: translate(-50%, -50%)` permanen di base rule,
walau cuma resume modal yang dilaporkan — bug yang sama persis di
modal kembar tidak masuk akal dibiarkan begitu baru saja
didiagnosis. Diverifikasi lewat pengukuran `getBoundingClientRect()`
sebelum dan sesudah durasi animasi (0,3 detik) di kedua modal: pusat
kotak sekarang persis sama dengan pusat viewport, bukan cuma
mendekati.

**Skema data**: `footer.nav` dapat field `action` (schema tetap
seragam di 5 item, `"resume"` hanya pada entri Résumé) — item itu
dirender sebagai `<button data-resume-cta>`, bukan `<a>`, di kedua
tempat render (`FooterCta.tsx` dan `scripts/chrome.py`). String UI
baru hidup di `ui.resume*` (mengikuti pola sticker-modal, bukan
namespace terpisah). Nol em dash di seluruh teks yang benar-benar
dilihat pengunjung, atas permintaan — komentar kode internal tidak
disentuh, mengikuti cakupan yang sama seperti permintaan dash
sebelumnya di sesi ini.

Diverifikasi end-to-end: submit dengan email kosong diblokir
(validasi native browser, modal tetap terbuka); submit dengan data
lengkap menghasilkan mailto ter-encode benar (dicek lewat replikasi
logika encoding secara terisolasi, bukan cuma dipercaya); modal
tertutup dan form ter-reset setelah submit; Escape dan tombol close
bekerja; bekerja identik di kedua bahasa dan di semua 24 halaman
preview (karena `footer()` dipakai bersama).

### Empat proyek ditandai "Coming Soon"

Diminta lewat 4 tangkapan layar kartu Work: "Web3 Quest Web
Design", "Web App Game Quest" (dua-duanya dulu `<a>` ke halaman
Framer eksternal), "Pluang Investment App", dan "Bukalapak Logistic
Admin Panel" (dua-duanya dulu `href` kosong, jatuh ke anchor
`#work`). Dibangun sebagai fitur data-driven lewat flag
`comingSoon: true/false` di `projects.items` (kedua bahasa, schema
tetap seragam di 16 item) — bukan menghardcode empat judul spesifik
di komponen, supaya menambah/melepas status ini nanti tinggal satu
baris JSON.

**Proyek "Nanovest App Redesign" (href kosong juga, tapi tidak
ditunjuk lewat screenshot) sengaja TIDAK ikut ditandai** — memperluas
ke proyek yang tidak eksplisit disebut adalah scope creep yang
tidak diminta.

**Kartu dirender sebagai `<div>`, bukan `<a>` dengan href yang
"dimatikan".** Alasannya bukan sekadar preferensi kode bersih:
cursor kustom situs ini (`motion/cursor.js`) punya HIT selector
generik `"[data-cursor], a, button, label"` yang berlaku sitewide
— elemen apa pun dengan tag `<a>` otomatis dapat state cursor
"expand" saat di-hover, terlepas dari ada tidaknya `href`. Satu-
satunya cara membuat cursor benar-benar netral (tidak menjanjikan
interaksi apa pun) tanpa mengubah logika cursor bersama adalah
membuat elemennya sungguh bukan `<a>`. Konsekuensinya otomatis
benar semua: nol `href` untuk dimatikan, nol tab-stop keyboard
untuk elemen yang tidak bisa diapa-apakan (`tabIndex: -1` bawaan
`<div>`), nol handler klik yang perlu di-`preventDefault()`.

**Badge "Coming Soon" / "Segera hadir"** muncul di tengah gambar
saat hover (`.p-soon-badge`, opacity 0→1), gambar ikut meredup
lewat `grayscale(60%)`, dan efek zoom-in-on-hover yang dipakai
kartu normal (mengisyaratkan "bisa dibuka") sengaja dimatikan.
Teks badge diambil dari `dict.projects.comingSoon` — diterjemahkan
sesuai bahasa aktif, bukan string Inggris yang di-hardcode.

Diverifikasi nyata di browser, bukan cuma baca markup: hover
sungguhan lewat `computer` tool memunculkan badge "COMING SOON"
tepat di tengah kartu; `card.click()` dikonfirmasi nol navigasi
(`location.href` tidak berubah). Dicek juga tidak ada teaser "next
case" di 11 halaman case study manapun yang menunjuk ke salah satu
dari empat proyek ini — kalau ada, itu akan jadi dead-end yang
mengarah ke kartu yang sengaja dibuat tak bisa diklik.

### Widget Google Translate dicabut

Dihapus tuntas dari semua halaman atas permintaan, simetris dengan
cara memasangnya — di kedua tempat render (komponen React DAN
generator preview statis):

- `components/GoogleTranslate.tsx` dihapus.
- `.nav-widget-slot` di `Nav.tsx` dihapus; prop `lang` yang cuma
  dipakai untuk widget itu ikut dilepas dari signature Nav (sudah
  tidak dipakai apa pun lagi di dalamnya).
- CSS `.gtranslate`, `.nav-widget-slot`, dan seluruh override
  `.goog-te-*` di `app/globals.css` dihapus.
- `google_translate_widget()` di `scripts/chrome.py` dan
  pemanggilannya di `nav()` dihapus; skrip loader +
  `googleTranslateElementInit` di `shell()` juga dihapus.
- Komentar basi di `motion/nav.js` yang masih menyebut komponen
  yang sudah tidak ada dibersihkan.

**Yang TIDAK diubah**: arsitektur `[lang]` (route, `content/id.json`,
sebelas case study bilingual) tetap seperti sebelumnya — keputusan
yang sama seperti saat widget ini dipasang, tidak ditinjau ulang.
Nav sekarang genuinely tanpa kontrol bahasa apa pun di UI; `/en`
dan `/id` cuma bisa dicapai lewat URL langsung.

Diverifikasi: nol jejak di seluruh source (`.tsx/.ts/.js/.py/.css/
.json`) dan di ke-24 berkas preview yang digenerate ulang. Nol
permintaan ke `translate.google.com` di network log. Layout nav
dicek visual di kedua state (top & scrolled) — tidak ada celah
kosong atau elemen yang bergeser di bekas posisi widget.

### Toggle EN/ID diganti widget Google Translate

Diklarifikasi dulu lewat pertanyaan sebelum membangun (dua bacaan
berbeda, konsekuensinya jauh berbeda): "Google Translate default"
bisa berarti popup native Chrome (murni setelan browser
pengunjung, TIDAK BISA dipaksa muncul lewat kode situs manapun)
atau widget yang bisa ditanam (dropdown pemilih bahasa). Jawaban:
widget, dan toggle EN/ID manual diganti sepenuhnya olehnya.

**Yang TIDAK dihapus, sebagai keputusan sadar**: seluruh arsitektur
`[lang]` (route, `lib/dict.ts`, `content/id.json`, sebelas case
study bilingual) dibiarkan utuh di disk. "Ganti toggle dengan
widget" dibaca sebagai mengganti ELEMEN UI-nya, bukan sebagai
perintah menghapus seluruh konten bahasa Indonesia yang sudah
ditulis manual sepanjang sesi ini — itu tindakan besar dan sulit
dibalik yang tidak diminta secara eksplisit. Situs `/en` dan `/id`
tetap ada dan tetap bisa diakses langsung; yang hilang hanya
tombol switch manual di nav.

**Satu keterbatasan Google yang ditemukan lewat percobaan, bukan
dokumentasi**: sempat dirancang dua instance `TranslateElement`
(karena nav situs ini menumpuk state "top" dan "scrolled" permanen
di DOM sekaligus, bukan gantian — dua target dikira perlu). Setelah
diimplementasikan, target kedua selalu kosong tanpa error apa pun.
Diuji ulang manual, terisolasi dari inisialisasi awal — tetap
gagal. Kesimpulan: Google TIDAK benar-benar mendukung dua instance
sekaligus di satu halaman, meski tidak ada larangan
terdokumentasi. Desain diubah: satu target saja
(`google_translate_nav`), ditaruh sebagai SIBLING KETIGA di grid
cell yang sama dengan kedua nav layer (`.nav-widget-slot`, di luar
`.nav-layer--top`/`--scrolled`), bukan di dalam salah satunya —
sehingga tidak ikut cross-fade dan tetap terlihat identik di kedua
state scroll. Diverifikasi: posisi widget (201×28px) persis sama
sebelum dan sesudah `.nav.scrolled` diaktifkan.

**Styling widget default Google ditata ulang total** — aslinya
bulky: dropdown besar + teks "Powered by Google" + banner
terjemahan full-width yang mendorong seluruh halaman turun begitu
bahasa dipilih (Google menyuntik `body { top: 40px }` inline).
Semua itu diredam lewat CSS (`.goog-te-banner-frame { display:
none }`, `body { top: 0 !important }`, ikon & teks bawaan
disembunyikan) supaya yang tersisa cuma dropdown mono kecil yang
menyatu dengan pill nav lain.

**Diverifikasi end-to-end secara nyata**, bukan cuma membaca
markup: dropdown memuat 249 opsi bahasa asli dari Google (termasuk
"id"), memilih Prancis benar-benar menerjemahkan judul tab jadi
"Travaux de ferry · Mochamad Feriansyah, concepteur de produits
senior", cookie `googtrans` tersimpan, dan banner besar Google
tetap tidak muncul.

**Konsekuensi yang sengaja tidak ditindaklanjuti**: widget ini
memuat skrip eksternal dari `translate.google.com` tanpa syarat
di setiap halaman — situs ini sudah punya cookie banner sendiri
(§6.10) untuk satu cookie analitik, dan widget Google ini
menambah cookie (`googtrans`) serta panggilan jaringan baru di
luar alur consent yang ada. Tidak digating di balik consent
karena tidak diminta, tapi ini titik yang wajar dipertimbangkan
kalau kepatuhan privasi (GDPR dsb.) jadi prioritas nanti.

### Semua gambar dikonversi ke WebP lossless

68 PNG di `public/work/` (36MB) dikonversi ke WebP tanpa kompromi
resolusi maupun kualitas visual, lalu menggantikan PNG-nya di
folder yang sama persis. Hasil akhir: 73 file WebP (73, bukan 68 —
lima proyek baru muncul dari proses lain selagi tugas ini berjalan,
lihat di bawah), 0 PNG tersisa, total turun ke 24MB.

**Alat**: Pillow (`PIL`) — `im.save(dst, format="WEBP",
lossless=True, method=6)`. `sips` bawaan macOS tidak mendukung
WebP, dan `cwebp`/ImageMagick/ffmpeg tidak terpasang di mesin ini;
Pillow ternyata sudah tersedia (`11.3.0`, berbeda dari pengecekan
`ModuleNotFoundError` di awal sesi ini — lingkungannya berubah).
`lossless=True` memastikan nol kompresi buang-piksel; `method=6`
memaksimalkan usaha kompresi tanpa mengorbankan satu piksel pun
(berbeda dari `quality`, yang diabaikan Pillow saat lossless aktif).

**Verifikasi piksel-demi-piksel, dengan satu koreksi penting.**
Percobaan pertama membandingkan `getdata()` mentah dan salah
menandai banyak file "gagal": ternyata WebP lossless membersihkan
channel RGB pada piksel yang alpha-nya 0 (transparan penuh) —
piksel itu tak pernah terlihat, jadi ini standar perilaku format,
bukan kehilangan kualitas. Diverifikasi lewat gambar sintetis
terisolasi: 88 dari 2.000 piksel "berbeda" pada uji awal, dan
seluruhnya persis berada di piksel beralpha 0 (0 perbedaan di
piksel yang terlihat). Fungsi pembanding diperbaiki: piksel
alpha=0 di kedua sisi dilewati, piksel lainnya harus identik utuh
(RGBA lengkap). Mode `P` (palet) juga otomatis dikonversi Pillow
ke RGB saat disimpan sebagai WebP (WebP tak punya mode palet) —
diverifikasi hasilnya identik visual setelah dikonversi ke ruang
warna yang sama, bukan tanda kehilangan data.

**Race condition dengan proses lain.** Di tengah konversi, skrip
gagal dengan `FileNotFoundError` pada berkas yang barusan terlihat
ada di `find`. Investigasi lewat `ps aux` menemukan proses Python
LAIN sedang berjalan bersamaan di direktori yang sama, menjalankan
tugas konversi WebP yang nyaris identik (kemungkinan sesi Claude
Code lain menangani permintaan yang sama). Pekerjaan dihentikan
sampai proses itu selesai (dipantau lewat `Bash` `run_in_background`
dengan polling `ps -p <pid>`, bukan `sleep` biasa yang diblokir di
foreground), baru dilanjutkan dengan audit ulang kondisi disk yang
segar — bukan asumsi dari state sebelum menunggu. Hasilnya: 7 file
sempat punya PNG dan WebP berdampingan (proses lain berhenti
sebelum menghapus PNG asli) — diverifikasi ulang lalu PNG-nya
dihapus; sisanya dikonversi dari nol.

**Referensi di `content/*.json`** ternyata sudah diperbarui duluan
oleh proses lain (0 sisa path `.png` sebelum skrip rewrite saya
sempat jalan) — dicek dan dikonfirmasi, bukan diasumsikan. Skrip
rewrite tetap dijalankan sebagai jaring pengaman idempotent: hanya
mengganti akhiran path lokal `/work/*.png` → `.webp`, URL eksternal
(framerusercontent, picsum) tidak disentuh.

**Dua bug generator ditemukan saat verifikasi menyeluruh**
(pre-existing, bukan disebabkan konversi ini):
`case_crypto_locked_staking.py` dan `case_nanovest_calendar.py`
menulis `src="{n['img']}"` mentah untuk gambar teaser "next case",
tanpa prefix `../public` yang dipakai 9 skrip case lain — di
konteks preview statis ini menghasilkan gambar gagal muat
(dibuktikan lewat pemuatan gambar nyata di browser, bukan cuma
membaca markup). Diperbaiki agar konsisten dengan skrip lain.

Diverifikasi end-to-end: seluruh 16 kartu strip dan seluruh gambar
di 22 halaman case study (11 case × 2 bahasa) dimuat nyata di
browser — nol gagal, semua path lokal berakhiran `.webp`. Nol
referensi menggantung ke berkas yang tidak ada di kedua bahasa.

`next.config.mjs` tidak perlu diubah — gambar lokal disajikan
lewat `<img>` biasa, bukan `next/image`, jadi `remotePatterns`
(untuk host eksternal saja) tidak terpengaruh.

`public/orbit.svg` sengaja TIDAK ikut dikonversi — itu vektor
dipakai lewat CSS `mask` (§ ornamen orbit), mengubahnya jadi WebP
raster adalah regresi, bukan optimasi.

### Menghapus proyek "Web3 Quest Dashboard" — pembersihan menyeluruh

"Web3 Quest Dashboard" (dashboard Stiqy "Apeiron Sprints
Challenge") punya case study internal lengkap dan menjadi salah
satu dari 12 node dalam satu siklus "next case" tertutup. Menghapus
proyek berarti membersihkan setiap lapisan yang bergantung
padanya, bukan cuma satu baris di `projects.items`:

1. **Entri strip** dihapus dari `projects.items` (kedua bahasa).
2. **Data case study** (`cases.stiqy-questing`) dihapus penuh dari
   `content/*.json`.
3. **Siklus "next case" disambung ulang** — `game-deployer` yang
   tadinya menutup siklus ke `stiqy-questing`, di-reroute langsung
   ke `nanovest-calendar` (node yang tadinya jadi tujuan
   `stiqy-questing`), sehingga siklus tetap tertutup dengan 11 node
   tanpa titik buntu.
4. **Berkas fisik**: `preview/stiqy-questing(.id).html`,
   `scripts/case_stiqy_questing.py`, `public/work/stiqy/`
   (home.png, motion.mp4 — dicek dulu tidak dipakai case lain),
   `public/work/covers/questing-dashboard.png`.
5. **Komponen React**: `components/cases/StiqyQuesting.tsx`
   dihapus, import dan entri registry di
   `components/cases/index.ts` dibersihkan.
6. **Sembilan komentar topologi siklus** di berbagai `case_*.py`
   dan `components/cases/*.tsx` — semuanya menyebut
   "stiqy-questing" sebagai titik tutup siklus, sekarang jadi
   dangling reference. Ditulis ulang ke satu deskripsi siklus
   11-node yang akurat dan konsisten di semua file.
7. **Empat referensi silang lain** ("lihat catatan di
   StiqyQuesting", perbandingan gaya visual) yang menunjuk ke
   catatan penjelasan yang ikut terhapus — di-inline-kan langsung
   di tempatnya, bukan dibiarkan menunjuk ke berkas yang sudah
   tidak ada.

**Dua bug lain ketemu saat verifikasi**, keduanya sudah ada
sebelum penghapusan ini dan tidak berkaitan langsung:

- `nanovest-investment-app.next` sudah lebih dulu di-reroute (oleh
  proses lain) ke "Nanovest App Redesign" — proyek yang case
  study-nya BELUM pernah dibangun (data JSON ada, tapi komponen
  React dan generator Python-nya tidak ada). Kalau dibiarkan,
  siklus akan berakhir di link 404. Diarahkan kembali ke `amazon`.
- **Proyek "Nanovest App Redesign" muncul dua kali** di strip —
  satu salinan dengan `href` internal yang menunjuk ke case study
  yang belum dibangun (404), satu lagi versi kosong. Di-dedupe jadi
  satu entri dengan `href`/`case` kosong (pola yang sama dengan
  proyek lain yang belum punya halaman detail), tanpa membangun
  case study baru yang tidak diminta.

Data draf `cases.nanovest-app-redesign` sengaja TIDAK dihapus —
itu konten yang sudah disiapkan untuk case study yang belum
selesai dibangun, bukan sisa dari penghapusan ini.

Diverifikasi end-to-end: siklus 11 node ditelusuri lewat fetch
berantai dari awal sampai tertutup kembali, seluruhnya `200`,
setiap label "next" cocok judul halaman yang benar-benar dituju.
Strip utama dicek nol duplikat dan nol path internal mentah yang
lolos tanpa rewrite (yang berarti 404).

### Proyek baru: Nanovest App Redesign

`Source/Work/Nanovest Redesign Covee.png` (1080×911, komposit dua
layar: home feed personalisasi "Good morning, Ferry" dengan search
bar AI + layar Net Worth/Asset Allocation) — konsep redesign yang
visualnya jelas berbeda dari "Nanovest Investment App" yang sudah
ada (bubble ungu terang vs gradient gelap personalisasi), jadi
ditambahkan sebagai proyek terpisah, bukan mengganti cover yang
ada.

Disisipkan tepat setelah "Nanovest Investment App" — mengelompokkan
dua proyek "seluruh aplikasi" Nanovest bersebelahan, terpisah dari
tiga proyek fitur spesifik (Event Calendar, Limit Order, IPO) yang
sudah berkelompok di posisi awal strip. Belum ada case study
sendiri, jadi `href`/`case` kosong seperti proyek lain yang belum
dibangun halaman detailnya.

### Kartu Work tidak bisa diklik kiri — hanya lewat klik kanan

Gejala: hover dan klik kiri pada kartu proyek tidak membuka apa
pun; klik kanan → "Open link in new tab" tetap bekerja.

Penyebabnya `strip.setPointerCapture?.(e.pointerId)` di
`motion/strip.js` dipanggil TANPA SYARAT di `pointerdown` — bahkan
untuk klik polos yang nol gerakan. Pointer capture pada elemen
strip mengalihkan target event `click` menjauh dari `<a>` di
dalamnya ke elemen strip itu sendiri pada sebagian browser,
sehingga navigasi default `<a>` tidak pernah terpicu. Klik kanan
tetap berfungsi karena context menu tidak lewat jalur pointer-
capture ini sama sekali — itulah petunjuk awal yang mengarahkan ke
akar masalah, bukan ke soal `href` atau `z-index`.

Perbaikan: `setPointerCapture` dipindah dari `onDown` ke dalam
`onMove`, HANYA pada cabang yang sudah mengonfirmasi drag nyata
(`Math.abs(dx) > 4`). Klik polos tidak pernah menyentuh pointer
capture sama sekali.

**Verifikasi ini yang paling berbelit di seluruh sesi.** Server
sudah benar (dibuktikan lewat `curl` langsung, bypass browser
total), tapi pane browser terus menjalankan modul `strip.js` versi
LAMA — bertahan lewat reload biasa, `Cmd+Shift+R` hard reload,
bahkan tab yang benar-benar baru. Ternyata itu cache ES module
(`import` map) yang jauh lebih sticky daripada cache HTTP biasa;
`fetch({cache:'no-store'})` ke URL yang sama membuktikan isi file
sudah benar, tapi `<script type="module">` yang sudah telanjur
jalan di halaman tidak ikut re-import. Dibuktikan lewat
`import(url + '?bust=' + Date.now())` dinamis untuk memaksa modul
segar, lalu diuji pada elemen DOM tiruan yang terisolasi total dari
listener lama supaya nol kontaminasi: klik polos nol pemanggilan
`setPointerCapture`, drag sungguhan tepat satu pemanggilan setelah
gerakan terkonfirmasi.

### Cover "Amazon App Checkout Redesign" diganti

`Source/Work/Amazon Cover.png` (1080×911, sama dua layar dengan
yang sudah tampil di strip: Order Confirmation + Delivery Options)
menggantikan cover Framer eksternal lama. `img` diarahkan ke
`/work/covers/amazon-checkout-redesign.png`, `ar` dihitung ulang
presisi dari dimensi asli (1,1855, dari sebelumnya 1,1871 turunan
Framer).

`href` sengaja TIDAK disentuh — proyek ini belum punya case study
internal, dan yang diminta cuma ganti gambar. Tetap menaut ke
halaman Framer eksternal, tetap `target="_blank"`. Dicek dulu
tidak ada pointer silang lain (`next.img` di case study manapun)
yang menunjuk ke URL Framer lama sebelum dianggap selesai —
bersih, cuma satu referensi (href proyeknya sendiri).

### Cover "Nanovest Investment App" diganti ke komposit final

Perbaikan giliran sebelumnya (portrait `home.png` tunggal) adalah
tambal sementara karena belum ada aset komposit yang benar. Kini
disediakan `Source/Work/Nanovest Home Cover.png` — dua ponsel
berdampingan (onboarding "Start Investing" + home returning-
investor), 1080×911, sesuai konvensi cover lain di strip.

Yang menarik: `content/*.json` ternyata **sudah disiapkan lebih
dulu** untuk file ini — `cover.alt` sudah persis mendeskripsikan
komposit baru ("the Start Investing screen for a new user next to
the Portfolio Balance home...") sebelum filenya sendiri ada.
Cukup menyalin berkas ke `public/work/covers/
nanovest-investment-app.png`, tanpa mengubah JSON project/cover
sama sekali.

Satu pointer silang yang tertinggal dan diperbaiki:
`cases.nanovest-limit-order.next.img` masih menunjuk ke
`home.png` potret lama — kalau tidak disamakan, teaser "next case"
di halaman tetangga akan menampilkan gambar berbeda dari yang
dilihat pengunjung begitu benar-benar sampai di halamannya.

**False alarm yang sempat diperiksa dan dibatalkan sendiri:** judul
tab halaman ini sempat terbaca "Nanovest Limit Order" (bukan
"Nanovest US Stocks Limit Order" yang diingat dari giliran lalu) —
dicurigai sebagai gap sinkronisasi. Setelah di-dump ulang dari
disk, ternyata proyek ini memang sudah bernama "Nanovest Limit
Order" saja; bukan bug, cuma ingatan giliran sebelumnya yang keliru.
Diverifikasi dulu terhadap file di disk sebelum "memperbaiki"
sesuatu yang sebenarnya sudah benar.

### Proyek baru: Nanovest US Stocks IPO — dan tiga bug tersembunyi

Diminta menambahkan dua gambar baru (`US Stocks IPO.png`,
`US Stocks Limit Order.png`). Sebelum menambah, keduanya dicek
isinya:

- **`US Stocks Limit Order.png`** ternyata BUKAN proyek baru — itu
  fitur yang sudah diwakili "Nanovest US Stocks Limit Order", dan
  ternyata giliran sebelumnya (di luar riwayat percakapan yang
  terlihat) sudah membangun case study lengkap untuknya
  (`nanovest-limit-order`, 5 layar galeri). Tidak ditambahkan
  sebagai entri duplikat.
- **`US Stocks IPO.png`** genuinely baru — ditambahkan sebagai
  **"Nanovest US Stocks IPO"**, disisipkan tepat setelah "Nanovest
  US Stocks Limit Order" supaya tiga fitur stock Nanovest
  (Event Calendar, Limit Order, IPO) berkelompok di strip. Hanya
  cover strip, belum ada case study sendiri (href kosong,
  `case: ""`) — sesuai pola proyek lain yang belum dibangun
  halaman detailnya.

Mengaudit area ini membuka tiga bug nyata di infrastruktur yang
sudah ada, semuanya diperbaiki:

**1. Cover "Nanovest Investment App" salah tempel.** Checksum
MD5-nya IDENTIK dengan gambar Limit Order — bukan investment app
sama sekali. `cover.alt` di JSON bahkan ikut mendeskripsikan
gambar yang salah ("Apple stock detail next to a limit buy
summary"). Diganti dengan `home.png` dari galeri case study-nya
sendiri (satu-satunya aset yang genuinely benar), `ar` disesuaikan
dari 1,1855 (landscape, salah) ke 0,4618 (potret, sesuai dimensi
asli 375×812).

**2. Empat halaman case study tidak saling menaut dengan benar.**
Dua (`stiqy-questing`, `nanovest-calendar`) masih menunjuk
`next.href` ke URL Framer eksternal yang sudah digantikan case
internal. Dua lainnya (`nanovest-limit-order`,
`nanovest-investment-app`) malah meng-hardcode tujuan lewat
konstanta Python `NEXT_CASE` yang SELALU ke `nanovest-calendar`,
mengabaikan `next.href` di JSON sama sekali — jadi teks label yang
ditampilkan bisa bilang satu proyek sementara link-nya membawa ke
proyek lain. Disambungkan jadi satu siklus bersih:

```
stiqy-questing → nanovest-calendar → nanovest-limit-order
  → nanovest-investment-app → (kembali ke) stiqy-questing
```

Diverifikasi end-to-end lewat fetch berantai: keempat halaman
`200`, setiap label "next" yang ditampilkan cocok persis dengan
judul halaman yang benar-benar dituju.

**3. Helper `case_href()` yang saya tulis untuk memperbaiki #2
sendiri punya bug pada percobaan pertama** — parameter `home`
(dimaksudkan untuk prefiks anchor `#work`) ikut ditempel di depan
nama berkas case sibling, menghasilkan `"index.htmlnanovest-
calendar.html"` (dua nama file nempel, 404). Ketahuan karena
diverifikasi lewat fetch asli, bukan cuma dipercaya dari kode.
Diperbaiki: jalur path internal (`/work/{slug}`) sama sekali tidak
memakai `home`, karena semua halaman case adalah sibling flat file
di `/preview/`, bukan anak dari index.

**Fungsi `case_page()` dipindah dari lokal di `build_preview.py`
ke `chrome.py`** (bersama `case_href()` yang baru) — satu sumber
kebenaran dipakai lima skrip generator sekaligus, sesuai prinsip
yang sudah dituliskan di kepala `chrome.py` sendiri.

**Catatan proses:** perbaikan cover investment-app sempat gagal
tersimpan di percobaan pertama tanpa error yang terlihat — baru
ketahuan saat verifikasi lewat `cat` mentah terhadap file di disk,
bukan mempercayai output `print` skrip sendiri yang menjalankan
write itu. Diulang dengan assertion yang berteriak kalau title
tidak match, dan kali ini persistensinya dikonfirmasi lewat
pembacaan disk yang terpisah dari proses penulisnya.

### Rename gelombang kedua

Sepuluh proyek direname sekaligus. Satu di antaranya membentuk
rantai: "Questing Dashboard" → "Web3 Quest Dashboard", padahal
nama "Web3 Quest Dashboard" sedang dipakai proyek LAIN yang juga
sedang direname (→ "Web App Game Quest"). Dipetakan lewat snapshot
index sebelum mutasi apa pun, bukan pencarian judul berurutan —
kalau tidak, rename kedua akan salah menimpa item yang baru saja
diubah oleh rename pertama.

| Index | Judul lama | Judul baru |
|---|---|---|
| 0 | Questing Dashboard | **Web3 Quest Dashboard** |
| 1 | US Stock Event Calendar | **Nanovest US Stocks Event Calendar** |
| 2 | Stocks Limit Order | **Nanovest Stocks Limit Order** |
| 4 | Locked Staking | **Nanovest Crypto Locked Staking** |
| 6 | Game Quest Design | **Mobile Game Quest Design** |
| 8 | Checkout Redesign | **Amazon App Checkout Redesign** |
| 9 | Web3 Quest Dashboard | **Web App Game Quest** |
| 10 | Portfolio Homescreen | **Nanovest Investment App** |
| 11 | Investing Homepage | **Pluang Investment App** |
| 12 | Admin Panel | **Bukalapak Logistic Admin Panel** |

**Konsekuensi yang diikuti, bukan cuma judul kartu strip**: index 0
menaut ke case study internal `stiqy-questing`. Judul di dalam
halaman itu sendiri (`cases.stiqy-questing.title` dan
`.meta.title`) masih bilang "Questing Dashboard" — kalau tidak
diselaraskan, pengunjung yang klik kartu "Web3 Quest Dashboard"
akan mendarat di halaman yang menyapa dengan nama lain. Sudah
diselaraskan di kedua bahasa.

Dengan ini, "Stocks Limit Order" dan "US Stock Event Calendar" —
yang di putaran sebelumnya saya tandai sebagai duplikat konseptual
— tetap dipertahankan keduanya, sekarang dengan prefiks "Nanovest"
yang membedakan konteksnya. Itu keputusan yang sudah dibuat lewat
rename ini, bukan lagi terbuka.

**Catatan generator.** Halaman case study (`stiqy-questing.html`,
`nanovest-calendar.html`) di-generate skrip terpisah
(`scripts/case_stiqy_questing.py`, `scripts/case_nanovest_calendar.py`),
bukan oleh `build_preview.py`. Ketiganya harus dijalankan bersamaan
setiap kali `content/*.json` berubah, atau halaman detail akan
tertinggal dari kartu striknya.

### Selaraskan judul case study kedua

Pola yang sama dengan `stiqy-questing` ternyata berulang di
`nanovest-calendar`: kartu strip sudah "Nanovest US Stocks Event
Calendar" (rename gelombang kedua), tapi `cases.nanovest-calendar
.title` dan `.meta.title` masih "US Stock Event Calendar" — selisih
dua kata sekaligus (kurang "Nanovest", "Stock" belum jamak).
Disamakan di kedua bahasa.

Satu jebakan tambahan di sini: pola `meta.title` di seluruh case
study adalah `{Produk} · {Klien} · Ferry Works`. Begitu nama
produknya sendiri diawali "Nanovest", menempelkan segmen klien
"Nanovest" di tengah menghasilkan redundansi —
`"Nanovest US Stocks Event Calendar · Nanovest · Ferry Works"`.
Segmen klien untuk case ini dihapus:
`"Nanovest US Stocks Event Calendar · Ferry Works"`. Case
`stiqy-questing` tidak kena masalah yang sama karena nama
produknya ("Web3 Quest Dashboard") tidak memuat kata "Stiqy".

Prosa deskriptif di dalam case (`cover.alt`, `cover.caption`,
`facts[].v`) sengaja TIDAK disentuh — itu menyebut "Event
Calendar" sebagai nama fitur dan "US Stocks" sebagai kategori,
keduanya tetap akurat tanpa perlu memuat kata "Nanovest" di
setiap kemunculan.

Verifikasi end-to-end: kartu di strip → `href` →
`nanovest-calendar.html` → judul tab, `<h1>`, dan seluruh isi
`<body>` sudah memuat nama baru dan nol jejak nama lama.

### Cover Work — putaran gambar asli

Tujuh cover diganti dengan tangkapan layar asli dari
`Source/Work/`, disalin ke `public/work/covers/` dengan nama
slug. Pemetaannya dipastikan lewat inspeksi visual tiap gambar,
bukan cuma nama berkas — dua nama file sempat ambigu
("Web3 Questing Dashboard.png" vs "Stiqy Questing Website.png"
vs "Web3 Stiqy Main Web.png") dan hanya bisa dibedakan dengan
membuka isinya.

| Proyek | Rename | Sumber |
|---|---|---|
| Questing Dashboard | — | `Web3 Questing Dashboard.png` — dashboard analitik campaign |
| US Stock Event Calendar | — | `US Stocks Event Calendar.png` |
| Web3 Landing Page | → **Web3 Quest Web Design** | `Web3 Stiqy Main Web.png` — landing page marketing Stiqy |
| HRIS Dashboard | — | `HRIS Dashbard.png` |
| MOBA Game UI | → **Game Quest Design** | `Rampage - Quest.png` — overlay HUD kuis in-game |
| Deployer Engine | → **Web3 Game Deployer Engine** | `Web3 Game Deployer Engine.png` — konsol Argus Labs |
| Questing Platform | → **Web3 Quest Dashboard** | `Stiqy Questing Website.png` — halaman quest end-user |

Semua tetap PNG asli (196KB–1,3MB), tidak dikonversi ke WebP —
tidak ada `cwebp` di mesin ini dan ukurannya sudah wajar untuk
portfolio. `--ar` dihitung presisi per gambar dari dimensi
sebenarnya (1080×911 untuk enam, 1084×915 untuk Deployer Engine),
bukan dipatok ke nilai lama 1,1871 milik cover Framer.

**Dua bug ketemu dan diperbaiki sambil jalan**, keduanya di
sistem case-study yang sudah dibangun sebelumnya
(`components/cases/`, route `/work/[lang]/[slug]`):

- `href` "Questing Dashboard" menaut ke halaman Framer eksternal
  padahal case study internalnya (`stiqy-questing`) sudah ada
  lengkap — diarahkan ke `/work/stiqy-questing`.
- `href` "US Stock Event Calendar" kosong padahal case study
  `nanovest-calendar` sudah ada lengkap — diisi
  `/work/nanovest-calendar`.

Lima item lain (`Web3 Quest Web Design`, `HRIS Dashboard`,
`Game Quest Design`, `Web3 Game Deployer Engine`,
`Web3 Quest Dashboard`) belum punya case study sendiri, jadi
href-nya dipertahankan seperti sebelumnya (kosong atau tetap ke
halaman Framer lama) — kartunya jatuh ke anchor `#work` kalau
kosong.

**Perlu keputusanmu:** "Stocks Limit Order" (index 2) sekarang
duplikat konseptual dengan "US Stock Event Calendar" — sama-sama
produk stock trading Nanovest, dan yang baru sudah punya case
study penuh (`nanovest-calendar`) sementara yang lama masih
placeholder Framer. Saya tidak menghapusnya karena tidak ada di
daftar permintaanmu, tapi kemungkinan ini perlu dihapus supaya
strip Work tidak menampilkan produk yang sama dua kali dengan nama
berbeda.

### Tautan kartu Work

Tujuh dari 13 kartu menuju halaman studi kasus aslinya di
portfolio Framer (`projects.items[].href`). Enam sisanya masih
"Coming soon" di sana, jadi href-nya kosong dan kartunya jatuh ke
anchor `#work`.

### Gambar proyek

Strip Work memakai gambar asli dari portfolio Framer
(`framerusercontent.com`), bukan placeholder. URL-nya tersimpan
di `projects.items[].img` pada `content/*.json`.

Semua ekspor Framer itu berukuran 660×556, jadi `--ar` seragam
1,1871. Konsekuensinya variasi lebar editorial §6.7 hilang: strip
sekarang seragam. Memaksakan `--ar` bervariasi akan meng-crop
screenshot UI (dashboard dipotong jadi portrait tidak terbaca),
jadi rasio asli yang dipakai. Kalau variasi lebar itu diinginkan,
aset harus diekspor ulang dalam beberapa rasio.

Gambarnya masih di-hotlink. Untuk lepas dari Framer, unduh ke
`public/work/` dan ganti nilai `img` jadi path lokal; host
`framerusercontent.com` di `next.config.mjs` bisa dihapus setelah
itu.

### Indikator scroll di mobile

Di `(pointer: coarse)` `.drag-badge` disembunyikan, jadi strip
kehilangan seluruh afordans: yang terlihat hanya satu kartu besar.
Penggantinya progress bar + counter di bawah strip.

Dipilih bar, bukan dots atau arrow: lebar item di sini mengikuti
`--ar`, jadi dots yang mengasumsikan halaman seukuran sama akan
menyesatkan, dan arrow di layar sentuh redundan dengan swipe.
Thumb punya `min-width: 22px` karena pada 13 item lebar
proporsionalnya hanya ~5%; karena itu travel-nya dihitung dari
lebar nyata thumb, bukan dari rasio, supaya tidak melewati ujung
track.

Petunjuk "Swipe" padam permanen setelah geseran nyata pertama.

### Animasi ambient emoji

`emojiFloat`: naik-turun 10px + tambahan miring 4° di puncak,
6 detik, `ease-in-out`, infinite. Dua kendala teknis yang
menentukan bentuknya:

**Keyframes menyertakan transform dasar, bukan menggantinya.**
`.hsticker-inner` sudah memegang `translate(-50%,-50%)
rotate(var(--r))` untuk memusatkan dan memiringkan sticker sesuai
data di `content/*.json`. Tiap keyframe menulis ulang pasangan
itu plus `translateY`, supaya posisi dan kemiringan aslinya tidak
hilang saat animasi jalan. `translateY` ditulis SEBELUM `rotate`
di urutan fungsi transform, supaya naik-turunnya tegak lurus,
tidak menyerong mengikuti kemiringan.

**Animasinya tidak bisa ditaruh di `.hsticker`.** Elemen itu
sudah ditulisi `transform` tiap frame oleh `motion/hero.js` untuk
parallax scroll — animasi CSS di sana akan langsung tertimpa.
`.hsticker-inner` di dalamnya aman karena hero.js tidak menyentuhnya.

**Delay per sticker negatif, bukan nol.** Tanpa itu keenam emoji
naik-turun serempak dan terbaca sebagai koreografi, bukan sesuatu
yang hidup. Delay negatif membuat animasi dimulai seolah sudah
berjalan sejauh itu, jadi tiap sticker start dari titik siklus
yang berbeda. Durasinya juga dibedakan (5.5–7.6s) supaya siklusnya
tidak pernah sinkron kembali.

Mati di `prefers-reduced-motion: reduce`, sama seperti marquee.

### Sticker hero

Isinya emoji (`kind: "emoji"` pada `hero.stickers`). Nol aset, nol
request, dan variasinya datang gratis. Bingkai putihnya sengaja
dilepas untuk jenis ini: emoji telanjang terbaca sebagai sticker
tempel, emoji di dalam bingkai polaroid terbaca sebagai emoji di
dalam kotak.

Ukuran hurufnya diturunkan dari `--w` yang sama dengan jenis
sticker lain, jadi satu token `--sticker-unit` tetap mengatur
semuanya dan bobot optisnya sebanding.

### Ukuran sticker hero

Ditahan kecil dengan sengaja (`--w` 6,5–12, satuan `1vw`, `1.5vw`
di ≤480px). Sticker besar menutupi wordmark, dan wordmark adalah
elemen utama halaman ini (§6.2).

Ragam bentuk selain foto dan bulat (blob, sticker teks, mark
garis) sudah tersedia di CSS dan bisa dipakai lewat field `kind`
pada `hero.stickers` di `content/*.json` — tanpa menulis CSS atau
JSX baru.

### Aksen: ukur sebelum mengganti

`--accent` dipakai dua arah sekaligus — sebagai **latar** di bawah
teks putih (pill hover, CTA, `::selection`) dan sebagai **teks** di
atas `--bg` (caret, nomor urut, link). Keduanya menuntut warna yang
gelap, jadi aksen terang otomatis gagal.

| | putih di atasnya | ia di atas `--bg` |
|---|---|---|
| cobalt `#1b3bdb` | 7,79:1 | 7,02:1 |
| orange `#ff7002` (referensi) | 2,77:1 | 2,50:1 |

Kalau menggantinya, ukur dua rasio itu dulu. Nilainya hidup di satu
tempat: token `--accent`. Box-shadow CTA menurunkan dirinya dari
token itu lewat `color-mix`, jadi tidak ada nilai aksen kedua yang
bisa menyimpang.

### Custom cursor: kenapa bentuknya begitu

Versi pertama terasa berat di Chrome karena tiga hal, semuanya
sudah diperbaiki:

1. **`backdrop-filter: blur(2px)`** pada elemen yang bergerak tiap
   frame. Compositor harus menyampel ulang backdrop terus-menerus.
   Dihapus; diganti background yang sedikit lebih pekat.
2. **Transisi `width`/`height`** untuk perubahan state → layout
   tiap frame, pada elemen yang juga sedang bergerak. Sekarang
   kotaknya tetap 76px dan state dijalankan lewat `scale()` yang
   dikomposisikan ke transform yang sama dengan posisi: satu tulis
   style per frame, nol layout. Ini juga menaati aturan §8 sendiri
   (animasi hanya di transform/opacity/clip-path).
3. **Hit-test di setiap `pointermove`** — dua `closest()` plus tiga
   `classList.toggle` per event. Sekarang hit-test pindah ke
   `pointerover`, yang hanya menyala saat pointer melintasi batas
   elemen. `pointermove` tidak menyentuh DOM sama sekali.

Ditambah satu perbaikan yang tidak kelihatan sampai dicoba di
mesin lain: smoothing-nya sekarang berbasis waktu (`tau`), bukan
faktor per frame. Faktor `0.18` per frame membuat cursor bergerak
dua kali lebih cepat di layar 120Hz dibanding 60Hz.

Loop-nya juga tidur sendiri saat cursor sudah menetap, dan
dibangunkan lagi oleh `pointermove`.

### Kepemilikan `body.loaded`

`motion/preloader.js` adalah satu-satunya pemilik kelas itu, dan
kelas itu yang memicu seluruh entrance hero. Kalau preloader
dilepas, pemicunya harus dipindahkan — jangan sampai tidak ada
yang menyetel `loaded`, karena hero akan diam di `translateY(112%)`.

Preloader punya dua jalur keluar: rAF counter, dan timer
`HARD_STOP` 3,5 detik. Jalur timer itu bukan hiasan — tanpa itu,
aset yang menggantung atau rAF yang disuspend akan mengurung
pengunjung di balik overlay yang menutup layar.

### Label peran nav: dua baris, bukan digabung dengan tanda pisah

Diminta: label peran di nav ("Senior Product Designer") ditambah
"Visual Designer". Menyambung dua judul dengan tanda pisah ("-")
tidak dipilih — bertentangan dengan instruksi sebelumnya untuk
tidak memakai dash, dan situs ini sudah punya pola yang lebih
sesuai: `hero.roles` menumpuk dua judul peran sebagai baris
terpisah, bukan satu baris tergabung. `nav.coords` diubah dari
string tunggal menjadi array dua item, dirender persis dengan pola
yang sama.

Perubahan menyentuh lima tempat: `content/en.json` dan
`content/id.json` (`nav.coords` jadi `["Senior Product Designer",
"Visual Designer"]` — judul jabatan tetap Inggris di kedua bahasa,
konsisten dengan keputusan sebelumnya), `components/Nav.tsx` (dua
titik render — grup coords nav utama dan footer menu mobile — sama-
sama di-`.map()` ke dalam pembungkus `.nav-coords-lines`), dan
`scripts/chrome.py` (helper `coords_lines()` baru dipakai di kedua
titik pemanggilan `nav()`, supaya halaman case study yang berbagi
`nav()`/`shell()` ikut konsisten tanpa duplikasi markup).

**Jebakan spesifisitas selector yang ikut ketemu saat mengerjakan
ini**: aturan warna lama, `.nav-coords span:last-child`, adalah
selector descendant — `:last-child` di situ dievaluasi relatif
terhadap parent langsung elemen itu sendiri, bukan relatif terhadap
`.nav-coords`. Begitu baris kedua ditambahkan di dalam
`.nav-coords-lines`, baris kedua ITU SENDIRI menjadi anak-terakhir
dari parent-nya (`.nav-coords-lines`), sehingga ikut cocok dengan
selector lama dan salah dapat warna muted, padahal yang dimaksud
"terakhir" harusnya cuma `<span>{est}</span>`. Diperbaiki dengan
mengganti descendant combinator ke child combinator langsung:
`.nav-coords > span:last-child`, yang cuma cocok dengan anak
langsung `.nav-coords` — dua baris peran (dibungkus dalam satu
`<span class="nav-coords-lines">`, yang MERUPAKAN satu anak
langsung) tidak pernah tersentuh, dan `est` tetap satu-satunya yang
kena warna muted.

Diverifikasi lewat komputasi style nyata di browser: kedua baris
peran nav desktop (`rgb(27, 59, 219)`, warna accent) beda dari baris
"7+ Years · UI/UX · Web3" (`rgb(107, 107, 103)`, abu-abu muted) —
selector child-combinator bekerja benar. Footer menu mobile
memakai satu warna flat untuk semua isinya (`rgba(244, 243, 239,
.55)`) sejak sebelum perubahan ini — bukan regresi, `.mobile-menu-
foot` memang tidak pernah punya aturan pembeda seperti nav desktop.
Kedua baris "Senior Product Designer" / "Visual Designer" dan
"7+ Years · UI/UX · Web3" dikonfirmasi tampil benar lewat screenshot
nyata di nav desktop dan di footer menu mobile (layout `space-
between` tidak pecah), di versi EN maupun ID, dan di halaman case
study (`amazon.html`) yang berbagi `nav()` yang sama dari
`chrome.py` — seluruh preview statis (index + 15 case study, kedua
bahasa) di-regenerate ulang sebagai bagian dari perubahan ini.

### Link Dribbble di footer

Diminta: tambahkan link Dribbble. Ternyata tidak perlu kode baru
sama sekali — `footer.social` di `content/*.json` sudah punya entri
"Dribbble" sejak awal, cuma `href`-nya string kosong, dan baik
`FooterCta.tsx` maupun `chrome.py`'s `footer()` sudah difilter untuk
tidak merender item `social` yang `href`-nya kosong (`FooterCta.tsx`
bahkan sudah punya komentar yang menyebut Dribbble secara eksplisit
sebagai contoh kasus ini). Cukup mengisi `href` jadi
`https://dribbble.com/ferferferry` di `content/en.json` dan
`content/id.json`, tombolnya otomatis muncul.

Diverifikasi lewat DOM nyata di browser: `.footer-links a` sekarang
tiga item (LinkedIn, Dribbble, WhatsApp), Dribbble punya
`href="https://dribbble.com/ferferferry"`, `target="_blank"`, dan
`rel="noopener noreferrer"` yang sama seperti dua link lain. Dan
lewat screenshot nyata di section "Elsewhere" footer, setelah
section itu di-reveal (di environment browser pane ini,
`IntersectionObserver` disuspend saat pane hidden — jadi footer
harus di-scroll dulu di tab yang di-foreground supaya class `.in`
sungguhan menyala, bukan cuma dicek dari markup statis).

### Favicon

Situs ini sebelumnya tidak punya favicon sama sekali — tidak ada
`app/icon.*`, tidak ada apa pun di `public/`, dan `<head>` Next.js
maupun `chrome.py` tidak pernah menyebut `<link rel="icon">`.

Konsep pertama (monogram huruf "f" putih di kotak cobalt) sempat
dicoba dengan JetBrains Mono, tapi glyph "f" font itu ternyata
punya ekor melengkung yang di ukuran kecil terbaca persis seperti
logo Facebook — dibatalkan karena berisiko disalahartikan sebagai
brand lain, bukan soal selera. Diganti ke Switzer (font UI situs
sendiri) yang bentuknya lurus dan aman, tapi akhirnya diganti lagi
total: pengguna mengarahkan untuk memakai aset desain yang sudah
ada, `Source/Work/Menu/Mission/Crosshair.svg` — empat siku
membentuk mark silang/crosshair, awalnya diwarnai kuning
(`#F5D64E`). Warna itu diganti ke `--accent` cobalt (`#1b3bdb`) di
atas `--bg` paper (`#f4f3ef`), bukan dipertahankan kuning aslinya —
mengikuti aturan yang sudah tertulis eksplisit di `globals.css`:
"Warna — duotone + satu aksen. Jangan tambah warna kelima." Mark-
nya sendiri (geometri path) tidak diubah sama sekali, cuma isi
warnanya.

Tiga berkas diturunkan dari satu SVG sumber (`public/favicon.svg`,
64×64 viewBox, rx 12 supaya senada dengan kartu bersudut tumpul di
seluruh situs):
- `public/favicon.svg` — dipakai langsung oleh browser modern,
  tajam di ukuran berapa pun karena vektor.
- `public/favicon.ico` — fallback multi-resolusi (16/32/48px) untuk
  browser lama, di-generate dari render 1024×1024 (bukan dari
  64×64 di-upscale) supaya tepi tetap tajam saat di-downsample.
- `public/apple-touch-icon.png` — 180×180, dari varian TANPA rx
  (full-bleed persegi), karena iOS memasang mask sudutnya sendiri;
  ganda-rounding kalau sumbernya sudah dibulatkan duluan.

Rasterisasi dikerjakan lewat `sips` (bawaan macOS) pada SVG yang
`width`/`height`-nya sementara dinaikkan ke 1024 (viewBox 64 tetap,
jadi murni scaling vektor, bukan upscale raster) — tidak ada
`rsvg-convert`/`cairosvg`/Node di environment ini, jadi jalur ini
dipilih karena tidak butuh dependency tambahan apa pun.

Dipasang di dua tempat: `app/layout.tsx` lewat field `metadata.icons`
(bukan `<link>` manual atau konvensi `app/icon.*`, supaya satu
sumber file di `public/` dipakai apa adanya tanpa duplikasi aset),
yang otomatis berlaku ke SEMUA route karena layout turunan
(`(site)/[lang]/layout.tsx`, halaman case study) tidak pernah
override field `icons`-nya. Untuk preview statis, tiga `<link>`
ditambahkan ke `shell()` di `chrome.py`, path relatif
`../public/...` mengikuti pola yang sama dengan aset lain di situs
ini.

Diverifikasi lewat fetch nyata di browser terhadap ketiga
`<link rel*="icon">` (index EN, index ID, dan halaman case study
`amazon.id.html` yang berbagi `shell()` yang sama) — semuanya
`200` dengan `content-type` yang benar (`image/svg+xml`,
`image/x-icon`, `image/png`). Sisi Next.js (`app/layout.tsx`) tidak
bisa diverifikasi lewat dev server sungguhan karena `node`/`npm`
tidak terpasang di environment ini — situs ini memang sengaja
punya preview statis Python supaya tetap bisa diverifikasi tanpa
dependency itu, jadi shape `metadata.icons` diperiksa manual
terhadap tipe `Metadata` Next.js, bukan lewat render nyata.

### Open Graph image (thumbnail saat link di-share)

Diminta setelah pengguna share link situs ke Slack dan yang muncul
cuma ikon placeholder abu-abu — situs ini belum pernah punya
`og:image` sama sekali, jadi *unfurl* di Slack/Discord/Twitter tidak
ada gambar untuk ditampilkan.

Kartu 1200×630 dirancang mengikuti sistem visual yang sudah ada:
mark crosshair (sama seperti favicon) + wordmark "FERRY WORKS" di
kiri atas, nama besar dalam Switzer bold, dua baris peran dalam
JetBrains Mono warna aksen (pola `nav-coords-lines` yang sama, bukan
digabung dash), garis meta "7+ Years · UI/UX · Web3 · Fintech ·
Enterprise" di bawah, dan dua emoji ambient (🎨 ✨) dari set sticker
hero yang sama — supaya kartu share terasa seperti potongan dari
situsnya sendiri, bukan aset terpisah.

Cara render-nya beda dari favicon: font Switzer/JetBrains Mono cuma
di-load penuh lewat webfont asli (Fontshare + Google Fonts) di
browser sungguhan, bukan lewat rasterisasi SVG statis (`sips` tidak
bisa fetch web font eksternal). Jadi dipakai jalur lain: sebuah
halaman harness sementara menggambar seluruh kartu ke elemen
`<canvas>` 1200×630 lewat Canvas 2D API — teks dengan `fillText`
setelah menunggu `document.fonts.ready`, mark crosshair digambar
langsung dari `d` attribute path SVG aslinya lewat `Path2D`, bukan
elemen `<img>` terpisah. Hasilnya diambil lewat `canvas.toDataURL()`
di browser, base64-nya diekstrak dan di-decode jadi
`public/og-image.png`, lalu di-flatten dari RGBA ke RGB opaque
(hindari isu transparansi di sebagian crawler unfurl).

Dipasang sekali di `app/layout.tsx`: field `openGraph`/`twitter`
sengaja TIDAK menyebut `title`/`description` sendiri — Next.js
otomatis mengambil dari `title`/`description` yang sudah di-resolve
tiap route (root, `[lang]`, case study), jadi `og:title` tetap benar
per halaman sementara `og:image` satu gambar sitewide yang
diwariskan ke semua turunan tanpa perlu diulang di halaman case
study manapun. `metadataBase` ditambahkan (`https://www.ferryworks.
space`, domain `www` karena apex 308-redirect ke situ) supaya path
relatif `/og-image.png` di-resolve jadi URL absolut — wajib untuk
`og:image`, kebanyakan crawler menolak path relatif. Tag yang sama
ditambahkan manual ke `shell()` di `chrome.py` untuk preview statis.

Diverifikasi lewat DOM nyata: `og:title`/`og:description` di
halaman case study (`amazon.html`) terbukti beda dari halaman index
(mengikuti judul case study-nya sendiri) sementara `og:image` tetap
sama di keduanya — membuktikan pola inheritance-nya bekerja seperti
yang dirancang, bukan cuma dites di satu halaman. Fetch langsung ke
`og-image.png` mengembalikan `200`/`image/png`.

### Navbar atas: "Case Studies" dan "Design Systems" dihapus dari drawer

Diminta: dua item itu dihapus dari drawer "more links" di navbar
atas (pill grup ketiga, sebelah kanan). `nav.drawer` di
`content/*.json` sebelumnya berisi 4 item (Case studies, Design
systems, Résumé, Contact) — dipangkas jadi 2 (Résumé, Contact) di
kedua bahasa. Baik `Nav.tsx` maupun `chrome.py` sudah nge-loop
generic atas array itu (dan menu mobile pakai array yang sama lewat
spread `[...primary, ...drawer]`), jadi tidak ada perubahan kode
sama sekali, murni penyesuaian data. Diverifikasi lewat DOM nyata
(drawer desktop dan menu mobile dua-duanya tinggal 2 item) dan
screenshot visual drawer dalam keadaan terbuka.

## Penyimpangan sadar dari spec

| Spec | Di sini | Alasan |
|---|---|---|
| Aeonik | Switzer + JetBrains Mono | §0: Aeonik lisensi komersial |
| Aksen orange `#ff7002` | cobalt `#1b3bdb` | orange gagal kontras di kedua arah pemakaian (2,77 dan 2,50) |
| Cursor `backdrop-filter` | dihapus | biang lag di Chrome; lihat catatan di bawah |
| Bahasa ES/EU | EN (default) + ID | situs berbahasa Inggris; toggle §6.1 tetap berfungsi |
| Sanity CMS | `content/*.json` | konten satu orang, belum perlu CMS |
| Sticker upload ke server | localStorage | menghilangkan risiko konten publik anonim (§6.3) |
| Sticker PNG transparan | foto picsum + border putih | aset placeholder; ganti sesuai §11 |

## Tambahan di luar situs referensi (celah §9)

Skip-to-content · `:focus-visible` kuat · `aria-label` pada semua
tombol ikon · strip `tabindex="0"` + `role="region"` · accordion
pakai `role="tab"`/`tabpanel` + navigasi panah + pause on hover/focus
+ auto-advance mati permanen setelah klik manual · modal punya focus
trap, Escape, dan fokus kembali ke trigger · `ResizeObserver` pada
strip · `prefers-contrast: more` untuk service title idle.

## Status verifikasi

Diuji di `preview/` pada viewport 1280×800.

Terbukti jalan:

- Font, CSS, dan 11 modul motion ter-load; nol error konsol
- Hero: marquee bergerak, 6 sticker, z-order back/front benar,
  `100svh` = 800px, wordmark 198,4px (= 15,5vw)
- Nav: `scrolled` + `hidden` aktif sesuai arah scroll
- Reveal: `.in` + `opacity: 1`, word mask `transform: none`
- Services: pause on hover, klik manual → `locked`, tidak advance lagi
- Strip: drag 1:1 ke `scrollLeft`, link mati saat drag, pointer
  touch diabaikan, tinggi seragam dengan lebar 307–666px, item
  pertama tepat di gutter 80px
- Sticker upload: PNG dengan magic bytes salah ditolak, PNG asli
  diterima → resize ke WebP, ar terjaga, `.placing` dibersihkan,
  localStorage terisi
- Preloader: keluar dan membuka scroll **bahkan saat rAF disuspend**
  (jalur timer), `body.loaded` tersetel
- Typewriter: ghost memesan tinggi final (350px) sebelum satu
  karakter pun diketik → nol CLS; klon mempertahankan 3 anchor
- Showreel: overscan tepat 1,16× tinggi wrapper, wrapper mulai
  `scale(.9)`
- Cookie banner: muncul di kunjungan pertama, deny dan accept
  sama lebar (195px) dan tidak terpotong, pilihan tersimpan,
  banner tidak muncul lagi di kunjungan berikutnya
- Marquee tetap seamless dengan wordmark yang lebih pendek: dua
  set persis sama (3.159px), separuh track > lebar viewport
- Nav tiga grup tanpa tumpang tindih dengan label baru yang
  lebih panjang (`7+ YEARS · PRODUCT DESIGN`)
- Pesan error upload dirender dari dictionary, bukan dari string
  di dalam modul — diuji pada jalur magic-bytes dan oversize
- Versi ID: `html lang="id"`, seluruh nav/hero/footer/modal/cookie
  ikut berganti, toggle dalam state `data-alt`
- Word reveal §6.5: spasi antar kata ter-render (jarak seragam
  11px, semua positif), asterisk penanda tidak ikut tampil, dan
  aksen berhenti di huruf — tanda baca tetap warna ink
- Cursor: 250 event `pointermove` menghasilkan nol tulis DOM;
  `backdrop-filter: none`, kotak tetap 76px, transisi hanya
  `background`

Belum diverifikasi — browser pane di environment ini `hidden`
sehingga rAF, IntersectionObserver, dan animasi CSS disuspend:
auto-advance services 6 detik, gerak parallax sticker dan reel,
pengetikan typewriter berjalan, transisi keluar preloader secara
visual, custom cursor, dan tampilan breakpoint mobile. Semuanya
perlu dibuka sekali di browser biasa.
