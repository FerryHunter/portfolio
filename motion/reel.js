/**
 * §6.4 — Showreel.
 * Wrapper mulai scale(.9) lalu membesar ke 1 saat masuk viewport
 * (efek "membuka"). Media di-overscan 8% atas-bawah sehingga bisa
 * digeser parallax di dalam frame tanpa memperlihatkan tepi — tapi
 * hanya showreel hero/§6.4 aslinya. Di dalam `.case-video` (studi
 * kasus), frame sudah dikunci ke rasio asli rekamannya (lihat CSS),
 * jadi overscan+parallax itu cuma akan memotong rekaman tanpa
 * alasan; `flat` di bawah mematikan parallax untuk kasus itu.
 *
 * Video baru di-attach saat mendekati viewport, dan hanya kalau
 * data-src diisi — poster jadi LCP, bukan video (§6.4). Selama
 * clip itu di-fetch dan di-decode, [data-reel-loading] (kalau ada
 * di markup) tampil sebagai spinner; `.loaded` ditambahkan ke
 * wrapper begitu video benar-benar `playing` (atau gagal dimuat),
 * yang menyembunyikannya lewat CSS.
 */
export function initReel(root = document) {
  const wrap = root.querySelector("[data-reel]");
  if (!wrap) return () => {};

  const media = wrap.querySelector("[data-reel-media]");
  const mute = wrap.querySelector("[data-reel-mute]");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const flat = Boolean(wrap.closest(".case-video"));

  let raf = 0;
  let visible = false;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        visible = e.isIntersecting;
        if (!e.isIntersecting) return;
        wrap.classList.add("in");

        // Lazy attach: hanya kalau memang ada sumber video.
        const src = media?.dataset.src;
        if (src && media.tagName === "VIDEO" && !media.src) {
          // `.loaded` dilepas sampai event `playing` benar-benar
          // menyala — itu yang menyembunyikan spinner di
          // [data-reel-loading], bukan sekadar src ter-attach
          // (fetch + decode clip masih makan waktu sebelum frame
          // pertama tampil). `error` juga menutupnya supaya
          // spinner tidak berputar selamanya kalau clipnya gagal
          // dimuat.
          const markLoaded = () => wrap.classList.add("loaded");
          media.addEventListener("playing", markLoaded, { once: true });
          media.addEventListener("error", markLoaded, { once: true });
          media.src = src;
          media.play?.().catch(() => {});
        }
      });
    },
    { threshold: 0.2 }
  );
  io.observe(wrap);

  // Parallax di dalam frame — hanya jalan saat wrapper terlihat, dan
  // tidak sama sekali di `.case-video` (lihat catatan di atas).
  const tick = () => {
    if (visible && media && !reduced && !flat) {
      const r = wrap.getBoundingClientRect();
      const progress = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight;
      media.style.transform = `translate3d(0, ${(progress * 6).toFixed(2)}%, 0)`;
    }
    raf = requestAnimationFrame(tick);
  };
  if (!reduced && !flat) raf = requestAnimationFrame(tick);

  const onMute = () => {
    if (!media || media.tagName !== "VIDEO") return;
    media.muted = !media.muted;
    mute.setAttribute("aria-pressed", String(!media.muted));
    mute.setAttribute("aria-label", media.muted ? "Activar sonido" : "Silenciar");
  };
  mute?.addEventListener("click", onMute);

  return () => {
    io.disconnect();
    cancelAnimationFrame(raf);
    mute?.removeEventListener("click", onMute);
  };
}
