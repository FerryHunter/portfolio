import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Preloader from "@/components/Preloader";
import Cursor from "@/components/Cursor";
import CookieBanner from "@/components/CookieBanner";
import FooterCta from "@/components/FooterCta";
import MotionRoot from "@/components/MotionRoot";
import { DEFAULT_LANG, getDict, isLang, LANGS } from "@/lib/dict";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

// Hanya /en dan /id yang ada. Tanpa ini segmen [lang] menerima apa saja
// (/xx, /foo, /fr, /EN semuanya 200 dengan halaman utama yang sama),
// yaitu duplikat tak terbatas bagi mesin pencari.
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDict(lang);
  const current = isLang(lang) ? lang : DEFAULT_LANG;
  return pageMetadata(current, "", dict.meta.title, dict.meta.description);
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const dict = getDict(lang);
  const current = isLang(lang) ? lang : DEFAULT_LANG;

  return (
    <>
      <Preloader dict={dict} />
      <Cursor dict={dict} />
      <a className="skip-link" href="#main">
        {dict.ui.skip}
      </a>
      <Nav dict={dict} lang={current} />
      <main id="main">{children}</main>
      <FooterCta dict={dict} lang={current} />
      <CookieBanner dict={dict} />
      <MotionRoot />
    </>
  );
}
