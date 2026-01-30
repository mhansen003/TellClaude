export type LLMProviderId = "claude" | "chatgpt" | "gemini";

export interface LLMModel {
  id: string;
  label: string;
  tier: "flagship" | "standard" | "fast";
}

export interface LLMProvider {
  id: LLMProviderId;
  label: string;
  theme: string;
  defaultModel: string;
  models: LLMModel[];
}

export const LLM_PROVIDERS: LLMProvider[] = [
  {
    id: "claude",
    label: "Claude",
    theme: "claude",
    defaultModel: "anthropic/claude-opus-4",
    models: [
      { id: "anthropic/claude-opus-4", label: "Claude Opus 4", tier: "flagship" },
      { id: "anthropic/claude-sonnet-4", label: "Claude Sonnet 4", tier: "standard" },
      { id: "anthropic/claude-3.5-haiku", label: "Claude 3.5 Haiku", tier: "fast" },
    ],
  },
  {
    id: "chatgpt",
    label: "ChatGPT",
    theme: "chatgpt",
    defaultModel: "openai/gpt-4o",
    models: [
      { id: "openai/gpt-4o", label: "GPT-4o", tier: "flagship" },
      { id: "openai/gpt-4o-mini", label: "GPT-4o Mini", tier: "standard" },
      { id: "openai/o3-mini", label: "o3-mini", tier: "fast" },
    ],
  },
  {
    id: "gemini",
    label: "Gemini",
    theme: "gemini",
    defaultModel: "google/gemini-2.5-pro",
    models: [
      { id: "google/gemini-2.5-pro", label: "Gemini 2.5 Pro", tier: "flagship" },
      { id: "google/gemini-2.5-flash", label: "Gemini 2.5 Flash", tier: "standard" },
      { id: "google/gemini-2.0-flash", label: "Gemini 2.0 Flash", tier: "fast" },
    ],
  },
];

export const ALLOWED_MODELS = LLM_PROVIDERS.flatMap(p => p.models.map(m => m.id));

export function getProvider(id: LLMProviderId): LLMProvider {
  return LLM_PROVIDERS.find(p => p.id === id) || LLM_PROVIDERS[0];
}

export function getProviderForModel(modelId: string): LLMProvider {
  return LLM_PROVIDERS.find(p => p.models.some(m => m.id === modelId)) || LLM_PROVIDERS[0];
}

export function getModelLabel(modelId: string): string {
  for (const provider of LLM_PROVIDERS) {
    const model = provider.models.find(m => m.id === modelId);
    if (model) return model.label;
  }
  return modelId;
}
