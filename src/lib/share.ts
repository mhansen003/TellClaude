import LZString from "lz-string";

export interface SharedPromptData {
  transcript: string;
  prompt: string;
  modes: string;
  timestamp: number;
  theme?: string;
  model?: string;
}

export interface PublishedItem {
  id: string;
  timestamp: number;
  transcript: string;
  prompt: string;
  modes: string;
  url: string;
}

const PUBLISHED_STORAGE_KEY = "tellai-published";

/**
 * Compress prompt data into a URL-safe string for sharing.
 * Uses lz-string's URI-safe encoding so the hash never contains
 * characters that break copy-paste or URL parsing.
 */
export function encodePromptData(data: SharedPromptData): string {
  const json = JSON.stringify(data);
  return LZString.compressToEncodedURIComponent(json);
}

/**
 * Decode a compressed URL hash back into prompt data.
 * Returns null if the data is invalid or corrupted.
 */
export function decodePromptData(encoded: string): SharedPromptData | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const data = JSON.parse(json);
    if (!data.prompt || !data.transcript) return null;
    return data as SharedPromptData;
  } catch {
    return null;
  }
}

/**
 * Build a full shareable URL from prompt data.
 * Uses the /shared route with a hash fragment containing compressed data.
 */
export function buildShareUrl(data: SharedPromptData): string {
  const encoded = encodePromptData(data);
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}/shared#${encoded}`;
}

/** Load published items from localStorage */
export function loadPublished(): PublishedItem[] {
  try {
    const saved = localStorage.getItem(PUBLISHED_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return [];
}

/** Save published items to localStorage */
export function savePublished(items: PublishedItem[]): void {
  try {
    localStorage.setItem(PUBLISHED_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}
