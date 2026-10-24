/**
 * §6.2c — Hero: parallax balon mengikuti kursor.
 *
 * Posisi kursor di dalam hero dinormalisasi ke -1..1 dari tengah, lalu
 * balon bergeser berlawanan arah (kesan kedalaman: ia di belakang
 * wordmark) dan miring sedikit ke arah kursor. Posisi dihaluskan
 * (lerp berbasis waktu, bukan per frame, supaya sama di 60Hz dan
 * 120Hz) dan hasilnya ditulis lewat custom property --bx/--by/--br
 * yang dibaca CSS (.hero-balloon). rAF tidur begitu posisi menetap.
 *
 * Hanya untuk pointer halus dengan hover; layar sentuh dan
 * prefers-reduced-motion mendapat balon statis.
 */
const MAX_X = 44; // px
const MAX_Y = 30; // px
const MAX_ROT = 5; // deg
const SMOOTH = 0.09; // fraksi jarak per frame @60Hz

const clamp = (v) => Math.max(-1, Math.min(1, v));

export function initBalloon(root = document) {
  const hero = root.querySelector("[data-hero]");
  const balloon = hero?.querySelector("[data-hero-balloon]");
  if (!hero || !balloon) return () => {};

  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!fine || reduced) return () => {};

  let tx = 0;
  let ty = 0;
  let x = 0;
  let y = 0;
  let raf = 0;
  let last = 0;

  const render = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000 || 1 / 60);
    last = now;
    const k = 1 - Math.pow(1 - SMOOTH, dt * 60);
    x += (tx - x) * k;
    y += (ty - y) * k;

    balloon.style.setProperty("--bx", `${(-x * MAX_X).toFixed(2)}px`);
    balloon.style.setProperty("--by", `${(-y * MAX_Y).toFixed(2)}px`);
    balloon.style.setProperty("--br", `${(x * MAX_ROT).toFixed(2)}deg`);

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

  const onMove = (e) => {
    if (e.pointerType && e.pointerType !== "mouse") return;
    const r = hero.getBoundingClientRect();
    tx = clamp(((e.clientX - r.left) / r.width) * 2 - 1);
    ty = clamp(((e.clientY - r.top) / r.height) * 2 - 1);
    kick();
  };

  const onLeave = () => {
    tx = 0;
    ty = 0;
    kick();
  };

  hero.addEventListener("pointermove", onMove);
  hero.addEventListener("pointerleave", onLeave);

  return () => {
    hero.removeEventListener("pointermove", onMove);
    hero.removeEventListener("pointerleave", onLeave);
    cancelAnimationFrame(raf);
    balloon.style.removeProperty("--bx");
    balloon.style.removeProperty("--by");
    balloon.style.removeProperty("--br");
  };
}
