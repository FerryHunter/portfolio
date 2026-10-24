import { notFound } from "next/navigation";
import Hero from "@/components/Hero";
import Showreel from "@/components/Showreel";
import Clients from "@/components/Clients";
import Companies from "@/components/Companies";
import Tagline from "@/components/Tagline";
import Services from "@/components/Services";
import Projects from "@/components/Projects";
import VibeCoding from "@/components/VibeCoding";
import JsonLd from "@/components/JsonLd";
import { getDict, isLang } from "@/lib/dict";
import { homeJsonLd } from "@/lib/seo";

export const dynamicParams = false;

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const dict = getDict(lang);

  return (
    <>
      <JsonLd data={homeJsonLd(dict, lang)} />
      <Hero dict={dict} />
      <Showreel dict={dict} />
      <Tagline dict={dict} />
      <Services dict={dict} />
      <Projects dict={dict} lang={lang} />
      <VibeCoding dict={dict} />
      <Clients dict={dict} />
      <Companies dict={dict} />
    </>
  );
}
