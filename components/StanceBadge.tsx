import { STANCE_CONFIG } from "@/lib/ui/tokens";
import type { Stance } from "@/lib/agent/verdict";

interface StanceBadgeProps {
  stance: Stance;
  className?: string;
  size?: "sm" | "md";
}

export function StanceBadge({ stance, className = "", size = "md" }: StanceBadgeProps) {
  const config = STANCE_CONFIG[stance] || STANCE_CONFIG.unknown;
  const Icon = config.icon;

  const sizeClasses = size === "sm"
    ? "px-2.5 py-0.5 text-xs gap-1.5"
    : "px-3.5 py-1 text-sm gap-2";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${config.bgTint} ${config.textColor} ${config.borderColor} ${sizeClasses} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 stroke-[1.75]" aria-hidden="true" />
      <span>{config.label}</span>
    </span>
  );
}
