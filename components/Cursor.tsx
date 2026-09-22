import type { Dict } from "@/lib/dict";

/**
 * §5.2 — Elemen tunggal, diposisikan lewat rAF di motion/cursor.js.
 * Label default ikut lewat data attribute supaya modulnya bebas bahasa.
 */
export default function Cursor({ dict }: { dict: Dict }) {
  return (
    <div id="cursor" data-cursor-el data-label-default={dict.ui.cursorView} aria-hidden="true">
      <span className="cursor-label" data-cursor-label />
    </div>
  );
}
