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
  onRequestGenerate?: (conversationContext: string) => void; // Close modal & trigger main generation
  initialTranscript: string;
  mode: string;
  existingPrompt?: string; // If provided, interview will enhance this prompt
  model?: string; // LLM model ID to use (e.g. "anthropic/claude-opus-4")
}

export default function InterviewModal({
  isOpen,
  onClose,
  onComplete,
  onRequestGenerate,
  initialTranscript,
  mode,
  existingPrompt = "",
  model,
}: InterviewModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [finalPrompt, setFinalPrompt] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoSendRef = useRef(false);
  const sendMessageRef = useRef<() => void>(() => {});
  const justSentRef = useRef(false);
  const sentTextRef = useRef("");

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

  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTranscriptRef = useRef("");
  const hadInterimRef = useRef(false);

  // Sync speech → input + auto-send on 1.5s pause
  useEffect(() => {
    if (speechTranscript) {
      // If we just sent, ignore stale transcript echoes
      if (justSentRef.current) {
        if (speechTranscript === sentTextRef.current || speechTranscript.length <= sentTextRef.current.length) {
          return;
        }
        // New words after send — clear the flag
        justSentRef.current = false;
        sentTextRef.current = "";
      }

      setInput(speechTranscript);

      // Clear existing timer
      if (pauseTimerRef.current) {
        clearTimeout(pauseTimerRef.current);
      }

      // Only start timer if transcript actually changed (new words spoken)
      if (speechTranscript !== lastTranscriptRef.current) {
        lastTranscriptRef.current = speechTranscript;

        // Auto-send after 1.5 seconds of silence
        pauseTimerRef.current = setTimeout(() => {
          if (speechTranscript.trim() && !isLoading && !isComplete) {
            autoSendRef.current = true;
            sendMessageRef.current();
          }
        }, 1500);
      }
    }
  }, [speechTranscript, isLoading, isComplete]);

  // Secondary trigger: when interim transcript goes empty after speech, it means
  // the recognition finalized — good signal user stopped talking
  useEffect(() => {
    if (interimTranscript) {
      hadInterimRef.current = true;
    } else if (hadInterimRef.current && isListening && input.trim() && !isLoading && !isComplete) {
      hadInterimRef.current = false;
      // Short delay to let final transcript settle
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = setTimeout(() => {
        if (input.trim() && !isLoading && !isComplete) {
          autoSendRef.current = true;
          sendMessageRef.current();
        }
      }, 800);
    }
  }, [interimTranscript, isListening, input, isLoading, isComplete]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, []);

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
      justSentRef.current = false;
      sentTextRef.current = "";
      lastTranscriptRef.current = "";
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
          existingPrompt: existingPrompt, // Pass existing prompt for enhancement mode
          model,
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

    const isAutoSend = autoSendRef.current;
    autoSendRef.current = false;

    const userMessage = input.trim();

    // Track what we just sent to reject stale echoes
    justSentRef.current = true;
    sentTextRef.current = userMessage;

    // Only stop mic if manually sending (not auto-send)
    if (!isAutoSend && isListening) {
      stopListening();
    }
    resetTranscript();
    lastTranscriptRef.current = "";

    setInput("");
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
          existingPrompt: existingPrompt, // Pass existing prompt for context
          model,
        }),
      });

      const data = await response.json();

      if (data.isComplete && data.finalPrompt) {
        setIsComplete(true);
        setFinalPrompt(data.finalPrompt);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: existingPrompt
            ? "I've enhanced your existing prompt with the new details. Here it is!"
            : "I've gathered all the information I need. Here's your enhanced prompt ready to use!"
          },
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
  }, [input, isLoading, isListening, stopListening, resetTranscript, messages, initialTranscript, mode, existingPrompt, model]);

  // Keep ref in sync so timer callback can call latest sendMessage
  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

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
      justSentRef.current = false;
      sentTextRef.current = "";
      resetTranscript();
      setInput("");
      startListening();
    }
  };

  const handleUsePrompt = () => {
    navigator.clipboard.writeText(finalPrompt).catch(() => {});
    onComplete(finalPrompt);
    handleClose();
  };

  // Generate prompt — close modal and trigger main page generation with conversation context
  const handleGeneratePrompt = useCallback(() => {
    if (isLoading) return;

    if (isListening) {
      stopListening();
    }

    // Build conversation context from all user messages
    const userMessages = messages
      .filter((m) => m.role === "user")
      .map((m) => m.content);
    const conversationContext = userMessages.join("\n");

    if (onRequestGenerate && conversationContext.trim()) {
      // Close modal and trigger main generation pipeline
      if (isListening) stopListening();
      resetTranscript();
      onClose();
      onRequestGenerate(conversationContext);
      return;
    }

    setIsLoading(false);
  }, [isLoading, isListening, stopListening, resetTranscript, messages, onRequestGenerate, onClose]);

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
      <div className="relative w-full max-w-2xl bg-bg-secondary border-2 border-brand-primary/30 rounded-2xl shadow-2xl shadow-brand-primary/10 overflow-hidden animate-fade_in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-gradient-to-r from-brand-primary/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center">
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
                    ? "bg-brand-primary text-white rounded-br-sm"
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
                  <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
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
            <div className="p-3 rounded-xl bg-brand-glow border border-brand-primary/30">
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
                className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-sm hover:brightness-110 transition-all"
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
              {/* Voice Button with glow */}
              {isVoiceSupported && (
                <button
                  onClick={toggleVoice}
                  disabled={isLoading}
                  className={`
                    relative p-3 rounded-xl transition-all duration-200 flex-shrink-0 cursor-pointer
                    ${
                      isListening
                        ? "bg-brand-primary text-white"
                        : "bg-bg-card border border-brand-primary/40 text-brand-primary interview-mic-glow"
                    }
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                  title={isListening ? "Stop recording" : "Start continuous voice"}
                >
                  {/* Pulse rings when recording */}
                  {isListening && (
                    <>
                      <span className="absolute inset-0 rounded-xl bg-brand-primary/30 animate-pulse" />
                      <span className="absolute inset-0 rounded-xl bg-brand-primary/20 animate-pulse" style={{ animationDelay: "0.5s" }} />
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
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isListening ? "Listening..." : "Type or speak your answer..."}
                disabled={isLoading}
                className={`
                  flex-1 px-4 py-3 rounded-xl bg-bg-card border-2 text-text-primary placeholder:text-text-muted text-sm focus:outline-none transition-all disabled:opacity-50
                  ${isListening ? "border-brand-primary/50 bg-brand-glow" : "border-border-subtle focus:border-brand-primary/50"}
                `}
              />

              {/* Send Button */}
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                className="p-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
                </svg>
              </button>
            </div>

            {/* Action buttons - Generate Prompt / Cancel */}
            {messages.length >= 3 && !isLoading && (
              <button
                onClick={handleGeneratePrompt}
                className="w-full py-2 rounded-xl bg-bg-card border border-accent-green/30 text-accent-green font-medium text-xs transition-all hover:bg-accent-green/10 active:scale-[0.98] cursor-pointer mt-2"
              >
                Generate Prompt Now
              </button>
            )}
            </>
          )}

          {/* Continuous voice status */}
          {isVoiceSupported && !isComplete && (
            <p className={`text-xs font-medium text-center mt-2 ${
              isListening ? "text-brand-primary animate-pulse" : "text-brand-primary/70"
            }`}>
              {isListening
                ? "🎙 Listening... just keep talking"
                : "🎙 Tap mic for continuous voice — just talk, no need to press send"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
