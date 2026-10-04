"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, GitCompare, ExternalLink, Terminal, Shield } from "lucide-react";
import { Composer } from "@/components/Composer";
import { VerdictCard } from "@/components/VerdictCard";
import { DocketTimeline } from "@/components/DocketTimeline";
import { SourcesSheet } from "@/components/SourcesSheet";
import { TracePanel, type TraceEvent } from "@/components/TracePanel";
import { ErrorCard, OutOfScopeCard } from "@/components/StatusCards";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
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
      {/* Top Ambient Glow Line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-action/40 to-transparent pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-hairline bg-bg/85 vibrancy">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-95 transition-opacity">
            <Logo />
          </Link>

          <nav className="flex items-center gap-4 sm:gap-7 text-xs sm:text-sm font-medium">
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
              Methodology
            </Link>
            <Link
              href="/studio"
              className="hidden md:inline-flex text-text-2 hover:text-text transition-colors"
            >
              Sanity Studio
            </Link>
            <a
              href="https://github.com/Shikhyy/precedent"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 text-text-2 hover:text-text transition-colors"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3 h-3 stroke-[1.75]" />
            </a>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-12 sm:pb-16 flex flex-col items-center text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-hairline bg-surface shadow-sm text-xs text-text-2 mb-6">
            <span className="w-2 h-2 rounded-full bg-settled animate-pulse" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-text font-medium">
              Case-Law Architecture
            </span>
            <span className="text-text-2/40">·</span>
            <span>Sanity Context Agent</span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-normal tracking-[-0.03em] leading-[1.1] mb-6 max-w-3xl">
            Security advice goes stale. Precedent keeps the docket.
          </h1>
          <p className="text-text-2 text-base sm:text-lg max-w-xl mb-10 leading-relaxed font-normal">
            Every Solidity security claim has a date and compiler version. Newer rulings overrule older ones so you never follow guidance that was true in 2019 and dangerous today.
          </p>

          {/* Precision Command Composer */}
          <Composer onSearch={handleSearch} isLoading={isLoading} />
        </section>

        {/* Results Workspace: Verdict Card & Docket Timeline */}
        {(isLoading || verdict || error) && (
          <section className="w-full max-w-5xl mx-auto px-4 sm:px-6 pb-20">
            {error ? (
              <ErrorCard message={error} onRetry={() => setError(null)} />
            ) : isLoading ? (
              <div className="w-full bg-surface border border-hairline rounded-card p-8 sm:p-10 shadow-highlight flex flex-col gap-5">
                <div className="flex items-center justify-between border-b border-hairline/60 pb-4">
                  <div className="h-5 w-36 bg-surface-2 rounded-full animate-pulse" />
                  <div className="h-5 w-24 bg-surface-2 rounded-full animate-pulse" />
                </div>
                <div className="h-10 w-4/5 bg-surface-2 rounded-lg animate-pulse my-2" />
                <div className="h-4 w-3/5 bg-surface-2 rounded animate-pulse" />
                <div className="pt-6 border-t border-hairline flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-text-2">
                    <Terminal className="w-4 h-4 text-action" />
                    <span>Resolving case law via Sanity Context MCP endpoints...</span>
                  </div>
                  <span className="text-xs font-mono text-action animate-pulse">
                    Computing Supersession Graph
                  </span>
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

        {/* Asymmetric Architecture Section (Eliminating AI Slop) */}
        <section className="w-full border-t border-hairline bg-surface/20 py-20 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            {/* Section Header */}
            <div className="max-w-xl mb-12">
              <span className="text-xs font-mono uppercase tracking-widest text-action font-semibold">
                Core Methodology
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl tracking-tight mt-2 mb-3">
                How Precedent resolves conflicting advice
              </h2>
              <p className="text-sm sm:text-base text-text-2 leading-relaxed">
                Traditional keyword search retrieves the most frequently repeated historical text. Precedent computes controlling authority based on language evolution.
              </p>
            </div>

            {/* Asymmetrical Grid: 65% Interactive Demonstration + 35% Technical Architecture */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Major Feature Showcase (7 cols): The Temporal Supersession Graph */}
              <div className="lg:col-span-7 p-7 rounded-card bg-surface border border-hairline shadow-highlight flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-action font-semibold">
                      Live Precedent Case Law Demo
                    </span>
                    <span className="text-[11px] font-mono text-text-2/70">ETH Transfer Docket</span>
                  </div>

                  <h3 className="font-serif text-xl sm:text-2xl text-text mb-3">
                    Explicit Temporal Supersession
                  </h3>
                  <p className="text-sm text-text-2 leading-relaxed mb-6">
                    In 2016, ConsenSys recommended <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-surface-2 text-text">.transfer()</code> because its 2300 gas stipend protected against reentrancy. In 2019, EIP-1884 repriced SLOAD, breaking that assumption. Precedent keeps both on the record, but strikes the old rule:
                  </p>

                  {/* Simulated Docket Transcript Card */}
                  <div className="space-y-3 font-mono text-xs p-4 rounded-row bg-surface-2/40 border border-hairline">
                    <div className="relative p-3 rounded bg-surface/80 border border-hairline text-text-2/60">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-text-2/80">2016 · solc 0.4.x</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-text-2/10 text-text-2/70">Overruled</span>
                      </div>
                      <p className="line-through decoration-text-2 text-text-2/50">
                        Recommend transfer() to forward Ether; 2300 gas limits reentrancy.
                      </p>
                    </div>

                    <div className="p-3 rounded bg-surface border border-action/40 shadow-sm text-text">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-action font-semibold">2019 · solc ≥ 0.6.0 · EIP-1884</span>
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-action/20 text-action font-bold">Controlling</span>
                      </div>
                      <p className="text-text font-sans text-xs leading-relaxed">
                        Avoid transfer(); gas repricing breaks 2300 gas. Use call() with reentrancy protection.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-hairline/60 flex items-center justify-between text-xs text-text-2">
                  <span>Newer primary rulings supersede older ones.</span>
                  <Link href="/method" className="text-action hover:underline inline-flex items-center gap-1 font-medium">
                    <span>Read algorithm</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Technical Capabilities Stack (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                {/* Capability 1: Sanity Context MCP */}
                <div className="p-6 rounded-card bg-surface border border-hairline shadow-highlight flex flex-col justify-between flex-1">
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-action/10 text-action flex items-center justify-center mb-3">
                      <GitCompare className="w-4 h-4 stroke-[2]" />
                    </div>
                    <h4 className="font-semibold text-base mb-1.5">Dual Sanity Context Endpoints</h4>
                    <p className="text-xs sm:text-sm text-text-2 leading-relaxed">
                      Endpoint A connects the Knowledge Base for semantic source exploration; Endpoint B executes structured GROQ queries over the verified supersession graph.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-hairline/60 text-[11px] font-mono text-text-2/70">
                    Discovered at runtime via MCP
                  </div>
                </div>

                {/* Capability 2: Zero-Hallucination Boundary */}
                <div className="p-6 rounded-card bg-surface border border-hairline shadow-highlight flex flex-col justify-between flex-1">
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-settled/10 text-settled flex items-center justify-center mb-3">
                      <ShieldCheck className="w-4 h-4 stroke-[2]" />
                    </div>
                    <h4 className="font-semibold text-base mb-1.5">ID-Only Citation Contract</h4>
                    <p className="text-xs sm:text-sm text-text-2 leading-relaxed">
                      The agent outputs document IDs only. The Next.js API re-validates that every cited ID exists in Sanity before hydrating text. The model cannot hallucinate sources.
                    </p>
                  </div>
                  <div className="pt-4 border-t border-hairline/60 text-[11px] font-mono text-text-2/70">
                    Server-side deterministic validation
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benchmark Teaser Section */}
        <section className="w-full py-20 px-4 sm:px-6 border-t border-hairline">
          <div className="max-w-4xl mx-auto p-8 sm:p-10 rounded-card bg-surface border border-hairline shadow-highlight flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-left">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-action" />
                <span className="text-xs font-mono uppercase tracking-widest text-action font-semibold">
                  The Stale-Trap Benchmark
                </span>
              </div>
              <h3 className="font-serif text-2xl sm:text-3xl tracking-tight mt-1 mb-2">
                Measuring outdated advice elimination
              </h3>
              <p className="text-sm text-text-2 leading-relaxed mb-4">
                We evaluated Keyword Search (30.8% stale), Knowledge Base Only (7.7% stale), and Precedent (0.0% stale) across 13 verified Solidity drift cases.
              </p>
              <div className="flex items-center gap-4 text-xs font-mono text-text-2">
                <span>Stale Rate: <strong className="text-action">0.0%</strong></span>
                <span>·</span>
                <span>Citation Rate: <strong className="text-action">100%</strong></span>
              </div>
            </div>
            <Link
              href="/benchmark"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-action hover:brightness-110 text-white font-medium text-sm shadow-[0_4px_16px_rgba(10,132,255,0.3)] transition-all flex-shrink-0 active:scale-95"
            >
              <span>View Benchmark Results</span>
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

      {/* Production-Grade Legal Footer */}
      <footer className="w-full border-t border-hairline py-12 px-4 sm:px-6 text-xs text-text-2 bg-bg">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-hairline/60">
            <Logo />
            <div className="flex flex-wrap items-center gap-6">
              <Link href="/method" className="hover:text-text transition-colors">
                Methodology
              </Link>
              <Link href="/benchmark" className="hover:text-text transition-colors">
                Stale-Trap Benchmark
              </Link>
              <Link href="/studio" className="hover:text-text transition-colors">
                Sanity Studio
              </Link>
              <a
                href="https://github.com/Shikhyy/precedent"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-text transition-colors"
              >
                GitHub Repository
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-text-2/70">
            <p>
              Precedent · Built for the DEV × Sanity Challenge (Path 1: Agent on Sanity Context)
            </p>
            <p className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-text-2/50" />
              <span>Summarizes published sources. Not an audit. MIT License.</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
