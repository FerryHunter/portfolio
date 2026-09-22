/**
 * §6.10 — Cookie banner.
 * Accept dan deny punya bobot visual sama (flex: 1 1 0 di CSS).
 * Tombol deny tidak pernah dibuat lebih kecil atau lebih pudar —
 * selain masalah kepatuhan, itu dark pattern.
 *
 * Pilihan disimpan sebagai "granted"/"denied". Tidak ada default
 * tersembunyi: selama belum memilih, tidak ada yang di-load.
 */
const KEY = "vs:consent:v1";

export function initCookies(root = document) {
  const cc = root.querySelector("[data-cookies]");
  if (!cc) return () => {};

  let stored = null;
  try {
    stored = localStorage.getItem(KEY);
  } catch {
    /* storage diblokir — banner tetap tampil, tidak apa-apa */
  }

  if (stored === "granted" || stored === "denied") {
    cc.remove();
    return () => {};
  }

  cc.removeAttribute("hidden");

  const decide = (value) => {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* diabaikan */
    }
    cc.remove();
    document.dispatchEvent(new CustomEvent("consent", { detail: value }));
  };

  const accept = cc.querySelector("[data-cc-accept]");
  const deny = cc.querySelector("[data-cc-deny]");
  const onAccept = () => decide("granted");
  const onDeny = () => decide("denied");
  accept?.addEventListener("click", onAccept);
  deny?.addEventListener("click", onDeny);

  return () => {
    accept?.removeEventListener("click", onAccept);
    deny?.removeEventListener("click", onDeny);
  };
}
