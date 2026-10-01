"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { ExternalLink, CheckCircle2, History, AlertCircle } from "lucide-react";
import { StanceBadge } from "./StanceBadge";
import { STANCE_CONFIG, parseVersionKey } from "@/lib/ui/tokens";
import type { HydratedClaim } from "@/lib/agent/verdict";

interface DocketTimelineProps {
  claims: HydratedClaim[];
  controllingClaimIds: string[];
  overruledClaimIds: string[];
  isResolved?: boolean;
}

export function DocketTimeline({
  claims,
  controllingClaimIds,
  overruledClaimIds,
  isResolved = true,
}: DocketTimelineProps) {
  const controllingSet = new Set(controllingClaimIds);
  const overruledSet = new Set(overruledClaimIds);

  if (claims.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-hairline rounded-card bg-surface/50 text-text-2">
        <History className="w-8 h-8 stroke-[1.25] mb-2 opacity-60" />
        <p className="text-sm font-medium">No claims in scope</p>
        <p className="text-xs text-text-2/70 max-w-sm mt-1">
          No historical case-law rulings match this specific pattern and version scope.
        </p>
      </div>
    );
  }

  // Sort claims chronologically by publishedAt (oldest to newest for docket progression)
  const sortedClaims = [...claims].sort((a, b) => {
    const dateA = a.source?.publishedAt ? new Date(a.source.publishedAt).getTime() : 0;
    const dateB = b.source?.publishedAt ? new Date(b.source.publishedAt).getTime() : 0;
    return dateA - dateB;
  });

  return (
    <section aria-label="Docket Timeline" className="relative w-full">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-xs font-mono uppercase tracking-wider text-text-2">
          Docket Timeline ({claims.length} {claims.length === 1 ? "Ruling" : "Rulings"})
        </h3>
        <span className="text-[11px] text-text-2/60">Chronological sequence</span>
      </div>

      <ol className="relative pl-6 sm:pl-8 border-l border-hairline space-y-6">
        {sortedClaims.map((claim, idx) => {
          const isControlling = controllingSet.has(claim._id);
          const isOverruled = overruledSet.has(claim._id);
          const stanceConfig = STANCE_CONFIG[claim.stance] || STANCE_CONFIG.unknown;

          // Format published date
          const dateStr = claim.source?.publishedAt
            ? new Date(claim.source.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
              })
            : "Historical";

          return (
            <motion.li
              key={claim._id}
              initial={{ opacity: 0, y: 8 }}
              animate={{
                opacity: isOverruled ? 0.45 : 1,
                y: isControlling ? -2 : 0,
              }}
              transition={{
                duration: 0.25,
                delay: idx * 0.04,
              }}
              className="relative group"
            >
              {/* Timeline Node Circle */}
              <div
                className={`absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-surface bg-surface-2 transition-all ${
                  isControlling
                    ? "ring-4 ring-action/20 bg-action"
                    : isOverruled
                    ? "bg-text-2/40"
                    : "bg-text-2"
                }`}
                style={
                  isControlling
                    ? {
                        backgroundColor: stanceConfig.colorVar,
                        boxShadow: `0 0 10px ${stanceConfig.colorVar}`,
                      }
                    : undefined
                }
                aria-hidden="true"
              />

              {/* Claim Card Row */}
              <div
                className={`relative rounded-row p-4 border transition-all ${
                  isControlling
                    ? "bg-surface border-action/40 shadow-highlight"
                    : "bg-surface/60 border-hairline hover:border-hairline/80"
                }`}
              >
                {/* Overruled Strike Line (The Signature Animated Moment) */}
                {isOverruled && isResolved && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.42, ease: [0.2, 0.9, 0.25, 1], delay: 0.1 }}
                    className="absolute left-0 right-0 top-1/2 h-[1.5px] bg-text-2/70 origin-left pointer-events-none z-10"
                    aria-hidden="true"
                  />
                )}

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-text-2">{dateStr}</span>
                    <StanceBadge stance={claim.stance} size="sm" />
                    {isControlling && (
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-action/15 text-action border border-action/30">
                        Controlling
                      </span>
                    )}
                    {isOverruled && (
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-text-2/15 text-text-2 border border-hairline">
                        Overruled
                      </span>
                    )}
                  </div>

                  {/* Version Scope */}
                  {(claim.fromVersion != null || claim.toVersion != null) && (
                    <span className="text-[11px] font-mono text-text-2/80">
                      {claim.fromVersion != null ? `≥ ${parseVersionKey(claim.fromVersion)}` : ""}
                      {claim.fromVersion != null && claim.toVersion != null ? " · " : ""}
                      {claim.toVersion != null ? `≤ ${parseVersionKey(claim.toVersion)}` : ""}
                    </span>
                  )}
                </div>

                {/* Claim Statement */}
                <p className="text-sm text-text leading-relaxed mb-3">
                  {claim.statement}
                </p>

                {/* Source Attribution */}
                {claim.source && (
                  <div className="flex items-center justify-between text-xs text-text-2 pt-2 border-t border-hairline/60">
                    <span className="truncate max-w-[280px]">
                      {claim.source.publisher ? `${claim.source.publisher} — ` : ""}
                      {claim.source.title}
                    </span>
                    <a
                      href={claim.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-action hover:underline ml-2 flex-shrink-0"
                    >
                      <span>Primary source</span>
                      <ExternalLink className="w-3 h-3 stroke-[1.5]" />
                    </a>
                  </div>
                )}
              </div>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
