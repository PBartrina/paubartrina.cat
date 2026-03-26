import BlogCard from "@/components/BlogCard";
import TagFilter from "@/components/TagFilter";
import type { BlogPostMeta } from "@/lib/blog";

interface BlogListProps {
  posts: BlogPostMeta[];
  allTagsLabel: string;
  selectedTag?: string;
}

export default function BlogList({
  posts,
  allTagsLabel,
  selectedTag,
}: BlogListProps) {
  const allTags = Array.from(new Set(posts.flatMap((p) => p.tags))).sort();

  const filtered = selectedTag
    ? posts.filter((p) => p.tags.includes(selectedTag))
    : posts;

  return (
    <>
      <TagFilter
        allTags={allTags}
        allTagsLabel={allTagsLabel}
        selectedTag={selectedTag}
      />
      <div className="space-y-6">
        {filtered.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </>
  );
}
