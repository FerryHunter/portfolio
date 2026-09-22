/**
 * §6.3 — Sticker upload, client-only.
 *
 * Gambar di-resize lewat <canvas> lalu disimpan sebagai data-URI
 * di localStorage. Tidak ada upload ke server, jadi tidak ada
 * konten publik dari anonim — sekaligus menutup risiko yang
 * disebut di §6.3.
 *
 * Validasi yang tetap dijalankan meski client-only:
 *  - MIME + magic bytes (bukan cuma ekstensi)
 *  - batas ukuran file
 *  - batas dimensi hasil (resize ke maks 420px)
 *  - batas jumlah sticker per pengunjung
 */
const STORAGE_KEY = "vs:stickers:v1";
const MAX_BYTES = 6 * 1024 * 1024;
const MAX_EDGE = 420;
const MAX_STICKERS = 6;

const SIGNATURES = [
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/gif", bytes: [0x47, 0x49, 0x46, 0x38] },
  { mime: "image/webp", bytes: [0x52, 0x49, 0x46, 0x46] },
];

async function sniff(file) {
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const hit = SIGNATURES.find((sig) =>
    sig.bytes.every((b, i) => head[i] === b)
  );
  if (!hit) return null;
  if (hit.mime === "image/webp") {
    const tag = String.fromCharCode(...head.slice(8, 12));
    if (tag !== "WEBP") return null;
  }
  return hit.mime;
}

function resize(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      resolve({ src: canvas.toDataURL("image/webp", 0.82), ar: w / h });
    };
    img.onerror = () => reject(new Error("decode"));
    img.src = dataUrl;
  });
}

const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result);
    fr.onerror = () => reject(new Error("read"));
    fr.readAsDataURL(file);
  });

const load = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(raw) ? raw.slice(0, MAX_STICKERS) : [];
  } catch {
    return [];
  }
};

const save = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(-MAX_STICKERS)));
  } catch {
    /* quota penuh — abaikan, sticker tetap tampil di sesi ini */
  }
};

export function initStickers(root = document) {
  const hero = root.querySelector("[data-hero]");
  const layer = root.querySelector("[data-sticker-target]");
  const cta = root.querySelector("[data-sticker-cta]");
  const backdrop = root.querySelector("[data-sm-backdrop]");
  const card = root.querySelector("[data-sm-card]");
  if (!hero || !layer || !cta || !card) return () => {};

  const input = card.querySelector("input[type=file]");
  const drop = card.querySelector("[data-sm-drop]");
  const preview = card.querySelector("[data-sm-preview]");
  const previewImg = preview?.querySelector("img");
  const placeBtn = card.querySelector("[data-sm-place]");
  const cancelBtn = card.querySelector("[data-sm-cancel]");
  const closeBtn = card.querySelector("[data-sm-close]");
  const errorEl = card.querySelector("[data-sm-error]");

  // Semua teks datang dari markup → modul ini bebas bahasa.
  const msg = {
    large: card.dataset.msgLarge || "File too large.",
    format: card.dataset.msgFormat || "Unsupported format.",
    process: card.dataset.msgProcess || "Could not read that image.",
  };

  let pending = null;
  let lastFocus = null;

  const paint = (sticker) => {
    const el = document.createElement("div");
    el.className = "hsticker";
    el.style.setProperty("--x", sticker.x);
    el.style.setProperty("--y", sticker.y);
    el.style.setProperty("--w", sticker.w);
    el.style.setProperty("--r", `${sticker.r}deg`);
    el.innerHTML =
      `<div class="hsticker-inner"><img src="${sticker.src}" alt="" ` +
      `style="--ar:${sticker.ar}"></div>`;
    layer.appendChild(el);
  };

  load().forEach(paint);

  const setError = (msg) => {
    if (errorEl) errorEl.textContent = msg || "";
  };

  const resetForm = () => {
    pending = null;
    if (input) input.value = "";
    preview?.setAttribute("hidden", "");
    placeBtn?.setAttribute("disabled", "");
    setError("");
  };

  const open = () => {
    lastFocus = document.activeElement;
    backdrop?.removeAttribute("hidden");
    card.removeAttribute("hidden");
    document.body.classList.add("menu-open");
    (drop || card).focus?.();
  };

  const close = () => {
    backdrop?.setAttribute("hidden", "");
    card.setAttribute("hidden", "");
    document.body.classList.remove("menu-open");
    resetForm();
    lastFocus?.focus?.(); // §9 — kembalikan fokus ke trigger
  };

  const accept = async (file) => {
    setError("");
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setError(msg.large);
      return;
    }
    const mime = await sniff(file);
    if (!mime) {
      setError(msg.format);
      return;
    }
    try {
      const raw = await readAsDataUrl(file);
      const { src, ar } = await resize(raw);
      pending = { src, ar };
      if (previewImg) previewImg.src = src;
      preview?.removeAttribute("hidden");
      placeBtn?.removeAttribute("disabled");
    } catch {
      setError(msg.process);
    }
  };

  const place = () => {
    if (!pending) return;
    const sticker = {
      ...pending,
      x: Math.round(12 + Math.random() * 76),
      y: Math.round(22 + Math.random() * 52),
      // Sebanding dengan sticker bawaan (--w 10..24), bukan lagi
      // 7..11 yang terbaca kecil di layar kecil.
      w: Math.round(13 + Math.random() * 8),
      r: Math.round(-14 + Math.random() * 28),
    };
    const list = load();
    list.push(sticker);
    save(list);

    // Hero masuk state .placing: semua sticker fade out selama
    // transisi masuk, lalu muncul kembali bersama yang baru.
    hero.classList.add("placing");
    close();
    setTimeout(() => {
      paint(sticker);
      hero.classList.remove("placing");
    }, 420);
  };

  cta.addEventListener("click", open);
  closeBtn?.addEventListener("click", close);
  cancelBtn?.addEventListener("click", close);
  backdrop?.addEventListener("click", close);
  placeBtn?.addEventListener("click", place);
  input?.addEventListener("change", (e) => accept(e.target.files?.[0]));

  ["dragenter", "dragover"].forEach((type) =>
    drop?.addEventListener(type, (e) => {
      e.preventDefault();
      drop.classList.add("over");
    })
  );
  ["dragleave", "drop"].forEach((type) =>
    drop?.addEventListener(type, (e) => {
      e.preventDefault();
      drop.classList.remove("over");
      if (type === "drop") accept(e.dataTransfer?.files?.[0]);
    })
  );

  // §9 — Escape + focus trap.
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

  return () => window.removeEventListener("keydown", onKey);
}
