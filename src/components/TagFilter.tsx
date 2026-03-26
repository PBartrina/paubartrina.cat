"use client";

import { useRouter, usePathname } from "next/navigation";

interface TagFilterProps {
  allTags: string[];
  allTagsLabel: string;
  selectedTag?: string;
}

export default function TagFilter({
  allTags,
  allTagsLabel,
  selectedTag,
}: TagFilterProps) {
  const router = useRouter();
  const pathname = usePathname();

  function select(tag: string | null) {
    const params = new URLSearchParams();
    if (tag) params.set("tag", tag);
    router.push(params.size ? `${pathname}?${params}` : pathname);
  }

  if (allTags.length === 0) return null;

  return (
    <div className="mb-8 flex flex-wrap gap-2" aria-label="Filter by tag">
      <button
        onClick={() => select(null)}
        className={`rounded-full border px-3 py-1 font-mono text-xs transition-colors ${
          !selectedTag
            ? "border-text-accent bg-text-accent text-bg-primary"
            : "border-border-color text-text-secondary hover:border-text-accent hover:text-text-accent"
        }`}
      >
        {allTagsLabel}
      </button>
      {allTags.map((tag) => (
        <button
          key={tag}
          onClick={() => select(selectedTag === tag ? null : tag)}
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
  );
}
