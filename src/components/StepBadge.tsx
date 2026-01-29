"use client";

interface StepBadgeProps {
  step: number;
  label: string;
  isActive?: boolean;
  isComplete?: boolean;
}

export default function StepBadge({ step, label, isActive = false, isComplete = false }: StepBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`
          w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
          transition-all duration-300
          ${isComplete
            ? "bg-accent-green text-white"
            : isActive
              ? "bg-claude-orange text-white ring-2 ring-claude-orange/30 ring-offset-2 ring-offset-bg-card"
              : "bg-bg-elevated text-text-muted border border-border-subtle"
          }
        `}
      >
        {isComplete ? (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          step
        )}
      </div>
      <span
        className={`text-sm font-semibold transition-colors ${
          isActive ? "text-claude-orange" : isComplete ? "text-accent-green" : "text-text-secondary"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

// A lightweight version for inline use that just shows the step number
export function StepNumber({ step }: { step: number }) {
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-claude-orange to-claude-coral text-white text-xs font-bold mr-2">
      {step}
    </span>
  );
}
