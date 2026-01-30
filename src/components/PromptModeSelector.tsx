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

  // Count selections per category for badge indicators
  const countByCategory = (catId: Category) =>
    PROMPT_MODE_OPTIONS.filter(m => m.category === catId && selected.includes(m.id)).length;

  // Get full option objects for all selected modes (for tag chips)
  const selectedOptions = selected
    .map(id => PROMPT_MODE_OPTIONS.find(m => m.id === id))
    .filter(Boolean);

  const handleToggle = (modeId: PromptModeId) => {
    if (selected.includes(modeId)) {
      // Remove — allow deselecting everything
      onChange(selected.filter(id => id !== modeId));
    } else {
      onChange([...selected, modeId]);
    }
  };

  const handleRemoveTag = (modeId: PromptModeId) => {
    onChange(selected.filter(id => id !== modeId));
  };

  const handleClearAll = () => {
    onChange([]);
    setActiveCategory("engineering");
  };

  const hasSelections = selected.length > 0;

  return (
    <div className="py-3">
      {/* Category Tabs */}
      <div className="flex items-center gap-2 mb-3">
        <label className="text-sm font-semibold text-text-secondary flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary" />
          Modes
        </label>
        {hasSelections && (
          <button
            onClick={handleClearAll}
            className="px-2 py-0.5 rounded-full bg-accent-rose/15 text-accent-rose text-[10px] font-bold hover:bg-accent-rose/25 transition-colors cursor-pointer"
            title="Clear all selected modes"
          >
            Clear All
          </button>
        )}
        <div className="flex-1" />
        <div className="flex rounded-lg bg-bg-card border border-border-subtle p-0.5">
          {categories.map((cat) => {
            const count = countByCategory(cat.id);
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`relative px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-brand-primary text-white"
                    : count > 0
                      ? "text-brand-primary bg-brand-primary/5"
                      : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {cat.label}
                {count > 0 && !isActive && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-brand-primary text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                    {count}
                  </span>
                )}
                {count > 0 && isActive && (
                  <span className="ml-1 text-[10px] opacity-80">({count})</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {currentModes.map((mode) => {
          const isSelected = selected.includes(mode.id);
          return (
            <button
              key={mode.id}
              onClick={() => handleToggle(mode.id)}
              className={`
                relative px-3 py-3 rounded-xl text-left transition-all duration-200
                border-2 cursor-pointer group min-w-0
                ${
                  isSelected
                    ? "bg-brand-glow border-brand-primary text-text-primary shadow-sm shadow-brand-primary/10"
                    : "bg-bg-card border-border-subtle hover:border-brand-primary/30 text-text-secondary hover:text-text-primary"
                }
              `}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg flex-shrink-0">{mode.icon}</span>
                <div className="min-w-0">
                  <span className={`text-sm font-bold block truncate ${isSelected ? "text-brand-primary" : ""}`}>
                    {mode.label}
                  </span>
                  <span className="text-[10px] text-text-muted block truncate">{mode.description}</span>
                </div>
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-brand-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Mode Tags — always visible, cross-category overview */}
      {hasSelections && (
        <div className="mt-3 pt-3 border-t border-border-subtle">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wide">Active Modes</span>
            <span className="px-1.5 py-0.5 rounded bg-brand-primary/20 text-brand-primary text-[10px] font-bold">
              {selectedOptions.length}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedOptions.map((mode) => {
              if (!mode) return null;
              // Find category for color-coding
              const cat = mode.category as Category;
              const catLabel = categories.find(c => c.id === cat)?.label;
              return (
                <span
                  key={mode.id}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-brand-primary/10 border border-brand-primary/20 text-xs font-medium text-brand-primary"
                >
                  <span className="text-xs">{mode.icon}</span>
                  <span className="truncate max-w-[120px]">{mode.label}</span>
                  <span className="text-[9px] text-brand-primary/50 hidden sm:inline">
                    {catLabel}
                  </span>
                  <button
                    onClick={() => handleRemoveTag(mode.id)}
                    className="ml-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-brand-primary/20 text-brand-primary/50 hover:text-brand-primary transition-colors cursor-pointer flex-shrink-0"
                    aria-label={`Remove ${mode.label}`}
                  >
                    <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
