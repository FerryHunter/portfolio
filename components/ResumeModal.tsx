import type { Dict } from "@/lib/dict";
import { Arrow } from "./Arrow";

/**
 * CV tidak ditaruh sebagai berkas langsung di situs ini — perekrut
 * mengisi modal ini untuk mengirim PERMINTAAN, bukan CV itu sendiri
 * (mailto: tidak bisa melampirkan berkas). Ferry membalas manual
 * dengan PDF terlampir setelah permintaan masuk.
 *
 * Markup saja, tanpa state React — sama seperti StickerModal.
 * Seluruh perilaku (buka/tutup, focus trap, susun mailto) ada di
 * motion/resume.js supaya preview statis memakai logika yang sama
 * persis. Email penerima ikut lewat data attribute, bukan
 * di-hardcode di JS, supaya modul itu tetap bebas bahasa dan
 * satu-satunya sumber kebenaran untuk alamat email tetap
 * content/*.json.
 */
export default function ResumeModal({ dict }: { dict: Dict }) {
  return (
    <>
      <div className="resume-backdrop" data-resume-backdrop hidden />

      <div
        className="resume-card"
        data-resume-card
        hidden
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-title"
        data-email={dict.footer.email}
      >
        <div className="resume-head">
          <h2 className="resume-title" id="resume-title">
            {dict.ui.resumeTitle}
          </h2>
          <button className="resume-close" data-resume-close aria-label={dict.ui.close}>
            <svg viewBox="0 0 10 10" width="9" height="9" aria-hidden="true">
              <path d="M1 1l8 8M9 1l-8 8" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </button>
        </div>

        <p className="resume-sub">{dict.ui.resumeSub}</p>

        <form data-resume-form>
          <label className="resume-field">
            <span className="resume-field-label t-eyebrow">{dict.ui.resumeEmailLabel}</span>
            <input type="email" name="email" required placeholder="you@company.com" />
          </label>

          <label className="resume-field">
            <span className="resume-field-label t-eyebrow">{dict.ui.resumeCompanyLabel}</span>
            <input type="text" name="company" placeholder="Acme Inc. · Recruiter" />
          </label>

          <div className="resume-actions">
            <button className="pill t-eyebrow" data-resume-cancel type="button">
              {dict.ui.cancel}
            </button>
            <button className="pill pill--solid t-eyebrow" type="submit">
              {dict.ui.resumeSend}
              <Arrow />
            </button>
          </div>
        </form>

        <p className="resume-note">{dict.ui.resumeNote}</p>
      </div>
    </>
  );
}
