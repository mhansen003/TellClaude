"use client";

interface HeaderProps {
  onAboutClick: () => void;
}

export default function Header({ onAboutClick }: HeaderProps) {
  return (
    <header className="text-center pt-8 pb-4 md:pt-12 md:pb-6 px-4 relative">
      {/* About Button - Top Right */}
      <button
        onClick={onAboutClick}
        className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-card/80 border border-border-subtle text-text-muted hover:text-claude-orange hover:border-claude-orange/30 transition-all text-sm font-medium"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="hidden sm:inline">About</span>
      </button>

      <div className="flex items-center justify-center gap-3 mb-3">
        {/* Claude-inspired logo */}
        <div className="w-11 h-11 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-claude-orange via-claude-coral to-claude-amber flex items-center justify-center shadow-lg shadow-claude-orange/30 animate-float claude-logo">
          <svg
            className="w-6 h-6 md:w-7 md:h-7 text-white"
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
          <h1 className="text-2xl md:text-4xl font-extrabold bg-gradient-to-r from-claude-orange via-claude-coral to-claude-amber bg-clip-text text-transparent">
            TellClaude
          </h1>
          <p className="text-text-muted text-xs font-medium tracking-wide uppercase">
            Voice to Perfect Prompt
          </p>
        </div>
      </div>
      <p className="text-text-secondary text-sm md:text-base max-w-lg mx-auto leading-relaxed">
        Speak your thoughts. Transform them into a perfectly structured prompt for{" "}
        <span className="text-claude-orange font-semibold">Claude Code</span>.
      </p>
    </header>
  );
}
