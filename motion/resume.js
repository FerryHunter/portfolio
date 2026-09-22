/**
 * Modal permintaan résumé — pola open/close/focus-trap identik
 * dengan motion/stickers.js (§6.3), supaya dua modal di situs ini
 * terasa sebagai satu sistem, bukan dua implementasi berbeda.
 *
 * CV tidak pernah dilampirkan otomatis: mailto: tidak bisa
 * melampirkan berkas. Submit hanya menyusun draft email berisi
 * alamat pengunjung + konteks perusahaan, lalu membuka aplikasi
 * email pengunjung sendiri — mereka yang menekan kirim. Ferry
 * membalas manual dengan PDF terlampir setelah permintaan masuk.
 */
export function initResume(root = document) {
  const cta = root.querySelector("[data-resume-cta]");
  const backdrop = root.querySelector("[data-resume-backdrop]");
  const card = root.querySelector("[data-resume-card]");
  if (!cta || !backdrop || !card) return () => {};

  const form = card.querySelector("[data-resume-form]");
  const closeBtn = card.querySelector("[data-resume-close]");
  const cancelBtn = card.querySelector("[data-resume-cancel]");
  const emailInput = form?.querySelector('input[name="email"]');
  const companyInput = form?.querySelector('input[name="company"]');

  // Alamat penerima datang dari markup (content/*.json), bukan
  // di-hardcode di sini — satu sumber kebenaran untuk email.
  const to = card.dataset.email || "";

  let lastFocus = null;

  const open = () => {
    lastFocus = document.activeElement;
    backdrop.removeAttribute("hidden");
    card.removeAttribute("hidden");
    document.body.classList.add("menu-open");
    emailInput?.focus();
  };

  const close = () => {
    backdrop.setAttribute("hidden", "");
    card.setAttribute("hidden", "");
    document.body.classList.remove("menu-open");
    lastFocus?.focus?.(); // §9 — kembalikan fokus ke trigger
  };

  const submit = (e) => {
    e.preventDefault();
    const email = emailInput?.value.trim();
    if (!email || !emailInput.checkValidity()) {
      emailInput?.reportValidity();
      return;
    }
    const company = companyInput?.value.trim();

    const subject = company ? `[CV Request] ${company}` : "[CV Request]";
    const body =
      `Hi Feri,\n\nI'd like to request your résumé / CV.\n\n` +
      `- My email: ${email}\n` +
      `- Company / role: ${company || "—"}\n\n` +
      `Thanks,\n`;

    const mailto =
      `mailto:${to}?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    window.location.href = mailto;
    form.reset();
    close();
  };

  cta.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);
  cancelBtn?.addEventListener("click", close);
  backdrop.addEventListener("click", close);
  form?.addEventListener("submit", submit);

  // §9 — Escape + focus trap, pola identik dengan stickers.js.
  const onKey = (e) => {
    if (card.hasAttribute("hidden")) return;
    if (e.key === "Escape") {
      close();
      return;
    }
    if (e.key !== "Tab") return;
    const focusables = card.querySelectorAll(
      'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };
  window.addEventListener("keydown", onKey);

  return () => {
    cta.removeEventListener("click", open);
    closeBtn?.removeEventListener("click", close);
    cancelBtn?.removeEventListener("click", close);
    backdrop.removeEventListener("click", close);
    form?.removeEventListener("submit", submit);
    window.removeEventListener("keydown", onKey);
  };
}
