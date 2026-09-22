import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Preloader from "@/components/Preloader";
import Cursor from "@/components/Cursor";
import CookieBanner from "@/components/CookieBanner";
import FooterCta from "@/components/FooterCta";
import MotionRoot from "@/components/MotionRoot";
import { getDict, LANGS } from "@/lib/dict";

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const dict = getDict(lang);
  return { title: dict.meta.title, description: dict.meta.description };
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

  return (
    <>
      <Preloader dict={dict} />
      <Cursor dict={dict} />
      <a className="skip-link" href="#main">
        {dict.ui.skip}
      </a>
      <Nav dict={dict} />
      <main id="main">{children}</main>
      <FooterCta dict={dict} />
      <CookieBanner dict={dict} />
      <MotionRoot />
    </>
  );
}
