"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ArrowRight, Loader2 } from "lucide-react";
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

  // Global '/' keyboard shortcut to focus the composer input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
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
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-3">
      {/* Composer Bar with Vibrancy */}
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center bg-surface/85 vibrancy border border-hairline rounded-composer shadow-highlight p-1.5 transition-all focus-within:border-action/60"
      >
        <div className="pl-3.5 pr-2 text-text-2">
          <Search className="w-5 h-5 stroke-[1.5]" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder='Ask about a pattern, for example "Is transfer() safe on 0.8.28?"'
          disabled={isLoading}
          className="flex-1 bg-transparent text-text placeholder:text-text-2 text-base px-2 py-3 focus:outline-none disabled:opacity-50"
        />

        {/* Compiler Version Select */}
        <div className="flex items-center gap-1.5 pr-1.5">
          <select
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            disabled={isLoading}
            aria-label="Solidity compiler version"
            className="bg-surface-2 text-text text-xs font-mono px-2.5 py-2 rounded-input border border-hairline focus:outline-none focus-visible:ring-1 focus-visible:ring-action cursor-pointer disabled:opacity-50"
          >
            {POPULAR_SOLC_VERSIONS.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>

          {/* EVM Fork Select */}
          <select
            value={evm}
            onChange={(e) => setEvm(e.target.value)}
            disabled={isLoading}
            aria-label="Target EVM fork"
            className="hidden sm:inline-block bg-surface-2 text-text text-xs px-2 py-2 rounded-input border border-hairline focus:outline-none focus-visible:ring-1 focus-visible:ring-action cursor-pointer disabled:opacity-50"
          >
            <option value="">EVM: Default</option>
            {EVM_FORKS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!question.trim() || isLoading}
            aria-label="Get ruling"
            className="inline-flex items-center justify-center min-w-[44px] h-[40px] px-4 rounded-full bg-action text-white font-medium text-sm transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span className="hidden sm:inline mr-1.5">Get ruling</span>
                <ArrowRight className="w-4 h-4 stroke-[2]" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Data-Driven Example Chips */}
      {patterns.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs text-text-2">
          <span className="text-text-2/70 mr-0.5">Explore:</span>
          {patterns.slice(0, 4).map((pat) => (
            <button
              key={pat._id}
              type="button"
              onClick={() => handleChipClick(pat)}
              disabled={isLoading}
              className="px-3 py-1 rounded-full border border-hairline bg-surface hover:bg-surface-2 hover:text-text text-text-2 transition-colors focus-visible:outline-action"
            >
              {pat.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
