"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PromptModeId, DetailLevelId, OutputFormatId } from "@/lib/types";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useClipboard } from "@/hooks/useClipboard";
import Header from "@/components/Header";
import BrowserWarning from "@/components/BrowserWarning";
import VoiceRecorder from "@/components/VoiceRecorder";
import TranscriptEditor, { Attachment } from "@/components/TranscriptEditor";
import ModeModifierModal from "@/components/ModeModifierModal";
import DetailLevelSelector from "@/components/DetailLevelSelector";
import OutputFormatSelector from "@/components/OutputFormatSelector";
import ContextInput from "@/components/ContextInput";
import UrlInput, { UrlReference } from "@/components/UrlInput";
import InterviewModal from "@/components/InterviewModal";
import AboutModal from "@/components/AboutModal";
import FormattedPrompt from "@/components/FormattedPrompt";
import PromptHistory, { HistoryItem } from "@/components/PromptHistory";
import PublishModal from "@/components/PublishModal";
import LLMSelector from "@/components/LLMSelector";
import MobileBottomSheet from "@/components/MobileBottomSheet";
import QRCodeModal from "@/components/QRCodeModal";
import { TooltipIcon } from "@/components/Tooltip";
import { PublishedItem, buildShareUrl, loadPublished, savePublished } from "@/lib/share";
import { type LLMProviderId, getProvider, getModelLabel } from "@/lib/llm-providers";
import { PROMPT_MODE_OPTIONS, PROMPT_MODIFIERS } from "@/lib/constants";

const HISTORY_STORAGE_KEY = "tellai-history";
const SETTINGS_STORAGE_KEY = "tellai-settings";

export default function Home() {
  // Speech recognition
  const {
    isListening,
    transcript: speechTranscript,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  // Editable transcript
  const [transcript, setTranscript] = useState("");

  // Prompt settings
  const [modes, setModes] = useState<PromptModeId[]>(["code"]);
  const [detailLevel, setDetailLevel] = useState<DetailLevelId>("balanced");
  const [outputFormat, setOutputFormat] = useState<OutputFormatId>("structured");
  const [modifiers, setModifiers] = useState<string[]>([]);
  const [contextInfo, setContextInfo] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [urlReferences, setUrlReferences] = useState<UrlReference[]>([]);

  // LLM provider & model
  const [llmProvider, setLlmProvider] = useState<LLMProviderId>("claude");
  const [llmModel, setLlmModel] = useState("anthropic/claude-opus-4");

  // Engine model for prompt generation (not the target AI — the model that writes the prompt)
  const ENGINE_OPTIONS = [
    { id: "google/gemini-2.5-pro", label: "Gemini Pro", tag: "⚡ Fastest" },
    { id: "openai/gpt-4.1", label: "GPT 4.1", tag: "Balanced" },
    { id: "anthropic/claude-opus-4", label: "Opus 4", tag: "Highest quality" },
  ] as const;
  type EngineModelId = typeof ENGINE_OPTIONS[number]["id"];
  const [engineModel, setEngineModel] = useState<EngineModelId>("google/gemini-2.5-pro");
  const engineLabel = ENGINE_OPTIONS.find(o => o.id === engineModel)?.label || "AI";

  // Generated prompt
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStats, setGenerationStats] = useState<{ timeMs: number; inputChars: number; outputChars: number } | null>(null);

  // History
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Published prompts
  const [published, setPublished] = useState<PublishedItem[]>([]);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishUrl, setPublishUrl] = useState("");

  // Interview modal
  const [showInterview, setShowInterview] = useState(false);

  // About modal
  const [showAbout, setShowAbout] = useState(false);

  // QR Code / Share modal
  const [showQRCode, setShowQRCode] = useState(false);

  // Expanded prompt modal
  const [showExpandedPrompt, setShowExpandedPrompt] = useState(false);

  // Mode & Modifier modal
  const [showModeModal, setShowModeModal] = useState(false);

  // Auto-suggest: tracks freshly suggested IDs for glow animation
  const [glowingModes, setGlowingModes] = useState<Set<string>>(new Set());
  const [glowingModifiers, setGlowingModifiers] = useState<Set<string>>(new Set());
  const suggestTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestAbortRef = useRef<AbortController | null>(null);
  const [isAutoSuggesting, setIsAutoSuggesting] = useState(false);

  // Options collapse
  const [optionsExpanded, setOptionsExpanded] = useState(false);

  // Mobile bottom sheets
  const [showMobileTargetAI, setShowMobileTargetAI] = useState(false);
  const [showMobileCustomize, setShowMobileCustomize] = useState(false);

  // Auto-scroll ref for streaming output
  const outputScrollRef = useRef<HTMLDivElement>(null);

  // Pending generate trigger (set by interview → main generate flow)
  const pendingGenerateRef = useRef(false);

  // Edit mode for output
  const [isEditingOutput, setIsEditingOutput] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  // Clipboard
  const { copied, copyToClipboard } = useClipboard();

  // AbortController for cancelling generation
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Failed to load history:", error);
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save history:", error);
    }
  }, [history]);

  // Load published from localStorage
  useEffect(() => {
    setPublished(loadPublished());
  }, []);

  // Save published to localStorage
  useEffect(() => {
    savePublished(published);
  }, [published]);

  // Load saved settings from localStorage (excludes modes/modifiers — those reset on refresh)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const settings = JSON.parse(saved);
        if (settings.detailLevel) setDetailLevel(settings.detailLevel);
        if (settings.outputFormat) setOutputFormat(settings.outputFormat);
        if (settings.provider) setLlmProvider(settings.provider);
        if (settings.model) setLlmModel(settings.model);
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }, []);

  // Save settings to localStorage when they change (modes/modifiers are dynamic, not persisted)
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({
        detailLevel,
        outputFormat,
        provider: llmProvider,
        model: llmModel,
      }));
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }, [detailLevel, outputFormat, llmProvider, llmModel]);

  // Apply theme based on LLM provider
  useEffect(() => {
    const provider = getProvider(llmProvider);
    document.documentElement.setAttribute("data-theme", provider.theme);
  }, [llmProvider]);

  // Auto-scroll output panel during streaming
  useEffect(() => {
    if (isGenerating && outputScrollRef.current) {
      outputScrollRef.current.scrollTop = outputScrollRef.current.scrollHeight;
    }
  }, [generatedPrompt, isGenerating]);

  // Provider change handler — reset model to default
  const handleProviderChange = useCallback((newProvider: LLMProviderId) => {
    setLlmProvider(newProvider);
    const provider = getProvider(newProvider);
    setLlmModel(provider.defaultModel);
  }, []);

  // Sync speech transcript
  useEffect(() => {
    if (speechTranscript) {
      setTranscript(speechTranscript);
    }
  }, [speechTranscript]);

  // Browser support check
  const [showBrowserWarning, setShowBrowserWarning] = useState(false);
  useEffect(() => {
    setShowBrowserWarning(!isSupported);
  }, [isSupported]);

  // Auto-suggest modes as user types/speaks (debounced)
  // Uses interimTranscript while speaking so tags update mid-sentence
  useEffect(() => {
    // Clear previous timer
    if (suggestTimerRef.current) clearTimeout(suggestTimerRef.current);

    // Combine finalized transcript with interim speech for real-time feedback
    const fullText = isListening && interimTranscript
      ? (transcript + " " + interimTranscript).trim()
      : transcript.trim();

    // Need at least 15 chars and modal must be closed (don't override manual picks)
    if (fullText.length < 15 || showModeModal) return;

    setIsAutoSuggesting(true);

    suggestTimerRef.current = setTimeout(async () => {
      // Abort any in-flight request
      if (suggestAbortRef.current) suggestAbortRef.current.abort();
      suggestAbortRef.current = new AbortController();

      try {
        const response = await fetch("/api/suggest-modes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ transcript: fullText }),
          signal: suggestAbortRef.current.signal,
        });
        const data = await response.json();

        if (data.modes && Array.isArray(data.modes) && data.modes.length > 0) {
          // Merge inside updater so `prev` is always the true current state
          // (avoids stale closure where `modes` from effect setup is outdated)
          const suggestedModes = Array.from(new Set(data.modes as string[])) as PromptModeId[];
          setModes((prev) => {
            const existing = new Set(prev);
            const toAdd = suggestedModes.filter((id) => !existing.has(id));
            if (toAdd.length > 0) {
              setGlowingModes(new Set(toAdd as string[]));
              setTimeout(() => setGlowingModes(new Set()), 1000);
              return [...prev, ...toAdd];
            }
            return prev;
          });
        }

        if (data.modifiers && Array.isArray(data.modifiers)) {
          const suggestedMods = Array.from(new Set(data.modifiers as string[]));
          setModifiers((prev) => {
            const existing = new Set(prev);
            const toAdd = suggestedMods.filter((id) => !existing.has(id));
            if (toAdd.length > 0) {
              setGlowingModifiers(new Set(toAdd));
              setTimeout(() => setGlowingModifiers(new Set()), 1000);
              return [...prev, ...toAdd];
            }
            return prev;
          });
        }
      } catch {
        // Silently ignore aborts and network errors
      }
      setIsAutoSuggesting(false);
    }, 500);

    return () => {
      if (suggestTimerRef.current) clearTimeout(suggestTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript, interimTranscript, isListening, showModeModal]);

  // Add to history
  const addToHistory = useCallback((transcriptText: string, promptText: string, modeIds: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      transcript: transcriptText,
      prompt: promptText,
      mode: modeIds,
    };
    setHistory((prev) => [newItem, ...prev.slice(0, 49)]);
    setActiveHistoryId(newItem.id);
  }, []);

  // Generate prompt using API
  const handleGenerate = useCallback(async () => {
    if (!transcript.trim() || isGenerating) return;

    if (isListening) {
      stopListening();
    }

    // Create new AbortController for this request
    abortControllerRef.current = new AbortController();

    setIsGenerating(true);
    setIsEditingOutput(false); // Reset edit mode when generating new prompt
    setGenerationStats(null);
    const startTime = Date.now();

    try {
      // Prepare attachments for API (just name and content)
      const attachmentData = attachments.map(a => ({
        name: a.name,
        content: a.content,
      }));

      // Prepare URL references for API
      const urlData = urlReferences.map(r => ({
        title: r.title,
        content: r.content,
        type: r.type,
        url: r.url,
      }));

      const response = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: transcript.trim(),
          modes,
          detailLevel,
          outputFormat,
          modifiers,
          contextInfo,
          attachments: attachmentData,
          urlReferences: urlData,
          model: llmModel,
          engineModel,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        // Try to parse error JSON from non-streaming error responses
        try {
          const data = await response.json();
          if (data.debug) {
            const debugInfo = data.debug;
            console.error("API Debug Info:", JSON.stringify(debugInfo, null, 2));
            const debugMsg = `API Error: ${debugInfo.message || "Unknown"}${debugInfo.cause ? `\nCause: ${debugInfo.cause}` : ""}${debugInfo.hasApiKey ? `\nKey: ${debugInfo.keyPrefix}` : "\nNo API key configured!"}`;
            setGeneratedPrompt(`## ⚠️ Debug: Generation Failed\n\n\`\`\`\n${debugMsg}\n\`\`\`\n\nCheck your OpenRouter dashboard at https://openrouter.ai/settings/keys`);
            setToast("API error — debug info shown in output panel");
            setTimeout(() => setToast(null), 5000);
          } else {
            throw new Error("Generation failed");
          }
        } catch {
          throw new Error("Generation failed");
        }
      } else if (response.body) {
        // Stream the response — tokens appear as they arrive
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";
        setGeneratedPrompt("");

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setGeneratedPrompt(accumulated);
        }

        if (accumulated) {
          const elapsed = Date.now() - startTime;
          setGenerationStats({ timeMs: elapsed, inputChars: transcript.trim().length, outputChars: accumulated.length });
          addToHistory(transcript.trim(), accumulated, modes.join(","));
          setToast(`Prompt generated by ${engineLabel}!`);
          setTimeout(() => setToast(null), 3000);
        } else {
          throw new Error("No prompt returned");
        }
      } else {
        throw new Error("No response body");
      }
    } catch (error) {
      // Check if this was a user-initiated cancellation
      if (error instanceof Error && error.name === "AbortError") {
        setToast("Generation cancelled");
        setTimeout(() => setToast(null), 2000);
      } else {
        console.error("Generation failed:", error);
        setToast("Failed to generate. Please try again.");
        setTimeout(() => setToast(null), 3000);
      }
    }

    abortControllerRef.current = null;
    setIsGenerating(false);
  }, [transcript, modes, detailLevel, outputFormat, modifiers, contextInfo, attachments, urlReferences, isGenerating, isListening, stopListening, addToHistory, llmModel, engineModel]);

  // Interview → main generate: trigger after transcript state commits
  useEffect(() => {
    if (pendingGenerateRef.current && transcript.trim()) {
      pendingGenerateRef.current = false;
      handleGenerate();
    }
  }, [transcript, handleGenerate]);

  // Cancel generation
  const handleCancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Handle interview completion
  const handleInterviewComplete = useCallback((enhancedPrompt: string) => {
    setGeneratedPrompt(enhancedPrompt);
    addToHistory(transcript.trim(), enhancedPrompt, modes.join(","));
    setToast("Enhanced prompt ready!");
    setTimeout(() => setToast(null), 3000);
  }, [transcript, modes, addToHistory]);

  // Interview → main generate: close modal, enrich transcript, auto-trigger generation
  const handleInterviewGenerate = useCallback((conversationContext: string) => {
    setShowInterview(false);
    const enriched = transcript.trim()
      ? `${transcript.trim()}\n\n${conversationContext}`
      : conversationContext;
    setTranscript(enriched);
    pendingGenerateRef.current = true;
  }, [transcript]);

  // Select from history
  const handleHistorySelect = useCallback((item: HistoryItem) => {
    setTranscript(item.transcript);
    setGeneratedPrompt(item.prompt);
    setActiveHistoryId(item.id);
    setModes(item.mode ? item.mode.split(",").filter(Boolean) as PromptModeId[] : []);
    setToast("Loaded from history");
    setTimeout(() => setToast(null), 2000);
  }, []);

  // Delete from history
  const handleHistoryDelete = useCallback((id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    if (activeHistoryId === id) {
      setActiveHistoryId(null);
    }
  }, [activeHistoryId]);

  // Clear all history
  const handleHistoryClear = useCallback(() => {
    setHistory([]);
    setActiveHistoryId(null);
  }, []);

  // Copy prompt
  const handleCopy = useCallback(async () => {
    if (generatedPrompt) {
      const success = await copyToClipboard(generatedPrompt);
      if (success) {
        setToast("Copied to clipboard! Paste into Claude Code.");
        setTimeout(() => setToast(null), 3000);
      }
    }
  }, [generatedPrompt, copyToClipboard]);

  // Clear transcript
  const handleClear = useCallback(() => {
    setTranscript("");
    resetTranscript();
    setModes([]);
    setModifiers([]);
    setDetailLevel("balanced");
    setOutputFormat("structured");
    setContextInfo("");
    setGenerationStats(null);
  }, [resetTranscript]);

  // Publish prompt — try short URL via KV, fall back to hash URL
  const handlePublish = useCallback(async () => {
    if (!generatedPrompt) return;

    const shareData = {
      transcript: transcript.trim(),
      prompt: generatedPrompt,
      modes: modes.join(","),
      timestamp: Date.now(),
      theme: getProvider(llmProvider).theme,
      model: llmModel,
    };

    // Try short URL first (requires Vercel KV)
    let url: string;
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(shareData),
      });
      if (res.ok) {
        const result = await res.json();
        url = result.url;
      } else {
        // KV not configured — fall back to hash URL
        url = buildShareUrl(shareData);
      }
    } catch {
      // Network error — fall back to hash URL
      url = buildShareUrl(shareData);
    }

    const newItem: PublishedItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      transcript: transcript.trim(),
      prompt: generatedPrompt,
      modes: modes.join(","),
      url,
    };
    setPublished((prev) => [newItem, ...prev.slice(0, 49)]);
    setPublishUrl(url);
    setShowPublishModal(true);
    setToast("Prompt published!");
    setTimeout(() => setToast(null), 3000);
  }, [generatedPrompt, transcript, modes, llmProvider, llmModel]);

  // Delete published item
  const handlePublishedDelete = useCallback((id: string) => {
    setPublished((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Clear all published
  const handlePublishedClear = useCallback(() => {
    setPublished([]);
  }, []);

  // Reset everything
  const handleReset = useCallback(() => {
    if (isListening) {
      stopListening();
    }
    setTranscript("");
    resetTranscript();
    setGeneratedPrompt("");
    setModifiers([]);
    setContextInfo("");
    setAttachments([]);
    setUrlReferences([]);
    setModes(["code"]);
    setDetailLevel("balanced");
    setOutputFormat("structured");
    setActiveHistoryId(null);
    setIsEditingOutput(false);
    setToast("Ready for a new prompt!");
    setTimeout(() => setToast(null), 2000);
  }, [isListening, stopListening, resetTranscript]);

  // Step progress logic
  const steps = [
    { step: 1, label: "Describe", done: transcript.trim().length > 0 },
    { step: 2, label: "AI Model", done: llmProvider !== "claude" },
    { step: 3, label: "Configure", done: transcript.trim().length > 0 && !(modes.length === 1 && modes[0] === "code") },
    { step: 4, label: "Customize", done: optionsExpanded || detailLevel !== "balanced" || outputFormat !== "structured" || contextInfo.trim().length > 0 },
    { step: 5, label: "Generate", done: generatedPrompt.length > 0 },
  ];

  const isStepActive = (step: number) => {
    if (step === 1) return true;
    if (step === 2) return !!transcript.trim();
    if (step === 3) return !!transcript.trim();
    if (step === 4) return !(modes.length === 1 && modes[0] === "code");
    if (step === 5) return !!transcript.trim();
    return false;
  };

  return (
    <div className="relative z-10 min-h-screen">
      {/* History Sidebar - Overlays, doesn't push content */}
      <PromptHistory
        history={history}
        activeId={activeHistoryId}
        onSelect={handleHistorySelect}
        onDelete={handleHistoryDelete}
        onClear={handleHistoryClear}
        isOpen={historyOpen}
        onToggle={() => setHistoryOpen(!historyOpen)}
        published={published}
        onPublishedDelete={handlePublishedDelete}
        onPublishedClear={handlePublishedClear}
      />

      {/* Header - Full width */}
      <Header onAboutClick={() => setShowAbout(true)} onShareClick={() => setShowQRCode(true)} provider={llmProvider} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 pb-6 sm:pb-8">

            {/* Browser Warning */}
            {showBrowserWarning && <BrowserWarning />}

            {/* Mic Hero Section - Centered, with Interview beside it */}
            <section className="flex flex-col items-center py-1 sm:py-3 mb-3 sm:mb-5">
              <div className="flex items-center gap-6 sm:gap-10">
                <VoiceRecorder
                  isListening={isListening}
                  isSupported={isSupported}
                  interimTranscript={interimTranscript}
                  onStart={startListening}
                  onStop={stopListening}
                />
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={() => setShowInterview(true)}
                    className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer group bg-bg-card hover:bg-bg-elevated border-2 border-accent-purple/40 hover:border-accent-purple shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]"
                    aria-label="Start AI interview"
                    title="AI-assisted interview — build your prompt through conversation"
                  >
                    {/* Outer glow ring */}
                    <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-accent-purple/30 to-accent-purple/20 blur-sm animate-pulse" />
                    <svg
                      className="w-8 h-8 sm:w-10 sm:h-10 relative z-10 text-text-secondary group-hover:text-accent-purple transition-colors"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </button>
                  <p className="text-xs font-semibold text-text-muted">Interview</p>
                </div>
              </div>
            </section>

            {/* Two-Column Grid: Flattened for mobile reordering via order- classes */}
            <div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">

              {/* Section A: Your Message (mobile: order-1, desktop: left col row 1) */}
              <div className="order-1 lg:col-start-1 lg:row-start-1 flex flex-col gap-3">
                <div className="bg-bg-card rounded-2xl border border-border-subtle p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-text-secondary">Your Message</span>
                    <TooltipIcon
                      content="Type your request directly, or use the microphone above to speak. Your voice is converted to text in real-time."
                      position="left"
                    />
                  </div>
                  <TranscriptEditor
                    value={transcript}
                    onChange={setTranscript}
                    onClear={handleClear}
                    isListening={isListening}
                    interimTranscript={interimTranscript}
                    attachments={attachments}
                    onAttachmentsChange={setAttachments}
                  />
                </div>
              </div>

              {/* Right column wrapper: contents on mobile (children are grid items), flex-col on desktop (single cell) */}
              <div className="contents lg:flex lg:flex-col lg:gap-0 lg:col-start-2 lg:row-start-1 lg:row-span-4">

              {/* Section B: Engine + Generate */}
              {(transcript.trim() || isGenerating) && (
              <div className="order-2 lg:order-none space-y-2">
                <span className="text-sm font-semibold text-text-secondary">Generate Your Prompt</span>
                {/* Engine selector */}
                <div className="flex gap-1.5">
                  {ENGINE_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setEngineModel(opt.id)}
                      className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        engineModel === opt.id
                          ? "bg-brand-primary/20 text-brand-primary border border-brand-primary/40"
                          : "bg-bg-elevated/50 text-text-muted border border-border-subtle hover:text-text-secondary"
                      }`}
                    >
                      <span className="block">{opt.label}</span>
                      <span className={`block text-[10px] ${engineModel === opt.id ? "text-brand-primary/70" : "text-text-muted/60"}`}>{opt.tag}</span>
                    </button>
                  ))}
                </div>
                {/* Generate / Cancel buttons */}
                <div className="flex gap-2">
                  {isGenerating ? (
                    <>
                      <div className="flex-1 h-14 sm:h-12 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-sm flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Generating...
                      </div>
                      <button
                        onClick={handleCancelGeneration}
                        className="h-14 sm:h-12 px-4 sm:px-5 rounded-xl bg-bg-card border-2 border-accent-rose/50 text-accent-rose font-semibold text-sm transition-all hover:bg-accent-rose/10 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={handleGenerate}
                      disabled={!transcript.trim()}
                      className={`flex-1 h-14 sm:h-12 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-sm transition-all hover:brightness-110 hover:shadow-lg hover:shadow-brand-primary/20 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                        transcript.trim() ? "animate-generate-yellow-pulse border-2 border-yellow-400/50" : ""
                      }`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Generate Prompt
                      </span>
                    </button>
                  )}
                </div>
              </div>
              )}

              {/* Section C: Output Panel */}
              {(transcript.trim() || generatedPrompt || isGenerating) && (
              <div className="order-3 lg:order-none mt-4 sm:mt-6 lg:mt-2">
                <div className="bg-bg-card rounded-2xl border border-border-subtle overflow-hidden flex flex-col h-[350px] sm:h-[500px]">
                  {/* Header */}
                  <div className="flex-shrink-0 px-4 sm:px-5 py-3 sm:py-4 border-b border-border-subtle bg-gradient-to-r from-brand-primary/10 to-transparent">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-sm sm:text-base font-bold text-text-primary">Generated Prompt</h2>
                          <p className="text-[10px] sm:text-xs text-text-muted">Powered by {engineLabel}</p>
                        </div>
                      </div>
                      {generatedPrompt && !isGenerating && (
                        <div className="flex gap-1.5 sm:gap-2 flex-wrap justify-end">
                          <button
                            onClick={handlePublish}
                            className="px-2 sm:px-3 py-1.5 rounded-lg bg-accent-green/20 text-accent-green hover:bg-accent-green hover:text-white text-xs font-semibold transition-all flex items-center gap-1"
                            title="Publish & get shareable link"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                            <span className="hidden sm:inline">Publish</span>
                          </button>
                          <button
                            onClick={() => setShowInterview(true)}
                            className="px-2 sm:px-3 py-1.5 rounded-lg bg-bg-elevated text-text-secondary hover:text-brand-primary text-xs font-semibold transition-all flex items-center gap-1"
                            title="Refine your prompt through AI conversation"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="hidden sm:inline">Revise</span>
                          </button>
                          <button
                            onClick={() => setIsEditingOutput(!isEditingOutput)}
                            className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              isEditingOutput
                                ? "bg-accent-purple text-white"
                                : "bg-bg-elevated text-text-secondary hover:text-accent-purple"
                            }`}
                          >
                            {isEditingOutput ? "View" : "Edit"}
                          </button>
                          <button
                            onClick={handleCopy}
                            className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              copied
                                ? "bg-accent-green text-white"
                                : "bg-bg-elevated text-text-secondary hover:text-brand-primary"
                            }`}
                          >
                            {copied ? "Copied!" : "Copy"}
                          </button>
                          <button
                            onClick={handleReset}
                            className="px-2 sm:px-3 py-1.5 rounded-lg bg-bg-elevated text-text-secondary hover:text-accent-rose text-xs font-semibold transition-all"
                          >
                            Clear
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Content - Scrollable with auto-scroll ref */}
                  <div ref={outputScrollRef} className="p-4 sm:p-5 flex-1 min-h-0 overflow-y-auto">
                    {(isGenerating || generatedPrompt) ? (
                      <div className="relative h-full">
                        {/* Expand icon - top right inside content */}
                        {generatedPrompt && !isGenerating && !isEditingOutput && (
                          <button
                            onClick={() => setShowExpandedPrompt(true)}
                            className="absolute top-0 right-0 z-10 p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all"
                            title="Expand to full screen"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                            </svg>
                          </button>
                        )}
                        {generatedPrompt ? (
                          <>
                            {isEditingOutput ? (
                              <textarea
                                value={generatedPrompt}
                                onChange={(e) => setGeneratedPrompt(e.target.value)}
                                className="w-full h-full min-h-[200px] sm:min-h-[300px] p-4 rounded-xl bg-bg-elevated border-2 border-accent-purple/30 text-text-primary font-mono text-sm resize-none focus:outline-none focus:border-accent-purple/50 transition-colors"
                                placeholder="Edit your prompt..."
                              />
                            ) : (
                              <FormattedPrompt content={generatedPrompt} />
                            )}
                            {/* Streaming cursor */}
                            {isGenerating && (
                              <span className="inline-block w-2 h-4 bg-brand-primary/70 animate-pulse ml-1 rounded-sm" />
                            )}
                          </>
                        ) : (
                          /* Initial loading state before first chunk arrives */
                          <div className="flex flex-col items-center justify-center h-48 text-text-muted">
                            <div className="relative w-12 h-12 mb-3">
                              <div className="absolute inset-0 rounded-full border-4 border-brand-primary/20" />
                              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-brand-primary animate-spin" />
                            </div>
                            <p className="text-sm font-medium">{engineLabel} is crafting your prompt...</p>
                          </div>
                        )}
                        {/* Token & cost stats - only after generation completes */}
                        {generationStats && !isGenerating && (
                          <div className="mt-3 pt-2 border-t border-border-subtle flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-text-muted">
                            <span>⏱ {(generationStats.timeMs / 1000).toFixed(1)}s</span>
                            <span>↑ ~{Math.ceil(generationStats.inputChars / 4)} tokens in</span>
                            <span>↓ ~{Math.ceil(generationStats.outputChars / 4)} tokens out</span>
                            <span>💰 ~${(
                              (() => {
                                const inTok = generationStats.inputChars / 4;
                                const outTok = generationStats.outputChars / 4;
                                const pricing: Record<string, [number, number]> = {
                                  "google/gemini-2.5-pro": [1.25, 10],
                                  "openai/gpt-4.1": [2, 8],
                                  "anthropic/claude-opus-4": [15, 75],
                                };
                                const [inRate, outRate] = pricing[engineModel] || [2, 8];
                                return ((inTok * inRate + outTok * outRate) / 1_000_000).toFixed(4);
                              })()
                            )}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-text-muted py-8">
                        <svg className="w-12 h-12 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm font-medium mb-1">Your prompt will appear here</p>
                        <p className="text-xs mb-6">Speak or type your request, then click Generate</p>

                        {/* Workflow Guide integrated into empty state */}
                        <div className="w-full max-w-xs border-t border-border-subtle pt-4">
                          <h3 className="text-xs font-semibold text-text-muted mb-3 flex items-center justify-center gap-1.5">
                            <span className="text-brand-primary">🚀</span> Quick Start Guide
                          </h3>
                          <ul className="text-xs text-text-muted space-y-2 text-left">
                            <li className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-brand-primary/20 text-brand-primary text-[10px] font-bold flex-shrink-0 mt-0.5">1</span>
                              <span><strong>Describe</strong> your request using voice or text</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-brand-primary/20 text-brand-primary text-[10px] font-bold flex-shrink-0 mt-0.5">2</span>
                              <span><strong>Choose</strong> a mode that matches your task</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-brand-primary/20 text-brand-primary text-[10px] font-bold flex-shrink-0 mt-0.5">3</span>
                              <span><strong>Customize</strong> options for more control</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-brand-primary/20 text-brand-primary text-[10px] font-bold flex-shrink-0 mt-0.5">4</span>
                              <span><strong>Generate</strong> and copy to Claude Code</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              )}

              </div>
              {/* /Right column wrapper */}

              {/* Section D: Mobile Settings Toolbar (mobile: order-4, desktop: hidden) */}
              <div className="order-4 lg:hidden flex gap-2">
                <button
                  onClick={() => setShowMobileTargetAI(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-bg-card border border-border-subtle text-text-secondary hover:text-brand-primary hover:border-brand-primary/30 transition-all text-xs font-semibold"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Target AI
                </button>
                <button
                  onClick={() => setShowModeModal(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-bg-card border border-border-subtle text-text-secondary hover:text-brand-primary hover:border-brand-primary/30 transition-all text-xs font-semibold"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  Modes
                  {modes.length > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-brand-primary/20 text-brand-primary text-[10px] font-bold">
                      {modes.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setShowMobileCustomize(true)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-bg-card border border-border-subtle text-text-secondary hover:text-brand-primary hover:border-brand-primary/30 transition-all text-xs font-semibold"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Options
                  {(detailLevel !== "balanced" || outputFormat !== "structured") && (
                    <span className="w-2 h-2 rounded-full bg-accent-teal" />
                  )}
                </button>
              </div>

              {/* Section E: LLM Selector (mobile: hidden, desktop: left col row 2) */}
              <div className="hidden lg:block lg:col-start-1 lg:row-start-2">
                <LLMSelector
                  provider={llmProvider}
                  onProviderChange={handleProviderChange}
                />
              </div>

              {/* Section F: Mode & Modifiers (mobile: hidden, desktop: left col row 3) */}
              <div className="hidden lg:block lg:col-start-1 lg:row-start-3">
                <div className="bg-bg-card rounded-2xl border border-border-subtle p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-text-secondary flex items-center gap-2">
                      <svg className="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                      </svg>
                      Mode & Modifiers
                      {isAutoSuggesting && (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-purple/15 text-accent-purple text-[10px] font-semibold animate-pulse">
                          <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          AI analyzing...
                        </span>
                      )}
                    </span>
                    <button
                      onClick={() => setShowModeModal(true)}
                      className="px-3 py-1.5 rounded-lg border border-border-subtle text-text-secondary text-xs font-medium hover:text-text-primary hover:border-brand-primary/40 hover:bg-brand-primary/5 transition-all cursor-pointer flex items-center gap-1 active:scale-[0.97]"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Edit
                    </button>
                  </div>
                  {/* Selected Modes */}
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">Modes</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {modes.length > 0 ? (
                        modes.map((modeId) => {
                          const modeOption = PROMPT_MODE_OPTIONS.find(m => m.id === modeId);
                          const isGlowing = glowingModes.has(modeId);
                          return (
                            <span
                              key={modeId}
                              className={`px-2 py-0.5 rounded-md bg-brand-primary/15 text-brand-primary text-[11px] font-semibold ${isGlowing ? "animate-suggest-glow" : ""}`}
                            >
                              {modeOption?.label || modeId}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-text-muted italic">None selected</span>
                      )}
                    </div>
                  </div>
                  {/* Selected Modifiers */}
                  {modifiers.length > 0 && (
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">Modifiers</span>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {modifiers.map((modId) => {
                          const modOption = PROMPT_MODIFIERS.find(m => m.id === modId);
                          const isGlowing = glowingModifiers.has(modId);
                          return (
                            <span
                              key={modId}
                              className={`px-2 py-0.5 rounded-md bg-bg-elevated text-text-secondary text-[11px] font-medium ${isGlowing ? "animate-suggest-glow" : ""}`}
                            >
                              {modOption?.label || modId}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section G: Customize Output (mobile: hidden, desktop: left col row 4) */}
              <div className="hidden lg:block lg:col-start-1 lg:row-start-4">
                <div className="bg-bg-card rounded-2xl border border-border-subtle p-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setOptionsExpanded(!optionsExpanded)}
                      className="flex-1 flex items-center justify-between py-1 group"
                    >
                      <label className="text-sm font-semibold text-text-secondary flex items-center gap-2 cursor-pointer">
                        Customize Output
                        {(detailLevel !== "balanced" || outputFormat !== "structured") && (
                          <span className="px-2 py-0.5 rounded-full bg-accent-teal/20 text-accent-teal text-xs font-semibold">
                            Custom
                          </span>
                        )}
                      </label>
                      <svg
                        className={`w-5 h-5 text-text-muted transition-transform duration-200 ${optionsExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="ml-2">
                      <TooltipIcon
                        content="Customize how your prompt is generated. Choose detail level (concise to detailed), output format (structured, natural, or bullets), and add extra context."
                        position="left"
                      />
                    </div>
                  </div>
                  {/* Preview when collapsed */}
                  {!optionsExpanded && (
                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-text-muted">
                      <span className="px-2 py-1 rounded bg-bg-elevated/50">{detailLevel === "comprehensive" ? "Detailed" : detailLevel === "concise" ? "Concise" : "Balanced"}</span>
                      <span className="px-2 py-1 rounded bg-bg-elevated/50">{outputFormat === "bullet-points" ? "Bullets" : outputFormat === "conversational" ? "Natural" : "Structured"}</span>
                    </div>
                  )}
                  {/* Expanded content */}
                  {optionsExpanded && (
                    <div className="space-y-4 mt-3 pt-3 border-t border-border-subtle animate-fade_in">
                      <div className="space-y-3">
                        <DetailLevelSelector selected={detailLevel} onChange={setDetailLevel} />
                        <OutputFormatSelector selected={outputFormat} onChange={setOutputFormat} />
                      </div>
                      <div className="border-t border-border-subtle pt-3">
                        <ContextInput value={contextInfo} onChange={setContextInfo} />
                      </div>
                      <div className="border-t border-border-subtle pt-3">
                        <UrlInput references={urlReferences} onReferencesChange={setUrlReferences} />
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
            {/* /grid */}

            {/* Horizontal Progress Rail - Desktop only, bottom */}
            <div className="hidden lg:flex items-center justify-center gap-0 mt-4 pb-2">
              {steps.map((item, idx) => (
                <div key={item.step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        item.done
                          ? "bg-accent-green text-white"
                          : isStepActive(item.step)
                            ? "bg-gradient-to-br from-brand-primary to-brand-secondary text-white"
                            : "bg-bg-elevated text-text-muted border border-border-subtle"
                      }`}
                    >
                      {item.done ? (
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        item.step
                      )}
                    </div>
                    <span className={`text-[10px] mt-1 font-semibold whitespace-nowrap ${
                      item.done ? "text-accent-green" : isStepActive(item.step) ? "text-brand-primary" : "text-text-muted"
                    }`}>
                      {item.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`w-10 h-0.5 mx-2 -mt-4 rounded-full transition-colors ${
                      item.done ? "bg-accent-green" : "bg-border-subtle"
                    }`} />
                  )}
                </div>
              ))}
            </div>

      </div>
      {/* /max-w-7xl */}

      {/* Mode & Modifier Modal */}
      <ModeModifierModal
        isOpen={showModeModal}
        onClose={() => setShowModeModal(false)}
        modes={modes}
        onModesChange={setModes}
        modifiers={modifiers}
        onModifiersChange={setModifiers}
        transcript={transcript}
      />

      {/* Interview Modal */}
      <InterviewModal
        isOpen={showInterview}
        onClose={() => setShowInterview(false)}
        onComplete={handleInterviewComplete}
        onRequestGenerate={handleInterviewGenerate}
        initialTranscript={transcript}
        mode={modes.join(",")}
        existingPrompt={generatedPrompt}
        model={llmModel}
      />

      {/* Publish Modal */}
      <PublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        shareUrl={publishUrl}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
      />

      {/* QR Code / Share Modal */}
      <QRCodeModal
        isOpen={showQRCode}
        onClose={() => setShowQRCode(false)}
      />

      {/* Expanded Prompt Modal */}
      {showExpandedPrompt && generatedPrompt && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowExpandedPrompt(false)}
          />
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-bg-secondary border-2 border-brand-primary/30 rounded-2xl shadow-2xl shadow-brand-primary/10 overflow-hidden animate-fade_in flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-gradient-to-r from-brand-primary/10 to-transparent">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-primary/20 flex items-center justify-center">
                  <svg className="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-text-primary">Generated Prompt</h2>
                  <p className="text-xs text-text-muted">Full view — scroll to read</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { handleCopy(); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    copied ? "bg-accent-green text-white" : "bg-bg-elevated text-text-secondary hover:text-brand-primary"
                  }`}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  onClick={() => setShowExpandedPrompt(false)}
                  className="p-2 rounded-lg hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 min-h-0">
              <FormattedPrompt content={generatedPrompt} />
            </div>
            {/* Footer */}
            <div className="flex-shrink-0 p-4 border-t border-border-subtle bg-bg-card/50">
              <button
                onClick={() => setShowExpandedPrompt(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-sm hover:brightness-110 transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Target AI Bottom Sheet */}
      <MobileBottomSheet
        isOpen={showMobileTargetAI}
        onClose={() => setShowMobileTargetAI(false)}
        title="Target AI"
      >
        <div className="space-y-3">
          <p className="text-xs text-text-muted">Which AI will you paste this prompt into?</p>
          <LLMSelector provider={llmProvider} onProviderChange={handleProviderChange} />
        </div>
      </MobileBottomSheet>

      {/* Mobile Customize Output Bottom Sheet */}
      <MobileBottomSheet
        isOpen={showMobileCustomize}
        onClose={() => setShowMobileCustomize(false)}
        title="Customize Output"
      >
        <div className="space-y-4">
          <DetailLevelSelector selected={detailLevel} onChange={setDetailLevel} />
          <OutputFormatSelector selected={outputFormat} onChange={setOutputFormat} />
          <div className="border-t border-border-subtle pt-3">
            <ContextInput value={contextInfo} onChange={setContextInfo} />
          </div>
          <div className="border-t border-border-subtle pt-3">
            <UrlInput references={urlReferences} onReferencesChange={setUrlReferences} />
          </div>
        </div>
      </MobileBottomSheet>

      {/* Footer */}
      <footer className="border-t border-border-subtle mt-8">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Clear AI" className="h-5 w-auto opacity-60" />
            <span className="text-xs text-text-muted">
              Tell AI
              {" "}— Voice to Perfect Prompt
            </span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-text-muted">
            <span>Powered by <span className="text-brand-primary font-semibold">Clear AI</span></span>
            <span className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Prompts optimized for <span className="text-brand-primary">{llmProvider === "claude" ? "Claude" : llmProvider === "chatgpt" ? "ChatGPT" : "Gemini"}</span></span>
          </div>
        </div>
      </footer>

      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-fade_in">
          <div className="bg-bg-card border border-brand-primary/30 text-text-primary px-5 py-3 rounded-xl shadow-xl shadow-brand-primary/10 text-sm font-medium flex items-center gap-2">
            <span className="w-2 h-2 bg-brand-primary rounded-full" />
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
