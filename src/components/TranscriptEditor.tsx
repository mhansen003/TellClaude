"use client";

import { useState } from "react";

interface TranscriptEditorProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  isListening: boolean;
}

export default function TranscriptEditor({
  value,
  onChange,
  onClear,
  isListening,
}: TranscriptEditorProps) {
  const [copied, setCopied] = useState(false);
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  const handleCopy = async () => {
    if (!value.trim()) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div>
      <div className="relative group">
        {/* Label */}
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-text-secondary flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-claude-orange" />
            Your Message
          </label>
          {value.trim() && (
            <span className="text-xs text-text-muted">
              {wordCount} word{wordCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Textarea */}
        <div className="relative">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={
              isListening
                ? "Speaking will appear here..."
                : "Type or speak your message here. What do you want to ask Claude Code?"
            }
            className={`
              w-full h-36 p-4 rounded-xl
              bg-bg-card border-2 transition-all duration-200
              text-text-primary placeholder:text-text-muted
              resize-none focus:outline-none
              ${
                isListening
                  ? "border-claude-orange/50 bg-claude-glow"
                  : "border-border-subtle hover:border-claude-orange/30 focus:border-claude-orange/50"
              }
            `}
          />

          {/* Action buttons */}
          {value.trim() && !isListening && (
            <div className="absolute top-3 right-3 flex items-center gap-1">
              {/* Copy button */}
              <button
                onClick={handleCopy}
                className={`p-1.5 rounded-lg transition-colors ${
                  copied
                    ? "bg-accent-green/20 text-accent-green"
                    : "bg-bg-elevated/80 text-text-muted hover:text-claude-orange hover:bg-claude-orange/10"
                }`}
                title={copied ? "Copied!" : "Copy message"}
              >
                {copied ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
              {/* Clear button */}
              <button
                onClick={onClear}
                className="p-1.5 rounded-lg bg-bg-elevated/80 text-text-muted hover:text-accent-rose hover:bg-accent-rose/10 transition-colors"
                title="Clear message"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Recording indicator */}
        {isListening && (
          <div className="absolute -top-1 -right-1 flex items-center gap-1.5 px-2 py-1 rounded-full bg-claude-orange text-white text-xs font-semibold">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            Recording
          </div>
        )}
      </div>
    </div>
  );
}
