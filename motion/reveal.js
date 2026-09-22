/**
 * §5.3 — Reveal on scroll.
 * Satu observer global untuk seluruh halaman. unobserve setelah
 * trigger: reveal sekali saja, tidak reverse.
 */
const SELECTOR = ".reveal, .p-item, [data-reveal]";

export function initReveal(root = document) {
  const targets = Array.from(root.querySelectorAll(SELECTOR));
  if (!targets.length) return () => {};

  // Stagger per kata (§6.5): delay inkremental di-set saat init,
  // bukan ditulis manual di markup.
  root.querySelectorAll("[data-stagger]").forEach((container) => {
    const step = Number(container.dataset.stagger) || 18;
    container.querySelectorAll(".w > span").forEach((span, i) => {
      span.style.transitionDelay = `${i * step}ms`;
    });
  });

  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("in"));
    return () => {};
  }

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.15 }
  );

  targets.forEach((el) => io.observe(el));
  return () => io.disconnect();
}
