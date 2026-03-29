/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import Projects from "../Projects";
import caMessages from "@/i18n/messages/ca.json";
import enMessages from "@/i18n/messages/en.json";

// Mock useTranslations for server component
vi.mock("next-intl", async () => {
  const actual = await vi.importActual("next-intl");
  return {
    ...actual,
    useTranslations: (namespace: string) => {
      const messages = caMessages as Record<string, unknown>;
      const ns = messages[namespace] as Record<string, unknown>;
      const t = (key: string) => {
        const keys = key.split(".");
        let value: unknown = ns;
        for (const k of keys) {
          value = (value as Record<string, unknown>)[k];
        }
        return value as string;
      };
      t.raw = (key: string) => {
        const keys = key.split(".");
        let value: unknown = ns;
        for (const k of keys) {
          value = (value as Record<string, unknown>)[k];
        }
        return value;
      };
      return t;
    },
  };
});

function renderProjects(locale: "ca" | "en" = "ca") {
  const messages = locale === "ca" ? caMessages : enMessages;
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <Projects />
    </NextIntlClientProvider>
  );
}

describe("Projects", () => {
  it("renders the section heading", () => {
    renderProjects();
    expect(screen.getByRole("heading", { level: 2, name: caMessages.projects.heading })).toBeInTheDocument();
  });

  it("renders all project cards", () => {
    renderProjects();
    const projectItems = caMessages.projects.items;
    projectItems.forEach((project) => {
      expect(screen.getByText(project.title)).toBeInTheDocument();
    });
  });

  it("renders project descriptions", () => {
    renderProjects();
    const firstProject = caMessages.projects.items[0];
    expect(screen.getByText(firstProject.description)).toBeInTheDocument();
  });

  it("renders tech stack badges for each project", () => {
    renderProjects();
    const firstProject = caMessages.projects.items[0];
    firstProject.tags.forEach((tag) => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it("renders featured badge for highlighted projects", () => {
    renderProjects();
    const highlightedProjects = caMessages.projects.items.filter((p) => p.highlight);
    expect(highlightedProjects.length).toBeGreaterThan(0);
    // Check that featured badge text exists
    expect(screen.getByText(caMessages.projects.featured)).toBeInTheDocument();
  });

  it("renders live link for projects with url", () => {
    renderProjects();
    const projectWithUrl = caMessages.projects.items.find((p) => p.url);
    if (projectWithUrl) {
      const links = screen.getAllByRole("link", { name: new RegExp(caMessages.projects.liveLink) });
      expect(links.length).toBeGreaterThan(0);
      expect(links[0]).toHaveAttribute("href", projectWithUrl.url);
      expect(links[0]).toHaveAttribute("target", "_blank");
      expect(links[0]).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("renders repo link for projects with repo", () => {
    renderProjects();
    const projectWithRepo = caMessages.projects.items.find((p) => p.repo);
    if (projectWithRepo) {
      const links = screen.getAllByRole("link", { name: new RegExp(caMessages.projects.repoLink) });
      expect(links.length).toBeGreaterThan(0);
      expect(links[0]).toHaveAttribute("href", projectWithRepo.repo);
      expect(links[0]).toHaveAttribute("target", "_blank");
    }
  });

  it("has correct section id for navigation", () => {
    const { container } = renderProjects();
    const section = container.querySelector("#projects");
    expect(section).toBeInTheDocument();
  });

  it("applies highlight styling to featured projects", () => {
    const { container } = renderProjects();
    // Featured projects should have border-text-accent class
    const highlightedCards = container.querySelectorAll(".border-text-accent");
    const highlightedProjects = caMessages.projects.items.filter((p) => p.highlight);
    expect(highlightedCards.length).toBe(highlightedProjects.length);
  });
});

describe("Projects translations", () => {
  it("projects namespace has the same keys across all locales", () => {
    const caProjectsKeys = Object.keys(caMessages.projects).sort();
    const enProjectsKeys = Object.keys(enMessages.projects).sort();
    expect(enProjectsKeys).toEqual(caProjectsKeys);
  });

  it("all locales have the same number of project items", () => {
    expect(enMessages.projects.items.length).toBe(caMessages.projects.items.length);
  });

  it("each project has required fields", () => {
    const requiredFields = ["title", "description", "tags"];
    caMessages.projects.items.forEach((project, index) => {
      requiredFields.forEach((field) => {
        expect(project).toHaveProperty(field);
      });
      expect(Array.isArray(project.tags)).toBe(true);
    });
  });
});
