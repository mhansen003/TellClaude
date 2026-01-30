"use client";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-bg-secondary border-2 border-brand-primary/30 rounded-2xl shadow-2xl shadow-brand-primary/10 overflow-hidden animate-fade_in flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-gradient-to-r from-brand-primary/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">How to Use TellClaude</h2>
              <p className="text-xs text-text-muted">Transform your voice into perfect prompts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0 space-y-6">
          {/* Overview */}
          <div className="p-4 rounded-xl bg-brand-glow border border-brand-primary/20">
            <h3 className="text-sm font-bold text-brand-primary mb-2 flex items-center gap-2">
              <span>✨</span> What is TellClaude?
            </h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              TellClaude transforms your spoken or typed ideas into well-structured prompts optimized for Claude Code.
              Whether you&apos;re coding, planning, or analyzing - get better results by expressing your needs naturally.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-primary/20 text-brand-primary flex items-center justify-center text-xs font-bold">?</span>
              Step-by-Step Guide
            </h3>

            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold text-sm">
                1
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-text-primary mb-1">Speak or Type Your Request</h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Click the glowing microphone to speak your idea, or type directly in the text box.
                  Don&apos;t worry about being perfect - just express what you want to accomplish.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold text-sm">
                2
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-text-primary mb-1">Choose Your Mode</h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Select from <strong>Engineering</strong> modes (Code, Debug, Design, etc.) or <strong>Business</strong> modes
                  (Summary, Report, Email, etc.) to tailor the prompt to your task type.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold text-sm">
                3
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-text-primary mb-1">Customize with Modifiers (Optional)</h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Expand &quot;Prompt Modifiers&quot; to add specific requirements like step-by-step instructions,
                  code examples, error handling, or executive summaries.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold text-sm">
                4
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-text-primary mb-1">Generate & Copy</h4>
                <p className="text-xs text-text-muted leading-relaxed">
                  Click the glowing &quot;Generate Prompt&quot; button. Claude Opus 4.5 will transform your input
                  into a structured prompt. Copy it and paste into Claude Code!
                </p>
              </div>
            </div>
          </div>

          {/* Interview Mode */}
          <div className="p-4 rounded-xl bg-accent-purple/10 border border-accent-purple/20">
            <h3 className="text-sm font-bold text-accent-purple mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Interview Mode
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Not sure what you need? Click <strong>Interview</strong> to have an AI conversation that helps
              you clarify your requirements. The AI asks smart questions and builds the perfect prompt for you.
            </p>
          </div>

          {/* Tips */}
          <div className="p-4 rounded-xl bg-bg-card border border-border-subtle">
            <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
              <span className="text-brand-primary">💡</span> Pro Tips
            </h3>
            <ul className="text-xs text-text-muted space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-accent-green">✓</span>
                <span>Be specific about the outcome you want, not just the task</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-green">✓</span>
                <span>Include technology/framework names for coding tasks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-green">✓</span>
                <span>Use &quot;Detailed&quot; level for complex problems, &quot;Concise&quot; for quick fixes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-accent-green">✓</span>
                <span>Your prompt history is saved - click the sidebar icon to revisit past prompts</span>
              </li>
            </ul>
          </div>

          {/* Footer */}
          <div className="text-center pt-2">
            <p className="text-xs text-text-muted">
              Powered by <span className="text-brand-primary font-semibold">Claude Opus 4.5</span> via OpenRouter
            </p>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex-shrink-0 p-4 border-t border-border-subtle bg-bg-card/50">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-sm hover:brightness-110 transition-all"
          >
            Got it, let&apos;s go!
          </button>
        </div>
      </div>
    </div>
  );
}
