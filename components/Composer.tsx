"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ArrowRight, Loader2, ChevronDown } from "lucide-react";
import { POPULAR_SOLC_VERSIONS, EVM_FORKS } from "@/lib/ui/tokens";

interface PatternItem {
  _id: string;
  name: string;
  slug: string;
  summary?: string;
  aliases?: string[];
}

interface ComposerProps {
  onSearch: (question: string, version: string, evm?: string) => void;
  isLoading?: boolean;
  initialQuestion?: string;
  initialVersion?: string;
}

const TOPIC_COLORS: Record<string, string> = {
  transfer: "bg-deprecated",
  selfdestruct: "bg-contested",
  safemath: "bg-settled",
  erc4626: "bg-unsafe",
  txorigin: "bg-unsafe",
};

export function Composer({
  onSearch,
  isLoading = false,
  initialQuestion = "",
  initialVersion = "0.8.28",
}: ComposerProps) {
  const [question, setQuestion] = useState(initialQuestion);
  const [version, setVersion] = useState(initialVersion);
  const [evm, setEvm] = useState("");
  const [patterns, setPatterns] = useState<PatternItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch patterns from API to power data-driven example chips
  useEffect(() => {
    fetch("/api/patterns")
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((data) => {
        if (data.patterns && Array.isArray(data.patterns)) {
          setPatterns(data.patterns);
        }
      })
      .catch((err) => {
        console.warn("Could not load dynamic patterns for chips:", err);
      });
  }, []);

  // Global '/' and 'Cmd+K' keyboard shortcut to focus the composer input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "/" || ((e.metaKey || e.ctrlKey) && e.key === "k")) &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;
    onSearch(question.trim(), version, evm || undefined);
  };

  const handleChipClick = (pat: PatternItem) => {
    const defaultVer = pat.slug.includes("safemath")
      ? "0.8.0"
      : pat.slug.includes("selfdestruct")
      ? "0.8.20"
      : pat.slug.includes("erc4626")
      ? "0.8.20"
      : "0.8.28";

    const prompt = `Is ${pat.name} considered safe or deprecated on version ${defaultVer}?`;
    setQuestion(prompt);
    setVersion(defaultVer);
    inputRef.current?.focus();
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4">
      {/* Precision Command Composer */}
      <form
        onSubmit={handleSubmit}
        className="group relative flex items-center glass-panel radiant-border rounded-[var(--r-composer)] p-2 transition-colors focus-within:border-text"
      >
        {/* Leading Search Icon */}
        <div className="pl-3.5 pr-2 text-text-2/80 group-focus-within:text-action transition-colors">
          <Search className="w-5 h-5 stroke-[1.75]" />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder='Ask a case-law question, e.g. "Is transfer() safe on 0.8.28?"'
          disabled={isLoading}
          className="flex-1 bg-transparent text-text placeholder:text-text-2/60 text-sm sm:text-base px-4 py-3 text-sm bg-transparent focus:outline-none disabled:opacity-50 tracking-[-0.01em]"
        />

        {/* Keyboard shortcut hint */}
        <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-1 text-[11px] font-mono text-text-2/60 rounded bg-surface-2/80 border border-hairline mr-2 select-none pointer-events-none">
          <span>/</span>
        </kbd>

        {/* Controls Cluster */}
        <div className="flex items-center gap-2 pr-1">
          {/* Version Selector Pill */}
          <div className="relative flex items-center">
            <select
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              disabled={isLoading}
              aria-label="Solidity compiler version"
              className="appearance-none bg-surface-2 hover:bg-surface-2 text-text text-[11px] font-mono pl-3 pr-7 py-2.5 border border-hairline cursor-pointer"
            >
              {POPULAR_SOLC_VERSIONS.map((v) => (
                <option key={v} value={v}>
                  solc {v}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-text-2 pointer-events-none absolute right-2.5" />
          </div>

          {/* EVM Fork Selector Pill */}
          <div className="relative hidden lg:flex items-center">
            <select
              value={evm}
              onChange={(e) => setEvm(e.target.value)}
              disabled={isLoading}
              aria-label="Target EVM fork"
              className="appearance-none bg-surface-2 hover:bg-surface-2 text-text text-[11px] font-mono pl-3 pr-7 py-2.5 border border-hairline cursor-pointer"
            >
              <option value="">EVM: Default</option>
              {EVM_FORKS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-text-2 pointer-events-none absolute right-2.5" />
          </div>

          {/* Premium Submit Button */}
          <button
            type="submit"
            disabled={!question.trim() || isLoading}
            aria-label="Get ruling"
            className="relative inline-flex items-center justify-center min-w-[44px] h-[40px] px-4 sm:px-5 bg-action text-action-text font-mono text-[11px] uppercase tracking-widest rounded-lg hover:shadow-[0_0_16px_var(--action)] transition-all px-6 disabled:opacity-40 disabled:cursor-not-allowed disabled:"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="hidden sm:inline font-medium">Get ruling</span>
                <ArrowRight className="w-4 h-4 stroke-[2.25]" />
              </div>
            )}
          </button>
        </div>
      </form>

      {/* Crafted Precedent Docket Chips */}
      {patterns.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
          <span className="text-text-2/70 text-[11px] font-mono uppercase tracking-wider mr-1">
            Docket Catalog:
          </span>
          {patterns.slice(0, 5).map((pat) => {
            const topicKey = pat.slug.toLowerCase().replace(/[^a-z]/g, "");
            const dotColor = Object.entries(TOPIC_COLORS).find(([k]) => topicKey.includes(k))?.[1] || "bg-action";

            return (
              <button
                key={pat._id}
                type="button"
                onClick={() => handleChipClick(pat)}
                disabled={isLoading}
                className="group inline-flex items-center gap-2 px-3 py-1.5 border border-hairline bg-surface hover:bg-surface-2 hover:border-text text-text-2 hover:text-text transition-all duration-200 focus-visible:outline-text"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${dotColor} transition-transform group-hover:scale-125`} />
                <span className="font-medium text-[11px] tracking-tight">{pat.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
