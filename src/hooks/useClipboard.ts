"use client";

import { useState, useCallback } from "react";

interface ClipboardHook {
  copied: boolean;
  copyToClipboard: (text: string) => Promise<boolean>;
}

export function useClipboard(resetDelay = 2000): ClipboardHook {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(
    async (text: string): Promise<boolean> => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), resetDelay);
        return true;
      } catch {
        // Fallback for older browsers
        try {
          const textarea = document.createElement("textarea");
          textarea.value = text;
          textarea.style.position = "fixed";
          textarea.style.opacity = "0";
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
          setCopied(true);
          setTimeout(() => setCopied(false), resetDelay);
          return true;
        } catch {
          return false;
        }
      }
    },
    [resetDelay]
  );

  return { copied, copyToClipboard };
}
