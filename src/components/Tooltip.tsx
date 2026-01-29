"use client";

import { useState, useRef, useEffect, ReactNode } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

export default function Tooltip({
  content,
  children,
  position = "top",
  delay = 300
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const padding = 8;

    let x = 0;
    let y = 0;

    switch (position) {
      case "top":
        x = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        y = triggerRect.top - tooltipRect.height - padding;
        break;
      case "bottom":
        x = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        y = triggerRect.bottom + padding;
        break;
      case "left":
        x = triggerRect.left - tooltipRect.width - padding;
        y = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        break;
      case "right":
        x = triggerRect.right + padding;
        y = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        break;
    }

    // Keep within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (x < 10) x = 10;
    if (x + tooltipRect.width > viewportWidth - 10) {
      x = viewportWidth - tooltipRect.width - 10;
    }
    if (y < 10) y = 10;
    if (y + tooltipRect.height > viewportHeight - 10) {
      y = viewportHeight - tooltipRect.height - 10;
    }

    setCoords({ x, y });
  };

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
    }
  }, [isVisible]);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-flex"
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className="fixed z-[200] pointer-events-none animate-fade_in"
          style={{ left: coords.x, top: coords.y }}
        >
          <div className="relative px-3 py-2 rounded-lg bg-bg-elevated border border-claude-orange/30 shadow-xl shadow-black/20 max-w-xs">
            {/* Arrow */}
            <div
              className={`absolute w-2 h-2 bg-bg-elevated border-claude-orange/30 transform rotate-45 ${
                position === "top"
                  ? "bottom-[-5px] left-1/2 -translate-x-1/2 border-r border-b"
                  : position === "bottom"
                  ? "top-[-5px] left-1/2 -translate-x-1/2 border-l border-t"
                  : position === "left"
                  ? "right-[-5px] top-1/2 -translate-y-1/2 border-t border-r"
                  : "left-[-5px] top-1/2 -translate-y-1/2 border-b border-l"
              }`}
            />
            <p className="text-xs text-text-secondary leading-relaxed">{content}</p>
          </div>
        </div>
      )}
    </>
  );
}

// Info icon button with tooltip
interface TooltipIconProps {
  content: string;
  position?: "top" | "bottom" | "left" | "right";
}

export function TooltipIcon({ content, position = "top" }: TooltipIconProps) {
  return (
    <Tooltip content={content} position={position}>
      <button
        type="button"
        className="w-4 h-4 rounded-full bg-bg-elevated border border-border-subtle flex items-center justify-center text-text-muted hover:text-claude-orange hover:border-claude-orange/50 transition-colors cursor-help"
        onClick={(e) => e.preventDefault()}
      >
        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </Tooltip>
  );
}
