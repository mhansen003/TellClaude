"use client";

import { useState, useEffect, useCallback } from "react";
import { PromptModeId, DetailLevelId, OutputFormatId } from "@/lib/types";
import { buildPrompt } from "@/lib/constants";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useClipboard } from "@/hooks/useClipboard";
import Header from "@/components/Header";
import BrowserWarning from "@/components/BrowserWarning";
import VoiceRecorder from "@/components/VoiceRecorder";
import TranscriptEditor from "@/components/TranscriptEditor";
import PromptModeSelector from "@/components/PromptModeSelector";
import ModifierCheckboxes from "@/components/ModifierCheckboxes";
import DetailLevelSelector from "@/components/DetailLevelSelector";
import OutputFormatSelector from "@/components/OutputFormatSelector";
import ContextInput from "@/components/ContextInput";
import PromptPreview from "@/components/PromptPreview";
import ActionBar from "@/components/ActionBar";
import InterviewModal from "@/components/InterviewModal";

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

  // Generated prompt
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);

  // Interview modal
  const [showInterview, setShowInterview] = useState(false);

  // Toast
  const [toast, setToast] = useState<string | null>(null);

  // Clipboard
  const { copied, copyToClipboard } = useClipboard();

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

  // Generate prompt
  const handleGenerate = useCallback(() => {
    if (!transcript.trim()) return;

    if (isListening) {
      stopListening();
    }

    const prompt = buildPrompt(
      transcript.trim(),
      mode,
      detailLevel,
      outputFormat,
      modifiers,
      contextInfo
    );

    setGeneratedPrompt(prompt);
    setShowPrompt(true);
    setToast("Prompt generated! Ready to copy.");
    setTimeout(() => setToast(null), 3000);
  }, [transcript, mode, detailLevel, outputFormat, modifiers, contextInfo, isListening, stopListening]);

  // Handle interview completion
  const handleInterviewComplete = useCallback((enhancedPrompt: string) => {
    setGeneratedPrompt(enhancedPrompt);
    setShowPrompt(true);
    setToast("Enhanced prompt ready!");
    setTimeout(() => setToast(null), 3000);
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

  // Clear all
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
    setShowPrompt(false);
    setModifiers([]);
    setContextInfo("");
    setMode("code");
    setDetailLevel("balanced");
    setOutputFormat("structured");
    setToast("Ready for a new prompt!");
    setTimeout(() => setToast(null), 2000);
  }, [isListening, stopListening, resetTranscript]);

  return (
    <div className="relative z-10 min-h-screen pb-24 md:pb-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <Header />

        {/* Browser Warning */}
        {showBrowserWarning && <BrowserWarning />}

        {/* Voice Recorder */}
        <VoiceRecorder
          isListening={isListening}
          isSupported={isSupported}
          interimTranscript={interimTranscript}
          onStart={startListening}
          onStop={stopListening}
        />

        {/* Transcript Editor */}
        <TranscriptEditor
          value={transcript}
          onChange={setTranscript}
          onClear={handleClear}
          isListening={isListening}
        />

        {/* Divider */}
        <div className="px-4 md:px-0 py-2">
          <div className="h-px bg-gradient-to-r from-transparent via-border-subtle to-transparent" />
        </div>

        {/* Prompt Mode Selector */}
        <PromptModeSelector selected={mode} onChange={setMode} />

        {/* Modifier Checkboxes */}
        <ModifierCheckboxes selected={modifiers} onChange={setModifiers} />

        {/* Detail Level and Output Format */}
        <div className="px-4 md:px-0 py-4 flex flex-col md:flex-row gap-4">
          <DetailLevelSelector selected={detailLevel} onChange={setDetailLevel} />
          <OutputFormatSelector selected={outputFormat} onChange={setOutputFormat} />
        </div>

        {/* Context Input */}
        <ContextInput value={contextInfo} onChange={setContextInfo} />

        {/* Action Buttons */}
        <div className="px-4 md:px-0 py-4 flex gap-3">
          <button
            onClick={handleGenerate}
            disabled={!transcript.trim()}
            className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-claude-orange to-claude-coral text-white font-bold text-base transition-all hover:brightness-110 hover:shadow-lg hover:shadow-claude-orange/20 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:brightness-100 disabled:hover:shadow-none cursor-pointer"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Prompt
            </span>
          </button>

          {/* Interview Mode Button */}
          <button
            onClick={() => setShowInterview(true)}
            disabled={!transcript.trim()}
            className="px-5 py-3.5 rounded-xl bg-bg-card border-2 border-accent-purple/50 text-accent-purple font-semibold text-sm transition-all hover:bg-accent-purple/10 hover:border-accent-purple active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
            title="AI-assisted interview to refine your prompt"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="hidden sm:inline">Interview</span>
          </button>
        </div>

        {/* Prompt Preview */}
        <PromptPreview prompt={generatedPrompt} isVisible={showPrompt} />

        {/* Action Bar */}
        <ActionBar
          prompt={generatedPrompt}
          copied={copied}
          onCopy={handleCopy}
          onReset={handleReset}
        />
      </div>

      {/* Interview Modal */}
      <InterviewModal
        isOpen={showInterview}
        onClose={() => setShowInterview(false)}
        onComplete={handleInterviewComplete}
        initialTranscript={transcript}
        mode={mode}
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
