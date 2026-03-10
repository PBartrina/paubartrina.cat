import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";

// We mock the fs module so tests don't need real files on disk
vi.mock("fs");

const mockedFs = vi.mocked(fs);

// Helper to rebuild the module after each test (avoids module cache contamination)
async function importBlog() {
  // Clear the module registry so BLOG_DIR is re-evaluated with the current cwd mock
  vi.resetModules();
  return import("../blog");
}

// Minimal MDX frontmatter fixtures
const POST_A = `---
title: "Post A"
date: "2024-06-01"
description: "Desc A"
tags: ["tag1", "tag2"]
published: true
---

This is the body of post A. It has some content for reading time.
`;

const POST_B = `---
title: "Post B"
date: "2024-03-15"
description: "Desc B"
tags: ["tag3"]
published: false
---

Body of post B.
`;

const POST_C = `---
title: "Post C"
date: "2025-01-10"
description: "Desc C"
tags: []
---

Body of post C with plenty of words to test reading time calculation properly.
`;

describe("getAllPosts", () => {
  beforeEach(() => {
    vi.resetModules();
    // fs.existsSync: BLOG_DIR exists
    mockedFs.existsSync = vi.fn().mockReturnValue(true);
    // fs.readdirSync: three MDX files
    mockedFs.readdirSync = vi.fn().mockReturnValue(["post-a.mdx", "post-b.mdx", "post-c.mdx"] as unknown as fs.Dirent[]);
    // fs.readFileSync: return appropriate content per file
    mockedFs.readFileSync = vi.fn().mockImplementation((filePath: fs.PathOrFileDescriptor) => {
      const p = filePath.toString();
      if (p.includes("post-a")) return POST_A;
      if (p.includes("post-b")) return POST_B;
      if (p.includes("post-c")) return POST_C;
      return "";
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns all posts sorted by date descending (dev mode includes unpublished)", async () => {
    // In test env NODE_ENV is not "production", so unpublished posts are included
    const { getAllPosts } = await importBlog();
    const posts = getAllPosts();

    expect(posts).toHaveLength(3);
    // Sorted newest first: post-c (2025-01-10), post-a (2024-06-01), post-b (2024-03-15)
    expect(posts[0].slug).toBe("post-c");
    expect(posts[1].slug).toBe("post-a");
    expect(posts[2].slug).toBe("post-b");
  });

  it("returns correct metadata for a post", async () => {
    const { getAllPosts } = await importBlog();
    const posts = getAllPosts();
    const postA = posts.find((p) => p.slug === "post-a")!;

    expect(postA.title).toBe("Post A");
    expect(postA.date).toBe("2024-06-01");
    expect(postA.description).toBe("Desc A");
    expect(postA.tags).toEqual(["tag1", "tag2"]);
    expect(postA.readingTime).toMatch(/min read/);
  });

  it("excludes unpublished posts in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const { getAllPosts } = await importBlog();
    const posts = getAllPosts();

    const slugs = posts.map((p) => p.slug);
    expect(slugs).not.toContain("post-b"); // published: false
    expect(slugs).toContain("post-a");
    expect(slugs).toContain("post-c");
    vi.unstubAllEnvs();
  });

  it("returns empty array when BLOG_DIR does not exist", async () => {
    mockedFs.existsSync = vi.fn().mockReturnValue(false);
    const { getAllPosts } = await importBlog();
    expect(getAllPosts()).toEqual([]);
  });

  it("filters out non-mdx files", async () => {
    mockedFs.readdirSync = vi.fn().mockReturnValue(["post-a.mdx", "readme.txt", ".DS_Store"] as unknown as fs.Dirent[]);
    const { getAllPosts } = await importBlog();
    const posts = getAllPosts();
    expect(posts).toHaveLength(1);
    expect(posts[0].slug).toBe("post-a");
  });

  it("uses slug as title fallback when frontmatter title is missing", async () => {
    const noTitle = `---\ndate: "2024-01-01"\n---\nBody`;
    mockedFs.readdirSync = vi.fn().mockReturnValue(["no-title.mdx"] as unknown as fs.Dirent[]);
    mockedFs.readFileSync = vi.fn().mockReturnValue(noTitle);
    const { getAllPosts } = await importBlog();
    const posts = getAllPosts();
    expect(posts[0].title).toBe("no-title");
  });
});

describe("getPostBySlug", () => {
  beforeEach(() => {
    vi.resetModules();
    mockedFs.existsSync = vi.fn().mockReturnValue(true);
    mockedFs.readFileSync = vi.fn().mockReturnValue(POST_A);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns post with content for an existing slug", async () => {
    const { getPostBySlug } = await importBlog();
    const post = getPostBySlug("post-a");

    expect(post).not.toBeNull();
    expect(post!.slug).toBe("post-a");
    expect(post!.title).toBe("Post A");
    expect(post!.content).toContain("body of post A");
    expect(post!.published).toBe(true);
  });

  it("returns null for a missing slug", async () => {
    mockedFs.existsSync = vi.fn().mockReturnValue(false);
    const { getPostBySlug } = await importBlog();
    expect(getPostBySlug("does-not-exist")).toBeNull();
  });

  it("marks post as published when published field is absent", async () => {
    const noPublished = `---\ntitle: "No Flag"\ndate: "2024-01-01"\n---\nBody`;
    mockedFs.readFileSync = vi.fn().mockReturnValue(noPublished);
    const { getPostBySlug } = await importBlog();
    const post = getPostBySlug("no-flag");
    expect(post!.published).toBe(true);
  });

  it("marks post as not published when published is false", async () => {
    mockedFs.readFileSync = vi.fn().mockReturnValue(POST_B);
    const { getPostBySlug } = await importBlog();
    const post = getPostBySlug("post-b");
    expect(post!.published).toBe(false);
  });
});

describe("getAllSlugs", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns slugs derived from MDX filenames", async () => {
    mockedFs.existsSync = vi.fn().mockReturnValue(true);
    mockedFs.readdirSync = vi.fn().mockReturnValue(["foo.mdx", "bar.mdx"] as unknown as fs.Dirent[]);
    const { getAllSlugs } = await importBlog();
    expect(getAllSlugs()).toEqual(["foo", "bar"]);
  });

  it("returns empty array when BLOG_DIR does not exist", async () => {
    mockedFs.existsSync = vi.fn().mockReturnValue(false);
    const { getAllSlugs } = await importBlog();
    expect(getAllSlugs()).toEqual([]);
  });

  it("ignores non-mdx files", async () => {
    mockedFs.existsSync = vi.fn().mockReturnValue(true);
    mockedFs.readdirSync = vi.fn().mockReturnValue(["post.mdx", "image.png", "notes.md"] as unknown as fs.Dirent[]);
    const { getAllSlugs } = await importBlog();
    expect(getAllSlugs()).toEqual(["post"]);
  });
});
