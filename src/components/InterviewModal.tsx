"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";

interface Message {
  role: "assistant" | "user";
  content: string;
}

interface InterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (enhancedPrompt: string) => void;
  initialTranscript: string;
  mode: string;
}

export default function InterviewModal({
  isOpen,
  onClose,
  onComplete,
  initialTranscript,
  mode,
}: InterviewModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Speech recognition for voice input
  const {
    isListening,
    transcript: speechTranscript,
    interimTranscript,
    isSupported: isVoiceSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  // Sync speech transcript to input
  useEffect(() => {
    if (speechTranscript) {
      setInput(speechTranscript);
    }
  }, [speechTranscript]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Start fresh interview when modal opens
  useEffect(() => {
    if (isOpen) {
      // Reset all state for a fresh conversation
      setMessages([]);
      setInput("");
      setIsComplete(false);
      setFinalPrompt("");
      resetTranscript();
      // Start the interview with current form values
      startInterview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialTranscript, mode]);

  // Stop listening when modal closes
  useEffect(() => {
    if (!isOpen && isListening) {
      stopListening();
      resetTranscript();
    }
  }, [isOpen, isListening, stopListening, resetTranscript]);

  const startInterview = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          transcript: initialTranscript,
          mode: mode,
        }),
      });

      const data = await response.json();
      if (data.message) {
        setMessages([{ role: "assistant", content: data.message }]);
      }
    } catch (error) {
      console.error("Failed to start interview:", error);
      setMessages([{
        role: "assistant",
        content: "Hello! I'm here to help you refine your prompt. Tell me more about what you're trying to accomplish. What specific outcome are you hoping for?",
      }]);
    }
    setIsLoading(false);
  };

  const sendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    // Stop listening if we're recording
    if (isListening) {
      stopListening();
    }

    const userMessage = input.trim();
    setInput("");
    resetTranscript();
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "continue",
          transcript: initialTranscript,
          mode: mode,
          messages: [...messages, { role: "user", content: userMessage }],
        }),
      });

      const data = await response.json();

      if (data.isComplete && data.finalPrompt) {
        setIsComplete(true);
        setFinalPrompt(data.finalPrompt);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "I've gathered all the information I need. Here's your enhanced prompt ready to use!" },
        ]);
      } else if (data.message) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
      }
    } catch (error) {
      console.error("Interview error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I apologize, there was an issue. Could you please repeat that?" },
      ]);
    }

    setIsLoading(false);
  }, [input, isLoading, isListening, stopListening, resetTranscript, messages, initialTranscript, mode]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      resetTranscript();
      setInput("");
      startListening();
    }
  };

  const handleUsePrompt = () => {
    onComplete(finalPrompt);
    handleClose();
  };

  // Manually generate prompt from conversation
  const handleGeneratePrompt = useCallback(async () => {
    if (isLoading) return;

    if (isListening) {
      stopListening();
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          transcript: initialTranscript,
          mode: mode,
          messages: messages,
        }),
      });

      const data = await response.json();

      if (data.finalPrompt) {
        setIsComplete(true);
        setFinalPrompt(data.finalPrompt);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Here's your generated prompt based on our conversation!" },
        ]);
      }
    } catch (error) {
      console.error("Generate prompt error:", error);
    }

    setIsLoading(false);
  }, [isLoading, isListening, stopListening, initialTranscript, mode, messages]);

  const handleClose = () => {
    if (isListening) {
      stopListening();
    }
    resetTranscript();
    setMessages([]);
    setInput("");
    setIsComplete(false);
    setFinalPrompt("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-bg-secondary border-2 border-claude-orange/30 rounded-2xl shadow-2xl shadow-claude-orange/10 overflow-hidden animate-fade_in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-gradient-to-r from-claude-orange/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-claude-orange to-claude-coral flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Interview Mode</h2>
              <p className="text-xs text-text-muted">AI-powered prompt refinement</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="h-80 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                  message.role === "user"
                    ? "bg-claude-orange text-white rounded-br-sm"
                    : "bg-bg-card border border-border-subtle text-text-primary rounded-bl-sm"
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-bg-card border border-border-subtle rounded-2xl rounded-bl-sm px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-claude-orange rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-claude-orange rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-claude-orange rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}

          {isComplete && finalPrompt && (
            <div className="p-4 bg-accent-green/10 border border-accent-green/30 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-5 h-5 text-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-semibold text-accent-green">Enhanced Prompt Ready</span>
              </div>
              <pre className="text-xs text-text-secondary bg-bg-card p-3 rounded-lg overflow-auto max-h-40 whitespace-pre-wrap">
                {finalPrompt}
              </pre>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Interim transcript while recording */}
        {isListening && interimTranscript && (
          <div className="px-4 pb-2">
            <div className="p-3 rounded-xl bg-claude-glow border border-claude-orange/30">
              <p className="text-sm text-text-secondary italic typing-cursor">{interimTranscript}</p>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-border-subtle bg-bg-card/50">
          {isComplete ? (
            <div className="flex gap-3">
              <button
                onClick={handleUsePrompt}
                className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-claude-orange to-claude-coral text-white font-bold text-sm hover:brightness-110 transition-all"
              >
                Use This Prompt
              </button>
              <button
                onClick={handleClose}
                className="py-3 px-6 rounded-xl bg-bg-elevated border border-border-subtle text-text-secondary font-semibold text-sm hover:text-text-primary transition-all"
              >
                Cancel
              </button>
            </div>
          ) : (
            <>
            <div className="flex gap-2">
              {/* Voice Button */}
              {isVoiceSupported && (
                <button
                  onClick={toggleVoice}
                  disabled={isLoading}
                  className={`
                    relative p-3 rounded-xl transition-all duration-200 flex-shrink-0
                    ${
                      isListening
                        ? "bg-claude-orange text-white mic-recording"
                        : "bg-bg-card border-2 border-border-subtle text-text-secondary hover:border-claude-orange/50 hover:text-claude-orange"
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                  title={isListening ? "Stop recording" : "Start recording"}
                >
                  {/* Pulse rings when recording */}
                  {isListening && (
                    <>
                      <span className="absolute inset-0 rounded-xl bg-claude-orange/30 animate-pulse_ring" />
                      <span className="absolute inset-0 rounded-xl bg-claude-orange/20 animate-pulse_ring" style={{ animationDelay: "0.5s" }} />
                    </>
                  )}
                  <svg
                    className="w-5 h-5 relative z-10"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {isListening ? (
                      // Stop icon
                      <rect x="6" y="6" width="12" height="12" rx="2" />
                    ) : (
                      // Mic icon
                      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                    )}
                  </svg>
                </button>
              )}

              {/* Text Input */}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? "Listening..." : "Type or speak your answer..."}
                disabled={isLoading}
                className={`
                  flex-1 px-4 py-3 rounded-xl bg-bg-card border-2 text-text-primary placeholder:text-text-muted text-sm focus:outline-none transition-all disabled:opacity-50
                  ${isListening ? "border-claude-orange/50 bg-claude-glow" : "border-border-subtle focus:border-claude-orange/50"}
                `}
              />

              {/* Send Button */}
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-claude-orange to-claude-coral text-white font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>

            {/* Action buttons - Generate Prompt / Cancel */}
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleGeneratePrompt}
                disabled={messages.length === 0 || isLoading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-accent-green/20 border border-accent-green/50 text-accent-green font-semibold text-sm hover:bg-accent-green/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Prompt
              </button>
              <button
                onClick={handleClose}
                className="py-2.5 px-4 rounded-xl bg-bg-elevated border border-border-subtle text-text-muted font-semibold text-sm hover:text-text-primary hover:border-border-subtle transition-all"
              >
                Cancel
              </button>
            </div>
            </>
          )}

          {/* Recording indicator */}
          {isListening && (
            <div className="flex items-center justify-center gap-2 mt-3 text-claude-orange text-xs font-semibold">
              <span className="w-2 h-2 bg-claude-orange rounded-full animate-pulse" />
              Recording... speak your answer
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
