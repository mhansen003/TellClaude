"use client";

import { useState, useEffect, useCallback } from "react";
import { PromptModeId, DetailLevelId, OutputFormatId } from "@/lib/types";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useClipboard } from "@/hooks/useClipboard";
import Header from "@/components/Header";
import BrowserWarning from "@/components/BrowserWarning";
import VoiceRecorder from "@/components/VoiceRecorder";
import TranscriptEditor, { Attachment } from "@/components/TranscriptEditor";
import PromptModeSelector from "@/components/PromptModeSelector";
import ModifierCheckboxes from "@/components/ModifierCheckboxes";
import DetailLevelSelector from "@/components/DetailLevelSelector";
import OutputFormatSelector from "@/components/OutputFormatSelector";
import ContextInput from "@/components/ContextInput";
import UrlInput, { UrlReference } from "@/components/UrlInput";
import InterviewModal from "@/components/InterviewModal";
import AboutModal from "@/components/AboutModal";
import FormattedPrompt from "@/components/FormattedPrompt";
import PromptHistory, { HistoryItem } from "@/components/PromptHistory";
import { TooltipIcon } from "@/components/Tooltip";

const HISTORY_STORAGE_KEY = "tellclaude-history";

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
  const [mode, setMode] = useState<PromptModeId>("code");
  const [detailLevel, setDetailLevel] = useState<DetailLevelId>("balanced");
  const [outputFormat, setOutputFormat] = useState<OutputFormatId>("structured");
  const [modifiers, setModifiers] = useState<string[]>([]);
  const [contextInfo, setContextInfo] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [urlReferences, setUrlReferences] = useState<UrlReference[]>([]);

  // Generated prompt
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // History
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeHistoryId, setActiveHistoryId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  // Interview modal
  const [showInterview, setShowInterview] = useState(false);

  // About modal
  const [showAbout, setShowAbout] = useState(false);

  // Options collapse
  const [optionsExpanded, setOptionsExpanded] = useState(false);

  // Edit mode for output
  const [isEditingOutput, setIsEditingOutput] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  // Clipboard
  const { copied, copyToClipboard } = useClipboard();

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

  // Add to history
  const addToHistory = useCallback((transcriptText: string, promptText: string, modeId: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      transcript: transcriptText,
      prompt: promptText,
      mode: modeId,
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

    setIsGenerating(true);
    setIsEditingOutput(false); // Reset edit mode when generating new prompt

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
          mode,
          detailLevel,
          outputFormat,
          modifiers,
          contextInfo,
          attachments: attachmentData,
          urlReferences: urlData,
        }),
      });

      const data = await response.json();

      if (data.prompt) {
        setGeneratedPrompt(data.prompt);
        addToHistory(transcript.trim(), data.prompt, mode);
        setToast("Prompt generated by Claude Opus 4.5!");
        setTimeout(() => setToast(null), 3000);
      } else {
        throw new Error("No prompt returned");
      }
    } catch (error) {
      console.error("Generation failed:", error);
      setToast("Failed to generate. Please try again.");
      setTimeout(() => setToast(null), 3000);
    }

    setIsGenerating(false);
  }, [transcript, mode, detailLevel, outputFormat, modifiers, contextInfo, isGenerating, isListening, stopListening, addToHistory]);

  // Handle interview completion
  const handleInterviewComplete = useCallback((enhancedPrompt: string) => {
    setGeneratedPrompt(enhancedPrompt);
    addToHistory(transcript.trim(), enhancedPrompt, mode);
    setToast("Enhanced prompt ready!");
    setTimeout(() => setToast(null), 3000);
  }, [transcript, mode, addToHistory]);

  // Select from history
  const handleHistorySelect = useCallback((item: HistoryItem) => {
    setTranscript(item.transcript);
    setGeneratedPrompt(item.prompt);
    setActiveHistoryId(item.id);
    setMode(item.mode as PromptModeId);
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
  }, [resetTranscript]);

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
    setMode("code");
    setDetailLevel("balanced");
    setOutputFormat("structured");
    setActiveHistoryId(null);
    setIsEditingOutput(false);
    setToast("Ready for a new prompt!");
    setTimeout(() => setToast(null), 2000);
  }, [isListening, stopListening, resetTranscript]);

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
      />

      {/* Header - Full width */}
      <Header onAboutClick={() => setShowAbout(true)} />

      {/* Main Content - Side by Side Layout */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 pb-6 sm:pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-stretch">

          {/* LEFT COLUMN - Input */}
          <div className="space-y-3">
            {/* Browser Warning */}
            {showBrowserWarning && <BrowserWarning />}

            {/* Voice Recorder + Transcript in one card */}
            <div className="bg-bg-card rounded-2xl border border-border-subtle p-4 space-y-4">
              {/* Section Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-claude-orange" />
                  <span className="text-sm font-semibold text-text-secondary">Voice Input</span>
                </div>
                <TooltipIcon
                  content="Click the microphone to speak your request, or type directly below. Your voice is converted to text in real-time."
                  position="left"
                />
              </div>
              <VoiceRecorder
                isListening={isListening}
                isSupported={isSupported}
                interimTranscript={interimTranscript}
                onStart={startListening}
                onStop={stopListening}
              />
              <TranscriptEditor
                value={transcript}
                onChange={setTranscript}
                onClear={handleClear}
                isListening={isListening}
                attachments={attachments}
                onAttachmentsChange={setAttachments}
              />
            </div>

            {/* Mobile Action Buttons - Only visible on mobile, right after transcript */}
            <div className="flex gap-2 lg:hidden">
              <button
                onClick={handleGenerate}
                disabled={!transcript.trim() || isGenerating}
                className={`flex-1 h-14 rounded-xl bg-gradient-to-r from-claude-orange to-claude-coral text-white font-bold text-sm transition-all hover:brightness-110 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                  transcript.trim() && !isGenerating ? "animate-pulse-glow shadow-[0_0_20px_rgba(255,107,53,0.4)]" : ""
                }`}
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Prompt
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowInterview(true)}
                disabled={isGenerating}
                className="h-14 px-4 rounded-xl bg-bg-card border-2 border-accent-purple/50 text-accent-purple font-semibold text-sm transition-all hover:bg-accent-purple/10 active:scale-[0.98] disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </button>
            </div>

            {/* Mode + Modifiers in one card */}
            <div className="bg-bg-card rounded-2xl border border-border-subtle p-4 space-y-3">
              {/* Mode Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-purple" />
                  <span className="text-sm font-semibold text-text-secondary">Prompt Mode</span>
                </div>
                <TooltipIcon
                  content="Select a mode to tell Claude what type of task you need help with. Engineering modes focus on code/technical tasks, Business modes on documents/analysis."
                  position="left"
                />
              </div>
              <PromptModeSelector selected={mode} onChange={setMode} />
              <div className="border-t border-border-subtle pt-3">
                {/* Modifiers Header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-green" />
                    <span className="text-sm font-semibold text-text-secondary">Modifiers</span>
                  </div>
                  <TooltipIcon
                    content="Add specific requirements to your prompt. Check multiple options to include step-by-step instructions, examples, best practices, and more."
                    position="left"
                  />
                </div>
                <ModifierCheckboxes selected={modifiers} onChange={setModifiers} />
              </div>
            </div>

            {/* Options: Detail, Format, Context - Collapsible */}
            <div className="bg-bg-card rounded-2xl border border-border-subtle p-4">
              {/* Header - Always visible, clickable to expand/collapse */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setOptionsExpanded(!optionsExpanded)}
                  className="flex-1 flex items-center justify-between py-1 group"
                >
                  <label className="text-sm font-semibold text-text-secondary flex items-center gap-2 cursor-pointer">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-teal" />
                    Output Options
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

          {/* RIGHT COLUMN - Actions + Output */}
          <div className="flex flex-col gap-3 lg:min-h-full">
            {/* Action Buttons - Desktop only (mobile buttons are above in left column) */}
            <div className="hidden lg:flex gap-2 flex-shrink-0">
              <button
                onClick={handleGenerate}
                disabled={!transcript.trim() || isGenerating}
                className={`flex-1 h-14 sm:h-12 rounded-xl bg-gradient-to-r from-claude-orange to-claude-coral text-white font-bold text-sm transition-all hover:brightness-110 hover:shadow-lg hover:shadow-claude-orange/20 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:hover:shadow-none cursor-pointer ${
                  transcript.trim() && !isGenerating ? "animate-pulse-glow shadow-[0_0_20px_rgba(255,107,53,0.4)]" : ""
                }`}
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Prompt
                  </span>
                )}
              </button>

              <button
                onClick={() => setShowInterview(true)}
                disabled={isGenerating}
                className="h-14 sm:h-12 px-4 rounded-xl bg-bg-card border-2 border-accent-purple/50 text-accent-purple font-semibold text-sm transition-all hover:bg-accent-purple/10 hover:border-accent-purple active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                title="AI-assisted interview - helps you build your prompt through conversation"
              >
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="hidden sm:inline">Interview</span>
              </button>
            </div>

            {/* Output Panel - Fixed height with internal scroll */}
            <div className="bg-bg-card rounded-2xl border border-border-subtle overflow-hidden flex flex-col h-[500px] lg:h-[calc(100vh-220px)] lg:max-h-[700px] lg:min-h-[400px]">
              {/* Header */}
              <div className="flex-shrink-0 px-5 py-4 border-b border-border-subtle bg-gradient-to-r from-claude-orange/10 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-claude-orange to-claude-coral flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-text-primary">Generated Prompt</h2>
                      <p className="text-xs text-text-muted">Powered by Claude Opus 4.5</p>
                    </div>
                  </div>
                  {generatedPrompt && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setIsEditingOutput(!isEditingOutput)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isEditingOutput
                            ? "bg-accent-purple text-white"
                            : "bg-bg-elevated text-text-secondary hover:text-accent-purple"
                        }`}
                      >
                        {isEditingOutput ? "View" : "Edit"}
                      </button>
                      <button
                        onClick={handleCopy}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          copied
                            ? "bg-accent-green text-white"
                            : "bg-bg-elevated text-text-secondary hover:text-claude-orange"
                        }`}
                      >
                        {copied ? "Copied!" : "Copy"}
                      </button>
                      <button
                        onClick={handleReset}
                        className="px-3 py-1.5 rounded-lg bg-bg-elevated text-text-secondary hover:text-accent-rose text-xs font-semibold transition-all"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Content - Scrollable */}
              <div className="p-4 sm:p-5 flex-1 min-h-0 overflow-y-auto">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center h-64 text-text-muted">
                    <div className="relative w-16 h-16 mb-4">
                      <div className="absolute inset-0 rounded-full border-4 border-claude-orange/20" />
                      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-claude-orange animate-spin" />
                    </div>
                    <p className="text-sm font-medium">Claude Opus 4.5 is crafting your prompt...</p>
                  </div>
                ) : generatedPrompt ? (
                  <div className="relative h-full">
                    {isEditingOutput ? (
                      <textarea
                        value={generatedPrompt}
                        onChange={(e) => setGeneratedPrompt(e.target.value)}
                        className="w-full h-full min-h-[300px] p-4 rounded-xl bg-bg-elevated border-2 border-accent-purple/30 text-text-primary font-mono text-sm resize-none focus:outline-none focus:border-accent-purple/50 transition-colors"
                        placeholder="Edit your prompt..."
                      />
                    ) : (
                      <FormattedPrompt content={generatedPrompt} />
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-text-muted py-8">
                    <svg className="w-12 h-12 mb-3 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm font-medium mb-1">Your prompt will appear here</p>
                    <p className="text-xs mb-6">Speak or type your request, then click Generate</p>

                    {/* Quick Tips integrated into empty state */}
                    <div className="w-full max-w-xs border-t border-border-subtle pt-4">
                      <h3 className="text-xs font-semibold text-text-muted mb-2 flex items-center justify-center gap-1.5">
                        <span className="text-claude-orange">💡</span> Quick Tips
                      </h3>
                      <ul className="text-xs text-text-muted space-y-1.5 text-left">
                        <li className="flex items-start gap-1.5">
                          <span className="text-claude-orange/60">•</span>
                          <span>Be specific about what you want to achieve</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-claude-orange/60">•</span>
                          <span>Expand "Prompt Modifiers" to add requirements</span>
                        </li>
                        <li className="flex items-start gap-1.5">
                          <span className="text-claude-orange/60">•</span>
                          <span>Use Interview mode for complex requests</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Interview Modal */}
      <InterviewModal
        isOpen={showInterview}
        onClose={() => setShowInterview(false)}
        onComplete={handleInterviewComplete}
        initialTranscript={transcript}
        mode={mode}
        existingPrompt={generatedPrompt}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
      />

      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] animate-fade_in">
          <div className="bg-bg-card border border-claude-orange/30 text-text-primary px-5 py-3 rounded-xl shadow-xl shadow-claude-orange/10 text-sm font-medium flex items-center gap-2">
            <span className="w-2 h-2 bg-claude-orange rounded-full" />
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
