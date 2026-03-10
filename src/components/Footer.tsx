import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const socialLinks = [
  { href: "https://bsky.app/profile/paubartrina.cat", label: "Bluesky" },
  { href: "https://linkedin.com/in/paubartrina", label: "LinkedIn" },
  { href: "https://github.com/PBartrina", label: "GitHub" },
];

export default function Footer() {
  const t = useTranslations("footer");

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
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-bg-dark-secondary pt-6 text-center font-mono text-sm text-text-secondary">
          &copy; {new Date().getFullYear()} Pau Bartrina.{" "}
          {t("copyright")}
        </div>
      </div>
    </footer>
  );
}
