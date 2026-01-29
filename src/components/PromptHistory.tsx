"use client";

import { useState } from "react";

export interface HistoryItem {
  id: string;
  timestamp: number;
  transcript: string;
  prompt: string;
  mode: string;
}

interface PromptHistoryProps {
  history: HistoryItem[];
  activeId: string | null;
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function PromptHistory({
  history,
  activeId,
  onSelect,
  onDelete,
  onClear,
  isOpen,
  onToggle,
}: PromptHistoryProps) {
  const [confirmClear, setConfirmClear] = useState(false);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const truncate = (text: string, length: number) => {
    if (text.length <= length) return text;
    return text.slice(0, length).trim() + "...";
  };

  const handleClearClick = () => {
    if (confirmClear) {
      onClear();
      setConfirmClear(false);
    } else {
      setConfirmClear(true);
      setTimeout(() => setConfirmClear(false), 3000);
    }
  };

  return (
    <>
      {/* Toggle Button (visible when sidebar is closed) */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed left-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-xl bg-bg-card border-2 border-border-subtle hover:border-claude-orange/50 text-text-secondary hover:text-claude-orange transition-all shadow-lg group"
          title="Open prompt history"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {history.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-claude-orange text-white text-xs font-bold flex items-center justify-center">
              {history.length > 99 ? "99+" : history.length}
            </span>
          )}
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed left-0 top-0 h-full z-50 transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Backdrop on mobile */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 md:hidden"
            onClick={onToggle}
          />
        )}

        {/* Sidebar content */}
        <div className="relative h-full w-80 bg-bg-secondary border-r-2 border-border-subtle shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-border-subtle bg-gradient-to-r from-claude-orange/10 to-transparent">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-claude-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-base font-bold text-text-primary">Prompt History</h2>
              <span className="px-2 py-0.5 rounded-full bg-claude-orange/20 text-claude-orange text-xs font-semibold">
                {history.length}
              </span>
            </div>
            <button
              onClick={onToggle}
              className="p-2 rounded-lg hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {history.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p className="text-sm">No prompts yet</p>
                <p className="text-xs mt-1">Generated prompts will appear here</p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className={`
                    relative p-3 rounded-xl cursor-pointer transition-all duration-200 group
                    border-2
                    ${
                      activeId === item.id
                        ? "bg-claude-glow border-claude-orange"
                        : "bg-bg-card border-border-subtle hover:border-claude-orange/30"
                    }
                  `}
                >
                  {/* Mode badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`
                      px-2 py-0.5 rounded-full text-xs font-semibold capitalize
                      ${activeId === item.id ? "bg-claude-orange text-white" : "bg-bg-elevated text-text-secondary"}
                    `}>
                      {item.mode}
                    </span>
                    <span className="text-xs text-text-muted">
                      {formatTime(item.timestamp)}
                    </span>
                  </div>

                  {/* Transcript preview */}
                  <p className={`text-sm mb-1 ${activeId === item.id ? "text-text-primary" : "text-text-secondary"}`}>
                    {truncate(item.transcript, 60)}
                  </p>

                  {/* Prompt preview */}
                  <p className="text-xs text-text-muted line-clamp-2">
                    {truncate(item.prompt, 80)}
                  </p>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-bg-elevated/80 text-text-muted opacity-0 group-hover:opacity-100 hover:text-accent-rose hover:bg-accent-rose/10 transition-all"
                    title="Delete"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>

                  {/* Active indicator */}
                  {activeId === item.id && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-claude-orange rounded-r-full" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {history.length > 0 && (
            <div className="p-3 border-t border-border-subtle">
              <button
                onClick={handleClearClick}
                className={`
                  w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-all
                  ${
                    confirmClear
                      ? "bg-accent-rose text-white"
                      : "bg-bg-card border border-border-subtle text-text-secondary hover:border-accent-rose/40 hover:text-accent-rose"
                  }
                `}
              >
                {confirmClear ? "Click again to confirm" : "Clear All History"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
