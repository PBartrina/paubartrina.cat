import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';

// Mock fs module
vi.mock('fs');

const mockedFs = vi.mocked(fs);

// Sample post content
const SAMPLE_POST_CA = `---
title: "Hola Món!"
date: "2026-03-09"
description: "El meu primer article al blog."
tags: ["general"]
published: true
---

Contingut del post.
`;

const SAMPLE_POST_EN = `---
title: "Hello World!"
date: "2026-03-09"
description: "My first blog post."
tags: ["general"]
published: true
---

Post content.
`;

async function importRoute() {
  vi.resetModules();
  return import('../route');
}

describe('RSS feed route handler', () => {
  beforeEach(() => {
    vi.resetModules();
    
    // Default fs mocks
    mockedFs.existsSync = vi.fn().mockReturnValue(true);
    mockedFs.readdirSync = vi.fn().mockReturnValue(['hola-mon.mdx'] as unknown as fs.Dirent[]);
    mockedFs.readFileSync = vi.fn().mockImplementation((filePath: fs.PathOrFileDescriptor) => {
      const p = filePath.toString().replace(/\\/g, '/');
      if (p.includes('/ca/')) return SAMPLE_POST_CA;
      if (p.includes('/en/')) return SAMPLE_POST_EN;
      return SAMPLE_POST_CA;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns valid RSS XML for a valid locale', async () => {
    const { GET } = await importRoute();
    const response = await GET(
      new Request('http://localhost/ca/blog/feed.xml'),
      { params: Promise.resolve({ locale: 'ca' }) }
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/xml; charset=utf-8');
    
    const xml = await response.text();
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain('<channel>');
    expect(xml).toContain('<title>Pau Bartrina – Blog</title>');
    expect(xml).toContain('<language>ca</language>');
  });

  it('includes blog posts in the feed', async () => {
    const { GET } = await importRoute();
    const response = await GET(
      new Request('http://localhost/ca/blog/feed.xml'),
      { params: Promise.resolve({ locale: 'ca' }) }
    );

    const xml = await response.text();
    expect(xml).toContain('<item>');
    expect(xml).toContain('<![CDATA[Hola Món!]]>');
    expect(xml).toContain('https://paubartrina.cat/ca/blog/hola-mon');
    expect(xml).toContain('<![CDATA[El meu primer article al blog.]]>');
  });

  it('returns 404 for invalid locale', async () => {
    const { GET } = await importRoute();
    const response = await GET(
      new Request('http://localhost/xx/blog/feed.xml'),
      { params: Promise.resolve({ locale: 'xx' }) }
    );

    expect(response.status).toBe(404);
    const text = await response.text();
    expect(text).toBe('Not found');
  });

  it('works with English locale', async () => {
    const { GET } = await importRoute();
    const response = await GET(
      new Request('http://localhost/en/blog/feed.xml'),
      { params: Promise.resolve({ locale: 'en' }) }
    );

    expect(response.status).toBe(200);
    const xml = await response.text();
    expect(xml).toContain('<language>en</language>');
    expect(xml).toContain('<![CDATA[Hello World!]]>');
  });

  it('works with Spanish locale', async () => {
    mockedFs.readFileSync = vi.fn().mockReturnValue(`---
title: "Hola Mundo!"
date: "2026-03-09"
description: "Mi primer articulo."
tags: ["general"]
published: true
---

Contenido.
`);

    const { GET } = await importRoute();
    const response = await GET(
      new Request('http://localhost/es/blog/feed.xml'),
      { params: Promise.resolve({ locale: 'es' }) }
    );

    expect(response.status).toBe(200);
    const xml = await response.text();
    expect(xml).toContain('<language>es</language>');
  });

  it('returns empty feed when no posts exist', async () => {
    mockedFs.existsSync = vi.fn().mockReturnValue(false);
    mockedFs.readdirSync = vi.fn().mockReturnValue([]);

    const { GET } = await importRoute();
    const response = await GET(
      new Request('http://localhost/ca/blog/feed.xml'),
      { params: Promise.resolve({ locale: 'ca' }) }
    );

    expect(response.status).toBe(200);
    const xml = await response.text();
    expect(xml).toContain('<channel>');
    expect(xml).not.toContain('<item>');
  });

  it('includes Cache-Control header', async () => {
    const { GET } = await importRoute();
    const response = await GET(
      new Request('http://localhost/ca/blog/feed.xml'),
      { params: Promise.resolve({ locale: 'ca' }) }
    );

    expect(response.headers.get('Cache-Control')).toBe('public, max-age=3600, s-maxage=3600');
  });

  it('includes atom:link self reference', async () => {
    const { GET } = await importRoute();
    const response = await GET(
      new Request('http://localhost/ca/blog/feed.xml'),
      { params: Promise.resolve({ locale: 'ca' }) }
    );

    const xml = await response.text();
    expect(xml).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
    expect(xml).toContain('atom:link href="https://paubartrina.cat/ca/blog/feed.xml"');
  });
});
