"use client";

import { LLM_PROVIDERS, type LLMProviderId } from "@/lib/llm-providers";

interface LLMSelectorProps {
  provider: LLMProviderId;
  onProviderChange: (provider: LLMProviderId) => void;
}

const PROVIDER_ICONS: Record<LLMProviderId, React.ReactNode> = {
  claude: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.5 2.3L9.2 21.7l2.7-.5 2.3-6.2h5.3l1.3 3.5 2.5-.5L16.5 2.3zm-.6 4.5l2 5.2h-3.8l1.8-5.2zM4.7 7.5L2 8.2l3.7 9.8 2.5-.5L4.7 7.5z" />
    </svg>
  ),
  chatgpt: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.2 14.7c.4-1.2.2-2.5-.5-3.6l-.1-.1c.5-1.2.4-2.5-.3-3.5-.7-1.1-1.8-1.8-3.1-1.9h-.1c-.7-1-1.8-1.7-3-1.9-1.3-.2-2.6.2-3.5 1l-.1.1c-1.2-.4-2.5-.2-3.6.5-1.1.7-1.8 1.8-1.9 3.1v.1c-1 .7-1.7 1.8-1.9 3-.2 1.3.2 2.6 1 3.5l.1.1c-.5 1.2-.4 2.5.3 3.5.7 1.1 1.8 1.8 3.1 1.9h.1c.7 1 1.8 1.7 3 1.9 1.3.2 2.6-.2 3.5-1l.1-.1c1.2.4 2.5.2 3.6-.5 1.1-.7 1.8-1.8 1.9-3.1v-.1c1-.7 1.7-1.7 1.9-2.9zM12 17.1l-1-1.7-1 1.7H8.5l1.5-2.6-1.5-2.6H10l1 1.7 1-1.7h1.5l-1.5 2.6 1.5 2.6H12z" />
    </svg>
  ),
  gemini: (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
    </svg>
  ),
};


export default function LLMSelector({ provider, onProviderChange }: LLMSelectorProps) {
  return (
    <div className="bg-bg-card rounded-2xl border border-border-subtle p-4 space-y-3">
      <div>
        <span className="text-sm font-semibold text-text-secondary flex items-center gap-2">
          <svg className="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Target AI
        </span>
        <p className="text-[11px] text-text-muted mt-0.5 ml-6">Which AI will you paste this prompt into?</p>
      </div>

      {/* Provider Pills */}
      <div className="flex gap-2">
        {LLM_PROVIDERS.map((p) => (
          <button
            key={p.id}
            onClick={() => onProviderChange(p.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              provider === p.id
                ? "bg-brand-primary text-white shadow-md shadow-brand-primary/20"
                : "bg-bg-elevated text-text-secondary hover:text-text-primary hover:bg-bg-elevated/80"
            }`}
          >
            {PROVIDER_ICONS[p.id]}
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
