import { Link } from "@/i18n/navigation";
import type { BlogPostMeta } from "@/lib/blog";

export default function BlogCard({ post }: { post: BlogPostMeta }) {
  return (
    <article className="rounded-lg border border-card-border bg-card-bg p-6 transition-shadow hover:shadow-lg">
      <Link href={`/blog/${post.slug}`}>
        <h2 className="mb-2 font-mono text-xl font-bold text-text-primary hover:text-text-accent">
          {post.title}
        </h2>
      </Link>
      <div className="mb-3 flex flex-wrap gap-3 font-mono text-xs text-text-secondary">
        <time>{post.date}</time>
        <span>{post.readingTime}</span>
      </div>
      <p className="mb-4 font-mono text-sm text-text-secondary">
        {post.description}
      </p>
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border-color px-3 py-1 font-mono text-xs text-text-secondary"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
