import { NextResponse } from "next/server";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { PROMPT_MODE_OPTIONS, PROMPT_MODIFIERS } from "@/lib/constants";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

// Compact format: "id (category)" — minimal tokens for fast classification
const MODE_LIST = PROMPT_MODE_OPTIONS.map(
  (m) => `${m.id} (${m.category})`
).join(", ");

const MODIFIER_LIST = PROMPT_MODIFIERS.map((m) => m.id).join(", ");

const SYSTEM_PROMPT = `Classify user request into modes and modifiers. Return JSON only.

MODES (pick 2-5): ${MODE_LIST}

MODIFIERS (pick 2-6): ${MODIFIER_LIST}

Be generous. Think broadly. {"modes":[...],"modifiers":[...]}`;

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
      maxTokens: 150,
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
