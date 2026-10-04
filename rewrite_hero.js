const fs = require('fs');

const content = fs.readFileSync('app/page.tsx', 'utf-8');

const newHero = `
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
`;

const replacedContent = content.replace(
  /\{\/\* Hero Section \*\/\}(.|\n)*?\{\/\* Results Workspace: Verdict Card & Docket Timeline \*\/\}/, 
  newHero + '\n        {/* Results Workspace: Verdict Card & Docket Timeline */}'
);

fs.writeFileSync('app/page.tsx', replacedContent);
