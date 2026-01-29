import { PromptModeOption, DetailLevelOption, OutputFormatOption, PromptModifier } from "./types";

export const PROMPT_MODE_OPTIONS: PromptModeOption[] = [
  {
    id: "code",
    label: "Code",
    description: "Write or modify code",
    icon: "{ }",
    color: "bg-claude-orange",
  },
  {
    id: "planning",
    label: "Planning",
    description: "Plan implementation strategy",
    icon: "📋",
    color: "bg-accent-blue",
  },
  {
    id: "brainstorming",
    label: "Brainstorm",
    description: "Explore ideas and approaches",
    icon: "💡",
    color: "bg-accent-purple",
  },
  {
    id: "design",
    label: "Design",
    description: "Architecture and system design",
    icon: "🎨",
    color: "bg-accent-teal",
  },
  {
    id: "feedback",
    label: "Feedback",
    description: "Get code review or suggestions",
    icon: "💬",
    color: "bg-accent-green",
  },
  {
    id: "technical",
    label: "Technical",
    description: "Deep technical explanations",
    icon: "⚙️",
    color: "bg-claude-deep",
  },
  {
    id: "debugging",
    label: "Debug",
    description: "Find and fix issues",
    icon: "🐛",
    color: "bg-accent-rose",
  },
  {
    id: "review",
    label: "Review",
    description: "Analyze existing code",
    icon: "🔍",
    color: "bg-accent-blue",
  },
  {
    id: "documentation",
    label: "Docs",
    description: "Write documentation",
    icon: "📝",
    color: "bg-accent-teal",
  },
  {
    id: "refactoring",
    label: "Refactor",
    description: "Improve code structure",
    icon: "♻️",
    color: "bg-accent-green",
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
    label: "Conversational",
    description: "Natural dialogue flow",
  },
  {
    id: "bullet-points",
    label: "Bullet Points",
    description: "Scannable list format",
  },
];

export const PROMPT_MODIFIERS: PromptModifier[] = [
  {
    id: "step-by-step",
    label: "Step-by-Step",
    description: "Break down into clear steps",
    promptAddition: "Please provide a step-by-step breakdown.",
  },
  {
    id: "examples",
    label: "Include Examples",
    description: "Add code examples",
    promptAddition: "Include relevant code examples to illustrate the concepts.",
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
    id: "explain-reasoning",
    label: "Explain Reasoning",
    description: "Share thought process",
    promptAddition: "Explain your reasoning and decision-making process.",
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
];

// Prompt building logic
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

  // Build the structured prompt
  let prompt = "";

  // Add mode context
  if (modeOption) {
    const modeInstructions: Record<string, string> = {
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
    };
    prompt += `## Task Type\n${modeInstructions[mode] || ""}\n\n`;
  }

  // Add the user's request
  prompt += `## Request\n${transcript}\n\n`;

  // Add context if provided
  if (contextInfo.trim()) {
    prompt += `## Additional Context\n${contextInfo}\n\n`;
  }

  // Add detail level instruction
  const detailInstructions: Record<string, string> = {
    concise: "Keep the response concise and to the point.",
    balanced: "Provide a balanced level of detail.",
    comprehensive: "Provide a comprehensive and detailed response.",
  };
  prompt += `## Detail Level\n${detailInstructions[detailLevel] || detailInstructions.balanced}\n\n`;

  // Add output format instruction
  const formatInstructions: Record<string, string> = {
    structured: "Use clear sections with headers to organize the response.",
    conversational: "Use a natural, conversational tone.",
    "bullet-points": "Format the response as organized bullet points for easy scanning.",
  };
  prompt += `## Output Format\n${formatInstructions[outputFormat] || formatInstructions.structured}\n\n`;

  // Add modifier instructions
  if (modifierAdditions) {
    prompt += `## Additional Requirements\n${modifierAdditions}\n`;
  }

  return prompt.trim();
}
