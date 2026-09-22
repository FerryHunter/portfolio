import { Fragment, type ReactNode } from "react";

/**
 * §6.5 — Word-by-word mask reveal.
 * Kata yang diapit *asterisk* jadi aksen.
 *
 * Dua hal yang mudah salah di sini:
 * - Spasi HARUS di luar `.w`. Di dalamnya ia hilang: `.w` adalah
 *   inline-block dengan overflow:hidden, dan spasi di ujung
 *   inline-block dibuang saat pembentukan line box.
 * - Tanda baca yang berada di luar penanda tetap di luar <em>.
 *   Koma yang ikut berwarna aksen terbaca seperti cacat.
 */
function markup(word: string): ReactNode {
  const first = word.indexOf("*");
  if (first === -1) return word;

  const last = word.lastIndexOf("*");
  if (first === last) return <em>{word.replace(/\*/g, "")}</em>;

  return (
    <>
      {word.slice(0, first)}
      <em>{word.slice(first + 1, last).replace(/\*/g, "")}</em>
      {word.slice(last + 1)}
    </>
  );
}

export function Words({ text }: { text: string }): ReactNode {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word, i) => (
      <Fragment key={`${word}-${i}`}>
        <span className="w">
          <span>{markup(word)}</span>
        </span>{" "}
      </Fragment>
    ));
}

/** §6.9 — line-by-line stagger untuk teks skala besar. */
export function Lines({ lines }: { lines: string[] }): ReactNode {
  return lines.map((line, i) => (
    <span className="line" key={i}>
      <span>{line}</span>
    </span>
  ));
}
