const fs = require('fs');

let content = fs.readFileSync('app/page.tsx', 'utf-8');

// Replace the entire main section with a new cybernetic design
const newMain = `
      <main className="flex-1 flex flex-col items-center">
        {/* Holographic Hero Section */}
        <section className="w-full relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
          <div className="max-w-[1440px] mx-auto min-h-[65vh] flex flex-col items-center justify-center pt-24 pb-16 px-4 sm:px-6 relative z-10">
            
            {/* Telemetry HUD */}
            <div className="glass-panel radiant-border rounded-full px-4 py-1.5 mb-8 flex items-center gap-4 text-[10px] font-mono text-action uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-settled animate-pulse shadow-[0_0_8px_var(--settled)]"></span>
                EVM Telemetry Active
              </span>
              <span className="w-px h-3 bg-hairline"></span>
              <span className="text-text-2">Hallucination Rate: 0.000%</span>
            </div>
            
            <h1 className="font-sans text-4xl sm:text-6xl lg:text-[5rem] font-bold tracking-tight leading-[1.05] mb-6 text-center max-w-4xl text-transparent bg-clip-text bg-gradient-to-b from-text to-text-2">
              The Deterministic <br className="hidden sm:block" />
              <span className="text-action">EVM Case Law Engine</span>
            </h1>
            
            <p className="text-text-2 text-sm sm:text-base max-w-2xl text-center mb-12 leading-relaxed font-sans">
              Security advice in Ethereum does not iterate—it actively contradicts its past. Precedent replaces probabilistic RAG with a deterministic supersession graph, scoping every vulnerability to explicit compiler pragmas.
            </p>
            
            <div className="w-full max-w-3xl relative">
              <Composer onSearch={handleSearch} isLoading={isLoading} />
              
              {/* Decorative Conduits */}
              <div className="absolute -left-12 top-1/2 w-8 h-px bg-gradient-to-r from-transparent to-hairline hidden lg:block"></div>
              <div className="absolute -right-12 top-1/2 w-8 h-px bg-gradient-to-l from-transparent to-hairline hidden lg:block"></div>
            </div>
          </div>
        </section>

        {/* Results Workspace: Verdict Card & Docket Timeline */}
        {(isLoading || verdict || error) && (
          <section className="w-full glass-panel border-y border-hairline/50 relative z-20">
            <div className="max-w-[1440px] mx-auto min-h-[40vh] p-4 sm:p-8 lg:p-16">
              <div className="max-w-4xl mx-auto">
                {error ? (
                  <ErrorCard message={error} onRetry={() => setError(null)} />
                ) : isLoading ? (
                  <div className="w-full glass-panel radiant-border rounded-xl p-8 flex flex-col gap-6">
                    <div className="flex items-center justify-between border-b border-hairline/50 pb-4">
                      <div className="h-4 w-32 bg-surface-2/50 rounded animate-pulse" />
                      <div className="h-4 w-24 bg-surface-2/50 rounded animate-pulse" />
                    </div>
                    <div className="h-8 w-3/4 bg-surface-2/50 rounded animate-pulse my-2" />
                    <div className="h-3 w-1/2 bg-surface-2/50 rounded animate-pulse" />
                    <div className="pt-6 border-t border-hairline/50 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-widest text-text-2">
                        <Terminal className="w-4 h-4 text-action" />
                        <span>Intercepting semantic telemetry...</span>
                      </div>
                      <span className="text-[11px] font-mono text-action animate-pulse uppercase tracking-widest">
                        Traversing Supersession DAG
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
                  <div className="flex flex-col gap-12">
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
          <section className="w-full relative z-10">
            <div className="max-w-[1440px] mx-auto border-x border-hairline/30">
              <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-hairline/30">
                
                {/* Node 1 */}
                <div className="p-8 sm:p-12 lg:p-16 hover:bg-surface/20 transition-colors">
                  <div className="mb-8">
                    <div className="w-10 h-10 rounded-lg glass-panel flex items-center justify-center mb-6 text-action">
                      <GitCompare className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <h3 className="font-sans text-2xl font-bold mb-4 text-text tracking-tight">The Supersession Graph</h3>
                    <p className="text-sm text-text-2 leading-relaxed max-w-md">
                      Endpoint A connects the Semantic Library for raw audits; Endpoint B executes GROQ database traversal mapped by directional relations: [Claim B] supersedes -&#62; [Claim A].
                    </p>
                  </div>
                </div>

                {/* Node 2 */}
                <div className="p-8 sm:p-12 lg:p-16 hover:bg-surface/20 transition-colors">
                  <div className="mb-8">
                    <div className="w-10 h-10 rounded-lg glass-panel flex items-center justify-center mb-6 text-settled">
                      <ShieldCheck className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <h3 className="font-sans text-2xl font-bold mb-4 text-text tracking-tight">Zero-Hallucination Interceptor</h3>
                    <p className="text-sm text-text-2 leading-relaxed max-w-md">
                      The AI agent is barred from synthesizing prose. It outputs an array of Sanity document IDs. The Next.js edge backend verifies cryptographic hashes and hydrates the text.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </section>
        )}

        {/* Benchmark Teaser Section */}
        <section className="w-full border-t border-hairline/30 relative z-10">
          <div className="max-w-[1440px] mx-auto p-8 sm:p-12 lg:p-20 flex flex-col lg:flex-row items-center justify-between gap-12 bg-surface-2/20">
            <div className="max-w-2xl text-left">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-unsafe/20 text-unsafe border border-unsafe/30">
                  Stale Advice Rate: 30.8%
                </span>
                <span className="text-text-3 font-mono text-[10px] uppercase">vs</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-widest bg-settled/20 text-settled border border-settled/30 shadow-[0_0_12px_var(--settled)]">
                  Stale Advice Rate: 0.0%
                </span>
              </div>
              <h3 className="font-sans text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-text">
                The Stale-Trap Benchmark Suite
              </h3>
              <p className="text-base text-text-2 leading-relaxed mb-6">
                Vector databases return transfer() advice with {">"}0.92 cosine confidence. Precedent’s explicit DAG traversal drops the stale advice rate to absolute zero across 126 EVM drift cases.
              </p>
            </div>
            
            <Link
              href="/benchmark"
              className="glass-panel radiant-border rounded-xl px-8 py-4 inline-flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-action hover:bg-action/10 transition-all flex-shrink-0"
            >
              <span>Run Evaluation Suite</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
`;

const startIndex = content.indexOf('<main className="flex-1 flex flex-col items-center">');
const endIndex = content.indexOf('      {/* Slide-over Sheets */}');

if (startIndex !== -1 && endIndex !== -1) {
  const newContent = content.slice(0, startIndex) + newMain + '\n' + content.slice(endIndex);
  fs.writeFileSync('app/page.tsx', newContent);
} else {
  console.log("Could not find the bounds to replace");
}
