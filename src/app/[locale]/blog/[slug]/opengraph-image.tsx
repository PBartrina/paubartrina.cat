import { getPostBySlug } from '@/lib/blog';
import { ogCard, ogSize } from '@/lib/og';

export const size = ogSize;
export const contentType = 'image/png';

export default async function OgImage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = getPostBySlug(locale, slug);

  if (!post) {
    return new Response('Not found', { status: 404 });
  }

  // Seeded by slug: every post gets its own, stable pattern.
  return ogCard({
    seed: slug,
    eyebrow: 'paubartrina.cat/blog',
    title: post.title,
    meta: `${post.date} · ${post.readingTime}`,
  });
}
