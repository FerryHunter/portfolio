/**
 * Data terstruktur schema.org (JSON-LD) untuk mesin pencari dan mesin
 * jawab AI. `<` di-escape supaya string apa pun di data tidak bisa
 * menutup tag <script>.
 */
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
