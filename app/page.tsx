"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink, Terminal, Shield } from "lucide-react";
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
    <div className="flex flex-col min-h-screen bg-bg border-hairline text-text selection:bg-action/20">
      {/* Top Ambient Glow Line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-action/40 to-transparent pointer-events-none" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-hairline bg-bg border-hairline/85 vibrancy">
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
        
        {/* Impeccable Hero Section */}
        <section className="w-full border-b border-hairline bg-surface">
          <div className="max-w-[1440px] mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 border-l border-r border-hairline min-h-[60vh]">
              
              {/* Left Column: Typography & Input */}
              <div className="lg:col-span-8 p-8 sm:p-12 lg:p-20 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-hairline">
                <div className="inline-flex items-center gap-3 mb-8">
                  <span className="w-2 h-2 bg-text"></span>
                  <span className="font-mono text-[11px] uppercase tracking-widest text-text">
                    Context-Aware Case Law
                  </span>
                </div>
                
                <h1 className="font-serif text-5xl sm:text-7xl lg:text-[5.5rem] font-normal tracking-tight leading-[1.05] mb-8 text-text">
                  Security advice goes stale. <br className="hidden sm:block" />
                  <span className="text-text-3">Precedent keeps the docket.</span>
                </h1>
                
                <p className="text-text-2 text-base sm:text-lg max-w-2xl mb-12 leading-relaxed font-sans">
                  Every Solidity security claim has a date and compiler version. Newer rulings overrule older ones so you never follow guidance that was true in 2019 and dangerous today.
                </p>
                
                <div className="max-w-2xl w-full">
                  <Composer onSearch={handleSearch} isLoading={isLoading} />
                </div>
              </div>

              {/* Right Column: Metadata & Structural Info */}
              <div className="lg:col-span-4 bg-bg flex flex-col">
                <div className="flex-1 p-8 sm:p-12 border-b border-hairline flex flex-col justify-center">
                  <h3 className="font-mono text-xs uppercase tracking-widest text-text-2 mb-6">
                    System Architecture
                  </h3>
                  <ul className="space-y-6 font-mono text-sm text-text">
                    <li className="flex flex-col gap-1">
                      <span className="text-text-3 text-[10px]">01 // ENGINE</span>
                      <span>Sanity Context MCP</span>
                    </li>
                    <li className="flex flex-col gap-1">
                      <span className="text-text-3 text-[10px]">02 // DATASET</span>
                      <span>Verified Claim Graph</span>
                    </li>
                    <li className="flex flex-col gap-1">
                      <span className="text-text-3 text-[10px]">03 // AGENT</span>
                      <span>Vercel AI SDK 6 Loop</span>
                    </li>
                    <li className="flex flex-col gap-1">
                      <span className="text-text-3 text-[10px]">04 // GUARANTEE</span>
                      <span>Zero Hallucination</span>
                    </li>
                  </ul>
                </div>
                <div className="p-8 sm:p-12 flex items-center justify-between font-mono text-[10px] text-text-3 uppercase tracking-widest">
                  <span>Status: Active</span>
                  <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-none bg-settled animate-pulse"></span>
                    Online
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>

        
        {/* Results Workspace: Verdict Card & Docket Timeline */}
        {(isLoading || verdict || error) && (
          <section className="w-full border-b border-hairline bg-bg">
            <div className="max-w-[1440px] mx-auto border-l border-r border-hairline min-h-[40vh] p-8 sm:p-12 lg:p-20">
              <div className="max-w-4xl mx-auto">
                {error ? (
                  <ErrorCard message={error} onRetry={() => setError(null)} />
                ) : isLoading ? (
                  <div className="w-full bg-surface border border-hairline p-8 flex flex-col gap-5">
                    <div className="flex items-center justify-between border-b border-hairline pb-4">
                      <div className="h-5 w-36 bg-surface-2 animate-pulse" />
                      <div className="h-5 w-24 bg-surface-2 animate-pulse" />
                    </div>
                    <div className="h-10 w-4/5 bg-surface-2 animate-pulse my-2" />
                    <div className="h-4 w-3/5 bg-surface-2 animate-pulse" />
                    <div className="pt-6 border-t border-hairline flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-2 text-xs font-mono text-text-2">
                        <Terminal className="w-4 h-4 text-text" />
                        <span>Resolving case law via Sanity Context MCP endpoints...</span>
                      </div>
                      <span className="text-xs font-mono text-text animate-pulse">
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
                  <div className="flex flex-col gap-16">
                    <VerdictCard
                      verdict={verdict}
                      onOpenSources={() => setIsSourcesOpen(true)}
                      onOpenTrace={() => setIsTraceOpen(true)}
                      sourceCount={uniqueSources.length}
                    />
                    <DocketTimeline
                      claims={claims}
                      controllingClaimIds={verdict.controllingClaimIds}
                      overruledClaimIds={verdict.overruledClaimIds}
                      isResolved={true}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        )}

        {/* Technical Architecture Showcase */}
        {!isLoading && !verdict && !error && (
          <section className="w-full border-b border-hairline bg-bg">
            <div className="max-w-[1440px] mx-auto border-l border-r border-hairline">
              <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-hairline">
                
                <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 bg-surface">
                  <div className="mb-8">
                    <h3 className="font-serif text-3xl mb-4 text-text tracking-tight">The Supersession Graph</h3>
                    <p className="text-sm text-text-2 leading-relaxed max-w-md">
                      When users search for a pattern, Precedent queries the Sanity Knowledge Base and structured dataset simultaneously via MCP to build an accurate timeline of advice.
                    </p>
                  </div>

                  <div className="border border-hairline bg-surface-2 p-6 flex flex-col gap-6 relative">
                    {/* Visual Supersession Representation */}
                    <div className="absolute left-6 top-6 bottom-6 w-px bg-hairline" />
                    
                    <div className="relative pl-6">
                      <div className="absolute left-[-2px] top-1.5 w-1 h-1 bg-text-3" />
                      <div className="text-[10px] font-mono text-text-3 mb-1">solc 0.4.x</div>
                      <div className="text-xs text-text-2 line-through decoration-text-3">Recommend transfer() for gas limits</div>
                    </div>
                    
                    <div className="relative pl-6">
                      <div className="absolute left-[-2px] top-1.5 w-1 h-1 bg-settled" />
                      <div className="text-[10px] font-mono text-settled mb-1">solc &gt;= 0.6.0 (EIP-1884)</div>
                      <div className="text-xs text-text">Use call() with reentrancy guard</div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-3xl mb-4 text-text tracking-tight">Zero-Hallucination Pipeline</h3>
                    <p className="text-sm text-text-2 leading-relaxed max-w-md mb-8">
                      The AI agent operates under strict constraints, returning only verified Sanity document IDs.
                    </p>
                    
                    <div className="flex flex-col gap-4 font-mono text-[11px] uppercase tracking-wider text-text-2">
                      <div className="flex items-center gap-3">
                        <span className="w-4 border-t border-text-3" />
                        <span>1. Extract Query Intent</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-4 border-t border-text-3" />
                        <span>2. Query Endpoint A (Raw Sources)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-4 border-t border-text-3" />
                        <span>3. Query Endpoint B (Verified Claims)</span>
                      </div>
                      <div className="flex items-center gap-3 text-text">
                        <span className="w-4 border-t border-text" />
                        <span>4. Deterministic Verdict (IDs Only)</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-12 pt-6 border-t border-hairline flex items-center justify-between text-xs text-text-2">
                    <span>Server-side verification</span>
                    <Link href="/method" className="text-text hover:underline flex items-center gap-1">
                      Read Methodology <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          </section>
        )}

        {/* Benchmark Teaser Section */}
        <section className="w-full bg-surface border-b border-hairline">
          <div className="max-w-[1440px] mx-auto border-l border-r border-hairline p-8 sm:p-12 lg:p-20 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-2xl text-left">
              <h3 className="font-serif text-3xl sm:text-4xl tracking-tight mb-4 text-text">
                The Stale-Trap Benchmark
              </h3>
              <p className="text-base text-text-2 leading-relaxed mb-6">
                Keyword searches return stale advice 30.8% of the time. Precedent achieved a 0.0% stale rate across 13 verified Solidity drift cases by explicitly walking the supersession graph.
              </p>
              <div className="flex flex-wrap items-center gap-6 font-mono text-[11px] uppercase tracking-widest text-text-3">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-settled"></span>
                  Stale Rate: <strong className="text-text">0.0%</strong>
                </span>
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-text"></span>
                  Citation Rate: <strong className="text-text">100%</strong>
                </span>
              </div>
            </div>
            
            <Link
              href="/benchmark"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-text text-bg font-mono text-xs uppercase tracking-widest hover:invert transition-all flex-shrink-0"
            >
              <span>View Benchmark</span>
              <ArrowRight className="w-4 h-4" />
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
      <footer className="w-full border-t border-hairline py-12 px-4 sm:px-6 text-xs text-text-2 bg-bg border-hairline">
        <div className="max-w-6xl mx-auto flex flex-col gap-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-hairline">
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
