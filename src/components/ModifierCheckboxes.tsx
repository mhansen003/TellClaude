"use client";

import { useState } from "react";
import { PROMPT_MODIFIERS } from "@/lib/constants";

interface ModifierCheckboxesProps {
  selected: string[];
  onChange: (modifiers: string[]) => void;
}

export default function ModifierCheckboxes({
  selected,
  onChange,
}: ModifierCheckboxesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleModifier = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((m) => m !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  // Show selected modifiers as preview when collapsed
  const selectedModifiers = PROMPT_MODIFIERS.filter(m => selected.includes(m.id));

  return (
    <div>
      {/* Header - Always visible, clickable to expand/collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-2 group"
      >
        <label className="text-sm font-semibold text-text-secondary flex items-center gap-2 cursor-pointer">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-purple" />
          Prompt Modifiers
          {selected.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-claude-orange/20 text-claude-orange text-xs font-semibold">
              {selected.length}
            </span>
          )}
        </label>
        <svg
          className={`w-5 h-5 text-text-muted transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Selected Preview - Show when collapsed and has selections */}
      {!isExpanded && selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedModifiers.map((modifier) => (
            <span
              key={modifier.id}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-claude-orange/10 text-claude-orange text-xs font-medium"
            >
              {modifier.label}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleModifier(modifier.id);
                }}
                className="hover:text-white transition-colors"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Expanded Grid */}
      {isExpanded && (
        <div className="grid grid-cols-2 gap-1.5 mt-3 animate-fade_in">
          {PROMPT_MODIFIERS.map((modifier) => {
            const isChecked = selected.includes(modifier.id);
            return (
              <label
                key={modifier.id}
                className={`
                  flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all duration-200
                  border group
                  ${
                    isChecked
                      ? "bg-claude-glow border-claude-orange/50"
                      : "bg-bg-elevated/50 border-border-subtle hover:border-claude-orange/30"
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleModifier(modifier.id)}
                  className="checkbox-claude flex-shrink-0"
                />
                <span
                  className={`text-xs font-medium truncate ${
                    isChecked ? "text-claude-orange" : "text-text-secondary"
                  }`}
                  title={modifier.description}
                >
                  {modifier.label}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
