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

      <div className="flex flex-col sm:flex-row gap-2">
        {OUTPUT_FORMAT_OPTIONS.map((option) => {
          const isSelected = selected === option.id;
          return (
            <button
              key={option.id}
              onClick={() => onChange(option.id)}
              className={`
                flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer
                border-2
                ${
                  isSelected
                    ? "bg-claude-glow border-claude-orange text-claude-orange"
                    : "bg-bg-card border-border-subtle text-text-secondary hover:border-claude-orange/30 hover:text-text-primary"
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
