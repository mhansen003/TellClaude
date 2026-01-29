"use client";

import { useState } from "react";
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
  const [activeCategory, setActiveCategory] = useState<"engineering" | "business">(
    PROMPT_MODE_OPTIONS.find(m => m.id === selected)?.category || "engineering"
  );

  const engineeringModes = PROMPT_MODE_OPTIONS.filter(m => m.category === "engineering");
  const businessModes = PROMPT_MODE_OPTIONS.filter(m => m.category === "business");

  const currentModes = activeCategory === "engineering" ? engineeringModes : businessModes;

  return (
    <div className="py-3">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 mb-3">
        <label className="text-sm font-semibold text-text-secondary flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-claude-coral" />
          Mode
        </label>
        <div className="flex-1" />
        <div className="flex rounded-lg bg-bg-card border border-border-subtle p-0.5">
          <button
            onClick={() => setActiveCategory("engineering")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeCategory === "engineering"
                ? "bg-claude-orange text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Engineering
          </button>
          <button
            onClick={() => setActiveCategory("business")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeCategory === "business"
                ? "bg-claude-orange text-white"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Business
          </button>
        </div>
      </div>

      {/* Mode Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-1.5">
        {currentModes.map((mode) => {
          const isSelected = selected === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => onChange(mode.id)}
              className={`
                relative px-2.5 py-2 rounded-lg text-left transition-all duration-200
                border cursor-pointer group
                ${
                  isSelected
                    ? "bg-claude-glow border-claude-orange text-text-primary"
                    : "bg-bg-card border-border-subtle hover:border-claude-orange/30 text-text-secondary hover:text-text-primary"
                }
              `}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{mode.icon}</span>
                <span className={`text-xs font-semibold ${isSelected ? "text-claude-orange" : ""}`}>
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
