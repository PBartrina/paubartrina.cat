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
  });

  it("defaults to light theme when localStorage is empty", async () => {
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
});

describe("useTheme outside ThemeProvider", () => {
  it("returns default context values (light, no-op toggle)", async () => {
    function Standalone() {
      const { theme, toggleTheme } = useTheme();
      return (
        <div>
          <span data-testid="theme">{theme}</span>
          <button onClick={toggleTheme}>toggle</button>
        </div>
      );
    }

    render(<Standalone />);
    expect(screen.getByTestId("theme").textContent).toBe("light");

    // Clicking should not throw
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    });
    expect(screen.getByTestId("theme").textContent).toBe("light");
  });
});
