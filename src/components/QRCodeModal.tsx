"use client";

import QRCode from "react-qr-code";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHARE_URL = "https://tell-ai.cmgfinancial.ai/";

export default function QRCodeModal({ isOpen, onClose }: QRCodeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-bg-secondary border-2 border-brand-primary/30 rounded-2xl shadow-2xl shadow-brand-primary/10 overflow-hidden animate-fade_in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-gradient-to-r from-brand-primary/10 to-transparent">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Clear AI" className="h-9 w-auto object-contain" />
            <div>
              <h2 className="text-base font-bold text-text-primary">Share This App</h2>
              <p className="text-xs text-text-muted">Scan to open on any device</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-bg-elevated text-text-muted hover:text-text-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center px-6 py-8 space-y-4">
          <div className="bg-white p-4 rounded-xl">
            <QRCode
              value={SHARE_URL}
              size={200}
              level="H"
              bgColor="#ffffff"
              fgColor="#0c0a09"
            />
          </div>
          <p className="text-xs text-text-muted text-center break-all">{SHARE_URL}</p>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t border-border-subtle bg-bg-card/50">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold text-sm hover:brightness-110 transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
