"use client";

import { OutputFormatId } from "@/lib/types";
import { OUTPUT_FORMAT_OPTIONS } from "@/lib/constants";

interface OutputFormatSelectorProps {
  selected: OutputFormatId;
  onChange: (format: OutputFormatId) => void;
}

export default function OutputFormatSelector({
  selected,
  onChange,
}: OutputFormatSelectorProps) {
  return (
    <div className="flex-1">
      <label className="text-sm font-semibold text-text-secondary flex items-center gap-2 mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-blue" />
        Output Format
      </label>

      <div className="flex rounded-xl bg-bg-card border-2 border-border-subtle p-1">
        {OUTPUT_FORMAT_OPTIONS.map((option) => {
          const isSelected = selected === option.id;
          return (
            <button
              key={option.id}
              onClick={() => onChange(option.id)}
              className={`
                flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer
                truncate
                ${
                  isSelected
                    ? "bg-gradient-to-r from-claude-orange to-claude-coral text-white shadow-lg shadow-claude-orange/20"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                }
              `}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
