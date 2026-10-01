"use client";

import { useEffect, useRef } from "react";
import { X, ExternalLink, ShieldCheck, BookOpen } from "lucide-react";
import type { HydratedSource, KnowledgeBaseRef } from "@/lib/agent/verdict";

interface SourcesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  sources: HydratedSource[];
  kbRefs?: KnowledgeBaseRef[];
}

export function SourcesSheet({
  isOpen,
  onClose,
  sources,
  kbRefs = [],
}: SourcesSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  // Close on Escape key press
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
      aria-labelledby="sources-sheet-title"
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md h-full bg-surface/95 vibrancy border-l border-hairline p-6 sm:p-8 flex flex-col overflow-y-auto shadow-2xl transition-transform animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-hairline mb-6">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-action stroke-[1.5]" />
            <h2 id="sources-sheet-title" className="text-base font-semibold text-text">
              Primary Sources ({sources.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sources sheet"
            className="p-2 text-text-2 hover:text-text rounded-full hover:bg-surface-2 transition-colors focus-visible:outline-action"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Source Items */}
        <div className="flex-1 space-y-4">
          {sources.map((src, i) => (
            <div
              key={src._id || i}
              className="p-4 rounded-row bg-surface-2/60 border border-hairline flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-sm font-medium text-text leading-snug">
                  {src.title}
                </h4>
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-action hover:underline p-1 flex-shrink-0"
                  aria-label={`Open primary source: ${src.title}`}
                >
                  <ExternalLink className="w-4 h-4 stroke-[1.5]" />
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-text-2">
                {src.publisher && <span>{src.publisher}</span>}
                {src.publishedAt && (
                  <>
                    <span>·</span>
                    <span>{new Date(src.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                  </>
                )}
                {src.license && (
                  <>
                    <span>·</span>
                    <span className="font-mono text-[11px] text-text-2/80">{src.license}</span>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Knowledge Base Refs */}
          {kbRefs.length > 0 && (
            <div className="mt-6 pt-4 border-t border-hairline">
              <h3 className="text-xs font-mono uppercase tracking-wider text-text-2 mb-3">
                Knowledge Base Consultations
              </h3>
              <div className="space-y-2">
                {kbRefs.map((ref, idx) => (
                  <a
                    key={idx}
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-input bg-surface-2/40 border border-hairline text-xs text-text hover:border-action/40 transition-colors"
                  >
                    <span className="truncate mr-2">{ref.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-action flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Disclaimer */}
        <div className="pt-6 mt-6 border-t border-hairline text-[11px] text-text-2/70 text-center">
          <p>Verified against published primary sources. Not an audit.</p>
        </div>
      </div>
    </div>
  );
}
