import { Link } from "@/i18n/navigation";
import type { LogEntry as Entry } from "@/lib/log";

function formatDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(iso)
  );
}

/** One row of the log: an essay (highlighted) or a merged PR (compact). */
export default function LogEntry({
  entry,
  locale,
  essayLabel,
  headingLevel: Heading = "h2",
}: {
  entry: Entry;
  locale: string;
  essayLabel: string;
  /** h2 directly under a page h1 (/log); h3 inside a titled section (home). */
  headingLevel?: "h2" | "h3";
}) {
  const date = (
    <time dateTime={entry.date} className="font-mono text-xs text-text-secondary">
      {formatDate(entry.date, locale)}
    </time>
  );

  if (entry.kind === "essay") {
    return (
      <li className="grid gap-1 py-5 sm:grid-cols-[7rem_1fr] sm:gap-6">
        {date}
        <div>
          <span className="mb-1 inline-block rounded-full border border-text-accent px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-wide text-text-accent">
            {essayLabel}
          </span>
          <Heading className="font-display text-2xl font-bold text-text-primary">
            <Link href={entry.href} className="hover:underline">
              {entry.title}
            </Link>
          </Heading>
          {entry.description && <p className="mt-1 text-text-secondary">{entry.description}</p>}
        </div>
      </li>
    );
  }

  return (
    <li className="grid gap-1 py-3 sm:grid-cols-[7rem_1fr] sm:gap-6">
      {date}
      <div>
        <a
          href={entry.href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-sm text-text-primary hover:underline"
        >
          {entry.title}
          <span className="ml-2 text-text-secondary">#{entry.number}</span>
        </a>
        {entry.note && <p className="mt-1 text-sm italic text-text-secondary">{entry.note}</p>}
      </div>
    </li>
  );
}

export const entryKey = (entry: Entry) =>
  entry.kind === "pr" ? `pr-${entry.number}` : `essay-${entry.href}`;
