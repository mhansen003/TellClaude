// Prompt Mode Types - Engineering + Business
export type PromptModeId =
  // Engineering modes
  | "code"
  | "planning"
  | "brainstorming"
  | "design"
  | "database"
  | "feedback"
  | "technical"
  | "debugging"
  | "review"
  | "documentation"
  | "refactoring"
  | "optimize"
  // Business modes
  | "summary"
  | "transcript"
  | "report"
  | "vendor-compare"
  | "analysis"
  | "email"
  | "proposal"
  | "meeting-notes"
  | "user-story"
  | "prd"
  | "okrs"
  | "stakeholder-update"
  | "release-notes"
  | "incident-report"
  | "runbook"
  | "presentation"
  | "faq"
  | "sow";

export type DetailLevelId = "concise" | "balanced" | "comprehensive";

export type OutputFormatId = "structured" | "conversational" | "bullet-points";

export interface PromptModeOption {
  id: PromptModeId;
  label: string;
  description: string;
  icon: string;
  color: string;
  category: "engineering" | "business";
}

export interface DetailLevelOption {
  id: DetailLevelId;
  label: string;
  icon: string;
}

export interface OutputFormatOption {
  id: OutputFormatId;
  label: string;
  description: string;
}

// Modifier checkboxes
export interface PromptModifier {
  id: string;
  label: string;
  description: string;
  promptAddition: string;
}

export interface PromptGenerationRequest {
  transcript: string;
  mode: PromptModeId;
  detailLevel: DetailLevelId;
  outputFormat: OutputFormatId;
  modifiers: string[]; // Array of modifier IDs
  contextInfo: string;
}
