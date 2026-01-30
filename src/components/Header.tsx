"use client";

import type { LLMProviderId } from "@/lib/llm-providers";

const HEADER_TEXT: Record<LLMProviderId, { title: string; target: string }> = {
  claude: { title: "TellClaude", target: "Claude Code" },
  chatgpt: { title: "TellGPT", target: "ChatGPT" },
  gemini: { title: "TellGemini", target: "Gemini" },
};

interface HeaderProps {
  onAboutClick: () => void;
  provider?: LLMProviderId;
}

export default function Header({ onAboutClick, provider = "claude" }: HeaderProps) {
  const header = HEADER_TEXT[provider] || HEADER_TEXT.claude;
  return (
    <header className="pt-4 pb-2 md:pt-6 md:pb-3 px-4">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        {/* Logo + Title */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-2xl bg-gradient-to-br from-brand-primary via-brand-secondary to-brand-accent flex items-center justify-center shadow-lg shadow-brand-primary/30 animate-float brand-logo">
            <svg
              className="w-5 h-5 md:w-6 md:h-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
              />
            </svg>
          </div>
          <div className="text-left">
            <h1 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-accent bg-clip-text text-transparent leading-tight">
              {header.title}
            </h1>
            <p className="text-text-muted text-[10px] md:text-xs font-medium tracking-wide uppercase">
              Voice to Perfect Prompt
            </p>
          </div>
        </div>

        {/* Description - inline, hidden on small screens */}
        <p className="hidden md:block text-text-secondary text-sm leading-snug flex-1">
          Speak your thoughts. Transform them into a perfectly structured prompt for{" "}
          <span className="text-brand-primary font-semibold">{header.target}</span>.
        </p>

        {/* Version & About */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          <span className="text-xs text-text-muted font-mono">v1.1.0</span>
          <button
            onClick={onAboutClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-card/80 border border-border-subtle text-text-muted hover:text-brand-primary hover:border-brand-primary/30 transition-all text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="hidden sm:inline">About</span>
          </button>
        </div>
      </div>
    </header>
  );
}
