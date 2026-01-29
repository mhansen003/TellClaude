import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

interface Message {
  role: "assistant" | "user";
  content: string;
}

const SYSTEM_PROMPT = `You are an expert prompt engineer helping users craft perfect prompts for Claude Code (an AI coding assistant). Your goal is to ask 2-4 clarifying questions to understand exactly what the user needs, then generate a comprehensive, well-structured prompt.

When starting an interview:
1. Greet the user warmly
2. Acknowledge their initial request
3. Ask your first clarifying question

Good questions to ask:
- What specific outcome are you hoping for?
- What technology/framework are you using?
- Are there any constraints or requirements?
- What have you tried so far?
- Is there a specific coding style or pattern you prefer?

Rules:
- Ask only 1 question at a time
- Keep questions concise and friendly
- After 2-4 questions (when you have enough context), generate the final prompt
- When ready to complete, respond with EXACTLY this format:

[COMPLETE]
<your enhanced prompt here>
[/COMPLETE]

The enhanced prompt should be:
- Well-structured with clear sections
- Include all gathered context
- Be specific and actionable
- Use markdown formatting where helpful`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, transcript, mode, messages } = body;

    if (!process.env.OPENROUTER_API_KEY) {
      // Fallback for when API key is not set
      if (action === "start") {
        return NextResponse.json({
          message: `I see you want help with a ${mode} task. Let me ask a few questions to craft the perfect prompt for you.\n\nWhat specific outcome are you hoping to achieve with this?`,
        });
      }

      // Simple fallback logic for demo
      const questionCount = messages?.filter((m: Message) => m.role === "assistant").length || 0;
      if (questionCount >= 2) {
        const userResponses = messages
          ?.filter((m: Message) => m.role === "user")
          .map((m: Message) => m.content)
          .join("\n- ");

        return NextResponse.json({
          isComplete: true,
          finalPrompt: `## Task Type\nI need help with ${mode}.\n\n## Request\n${transcript}\n\n## Additional Context\n- ${userResponses}\n\n## Requirements\nPlease provide a detailed, step-by-step solution with code examples where appropriate.`,
        });
      }

      const followUpQuestions = [
        "What technology stack or framework are you working with?",
        "Are there any specific constraints or patterns you need to follow?",
        "What's the most important aspect of this solution for you?",
      ];

      return NextResponse.json({
        message: followUpQuestions[questionCount] || followUpQuestions[0],
      });
    }

    const allMessages = [
      {
        role: "system" as const,
        content: SYSTEM_PROMPT,
      },
    ];

    if (action === "start") {
      allMessages.push({
        role: "user" as const,
        content: `The user wants help with a "${mode}" task. Their initial request is:\n\n"${transcript}"\n\nPlease greet them and ask your first clarifying question.`,
      });
    } else if (action === "continue" && messages) {
      allMessages.push({
        role: "user" as const,
        content: `Context: The user wants help with a "${mode}" task. Their initial request was: "${transcript}"`,
      });

      for (const msg of messages) {
        allMessages.push({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        });
      }
    }

    const result = await generateText({
      model: openrouter("anthropic/claude-3.5-haiku"),
      messages: allMessages,
      temperature: 0.7,
      maxTokens: 1000,
    });

    const responseText = result.text;

    // Check if the interview is complete
    const completeMatch = responseText.match(/\[COMPLETE\]([\s\S]*?)\[\/COMPLETE\]/);
    if (completeMatch) {
      return NextResponse.json({
        isComplete: true,
        finalPrompt: completeMatch[1].trim(),
      });
    }

    return NextResponse.json({
      message: responseText,
    });
  } catch (error) {
    console.error("Interview API error:", error);
    return NextResponse.json(
      { error: "Failed to process interview" },
      { status: 500 }
    );
  }
}
