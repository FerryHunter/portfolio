import type { Dict } from "@/lib/dict";
import { Words } from "./Words";

export default function Tagline({ dict }: { dict: Dict }) {
  return (
    <section className="section section--divided tagline-section" id="about">
      <div className="tagline-grid reveal" data-stagger="18">
        <div className="section-head" style={{ marginBottom: 0, display: "block" }}>
          <p className="t-label">{dict.tagline.label}</p>
          <p className="t-meta" style={{ color: "var(--ink-muted)", marginTop: 8 }}>
            {dict.tagline.meta}
          </p>
        </div>
        <p className="t-tagline tagline">
          <Words text={dict.tagline.text} />
        </p>
      </div>
    </section>
  );
}
