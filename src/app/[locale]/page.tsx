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

  return (
    <>
      <Hero />
      <AtAGlance latestPost={latestPost} />
      <Skills />
      <Experience />
      <Education />
    </>
  );
}
