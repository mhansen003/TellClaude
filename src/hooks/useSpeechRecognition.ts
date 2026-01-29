"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

// TypeScript declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: Event & { error: string }) => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition: new () => SpeechRecognitionInstance;
  }
}

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const shouldRestartRef = useRef(false);
  const accumulatedTranscriptRef = useRef("");

  // Defer browser detection to useEffect to prevent SSR hydration mismatch.
  // Server and client both start with false; client updates after mount.
  const [isSupported, setIsSupported] = useState(false);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    const hasSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    setIsSupported(hasSpeechRecognition);

    // Detect Safari (including Mac Safari)
    const userAgent = navigator.userAgent.toLowerCase();
    const safari = userAgent.includes("safari") && !userAgent.includes("chrome") && !userAgent.includes("chromium");
    setIsSafari(safari);
  }, []);

  const createRecognition = useCallback(() => {
    if (!isSupported) return null;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Safari doesn't support continuous mode well, so we handle it differently
    recognition.continuous = !isSafari;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalText = "";
      let interimText = "";

      // event.results contains ALL results since recognition started
      // Loop through all and categorize as final vs interim
      for (let i = 0; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript + " ";
        } else {
          interimText += result[0].transcript;
        }
      }

      // For Safari, accumulate transcript across recognition sessions
      if (isSafari && finalText.trim()) {
        accumulatedTranscriptRef.current = (accumulatedTranscriptRef.current + " " + finalText).trim();
        setTranscript(accumulatedTranscriptRef.current);
      } else if (!isSafari) {
        // Chrome/Firefox: REPLACE transcript with all final results
        setTranscript(finalText.trim());
      }
      setInterimTranscript(interimText);
    };

    recognition.onend = () => {
      // Auto-restart if we haven't explicitly stopped
      // Safari needs this more aggressively since it doesn't support continuous mode
      if (shouldRestartRef.current) {
        // Small delay before restart to prevent rapid cycling
        setTimeout(() => {
          if (shouldRestartRef.current && recognitionRef.current) {
            try {
              recognition.start();
            } catch {
              setIsListening(false);
              shouldRestartRef.current = false;
            }
          }
        }, isSafari ? 100 : 0);
      } else {
        setIsListening(false);
        setInterimTranscript("");
      }
    };

    recognition.onerror = (event: Event & { error: string }) => {
      console.log("Speech recognition error:", event.error);

      if (event.error === "not-allowed") {
        setIsListening(false);
        shouldRestartRef.current = false;
      }
      // "no-speech" errors are normal — just means silence, keep listening
      if (event.error === "aborted") {
        setIsListening(false);
        shouldRestartRef.current = false;
      }
      // Safari-specific: handle "network" errors by retrying
      if (event.error === "network" && isSafari && shouldRestartRef.current) {
        setTimeout(() => {
          if (shouldRestartRef.current) {
            try {
              recognition.start();
            } catch {
              setIsListening(false);
              shouldRestartRef.current = false;
            }
          }
        }, 500);
      }
    };

    return recognition;
  }, [isSupported, isSafari]);

  const startListening = useCallback(() => {
    if (!isSupported) return;

    const recognition = createRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    shouldRestartRef.current = true;
    // Reset accumulated transcript for Safari when starting fresh
    accumulatedTranscriptRef.current = "";

    try {
      recognition.start();
      setIsListening(true);
    } catch (e) {
      console.log("Failed to start speech recognition:", e);
      setIsListening(false);
      shouldRestartRef.current = false;
    }
  }, [isSupported, createRecognition]);

  const stopListening = useCallback(() => {
    shouldRestartRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setInterimTranscript("");
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setInterimTranscript("");
    accumulatedTranscriptRef.current = "";
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      shouldRestartRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
  };
}
