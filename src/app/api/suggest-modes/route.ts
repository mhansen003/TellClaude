import { NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { PROMPT_MODE_OPTIONS, PROMPT_MODIFIERS } from "@/lib/constants";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

// Build the classification reference lists from constants (always in sync)
const MODE_LIST = PROMPT_MODE_OPTIONS.map(
  (m) => `${m.id}: ${m.description} [${m.category}]`
).join("\n");

const MODIFIER_LIST = PROMPT_MODIFIERS.map(
  (m) => `${m.id}: ${m.description}`
).join("\n");

const SYSTEM_PROMPT = `You are a classification assistant. Given a user's request, select the most relevant prompt modes and modifiers.

AVAILABLE MODES (select 1-3 most relevant):
${MODE_LIST}

AVAILABLE MODIFIERS (select 0-4 most relevant):
${MODIFIER_LIST}

Rules:
- Pick modes that best match the user's intent
- Pick modifiers that would improve the output quality for this request
- If the request is unclear, pick the single most likely mode
- Respond with ONLY valid JSON, no markdown fences, no explanation

Response format:
{"modes":["mode-id-1","mode-id-2"],"modifiers":["modifier-id-1"]}`;

// Valid ID sets for server-side filtering
const VALID_MODE_IDS = new Set<string>(PROMPT_MODE_OPTIONS.map((m) => m.id));
const VALID_MODIFIER_IDS = new Set<string>(PROMPT_MODIFIERS.map((m) => m.id));

export async function POST(request: Request) {
  try {
    const { transcript } = await request.json();

    if (!transcript || typeof transcript !== "string" || !transcript.trim()) {
      return NextResponse.json({ modes: [], modifiers: [] });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ modes: [], modifiers: [] });
    }

    const result = await generateText({
      model: openrouter("google/gemini-2.0-flash-lite-001"),
      temperature: 0.2,
      maxTokens: 300,
      system: SYSTEM_PROMPT,
      prompt: transcript.trim(),
    });

    // Parse and validate the response
    const text = result.text.trim();
    // Strip markdown fences if the model wraps in ```json
    const cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    const parsed = JSON.parse(cleaned);

    const modes = Array.isArray(parsed.modes)
      ? parsed.modes.filter((id: string) => VALID_MODE_IDS.has(id))
      : [];
    const modifiers = Array.isArray(parsed.modifiers)
      ? parsed.modifiers.filter((id: string) => VALID_MODIFIER_IDS.has(id))
      : [];

    return NextResponse.json({ modes, modifiers });
  } catch (error) {
    console.error("Suggest modes error:", error);
    return NextResponse.json({ modes: [], modifiers: [] });
  }
}
