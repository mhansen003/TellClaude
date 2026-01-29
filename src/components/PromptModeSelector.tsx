"use client";

import { useState } from "react";
import { PromptModeId } from "@/lib/types";
import { PROMPT_MODE_OPTIONS } from "@/lib/constants";

type Category = "engineering" | "business" | "marketing" | "research";

interface PromptModeSelectorProps {
  selected: PromptModeId[];
  onChange: (modes: PromptModeId[]) => void;
}

export default function PromptModeSelector({
  selected,
  onChange,
}: PromptModeSelectorProps) {
  const firstSelected = selected[0];
  const [activeCategory, setActiveCategory] = useState<Category>(
    (firstSelected && PROMPT_MODE_OPTIONS.find(m => m.id === firstSelected)?.category as Category) || "engineering"
  );

  const categories: { id: Category; label: string }[] = [
    { id: "engineering", label: "Engineering" },
    { id: "business", label: "Business" },
    { id: "marketing", label: "Marketing" },
    { id: "research", label: "Research" },
  ];

  const currentModes = PROMPT_MODE_OPTIONS.filter(m => m.category === activeCategory);

  const handleToggle = (modeId: PromptModeId) => {
    if (selected.includes(modeId)) {
      // Remove — but always keep at least one selected
      if (selected.length > 1) {
        onChange(selected.filter(id => id !== modeId));
      }
    } else {
      onChange([...selected, modeId]);
    }
  };

  return (
    <div className="py-3">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 mb-3">
        <label className="text-sm font-semibold text-text-secondary flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-claude-coral" />
          Modes
        </label>
        {selected.length > 1 && (
          <span className="px-2 py-0.5 rounded-full bg-claude-orange/20 text-claude-orange text-[10px] font-bold">
            {selected.length} selected
          </span>
        )}
        <div className="flex-1" />
        <div className="flex rounded-lg bg-bg-card border border-border-subtle p-0.5">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                activeCategory === cat.id
                  ? "bg-claude-orange text-white"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Grid - max 4 columns to prevent overflow */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5">
        {currentModes.map((mode) => {
          const isSelected = selected.includes(mode.id);
          return (
            <button
              key={mode.id}
              onClick={() => handleToggle(mode.id)}
              className={`
                relative px-2 py-2 rounded-lg text-left transition-all duration-200
                border cursor-pointer group min-w-0
                ${
                  isSelected
                    ? "bg-claude-glow border-claude-orange text-text-primary"
                    : "bg-bg-card border-border-subtle hover:border-claude-orange/30 text-text-secondary hover:text-text-primary"
                }
              `}
            >
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-sm flex-shrink-0">{mode.icon}</span>
                <span className={`text-xs font-semibold truncate ${isSelected ? "text-claude-orange" : ""}`}>
                  {mode.label}
                </span>
              </div>
              {isSelected && (
                <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-claude-orange" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
