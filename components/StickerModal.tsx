import type { Dict } from "@/lib/dict";
import { Arrow } from "./Arrow";

/**
 * §6.3 — Markup modal saja, tanpa state React: seluruh
 * perilakunya di motion/stickers.js supaya preview statis
 * memakai logika yang sama persis.
 *
 * Pesan error ikut lewat data-msg-* di kartu, jadi modul JS-nya
 * tetap bebas bahasa — tidak ada satu pun string UI di dalamnya.
 */
export default function StickerModal({ dict }: { dict: Dict }) {
  return (
    <>
      <div className="sm-backdrop" data-sm-backdrop hidden />

      <div
        className="sm-card"
        data-sm-card
        hidden
        role="dialog"
        aria-modal="true"
        aria-labelledby="sm-title"
        data-msg-large={dict.ui.errTooLarge}
        data-msg-format={dict.ui.errFormat}
        data-msg-process={dict.ui.errProcess}
      >
        <div className="sm-head">
          <h2 className="sm-title" id="sm-title">
            {dict.hero.sticker.line1} {dict.hero.sticker.line2}
          </h2>
          <button className="sm-close" data-sm-close aria-label={dict.ui.close}>
            <svg viewBox="0 0 10 10" width="9" height="9" aria-hidden="true">
              <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        </div>

        <p className="sm-sub">{dict.ui.stickerNote}</p>

        <label className="sm-drop" data-sm-drop tabIndex={0}>
          <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" />
          <span className="t-eyebrow">{dict.ui.chooseFile}</span>
          <span className="sm-drop-hint">{dict.ui.dropHint}</span>
        </label>

        <div className="sm-preview" data-sm-preview hidden>
          <img alt={dict.ui.previewAlt} />
        </div>

        <p className="sm-error t-meta" data-sm-error role="status" aria-live="polite" />

        <div className="sm-actions">
          <button className="pill t-eyebrow" data-sm-cancel type="button">
            {dict.ui.cancel}
          </button>
          <button className="pill pill--solid t-eyebrow" data-sm-place type="button" disabled>
            {dict.ui.place}
            <Arrow />
          </button>
        </div>
      </div>
    </>
  );
}
