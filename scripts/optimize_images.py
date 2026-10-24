#!/usr/bin/env python3
"""
Optimasi gambar di public/: WebP lossless besar → lossy berkualitas tinggi.

Konversi lama ke WebP lossless (lihat README) menghasilkan 44 MB gambar,
sampai 2,5 MB per berkas — berat di HP dan menahan LCP halaman case.
Skrip ini hanya menyentuh WebP LOSSLESS (chunk VP8L), jadi aman dijalankan
berulang: berkas yang sudah lossy dilewati.

  python3 scripts/optimize_images.py            # terapkan
  python3 scripts/optimize_images.py --dry-run  # hanya laporan

Aturan:
  - hanya berkas > MIN_KB
  - lebar dibatasi MAX_W (tampilan terlebar ±1120 CSS px → 2x = 2240)
  - quality Q, alpha_quality 100 (tepi mockup ber-alpha tetap bersih)
  - hasil dipakai hanya bila ≥ 25% lebih kecil dan PSNR ≥ MIN_PSNR (34 dB);
    kalau PSNR kurang, dicoba sekali lagi di kualitas lebih tinggi
Sumber asli ada di git history dan Source/ (lokal).
"""
import math
import pathlib
import struct
import sys

from PIL import Image, ImageChops, ImageStat

ROOT = pathlib.Path(__file__).resolve().parent.parent
MIN_KB = 120
MAX_W = 2400
Q, Q_HI = 84, 92
MIN_PSNR = 34.0  # seni game bertekstur halus mentok ±36 dB di q84 dan tetap identik secara visual
DRY = "--dry-run" in sys.argv


def is_lossless_webp(path):
    data = path.read_bytes()
    if data[:4] != b"RIFF" or data[8:12] != b"WEBP":
        return False
    pos = 12
    while pos + 8 <= len(data):
        tag = data[pos:pos + 4]
        size = struct.unpack("<I", data[pos + 4:pos + 8])[0]
        if tag == b"VP8L":
            return True
        pos += 8 + size + (size & 1)
    return False


def flatten(im):
    """RGB untuk perbandingan; alpha dikomposit di atas abu-abu tengah."""
    if im.mode == "RGBA":
        bg = Image.new("RGB", im.size, (128, 128, 128))
        bg.paste(im, mask=im.getchannel("A"))
        return bg
    return im.convert("RGB")


def psnr(a, b):
    diff = ImageChops.difference(flatten(a), flatten(b))
    mse = sum(ImageStat.Stat(diff.point(lambda v: v * v)).mean) / 3
    return 99.0 if mse == 0 else 10 * math.log10(255 * 255 / mse)


def encode(im, path, q):
    im.save(path, "WEBP", quality=q, method=6, alpha_quality=100)


tot_before = tot_after = 0
rows = []
for path in sorted((ROOT / "public").rglob("*.webp")):
    kb = path.stat().st_size / 1024
    if kb < MIN_KB or not is_lossless_webp(path):
        continue
    src = Image.open(path)
    src.load()
    im = src
    if im.width > MAX_W:
        im = im.resize((MAX_W, round(im.height * MAX_W / im.width)), Image.LANCZOS)
    tmp = path.with_suffix(".tmp.webp")
    chosen = None
    for q in (Q, Q_HI):
        encode(im, tmp, q)
        new = Image.open(tmp)
        new.load()
        p = psnr(im, new)
        size = tmp.stat().st_size
        if p >= MIN_PSNR:
            chosen = (q, p, size)
            break
    rel = path.relative_to(ROOT)
    if chosen and chosen[2] <= path.stat().st_size * 0.75:
        q, p, size = chosen
        rows.append((kb, size / 1024, q, p, src.size, im.size, str(rel)))
        tot_before += path.stat().st_size
        tot_after += size
        if not DRY:
            tmp.replace(path)
        else:
            tmp.unlink()
    else:
        rows.append((kb, None, None, None, src.size, im.size, str(rel) + "  (dilewati)"))
        if tmp.exists():
            tmp.unlink()

print(f"{'sebelum':>9} {'sesudah':>9}  q  PSNR   dimensi            berkas")
for kb, new_kb, q, p, s0, s1, rel in rows:
    if new_kb is None:
        print(f"{kb:8.0f}K {'-':>9}   -    -   {s0[0]}x{s0[1]:<10}     {rel}")
    else:
        dim = f"{s0[0]}x{s0[1]}" + (f"→{s1[0]}x{s1[1]}" if s0 != s1 else "")
        print(f"{kb:8.0f}K {new_kb:8.0f}K  {q}  {p:5.1f}  {dim:<18} {rel}")
saved = tot_before - tot_after
print(f"\n{len([r for r in rows if r[1] is not None])} berkas dikecilkan: "
      f"{tot_before/1048576:.1f} MB → {tot_after/1048576:.1f} MB "
      f"(hemat {saved/1048576:.1f} MB, {100*saved/max(tot_before,1):.0f}%)"
      + ("  [dry-run, tidak ditulis]" if DRY else ""))
