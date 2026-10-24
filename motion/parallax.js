/**
 * §6.2c — Parallax mouse: balon + semua stiker (hero dan Sectors).
 *
 * Posisi kursor di dalam sebuah "scene" (hero, section Sectors)
 * dinormalisasi ke -1..1 dari tengah, lalu tiap elemen bergeser
 * BERLAWANAN arah kursor sebesar amplitudo × kedalaman, dan miring
 * sedikit ke arah kursor. Kedalaman menentukan siapa yang terasa
 * lebih dekat: balon (di belakang wordmark) 1, stiker lapisan
 * belakang 0.8, stiker lapisan depan 1.5, dan tiap stiker diberi
 * variasi kecil (×0.8/1.0/1.2) supaya gerak mereka tidak seragam.
 *
 * Hasilnya ditulis lewat custom property --mx/--my/--mr, dibaca CSS
 * (.hero-balloon dan .hsticker-inner). Sengaja bukan `transform`
 * langsung: hero.js sudah menulis transform pada .hsticker untuk
 * parallax scroll, dan satu elemen tidak bisa memegang dua tujuan.
 *
 * Posisi dihaluskan dengan lerp berbasis waktu (sama di 60Hz dan
 * 120Hz) dan rAF tidur begitu posisi menetap. Daftar elemen dibaca
 * ulang tiap kursor masuk, jadi stiker yang baru ditempel pengunjung
 * (motion/stickers.js) ikut bergerak. Hanya untuk pointer halus
 * dengan hover dan bukan prefers-reduced-motion; layar sentuh dan
 * reduced-motion mendapat tampilan statis.
 */
const AMP_X = 44; // px per satuan kedalaman
const AMP_Y = 30; // px per satuan kedalaman
const SMOOTH = 0.09; // fraksi jarak per frame @60Hz

const BALLOON = { depth: 1, rot: 5 }; // rot = derajat maksimum
const LAYER_DEPTH = { back: 0.8, front: 1.5 };
const STICKER_ROT = 2; // derajat per satuan kedalaman
const VARIATION = [0.8, 1.0, 1.2];

const clamp = (v) => Math.max(-1, Math.min(1, v));

function createScene(root, collect) {
  let items = collect();
  let tx = 0;
  let ty = 0;
  let x = 0;
  let y = 0;
  let raf = 0;
  let last = 0;

  const write = () => {
    for (const { el, depth, rot } of items) {
      el.style.setProperty("--mx", `${(-x * AMP_X * depth).toFixed(2)}px`);
      el.style.setProperty("--my", `${(-y * AMP_Y * depth).toFixed(2)}px`);
      el.style.setProperty("--mr", `${(x * rot).toFixed(2)}deg`);
    }
  };

  const render = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000 || 1 / 60);
    last = now;
    const k = 1 - Math.pow(1 - SMOOTH, dt * 60);
    x += (tx - x) * k;
    y += (ty - y) * k;
    write();

    if (Math.abs(tx - x) < 0.001 && Math.abs(ty - y) < 0.001) {
      raf = 0;
      return;
    }
    raf = requestAnimationFrame(render);
  };

  const kick = () => {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(render);
  };

  const onEnter = () => {
    items = collect();
  };

  const onMove = (e) => {
    if (e.pointerType && e.pointerType !== "mouse") return;
    const r = root.getBoundingClientRect();
    tx = clamp(((e.clientX - r.left) / r.width) * 2 - 1);
    ty = clamp(((e.clientY - r.top) / r.height) * 2 - 1);
    kick();
  };

  const onLeave = () => {
    tx = 0;
    ty = 0;
    kick();
  };

  root.addEventListener("pointerenter", onEnter);
  root.addEventListener("pointermove", onMove);
  root.addEventListener("pointerleave", onLeave);

  return () => {
    root.removeEventListener("pointerenter", onEnter);
    root.removeEventListener("pointermove", onMove);
    root.removeEventListener("pointerleave", onLeave);
    cancelAnimationFrame(raf);
    for (const { el } of items) {
      el.style.removeProperty("--mx");
      el.style.removeProperty("--my");
      el.style.removeProperty("--mr");
    }
  };
}

const stickerItems = (els, layerDepth) =>
  els.map((el, i) => {
    const depth = layerDepth(el) * VARIATION[i % VARIATION.length];
    return { el, depth, rot: STICKER_ROT * depth };
  });

export function initParallax(root = document) {
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || reduced) return () => {};

  const teardowns = [];

  const hero = root.querySelector("[data-hero]");
  if (hero) {
    teardowns.push(
      createScene(hero, () => {
        const items = [];
        const balloon = hero.querySelector("[data-hero-balloon]");
        if (balloon) items.push({ el: balloon, ...BALLOON });
        const stickers = Array.from(hero.querySelectorAll(".hsticker"));
        items.push(
          ...stickerItems(stickers, (el) =>
            el.closest(".hero-stickers--front") ? LAYER_DEPTH.front : LAYER_DEPTH.back
          )
        );
        return items;
      })
    );
  }

  const sectors = root.querySelector(".sectors-section");
  if (sectors) {
    teardowns.push(
      createScene(sectors, () =>
        stickerItems(Array.from(sectors.querySelectorAll(".hsticker")), () => 1.2)
      )
    );
  }

  return () => teardowns.forEach((fn) => fn());
}
