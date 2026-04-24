/**
 * @vitest-environment happy-dom
 */
import { render, screen, act } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import ReadingProgress from "@/components/ReadingProgress";

const messages = { blog: { readingProgress: "Reading progress" } };

function renderWithIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

function setScrollState({
  scrollY,
  scrollHeight,
  innerHeight,
}: {
  scrollY: number;
  scrollHeight: number;
  innerHeight: number;
}) {
  Object.defineProperty(window, "scrollY", { value: scrollY, writable: true });
  Object.defineProperty(window, "innerHeight", {
    value: innerHeight,
    writable: true,
  });
  Object.defineProperty(document.documentElement, "scrollHeight", {
    value: scrollHeight,
    writable: true,
    configurable: true,
  });
}

describe("ReadingProgress", () => {
  beforeEach(() => {
    setScrollState({ scrollY: 0, scrollHeight: 1000, innerHeight: 500 });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a progressbar element", () => {
    renderWithIntl(<ReadingProgress />);
    expect(screen.getByRole("progressbar")).toBeTruthy();
  });

  it("has correct aria attributes", () => {
    renderWithIntl(<ReadingProgress />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    expect(bar).toHaveAttribute("aria-label", messages.blog.readingProgress);
  });

  it("starts at 0% progress when at top of page", () => {
    setScrollState({ scrollY: 0, scrollHeight: 1000, innerHeight: 500 });
    renderWithIntl(<ReadingProgress />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "0");
    expect(bar.style.width).toBe("0%");
  });

  it("shows 50% progress when scrolled halfway", () => {
    setScrollState({ scrollY: 250, scrollHeight: 1000, innerHeight: 500 });
    renderWithIntl(<ReadingProgress />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "50");
  });

  it("shows 100% progress when scrolled to bottom", () => {
    setScrollState({ scrollY: 500, scrollHeight: 1000, innerHeight: 500 });
    renderWithIntl(<ReadingProgress />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "100");
  });

  it("clamps progress to 100% if scrollY exceeds docHeight", () => {
    setScrollState({ scrollY: 600, scrollHeight: 1000, innerHeight: 500 });
    renderWithIntl(<ReadingProgress />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "100");
  });

  it("updates progress on scroll event", () => {
    setScrollState({ scrollY: 0, scrollHeight: 1000, innerHeight: 500 });
    renderWithIntl(<ReadingProgress />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "0");

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 250, writable: true });
      window.dispatchEvent(new Event("scroll"));
    });

    expect(bar).toHaveAttribute("aria-valuenow", "50");
  });

  it("updates progress on resize event", () => {
    setScrollState({ scrollY: 250, scrollHeight: 1000, innerHeight: 500 });
    renderWithIntl(<ReadingProgress />);

    act(() => {
      Object.defineProperty(window, "innerHeight", {
        value: 600,
        writable: true,
      });
      window.dispatchEvent(new Event("resize"));
    });

    const bar = screen.getByRole("progressbar");
    // After resize: docHeight = 1000 - 600 = 400, progress = 250/400 = 62.5%
    expect(Number(bar.getAttribute("aria-valuenow"))).toBeGreaterThan(50);
  });

  it("handles case when document is shorter than viewport", () => {
    setScrollState({ scrollY: 0, scrollHeight: 400, innerHeight: 500 });
    renderWithIntl(<ReadingProgress />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "0");
    expect(bar.style.width).toBe("0%");
  });

  it("uses CSS variable for background color", () => {
    renderWithIntl(<ReadingProgress />);
    const bar = screen.getByRole("progressbar");
    expect(bar.style.backgroundColor).toBe("var(--text-accent)");
  });

  it("has fixed positioning at top of viewport", () => {
    renderWithIntl(<ReadingProgress />);
    const bar = screen.getByRole("progressbar");
    expect(bar.style.position).toBe("fixed");
    expect(bar.style.top).toBe("0px");
    expect(bar.style.left).toBe("0px");
    expect(bar.style.height).toBe("4px");
  });
});
