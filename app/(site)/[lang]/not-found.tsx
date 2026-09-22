import Link from "next/link";
import { getDict, DEFAULT_LANG } from "@/lib/dict";

export default function NotFound() {
  const dict = getDict(DEFAULT_LANG);
  return (
    <section className="section" style={{ paddingTop: 160, minHeight: "70svh" }}>
      <p className="t-label">404</p>
      <h1 className="t-tagline" style={{ marginTop: 16, maxWidth: "18ch" }}>
        {dict.ui.notFound}
      </h1>
      <Link className="pill pill--lg t-eyebrow" href={`/${DEFAULT_LANG}`} style={{ marginTop: 32 }}>
        {dict.ui.notFoundBack}
      </Link>
    </section>
  );
}
