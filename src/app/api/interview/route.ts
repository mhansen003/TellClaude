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

const SYSTEM_PROMPT_NEW = `You are an expert prompt engineer helping users craft perfect prompts for Claude Code (an AI coding assistant). Your goal is to ask 2-4 clarifying questions to understand exactly what the user needs, then generate a comprehensive, well-structured prompt.

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

const SYSTEM_PROMPT_ENHANCE = `You are an expert prompt engineer helping users ENHANCE and IMPROVE an existing prompt for Claude Code (an AI coding assistant). The user already has a generated prompt, and your goal is to ask 2-3 clarifying questions to understand what additional details or changes they want, then merge everything into an improved version.

When starting an enhancement interview:
1. Acknowledge that they have an existing prompt
2. Ask what they'd like to add, change, or clarify
3. Focus on what's missing or could be improved

Good questions to ask:
- What would you like to add or change in this prompt?
- Is there any context or requirement that's missing?
- Should we adjust the focus or priority of any section?
- Are there edge cases or specific scenarios to address?

Rules:
- Ask only 1 question at a time
- Keep questions concise and friendly
- After 2-3 questions, merge the new information with the existing prompt
- PRESERVE the good parts of the existing prompt
- ADD new details from the conversation
- When ready to complete, respond with EXACTLY this format:

[COMPLETE]
<your merged/enhanced prompt here>
[/COMPLETE]

The enhanced prompt should:
- Keep all relevant content from the original
- Integrate new details seamlessly
- Be well-structured with clear sections
- Use markdown formatting where helpful`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, transcript, mode, messages, existingPrompt } = body;
    const hasExistingPrompt = Boolean(existingPrompt?.trim());

    if (!process.env.OPENROUTER_API_KEY) {
      // Fallback for when API key is not set
      if (action === "start") {
        if (hasExistingPrompt) {
          return NextResponse.json({
            message: `I see you already have a prompt generated. Let me help you enhance it!\n\nWhat would you like to add, change, or clarify in your existing prompt?`,
          });
        }
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

        if (hasExistingPrompt) {
          return NextResponse.json({
            isComplete: true,
            finalPrompt: `${existingPrompt}\n\n## Additional Details from Interview\n- ${userResponses}`,
          });
        }

        return NextResponse.json({
          isComplete: true,
          finalPrompt: `## Task Type\nI need help with ${mode}.\n\n## Request\n${transcript}\n\n## Additional Context\n- ${userResponses}\n\n## Requirements\nPlease provide a detailed, step-by-step solution with code examples where appropriate.`,
        });
      }

      // Handle manual generate action
      if (action === "generate") {
        const userResponses = messages
          ?.filter((m: Message) => m.role === "user")
          .map((m: Message) => m.content)
          .join("\n- ");

        if (hasExistingPrompt) {
          return NextResponse.json({
            isComplete: true,
            finalPrompt: `${existingPrompt}\n\n## Additional Details from Interview\n- ${userResponses || "No additional context provided"}`,
          });
        }

        return NextResponse.json({
          isComplete: true,
          finalPrompt: `## Task Type\nI need help with ${mode}.\n\n## Request\n${transcript || "Help me with my task"}\n\n## Context from Interview\n- ${userResponses || "No additional context provided"}\n\n## Requirements\nPlease provide a detailed, step-by-step solution with code examples where appropriate.`,
        });
      }

      const followUpQuestions = hasExistingPrompt
        ? [
            "What specific section would you like to expand or modify?",
            "Are there any edge cases or scenarios you want me to add?",
            "Should we adjust the priority or focus of any requirements?",
          ]
        : [
            "What technology stack or framework are you working with?",
            "Are there any specific constraints or patterns you need to follow?",
            "What's the most important aspect of this solution for you?",
          ];

      return NextResponse.json({
        message: followUpQuestions[questionCount] || followUpQuestions[0],
      });
    }

    type MessageRole = "system" | "user" | "assistant";
    interface ChatMessage {
      role: MessageRole;
      content: string;
    }

    // Choose the appropriate system prompt based on whether we're enhancing or creating new
    const systemPrompt = hasExistingPrompt ? SYSTEM_PROMPT_ENHANCE : SYSTEM_PROMPT_NEW;

    const allMessages: ChatMessage[] = [
      {
        role: "system",
        content: systemPrompt,
      },
    ];

    // Build context string including existing prompt if available
    const contextString = hasExistingPrompt
      ? `The user wants help with a "${mode}" task. Their initial request was: "${transcript}"\n\nThey already have this generated prompt that they want to ENHANCE:\n\n---EXISTING PROMPT---\n${existingPrompt}\n---END EXISTING PROMPT---\n\nHelp them improve and add to this existing prompt.`
      : `The user wants help with a "${mode}" task. Their initial request is:\n\n"${transcript}"`;

    if (action === "start") {
      allMessages.push({
        role: "user",
        content: hasExistingPrompt
          ? `${contextString}\n\nPlease acknowledge their existing prompt and ask what they'd like to add, change, or clarify.`
          : `${contextString}\n\nPlease greet them and ask your first clarifying question.`,
      });
    } else if (action === "continue" && messages) {
      allMessages.push({
        role: "user",
        content: contextString,
      });

      for (const msg of messages) {
        allMessages.push({
          role: msg.role as MessageRole,
          content: msg.content,
        });
      }
    } else if (action === "generate" && messages) {
      // User wants to generate prompt immediately from conversation
      allMessages.push({
        role: "user",
        content: contextString,
      });

      for (const msg of messages) {
        allMessages.push({
          role: msg.role as MessageRole,
          content: msg.content,
        });
      }

      // Add instruction to generate the prompt now
      const generateInstruction = hasExistingPrompt
        ? "Based on our conversation, please MERGE the new information with the existing prompt. Keep all the good parts of the original and integrate the new details. Respond with EXACTLY this format:\n\n[COMPLETE]\n<your merged/enhanced prompt here>\n[/COMPLETE]"
        : "Based on our conversation so far, please generate the final enhanced prompt now. Respond with EXACTLY this format:\n\n[COMPLETE]\n<your enhanced prompt here>\n[/COMPLETE]";

      allMessages.push({
        role: "user",
        content: generateInstruction,
      });
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
