import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Shared mock for resend.emails.send — replaced per-test where needed
const mockSend = vi.fn().mockResolvedValue({ data: { id: "test-id" }, error: null });

vi.mock("resend", () => {
  class MockResend {
    emails = { send: mockSend };
  }
  return { Resend: MockResend };
});

// Helper: build a POST NextRequest with a JSON body and optional IP
function makeRequest(
  body: Record<string, unknown>,
  ip = "1.2.3.4",
): NextRequest {
  return new NextRequest("http://localhost/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip,
    },
    body: JSON.stringify(body),
  });
}

const validBody = {
  name: "Pau Bartrina",
  email: "pau@example.com",
  message: "Hola, tinc una pregunta.",
  website: "",
};

describe("POST /api/contact", () => {
  beforeEach(() => {
    vi.resetModules();
    mockSend.mockResolvedValue({ data: { id: "test-id" }, error: null });
    vi.stubEnv("RESEND_API_KEY", "re_test_key");
    vi.stubEnv("CONTACT_EMAIL", "hola@paubartrina.cat");
  });

  it("returns 200 and success for a valid request", async () => {
    const { POST } = await import("../route");
    const res = await POST(makeRequest(validBody));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
  });

  it("silently returns 200 when the honeypot field is filled", async () => {
    const { POST } = await import("../route");
    const res = await POST(makeRequest({ ...validBody, website: "http://spam.com" }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
  });

  it("returns 400 when name is missing", async () => {
    const { POST } = await import("../route");
    const res = await POST(makeRequest({ ...validBody, name: "" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeTruthy();
  });

  it("returns 400 when name exceeds 100 characters", async () => {
    const { POST } = await import("../route");
    const res = await POST(makeRequest({ ...validBody, name: "a".repeat(101) }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when email is invalid", async () => {
    const { POST } = await import("../route");
    const res = await POST(makeRequest({ ...validBody, email: "not-an-email" }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeTruthy();
  });

  it("returns 400 when message is missing", async () => {
    const { POST } = await import("../route");
    const res = await POST(makeRequest({ ...validBody, message: "" }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when message exceeds 2000 characters", async () => {
    const { POST } = await import("../route");
    const res = await POST(makeRequest({ ...validBody, message: "a".repeat(2001) }));
    expect(res.status).toBe(400);
  });

  it("returns 400 for malformed JSON body", async () => {
    const { POST } = await import("../route");
    const req = new NextRequest("http://localhost/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-forwarded-for": "9.9.9.9" },
      body: "not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 429 after exceeding rate limit from the same IP", async () => {
    const { POST } = await import("../route");
    const ip = "5.5.5.5";
    for (let i = 0; i < 5; i++) {
      await POST(makeRequest(validBody, ip));
    }
    const res = await POST(makeRequest(validBody, ip));
    expect(res.status).toBe(429);
    const json = await res.json();
    expect(json.error).toBeTruthy();
  });

  it("escapes HTML in user-supplied fields to prevent XSS", async () => {
    mockSend.mockClear();
    const { POST } = await import("../route");
    const xssBody = {
      name: '<script>alert(1)</script>',
      email: "xss@example.com",
      message: '<img src=x onerror=alert(1)>',
      website: "",
    };
    await POST(makeRequest(xssBody, "10.10.10.10"));
    const sentHtml = mockSend.mock.calls[0][0].html;
    expect(sentHtml).not.toContain("<script>");
    expect(sentHtml).not.toContain("<img");
    expect(sentHtml).toContain("&lt;script&gt;");
    expect(sentHtml).toContain("&lt;img");
  });

  it("returns 500 when RESEND_API_KEY env var is missing", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const { POST } = await import("../route");
    const res = await POST(makeRequest(validBody, "7.7.7.7"));
    expect(res.status).toBe(500);
  });

  it("returns 500 when CONTACT_EMAIL env var is missing", async () => {
    vi.stubEnv("CONTACT_EMAIL", "");
    const { POST } = await import("../route");
    const res = await POST(makeRequest(validBody, "8.8.8.8"));
    expect(res.status).toBe(500);
  });

  it("returns 500 when Resend throws an error", async () => {
    mockSend.mockRejectedValueOnce(new Error("Resend API error"));
    const { POST } = await import("../route");
    const res = await POST(makeRequest(validBody, "6.6.6.6"));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error).toBeTruthy();
  });
});
