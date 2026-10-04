"use client";

import { motion } from "motion/react";
import { ExternalLink, History, ShieldAlert, Award } from "lucide-react";
import { StanceBadge } from "./StanceBadge";
import { STANCE_CONFIG } from "@/lib/ui/tokens";
import { parseVersionKey } from "@/lib/sanity/version";
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
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-hairline rounded-card bg-surface/40 text-text-2">
        <History className="w-8 h-8 stroke-[1.25] mb-3 opacity-50" />
        <p className="text-sm font-medium text-text">No Historical Claims Found</p>
        <p className="text-xs text-text-2/70 max-w-sm mt-1 leading-relaxed">
          No case-law precedent documents match this specific pattern and version scope.
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
      {/* Docket Header */}
      <div className="flex items-center justify-between mb-6 pb-2 border-b border-hairline/60 px-1">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-action" />
          <h3 className="text-xs font-mono uppercase tracking-widest text-text font-semibold">
            Docket Proceedings ({claims.length} Records)
          </h3>
        </div>
        <span className="text-[11px] font-mono text-text-2/70">
          Chronological Evolution
        </span>
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
              initial={{ opacity: 0, y: 10 }}
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
                className={`absolute -left-[31px] sm:-left-[39px] top-2 w-3.5 h-3.5 rounded-full border-2 border-surface transition-all ${
                  isControlling
                    ? "ring-4 ring-action/25 bg-action"
                    : isOverruled
                    ? "bg-text-2/40"
                    : "bg-surface-2"
                }`}
                style={
                  isControlling
                    ? {
                        backgroundColor: stanceConfig.colorVar,
                        boxShadow: `0 0 12px ${stanceConfig.colorVar}`,
                      }
                    : undefined
                }
                aria-hidden="true"
              />

              {/* Claim Card Row */}
              <div
                className={`relative rounded-row p-5 border transition-all duration-300 ${
                  isControlling
                    ? "bg-surface border-action/50 shadow-[0_8px_24px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.08)] ring-1 ring-action/20"
                    : "bg-surface/60 border-hairline hover:border-hairline/80 hover:bg-surface/80"
                }`}
              >
                {/* Overruled Strike Line (The Signature Animated Moment) */}
                {isOverruled && isResolved && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.42, ease: [0.2, 0.9, 0.25, 1], delay: 0.1 }}
                    className="absolute left-0 right-0 top-1/2 h-[1.5px] bg-text-2/80 origin-left pointer-events-none z-10"
                    aria-hidden="true"
                  />
                )}

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-medium text-text-2">{dateStr}</span>
                    <StanceBadge stance={claim.stance} size="sm" />
                    {isControlling && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-action/15 text-action border border-action/30 font-semibold">
                        <Award className="w-3 h-3" />
                        <span>Controlling Precedent</span>
                      </span>
                    )}
                    {isOverruled && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-text-2/15 text-text-2 border border-hairline">
                        <ShieldAlert className="w-3 h-3" />
                        <span>Overruled</span>
                      </span>
                    )}
                  </div>

                  {/* Version Scope */}
                  {(claim.fromVersion != null || claim.toVersion != null) && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-2/60 border border-hairline/50 text-text-2/80">
                      {claim.fromVersion != null ? `solc ≥ ${parseVersionKey(claim.fromVersion)}` : ""}
                      {claim.fromVersion != null && claim.toVersion != null ? " · " : ""}
                      {claim.toVersion != null ? `solc ≤ ${parseVersionKey(claim.toVersion)}` : ""}
                    </span>
                  )}
                </div>

                {/* Claim Statement */}
                <p className="text-sm text-text leading-relaxed mb-4">
                  {claim.statement}
                </p>

                {/* Source Attribution */}
                {claim.source && (
                  <div className="flex items-center justify-between text-xs text-text-2 pt-3 border-t border-hairline/60">
                    <div className="flex items-center gap-2 truncate max-w-[280px]">
                      {claim.source.kind && (
                        <span className="font-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface-2 text-text-2/70 border border-hairline/40">
                          {claim.source.kind}
                        </span>
                      )}
                      <span className="truncate">
                        {claim.source.publisher ? `${claim.source.publisher} — ` : ""}
                        {claim.source.title}
                      </span>
                    </div>

                    <a
                      href={claim.source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-action hover:underline ml-2 flex-shrink-0 font-medium"
                    >
                      <span>Primary Record</span>
                      <ExternalLink className="w-3 h-3 stroke-[1.75]" />
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
