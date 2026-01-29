"use client";

import { DetailLevelId } from "@/lib/types";
import { DETAIL_LEVEL_OPTIONS } from "@/lib/constants";

interface DetailLevelSelectorProps {
  selected: DetailLevelId;
  onChange: (level: DetailLevelId) => void;
}

export default function DetailLevelSelector({
  selected,
  onChange,
}: DetailLevelSelectorProps) {
  return (
    <div className="flex-1">
      <label className="text-sm font-semibold text-text-secondary flex items-center gap-2 mb-2">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-teal" />
        Detail Level
      </label>

      <div className="flex rounded-xl bg-bg-card border-2 border-border-subtle p-1">
        {DETAIL_LEVEL_OPTIONS.map((option) => {
          const isSelected = selected === option.id;
          return (
            <button
              key={option.id}
              onClick={() => onChange(option.id)}
              className={`
                flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer
                flex items-center justify-center gap-1.5
                ${
                  isSelected
                    ? "bg-gradient-to-r from-claude-orange to-claude-coral text-white shadow-lg shadow-claude-orange/20"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                }
              `}
            >
              <span className={`text-base ${isSelected ? "" : "opacity-50"}`}>{option.icon}</span>
              <span className="hidden sm:inline">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
