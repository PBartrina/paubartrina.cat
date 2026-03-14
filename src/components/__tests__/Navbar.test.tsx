/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import Navbar from "../Navbar";
import caMessages from "@/i18n/messages/ca.json";

// Mock the navigation module
vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  usePathname: () => "/",
  useRouter: () => ({ replace: vi.fn() }),
}));

function renderNavbar() {
  return render(
    <NextIntlClientProvider locale="ca" messages={caMessages}>
      <Navbar />
    </NextIntlClientProvider>
  );
}

describe("Navbar", () => {
  it("renders the brand logo link", () => {
    renderNavbar();
    expect(screen.getByRole("link", { name: /Pau.*Bartrina/i })).toBeInTheDocument();
  });

  it("renders navigation links on desktop", () => {
    renderNavbar();
    expect(screen.getByRole("link", { name: caMessages.nav.home })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: caMessages.nav.blog })).toBeInTheDocument();
  });

  describe("hamburger button accessibility", () => {
    it("has aria-label for screen readers", () => {
      renderNavbar();
      const hamburger = screen.getByRole("button", { name: caMessages.nav.toggleMenu });
      expect(hamburger).toBeInTheDocument();
    });

    it("has aria-expanded set to false initially", () => {
      renderNavbar();
      const hamburger = screen.getByRole("button", { name: caMessages.nav.toggleMenu });
      expect(hamburger).toHaveAttribute("aria-expanded", "false");
    });

    it("has aria-expanded set to true when menu is open", () => {
      renderNavbar();
      const hamburger = screen.getByRole("button", { name: caMessages.nav.toggleMenu });
      fireEvent.click(hamburger);
      expect(hamburger).toHaveAttribute("aria-expanded", "true");
    });

    it("has aria-controls pointing to mobile-menu", () => {
      renderNavbar();
      const hamburger = screen.getByRole("button", { name: caMessages.nav.toggleMenu });
      expect(hamburger).toHaveAttribute("aria-controls", "mobile-menu");
    });

    it("decorative spans have aria-hidden attribute", () => {
      renderNavbar();
      const hamburger = screen.getByRole("button", { name: caMessages.nav.toggleMenu });
      const spans = hamburger.querySelectorAll("span");
      expect(spans).toHaveLength(3);
      spans.forEach((span) => {
        expect(span).toHaveAttribute("aria-hidden", "true");
      });
    });
  });

  describe("mobile menu", () => {
    it("mobile menu has id for aria-controls reference", () => {
      renderNavbar();
      const hamburger = screen.getByRole("button", { name: caMessages.nav.toggleMenu });
      fireEvent.click(hamburger);
      const mobileMenu = document.getElementById("mobile-menu");
      expect(mobileMenu).toBeInTheDocument();
    });

    it("mobile menu is not visible when closed", () => {
      renderNavbar();
      const mobileMenu = document.getElementById("mobile-menu");
      expect(mobileMenu).not.toBeInTheDocument();
    });
  });
});
