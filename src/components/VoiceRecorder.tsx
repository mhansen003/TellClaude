"use client";

interface VoiceRecorderProps {
  isListening: boolean;
  isSupported: boolean;
  interimTranscript: string;
  onStart: () => void;
  onStop: () => void;
}

export default function VoiceRecorder({
  isListening,
  isSupported,
  interimTranscript,
  onStart,
  onStop,
}: VoiceRecorderProps) {
  if (!isSupported) return null;

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {/* Mic Button */}
      <button
        onClick={isListening ? onStop : onStart}
        className={`
          relative w-24 h-24 rounded-full flex items-center justify-center
          transition-all duration-300 cursor-pointer group
          ${
            isListening
              ? "bg-gradient-to-br from-claude-orange to-claude-coral mic-recording scale-110"
              : "bg-bg-card hover:bg-bg-elevated border-2 border-border-subtle hover:border-claude-orange/50"
          }
        `}
        aria-label={isListening ? "Stop recording" : "Start recording"}
      >
        {/* Outer glow ring */}
        {!isListening && (
          <span className="absolute inset-0 rounded-full bg-gradient-to-r from-claude-orange/20 to-claude-coral/20 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}

        {/* Pulse rings when recording */}
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-full bg-claude-orange/30 animate-pulse_ring" />
            <span
              className="absolute inset-0 rounded-full bg-claude-orange/20 animate-pulse_ring"
              style={{ animationDelay: "0.5s" }}
            />
            <span
              className="absolute inset-0 rounded-full bg-claude-orange/10 animate-pulse_ring"
              style={{ animationDelay: "1s" }}
            />
          </>
        )}

        <svg
          className={`w-10 h-10 relative z-10 transition-all ${
            isListening ? "text-white scale-90" : "text-text-secondary group-hover:text-claude-orange"
          }`}
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

      {/* Status Text */}
      <p
        className={`text-sm font-semibold transition-colors ${
          isListening ? "text-claude-orange" : "text-text-muted"
        }`}
      >
        {isListening ? (
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 bg-claude-orange rounded-full animate-pulse" />
            Listening... tap to stop
          </span>
        ) : (
          "Tap to start recording"
        )}
      </p>

      {/* Interim transcript */}
      {isListening && interimTranscript && (
        <div className="mx-4 p-4 rounded-xl bg-bg-card/50 border border-claude-orange/20 max-w-lg">
          <p className="text-text-secondary text-sm italic text-center typing-cursor">
            {interimTranscript}
          </p>
        </div>
      )}
    </div>
  );
}
