"use client";

import { PromptModeId } from "@/lib/types";
import { PROMPT_MODE_OPTIONS } from "@/lib/constants";

interface PromptModeSelectorProps {
  selected: PromptModeId;
  onChange: (mode: PromptModeId) => void;
}

export default function PromptModeSelector({
  selected,
  onChange,
}: PromptModeSelectorProps) {
  return (
    <div className="px-4 md:px-0 py-4">
      <label className="text-sm font-semibold text-text-secondary flex items-center gap-2 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-claude-coral" />
        Prompt Mode
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {PROMPT_MODE_OPTIONS.map((mode) => {
          const isSelected = selected === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onChange(mode.id)}
              className={`
                relative px-3 py-3 rounded-xl text-left transition-all duration-200
                border-2 cursor-pointer group
                ${
                  isSelected
                    ? "bg-claude-glow border-claude-orange text-text-primary"
                    : "bg-bg-card border-border-subtle hover:border-claude-orange/30 text-text-secondary hover:text-text-primary"
                }
              `}
            >
              {/* Icon and label */}
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{mode.icon}</span>
                <span className={`text-sm font-semibold ${isSelected ? "text-claude-orange" : ""}`}>
                  {mode.label}
                </span>
              </div>

              {/* Description (hidden on mobile for space) */}
              <p className="text-xs text-text-muted hidden sm:block truncate">
                {mode.description}
              </p>

              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-claude-orange" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
