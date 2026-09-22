import type { Dict } from "@/lib/dict";
import { Arrow } from "./Arrow";

/**
 * §6.1 — Dua state konten ditumpuk di grid-area 1/1 yang sama,
 * cross-fade dengan translate ±12px. Keduanya selalu di DOM →
 * nol layout shift.
 *
 * Tidak ada pemilih bahasa di nav ini — toggle EN/ID manual dan,
 * setelahnya, widget Google Translate keduanya sudah dicabut atas
 * permintaan. Rute /en dan /id tetap ada dan bisa diakses langsung
 * lewat URL, hanya kontrol switch di UI yang dihapus.
 */
export default function Nav({ dict }: { dict: Dict }) {
  return (
    <>
      <nav className="nav" data-nav aria-label={dict.nav.menu}>
        <div className="nav-inner">
          {/* --- state: top --- */}
          <div className="nav-layer nav-layer--top">
            <div className="nav-group">
              {dict.nav.primary.map((item) => (
                <a key={item.label} className="pill t-eyebrow" href={item.href}>
                  {item.label}
                  <Arrow />
                </a>
              ))}
            </div>

            <div className="nav-group nav-coords t-eyebrow">
              <span className="nav-coords-lines">
                {dict.nav.coords.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </span>
              <span>{dict.nav.est}</span>
            </div>

            <div className="nav-group">
              <div className="nav-drawer-zone">
                <button
                  className="nav-more"
                  data-more
                  aria-expanded="false"
                  aria-label={dict.nav.more}
                >
                  <span className="nav-more-bars" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                </button>
                <div className="nav-drawer" data-drawer>
                  {dict.nav.drawer.map((item) => (
                    <a key={item.label} className="pill t-eyebrow" href={item.href}>
                      {item.label}
                      <Arrow />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* --- state: scrolled --- */}
          <div className="nav-layer nav-layer--scrolled">
            <a className="nav-wordmark" href="#top">
              {dict.brand}
            </a>
            <div className="nav-group">
              <a className="pill t-eyebrow" href="#contact">
                {dict.nav.cta}
                <Arrow />
              </a>
            </div>
          </div>

          {/* --- mobile bar (≤768px) --- */}
          <div className="nav-mobile-bar">
            <a className="nav-wordmark" href="#top">
              {dict.brand}
            </a>
            <button
              className="burger"
              data-burger
              aria-expanded="false"
              aria-controls="mobile-menu"
              aria-label={dict.nav.menu}
            >
              <i />
              <i />
            </button>
          </div>
        </div>
      </nav>

      <div className="mobile-menu" id="mobile-menu" data-mobile-menu>
        <div>
          {[...dict.nav.primary, ...dict.nav.drawer].map((item) => (
            <a key={item.label} className="t-menu" href={item.href}>
              {item.label}
            </a>
          ))}
        </div>
        <div className="mobile-menu-foot t-eyebrow">
          <span className="nav-coords-lines">
            {dict.nav.coords.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </span>
          <span>{dict.nav.est}</span>
        </div>
      </div>
    </>
  );
}
