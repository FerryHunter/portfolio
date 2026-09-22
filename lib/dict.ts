import en from "@/content/en.json";
import id from "@/content/id.json";

/**
 * i18n lewat URL segment ([lang]), tanpa library.
 * Dictionary JSON di-import di server component → nol runtime cost.
 * Menambah bahasa = satu file JSON + satu baris di sini.
 */
export const LANGS = ["en", "id"] as const;
export type Lang = (typeof LANGS)[number];

export type Dict = typeof en;

const DICTS: Record<Lang, Dict> = { en, id: id as Dict };

export const DEFAULT_LANG: Lang = "en";

export function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}

export function getDict(lang: string): Dict {
  return isLang(lang) ? DICTS[lang] : DICTS[DEFAULT_LANG];
}

/**
 * Kamus case study (content/*.json → "cases").
 *
 * `Case` adalah union semua proyek, bukan bentuk salah satunya:
 * entri boleh berbeda isi: satu punya galeri picsum (`seed`), yang
 * lain aset ponsel (`img` + `fit`). Komponen yang sudah tahu
 * slug-nya menyebut bentuknya lewat `Cases["<slug>"]`.
 */
export type Cases = Dict["cases"];
export type Case = Cases[keyof Cases];

export function getCase(dict: Dict, slug: string): Case | undefined {
  return (dict.cases as Record<string, Case>)[slug];
}
