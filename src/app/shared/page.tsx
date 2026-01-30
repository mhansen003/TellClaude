"use client";

import { useState, useEffect } from "react";
import { decodePromptData, SharedPromptData } from "@/lib/share";
import { getModelLabel } from "@/lib/llm-providers";
import { useClipboard } from "@/hooks/useClipboard";
import FormattedPrompt from "@/components/FormattedPrompt";

export default function SharedPage() {
  const [data, setData] = useState<SharedPromptData | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const { copied, copyToClipboard } = useClipboard();
  const [promptCopied, setPromptCopied] = useState(false);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) {
      setError(true);
      setLoading(false);
      return;
    }
    const decoded = decodePromptData(hash);
    if (!decoded) {
      setError(true);
    } else {
      setData(decoded);
      // Apply the theme from the shared data (defaults to Claude if absent)
      const theme = decoded.theme || "claude";
      document.documentElement.setAttribute("data-theme", theme);
    }
    setLoading(false);
  }, []);

  const handleCopyPrompt = async () => {
    if (data?.prompt) {
      const success = await copyToClipboard(data.prompt);
      if (success) {
        setPromptCopied(true);
        setTimeout(() => setPromptCopied(false), 2000);
      }
    }
  };

  const handleCopyUrl = async () => {
    await copyToClipboard(window.location.href);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-brand-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-bg-card rounded-2xl border border-border-subtle p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-accent-rose/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-accent-rose" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-text-primary mb-2">Invalid or Expired Link</h1>
          <p className="text-sm text-text-muted mb-6">
            This shared prompt link appears to be invalid or corrupted. The data may have been truncated during sharing.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold text-sm transition-all hover:brightness-110"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go to TellClaude
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Top Bar */}
      <header className="border-b border-border-subtle bg-bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-bold text-text-primary group-hover:text-brand-primary transition-colors">
              TellClaude
            </span>
          </a>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyUrl}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                copied
                  ? "bg-accent-green text-white"
                  : "bg-bg-elevated text-text-secondary hover:text-brand-primary border border-border-subtle"
              }`}
            >
              {copied ? "Link Copied!" : "Copy Link"}
            </button>
            <a
              href="/"
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-xs font-semibold transition-all hover:brightness-110"
            >
              Create Your Own
            </a>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Meta Card */}
        <div className="bg-bg-card rounded-2xl border border-border-subtle p-5 mb-4">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-accent-purple/20 text-accent-purple text-xs font-semibold">
                  Shared Prompt
                </span>
                {data.modes && (
                  <span className="px-2.5 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary text-xs font-semibold capitalize">
                    {data.modes.split(",").join(" + ")}
                  </span>
                )}
              </div>
              <p className="text-sm text-text-muted mt-2">
                {data.timestamp ? `Published ${formatDate(data.timestamp)}` : "Shared via TellClaude"}
              </p>
            </div>
            <button
              onClick={handleCopyPrompt}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                promptCopied
                  ? "bg-accent-green text-white"
                  : "bg-gradient-to-r from-brand-primary to-brand-secondary text-white hover:brightness-110"
              }`}
            >
              {promptCopied ? "Copied!" : "Copy Prompt"}
            </button>
          </div>

          {/* Original request */}
          {data.transcript && (
            <div className="mt-4 pt-4 border-t border-border-subtle">
              <p className="text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">Original Request</p>
              <p className="text-sm text-text-secondary bg-bg-elevated/50 rounded-xl px-4 py-3 italic">
                &ldquo;{data.transcript}&rdquo;
              </p>
            </div>
          )}
        </div>

        {/* Prompt Output */}
        <div className="bg-bg-card rounded-2xl border border-border-subtle overflow-hidden">
          <div className="px-5 py-4 border-b border-border-subtle bg-gradient-to-r from-brand-primary/10 to-transparent">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-text-primary">Generated Prompt</h2>
                <p className="text-xs text-text-muted">
                  Powered by {data.model ? getModelLabel(data.model) : "TellClaude"}
                </p>
              </div>
            </div>
          </div>
          <div className="p-5">
            <FormattedPrompt content={data.prompt} />
          </div>
        </div>
      </main>
    </div>
  );
}
