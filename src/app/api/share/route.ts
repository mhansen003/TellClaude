import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";

const KV_PREFIX = "share:";
const TTL_SECONDS = 90 * 24 * 60 * 60; // 90 days

function generateCode(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  const bytes = new Uint8Array(7);
  crypto.getRandomValues(bytes);
  for (let i = 0; i < bytes.length; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return code;
}

// POST — store shared data and return short code
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const code = generateCode();
    await kv.set(`${KV_PREFIX}${code}`, JSON.stringify(data), { ex: TTL_SECONDS });

    const origin = request.headers.get("x-forwarded-host")
      ? `https://${request.headers.get("x-forwarded-host")}`
      : new URL(request.url).origin;

    return NextResponse.json({ code, url: `${origin}/s/${code}` });
  } catch (error) {
    console.error("Share API error:", error);
    return NextResponse.json({ error: "Failed to create short link" }, { status: 500 });
  }
}

// GET — retrieve shared data by code
export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get("code");
    if (!code) {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    const raw = await kv.get<string>(`${KV_PREFIX}${code}`);
    if (!raw) {
      return NextResponse.json({ error: "Not found or expired" }, { status: 404 });
    }

    // raw might be a string or already parsed object depending on KV driver
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Share GET error:", error);
    return NextResponse.json({ error: "Failed to retrieve" }, { status: 500 });
  }
}
