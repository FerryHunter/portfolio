/**
 * §5.2 — Custom cursor.
 *
 * Tiga aturan yang menjaga ini tetap mulus di Chrome:
 *
 * 1. Satu tulis style per frame, dan hanya dari rAF. `pointermove`
 *    tidak menyentuh DOM sama sekali — ia cuma menyimpan koordinat.
 * 2. Perubahan state (dot → expand → view) lewat scale() yang
 *    dikomposisikan ke transform yang sama, bukan width/height.
 *    Nol layout, nol transition yang bertabrakan dengan loop.
 * 3. Hit-test dilakukan di `pointerover`, yang hanya menyala saat
 *    pointer melintasi batas elemen — bukan di setiap piksel.
 *
 * Smoothing-nya berbasis waktu (tau), bukan faktor per frame, jadi
 * kecepatannya sama di layar 60Hz, 120Hz, maupun 144Hz. Faktor per
 * frame membuat cursor bergerak dua kali lebih cepat di layar 120Hz.
 */
const BOX = 76;                    // ukuran kotak tetap di CSS
const SCALES = { idle: 10 / BOX, expand: 48 / BOX, view: 1 };
const TAU_POS = 55;                // ms — makin kecil makin responsif
const TAU_SCALE = 90;
const HIT = "[data-cursor], a, button, label";

export function initCursor(root = document) {
  const el = root.querySelector("[data-cursor-el]");
  if (!el) return () => {};

  if (
    !window.matchMedia("(hover: hover) and (pointer: fine)").matches ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return () => {};
  }

  const label = el.querySelector("[data-cursor-label]");
  const labelDefault = el.dataset.labelDefault || "View";

  let tx = window.innerWidth / 2;
  let ty = window.innerHeight / 2;
  let cx = tx;
  let cy = ty;

  let targetScale = SCALES.idle;
  let scale = SCALES.idle;

  let mode = "idle";
  let dark = false;
  let raf = 0;
  let last = 0;
  let running = false;

  const write = () => {
    el.style.transform =
      `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0) ` +
      `translate(-50%, -50%) scale(${scale.toFixed(4)})`;
  };

  const tick = (now) => {
    const dt = last ? Math.min(64, now - last) : 16;
    last = now;

    // Smoothing eksponensial berbasis waktu → bebas refresh rate.
    const ap = 1 - Math.exp(-dt / TAU_POS);
    const as = 1 - Math.exp(-dt / TAU_SCALE);
    cx += (tx - cx) * ap;
    cy += (ty - cy) * ap;
    scale += (targetScale - scale) * as;

    write();

    // Tidur saat sudah menetap; dibangunkan lagi oleh pointermove.
    if (
      Math.abs(tx - cx) < 0.1 &&
      Math.abs(ty - cy) < 0.1 &&
      Math.abs(targetScale - scale) < 0.0015
    ) {
      cx = tx;
      cy = ty;
      scale = targetScale;
      write();
      running = false;
      last = 0;
      return;
    }
    raf = requestAnimationFrame(tick);
  };

  const wake = () => {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(tick);
  };

  // Hanya menyimpan koordinat. Tidak ada DOM read/write di sini.
  const onMove = (e) => {
    tx = e.clientX;
    ty = e.clientY;
    wake();
  };

  // Menyala hanya saat melintasi batas elemen, bukan tiap piksel.
  const onOver = (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;

    const hit = t.closest(HIT);
    const next = hit ? (hit.dataset.cursor === "view" ? "view" : "expand") : "idle";
    if (next !== mode) {
      mode = next;
      targetScale = SCALES[mode];
      el.classList.toggle("expand", mode === "expand");
      el.classList.toggle("view", mode === "view");
      if (label) {
        label.textContent =
          mode === "view" ? hit.dataset.cursorLabel || labelDefault : "";
      }
      wake();
    }

    const nextDark = Boolean(t.closest("[data-dark]"));
    if (nextDark !== dark) {
      dark = nextDark;
      el.classList.toggle("on-dark", dark);
    }
  };

  write();
  window.addEventListener("pointermove", onMove, { passive: true });
  document.addEventListener("pointerover", onOver, { passive: true });

  return () => {
    window.removeEventListener("pointermove", onMove);
    document.removeEventListener("pointerover", onOver);
    cancelAnimationFrame(raf);
  };
}
