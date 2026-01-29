"use client";

import { PROMPT_MODIFIERS } from "@/lib/constants";

interface ModifierCheckboxesProps {
  selected: string[];
  onChange: (modifiers: string[]) => void;
}

export default function ModifierCheckboxes({
  selected,
  onChange,
}: ModifierCheckboxesProps) {
  const toggleModifier = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((m) => m !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div>
      <label className="text-sm font-semibold text-text-secondary flex items-center gap-2 mb-3">
        <span className="w-1.5 h-1.5 rounded-full bg-accent-purple" />
        Prompt Modifiers
        {selected.length > 0 && (
          <span className="ml-2 px-2 py-0.5 rounded-full bg-claude-orange/20 text-claude-orange text-xs font-semibold">
            {selected.length} selected
          </span>
        )}
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {PROMPT_MODIFIERS.map((modifier) => {
          const isChecked = selected.includes(modifier.id);
          return (
            <label
              key={modifier.id}
              className={`
                flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200
                border-2 group
                ${
                  isChecked
                    ? "bg-claude-glow border-claude-orange/50"
                    : "bg-bg-card border-border-subtle hover:border-claude-orange/30"
                }
              `}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleModifier(modifier.id)}
                className="checkbox-claude mt-0.5 flex-shrink-0"
              />
              <div className="min-w-0">
                <span
                  className={`text-sm font-semibold block ${
                    isChecked ? "text-claude-orange" : "text-text-primary"
                  }`}
                >
                  {modifier.label}
                </span>
                <span className="text-xs text-text-muted block truncate">
                  {modifier.description}
                </span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
