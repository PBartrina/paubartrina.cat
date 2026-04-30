"use client";

import { useState, useMemo } from "react";
import BlogCard from "@/components/BlogCard";
import TagFilter from "@/components/TagFilter";
import type { BlogPostMeta } from "@/lib/blog";

interface BlogSearchProps {
  posts: BlogPostMeta[];
  allTagsLabel: string;
  selectedTag?: string;
  searchPlaceholder: string;
  noResultsLabel: string;
}

export default function BlogSearch({
  posts,
  allTagsLabel,
  selectedTag,
  searchPlaceholder,
  noResultsLabel,
}: BlogSearchProps) {
  const [query, setQuery] = useState("");

  const allTags = useMemo(
    () => Array.from(new Set(posts.flatMap((p) => p.tags))).sort(),
    [posts]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      const matchesTag = !selectedTag || p.tags.includes(selectedTag);
      if (!matchesTag) return false;
      if (!q) return true;
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q))
      );
    });
  }, [posts, query, selectedTag]);

  return (
    <>
      {/* Search input */}
      <div className="mb-6">
        <label htmlFor="blog-search" className="sr-only">
          {searchPlaceholder}
        </label>
        <div className="relative">
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35m0 0A7 7 0 103.5 10.5a7 7 0 0013.15 6.15z"
            />
          </svg>
          <input
            id="blog-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-md border border-border-color bg-bg-primary py-2 pl-10 pr-4 font-mono text-sm text-text-primary placeholder:text-text-secondary focus:border-text-accent focus:outline-none focus:ring-1 focus:ring-text-accent"
          />
        </div>
      </div>

      <TagFilter
        allTags={allTags}
        allTagsLabel={allTagsLabel}
        selectedTag={selectedTag}
      />

      {filtered.length === 0 ? (
        <p className="mt-8 font-mono text-sm text-text-secondary">
          {noResultsLabel}
        </p>
      ) : (
        <div className="space-y-6">
          {filtered.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </>
  );
}
