import type { Dict } from "@/lib/dict";
import { Arrow } from "./Arrow";

/**
 * §6.6 — Accordion + auto-advance 6s.
 * Detail panel: SEMUA konten dirender bersamaan sebagai
 * position:absolute yang saling menimpa. Nol mount/unmount →
 * transisi mulus. Perilaku di motion/services.js.
 */
export default function Services({ dict }: { dict: Dict }) {
  return (
    <section className="section section--divided" id="process">
      <div className="section-head reveal">
        <h2 className="t-label">{dict.services.label}</h2>
        <p className="t-meta">{dict.services.meta}</p>
      </div>

      <div className="services-grid reveal" data-services role="tablist" aria-orientation="vertical">
        <div>
          {dict.services.items.map((item, i) => (
            <button
              key={item.num}
              className={`service-item${i === 0 ? " active" : ""}`}
              data-service={i}
              role="tab"
              type="button"
              aria-selected={i === 0}
              aria-controls={`service-detail-${i}`}
              id={`service-tab-${i}`}
              tabIndex={i === 0 ? 0 : -1}
            >
              <span className="service-num">{item.num}</span>
              <h3 className="t-service">{item.title}</h3>
              <Arrow className="service-arrow" />
              <span className="service-progress-track" aria-hidden="true">
                <span className="service-progress" />
              </span>
            </button>
          ))}
        </div>

        <div className="service-detail-stage">
          {dict.services.items.map((item, i) => (
            <div
              key={item.num}
              className={`service-detail${i === 0 ? " visible" : ""}`}
              data-detail={i}
              id={`service-detail-${i}`}
              role="tabpanel"
              aria-labelledby={`service-tab-${i}`}
              aria-hidden={i !== 0}
            >
              <h4 className="t-detail-h">{item.heading}</h4>
              <p className="t-detail-b">{item.body}</p>
              <ul className="service-tags">
                {item.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
