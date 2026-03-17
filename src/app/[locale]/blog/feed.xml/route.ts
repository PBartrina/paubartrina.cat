import { getAllPosts } from '@/lib/blog';
import { locales } from '@/i18n/config';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string }> }
) {
  const { locale } = await params;
  
  if (!locales.includes(locale as (typeof locales)[number])) {
    return new Response('Not found', { status: 404 });
  }

  const posts = getAllPosts(locale);
  const base = 'https://paubartrina.cat';

  const items = posts
    .map(
      (p) => `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${base}/${locale}/blog/${p.slug}</link>
      <guid isPermaLink="true">${base}/${locale}/blog/${p.slug}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <description><![CDATA[${p.description}]]></description>
    </item>`
    )
    .join('');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Pau Bartrina – Blog</title>
    <link>${base}/${locale}/blog</link>
    <description>Blog de Pau Bartrina - Senior Frontend Engineer</description>
    <language>${locale}</language>
    <atom:link href="${base}/${locale}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
