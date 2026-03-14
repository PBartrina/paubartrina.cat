/**
 * @vitest-environment happy-dom
 */
import { describe, it, expect } from "vitest";
import caMessages from "@/i18n/messages/ca.json";
import esMessages from "@/i18n/messages/es.json";
import enMessages from "@/i18n/messages/en.json";

describe("Skip to content link translations", () => {
  it("ca.json has skipToContent key in nav namespace", () => {
    expect(caMessages.nav.skipToContent).toBe("Salta al contingut");
  });

  it("es.json has skipToContent key in nav namespace", () => {
    expect(esMessages.nav.skipToContent).toBe("Saltar al contenido");
  });

  it("en.json has skipToContent key in nav namespace", () => {
    expect(enMessages.nav.skipToContent).toBe("Skip to content");
  });

  it("all locales have the same nav keys including skipToContent", () => {
    const caNavKeys = Object.keys(caMessages.nav).sort();
    const esNavKeys = Object.keys(esMessages.nav).sort();
    const enNavKeys = Object.keys(enMessages.nav).sort();

    expect(esNavKeys).toEqual(caNavKeys);
    expect(enNavKeys).toEqual(caNavKeys);
    expect(caNavKeys).toContain("skipToContent");
  });
});
