"use client";

import { useState, useCallback } from "react";
import { PromptModeId } from "@/lib/types";
import PromptModeSelector from "./PromptModeSelector";
import ModifierCheckboxes from "./ModifierCheckboxes";

interface ModeModifierModalProps {
  isOpen: boolean;
  onClose: () => void;
  modes: PromptModeId[];
  onModesChange: (modes: PromptModeId[]) => void;
  modifiers: string[];
  onModifiersChange: (modifiers: string[]) => void;
  transcript: string;
}

export default function ModeModifierModal({
  isOpen,
  onClose,
  modes,
  onModesChange,
  modifiers,
  onModifiersChange,
  transcript,
}: ModeModifierModalProps) {
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleSuggest = useCallback(async () => {
    if (!transcript.trim() || isSuggesting) return;
    setIsSuggesting(true);
    try {
      const response = await fetch("/api/suggest-modes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: transcript.trim() }),
      });
      const data = await response.json();
      if (data.modes && Array.isArray(data.modes)) {
        onModesChange(data.modes as PromptModeId[]);
      }
      if (data.modifiers && Array.isArray(data.modifiers)) {
        onModifiersChange(data.modifiers);
      }
    } catch (error) {
      console.error("Suggest modes failed:", error);
    }
    setIsSuggesting(false);
  }, [transcript, isSuggesting, onModesChange, onModifiersChange]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-bg-secondary border-2 border-brand-primary/30 rounded-2xl shadow-2xl shadow-brand-primary/10 overflow-hidden animate-fade_in flex flex-col">
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-gradient-to-r from-brand-primary/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Mode & Modifiers</h2>
              <p className="text-xs text-text-muted">Choose what type of prompt to generate</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Suggest for me button */}
            <button
              onClick={handleSuggest}
              disabled={!transcript.trim() || isSuggesting}
              className="px-3 py-2 rounded-lg bg-accent-purple/20 text-accent-purple hover:bg-accent-purple hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSuggesting ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  Suggest for me
                </>
              )}
            </button>
            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5">
          {/* Mode Selector */}
          <PromptModeSelector selected={modes} onChange={onModesChange} />

          {/* Divider */}
          <div className="border-t border-border-subtle" />

          {/* Modifiers */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-text-secondary">+ Add Modifiers</span>
            </div>
            <ModifierCheckboxes selected={modifiers} onChange={onModifiersChange} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-border-subtle bg-bg-card/50">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-sm hover:brightness-110 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
