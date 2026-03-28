import { describe, it, expect } from "vitest";
import { locales, defaultLocale } from "../config";
import caMessages from "../messages/ca.json";
import esMessages from "../messages/es.json";
import enMessages from "../messages/en.json";

describe("i18n config", () => {
  it("locales contains exactly ca, es, en", () => {
    expect(locales).toEqual(["ca", "es", "en"]);
  });

  it("defaultLocale is ca", () => {
    expect(defaultLocale).toBe("ca");
  });
});

describe("translation JSON files", () => {
  const allMessages = { ca: caMessages, es: esMessages, en: enMessages };

  it("all locale files have the same top-level keys", () => {
    const caKeys = Object.keys(caMessages).sort();
    const esKeys = Object.keys(esMessages).sort();
    const enKeys = Object.keys(enMessages).sort();

    expect(esKeys).toEqual(caKeys);
    expect(enKeys).toEqual(caKeys);
  });

  it("all locale files parse as valid objects", () => {
    for (const [locale, messages] of Object.entries(allMessages)) {
      expect(typeof messages).toBe("object");
      expect(messages).not.toBeNull();
      expect(
        Object.keys(messages).length,
        `${locale}.json should have keys`
      ).toBeGreaterThan(0);
    }
  });

  it("metadata namespace has the same keys across all locales", () => {
    const caMetaKeys = Object.keys(caMessages.metadata).sort();
    const esMetaKeys = Object.keys(esMessages.metadata).sort();
    const enMetaKeys = Object.keys(enMessages.metadata).sort();

    expect(esMetaKeys).toEqual(caMetaKeys);
    expect(enMetaKeys).toEqual(caMetaKeys);
  });

  it("nav namespace has the same keys across all locales", () => {
    const caNavKeys = Object.keys(caMessages.nav).sort();
    const esNavKeys = Object.keys(esMessages.nav).sort();
    const enNavKeys = Object.keys(enMessages.nav).sort();

    expect(esNavKeys).toEqual(caNavKeys);
    expect(enNavKeys).toEqual(caNavKeys);
  });

  it("contact namespace has the same keys across all locales", () => {
    const caContactKeys = Object.keys(caMessages.contact).sort();
    const esContactKeys = Object.keys(esMessages.contact).sort();
    const enContactKeys = Object.keys(enMessages.contact).sort();

    expect(esContactKeys).toEqual(caContactKeys);
    expect(enContactKeys).toEqual(caContactKeys);
  });

  it("skills categories have the same length across locales", () => {
    expect(esMessages.skills.categories.length).toBe(
      caMessages.skills.categories.length
    );
    expect(enMessages.skills.categories.length).toBe(
      caMessages.skills.categories.length
    );
  });

  it("experience jobs have the same length across locales", () => {
    expect(esMessages.experience.jobs.length).toBe(
      caMessages.experience.jobs.length
    );
    expect(enMessages.experience.jobs.length).toBe(
      caMessages.experience.jobs.length
    );
  });

  it("education entries have the same length across locales", () => {
    expect(esMessages.education.entries.length).toBe(
      caMessages.education.entries.length
    );
    expect(enMessages.education.entries.length).toBe(
      caMessages.education.entries.length
    );
  });

  it("projects namespace has the same keys across all locales", () => {
    const caProjectsKeys = Object.keys(caMessages.projects).sort();
    const esProjectsKeys = Object.keys(esMessages.projects).sort();
    const enProjectsKeys = Object.keys(enMessages.projects).sort();

    expect(esProjectsKeys).toEqual(caProjectsKeys);
    expect(enProjectsKeys).toEqual(caProjectsKeys);
  });

  it("projects items have the same length across locales", () => {
    expect(esMessages.projects.items.length).toBe(
      caMessages.projects.items.length
    );
    expect(enMessages.projects.items.length).toBe(
      caMessages.projects.items.length
    );
  });
});
