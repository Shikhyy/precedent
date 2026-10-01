"use client";

import { AlertCircle, RotateCcw, ArrowRight } from "lucide-react";

interface ErrorCardProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorCard({
  message = "Couldn't reach the docket. Check your connection and try again.",
  onRetry,
}: ErrorCardProps) {
  return (
    <div className="w-full bg-surface border border-unsafe/30 rounded-card p-6 sm:p-8 flex flex-col items-center text-center shadow-highlight">
      <div className="w-12 h-12 rounded-full bg-unsafe/15 text-unsafe flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 stroke-[1.5]" />
      </div>
      <h3 className="text-lg font-medium text-text mb-2">Ruling Unavailable</h3>
      <p className="text-sm text-text-2 max-w-md mb-6">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-2 hover:bg-surface-2/80 text-text text-sm font-medium border border-hairline transition-colors focus-visible:outline-action"
        >
          <RotateCcw className="w-4 h-4 stroke-[1.5]" />
          <span>Retry request</span>
        </button>
      )}
    </div>
  );
}

interface OutOfScopeCardProps {
  onSelectPattern?: (patternName: string) => void;
}

const COVERED_PATTERNS = [
  { name: "ETH Transfers: transfer() vs call", example: "Is transfer() safe on 0.8.28?" },
  { name: "Contract Destruction: selfdestruct", example: "How did EIP-6780 change selfdestruct?" },
  { name: "Integer Arithmetic: SafeMath", example: "Do I need SafeMath on Solidity 0.8.0?" },
  { name: "ERC-4626 Vault Inflation Attack", example: "Is ERC-4626 safe against inflation attacks?" },
  { name: "Authorization: tx.origin", example: "Can I use tx.origin for owner authentication?" },
];

export function OutOfScopeCard({ onSelectPattern }: OutOfScopeCardProps) {
  return (
    <div className="w-full bg-surface border border-hairline rounded-card p-6 sm:p-8 flex flex-col shadow-highlight">
      <h3 className="text-xl font-serif text-text mb-2">
        Precedent doesn't cover that yet.
      </h3>
      <p className="text-sm text-text-2 mb-6 max-w-xl">
        Precedent currently models 5 deep case-law patterns with verified primary source citations and version supersession. Try asking about one of the covered patterns below:
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {COVERED_PATTERNS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => onSelectPattern?.(p.example)}
            className="flex flex-col items-start p-3.5 rounded-row bg-surface-2/60 border border-hairline hover:border-action/50 text-left transition-colors group"
          >
            <span className="text-xs font-medium text-text group-hover:text-action flex items-center justify-between w-full">
              <span>{p.name}</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </span>
            <span className="text-[11px] text-text-2/80 mt-1">{p.example}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
