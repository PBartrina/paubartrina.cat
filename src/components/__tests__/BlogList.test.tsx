/**
 * @vitest-environment happy-dom
 */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import BlogList from "@/components/BlogList";
import type { BlogPostMeta } from "@/lib/blog";

vi.mock("@/components/BlogCard", () => ({
  default: ({ post }: { post: BlogPostMeta }) => (
    <article data-testid="blog-card" data-slug={post.slug}>
      {post.title}
    </article>
  ),
}));

vi.mock("@/components/TagFilter", () => ({
  default: ({
    allTags,
    allTagsLabel,
    selectedTag,
  }: {
    allTags: string[];
    allTagsLabel: string;
    selectedTag?: string;
  }) =>
    allTags.length > 0 ? (
      <div aria-label="Filter by tag">
        <button>{allTagsLabel}</button>
        {allTags.map((tag) => (
          <button key={tag} aria-pressed={selectedTag === tag}>
            {tag}
          </button>
        ))}
      </div>
    ) : null,
}));

const makePosts = (): BlogPostMeta[] => [
  {
    slug: "post-a",
    title: "Post A",
    date: "2026-01-01",
    description: "Desc A",
    tags: ["react", "typescript"],
    readingTime: "2 min",
    locale: "en",
  },
  {
    slug: "post-b",
    title: "Post B",
    date: "2026-01-02",
    description: "Desc B",
    tags: ["react"],
    readingTime: "3 min",
    locale: "en",
  },
  {
    slug: "post-c",
    title: "Post C",
    date: "2026-01-03",
    description: "Desc C",
    tags: ["typescript"],
    readingTime: "4 min",
    locale: "en",
  },
];

describe("BlogList", () => {
  it("renders all posts when no tag is selected", () => {
    render(<BlogList posts={makePosts()} allTagsLabel="All" />);
    expect(screen.getAllByTestId("blog-card")).toHaveLength(3);
  });

  it("renders tag filter buttons for each unique tag plus All", () => {
    render(<BlogList posts={makePosts()} allTagsLabel="All" />);
    expect(screen.getByRole("button", { name: "All" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "react" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "typescript" })).toBeTruthy();
  });

  it("filters posts when selectedTag='react'", () => {
    render(
      <BlogList posts={makePosts()} allTagsLabel="All" selectedTag="react" />
    );
    const cards = screen.getAllByTestId("blog-card");
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveAttribute("data-slug", "post-a");
    expect(cards[1]).toHaveAttribute("data-slug", "post-b");
  });

  it("filters to two posts when selectedTag='typescript'", () => {
    render(
      <BlogList
        posts={makePosts()}
        allTagsLabel="All"
        selectedTag="typescript"
      />
    );
    const cards = screen.getAllByTestId("blog-card");
    expect(cards).toHaveLength(2);
  });

  it("shows all posts when selectedTag is undefined", () => {
    render(<BlogList posts={makePosts()} allTagsLabel="All" selectedTag={undefined} />);
    expect(screen.getAllByTestId("blog-card")).toHaveLength(3);
  });

  it("does not render tag bar when posts have no tags", () => {
    const posts = makePosts().map((p) => ({ ...p, tags: [] }));
    render(<BlogList posts={posts} allTagsLabel="All" />);
    expect(screen.queryByRole("button", { name: "All" })).toBeNull();
  });

  it("renders tags in sorted order", () => {
    render(<BlogList posts={makePosts()} allTagsLabel="All" />);
    const buttons = screen.getAllByRole("button");
    const tagLabels = buttons.map((b) => b.textContent);
    expect(tagLabels.indexOf("react")).toBeLessThan(
      tagLabels.indexOf("typescript")
    );
  });

  it("marks the selected tag as active", () => {
    render(
      <BlogList posts={makePosts()} allTagsLabel="All" selectedTag="react" />
    );
    const reactBtn = screen.getByRole("button", { name: "react" });
    expect(reactBtn.getAttribute("aria-pressed")).toBe("true");
    const tsBtn = screen.getByRole("button", { name: "typescript" });
    expect(tsBtn.getAttribute("aria-pressed")).toBe("false");
  });
});
