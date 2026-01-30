"use client";

export default function BrowserWarning() {
  return (
    <div className="mx-4 mb-4 p-4 rounded-xl bg-brand-primary/10 border border-brand-primary/20 text-center">
      <p className="text-brand-primary text-sm font-semibold flex items-center justify-center gap-2">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        Voice recording not supported in this browser
      </p>
      <p className="text-text-muted text-xs mt-2">
        Best experience: Chrome, Edge, or Safari 14.1+. You can still type your message below.
      </p>
    </div>
  );
}
