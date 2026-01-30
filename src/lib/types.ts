// Prompt Mode Types - Engineering + Business + Marketing + Research (24 each)
export type PromptModeId =
  // Engineering modes (24)
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
  | "skill"
  | "plugin"
  | "mcp-server"
  | "cli"
  | "api"
  | "security-audit"
  | "auth-sso"
  | "otp-mfa"
  | "encryption"
  | "compliance"
  | "test-suite"
  | "devops"
  // Business modes (24)
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
  | "sow"
  | "budget"
  | "strategy"
  | "training"
  | "process-doc"
  | "contract"
  | "business-case"
  | "risk-register"
  // Marketing modes (24)
  | "ad-copy"
  | "social-media"
  | "landing-page"
  | "email-campaign"
  | "video-script"
  | "ai-avatar"
  | "seo-content"
  | "brand-voice"
  | "press-release"
  | "case-study"
  | "product-launch"
  | "influencer-brief"
  | "blog-post"
  | "newsletter"
  | "webinar-script"
  | "testimonial"
  | "content-calendar"
  | "tagline"
  | "product-desc"
  | "whitepaper"
  | "podcast-script"
  | "event-promo"
  | "competitive-pos"
  | "ab-test-copy"
  // Research modes (24)
  | "deep-research"
  | "competitive-analysis"
  | "market-research"
  | "literature-review"
  | "trend-analysis"
  | "feasibility-study"
  | "benchmarking"
  | "survey-design"
  | "data-synthesis"
  | "gap-analysis"
  | "swot"
  | "due-diligence"
  | "user-research"
  | "ab-test-design"
  | "roi-analysis"
  | "tech-evaluation"
  | "regulatory-review"
  | "customer-journey"
  | "patent-research"
  | "impact-analysis"
  | "best-practices-review"
  | "opportunity-assessment"
  | "risk-modeling"
  | "expert-synthesis";

export type DetailLevelId = "concise" | "balanced" | "comprehensive";

export type OutputFormatId = "structured" | "conversational" | "bullet-points";

export interface PromptModeOption {
  id: PromptModeId;
  label: string;
  description: string;
  icon: string;
  color: string;
  category: "engineering" | "business" | "marketing" | "research";
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
