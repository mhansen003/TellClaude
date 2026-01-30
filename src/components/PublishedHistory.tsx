"use client";

import { useState } from "react";
import { PublishedItem } from "@/lib/share";
import { useClipboard } from "@/hooks/useClipboard";

interface PublishedHistoryProps {
  items: PublishedItem[];
  onDelete: (id: string) => void;
  onClear: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function PublishedHistory({
  items,
  onDelete,
  onClear,
  isOpen,
  onToggle,
}: PublishedHistoryProps) {
  const [confirmClear, setConfirmClear] = useState(false);
  const { copyToClipboard } = useClipboard();
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  const handleCopyUrl = async (id: string, url: string) => {
    const success = await copyToClipboard(url);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
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
          className="fixed right-4 top-1/2 -translate-y-1/2 z-40 p-3 rounded-xl bg-bg-card border-2 border-border-subtle hover:border-accent-green/50 text-text-secondary hover:text-accent-green transition-all shadow-lg group"
          title="Open published prompts"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          {items.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-accent-green text-white text-xs font-bold flex items-center justify-center">
              {items.length > 99 ? "99+" : items.length}
            </span>
          )}
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed right-0 top-0 h-full z-50 transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}
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
        <div className="relative h-full w-80 bg-bg-secondary border-l-2 border-border-subtle shadow-2xl flex flex-col ml-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-border-subtle bg-gradient-to-l from-accent-green/10 to-transparent">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <h2 className="text-base font-bold text-text-primary">Published</h2>
              <span className="px-2 py-0.5 rounded-full bg-accent-green/20 text-accent-green text-xs font-semibold">
                {items.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {items.length > 0 && (
                <button
                  onClick={handleClearClick}
                  className={`p-2 rounded-lg transition-colors ${
                    confirmClear
                      ? "bg-accent-rose text-white"
                      : "text-text-muted hover:text-accent-rose hover:bg-accent-rose/10"
                  }`}
                  title={confirmClear ? "Click again to confirm" : "Clear all published"}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
              <button
                onClick={onToggle}
                className="p-2 rounded-lg hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Published List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {items.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <p className="text-sm">No published prompts</p>
                <p className="text-xs mt-1">Use the Publish button to share prompts</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="relative p-3 rounded-xl bg-bg-card border-2 border-border-subtle hover:border-accent-green/30 transition-all duration-200 group"
                >
                  {/* Mode badge + time */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded-full bg-accent-green/20 text-accent-green text-xs font-semibold capitalize">
                      {item.modes.split(",").join(" + ")}
                    </span>
                    <span className="text-xs text-text-muted">
                      {formatTime(item.timestamp)}
                    </span>
                  </div>

                  {/* Transcript preview */}
                  <p className="text-sm text-text-secondary mb-2">
                    {truncate(item.transcript, 60)}
                  </p>

                  {/* Action buttons */}
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleCopyUrl(item.id, item.url)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        copiedId === item.id
                          ? "bg-accent-green text-white"
                          : "bg-bg-elevated text-text-secondary hover:text-accent-green hover:bg-accent-green/10"
                      }`}
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {copiedId === item.id ? "Copied!" : "Copy Link"}
                    </button>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-bg-elevated text-text-secondary hover:text-accent-purple hover:bg-accent-purple/10 transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      View
                    </a>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={() => onDelete(item.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-bg-elevated/80 text-text-muted opacity-0 group-hover:opacity-100 hover:text-accent-rose hover:bg-accent-rose/10 transition-all"
                    title="Delete"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
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
                {confirmClear ? "Click again to confirm" : "Clear All Published"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
