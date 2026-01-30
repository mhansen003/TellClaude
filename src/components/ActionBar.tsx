"use client";

interface ActionBarProps {
  prompt: string;
  copied: boolean;
  onCopy: () => void;
  onReset: () => void;
}

export default function ActionBar({
  prompt,
  copied,
  onCopy,
  onReset,
}: ActionBarProps) {
  if (!prompt) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 md:static md:px-0 md:py-4 animate-fade_in z-50">
      <div className="glass md:bg-transparent md:backdrop-blur-none border-t border-border-subtle md:border-0 p-4 md:p-0">
        <div className="max-w-2xl mx-auto flex gap-3">
          {/* Copy Button - Primary Action */}
          <button
            onClick={onCopy}
            className={`
              flex-1 py-3.5 px-6 rounded-xl font-bold text-base transition-all duration-200
              flex items-center justify-center gap-2 cursor-pointer
              ${
                copied
                  ? "bg-accent-green text-white"
                  : "bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:brightness-110 hover:shadow-lg hover:shadow-brand-primary/30 active:scale-[0.99]"
              }
            `}
          >
            {copied ? (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy to Clipboard
              </>
            )}
          </button>

          {/* New Prompt Button */}
          <button
            onClick={onReset}
            className="px-5 py-3.5 rounded-xl bg-bg-card border-2 border-border-subtle text-text-secondary font-semibold text-sm transition-all hover:border-accent-rose/40 hover:text-accent-rose active:scale-[0.98] cursor-pointer whitespace-nowrap"
            title="Start fresh"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
