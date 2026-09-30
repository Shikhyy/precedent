"use client";

import { useState } from "react";
import { BookOpen, Activity, Share2, Check, AlertCircle } from "lucide-react";
import { StanceBadge } from "./StanceBadge";
import type { Verdict } from "@/lib/agent/verdict";

interface VerdictCardProps {
  verdict: Verdict;
  onOpenSources?: () => void;
  onOpenTrace?: () => void;
  sourceCount?: number;
}

export function VerdictCard({
  verdict,
  onOpenSources,
  onOpenTrace,
  sourceCount = 0,
}: VerdictCardProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isContested = verdict.status === "contested";
  const isOutOfScope = verdict.status === "out_of_scope";

  return (
    <article
      aria-labelledby="verdict-heading"
      className="relative flex flex-col w-full bg-surface border border-hairline rounded-card shadow-highlight p-6 sm:p-8 overflow-hidden transition-all"
    >
      {/* Contested State Banner */}
      {isContested && (
        <div className="mb-5 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 px-6 sm:px-8 py-3 bg-contested/15 border-b border-contested/25 text-contested text-xs sm:text-sm font-medium flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Sources disagree and no ruling controls. Both positions are shown.</span>
        </div>
      )}

      {/* Header Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <StanceBadge stance={verdict.stance} size="md" />

          {/* Version badge */}
          <span className="font-mono text-xs px-2.5 py-1 rounded-full border border-hairline bg-surface-2 text-text-2">
            solc {verdict.version.solc || "latest"}
            {verdict.version.assumedLatest && " (assumed)"}
            {verdict.version.evm && ` · ${verdict.version.evm}`}
          </span>
        </div>

        {/* Pattern Name */}
        {verdict.pattern.name && (
          <span className="text-xs text-text-2 font-medium truncate max-w-[200px]">
            {verdict.pattern.name}
          </span>
        )}
      </div>

      {/* The Hero Sentence (Newsreader Serif) */}
      <h2
        id="verdict-heading"
        className="font-serif text-2xl sm:text-3xl text-text leading-[1.25] tracking-[-0.02em] mb-4 max-w-[68ch]"
      >
        "{verdict.headline}"
      </h2>

      {/* Caveats */}
      {verdict.caveats && verdict.caveats.length > 0 && (
        <ul className="flex flex-col gap-1.5 mb-6 text-xs text-text-2 list-disc list-inside">
          {verdict.caveats.map((c, i) => (
            <li key={i}>{c}</li>
          ))}
        </ul>
      )}

      {/* Bottom Actions and Mandatory Disclaimer */}
      <div className="mt-auto pt-6 border-t border-hairline flex flex-wrap items-center justify-between gap-4">
        {/* Actions */}
        <div className="flex items-center gap-2">
          {onOpenSources && (
            <button
              type="button"
              onClick={onOpenSources}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-text-2 hover:text-text hover:bg-surface-2 transition-colors focus-visible:outline-action"
            >
              <BookOpen className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Sources ({sourceCount || verdict.knowledgeBaseRefs.length || verdict.controllingClaimIds.length})</span>
            </button>
          )}

          {onOpenTrace && (
            <button
              type="button"
              onClick={onOpenTrace}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-text-2 hover:text-text hover:bg-surface-2 transition-colors focus-visible:outline-action"
            >
              <Activity className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Trace</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleShare}
            aria-label="Share ruling link"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-text-2 hover:text-text hover:bg-surface-2 transition-colors focus-visible:outline-action"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-settled stroke-[2]" />
                <span className="text-settled">Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>

        {/* Hard Rule 4 Disclaimer */}
        <p className="text-[11px] text-text-2/80 tracking-wide">
          Summarizes published sources. Not an audit.
        </p>
      </div>
    </article>
  );
}
