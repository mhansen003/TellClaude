import { Redis } from "@upstash/redis";
import { NextRequest, NextResponse } from "next/server";

const KV_PREFIX = "share:";
const TTL_SECONDS = 90 * 24 * 60 * 60; // 90 days

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

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
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
    }

    const data = await request.json();
    if (!data.prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const code = generateCode();
    await redis.set(`${KV_PREFIX}${code}`, JSON.stringify(data), { ex: TTL_SECONDS });

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
    const redis = getRedis();
    if (!redis) {
      return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
    }

    const code = request.nextUrl.searchParams.get("code");
    if (!code) {
      return NextResponse.json({ error: "Missing code" }, { status: 400 });
    }

    const raw = await redis.get<string>(`${KV_PREFIX}${code}`);
    if (!raw) {
      return NextResponse.json({ error: "Not found or expired" }, { status: 404 });
    }

    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    return NextResponse.json(data);
  } catch (error) {
    console.error("Share GET error:", error);
    return NextResponse.json({ error: "Failed to retrieve" }, { status: 500 });
  }
}
