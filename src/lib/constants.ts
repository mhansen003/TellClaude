import { PromptModeOption, DetailLevelOption, OutputFormatOption, PromptModifier } from "./types";

export const PROMPT_MODE_OPTIONS: PromptModeOption[] = [
  // Engineering modes
  {
    id: "code",
    label: "Code",
    description: "Write or modify code",
    icon: "{ }",
    color: "bg-claude-orange",
    category: "engineering",
  },
  {
    id: "planning",
    label: "Planning",
    description: "Plan implementation strategy",
    icon: "📋",
    color: "bg-accent-blue",
    category: "engineering",
  },
  {
    id: "brainstorming",
    label: "Brainstorm",
    description: "Explore ideas and approaches",
    icon: "💡",
    color: "bg-accent-purple",
    category: "engineering",
  },
  {
    id: "design",
    label: "Design",
    description: "Architecture and system design",
    icon: "🎨",
    color: "bg-accent-teal",
    category: "engineering",
  },
  {
    id: "debugging",
    label: "Debug",
    description: "Find and fix issues",
    icon: "🐛",
    color: "bg-accent-rose",
    category: "engineering",
  },
  {
    id: "review",
    label: "Review",
    description: "Analyze existing code",
    icon: "🔍",
    color: "bg-accent-blue",
    category: "engineering",
  },
  {
    id: "documentation",
    label: "Docs",
    description: "Write documentation",
    icon: "📝",
    color: "bg-accent-teal",
    category: "engineering",
  },
  {
    id: "refactoring",
    label: "Refactor",
    description: "Improve code structure",
    icon: "♻️",
    color: "bg-accent-green",
    category: "engineering",
  },
  {
    id: "technical",
    label: "Technical",
    description: "Deep technical explanations",
    icon: "⚙️",
    color: "bg-claude-deep",
    category: "engineering",
  },
  {
    id: "feedback",
    label: "Feedback",
    description: "Get code review or suggestions",
    icon: "💬",
    color: "bg-accent-green",
    category: "engineering",
  },
  // Business modes
  {
    id: "summary",
    label: "Summary",
    description: "Summarize content or documents",
    icon: "📄",
    color: "bg-accent-blue",
    category: "business",
  },
  {
    id: "transcript",
    label: "Transcript",
    description: "Summarize meeting transcripts",
    icon: "🎙️",
    color: "bg-accent-purple",
    category: "business",
  },
  {
    id: "report",
    label: "Report",
    description: "Generate detailed reports",
    icon: "📊",
    color: "bg-accent-teal",
    category: "business",
  },
  {
    id: "vendor-compare",
    label: "Vendor Compare",
    description: "Compare vendors or products",
    icon: "⚖️",
    color: "bg-claude-orange",
    category: "business",
  },
  {
    id: "analysis",
    label: "Analysis",
    description: "Analyze data or situations",
    icon: "📈",
    color: "bg-accent-green",
    category: "business",
  },
  {
    id: "email",
    label: "Email",
    description: "Draft professional emails",
    icon: "✉️",
    color: "bg-accent-blue",
    category: "business",
  },
  {
    id: "proposal",
    label: "Proposal",
    description: "Write proposals or pitches",
    icon: "📑",
    color: "bg-accent-purple",
    category: "business",
  },
  {
    id: "meeting-notes",
    label: "Meeting Notes",
    description: "Create action items from notes",
    icon: "📌",
    color: "bg-accent-rose",
    category: "business",
  },
];

export const DETAIL_LEVEL_OPTIONS: DetailLevelOption[] = [
  { id: "concise", label: "Concise", icon: "−" },
  { id: "balanced", label: "Balanced", icon: "○" },
  { id: "comprehensive", label: "Detailed", icon: "+" },
];

export const OUTPUT_FORMAT_OPTIONS: OutputFormatOption[] = [
  {
    id: "structured",
    label: "Structured",
    description: "Clear sections and headers",
  },
  {
    id: "conversational",
    label: "Natural",
    description: "Natural dialogue flow",
  },
  {
    id: "bullet-points",
    label: "Bullets",
    description: "Scannable list format",
  },
];

export const PROMPT_MODIFIERS: PromptModifier[] = [
  // General modifiers
  {
    id: "step-by-step",
    label: "Step-by-Step",
    description: "Break down into clear steps",
    promptAddition: "Please provide a step-by-step breakdown.",
  },
  {
    id: "examples",
    label: "Include Examples",
    description: "Add practical examples",
    promptAddition: "Include relevant examples to illustrate the concepts.",
  },
  {
    id: "alternatives",
    label: "Show Alternatives",
    description: "Suggest different approaches",
    promptAddition: "Also suggest alternative approaches or solutions.",
  },
  {
    id: "best-practices",
    label: "Best Practices",
    description: "Follow industry standards",
    promptAddition: "Follow industry best practices and explain why.",
  },
  {
    id: "explain-reasoning",
    label: "Explain Reasoning",
    description: "Share thought process",
    promptAddition: "Explain your reasoning and decision-making process.",
  },
  // Engineering modifiers
  {
    id: "edge-cases",
    label: "Handle Edge Cases",
    description: "Consider corner cases",
    promptAddition: "Consider and handle potential edge cases.",
  },
  {
    id: "performance",
    label: "Optimize Performance",
    description: "Focus on efficiency",
    promptAddition: "Optimize for performance and explain the optimizations.",
  },
  {
    id: "security",
    label: "Security Focus",
    description: "Prioritize security",
    promptAddition: "Pay special attention to security considerations.",
  },
  {
    id: "testing",
    label: "Include Tests",
    description: "Add test coverage",
    promptAddition: "Include appropriate test cases or testing strategies.",
  },
  {
    id: "typescript",
    label: "TypeScript",
    description: "Use TypeScript types",
    promptAddition: "Use TypeScript with proper type annotations.",
  },
  {
    id: "error-handling",
    label: "Error Handling",
    description: "Robust error handling",
    promptAddition: "Include comprehensive error handling.",
  },
  {
    id: "comments",
    label: "Add Comments",
    description: "Document the code",
    promptAddition: "Add helpful comments to explain complex logic.",
  },
  // Business modifiers
  {
    id: "executive-summary",
    label: "Executive Summary",
    description: "Include high-level overview",
    promptAddition: "Include an executive summary at the beginning.",
  },
  {
    id: "action-items",
    label: "Action Items",
    description: "Extract actionable tasks",
    promptAddition: "Extract and list clear action items with owners if possible.",
  },
  {
    id: "pros-cons",
    label: "Pros & Cons",
    description: "List advantages and disadvantages",
    promptAddition: "Include a pros and cons analysis.",
  },
  {
    id: "timeline",
    label: "Timeline",
    description: "Include time estimates",
    promptAddition: "Include timeline estimates or scheduling considerations.",
  },
  {
    id: "cost-analysis",
    label: "Cost Analysis",
    description: "Consider budget impact",
    promptAddition: "Include cost analysis or budget considerations.",
  },
  {
    id: "risks",
    label: "Risk Assessment",
    description: "Identify potential risks",
    promptAddition: "Identify potential risks and mitigation strategies.",
  },
  {
    id: "stakeholders",
    label: "Stakeholders",
    description: "Consider all parties involved",
    promptAddition: "Consider all stakeholders and their perspectives.",
  },
  {
    id: "metrics",
    label: "Success Metrics",
    description: "Define measurable outcomes",
    promptAddition: "Define clear success metrics and KPIs.",
  },
];

// Prompt building logic (fallback when API unavailable)
export function buildPrompt(
  transcript: string,
  mode: string,
  detailLevel: string,
  outputFormat: string,
  modifiers: string[],
  contextInfo: string
): string {
  const modeOption = PROMPT_MODE_OPTIONS.find(m => m.id === mode);
  const modifierAdditions = modifiers
    .map(id => PROMPT_MODIFIERS.find(m => m.id === id)?.promptAddition)
    .filter(Boolean)
    .join(" ");

  let prompt = "";

  if (modeOption) {
    const modeInstructions: Record<string, string> = {
      // Engineering
      code: "I need help writing or modifying code.",
      planning: "I need help planning the implementation of a feature or project.",
      brainstorming: "I want to brainstorm ideas and explore different approaches.",
      design: "I need help with architecture or system design.",
      feedback: "I'm looking for feedback and suggestions on my approach.",
      technical: "I need a deep technical explanation.",
      debugging: "I need help debugging an issue.",
      review: "I'd like a code review or analysis.",
      documentation: "I need help writing documentation.",
      refactoring: "I need help refactoring and improving code structure.",
      // Business
      summary: "I need a clear summary of the following content.",
      transcript: "I need to summarize this meeting transcript and extract key points.",
      report: "I need to generate a detailed report.",
      "vendor-compare": "I need to compare vendors or products to make a decision.",
      analysis: "I need to analyze this data or situation.",
      email: "I need to draft a professional email.",
      proposal: "I need to write a proposal or pitch.",
      "meeting-notes": "I need to create organized meeting notes with action items.",
    };
    prompt += `## Task Type\n${modeInstructions[mode] || ""}\n\n`;
  }

  prompt += `## Request\n${transcript}\n\n`;

  if (contextInfo.trim()) {
    prompt += `## Additional Context\n${contextInfo}\n\n`;
  }

  const detailInstructions: Record<string, string> = {
    concise: "Keep the response concise and to the point.",
    balanced: "Provide a balanced level of detail.",
    comprehensive: "Provide a comprehensive and detailed response.",
  };
  prompt += `## Detail Level\n${detailInstructions[detailLevel] || detailInstructions.balanced}\n\n`;

  const formatInstructions: Record<string, string> = {
    structured: "Use clear sections with headers to organize the response.",
    conversational: "Use a natural, conversational tone.",
    "bullet-points": "Format the response as organized bullet points for easy scanning.",
  };
  prompt += `## Output Format\n${formatInstructions[outputFormat] || formatInstructions.structured}\n\n`;

  if (modifierAdditions) {
    prompt += `## Additional Requirements\n${modifierAdditions}\n`;
  }

  return prompt.trim();
}
