// Prompt Mode Types
export type PromptModeId =
  | "code"
  | "planning"
  | "brainstorming"
  | "design"
  | "feedback"
  | "technical"
  | "debugging"
  | "review"
  | "documentation"
  | "refactoring";

export type DetailLevelId = "concise" | "balanced" | "comprehensive";

export type OutputFormatId = "structured" | "conversational" | "bullet-points";

export interface PromptModeOption {
  id: PromptModeId;
  label: string;
  description: string;
  icon: string;
  color: string;
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
