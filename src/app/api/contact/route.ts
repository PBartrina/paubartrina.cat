import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// In-memory rate limiter: max 5 requests per IP per 15 minutes
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 15 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
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

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Massa peticions. Torna-ho a intentar en 15 minuts." },
      { status: 429 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Petici\u00f3 inv\u00e0lida." }, { status: 400 });
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
    return NextResponse.json({ error: "El nom \u00e9s obligatori (m\u00e0x. 100 car\u00e0cters)." }, { status: 400 });
  }
  if (!email || typeof email !== "string" || !isValidEmail(email.trim())) {
    return NextResponse.json({ error: "Cal indicar un correu electr\u00f2nic v\u00e0lid." }, { status: 400 });
  }
  if (!message || typeof message !== "string" || message.trim().length < 1 || message.trim().length > 2000) {
    return NextResponse.json({ error: "El missatge \u00e9s obligatori (m\u00e0x. 2000 car\u00e0cters)." }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const contactEmail = process.env.CONTACT_EMAIL;

  if (!apiKey || !contactEmail) {
    console.error("Missing RESEND_API_KEY or CONTACT_EMAIL env vars");
    return NextResponse.json(
      { error: "Error de configuraci\u00f3 del servidor. Torna-ho a intentar m\u00e9s tard." },
      { status: 500 },
    );
  }

  const resend = new Resend(apiKey);

  try {
    await resend.emails.send({
      from: "Web de Pau Bartrina <noreply@paubartrina.cat>",
      to: contactEmail,
      replyTo: `${name.trim()} <${email.trim()}>`,
      subject: `Nou missatge de contacte de ${name.trim()}`,
      html: `
        <p><strong>Nom:</strong> ${name.trim()}</p>
        <p><strong>Correu:</strong> ${email.trim()}</p>
        <hr />
        <p>${message.trim().replace(/\n/g, "<br>")}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error sending email:", err);
    return NextResponse.json(
      { error: "No s\u2019ha pogut enviar el missatge. Torna-ho a intentar." },
      { status: 500 },
    );
  }
}
