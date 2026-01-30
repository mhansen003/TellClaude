"use client";

import { DetailLevelId } from "@/lib/types";
import { DETAIL_LEVEL_OPTIONS } from "@/lib/constants";
import { TooltipIcon } from "@/components/Tooltip";

interface DetailLevelSelectorProps {
  selected: DetailLevelId;
  onChange: (level: DetailLevelId) => void;
}

export default function DetailLevelSelector({
  selected,
  onChange,
}: DetailLevelSelectorProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-text-secondary flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-teal" />
          Detail Level
        </label>
        <TooltipIcon
          content="Concise: Quick, focused answers. Balanced: Standard detail. Detailed: Comprehensive explanations with examples."
          position="left"
        />
      </div>

      <div className="flex rounded-xl bg-bg-card border-2 border-border-subtle p-1">
        {DETAIL_LEVEL_OPTIONS.map((option) => {
          const isSelected = selected === option.id;
          return (
            <button
              key={option.id}
              onClick={() => onChange(option.id)}
              className={`
                flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer
                flex items-center justify-center gap-1
                ${
                  isSelected
                    ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg shadow-brand-primary/20"
                    : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                }
              `}
            >
              <span className={`text-sm ${isSelected ? "" : "opacity-50"}`}>{option.icon}</span>
              <span className="hidden sm:inline truncate">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
