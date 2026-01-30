"use client";

import { useState, useCallback, DragEvent } from "react";

export interface Attachment {
  id: string;
  name: string;
  content: string;
  type: string;
  size: number;
}

interface TranscriptEditorProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  isListening: boolean;
  interimTranscript?: string;
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
}

// File types we can read as text
const READABLE_EXTENSIONS = [
  '.txt', '.md', '.json', '.js', '.ts', '.tsx', '.jsx', '.py', '.rb', '.go',
  '.java', '.c', '.cpp', '.h', '.hpp', '.cs', '.php', '.html', '.css', '.scss',
  '.less', '.xml', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf', '.sh',
  '.bash', '.zsh', '.ps1', '.sql', '.graphql', '.prisma', '.env', '.gitignore',
  '.dockerfile', '.log', '.csv', '.svg', '.vue', '.svelte', '.rs', '.swift',
  '.kt', '.scala', '.ex', '.exs', '.erl', '.hs', '.lua', '.r', '.m', '.mm'
];

const MAX_FILE_SIZE = 500 * 1024; // 500KB limit

export default function TranscriptEditor({
  value,
  onChange,
  onClear,
  isListening,
  interimTranscript,
  attachments,
  onAttachmentsChange,
}: TranscriptEditorProps) {
  // While speaking, show finalized text + interim (partial) text for instant feedback
  const displayValue = isListening && interimTranscript
    ? (value ? value + " " : "") + interimTranscript
    : value;
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);

  const wordCount = displayValue.trim() ? displayValue.trim().split(/\s+/).length : 0;

  const handleCopy = async () => {
    if (!value.trim()) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const isReadableFile = (filename: string): boolean => {
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return READABLE_EXTENSIONS.includes(ext) || filename.toLowerCase().includes('dockerfile');
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  const handleDrop = useCallback(async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDragError(null);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const newAttachments: Attachment[] = [];

    for (const file of files) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setDragError(`"${file.name}" is too large (max 500KB)`);
        continue;
      }

      // Check if readable
      if (!isReadableFile(file.name)) {
        setDragError(`"${file.name}" is not a supported text file`);
        continue;
      }

      try {
        const content = await readFileAsText(file);
        newAttachments.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          content,
          type: file.type || 'text/plain',
          size: file.size,
        });
      } catch (err) {
        setDragError(`Failed to read "${file.name}"`);
      }
    }

    if (newAttachments.length > 0) {
      onAttachmentsChange([...attachments, ...newAttachments]);
      // Clear error after successful add
      setTimeout(() => setDragError(null), 3000);
    }
  }, [attachments, onAttachmentsChange]);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const removeAttachment = (id: string) => {
    onAttachmentsChange(attachments.filter(a => a.id !== id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (filename: string): string => {
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    if (['.js', '.ts', '.tsx', '.jsx'].includes(ext)) return '📜';
    if (['.py'].includes(ext)) return '🐍';
    if (['.json', '.yaml', '.yml'].includes(ext)) return '📋';
    if (['.md', '.txt'].includes(ext)) return '📄';
    if (['.html', '.css', '.scss'].includes(ext)) return '🎨';
    if (['.sql'].includes(ext)) return '🗃️';
    if (['.log'].includes(ext)) return '📊';
    if (['.sh', '.bash', '.ps1'].includes(ext)) return '⚡';
    return '📎';
  };

  return (
    <div>
      <div className="relative group">
        {/* Label */}
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold text-text-secondary flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary" />
            Your Message
            <span className="flex items-center gap-1 text-xs text-text-muted font-normal ml-1 px-1.5 py-0.5 rounded bg-bg-elevated/50">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              drop files
            </span>
          </label>
          <div className="flex items-center gap-2">
            {attachments.length > 0 && (
              <span className="text-xs text-accent-purple font-semibold">
                {attachments.length} file{attachments.length !== 1 ? 's' : ''} attached
              </span>
            )}
            {displayValue.trim() && (
              <span className="text-xs text-text-muted">
                {wordCount} word{wordCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {/* Textarea with drag-drop zone */}
        <div
          className="relative"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <textarea
            value={displayValue}
            onChange={(e) => onChange(e.target.value)}
            placeholder={
              isListening
                ? "Speaking will appear here..."
                : "Type, speak, or drag & drop files here..."
            }
            className={`
              w-full h-36 p-4 rounded-xl
              bg-bg-card border-2 transition-all duration-200
              text-text-primary placeholder:text-text-muted
              resize-none focus:outline-none
              ${isDragging
                ? "border-accent-purple border-dashed bg-accent-purple/5"
                : isListening
                  ? "border-brand-primary/50 bg-brand-glow"
                  : "border-border-subtle hover:border-brand-primary/30 focus:border-brand-primary/50"
              }
            `}
          />

          {/* Drag overlay */}
          {isDragging && (
            <div className="absolute inset-0 rounded-xl bg-accent-purple/10 border-2 border-dashed border-accent-purple flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <svg className="w-8 h-8 mx-auto text-accent-purple mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm font-semibold text-accent-purple">Drop files here</p>
                <p className="text-xs text-text-muted">Code, logs, configs, etc.</p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {value.trim() && !isListening && !isDragging && (
            <div className="absolute top-3 right-3 flex items-center gap-1">
              {/* Copy button */}
              <button
                onClick={handleCopy}
                className={`p-1.5 rounded-lg transition-colors ${
                  copied
                    ? "bg-accent-green/20 text-accent-green"
                    : "bg-bg-elevated/80 text-text-muted hover:text-brand-primary hover:bg-brand-primary/10"
                }`}
                title={copied ? "Copied!" : "Copy message"}
              >
                {copied ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
              {/* Clear button */}
              <button
                onClick={onClear}
                className="p-1.5 rounded-lg bg-bg-elevated/80 text-text-muted hover:text-accent-rose hover:bg-accent-rose/10 transition-colors"
                title="Clear message"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Error message */}
        {dragError && (
          <div className="mt-2 px-3 py-2 rounded-lg bg-accent-rose/10 border border-accent-rose/30 text-accent-rose text-xs">
            {dragError}
          </div>
        )}

        {/* Attachments list */}
        {attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            <div className="text-xs font-semibold text-text-muted flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              Attached Files (included as context)
            </div>
            <div className="flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent-purple/10 border border-accent-purple/30 group/att"
                >
                  <span className="text-sm">{getFileIcon(attachment.name)}</span>
                  <span className="text-xs font-medium text-text-primary truncate max-w-[120px]">
                    {attachment.name}
                  </span>
                  <span className="text-xs text-text-muted">
                    {formatFileSize(attachment.size)}
                  </span>
                  <button
                    onClick={() => removeAttachment(attachment.id)}
                    className="p-0.5 rounded text-text-muted hover:text-accent-rose hover:bg-accent-rose/10 transition-colors opacity-60 group-hover/att:opacity-100"
                    title="Remove attachment"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recording indicator */}
        {isListening && (
          <div className="absolute -top-1 -right-1 flex items-center gap-1.5 px-2 py-1 rounded-full bg-brand-primary text-white text-xs font-semibold">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            Recording
          </div>
        )}
      </div>
    </div>
  );
}
