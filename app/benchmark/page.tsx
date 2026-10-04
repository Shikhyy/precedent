import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import resultsData from "@/eval/results.json";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata = {
  title: "Stale-Trap Benchmark — Precedent",
  description: "Empirical benchmark evaluating outdated Solidity security advice across Keyword Search, Knowledge Base, and Precedent.",
};

export default function BenchmarkPage() {
  const { systems, breakdown, sampleSize, evaluatedAt } = resultsData;

  const systemA = systems.find((s) => s.system === "A");
  const systemB = systems.find((s) => s.system === "B");
  const systemC = systems.find((s) => s.system === "C");

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-action/20">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 w-full border-b border-hairline bg-bg/80 vibrancy">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-text-2 hover:text-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4 stroke-[1.5]" />
            <span>Back to Docket</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/method" className="text-sm text-text-2 hover:text-text transition-colors">
              Method
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        {/* Benchmark Header */}
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-mono uppercase tracking-wider text-action font-medium">
            Empirical Evaluation
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl tracking-tight mt-2 mb-4 leading-tight">
            The Stale-Trap Benchmark
          </h1>
          <p className="text-base text-text-2 leading-relaxed">
            Measuring how well AI search engines and case-law agents avoid recommending outdated, dangerous Solidity security patterns when language semantics evolve.
          </p>
        </div>

        {/* Systems Tested Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {systems.map((sys) => {
            const isC = sys.system === "C";
            return (
              <div
                key={sys.system}
                className={`p-5 rounded-card border transition-all ${
                  isC
                    ? "bg-surface border-action/40 shadow-highlight"
                    : "bg-surface/50 border-hairline"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-surface-2 text-text-2">
                    System {sys.system}
                  </span>
                  {isC && (
                    <span className="text-[10px] font-mono uppercase tracking-wider text-action font-medium">
                      Production
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-base text-text mb-1">{sys.name}</h3>
                <p className="text-xs text-text-2 leading-relaxed">{sys.description}</p>
              </div>
            );
          })}
        </div>

        {/* Grouped Metric Comparison Charts */}
        <section className="p-6 sm:p-8 rounded-card bg-surface border border-hairline shadow-highlight mb-16 space-y-8">
          <h2 className="font-serif text-2xl text-text">Benchmark Results</h2>

          {/* Metric 1: Stale Answer Rate (Lower is better) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-text">
                Stale-Answer Rate <span className="text-xs text-text-2 font-normal">(lower is better)</span>
              </span>
              <span className="text-xs font-mono text-text-2">Answers matching an overruled claim</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="w-24 text-xs text-text-2 font-mono">System A</span>
                <div className="flex-1 bg-surface-2 rounded-full h-4 overflow-hidden flex">
                  <div
                    style={{ width: `${systemA?.staleAnswerRate || 0}%` }}
                    className="bg-text-2/40 h-full rounded-full transition-all"
                  />
                </div>
                <span className="w-14 text-right text-xs font-mono text-text-2">
                  {systemA?.staleAnswerRate}%
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-24 text-xs text-text-2 font-mono">System B</span>
                <div className="flex-1 bg-surface-2 rounded-full h-4 overflow-hidden flex">
                  <div
                    style={{ width: `${systemB?.staleAnswerRate || 0}%` }}
                    className="bg-text-2/70 h-full rounded-full transition-all"
                  />
                </div>
                <span className="w-14 text-right text-xs font-mono text-text-2">
                  {systemB?.staleAnswerRate}%
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-24 text-xs text-action font-mono font-medium">System C</span>
                <div className="flex-1 bg-surface-2 rounded-full h-4 overflow-hidden flex">
                  <div
                    style={{ width: `${Math.max(systemC?.staleAnswerRate || 0, 1)}%` }}
                    className="bg-action h-full rounded-full transition-all"
                  />
                </div>
                <span className="w-14 text-right text-xs font-mono text-action font-medium">
                  {systemC?.staleAnswerRate}%
                </span>
              </div>
            </div>
          </div>

          {/* Metric 2: Controlling Citation Rate (Higher is better) */}
          <div className="space-y-3 pt-6 border-t border-hairline">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-text">
                Controlling-Source Citation Rate <span className="text-xs text-text-2 font-normal">(higher is better)</span>
              </span>
              <span className="text-xs font-mono text-text-2">Accurately cites current controlling claim</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="w-24 text-xs text-text-2 font-mono">System A</span>
                <div className="flex-1 bg-surface-2 rounded-full h-4 overflow-hidden flex">
                  <div
                    style={{ width: `${systemA?.controllingCitationRate || 0}%` }}
                    className="bg-text-2/40 h-full rounded-full transition-all"
                  />
                </div>
                <span className="w-14 text-right text-xs font-mono text-text-2">
                  {systemA?.controllingCitationRate}%
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-24 text-xs text-text-2 font-mono">System B</span>
                <div className="flex-1 bg-surface-2 rounded-full h-4 overflow-hidden flex">
                  <div
                    style={{ width: `${systemB?.controllingCitationRate || 0}%` }}
                    className="bg-text-2/70 h-full rounded-full transition-all"
                  />
                </div>
                <span className="w-14 text-right text-xs font-mono text-text-2">
                  {systemB?.controllingCitationRate}%
                </span>
              </div>

              <div className="flex items-center gap-3">
                <span className="w-24 text-xs text-action font-mono font-medium">System C</span>
                <div className="flex-1 bg-surface-2 rounded-full h-4 overflow-hidden flex">
                  <div
                    style={{ width: `${systemC?.controllingCitationRate || 0}%` }}
                    className="bg-action h-full rounded-full transition-all"
                  />
                </div>
                <span className="w-14 text-right text-xs font-mono text-action font-medium">
                  {systemC?.controllingCitationRate}%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Per-Question Outcome Table */}
        <section className="space-y-4 mb-16">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-text">Per-Question Breakdown</h2>
            <span className="text-xs font-mono text-text-2">{sampleSize} Ground-Truth Questions</span>
          </div>

          <div className="border border-hairline rounded-card overflow-x-auto bg-surface">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-2/60 border-b border-hairline font-mono text-text-2">
                <tr>
                  <th className="p-3.5">ID</th>
                  <th className="p-3.5 min-w-[280px]">Question & Scope</th>
                  <th className="p-3.5 min-w-[240px]">The Stale Trap</th>
                  <th className="p-3.5 text-center">Sys A (Keyword)</th>
                  <th className="p-3.5 text-center">Sys B (KB Only)</th>
                  <th className="p-3.5 text-center text-action">Sys C (Precedent)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {breakdown.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-2/30 transition-colors">
                    <td className="p-3.5 font-mono text-text-2 align-top">{row.id}</td>
                    <td className="p-3.5 align-top">
                      <p className="font-medium text-text mb-1">{row.question}</p>
                      <span className="font-mono text-[11px] text-text-2/80">
                        solc {row.version} · Expected: {row.expectedStance}
                      </span>
                    </td>
                    <td className="p-3.5 text-text-2 leading-relaxed align-top">
                      {row.trap}
                    </td>
                    <td className="p-3.5 text-center align-top">
                      {row.outcomes.systemA.isStale ? (
                        <span className="inline-flex items-center gap-1 text-unsafe font-mono text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> Stale
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-settled font-mono text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Pass
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-center align-top">
                      {row.outcomes.systemB.isStale ? (
                        <span className="inline-flex items-center gap-1 text-unsafe font-mono text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> Stale
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-settled font-mono text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Pass
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-center align-top bg-action/5">
                      {row.outcomes.systemC.isStale ? (
                        <span className="inline-flex items-center gap-1 text-unsafe font-mono text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> Stale
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-action font-mono text-[11px] font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Evaluation Limitations Disclaimer */}
        <div className="p-6 rounded-row bg-surface-2/40 border border-hairline text-xs text-text-2 leading-relaxed space-y-2">
          <p className="font-semibold text-text">Notes on benchmark scope:</p>
          <p>
            The sample size is intentionally focused on 13 hand-verified Solidity patterns with known historical semantic drift. Each system was evaluated using deterministic grading criteria against primary sources.
          </p>
          <p className="text-[11px] text-text-2/70">
            Last evaluated: {new Date(evaluatedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </main>
    </div>
  );
}
