/**
 * Lightbox untuk figure proses (IA, flow, benchmark).
 *
 * Diagram sebesar itu tidak terbaca di lebar kolom, jadi figure yang
 * bertanda [data-zoom] membuka <dialog data-lightbox> (markup-nya
 * dirender server dengan label yang sudah dilokalisasi — lihat
 * components/cases/ProcessSections.tsx dan scripts/process_sections.py).
 *
 * - <dialog>.showModal(): latar jadi inert, Esc menutup, fokus
 *   terkurung di dialog (Tab dibungkus manual untuk jaga-jaga).
 * - Zoom: tombol +/−/1:1, roda mouse / pinch trackpad, pinch dua jari,
 *   dobel-ketuk. Geser (pan) dengan drag saat sudah diperbesar.
 * - Beberapa gambar: ← / → dan tombol sebelumnya/berikutnya.
 * - prefers-reduced-motion: tanpa transisi.
 *
 * Event didelegasikan di `root`; dialog dicari saat klik, jadi tidak
 * peduli urutan render/hidrasi.
 */
const MAX_FROM_FIT = 6;
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const viewers = new WeakMap();

function createViewer(dlg) {
  const $ = (sel) => dlg.querySelector(sel);
  const stage = $("[data-lb-stage]");
  const img = $(".lb-img");
  const count = $("[data-lb-count]");
  const cap = $("[data-lb-cap]");
  const btnPrev = $("[data-lb-prev]");
  const btnNext = $("[data-lb-next]");
  const btnIn = $("[data-lb-in]");
  const btnOut = $("[data-lb-out]");
  const btnFit = $("[data-lb-fit]");
  const btnClose = $("[data-lb-close]");

  let items = [];
  let index = 0;
  let opener = null;
  let s = 1; // skala relatif terhadap "fit"
  let x = 0;
  let y = 0;
  let nat = { w: 0, h: 0 };
  let disp = { w: 0, h: 0 }; // ukuran gambar pada s = 1
  let fit = 1; // piksel layar per piksel asli pada s = 1
  const pointers = new Map();
  let gesture = null;
  let moved = 0;

  const maxScale = () => Math.max(MAX_FROM_FIT, 1 / fit);
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  function bounds() {
    const sw = stage.clientWidth;
    const sh = stage.clientHeight;
    return {
      mx: Math.max(0, (disp.w * s - sw) / 2),
      my: Math.max(0, (disp.h * s - sh) / 2),
    };
  }

  function apply(animate = false) {
    const { mx, my } = bounds();
    x = clamp(x, -mx, mx);
    y = clamp(y, -my, my);
    img.style.transition = animate && !reduced() ? "transform .25s cubic-bezier(.16,1,.3,1)" : "none";
    img.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
    stage.classList.toggle("is-zoomed", s > 1.001);
    btnOut.disabled = s <= 1.001;
    btnIn.disabled = s >= maxScale() - 0.001;
  }

  function layout() {
    const sw = stage.clientWidth;
    const sh = stage.clientHeight;
    if (!nat.w || !nat.h || !sw || !sh) return; // dialog belum tampil
    fit = Math.min(sw / nat.w, sh / nat.h, 1);
    disp = { w: nat.w * fit, h: nat.h * fit };
    img.style.width = `${disp.w}px`;
    img.style.height = `${disp.h}px`;
    apply();
  }

  // Zoom mengelilingi titik (px, py) relatif terhadap pusat stage.
  function zoomAt(next, px = 0, py = 0, animate = false) {
    const ns = clamp(next, 1, maxScale());
    const k = ns / s;
    x = px - (px - x) * k;
    y = py - (py - y) * k;
    s = ns;
    if (s <= 1.001) {
      x = 0;
      y = 0;
    }
    apply(animate);
  }

  function pointIn(e) {
    const r = stage.getBoundingClientRect();
    return { px: e.clientX - (r.left + r.width / 2), py: e.clientY - (r.top + r.height / 2) };
  }

  function show(i) {
    index = (i + items.length) % items.length;
    const it = items[index];
    s = 1;
    x = 0;
    y = 0;
    nat = { w: 0, h: 0 };
    img.style.transform = "none";
    img.alt = it.alt;
    img.src = it.src;
    cap.textContent = it.cap;
    cap.hidden = !it.cap;
    const multi = items.length > 1;
    count.hidden = !multi;
    btnPrev.hidden = !multi;
    btnNext.hidden = !multi;
    count.textContent = `${index + 1} / ${items.length}`;
    if (img.complete && img.naturalWidth) onLoad();
  }

  function onLoad() {
    nat = { w: img.naturalWidth, h: img.naturalHeight };
    layout();
  }

  function open(btn) {
    const buttons = Array.from(document.querySelectorAll("[data-zoom]"));
    items = buttons.map((b) => {
      const im = b.querySelector("img");
      const fig = b.closest("figure");
      return {
        src: im.currentSrc || im.src,
        alt: im.alt || "",
        cap: fig?.querySelector("figcaption")?.textContent?.trim() || "",
      };
    });
    opener = btn;
    show(buttons.indexOf(btn));
    document.documentElement.classList.add("lb-open");
    dlg.showModal();
    btnClose.focus();
    layout();
  }

  function onClose() {
    document.documentElement.classList.remove("lb-open");
    img.removeAttribute("src");
    pointers.clear();
    gesture = null;
    opener?.focus?.();
    opener = null;
  }

  // ---- pointer: drag untuk pan, dua jari untuk pinch ----
  function dist() {
    const [a, b] = [...pointers.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  stage.addEventListener("pointerdown", (e) => {
    stage.setPointerCapture?.(e.pointerId);
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moved = 0;
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      const r = stage.getBoundingClientRect();
      gesture = {
        kind: "pinch",
        d0: dist(),
        s0: s,
        cx: (a.x + b.x) / 2 - (r.left + r.width / 2),
        cy: (a.y + b.y) / 2 - (r.top + r.height / 2),
      };
    } else if (pointers.size === 1) {
      gesture = { kind: "pan", lx: e.clientX, ly: e.clientY };
    }
  });

  stage.addEventListener("pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (gesture?.kind === "pinch" && pointers.size === 2) {
      moved = 99;
      zoomAt(gesture.s0 * (dist() / gesture.d0), gesture.cx, gesture.cy);
    } else if (gesture?.kind === "pan" && pointers.size === 1) {
      const dx = e.clientX - gesture.lx;
      const dy = e.clientY - gesture.ly;
      moved += Math.abs(dx) + Math.abs(dy);
      gesture.lx = e.clientX;
      gesture.ly = e.clientY;
      if (s > 1.001) {
        x += dx;
        y += dy;
        apply();
      }
    }
  });

  function endPointer(e) {
    pointers.delete(e.pointerId);
    if (pointers.size === 1) {
      const [p] = [...pointers.values()];
      gesture = { kind: "pan", lx: p.x, ly: p.y };
    } else if (pointers.size === 0) {
      // Ketuk di area kosong (bukan gambar) menutup, tapi bukan setelah drag.
      if (e.type === "pointerup" && moved < 4 && e.target === stage && s <= 1.001) dlg.close();
      gesture = null;
    }
  }
  stage.addEventListener("pointerup", endPointer);
  stage.addEventListener("pointercancel", endPointer);

  stage.addEventListener("dblclick", (e) => {
    const { px, py } = pointIn(e);
    zoomAt(s > 1.001 ? 1 : Math.min(maxScale(), Math.max(2, 1 / fit)), px, py, true);
  });

  stage.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      const { px, py } = pointIn(e);
      zoomAt(s * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), px, py);
    },
    { passive: false }
  );

  // ---- tombol & keyboard ----
  btnIn.addEventListener("click", () => zoomAt(s * 1.6, 0, 0, true));
  btnOut.addEventListener("click", () => zoomAt(s / 1.6, 0, 0, true));
  btnFit.addEventListener("click", () => zoomAt(s > 1.001 ? 1 : Math.min(maxScale(), 1 / fit), 0, 0, true));
  btnClose.addEventListener("click", () => dlg.close());
  btnPrev.addEventListener("click", () => show(index - 1));
  btnNext.addEventListener("click", () => show(index + 1));

  dlg.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft" && items.length > 1) {
      e.preventDefault();
      show(index - 1);
    } else if (e.key === "ArrowRight" && items.length > 1) {
      e.preventDefault();
      show(index + 1);
    } else if (e.key === "+" || e.key === "=") {
      zoomAt(s * 1.6, 0, 0, true);
    } else if (e.key === "-" || e.key === "_") {
      zoomAt(s / 1.6, 0, 0, true);
    } else if (e.key === "0") {
      zoomAt(1, 0, 0, true);
    } else if (e.key === "Tab") {
      const f = [...dlg.querySelectorAll("button")].filter((b) => !b.hidden && !b.disabled);
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  img.addEventListener("load", onLoad);
  dlg.addEventListener("close", onClose);
  window.addEventListener("resize", () => dlg.open && layout());

  return { open };
}

export function initLightbox(root = document) {
  const onClick = (e) => {
    const btn = e.target.closest?.("[data-zoom]");
    if (!btn) return;
    const dlg = document.querySelector("dialog[data-lightbox]");
    if (!dlg || typeof dlg.showModal !== "function") return;
    e.preventDefault();
    let viewer = viewers.get(dlg);
    if (!viewer) {
      viewer = createViewer(dlg);
      viewers.set(dlg, viewer);
    }
    viewer.open(btn);
  };
  root.addEventListener("click", onClick);
  return () => root.removeEventListener("click", onClick);
}
