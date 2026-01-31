"use client";

import type { LLMProviderId } from "@/lib/llm-providers";

const HEADER_TEXT: Record<LLMProviderId, { title: string; target: string }> = {
  claude: { title: "Tell Claude", target: "Claude Code" },
  chatgpt: { title: "Tell ChatGPT", target: "ChatGPT" },
  gemini: { title: "Tell Gemini", target: "Gemini" },
};

interface HeaderProps {
  onAboutClick: () => void;
  onShareClick: () => void;
  provider?: LLMProviderId;
}

export default function Header({ onAboutClick, onShareClick, provider = "claude" }: HeaderProps) {
  const header = HEADER_TEXT[provider] || HEADER_TEXT.claude;
  return (
    <header className="pt-4 pb-2 md:pt-6 md:pb-3 px-4">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        {/* Logo + Title */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <img
            src="/logo.png"
            alt="Clear AI"
            className="h-9 md:h-10 w-auto"
          />
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
            onClick={onShareClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-card/80 border border-border-subtle text-text-muted hover:text-brand-primary hover:border-brand-primary/30 transition-all text-sm font-medium"
            title="Share this app via QR code"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM17 14v3m0 3h.01M14 17h3m3 0h.01M14 14h.01" />
            </svg>
            <span className="hidden sm:inline">Share</span>
          </button>
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
