import { ImageResponse } from 'next/og';
import { getPostBySlug } from '@/lib/blog';

export const size = { width: 1200, height: 630 };
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

  return new ImageResponse(
    (
      <div
        style={{
          background: '#4a1870',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          fontFamily: 'monospace',
        }}
      >
        <div
          style={{
            color: '#c4698a',
            fontSize: 24,
            marginBottom: 24,
          }}
        >
          paubartrina.cat/blog
        </div>
        <div
          style={{
            color: '#fff0f4',
            fontSize: 56,
            fontWeight: 700,
            lineHeight: 1.2,
            maxWidth: 900,
          }}
        >
          {post.title}
        </div>
        <div
          style={{
            color: '#d4a0c0',
            fontSize: 28,
            marginTop: 32,
          }}
        >
          {post.date} · {post.readingTime}
        </div>
      </div>
    ),
    { ...size }
  );
}
