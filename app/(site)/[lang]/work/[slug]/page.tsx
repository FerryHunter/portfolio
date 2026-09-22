import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CASE_PAGES } from "@/components/cases";
import { getCase, getDict, isLang, LANGS, DEFAULT_LANG, type Lang } from "@/lib/dict";

/**
 * Halaman case study dipilih dari registry, bukan dari satu
 * komponen generik: tiap proyek punya layout sendiri
 * (components/cases/*.tsx).
 */
export function generateStaticParams() {
  return LANGS.flatMap((lang) =>
    Object.keys(CASE_PAGES).map((slug) => ({ lang, slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const data = getCase(getDict(lang), slug);
  if (!data) return {};
  return { title: data.meta.title, description: data.meta.description };
}

export default async function CasePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const dict = getDict(lang);
  const data = getCase(dict, slug);
  const Page = CASE_PAGES[slug];

  // Data tanpa komponen (atau sebaliknya) adalah halaman setengah
  // jadi — 404 lebih jujur daripada merender kerangka kosong.
  if (!data || !Page) notFound();

  const current: Lang = isLang(lang) ? lang : DEFAULT_LANG;
  return <Page dict={dict} lang={current} data={data} />;
}
