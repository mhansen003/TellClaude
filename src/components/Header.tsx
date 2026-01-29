"use client";

export default function Header() {
  return (
    <header className="text-center pt-10 pb-6 md:pt-16 md:pb-10 px-4">
      <div className="flex items-center justify-center gap-3 mb-4">
        {/* Claude-inspired logo */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-claude-orange via-claude-coral to-claude-amber flex items-center justify-center shadow-lg shadow-claude-orange/30 animate-float claude-logo">
          <svg
            className="w-7 h-7 text-white"
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
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-claude-orange via-claude-coral to-claude-amber bg-clip-text text-transparent">
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
