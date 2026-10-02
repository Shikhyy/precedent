"use client";

import { useState } from "react";
import Link from "next/link";
import { Scale, ArrowRight, ShieldCheck, History, GitCompare, ExternalLink, Sparkles } from "lucide-react";
import { Composer } from "@/components/Composer";
import { VerdictCard } from "@/components/VerdictCard";
import { DocketTimeline } from "@/components/DocketTimeline";
import { SourcesSheet } from "@/components/SourcesSheet";
import { TracePanel, type TraceEvent } from "@/components/TracePanel";
import { ErrorCard, OutOfScopeCard } from "@/components/StatusCards";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Verdict, HydratedClaim, HydratedSource } from "@/lib/agent/verdict";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [claims, setClaims] = useState<HydratedClaim[]>([]);
  const [traces, setTraces] = useState<TraceEvent[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Sheets state
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const [isTraceOpen, setIsTraceOpen] = useState(false);

  const handleSearch = async (question: string, version: string, evm?: string) => {
    setIsLoading(true);
    setError(null);
    setVerdict(null);
    setClaims([]);
    setTraces([]);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, version, evm }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response stream from server");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          const matchEvent = line.match(/^event:\s*(.+)$/m);
          const matchData = line.match(/^data:\s*(.+)$/m);

          const eventType = matchEvent ? matchEvent[1].trim() : "message";
          const dataStr = matchData ? matchData[1].trim() : "";

          if (eventType === "trace" && dataStr) {
            try {
              const traceObj = JSON.parse(dataStr);
              setTraces((prev) => [...prev, traceObj]);
            } catch {}
          } else if (eventType === "verdict" && dataStr) {
            try {
              const verdictObj: Verdict = JSON.parse(dataStr);
              setVerdict(verdictObj);

              // Hydrate claims text & sources by ID
              const allClaimIds = [
                ...verdictObj.controllingClaimIds,
                ...verdictObj.overruledClaimIds,
              ];
              if (allClaimIds.length > 0) {
                fetch("/api/hydrate", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ claimIds: allClaimIds }),
                })
                  .then((res) => res.json())
                  .then((data) => {
                    if (data.claims && Array.isArray(data.claims)) {
                      setClaims(data.claims);
                    }
                  })
                  .catch((err) => console.warn("Hydration failed:", err));
              }
            } catch (e) {
              console.error("Failed to parse verdict JSON:", e);
            }
          } else if (eventType === "error" && dataStr) {
            try {
              const errObj = JSON.parse(dataStr);
              setError(errObj.message || "An error occurred");
            } catch {
              setError("An error occurred during query execution");
            }
          }
        }
      }
    } catch (err) {
      console.error("Query failed:", err);
      setError(err instanceof Error ? err.message : "Failed to query Precedent");
    } finally {
      setIsLoading(false);
    }
  };

  // Extract unique sources for the SourcesSheet
  const uniqueSources: HydratedSource[] = Array.from(
    new Map(
      claims
        .map((c) => c.source)
        .filter(Boolean)
        .map((s) => [s._id || s.title, s])
    ).values()
  );

  return (
    <div className="flex flex-col min-h-screen bg-bg text-text selection:bg-action/20">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-hairline bg-bg/80 vibrancy">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-surface border border-hairline flex items-center justify-center text-action">
              <Scale className="w-4 h-4 stroke-[2]" />
            </div>
            <span className="font-semibold text-base tracking-tight text-text">Precedent</span>
            <span className="hidden sm:inline text-xs font-mono px-2 py-0.5 rounded-full border border-hairline bg-surface-2 text-text-2">
              DEV × Sanity
            </span>
          </div>

          <nav className="flex items-center gap-4 sm:gap-6 text-sm">
            <Link
              href="/benchmark"
              className="text-text-2 hover:text-text transition-colors focus-visible:outline-action"
            >
              Benchmark
            </Link>
            <Link
              href="/method"
              className="text-text-2 hover:text-text transition-colors focus-visible:outline-action"
            >
              Method
            </Link>
            <a
              href="https://github.com/Shikhyy/precedent"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1 text-text-2 hover:text-text transition-colors"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 sm:pb-16 flex flex-col items-center text-center">
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-[-0.02em] leading-[1.12] mb-6 max-w-3xl">
            Security advice goes stale. Precedent keeps the docket.
          </h1>
          <p className="text-text-2 text-base sm:text-lg max-w-xl mb-10 leading-relaxed">
            Every Solidity security claim has a date and compiler version. Newer rulings supersede older ones so you never follow guidance that was true in 2019 and dangerous today.
          </p>

          {/* Interactive Live Composer */}
          <Composer onSearch={handleSearch} isLoading={isLoading} />
        </section>

        {/* Results Workspace: Verdict Card & Docket Timeline */}
        {(isLoading || verdict || error) && (
          <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 pb-20">
            {error ? (
              <ErrorCard message={error} onRetry={() => setError(null)} />
            ) : isLoading ? (
              <div className="w-full bg-surface border border-hairline rounded-card p-8 animate-pulse flex flex-col gap-4">
                <div className="h-4 w-32 bg-surface-2 rounded-full" />
                <div className="h-8 w-3/4 bg-surface-2 rounded-lg" />
                <div className="h-4 w-1/2 bg-surface-2 rounded" />
                <div className="pt-4 border-t border-hairline flex items-center justify-between">
                  <span className="text-xs font-mono text-text-2">
                    Querying Sanity Context MCP endpoints...
                  </span>
                  <span className="text-xs text-action animate-bounce">Consulting Case Law</span>
                </div>
              </div>
            ) : verdict?.status === "out_of_scope" ? (
              <OutOfScopeCard
                onSelectPattern={(prompt) => {
                  handleSearch(prompt, "0.8.28");
                }}
              />
            ) : verdict ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Sticky Verdict Card (lg: 5 cols) */}
                <div className="lg:col-span-5 lg:sticky lg:top-24">
                  <VerdictCard
                    verdict={verdict}
                    onOpenSources={() => setIsSourcesOpen(true)}
                    onOpenTrace={() => setIsTraceOpen(true)}
                    sourceCount={uniqueSources.length}
                  />
                </div>

                {/* Right Column: Docket Timeline (lg: 7 cols) */}
                <div className="lg:col-span-7">
                  <DocketTimeline
                    claims={claims}
                    controllingClaimIds={verdict.controllingClaimIds}
                    overruledClaimIds={verdict.overruledClaimIds}
                    isResolved={!isLoading}
                  />
                </div>
              </div>
            ) : null}
          </section>
        )}

        {/* How It Works Section */}
        <section className="w-full border-t border-hairline bg-surface/30 py-20 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-16">
              <span className="text-xs font-mono uppercase tracking-wider text-action font-medium">
                Case-Law Architecture
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl tracking-tight mt-2 mb-4">
                How Precedent resolves conflicting advice
              </h2>
              <p className="text-sm sm:text-base text-text-2">
                Traditional search returns the most popular result. Precedent computes the controlling authority based on language evolution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-card bg-surface border border-hairline shadow-highlight flex flex-col">
                <div className="w-10 h-10 rounded-full bg-action/10 text-action flex items-center justify-center mb-4">
                  <History className="w-5 h-5 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-semibold mb-2">1. Truth has a date</h3>
                <p className="text-sm text-text-2 leading-relaxed">
                  Solidity advice changes as opcodes are repriced and compilers introduce checked math. Every claim is strictly bound to its publication date and compiler version range.
                </p>
              </div>

              <div className="p-6 rounded-card bg-surface border border-hairline shadow-highlight flex flex-col">
                <div className="w-10 h-10 rounded-full bg-deprecated/10 text-deprecated flex items-center justify-center mb-4">
                  <GitCompare className="w-5 h-5 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-semibold mb-2">2. Explicit supersession</h3>
                <p className="text-sm text-text-2 leading-relaxed">
                  Claims cite what they supersede. An EIP-1884 analysis supersedes 2016 best practices; native checked math supersedes SafeMath. Older claims stay visible on the docket, struck through.
                </p>
              </div>

              <div className="p-6 rounded-card bg-surface border border-hairline shadow-highlight flex flex-col">
                <div className="w-10 h-10 rounded-full bg-settled/10 text-settled flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-semibold mb-2">3. Sanity Context MCP</h3>
                <p className="text-sm text-text-2 leading-relaxed">
                  The runtime agent queries two live Sanity Context endpoints: Knowledge Base mode for conflict discovery and GROQ mode for deterministic claim supersession graphs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Benchmark Teaser Section */}
        <section className="w-full py-20 px-4 sm:px-6 border-t border-hairline">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8 p-8 rounded-card bg-surface border border-hairline shadow-highlight">
            <div className="max-w-xl text-left">
              <span className="text-xs font-mono uppercase tracking-wider text-action font-medium">
                The Stale-Trap Benchmark
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl tracking-tight mt-1 mb-2">
                Measuring outdated advice elimination
              </h3>
              <p className="text-sm text-text-2 leading-relaxed">
                We evaluated keyword search (System A), Knowledge Base-only (System B), and Precedent (System C) on 12 verified Stale-Trap questions. Precedent eliminated stale advice by computing controlling authority.
              </p>
            </div>
            <Link
              href="/benchmark"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-action text-white font-medium text-sm hover:brightness-110 transition-all flex-shrink-0"
            >
              <span>View Benchmark</span>
              <ArrowRight className="w-4 h-4 stroke-[2]" />
            </Link>
          </div>
        </section>
      </main>

      {/* Slide-over Sheets */}
      <SourcesSheet
        isOpen={isSourcesOpen}
        onClose={() => setIsSourcesOpen(false)}
        sources={uniqueSources}
        kbRefs={verdict?.knowledgeBaseRefs || []}
      />

      <TracePanel
        isOpen={isTraceOpen}
        onClose={() => setIsTraceOpen(false)}
        traces={traces}
        isStreaming={isLoading}
      />

      {/* Footer */}
      <footer className="w-full border-t border-hairline py-8 px-4 sm:px-6 text-xs text-text-2 bg-bg">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            Precedent · Built for the DEV × Sanity Challenge (Path 1: Agent on Sanity Context)
          </p>
          <div className="flex items-center gap-6">
            <Link href="/method" className="hover:text-text transition-colors">
              Methodology
            </Link>
            <Link href="/benchmark" className="hover:text-text transition-colors">
              Stale-Trap Benchmark
            </Link>
            <a
              href="https://github.com/Shikhyy/precedent"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text transition-colors"
            >
              MIT License
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
