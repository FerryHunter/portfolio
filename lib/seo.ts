import type { Metadata } from "next";
import { LANGS, type Case, type Dict, type Lang } from "@/lib/dict";

/**
 * SEO + data terstruktur. Satu sumber untuk <head> tiap halaman:
 * canonical, hreflang, Open Graph, Twitter, dan JSON-LD schema.org.
 * Semua teks dari content/*.json (blok `meta`, `seo`, `projects`, `cases`).
 */
export const SITE_URL = "https://www.ferryworks.space";

const abs = (path: string) => `${SITE_URL}${path}`;
const LOCALE: Record<Lang, string> = { en: "en_US", id: "id_ID" };
const OG_IMAGE = { url: "/og-image.png", width: 1200, height: 630 };

type Json = Record<string, unknown>;

/**
 * Metadata satu halaman. `path` TANPA prefiks bahasa: "" untuk home,
 * "/work/<slug>" untuk case. Open Graph dan Twitter disusun ulang di
 * sini (bukan diwarisi dari layout) karena Next mengganti objek
 * `openGraph` anak secara utuh, bukan menggabungkannya.
 */
export function pageMetadata(
  lang: Lang,
  path: string,
  title: string,
  description: string
): Metadata {
  const languages: Record<string, string> = { "x-default": `/en${path}` };
  for (const l of LANGS) languages[l] = `/${l}${path}`;

  const og = {
    siteName: "Ferry Works",
    locale: LOCALE[lang],
    alternateLocale: LANGS.filter((l) => l !== lang).map((l) => LOCALE[l]),
    url: `/${lang}${path}`,
    title,
    description,
    images: [OG_IMAGE],
  };

  return {
    title,
    description,
    alternates: { canonical: `/${lang}${path}`, languages },
    openGraph: path ? { ...og, type: "article" } : { ...og, type: "website" },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
  };
}

const personRef = { "@id": `${SITE_URL}/#person` };
const websiteRef = { "@id": `${SITE_URL}/#website` };

/** Home: WebSite + Person + ProfilePage + daftar case study. */
export function homeJsonLd(dict: Dict, lang: Lang): Json {
  const url = abs(`/${lang}`);
  const sameAs = dict.footer.social
    .map((s) => s.href)
    .filter((h) => h.startsWith("https://") && !h.includes("wa.me"));
  const cases = dict.projects.items.filter((p) => p.case);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteRef["@id"],
        url: SITE_URL,
        name: dict.seo.siteName,
        description: dict.meta.description,
        inLanguage: lang,
        publisher: personRef,
      },
      {
        "@type": "Person",
        "@id": personRef["@id"],
        name: dict.seo.person,
        jobTitle: dict.seo.jobTitle,
        description: dict.meta.description,
        url,
        sameAs,
        knowsAbout: dict.seo.knowsAbout,
      },
      {
        "@type": "ProfilePage",
        "@id": `${url}#profilepage`,
        url,
        name: dict.meta.title,
        description: dict.meta.description,
        inLanguage: lang,
        isPartOf: websiteRef,
        mainEntity: personRef,
        about: personRef,
      },
      {
        "@type": "ItemList",
        "@id": `${url}#work`,
        name: dict.seo.caseStudies,
        itemListElement: cases.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: p.title,
          url: abs(`/${lang}/work/${p.case}`),
        })),
      },
    ],
  };
}

/** Halaman case: Article + BreadcrumbList (Home > Work > Case). */
export function caseJsonLd(dict: Dict, data: Case, lang: Lang, slug: string): Json {
  const url = abs(`/${lang}/work/${slug}`);
  const facts = Object.fromEntries(data.facts.map((f) => [f.k, f.v]));
  const keywords = [facts.Sector, facts.Surface, facts.Role].filter(Boolean).join(", ");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: data.title,
        description: data.meta.description,
        url,
        mainEntityOfPage: url,
        inLanguage: lang,
        image: abs(data.cover.img),
        keywords,
        articleSection: dict.seo.caseStudies,
        author: {
          "@type": "Person",
          "@id": personRef["@id"],
          name: dict.seo.person,
          url: abs(`/${lang}`),
        },
        publisher: personRef,
        isPartOf: websiteRef,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: dict.seo.siteName, item: abs(`/${lang}`) },
          { "@type": "ListItem", position: 2, name: dict.projects.label, item: abs(`/${lang}#work`) },
          { "@type": "ListItem", position: 3, name: data.title, item: url },
        ],
      },
    ],
  };
}
