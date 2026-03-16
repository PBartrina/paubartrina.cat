import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import fs from 'fs';

// Mock fs module
vi.mock('fs');

const mockedFs = vi.mocked(fs);

// Mock next/og ImageResponse
const mockImageResponse = vi.fn();
vi.mock('next/og', () => ({
  ImageResponse: class MockImageResponse {
    constructor(element: unknown, options: unknown) {
      mockImageResponse(element, options);
      return { element, options };
    }
  },
}));

// Sample post content
const SAMPLE_POST = `---
title: "Test Post Title"
date: "2024-06-15"
description: "A test post description"
tags: ["test", "og"]
published: true
---

This is the content of the test post with enough words to generate a reading time.
`;

async function importOgImage() {
  vi.resetModules();
  return import('../opengraph-image');
}

describe('opengraph-image', () => {
  beforeEach(() => {
    vi.resetModules();
    mockImageResponse.mockClear();
    
    // Default fs mocks
    mockedFs.existsSync = vi.fn().mockReturnValue(true);
    mockedFs.readdirSync = vi.fn().mockReturnValue(['test-post.mdx'] as unknown as fs.Dirent[]);
    mockedFs.readFileSync = vi.fn().mockReturnValue(SAMPLE_POST);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exports correct size dimensions', async () => {
    const { size } = await importOgImage();
    expect(size).toEqual({ width: 1200, height: 630 });
  });

  it('exports correct content type', async () => {
    const { contentType } = await importOgImage();
    expect(contentType).toBe('image/png');
  });

  it('returns 404 Response when post is not found', async () => {
    mockedFs.existsSync = vi.fn().mockReturnValue(false);
    
    const { default: OgImage } = await importOgImage();
    const result = await OgImage({
      params: Promise.resolve({ locale: 'ca', slug: 'non-existent-post' }),
    });

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(404);
  });

  it('creates ImageResponse with correct post data when post exists', async () => {
    mockedFs.existsSync = vi.fn().mockImplementation((filePath: fs.PathLike) => {
      return filePath.toString().includes('test-post.mdx');
    });
    mockedFs.readFileSync = vi.fn().mockReturnValue(SAMPLE_POST);

    const { default: OgImage } = await importOgImage();
    await OgImage({
      params: Promise.resolve({ locale: 'ca', slug: 'test-post' }),
    });

    expect(mockImageResponse).toHaveBeenCalledTimes(1);
    
    // Verify the ImageResponse was created with size options
    const [, options] = mockImageResponse.mock.calls[0];
    expect(options).toEqual({ width: 1200, height: 630 });
  });

  it('works with different locales', async () => {
    mockedFs.existsSync = vi.fn().mockReturnValue(true);
    mockedFs.readFileSync = vi.fn().mockReturnValue(SAMPLE_POST);

    const { default: OgImage } = await importOgImage();
    
    // Test with English locale
    await OgImage({
      params: Promise.resolve({ locale: 'en', slug: 'test-post' }),
    });

    expect(mockImageResponse).toHaveBeenCalled();
  });

  it('works with Spanish locale', async () => {
    mockedFs.existsSync = vi.fn().mockReturnValue(true);
    mockedFs.readFileSync = vi.fn().mockReturnValue(SAMPLE_POST);

    const { default: OgImage } = await importOgImage();
    
    await OgImage({
      params: Promise.resolve({ locale: 'es', slug: 'test-post' }),
    });

    expect(mockImageResponse).toHaveBeenCalled();
  });
});
