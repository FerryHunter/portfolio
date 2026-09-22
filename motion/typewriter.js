/**
 * §6.8 — Clients typewriter.
 *
 * Dua salinan ditumpuk: .ct-ghost (visibility:hidden) menahan
 * tinggi final container sejak awal, .ct-live yang diketik.
 * Konten di bawahnya tidak pernah melompat → nol CLS.
 *
 * Pengetikan berjalan di atas STRUKTUR, bukan string: live adalah
 * klon dari ghost, lalu tiap text node dipotong progresif. Dengan
 * begitu nama klien tetap jadi <a> yang bisa diklik, bukan teks
 * mati yang baru ditukar setelah animasi selesai.
 */
const CPS = 42; // karakter per detik

export function initTypewriter(root = document) {
  const stage = root.querySelector("[data-typewriter]");
  if (!stage) return () => {};

  const ghost = stage.querySelector(".ct-ghost");
  const live = stage.querySelector(".ct-live");
  const caret = stage.querySelector(".ct-caret");
  if (!ghost || !live) return () => {};

  // Bangun live dari klon ghost supaya strukturnya identik.
  live.innerHTML = "";
  const clone = ghost.cloneNode(true);
  while (clone.firstChild) live.appendChild(clone.firstChild);
  if (caret) live.appendChild(caret);

  const walker = document.createTreeWalker(live, NodeFilter.SHOW_TEXT);
  const nodes = [];
  let total = 0;
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (caret && caret.contains(n)) continue;
    nodes.push({ node: n, full: n.nodeValue, start: total });
    total += n.nodeValue.length;
  }

  const paint = (shown) => {
    nodes.forEach(({ node, full, start }) => {
      const take = Math.max(0, Math.min(full.length, shown - start));
      const next = full.slice(0, take);
      if (node.nodeValue !== next) node.nodeValue = next;
    });
  };

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    paint(total);
    stage.classList.add("done");
    return () => {};
  }

  paint(0);

  let raf = 0;
  let startedAt = 0;

  const step = (now) => {
    if (!startedAt) startedAt = now;
    const shown = Math.floor(((now - startedAt) / 1000) * CPS);
    paint(Math.min(total, shown));
    if (shown >= total) {
      stage.classList.add("done");
      return;
    }
    raf = requestAnimationFrame(step);
  };

  // Mulai hanya saat masuk viewport, lalu berhenti mengamati.
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        raf = requestAnimationFrame(step);
      });
    },
    { threshold: 0.35 }
  );
  io.observe(stage);

  return () => {
    io.disconnect();
    cancelAnimationFrame(raf);
  };
}
