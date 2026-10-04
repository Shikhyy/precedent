const fs = require('fs');

const content = fs.readFileSync('app/page.tsx', 'utf-8');

const newMiddle = `
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
                      controllingIds={verdict.controllingClaimIds}
                      overruledIds={verdict.overruledClaimIds}
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
                      <div className="text-[10px] font-mono text-settled mb-1">solc >= 0.6.0 (EIP-1884)</div>
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
`;

const replacedContent = content.replace(
  /\{\/\* Results Workspace: Verdict Card & Docket Timeline \*\/\}(.|\n)*?\{\/\* Slide-over Sheets \*\/\}/, 
  newMiddle + '\n      {/* Slide-over Sheets */}'
);

fs.writeFileSync('app/page.tsx', replacedContent);
