import type { Dict } from "@/lib/dict";

/**
 * Daftar company. Nama ditulis sebagai tipografi, bukan logo:
 * situs ini duotone dan tidak punya aset logo pihak ketiga.
 *
 * `.company` adalah wrapper, bukan link — separator "·" hidup di
 * wrapper supaya tidak ikut masuk ke dalam <a>. href kosong
 * dirender sebagai teks biasa, bukan link mati.
 */
export default function Companies({ dict }: { dict: Dict }) {
  return (
    <section className="section section--divided" aria-labelledby="companies-label">
      <div className="section-head reveal">
        <h2 className="t-label" id="companies-label">
          {dict.companies.label}
        </h2>
        <p className="t-meta">{dict.companies.meta}</p>
      </div>

      <div className="companies-row reveal">
        {dict.companies.items.map((c) => (
          <span className="company" key={c.name}>
            {c.href ? (
              <a
                className="company-link"
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                data-cursor="expand"
              >
                {c.name}
              </a>
            ) : (
              c.name
            )}
          </span>
        ))}
      </div>
    </section>
  );
}
