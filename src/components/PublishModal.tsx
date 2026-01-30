"use client";

import { useState } from "react";
import { useClipboard } from "@/hooks/useClipboard";

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
}

export default function PublishModal({ isOpen, onClose, shareUrl }: PublishModalProps) {
  const { copied, copyToClipboard } = useClipboard();
  const [justPublished, setJustPublished] = useState(true);

  if (!isOpen) return null;

  const handleCopy = async () => {
    await copyToClipboard(shareUrl);
    setJustPublished(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-bg-card rounded-2xl border border-border-subtle shadow-2xl max-w-lg w-full animate-fade_in overflow-hidden">
        {/* Success header */}
        <div className="px-6 py-5 bg-gradient-to-r from-accent-green/15 to-accent-teal/10 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent-green/20 flex items-center justify-center">
              {justPublished ? (
                <svg className="w-5 h-5 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">
                {justPublished ? "Published!" : "Share Link"}
              </h2>
              <p className="text-xs text-text-muted">
                Anyone with this link can view your prompt
              </p>
            </div>
          </div>
        </div>

        {/* URL display */}
        <div className="px-6 py-5 space-y-4">
          <div className="bg-bg-elevated rounded-xl border border-border-subtle p-3">
            <p className="text-xs font-semibold text-text-muted mb-2 uppercase tracking-wider">Shareable Link</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-transparent text-sm text-text-secondary font-mono truncate outline-none"
                onClick={(e) => (e.target as HTMLInputElement).select()}
              />
              <button
                onClick={handleCopy}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  copied
                    ? "bg-accent-green text-white"
                    : "bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:brightness-110"
                }`}
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2 text-xs text-text-muted">
            <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-accent-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>
              This link contains your prompt data encoded directly in the URL. No data is stored on any server — the link works forever.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border-subtle bg-bg-elevated/30 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-bg-elevated text-text-secondary hover:text-text-primary text-sm font-semibold transition-colors border border-border-subtle"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
