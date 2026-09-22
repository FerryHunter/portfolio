/**
 * §5.1 — Preloader.
 * Pemilik tunggal `body.loaded` — kelas itu yang memicu seluruh
 * entrance hero (§6.2), jadi urutannya: preloader selesai →
 * loaded → marquee reveal + meta fade.
 *
 * Safety: kalau ada aset yang menggantung, preloader tetap keluar
 * setelah HARD_STOP supaya pengunjung tidak pernah terkurung.
 */
const HARD_STOP = 3500;

const finish = (pre) => {
  document.body.classList.remove("preloading");
  document.body.classList.add("loaded");
  if (pre) {
    pre.classList.add("done");
    // Lepas dari layer paint setelah transisi keluar selesai.
    setTimeout(() => pre.setAttribute("aria-hidden", "true"), 950);
  }
};

export function initPreloader(root = document) {
  const pre = root.querySelector("[data-preloader]");

  if (!pre || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finish(pre);
    return () => {};
  }

  const countEl = pre.querySelector("[data-pre-count]");
  const barEl = pre.querySelector("[data-pre-bar]");
  const images = Array.from(root.images || document.images);

  let shown = 0;
  let done = false;
  let raf = 0;

  // Target = fraksi gambar yang sudah selesai, dibatasi 90 sampai
  // window.load supaya angkanya tidak menyentuh 100 lebih awal.
  const target = () => {
    if (document.readyState === "complete") return 100;
    if (!images.length) return 90;
    const ready = images.filter((img) => img.complete).length;
    return Math.min(90, Math.round((ready / images.length) * 90));
  };

  const settle = () => {
    if (done) return;
    done = true;
    cancelAnimationFrame(raf);
    if (countEl) countEl.textContent = "100";
    if (barEl) barEl.style.width = "100%";
    finish(pre);
  };

  const tick = () => {
    if (done) return;
    shown += (target() - shown) * 0.08;
    const value = Math.min(100, Math.round(shown));
    if (countEl) countEl.textContent = String(value).padStart(3, "0");
    if (barEl) barEl.style.width = `${value}%`;
    if (value >= 99) {
      settle();
      return;
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  const onLoad = () => setTimeout(settle, 260);
  if (document.readyState === "complete") onLoad();
  else window.addEventListener("load", onLoad, { once: true });

  const guard = setTimeout(settle, HARD_STOP);

  return () => {
    cancelAnimationFrame(raf);
    clearTimeout(guard);
    window.removeEventListener("load", onLoad);
  };
}
