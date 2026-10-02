import { CheckCircle2, AlertTriangle, XCircle, Scale, HelpCircle } from "lucide-react";
import type { Stance } from "@/lib/agent/verdict";

export interface StanceConfig {
  label: string;
  colorVar: string;
  textColor: string;
  bgTint: string;
  borderColor: string;
  icon: typeof CheckCircle2;
}

export type DisplayStance = Stance | "contested";

export const STANCE_CONFIG: Record<DisplayStance, StanceConfig> = {
  safe: {
    label: "Settled Safe",
    colorVar: "var(--settled)",
    textColor: "text-settled",
    bgTint: "bg-settled/14",
    borderColor: "border-settled/30",
    icon: CheckCircle2,
  },
  deprecated: {
    label: "Deprecated",
    colorVar: "var(--deprecated)",
    textColor: "text-deprecated",
    bgTint: "bg-deprecated/14",
    borderColor: "border-deprecated/30",
    icon: AlertTriangle,
  },
  unsafe: {
    label: "Unsafe",
    colorVar: "var(--unsafe)",
    textColor: "text-unsafe",
    bgTint: "bg-unsafe/14",
    borderColor: "border-unsafe/30",
    icon: XCircle,
  },
  contested: {
    label: "Contested",
    colorVar: "var(--contested)",
    textColor: "text-contested",
    bgTint: "bg-contested/14",
    borderColor: "border-contested/30",
    icon: Scale,
  },
  mixed: {
    label: "Mixed Authority",
    colorVar: "var(--contested)",
    textColor: "text-contested",
    bgTint: "bg-contested/14",
    borderColor: "border-contested/30",
    icon: Scale,
  },
  unknown: {
    label: "Uncharted",
    colorVar: "var(--text-2)",
    textColor: "text-text-2",
    bgTint: "bg-surface-2",
    borderColor: "border-hairline",
    icon: HelpCircle,
  },
};

export const SPRING_TRANSITION = {
  type: "spring" as const,
  stiffness: 380,
  damping: 32,
};

export const POPULAR_SOLC_VERSIONS = [
  "0.8.28",
  "0.8.24",
  "0.8.20",
  "0.8.18",
  "0.8.0",
  "0.7.6",
  "0.6.12",
  "0.5.17",
  "0.4.24",
];

export const EVM_FORKS = [
  { label: "Cancun (Latest)", value: "cancun" },
  { label: "Shanghai", value: "shanghai" },
  { label: "Paris (Merge)", value: "paris" },
  { label: "London", value: "london" },
  { label: "Istanbul", value: "istanbul" },
];
