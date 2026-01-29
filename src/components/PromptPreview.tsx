"use client";

interface PromptPreviewProps {
  prompt: string;
  isVisible: boolean;
}

export default function PromptPreview({ prompt, isVisible }: PromptPreviewProps) {
  if (!isVisible || !prompt) return null;

  return (
    <div className="px-4 md:px-0 py-4 animate-fade_in">
      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-semibold text-text-secondary flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
            Generated Prompt
          </label>
          <span className="text-xs text-text-muted px-2 py-1 rounded-full bg-bg-elevated">
            Ready to copy
          </span>
        </div>

        {/* Prompt display */}
        <div className="relative group">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-claude-orange/20 to-claude-coral/10 blur-xl opacity-50" />
          <div className="relative bg-bg-card border-2 border-claude-orange/30 rounded-xl p-5 overflow-hidden">
            {/* Decorative corner */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-claude-orange/10 to-transparent" />

            {/* Content */}
            <pre className="prompt-output text-sm text-text-primary whitespace-pre-wrap leading-relaxed max-h-96 overflow-y-auto">
              {prompt}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
