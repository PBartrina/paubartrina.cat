"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "./LanguageSwitcher";

const navLinks = [
  { href: "/", labelKey: "home" },
  { href: "/#about", labelKey: "about" },
  { href: "/#projects", labelKey: "projects" },
  { href: "/#experience", labelKey: "experience" },
  { href: "/ara", labelKey: "now" },
  { href: "/uses", labelKey: "uses" },
  { href: "/blog", labelKey: "blog" },
  { href: "/contacte", labelKey: "contact" },
] as const;

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const t = useTranslations("nav");

  return (
    <nav className="sticky top-0 z-50 bg-bg-dark text-text-on-dark">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 font-display text-xl font-bold"
        >
          <span className="font-mono text-lg text-text-on-dark">
            &lt;/&gt;
          </span>
          <div>
            <span className="text-text-on-dark">Pau</span>
            <span className="text-text-accent">Bartrina</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-8 font-mono text-sm md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-text-accent"
            >
              {t(link.labelKey)}
            </Link>
          ))}
          <LanguageSwitcher />
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex flex-col gap-1.5 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label={t("toggleMenu")}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          <span
            aria-hidden="true"
            className={`block h-0.5 w-6 bg-text-on-dark transition-transform ${menuOpen ? "translate-y-2 rotate-45" : ""}`}
          />
          <span
            aria-hidden="true"
            className={`block h-0.5 w-6 bg-text-on-dark transition-opacity ${menuOpen ? "opacity-0" : ""}`}
          />
          <span
            aria-hidden="true"
            className={`block h-0.5 w-6 bg-text-on-dark transition-transform ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div id="mobile-menu" className="border-t border-bg-dark-secondary px-6 pb-4 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 font-mono text-sm transition-colors hover:text-text-accent"
              onClick={() => setMenuOpen(false)}
            >
              {t(link.labelKey)}
            </Link>
          ))}
          <div className="pt-2">
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </nav>
  );
}
