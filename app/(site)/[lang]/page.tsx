import Hero from "@/components/Hero";
import Showreel from "@/components/Showreel";
import Clients from "@/components/Clients";
import Companies from "@/components/Companies";
import Tagline from "@/components/Tagline";
import Services from "@/components/Services";
import Projects from "@/components/Projects";
import { DEFAULT_LANG, getDict, isLang, type Lang } from "@/lib/dict";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = getDict(lang);
  const current: Lang = isLang(lang) ? lang : DEFAULT_LANG;

  return (
    <>
      <Hero dict={dict} />
      <Showreel dict={dict} />
      <Tagline dict={dict} />
      <Services dict={dict} />
      <Projects dict={dict} lang={current} />
      <Clients dict={dict} />
      <Companies dict={dict} />
    </>
  );
}
