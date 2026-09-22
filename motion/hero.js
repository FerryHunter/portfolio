/**
 * §6.2 — Hero: entrance + parallax sticker dua layer.
 * Parallax menulis transform langsung pada .hsticker dari
 * scrollY × faktor kedalaman per layer. Satu rAF, nol library.
 */
const reduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initHero(root = document) {
  const hero = root.querySelector("[data-hero]");

  // `body.loaded` — pemicu entrance hero — dimiliki preloader
  // (motion/preloader.js), bukan modul ini.
  if (!hero || reduced()) return () => {};

  const layers = Array.from(hero.querySelectorAll("[data-depth]")).map((el) => ({
    depth: Number(el.dataset.depth) || 0.1,
    items: Array.from(el.querySelectorAll(".hsticker")),
  }));

  let raf = 0;
  let running = true;

  const tick = () => {
    if (!running) return;
    const y = window.scrollY;
    // Berhenti menghitung begitu hero keluar viewport.
    if (y < window.innerHeight * 1.2) {
      layers.forEach(({ depth, items }) => {
        const shift = -y * depth;
        items.forEach((item, i) => {
          const drift = (i % 2 === 0 ? 1 : -1) * y * depth * 0.12;
          item.style.transform = `translate3d(${drift}px, ${shift}px, 0)`;
        });
      });
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  return () => {
    running = false;
    cancelAnimationFrame(raf);
  };
}
