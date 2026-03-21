"use client";

import { useState } from "react";
import BlogCard from "@/components/BlogCard";
import type { BlogPostMeta } from "@/lib/blog";

interface BlogListProps {
  posts: BlogPostMeta[];
  allTagsLabel: string;
}

export default function BlogList({ posts, allTagsLabel }: BlogListProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = Array.from(
    new Set(posts.flatMap((p) => p.tags))
  ).sort();

  const filtered = selectedTag
    ? posts.filter((p) => p.tags.includes(selectedTag))
    : posts;

  return (
    <>
      {allTags.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2" aria-label="Filter by tag">
          <button
            onClick={() => setSelectedTag(null)}
            className={`rounded-full border px-3 py-1 font-mono text-xs transition-colors ${
              selectedTag === null
                ? "border-text-accent bg-text-accent text-bg-primary"
                : "border-border-color text-text-secondary hover:border-text-accent hover:text-text-accent"
            }`}
          >
            {allTagsLabel}
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`rounded-full border px-3 py-1 font-mono text-xs transition-colors ${
                selectedTag === tag
                  ? "border-text-accent bg-text-accent text-bg-primary"
                  : "border-border-color text-text-secondary hover:border-text-accent hover:text-text-accent"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      <div className="space-y-6">
        {filtered.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </>
  );
}
