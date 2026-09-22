import type { Case, Dict, Lang } from "@/lib/dict";

/**
 * Kontrak satu halaman case study.
 *
 * `data` generik: komponen yang sudah tahu slug-nya menyebut
 * bentuknya sendiri (`CaseProps<Cases["nanovest-calendar"]>`) dan
 * tidak perlu mempersempit union di dalam badannya. Yang membayar
 * generik ini cuma registry di ./index.ts — satu-satunya tempat
 * yang memang belum tahu slug mana yang akan dipanggil.
 */
export type CaseProps<D extends Case = Case> = {
  dict: Dict;
  lang: Lang;
  data: D;
};
