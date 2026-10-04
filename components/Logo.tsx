export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Precision Geometric Scale Mark */}
      <div className="relative w-8 h-8 glass-panel radiant-border rounded-[10px] flex items-center justify-center flex-shrink-0 group">
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          className="text-text "
        >
          {/* Base & Column */}
          <path d="M12 4.5V18.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <path d="M7.5 19H16.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          {/* Beam with dynamic balance */}
          <path d="M5.5 8.5C8.5 7.75 15.5 7.75 18.5 8.5" stroke="var(--action)" strokeWidth="1.75" strokeLinecap="round" />
          {/* Left Pan (Overruled / Lower) */}
          <path d="M5.5 8.5L3.5 13H7.5L5.5 8.5Z" fill="var(--text-2)" fillOpacity="0.25" stroke="var(--text-2)" strokeWidth="1.25" strokeLinejoin="round" />
          {/* Right Pan (Controlling / Lifted) */}
          <path d="M18.5 8.5L16.5 12H20.5L18.5 8.5Z" fill="var(--settled)" fillOpacity="0.35" stroke="var(--settled)" strokeWidth="1.25" strokeLinejoin="round" />
          {/* Central Jewel */}
          <circle cx="12" cy="8" r="1.25" fill="var(--action)" />
        </svg>
      </div>

      <div className="flex flex-col">
        <span className="font-semibold text-sm sm:text-base tracking-tight text-text leading-none">
          Precedent
        </span>
        <span className="text-[10px] font-mono uppercase tracking-wider text-text-2/70 mt-1 leading-none">
          Solidity Case Law
        </span>
      </div>
    </div>
  );
}
