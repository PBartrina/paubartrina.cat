/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, act, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import ContactForm from "../ContactForm";
import caMessages from "@/i18n/messages/ca.json";

// ─── fetch mock ──────────────────────────────────────────────────────────────

function mockFetch(status: number, body: object) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function renderForm() {
  return render(
    <NextIntlClientProvider locale="ca" messages={caMessages}>
      <ContactForm />
    </NextIntlClientProvider>
  );
}

/** Fill the visible form fields and submit via the form's submit event. */
async function fillAndSubmit(
  container: HTMLElement,
  overrides: { name?: string; email?: string; message?: string } = {}
) {
  const name = overrides.name ?? "Anna Garcia";
  const email = overrides.email ?? "anna@exemple.com";
  const message = overrides.message ?? "Hola, tinc una pregunta!";

  fireEvent.change(screen.getByLabelText(/Nom/), { target: { value: name } });
  fireEvent.change(screen.getByLabelText(/Correu/), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText(/Missatge/), {
    target: { value: message },
  });

  await act(async () => {
    fireEvent.submit(container.querySelector("form")!);
  });
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("ContactForm — initial render", () => {
  it("renders all visible form fields", () => {
    renderForm();

    expect(screen.getByLabelText(/Nom/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Correu/)).toBeInTheDocument();
    expect(screen.getByLabelText(/Missatge/)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Envia el missatge/ })
    ).toBeInTheDocument();
  });

  it("submit button is enabled initially", () => {
    renderForm();
    expect(
      screen.getByRole("button", { name: /Envia el missatge/ })
    ).not.toBeDisabled();
  });

  it("character counter starts at 0/2000", () => {
    renderForm();
    expect(screen.getByText("0/2000")).toBeInTheDocument();
  });

  it("updates character counter as user types in message", () => {
    renderForm();

    fireEvent.change(screen.getByLabelText(/Missatge/), {
      target: { value: "Hola" },
    });
    expect(screen.getByText("4/2000")).toBeInTheDocument();
  });
});

describe("ContactForm — successful submission", () => {
  beforeEach(() => {
    mockFetch(200, { success: true });
  });

  it("shows success state after successful submission", async () => {
    const { container } = renderForm();
    await fillAndSubmit(container);

    await waitFor(() => {
      expect(
        screen.getByText("Missatge enviat correctament!")
      ).toBeInTheDocument();
    });
  });

  it("shows retry button in success state", async () => {
    const { container } = renderForm();
    await fillAndSubmit(container);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Envia un altre missatge/ })
      ).toBeInTheDocument();
    });
  });

  it("resets to idle form when user clicks 'Envia un altre missatge'", async () => {
    const { container } = renderForm();
    await fillAndSubmit(container);

    await waitFor(() =>
      screen.getByRole("button", { name: /Envia un altre missatge/ })
    );

    await act(async () => {
      fireEvent.click(
        screen.getByRole("button", { name: /Envia un altre missatge/ })
      );
    });

    // Form should be back
    expect(
      screen.getByRole("button", { name: /Envia el missatge/ })
    ).toBeInTheDocument();
  });

  it("calls fetch with the correct payload", async () => {
    const { container } = renderForm();
    await fillAndSubmit(container, {
      name: "Joan",
      email: "joan@test.cat",
      message: "Pregunta de prova",
    });

    await waitFor(() =>
      screen.getByText("Missatge enviat correctament!")
    );

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/contact",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Joan",
          email: "joan@test.cat",
          message: "Pregunta de prova",
          website: "", // honeypot empty for real users
        }),
      })
    );
  });
});

describe("ContactForm — error states", () => {
  it("shows API error message on 400 response", async () => {
    mockFetch(400, { error: "errorEmailInvalid" });
    const { container } = renderForm();
    await fillAndSubmit(container);

    await waitFor(() => {
      expect(
        screen.getByText(caMessages.contact.errorEmailInvalid)
      ).toBeInTheDocument();
    });
  });

  it("shows API error message on 500 response", async () => {
    mockFetch(500, { error: "errorServerConfig" });
    const { container } = renderForm();
    await fillAndSubmit(container);

    await waitFor(() => {
      expect(
        screen.getByText(caMessages.contact.errorServerConfig)
      ).toBeInTheDocument();
    });
  });

  it("shows fallback error message when response has no error field", async () => {
    mockFetch(500, {});
    const { container } = renderForm();
    await fillAndSubmit(container);

    await waitFor(() => {
      expect(screen.getByText("Error desconegut.")).toBeInTheDocument();
    });
  });

  it("shows network error message when fetch rejects", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network failure"));
    const { container } = renderForm();
    await fillAndSubmit(container);

    await waitFor(() => {
      expect(
        screen.getByText(/No s.ha pogut connectar amb el servidor/)
      ).toBeInTheDocument();
    });
  });

  it("re-enables submit button after an error", async () => {
    mockFetch(500, { error: "errorSendFailed" });
    const { container } = renderForm();
    await fillAndSubmit(container);

    await waitFor(() =>
      screen.getByText(caMessages.contact.errorSendFailed)
    );

    expect(
      screen.getByRole("button", { name: /Envia el missatge/ })
    ).not.toBeDisabled();
  });
});

describe("ContactForm — sending state", () => {
  it("shows 'Enviant...' and disables button while sending", async () => {
    // Keep fetch pending so we can assert the sending state
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    const { container } = renderForm();

    fireEvent.change(screen.getByLabelText(/Nom/), {
      target: { value: "Test" },
    });
    fireEvent.change(screen.getByLabelText(/Correu/), {
      target: { value: "test@test.com" },
    });
    fireEvent.change(screen.getByLabelText(/Missatge/), {
      target: { value: "Test message" },
    });

    // Submit but don't await resolution — check intermediate state
    fireEvent.submit(container.querySelector("form")!);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Enviant/ })).toBeDisabled();
    });
  });
});
