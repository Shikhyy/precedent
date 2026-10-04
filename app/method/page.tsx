import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata = {
  title: "Methodology — Precedent",
  description: "How Precedent computes Solidity security rulings like legal case law using version scoping and supersession graphs.",
};

export default function MethodPage() {
  return (
    <div className="min-h-screen bg-bg text-text selection:bg-action/20">
      {/* Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-hairline bg-bg/80 vibrancy">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-text-2 hover:text-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4 stroke-[1.5]" />
            <span>Back to Docket</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/benchmark" className="text-sm text-text-2 hover:text-text transition-colors">
              Benchmark
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="mb-12">
          <span className="text-xs font-mono uppercase tracking-wider text-action font-medium">
            System Methodology
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl tracking-tight mt-2 mb-4 leading-tight">
            How Precedent computes rulings
          </h1>
          <p className="text-base sm:text-lg text-text-2 leading-relaxed">
            Standard AI search engines summarize the most frequent advice found online. When Solidity evolves, this results in dangerous, outdated security recommendations. Precedent treats security guidance like a legal docket.
          </p>
        </div>

        <div className="space-y-12 text-sm sm:text-base leading-relaxed text-text-2">
          {/* Section 1 */}
          <section className="space-y-4 border-t border-hairline pt-8">
            <h2 className="font-serif text-2xl text-text">1. Version keys & scope boundary</h2>
            <p>
              Every claim carries an optional <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-surface-2 text-text">fromVersion</code> and <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-surface-2 text-text">toVersion</code> integer key. Versions are encoded as <code className="font-mono text-xs">major * 1,000,000 + minor * 1,000 + patch</code> (e.g., <code className="font-mono text-xs">0.8.28 → 8028</code>).
            </p>
            <p>
              When a user queries a compiler version, Sanity GROQ filters out claims whose version bounds do not contain the target version.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4 border-t border-hairline pt-8">
            <h2 className="font-serif text-2xl text-text">2. Deterministic supersession algorithm</h2>
            <p>
              Rather than trusting an LLM to guess which source is newer, supersession is explicitly modeled in Sanity:
            </p>
            <pre className="p-4 rounded-row bg-surface border border-hairline font-mono text-xs text-text overflow-x-auto">
{`const inScope = new Set(claims.map(c => c._id));
const overruled = claims.filter(c => c.supersededBy.some(id => inScope.has(id)));
const controlling = claims.filter(c => !c.supersededBy.some(id => inScope.has(id)));
const stances = new Set(controlling.map(c => c.stance));

const status = controlling.length === 0 
  ? "out_of_scope" 
  : stances.size > 1 
  ? "contested" 
  : "settled";`}
            </pre>
            <ul className="list-disc list-inside space-y-2 pt-2">
              <li><strong className="text-text">Controlling claims:</strong> in-scope claims that no other in-scope claim supersedes.</li>
              <li><strong className="text-text">Settled:</strong> all controlling claims agree on the security stance (safe, deprecated, or unsafe).</li>
              <li><strong className="text-text">Contested:</strong> primary authorities genuinely conflict. Precedent presents both sides and refuses to pick an arbitrary winner.</li>
            </ul>
          </section>

          {/* Section 3 */}
          <section className="space-y-4 border-t border-hairline pt-8">
            <h2 className="font-serif text-2xl text-text">3. Two Sanity Context MCP endpoints</h2>
            <p>
              Precedent combines two specialized Sanity Context endpoints:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-row bg-surface border border-hairline">
                <h3 className="font-medium text-text mb-1">Endpoint A (Knowledge Base)</h3>
                <p className="text-xs text-text-2">
                  Semantic index over raw source documents (EIPs, Solidity docs, release announcements) to surface citations and detect initial conflicts.
                </p>
              </div>
              <div className="p-4 rounded-row bg-surface border border-hairline">
                <h3 className="font-medium text-text mb-1">Endpoint B (GROQ Mode)</h3>
                <p className="text-xs text-text-2">
                  Direct graph querying over verified claims, supersession pointers, and version ranges stored in the Sanity dataset.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4 border-t border-hairline pt-8">
            <h2 className="font-serif text-2xl text-text">4. Strict anti-hallucination boundary</h2>
            <p>
              The runtime agent produces <strong className="text-text">only document IDs</strong> in its output. The Next.js API re-validates that every cited ID exists in Sanity before hydrating claim statements from the database. The agent is never permitted to invent citations.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
