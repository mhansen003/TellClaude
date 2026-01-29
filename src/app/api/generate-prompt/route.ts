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
    const { transcript, modes: modesRaw, mode: legacyMode, detailLevel, outputFormat, modifiers, contextInfo, attachments, urlReferences } = body;
    // Support both new multi-select `modes` array and legacy single `mode` string
    const modes: string[] = modesRaw || (legacyMode ? [legacyMode] : ["code"]);

    // Build context for the AI
    const modeDescriptions: Record<string, string> = {
      // Engineering modes
      code: "writing or modifying code - focus on implementation details, syntax, and working code examples",
      planning: "planning implementation strategy - focus on architecture, milestones, dependencies, and sequencing",
      brainstorming: "brainstorming and exploring ideas - focus on creative solutions, trade-offs, and possibilities",
      design: "architecture and system design - focus on patterns, scalability, maintainability, and technical decisions",
      database: "database schema design and data modeling - focus on tables, relationships, normalization, indexes, and SQL queries",
      feedback: "getting code review and suggestions - focus on improvements, potential issues, and best practices",
      technical: "deep technical explanation - focus on how things work, underlying concepts, and detailed mechanics",
      debugging: "debugging and fixing issues - focus on root cause analysis, diagnostic steps, and solutions",
      review: "code review and analysis - focus on code quality, patterns, potential bugs, and improvements",
      documentation: "writing documentation - focus on clarity, completeness, examples, and proper formatting",
      refactoring: "refactoring and improving code structure - focus on clean code, patterns, and maintainability",
      optimize: "performance optimization - focus on speed, memory efficiency, algorithmic improvements, and benchmarking suggestions",
      skill: "creating a Claude Code slash command (skill) - focus on markdown command structure, parameter definitions, system instructions, output formatting, and user interaction flow",
      plugin: "building a plugin or extension - focus on platform APIs, manifest configuration, lifecycle hooks, permissions, packaging, and marketplace listing metadata",
      "mcp-server": "building a Model Context Protocol server - focus on tool definitions, resource endpoints, input schemas, transport setup (stdio/SSE), error handling, and client integration",
      cli: "building a command-line tool - focus on argument parsing, subcommands, interactive prompts, help text, stdout/stderr conventions, exit codes, and shell completions",
      api: "designing and building API endpoints - focus on REST/GraphQL design, route structure, request validation, authentication, error responses, rate limiting, versioning, and OpenAPI documentation",
      "security-audit": "security auditing and hardening - focus on OWASP Top 10, vulnerability scanning, threat modeling, attack surface analysis, dependency auditing, and remediation recommendations",
      "auth-sso": "authentication and single sign-on - focus on OAuth 2.0 / OIDC / SAML flows, token management, session handling, identity providers, RBAC, and secure credential storage",
      "otp-mfa": "multi-factor authentication - focus on TOTP/HOTP implementation, SMS/email OTP, WebAuthn/passkeys, backup codes, recovery flows, and rate limiting brute-force attempts",
      encryption: "data encryption and key management - focus on AES/RSA/ECC algorithms, at-rest and in-transit encryption, key rotation, secrets vaults, hashing strategies, and TLS configuration",
      compliance: "regulatory compliance - focus on SOC 2, GDPR, HIPAA, PCI-DSS controls, data classification, audit logging, consent management, retention policies, and documentation",
      // Business modes
      summary: "summarizing content - focus on extracting key points, main ideas, and essential information concisely",
      transcript: "summarizing meeting transcripts - focus on key decisions, action items, participants, and next steps",
      report: "generating detailed reports - focus on structure, data presentation, findings, and recommendations",
      "vendor-compare": "comparing vendors or products - focus on criteria, pros/cons, pricing, features, and recommendations",
      analysis: "analyzing data or situations - focus on insights, patterns, implications, and actionable conclusions",
      email: "drafting professional emails - focus on tone, clarity, call-to-action, and appropriate formatting",
      proposal: "writing proposals or pitches - focus on value proposition, benefits, timeline, and persuasive structure",
      "meeting-notes": "creating meeting notes - focus on attendees, agenda items, decisions made, and action items with owners",
      "user-story": "writing user stories - focus on user persona, acceptance criteria, edge cases, definition of done, and testable requirements",
      "prd": "writing product requirements documents - focus on problem statement, goals, scope, user stories, success metrics, constraints, and dependencies",
      "okrs": "drafting OKRs - focus on clear objectives, measurable key results, alignment to company goals, and tracking methodology",
      "stakeholder-update": "writing stakeholder status updates - focus on progress summary, key milestones, blockers, risks, decisions needed, and next steps",
      "release-notes": "writing release notes and changelogs - focus on user-facing changes, new features, bug fixes, breaking changes, and migration steps",
      "incident-report": "writing post-incident reports - focus on timeline, detection, impact assessment, root cause analysis, remediation steps, and preventive action items",
      "runbook": "creating operational runbooks - focus on prerequisites, step-by-step procedures, verification steps, rollback plans, and troubleshooting guides",
      "presentation": "outlining presentations - focus on narrative arc, key messages per slide, supporting data points, speaker notes, and audience takeaways",
      "faq": "building FAQ documents - focus on common questions organized by topic, clear and concise answers, cross-references, and escalation paths",
      "sow": "writing statements of work - focus on project scope, deliverables, acceptance criteria, timeline, assumptions, exclusions, and payment terms",
      // Marketing modes
      "ad-copy": "writing advertising copy - focus on headlines, hooks, value propositions, CTAs, A/B variations, and platform-specific character limits",
      "social-media": "creating social media content - focus on platform-native formatting, hashtags, engagement hooks, visual direction, and posting cadence",
      "landing-page": "writing landing page copy - focus on hero messaging, benefit sections, social proof, objection handling, and conversion-optimized CTAs",
      "email-campaign": "creating email marketing campaigns - focus on subject lines, preview text, personalization, drip sequences, segmentation, and click-through optimization",
      "video-script": "writing video scripts - focus on hook (first 3 seconds), narrative arc, B-roll direction, captions, pacing, and platform-specific duration",
      "ai-avatar": "creating AI avatar content - focus on script tone, gestures/expression cues, talking-head framing, teleprompter formatting, and natural speech patterns",
      "seo-content": "writing SEO-optimized content - focus on keyword integration, meta descriptions, heading hierarchy, internal linking, featured snippet targeting, and readability",
      "brand-voice": "defining or applying brand voice - focus on tone guidelines, vocabulary lists, do/don't examples, persona characteristics, and channel-specific adaptations",
      "press-release": "writing press releases - focus on newsworthiness, inverted pyramid structure, quotes, boilerplate, media contact info, and distribution channels",
      "case-study": "writing case studies - focus on challenge/solution/results framework, metrics, customer quotes, visual callouts, and lead-gen CTAs",
      "product-launch": "planning product launch content - focus on launch timeline, channel strategy, messaging matrix, embargo schedules, and coordinated asset lists",
      "influencer-brief": "creating influencer/creator briefs - focus on brand guidelines, key messages, creative freedom boundaries, deliverables, usage rights, and FTC compliance",
      // Research modes
      "deep-research": "thorough topic investigation - focus on source gathering, cross-referencing, evidence synthesis, methodology, findings, and cited conclusions",
      "competitive-analysis": "competitive analysis - focus on market positioning, feature comparison matrices, pricing analysis, strengths/weaknesses, and strategic recommendations",
      "market-research": "market research - focus on market size (TAM/SAM/SOM), customer segments, growth drivers, barriers to entry, and demographic insights",
      "literature-review": "literature review - focus on summarizing existing research, identifying methodological approaches, noting consensus and disagreements, and highlighting gaps",
      "trend-analysis": "trend analysis - focus on identifying emerging patterns, underlying drivers, historical context, trajectory modeling, and future projections",
      "feasibility-study": "feasibility study - focus on technical viability, resource requirements, cost estimates, risk factors, timeline, and ROI projections",
      "benchmarking": "benchmarking - focus on industry standards, best-in-class metrics, performance gaps, peer comparisons, and improvement targets",
      "survey-design": "survey design - focus on research objectives, question types, response scales, sampling methodology, bias mitigation, and analysis plan",
      "data-synthesis": "data synthesis - focus on combining multiple data sources, identifying patterns, resolving contradictions, and producing unified actionable insights",
      "gap-analysis": "gap analysis - focus on current state assessment, desired target state, identified gaps, root causes, and a prioritized remediation roadmap",
      "swot": "SWOT analysis - focus on internal strengths and weaknesses, external opportunities and threats, cross-quadrant insights, and strategic implications",
      "due-diligence": "due diligence investigation - focus on risk assessment, financial review, legal considerations, operational evaluation, and red-flag identification",
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

    // Format attachments for inclusion in prompt
    interface AttachmentData {
      name: string;
      content: string;
    }
    const attachmentSection = attachments && attachments.length > 0
      ? `\n\nATTACHED FILES FOR CONTEXT:\n${attachments.map((a: AttachmentData) =>
          `--- ${a.name} ---\n\`\`\`\n${a.content.slice(0, 10000)}\n\`\`\`\n`
        ).join('\n')}`
      : '';

    // Format URL references for inclusion in prompt
    interface UrlReferenceData {
      title: string;
      content: string;
      type: string;
      url: string;
    }
    const urlSection = urlReferences && urlReferences.length > 0
      ? `\n\nREFERENCED URLS FOR CONTEXT:\n${urlReferences.map((r: UrlReferenceData) =>
          `--- ${r.type === 'github_issue' ? 'GitHub Issue: ' : ''}${r.title} ---\nSource: ${r.url}\n\n${r.content.slice(0, 15000)}\n`
        ).join('\n---\n')}`
      : '';

    const userPrompt = `Transform this into a comprehensive prompt for Claude Code:

USER'S REQUEST:
"${transcript}"

MODES: ${modes.map((m: string) => `${m} (${modeDescriptions[m] || "general assistance"})`).join(" + ")}

DETAIL LEVEL: ${detailLevel}
${detailDescriptions[detailLevel] || detailDescriptions.balanced}

OUTPUT FORMAT: ${outputFormat}
${formatDescriptions[outputFormat] || formatDescriptions.structured}

${contextInfo ? `ADDITIONAL CONTEXT PROVIDED:\n${contextInfo}\n` : ""}
${attachmentSection}
${urlSection}
${selectedModifiers ? `REQUIREMENTS TO INCLUDE:\n- ${selectedModifiers}` : ""}

Generate a detailed, well-structured prompt that incorporates all of the above. If files were attached, reference their contents appropriately in the prompt. The prompt should be ready to paste directly into Claude Code.`;

    if (!process.env.OPENROUTER_API_KEY) {
      // Fallback when no API key - use enhanced local generation
      return NextResponse.json({
        prompt: generateFallbackPrompt(transcript, modes, detailLevel, outputFormat, modifiers, contextInfo, attachments, urlReferences, modeDescriptions, detailDescriptions, formatDescriptions, modifierDescriptions),
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

interface FallbackAttachment {
  name: string;
  content: string;
}

interface FallbackUrlReference {
  title: string;
  content: string;
  type: string;
  url: string;
}

function generateFallbackPrompt(
  transcript: string,
  modes: string[],
  detailLevel: string,
  outputFormat: string,
  modifiers: string[],
  contextInfo: string,
  attachments: FallbackAttachment[] | undefined,
  urlReferences: FallbackUrlReference[] | undefined,
  modeDescriptions: Record<string, string>,
  detailDescriptions: Record<string, string>,
  formatDescriptions: Record<string, string>,
  modifierDescriptions: Record<string, string>
): string {
  const selectedModifiers = modifiers
    .map((id: string) => `- ${modifierDescriptions[id]}`)
    .filter(Boolean)
    .join("\n");

  const modeLabel = modes.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(" + ");
  const modeContext = modes.map(m => modeDescriptions[m] || "providing assistance").join("; ");

  let prompt = `# ${modeLabel} Request

## Overview
${transcript}

## Task Context
This is a **${modeLabel}** task focused on ${modeContext}.

`;

  if (contextInfo) {
    prompt += `## Project Context
${contextInfo}

`;
  }

  // Add attachments section
  if (attachments && attachments.length > 0) {
    prompt += `## Attached Files\n`;
    for (const attachment of attachments) {
      prompt += `### ${attachment.name}
\`\`\`
${attachment.content.slice(0, 10000)}
\`\`\`

`;
    }
  }

  // Add URL references section
  if (urlReferences && urlReferences.length > 0) {
    prompt += `## Referenced URLs\n`;
    for (const ref of urlReferences) {
      prompt += `### ${ref.type === 'github_issue' ? '🐙 ' : '🔗 '}${ref.title}
**Source:** ${ref.url}

${ref.content.slice(0, 15000)}

`;
    }
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
