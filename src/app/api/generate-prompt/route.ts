import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

const SYSTEM_PROMPT = `You are an expert prompt engineer. Your job is to transform a user's rough idea into a comprehensive, well-structured prompt that will get excellent results from Claude Code (an AI coding assistant).

Given the user's input and their selected preferences, generate a detailed, actionable prompt that:
1. Clearly states the task and expected outcome
2. Provides all necessary context and constraints
3. Specifies the format and level of detail expected
4. Includes all the modifier requirements they selected
5. Is written in a way that will get the best possible response

Output ONLY the generated prompt - no explanations, no meta-commentary, just the prompt itself.

The prompt should be thorough and specific. Don't be afraid to expand on what the user said to make it clearer and more actionable. Include relevant technical considerations based on their mode selection.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transcript, mode, detailLevel, outputFormat, modifiers, contextInfo } = body;

    // Build context for the AI
    const modeDescriptions: Record<string, string> = {
      // Engineering modes
      code: "writing or modifying code - focus on implementation details, syntax, and working code examples",
      planning: "planning implementation strategy - focus on architecture, milestones, dependencies, and sequencing",
      brainstorming: "brainstorming and exploring ideas - focus on creative solutions, trade-offs, and possibilities",
      design: "architecture and system design - focus on patterns, scalability, maintainability, and technical decisions",
      feedback: "getting code review and suggestions - focus on improvements, potential issues, and best practices",
      technical: "deep technical explanation - focus on how things work, underlying concepts, and detailed mechanics",
      debugging: "debugging and fixing issues - focus on root cause analysis, diagnostic steps, and solutions",
      review: "code review and analysis - focus on code quality, patterns, potential bugs, and improvements",
      documentation: "writing documentation - focus on clarity, completeness, examples, and proper formatting",
      refactoring: "refactoring and improving code structure - focus on clean code, patterns, and maintainability",
      // Business modes
      summary: "summarizing content - focus on extracting key points, main ideas, and essential information concisely",
      transcript: "summarizing meeting transcripts - focus on key decisions, action items, participants, and next steps",
      report: "generating detailed reports - focus on structure, data presentation, findings, and recommendations",
      "vendor-compare": "comparing vendors or products - focus on criteria, pros/cons, pricing, features, and recommendations",
      analysis: "analyzing data or situations - focus on insights, patterns, implications, and actionable conclusions",
      email: "drafting professional emails - focus on tone, clarity, call-to-action, and appropriate formatting",
      proposal: "writing proposals or pitches - focus on value proposition, benefits, timeline, and persuasive structure",
      "meeting-notes": "creating meeting notes - focus on attendees, agenda items, decisions made, and action items with owners",
    };

    const detailDescriptions: Record<string, string> = {
      concise: "Keep explanations brief and focused. Get to the point quickly without unnecessary elaboration.",
      balanced: "Provide moderate detail - enough to understand and implement, but not overwhelming.",
      comprehensive: "Be thorough and detailed. Explain reasoning, cover edge cases, and provide extensive context.",
    };

    const formatDescriptions: Record<string, string> = {
      structured: "Use clear markdown headers (##) to organize content into logical sections. Include code blocks where appropriate.",
      conversational: "Write in a natural, flowing style as if explaining to a colleague. Still use code blocks for code.",
      "bullet-points": "Use bullet points and numbered lists for easy scanning. Keep paragraphs short. Use code blocks for code.",
    };

    const modifierDescriptions: Record<string, string> = {
      // General modifiers
      "step-by-step": "Break the solution into numbered steps that can be followed sequentially",
      "examples": "Include practical examples to illustrate key concepts",
      "alternatives": "Present 2-3 alternative approaches with pros/cons of each",
      "best-practices": "Highlight industry best practices and explain why they matter",
      "explain-reasoning": "Explain the 'why' behind decisions and trade-offs",
      // Engineering modifiers
      "edge-cases": "Identify and address potential edge cases and corner scenarios",
      "performance": "Analyze performance implications and suggest optimizations",
      "security": "Review for security vulnerabilities and suggest secure implementations",
      "testing": "Include test cases, testing strategies, or testable code",
      "typescript": "Use TypeScript with comprehensive type annotations and interfaces",
      "error-handling": "Include robust error handling with meaningful error messages",
      "comments": "Add inline comments explaining complex or non-obvious logic",
      // Business modifiers
      "executive-summary": "Include a concise executive summary at the beginning",
      "action-items": "Extract and list clear action items with owners and deadlines",
      "pros-cons": "Include a thorough pros and cons analysis",
      "timeline": "Include timeline estimates and scheduling considerations",
      "cost-analysis": "Include cost analysis or budget impact considerations",
      "risks": "Identify potential risks and mitigation strategies",
      "stakeholders": "Consider all stakeholders and their perspectives",
      "metrics": "Define clear success metrics and KPIs",
    };

    const selectedModifiers = modifiers
      .map((id: string) => modifierDescriptions[id])
      .filter(Boolean)
      .join("\n- ");

    const userPrompt = `Transform this into a comprehensive prompt for Claude Code:

USER'S REQUEST:
"${transcript}"

MODE: ${mode} (${modeDescriptions[mode] || "general assistance"})

DETAIL LEVEL: ${detailLevel}
${detailDescriptions[detailLevel] || detailDescriptions.balanced}

OUTPUT FORMAT: ${outputFormat}
${formatDescriptions[outputFormat] || formatDescriptions.structured}

${contextInfo ? `ADDITIONAL CONTEXT PROVIDED:\n${contextInfo}\n` : ""}

${selectedModifiers ? `REQUIREMENTS TO INCLUDE:\n- ${selectedModifiers}` : ""}

Generate a detailed, well-structured prompt that incorporates all of the above. The prompt should be ready to paste directly into Claude Code.`;

    if (!process.env.OPENROUTER_API_KEY) {
      // Fallback when no API key - use enhanced local generation
      return NextResponse.json({
        prompt: generateFallbackPrompt(transcript, mode, detailLevel, outputFormat, modifiers, contextInfo, modeDescriptions, detailDescriptions, formatDescriptions, modifierDescriptions),
      });
    }

    const result = await generateText({
      model: openrouter("anthropic/claude-opus-4"), // Using Claude Opus 4.5 for best quality
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      maxTokens: 2000,
    });

    return NextResponse.json({
      prompt: result.text,
    });
  } catch (error) {
    console.error("Generate prompt error:", error);
    return NextResponse.json(
      { error: "Failed to generate prompt" },
      { status: 500 }
    );
  }
}

function generateFallbackPrompt(
  transcript: string,
  mode: string,
  detailLevel: string,
  outputFormat: string,
  modifiers: string[],
  contextInfo: string,
  modeDescriptions: Record<string, string>,
  detailDescriptions: Record<string, string>,
  formatDescriptions: Record<string, string>,
  modifierDescriptions: Record<string, string>
): string {
  const selectedModifiers = modifiers
    .map((id: string) => `- ${modifierDescriptions[id]}`)
    .filter(Boolean)
    .join("\n");

  let prompt = `# ${mode.charAt(0).toUpperCase() + mode.slice(1)} Request

## Overview
${transcript}

## Task Context
This is a **${mode}** task focused on ${modeDescriptions[mode] || "providing assistance"}.

`;

  if (contextInfo) {
    prompt += `## Project Context
${contextInfo}

`;
  }

  prompt += `## Expected Response
${detailDescriptions[detailLevel] || detailDescriptions.balanced}

### Format Guidelines
${formatDescriptions[outputFormat] || formatDescriptions.structured}

`;

  if (selectedModifiers) {
    prompt += `## Specific Requirements
Please ensure your response addresses the following:
${selectedModifiers}

`;
  }

  prompt += `## Success Criteria
- The response directly addresses the request above
- All specified requirements are incorporated
- The solution is practical and immediately usable
- Code examples (if any) are complete and working`;

  return prompt;
}
