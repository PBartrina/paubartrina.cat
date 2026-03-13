/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../theme";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Simple component to surface theme context values */
function ThemeConsumer() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={toggleTheme}>toggle</button>
    </div>
  );
}

function renderWithProvider(initialStorage: string | null = null) {
  if (initialStorage !== null) {
    localStorage.setItem("theme", initialStorage);
  } else {
    localStorage.removeItem("theme");
  }

  return render(
    <ThemeProvider>
      <ThemeConsumer />
    </ThemeProvider>
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-theme");
    // Reset matchMedia mock to default (light preference)
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("defaults to light theme when localStorage is empty and system prefers light", async () => {
    renderWithProvider(null);
    await act(async () => {});
    expect(screen.getByTestId("theme").textContent).toBe("light");
  });

  it("reads persisted theme from localStorage", async () => {
    renderWithProvider("dark");
    await act(async () => {});
    expect(screen.getByTestId("theme").textContent).toBe("dark");
  });

  it("applies data-theme attribute to documentElement on mount", async () => {
    renderWithProvider("dark");
    await act(async () => {});
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("toggles from light to dark", async () => {
    renderWithProvider("light");
    await act(async () => {});

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    });

    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("toggles from dark to light", async () => {
    renderWithProvider("dark");
    await act(async () => {});

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    });

    expect(screen.getByTestId("theme").textContent).toBe("light");
    expect(localStorage.getItem("theme")).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("persists new theme to localStorage after multiple toggles", async () => {
    renderWithProvider(null);
    await act(async () => {});

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    });
    expect(localStorage.getItem("theme")).toBe("dark");

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    });
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("respects system dark mode preference when no localStorage value", async () => {
    // Mock system preference for dark mode
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    renderWithProvider(null);
    await act(async () => {});
    expect(screen.getByTestId("theme").textContent).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("renders children immediately without waiting for mount", () => {
    // This test verifies there's no flash/delay in rendering children
    const { container } = render(
      <ThemeProvider>
        <div data-testid="child-content">Hello</div>
      </ThemeProvider>
    );
    // Children should be rendered immediately
    expect(screen.getByTestId("child-content")).toBeInTheDocument();
    expect(container.textContent).toContain("Hello");
  });

  it("provides context immediately to children", () => {
    // Verify that useTheme works immediately, no mounted guard
    renderWithProvider("light");
    // The theme should be readable immediately
    expect(screen.getByTestId("theme")).toBeInTheDocument();
  });
});

describe("useTheme outside provider", () => {
  it("returns default values when used outside ThemeProvider", () => {
    function StandaloneConsumer() {
      const { theme, toggleTheme } = useTheme();
      return (
        <div>
          <span data-testid="theme">{theme}</span>
          <button onClick={toggleTheme}>toggle</button>
        </div>
      );
    }

    render(<StandaloneConsumer />);
    expect(screen.getByTestId("theme").textContent).toBe("light");
    // toggleTheme should be a no-op, not throw
    expect(() => {
      fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    }).not.toThrow();
  });
});
