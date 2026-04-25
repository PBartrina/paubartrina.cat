"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

type FormState = "idle" | "sending" | "success" | "error";

const KNOWN_API_ERRORS = [
  "errorRateLimit",
  "errorInvalidRequest",
  "errorNameRequired",
  "errorEmailInvalid",
  "errorMessageRequired",
  "errorServerConfig",
  "errorSendFailed",
] as const;
type ApiErrorCode = (typeof KNOWN_API_ERRORS)[number];

function isKnownError(code: string): code is ApiErrorCode {
  return (KNOWN_API_ERRORS as readonly string[]).includes(code);
}

const inputClass =
  "w-full rounded-md border border-card-border bg-bg-primary px-4 py-3 font-mono text-sm text-text-primary placeholder-text-secondary focus:border-text-accent focus:outline-none focus:ring-1 focus:ring-text-accent transition-colors";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const t = useTranslations("contact");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, website: honeypot }),
      });

      const data = (await res.json()) as { success?: boolean; error?: string };

      if (res.ok && data.success) {
        setState("success");
      } else {
        const code = data.error ?? "";
        setErrorMsg(isKnownError(code) ? t(code) : t("errorUnknown"));
        setState("error");
      }
    } catch {
      setErrorMsg(t("errorNetwork"));
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="flex flex-col items-center gap-4 py-8 text-center">
        <span className="text-4xl text-green-500">&#10003;</span>
        <p className="font-mono text-lg font-bold text-green-500">
          {t("successHeading")}
        </p>
        <p className="font-mono text-sm text-text-secondary">
          {t("successMessage")}
        </p>
        <button
          onClick={() => {
            setState("idle");
            setName("");
            setEmail("");
            setMessage("");
          }}
          className="mt-2 font-mono text-sm text-text-accent hover:underline"
        >
          {t("sendAnother")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {/* Honeypot — hidden from humans, bots auto-fill it */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-96 opacity-0"
      >
        <label htmlFor="website">{t("honeypotLabel")}</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block font-mono text-sm text-text-secondary"
        >
          {t("nameLabel")} <span className="text-text-accent">*</span>
        </label>
        <input
          id="name"
          type="text"
          required
          maxLength={100}
          placeholder={t("namePlaceholder")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          disabled={state === "sending"}
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block font-mono text-sm text-text-secondary"
        >
          {t("emailLabel")} <span className="text-text-accent">*</span>
        </label>
        <input
          id="email"
          type="email"
          required
          placeholder={t("emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          disabled={state === "sending"}
        />
      </div>

      <div>
        <label
          htmlFor="message"
          className="mb-1.5 block font-mono text-sm text-text-secondary"
        >
          {t("messageLabel")} <span className="text-text-accent">*</span>
        </label>
        <textarea
          id="message"
          required
          maxLength={2000}
          rows={6}
          placeholder={t("messagePlaceholder")}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className={`${inputClass} resize-y`}
          disabled={state === "sending"}
        />
        <p className="mt-1 text-right font-mono text-xs text-text-secondary">
          {message.length}/2000
        </p>
      </div>

      {state === "error" && (
        <p className="font-mono text-sm text-red-500">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={state === "sending"}
        className="w-full rounded-md bg-bg-dark px-6 py-3 font-mono text-sm font-bold text-text-on-dark transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {state === "sending" ? t("sendingText") : t("submitText")}
      </button>
    </form>
  );
}
