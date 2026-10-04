"use client";

import { useEffect, useRef } from "react";
import { X, Activity, Clock, Terminal } from "lucide-react";

export interface TraceEvent {
  step: string;
  message: string;
  timestamp: number;
}

interface TracePanelProps {
  isOpen: boolean;
  onClose: () => void;
  traces: TraceEvent[];
  isStreaming?: boolean;
}

export function TracePanel({
  isOpen,
  onClose,
  traces,
  isStreaming = false,
}: TracePanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="trace-panel-title"
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md h-full bg-surface/95 vibrancy border-l border-hairline p-6 sm:p-8 flex flex-col overflow-y-auto shadow-2xl transition-transform animate-in slide-in-from-right duration-300 font-mono"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-hairline mb-6">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-action stroke-[1.5]" />
            <h2 id="trace-panel-title" className="text-sm font-semibold text-text uppercase tracking-wider">
              Execution Trace
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close trace panel"
            className="p-2 text-text-2 hover:text-text rounded-full hover:bg-surface-2 transition-colors focus-visible:outline-action"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Live Trace Logs */}
        <div
          aria-live="polite"
          className="flex-1 space-y-3 bg-surface-2/40 rounded-row p-4 border border-hairline overflow-y-auto text-xs"
        >
          {traces.length === 0 ? (
            <div className="text-text-2/60 flex items-center gap-2 py-4">
              <Terminal className="w-4 h-4" />
              <span>Awaiting agent execution...</span>
            </div>
          ) : (
            traces.map((trace, i) => (
              <div key={i} className="flex items-start gap-2.5 leading-relaxed text-text">
                <span className="text-[10px] text-text-2/70 flex-shrink-0 pt-0.5">
                  +{i === 0 ? "0ms" : `${trace.timestamp - traces[0].timestamp}ms`}
                </span>
                <span className="text-action/80 flex-shrink-0">›</span>
                <span className="break-words">{trace.message}</span>
              </div>
            ))
          )}

          {isStreaming && (
            <div className="flex items-center gap-2 text-action text-xs pt-2 animate-pulse">
              <Clock className="w-3.5 h-3.5" />
              <span>Resolving through Sanity Context endpoints...</span>
            </div>
          )}
        </div>

        {/* Trace Explanation */}
        <div className="pt-6 mt-6 border-t border-hairline text-[11px] text-text-2/80 space-y-1.5 font-sans">
          <p className="font-semibold text-text">How Precedent resolves rulings:</p>
          <p>
            1. Knowledge Base (Endpoint A) surfaces historical consensus and conflicts.
          </p>
          <p>
            2. GROQ Dataset (Endpoint B) extracts verified claims with supersession links.
          </p>
          <p>
            3. Server verifies claim IDs and applies deterministic case-law resolution.
          </p>
        </div>
      </div>
    </div>
  );
}
