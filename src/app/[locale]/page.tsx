import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/Hero";
import AtAGlance from "@/components/AtAGlance";
import Skills from "@/components/Skills";
import Experience from "@/components/Experience";
import Education from "@/components/Education";
import { getAllPosts } from "@/lib/blog";

interface PageProps {
  params: Promise<{ locale: string }>;
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <Hero />
      <AtAGlance latestPost={latestPost} locale={locale} />
      <Skills />
      <Experience />
      <Education />
    </>
  );
}
