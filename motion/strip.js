/**
 * §6.7 — Projects drag strip.
 * Native overflow-x tetap jadi sumber kebenaran; drag hanya
 * menulis scrollLeft di atasnya. Momentum mobile, keyboard
 * scroll, dan scroll snap native semuanya tetap jalan.
 *
 * Di layar sentuh .drag-badge disembunyikan, jadi indikator
 * progress + counter di bawah strip yang mengambil alih tugas
 * memberi afordans "masih ada lanjutannya".
 */
export function initStrip(root = document) {
  const stage = root.querySelector("[data-strip-stage]");
  const strip = root.querySelector("[data-strip]");
  if (!strip) return () => {};

  const items = Array.from(strip.querySelectorAll(".p-item"));

  /* ---------- drag dengan mouse ---------- */
  let down = false;
  let moved = false;
  let startX = 0;
  let startScroll = 0;

  // Pointer id disimpan, TAPI capture-nya BELUM diambil di sini.
  // setPointerCapture pada pointerdown — walau langsung dilepas
  // lagi di pointerup — cukup untuk mengalihkan target event
  // `click` dari <a> ke elemen strip pada sebagian browser, jadi
  // klik biasa (nol gerakan) kehilangan navigasi defaultnya sama
  // sekali. Klik kanan tetap "Open link" karena context menu
  // tidak lewat jalur pointer-capture ini — itu petunjuk awal bug
  // ini bukan soal href atau z-index, tapi soal capture yang
  // diambil terlalu dini.
  let pointerId = null;

  const onDown = (e) => {
    if (e.pointerType === "touch") return; // biarkan native touch scroll
    down = true;
    moved = false;
    startX = e.clientX;
    startScroll = strip.scrollLeft;
    pointerId = e.pointerId;
  };

  const onMove = (e) => {
    if (!down) return;
    const dx = e.clientX - startX;
    if (!moved && Math.abs(dx) > 4) {
      moved = true;
      strip.classList.add("dragging"); // menonaktifkan pointer-events link
      // Capture diambil HANYA setelah gerakan nyata terkonfirmasi,
      // supaya klik polos tidak pernah menyentuh pointer capture
      // sama sekali.
      strip.setPointerCapture?.(pointerId);
    }
    if (moved) strip.scrollLeft = startScroll - dx;
  };

  const onUp = (e) => {
    if (!down) return;
    down = false;
    if (moved) strip.releasePointerCapture?.(pointerId);
    // Lepas di frame berikutnya supaya click tidak lolos jadi navigasi.
    requestAnimationFrame(() => strip.classList.remove("dragging"));
  };

  strip.addEventListener("pointerdown", onDown);
  strip.addEventListener("pointermove", onMove);
  strip.addEventListener("pointerup", onUp);
  strip.addEventListener("pointercancel", onUp);

  /* ---------- indikator: progress + counter ---------- */
  const hint = root.querySelector("[data-strip-hint]");
  const thumb = root.querySelector("[data-strip-thumb]");
  const count = root.querySelector("[data-strip-count]");

  // Offset tiap item dihitung sekali: nilainya berada di ruang
  // koordinat konten yang tidak ikut bergeser saat scroll.
  let offsets = [];
  let ratio = 1;
  const pad = () => parseFloat(getComputedStyle(strip).paddingLeft) || 0;

  const measure = () => {
    const p = pad();
    offsets = items.map((el) => el.offsetLeft - p);
    ratio = strip.clientWidth / (strip.scrollWidth || 1);
    if (thumb) thumb.style.width = `${Math.min(100, ratio * 100).toFixed(2)}%`;
  };

  const pad2 = (n) => String(n).padStart(2, "0");

  const paint = () => {
    const max = strip.scrollWidth - strip.clientWidth;
    const pos = max > 0 ? Math.min(1, Math.max(0, strip.scrollLeft / max)) : 0;

    if (thumb && ratio < 1) {
      // Diukur dari lebar nyata thumb, bukan dari rasio: CSS
      // memasang min-width, jadi lebar proporsional saja akan
      // membuat thumb melewati ujung track.
      const trackW = thumb.parentElement.clientWidth;
      const thumbW = thumb.offsetWidth;
      const travelPx = Math.max(0, trackW - thumbW);
      thumb.style.transform = `translateX(${(pos * travelPx).toFixed(1)}px)`;
    }

    if (count && offsets.length) {
      let best = 0;
      let bestDist = Infinity;
      offsets.forEach((o, i) => {
        const d = Math.abs(strip.scrollLeft - o);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      });
      const next = `${pad2(best + 1)} / ${pad2(offsets.length)}`;
      if (count.textContent !== next) count.textContent = next;
    }

    // Petunjuk swipe berhenti setelah geseran nyata pertama.
    if (hint && strip.scrollLeft > 8) hint.classList.add("moved");
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      paint();
      ticking = false;
    });
  };
  strip.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- drag badge mengikuti cursor (desktop) ---------- */
  const badge = stage?.querySelector("[data-drag-badge]");
  let bx = 0, by = 0, tx = 0, ty = 0, raf = 0;
  const follow = (e) => {
    const r = stage.getBoundingClientRect();
    tx = e.clientX - r.left;
    ty = e.clientY - r.top;
  };
  const tick = () => {
    bx += (tx - bx) * 0.18;
    by += (ty - by) * 0.18;
    badge.style.transform = `translate3d(${bx}px, ${by}px, 0) translate(-50%, -50%)`;
    raf = requestAnimationFrame(tick);
  };
  if (badge && stage && window.matchMedia("(hover: hover)").matches) {
    stage.addEventListener("pointermove", follow);
    raf = requestAnimationFrame(tick);
  }

  /* ---------- resize (§8) ---------- */
  let ro;
  if ("ResizeObserver" in window) {
    ro = new ResizeObserver(() => {
      const max = strip.scrollWidth - strip.clientWidth;
      if (strip.scrollLeft > max) strip.scrollLeft = Math.max(0, max);
      measure();
      paint();
    });
    ro.observe(strip);
  }

  measure();
  paint();

  return () => {
    strip.removeEventListener("pointerdown", onDown);
    strip.removeEventListener("pointermove", onMove);
    strip.removeEventListener("pointerup", onUp);
    strip.removeEventListener("pointercancel", onUp);
    strip.removeEventListener("scroll", onScroll);
    stage?.removeEventListener("pointermove", follow);
    cancelAnimationFrame(raf);
    ro?.disconnect();
  };
}
