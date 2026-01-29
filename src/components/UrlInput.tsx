"use client";

import { useState, useCallback } from "react";

export interface UrlReference {
  id: string;
  url: string;
  title: string;
  content: string;
  type: "github_issue" | "webpage" | "text";
  metadata?: Record<string, unknown>;
}

interface UrlInputProps {
  references: UrlReference[];
  onReferencesChange: (references: UrlReference[]) => void;
}

export default function UrlInput({ references, onReferencesChange }: UrlInputProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const isGitHubIssue = (url: string): boolean => {
    return /^https?:\/\/github\.com\/[^/]+\/[^/]+\/issues\/\d+/.test(url);
  };

  const fetchUrl = useCallback(async () => {
    if (!url.trim() || !isValidUrl(url.trim())) {
      setError("Please enter a valid URL");
      return;
    }

    // Check for duplicates
    if (references.some((r) => r.url === url.trim())) {
      setError("This URL has already been added");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/fetch-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch URL");
      }

      const newReference: UrlReference = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        url: url.trim(),
        title: data.title,
        content: data.content,
        type: data.type,
        metadata: data.metadata,
      };

      onReferencesChange([...references, newReference]);
      setUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch URL");
    } finally {
      setIsLoading(false);
    }
  }, [url, references, onReferencesChange]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      fetchUrl();
    }
  };

  const removeReference = (id: string) => {
    onReferencesChange(references.filter((r) => r.id !== id));
  };

  const getTypeIcon = (type: string, url: string): string => {
    if (type === "github_issue") return "🐙";
    if (url.includes("stackoverflow.com")) return "📚";
    if (url.includes("docs.")) return "📖";
    return "🔗";
  };

  const getTypeLabel = (type: string): string => {
    if (type === "github_issue") return "GitHub Issue";
    if (type === "webpage") return "Webpage";
    return "Content";
  };

  return (
    <div className="space-y-3">
      {/* URL Input */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-text-secondary flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-teal" />
            Reference URLs
            <span className="text-xs text-text-muted font-normal">(optional)</span>
          </label>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              onKeyPress={handleKeyPress}
              placeholder="Paste GitHub issue, docs, or any URL..."
              disabled={isLoading}
              className="w-full px-4 py-2.5 pr-10 rounded-xl bg-bg-card border-2 border-border-subtle focus:border-accent-teal/50 text-text-primary placeholder:text-text-muted text-sm focus:outline-none transition-all disabled:opacity-50"
            />
            {url && isGitHubIssue(url) && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm">🐙</span>
            )}
          </div>
          <button
            onClick={fetchUrl}
            disabled={!url.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-accent-teal/20 border border-accent-teal/50 text-accent-teal font-semibold text-sm hover:bg-accent-teal/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Fetching...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Fetch
              </>
            )}
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-2 px-3 py-2 rounded-lg bg-accent-rose/10 border border-accent-rose/30 text-accent-rose text-xs">
            {error}
          </div>
        )}

        {/* Helper text */}
        <p className="mt-2 text-xs text-text-muted">
          💡 Paste a GitHub issue URL to auto-import title, description & comments
        </p>
      </div>

      {/* References list */}
      {references.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-text-muted flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Referenced URLs (included as context)
          </div>
          <div className="space-y-2">
            {references.map((ref) => (
              <div
                key={ref.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-accent-teal/5 border border-accent-teal/20 group"
              >
                <span className="text-lg flex-shrink-0">{getTypeIcon(ref.type, ref.url)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-accent-teal/20 text-accent-teal font-medium">
                      {getTypeLabel(ref.type)}
                    </span>
                    {ref.type === "github_issue" && ref.metadata && (
                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                        ref.metadata.state === "open"
                          ? "bg-accent-green/20 text-accent-green"
                          : "bg-accent-purple/20 text-accent-purple"
                      }`}>
                        {String(ref.metadata.state)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-text-primary mt-1 truncate">
                    {ref.title}
                  </p>
                  <p className="text-xs text-text-muted truncate mt-0.5">
                    {ref.url}
                  </p>
                </div>
                <button
                  onClick={() => removeReference(ref.id)}
                  className="p-1 rounded text-text-muted hover:text-accent-rose hover:bg-accent-rose/10 transition-colors opacity-60 group-hover:opacity-100 flex-shrink-0"
                  title="Remove reference"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
