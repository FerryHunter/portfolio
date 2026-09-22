import type { Dict } from "@/lib/dict";

/**
 * §6.10 — Dua tombol setara lebar (flex: 1 1 0). Deny tidak pernah
 * lebih kecil atau lebih pudar dari accept.
 */
export default function CookieBanner({ dict }: { dict: Dict }) {
  return (
    <div
      className="cc"
      data-cookies
      hidden
      role="dialog"
      aria-labelledby="cc-title"
      aria-live="polite"
    >
      <h2 className="cc-title" id="cc-title">
        {dict.cookies.title}
      </h2>
      <p className="cc-body">{dict.cookies.body}</p>

      <div className="cc-actions">
        <button className="pill t-eyebrow" data-cc-deny type="button">
          {dict.cookies.deny}
        </button>
        <button className="pill t-eyebrow" data-cc-accept type="button">
          {dict.cookies.accept}
        </button>
      </div>

      <div className="cc-links">
        {dict.cookies.links.map((l) => (
          <a key={l.label} href={l.href}>
            {l.label}
          </a>
        ))}
      </div>
    </div>
  );
}
