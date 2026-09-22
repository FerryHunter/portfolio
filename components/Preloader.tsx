import type { Dict } from "@/lib/dict";

/** §5.1 — Keluar dengan translateY(-100%), bukan fade. */
export default function Preloader({ dict }: { dict: Dict }) {
  return (
    <div id="preloader" data-preloader role="status" aria-label={dict.ui.loading}>
      <div className="pre-brand">
        <span>{dict.brand}</span>
      </div>
      <span className="pre-count" data-pre-count aria-hidden="true">
        000
      </span>
      <span className="pre-bar" data-pre-bar aria-hidden="true" />
    </div>
  );
}
