// Minimal stand-in for https://api.resend.com used by the e2e suite.
//
// The Resend SDK reads RESEND_BASE_URL, so pointing the Next.js server here
// exercises the real /api/contact route while nothing leaves the machine.
//
//   POST   /emails           record the payload, reply like Resend (200 + id)
//   GET    /emails           list recorded payloads (test assertions)
//   DELETE /emails           clear recorded payloads
//   POST   /__mock/fail      { "subjectIncludes": "…" }: every later
//                            POST /emails whose subject contains it → 500
import { createServer } from "node:http";

const port = Number(process.env.MOCK_RESEND_PORT ?? 3101);

/** @type {Array<Record<string, unknown>>} */
let emails = [];
/** @type {string[]} */
let failMarkers = [];

function json(res, status, body) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve(null);
      }
    });
  });
}

createServer(async (req, res) => {
  const { method, url } = req;

  if (url === "/emails" && method === "POST") {
    const payload = await readJson(req);
    if (!payload) return json(res, 400, { message: "invalid json" });
    const subject = String(payload.subject ?? "");
    if (failMarkers.some((m) => subject.includes(m))) {
      return json(res, 500, {
        name: "application_error",
        message: "mock failure",
        statusCode: 500,
      });
    }
    emails.push(payload);
    return json(res, 200, { id: `mock-${emails.length}` });
  }
  if (url === "/emails" && method === "GET") return json(res, 200, emails);
  if (url === "/emails" && method === "DELETE") {
    emails = [];
    failMarkers = [];
    return json(res, 200, { ok: true });
  }
  if (url === "/__mock/fail" && method === "POST") {
    const { subjectIncludes } = (await readJson(req)) ?? {};
    if (typeof subjectIncludes !== "string" || !subjectIncludes) {
      return json(res, 400, { message: "subjectIncludes required" });
    }
    failMarkers.push(subjectIncludes);
    return json(res, 200, { ok: true });
  }
  return json(res, 404, { message: "not found" });
}).listen(port, "127.0.0.1", () => {
  console.log(`mock resend listening on http://127.0.0.1:${port}`);
});
