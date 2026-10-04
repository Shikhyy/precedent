"use client";

import { useState } from "react";
import { BookOpen, Activity, Share2, Check, AlertCircle, Shield } from "lucide-react";
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

  return (
    <article
      aria-labelledby="verdict-heading"
      className="relative flex flex-col w-full bg-surface border border-hairline rounded-card shadow-[0_24px_48px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] p-6 sm:p-8 overflow-hidden transition-all duration-300"
    >
      {/* Top subtle architectural rim highlight */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

      {/* Contested State Banner */}
      {isContested && (
        <div className="mb-6 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 px-6 sm:px-8 py-3.5 bg-contested/15 border-b border-contested/30 text-contested text-xs sm:text-sm font-medium flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Contested Ruling: Primary authorities conflict across EVM forks. Both stances presented.</span>
        </div>
      )}

      {/* Header Chips & Metadata */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <StanceBadge stance={verdict.stance} size="md" />

          {/* Version badge */}
          <span className="font-mono text-xs px-3 py-1 rounded-full border border-hairline bg-surface-2/80 text-text-2">
            solc {verdict.version.solc || "latest"}
            {verdict.version.assumedLatest && " (latest)"}
            {verdict.version.evm && ` · ${verdict.version.evm}`}
          </span>
        </div>

        {/* Pattern Tag */}
        {verdict.pattern.name && (
          <span className="text-xs font-mono uppercase tracking-wider text-text-2/80 px-2.5 py-1 rounded bg-surface-2/40 border border-hairline/60 truncate max-w-[200px]">
            {verdict.pattern.name}
          </span>
        )}
      </div>

      {/* The Hero Sentence (Newsreader Serif) */}
      <div className="mb-6">
        <span className="text-[11px] font-mono uppercase tracking-widest text-text-2/70 block mb-2">
          Ruling Judgment
        </span>
        <h2
          id="verdict-heading"
          className="font-serif text-2xl sm:text-3xl text-text leading-[1.25] tracking-[-0.02em] max-w-[68ch]"
        >
          &ldquo;{verdict.headline}&rdquo;
        </h2>
      </div>

      {/* Caveats */}
      {verdict.caveats && verdict.caveats.length > 0 && (
        <div className="mb-6 p-3.5 rounded-row bg-surface-2/40 border border-hairline/80">
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-2/70 block mb-1.5">
            Jurisdictional Caveats
          </span>
          <ul className="flex flex-col gap-1.5 text-xs text-text-2 list-disc list-inside">
            {verdict.caveats.map((c, i) => (
              <li key={i} className="leading-relaxed">{c}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Bottom Actions and Mandatory Disclaimer */}
      <div className="mt-auto pt-6 border-t border-hairline flex flex-wrap items-center justify-between gap-4">
        {/* Actions */}
        <div className="flex items-center gap-2">
          {onOpenSources && (
            <button
              type="button"
              onClick={onOpenSources}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-hairline bg-surface-2/60 text-text-2 hover:text-text hover:border-action/40 transition-colors focus-visible:outline-action"
            >
              <BookOpen className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>
                Sources ({sourceCount || verdict.knowledgeBaseRefs.length || verdict.controllingClaimIds.length})
              </span>
            </button>
          )}

          {onOpenTrace && (
            <button
              type="button"
              onClick={onOpenTrace}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-hairline bg-surface-2/60 text-text-2 hover:text-text hover:border-action/40 transition-colors focus-visible:outline-action"
            >
              <Activity className="w-3.5 h-3.5 stroke-[1.75]" />
              <span>Trace Log</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleShare}
            aria-label="Share ruling link"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-hairline bg-surface-2/60 text-text-2 hover:text-text hover:border-action/40 transition-colors focus-visible:outline-action"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-settled stroke-[2]" />
                <span className="text-settled font-medium">Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 stroke-[1.75]" />
                <span>Share</span>
              </>
            )}
          </button>
        </div>

        {/* Hard Rule 4 Disclaimer */}
        <div className="flex items-center gap-1.5 text-[11px] text-text-2/80">
          <Shield className="w-3 h-3 text-text-2/60" />
          <span>Summarizes published sources. Not an audit.</span>
        </div>
      </div>
    </article>
  );
}
