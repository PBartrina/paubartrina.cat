import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/Hero";
import AtAGlance from "@/components/AtAGlance";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Experience from "@/components/Experience";
import Education from "@/components/Education";
import Testimonials from "@/components/Testimonials";
import { getAllPosts } from "@/lib/blog";
import { safeJsonLd } from "@/lib/utils";
import { locales } from "@/i18n/config";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const latestPost = getAllPosts(locale)[0] ?? null;

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Pau Bartrina",
    jobTitle: "Front-end Web Developer",
    url: `https://paubartrina.cat/${locale}`,
    sameAs: [
      "https://bsky.app/profile/paubartrina.cat",
      "https://linkedin.com/in/paubartrina",
      "https://github.com/PBartrina",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(personJsonLd) }}
      />
      <Hero />
      <AtAGlance latestPost={latestPost} locale={locale} />
      <Skills />
      <Suspense fallback={<div className="py-20" />}>
        <Projects />
      </Suspense>
      <Suspense fallback={<div className="py-20" />}>
        <Testimonials />
      </Suspense>
      <Suspense fallback={<div className="py-20" />}>
        <Experience />
      </Suspense>
      <Suspense fallback={<div className="py-20" />}>
        <Education />
      </Suspense>
    </>
  );
}
