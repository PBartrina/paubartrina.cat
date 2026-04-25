import { ipAddress } from "@vercel/functions";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// In-memory rate limiter: max 5 requests per IP per 15 minutes
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const MAX_MAP_SIZE = 10_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();

  // Evict expired entries when the map grows too large
  if (rateLimitMap.size > MAX_MAP_SIZE) {
    for (const [key, val] of rateLimitMap) {
      if (now > val.resetTime) rateLimitMap.delete(key);
    }
  }

  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return false;
  }

  if (record.count >= RATE_LIMIT) {
    return true;
  }

  record.count += 1;
  return false;
}

function sanitizeHeaderValue(str: string): string {
  // Strip control characters (CR, LF, NUL, etc.) to prevent header injection
  return str.replace(/[\x00-\x1F\x7F]/g, "");
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  // On Vercel, ipAddress() reads the verified edge IP and cannot be spoofed
  // via crafted headers. Falls back to x-forwarded-for for local dev.
  const ip =
    ipAddress(req) ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "errorRateLimit" },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "errorInvalidRequest" }, { status: 400 });
  }

  const { name, email, message, website } = body as {
    name?: string;
    email?: string;
    message?: string;
    website?: string;
  };

  // Honeypot: bots fill this field, humans don't see it
  if (website) {
    return NextResponse.json({ success: true });
  }

  // Validate fields
  if (!name || typeof name !== "string" || name.trim().length < 1 || name.trim().length > 100) {
    return NextResponse.json({ error: "errorNameRequired" }, { status: 400 });
  }
  if (!email || typeof email !== "string" || !isValidEmail(email.trim())) {
    return NextResponse.json({ error: "errorEmailInvalid" }, { status: 400 });
  }
  if (!message || typeof message !== "string" || message.trim().length < 1 || message.trim().length > 2000) {
    return NextResponse.json({ error: "errorMessageRequired" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const contactEmail = process.env.CONTACT_EMAIL;

  if (!apiKey || !contactEmail) {
    console.error("Missing RESEND_API_KEY or CONTACT_EMAIL env vars");
    return NextResponse.json(
      { error: "errorServerConfig" },
      { status: 500 },
    );
  }

  const resend = new Resend(apiKey);

  try {
    await resend.emails.send({
      from: "Web de Pau Bartrina <noreply@paubartrina.cat>",
      to: contactEmail,
      replyTo: `"${sanitizeHeaderValue(name.trim()).replace(/"/g, '\\"')}" <${email.trim()}>`,
      subject: `Nou missatge de contacte de ${escapeHtml(name.trim())}`,
      html: `
        <p><strong>Nom:</strong> ${escapeHtml(name.trim())}</p>
        <p><strong>Correu:</strong> ${escapeHtml(email.trim())}</p>
        <hr />
        <p>${escapeHtml(message.trim()).replace(/\n/g, "<br>")}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error sending email:", err);
    return NextResponse.json(
      { error: "errorSendFailed" },
      { status: 500 },
    );
  }
}
