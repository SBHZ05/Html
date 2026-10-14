import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { messages } from "../../db/schema.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body: { name?: unknown; email?: unknown; message?: unknown };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!name || !email || !message) {
    return Response.json({ error: "Name, email and message are required" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email) || name.length > 200 || email.length > 320 || message.length > 5000) {
    return Response.json({ error: "Please check your details and try again" }, { status: 400 });
  }

  const [saved] = await db
    .insert(messages)
    .values({ name, email, message })
    .returning({ id: messages.id });

  return Response.json({ ok: true, id: saved.id }, { status: 201 });
};

export const config: Config = {
  path: "/api/messages",
};
