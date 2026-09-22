/**
 * Titik masuk tunggal. Dipakai identik oleh komponen Next
 * (components/MotionRoot.tsx) dan halaman preview statis
 * (preview/index.html) — satu sumber kebenaran, nol drift.
 */
import { initPreloader } from "./preloader.js";
import { initCursor } from "./cursor.js";
import { initReveal } from "./reveal.js";
import { initNav } from "./nav.js";
import { initHero } from "./hero.js";
import { initReel } from "./reel.js";
import { initServices } from "./services.js";
import { initStrip } from "./strip.js";
import { initTypewriter } from "./typewriter.js";
import { initStickers } from "./stickers.js";
import { initCookies } from "./cookies.js";
import { initResume } from "./resume.js";

export function initAll(root = document) {
  const teardowns = [
    initPreloader(root),   // pemilik body.loaded → harus pertama
    initCursor(root),
    initReveal(root),
    initNav(root),
    initHero(root),
    initReel(root),
    initServices(root),
    initStrip(root),
    initTypewriter(root),
    initStickers(root),
    initCookies(root),
    initResume(root),
  ];
  return () => teardowns.forEach((fn) => fn?.());
}

export {
  initPreloader,
  initCursor,
  initReveal,
  initNav,
  initHero,
  initReel,
  initServices,
  initStrip,
  initTypewriter,
  initStickers,
  initCookies,
  initResume,
};
