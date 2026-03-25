import { describe, it, expect } from "vitest";
import { slugify, safeJsonLd } from "../utils";

describe("slugify", () => {
  it("lowercases the string", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("replaces spaces with hyphens", () => {
    expect(slugify("foo bar baz")).toBe("foo-bar-baz");
  });

  it("strips diacritics", () => {
    expect(slugify("Àlbum de Fotos")).toBe("album-de-fotos");
    expect(slugify("Ça va très bien")).toBe("ca-va-tres-bien");
    expect(slugify("Über die Brücke")).toBe("uber-die-brucke");
  });

  it("strips Catalan diacritics", () => {
    expect(slugify("Història i Cultura")).toBe("historia-i-cultura");
    expect(slugify("Açò és un títol")).toBe("aco-es-un-titol");
    expect(slugify("Programació orientada a objectes")).toBe(
      "programacio-orientada-a-objectes"
    );
  });

  it("collapses multiple non-alphanumeric chars into a single hyphen", () => {
    expect(slugify("foo   bar")).toBe("foo-bar");
    expect(slugify("foo--bar")).toBe("foo-bar");
    expect(slugify("foo & bar!")).toBe("foo-bar");
  });

  it("strips leading and trailing hyphens", () => {
    expect(slugify("  hello  ")).toBe("hello");
    expect(slugify("!hello!")).toBe("hello");
  });

  it("handles already-slug strings", () => {
    expect(slugify("my-post-title")).toBe("my-post-title");
  });

  it("handles numbers", () => {
    expect(slugify("10 tips for 2024")).toBe("10-tips-for-2024");
  });

  it("returns empty string for empty input", () => {
    expect(slugify("")).toBe("");
  });

  it("returns empty string for all-punctuation input", () => {
    expect(slugify("!@#$%^&*()")).toBe("");
  });
});

describe("safeJsonLd", () => {
  it("serialises a plain object to JSON", () => {
    const result = safeJsonLd({ "@type": "Person", name: "Pau" });
    expect(JSON.parse(result)).toEqual({ "@type": "Person", name: "Pau" });
  });

  it("escapes < to prevent </script> breakout", () => {
    const result = safeJsonLd({ title: "</script><script>alert(1)</script>" });
    expect(result).not.toContain("</script>");
    expect(result).toContain("\\u003c");
  });

  it("round-trips correctly after unescaping", () => {
    const obj = { headline: "A <em>great</em> post" };
    const escaped = safeJsonLd(obj);
    expect(JSON.parse(escaped)).toEqual(obj);
  });
});
