/**
 * @vitest-environment happy-dom
 */
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import ReadingProgress from "../ReadingProgress";

function setScroll(scrollY: number, docHeight: number) {
  Object.defineProperty(window, "scrollY", { value: scrollY, writable: true });
  Object.defineProperty(window, "innerHeight", {
    value: 800,
    writable: true,
  });
  Object.defineProperty(document.documentElement, "scrollHeight", {
    value: docHeight + 800,
    writable: true,
    configurable: true,
  });
}

beforeEach(() => {
  setScroll(0, 1000);
});

describe("ReadingProgress", () => {
  it("renders a progressbar element", () => {
    render(<ReadingProgress />);
    expect(screen.getByRole("progressbar")).toBeTruthy();
  });

  it("has correct aria attributes", () => {
    render(<ReadingProgress />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    expect(bar).toHaveAttribute("aria-label", "Reading progress");
  });

  it("starts at 0% progress when at top of page", () => {
    setScroll(0, 1000);
    render(<ReadingProgress />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "0"
    );
  });

  it("shows 50% progress when scrolled halfway", () => {
    setScroll(500, 1000);
    render(<ReadingProgress />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "50"
    );
  });

  it("shows 100% progress when scrolled to bottom", () => {
    setScroll(1000, 1000);
    render(<ReadingProgress />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100"
    );
  });

  it("clamps progress to 100% if scrollY exceeds docHeight", () => {
    setScroll(1200, 1000);
    render(<ReadingProgress />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100"
    );
  });

  it("updates progress on scroll event", () => {
    setScroll(0, 1000);
    render(<ReadingProgress />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "0");

    act(() => {
      setScroll(250, 1000);
      window.dispatchEvent(new Event("scroll"));
    });

    expect(bar).toHaveAttribute("aria-valuenow", "25");
  });

  it("updates progress on resize event", () => {
    setScroll(500, 1000);
    render(<ReadingProgress />);

    act(() => {
      Object.defineProperty(window, "innerHeight", {
        value: 400,
        writable: true,
      });
      Object.defineProperty(document.documentElement, "scrollHeight", {
        value: 2400,
        writable: true,
        configurable: true,
      });
      window.dispatchEvent(new Event("resize"));
    });

    const bar = screen.getByRole("progressbar");
    expect(Number(bar.getAttribute("aria-valuenow"))).toBeGreaterThan(0);
  });

  it("handles case when document is shorter than viewport", () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      value: 500,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, "innerHeight", {
      value: 800,
      writable: true,
    });
    render(<ReadingProgress />);
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "100"
    );
  });

  it("uses CSS variable for background color", () => {
    render(<ReadingProgress />);
    const bar = screen.getByRole("progressbar");
    expect(bar.getAttribute("style")).toContain(
      "background-color: var(--text-accent)"
    );
  });

  it("has fixed positioning at top of viewport", () => {
    render(<ReadingProgress />);
    const bar = screen.getByRole("progressbar");
    const style = bar.getAttribute("style") ?? "";
    expect(style).toContain("position: fixed");
    expect(style).toContain("top: 0px");
  });
});
