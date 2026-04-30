import { getTranslations, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getLastCommitDate, formatCommitDate } from "@/lib/git";

const socialLinks = [
  { href: "https://bsky.app/profile/paubartrina.cat", label: "Bluesky" },
  { href: "https://linkedin.com/in/paubartrina", label: "LinkedIn" },
  { href: "https://github.com/PBartrina", label: "GitHub" },
];

export default async function Footer() {
  const t = await getTranslations("footer");
  const locale = await getLocale();

  const rawDate = getLastCommitDate();
  const lastUpdated = rawDate ? formatCommitDate(rawDate, locale) : null;

  return (
    <footer id="contact" className="bg-bg-dark text-text-on-dark">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col justify-between gap-8 md:flex-row">
          <div>
            <h3 className="mb-2 font-mono text-lg font-bold">
              {t("contactHeading")}
            </h3>
            <Link
              href="/contacte"
              className="inline-block rounded-md border border-text-on-dark px-4 py-2 font-mono text-sm transition-colors hover:border-text-accent hover:text-text-accent"
            >
              {t("sendMessage")}
            </Link>
          </div>

          <div>
            <h3 className="mb-2 font-mono text-lg font-bold">
              {t("followHeading")}
            </h3>
            <div className="flex gap-3">
              {socialLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-text-on-dark px-4 py-2 font-mono text-sm transition-colors hover:border-text-accent hover:text-text-accent"
                >
                  {link.label}
                </a>
              ))}
              <a
                href={`/${locale}/blog/feed.xml`}
                aria-label={t("rssLabel")}
                className="rounded-md border border-text-on-dark px-4 py-2 font-mono text-sm transition-colors hover:border-text-accent hover:text-text-accent"
              >
                <span aria-hidden="true">📡</span>
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-bg-dark-secondary pt-6 text-center font-mono text-sm text-text-secondary">
          <p>
            &copy; {new Date().getFullYear()} Pau Bartrina.{" "}
            {t("copyright")}
          </p>
          {lastUpdated && (
            <p className="mt-1 text-xs opacity-60">
              {t("lastUpdated", { date: lastUpdated })}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
