"use client";

import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "Sobre Mi" },
  { href: "/#experience", label: "Trajectòria" },
  { href: "/ara", label: "Ara" },
  { href: "/blog", label: "Blog" },
  { href: "/contacte", label: "Contacte" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-bg-dark text-text-on-dark">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-1.5 font-display text-xl font-bold">
          <span className="font-mono text-lg text-text-on-dark">&lt;/&gt;</span>
          <div>
            <span className="text-text-on-dark">Pau</span>
            <span className="text-text-accent">Bartrina</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden gap-8 font-mono text-sm md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-text-accent"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="flex flex-col gap-1.5 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`block h-0.5 w-6 bg-text-on-dark transition-transform ${menuOpen ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-6 bg-text-on-dark transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-6 bg-text-on-dark transition-transform ${menuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-bg-dark-secondary px-6 pb-4 md:hidden">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block py-2 font-mono text-sm transition-colors hover:text-text-accent"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
