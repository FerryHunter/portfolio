import type { Dict } from "@/lib/dict";
import { Arrow } from "./Arrow";
import { Lines } from "./Words";
import ResumeModal from "./ResumeModal";

/**
 * §6.9 — Footer CTA. data-dark memicu inversi warna nav (§6.1).
 *
 * Tautan dengan href kosong tidak dirender. Jadi Dribbble dan CV
 * muncul sendiri begitu nilainya diisi di content/*.json, tanpa
 * pernah menampilkan tautan mati.
 */
export default function FooterCta({ dict }: { dict: Dict }) {
  const social = dict.footer.social.filter((s) => s.href);

  return (
    <footer className="grain" id="footer-cta" data-dark data-reveal>
      <div className="footer-top">
        <h2 className="t-claim footer-claim">
          <Lines lines={dict.footer.claim} />
        </h2>

        <div className="footer-contact t-meta" id="contact">
          <address>
            {dict.footer.address.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
          </address>

          <a href={`mailto:${dict.footer.email}`}>{dict.footer.email}</a>

          <div className="footer-actions">
            <a className="pill pill--solid pill--lg t-eyebrow" href={dict.footer.contactHref}>
              {dict.footer.contactLabel}
              <Arrow />
            </a>
            {dict.footer.cvHref ? (
              <a
                className="pill pill--lg t-eyebrow"
                href={dict.footer.cvHref}
                download
              >
                {dict.footer.cvLabel}
                <Arrow />
              </a>
            ) : null}
          </div>

          {social.length ? (
            <div>
              <span className="footer-links-label t-eyebrow">{dict.footer.socialLabel}</span>
              <div className="footer-links">
                {social.map((s) => (
                  <a
                    key={s.label}
                    className="pill t-eyebrow"
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {s.label}
                    <Arrow />
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="footer-bottom t-meta">
        <nav className="footer-nav" aria-label={dict.footer.cta}>
          {dict.footer.nav.map((item) =>
            item.action === "resume" ? (
              <button key={item.label} type="button" data-resume-cta>
                {item.label}
              </button>
            ) : (
              <a key={item.label} href={item.href}>
                {item.label}
              </a>
            )
          )}
        </nav>
        <span>{dict.footer.legal}</span>
      </div>

      <ResumeModal dict={dict} />
    </footer>
  );
}
