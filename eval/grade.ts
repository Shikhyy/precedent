import type { Verdict } from "@/lib/agent/verdict";

export interface StaleTrapQuestion {
  id: string;
  question: string;
  version: string;
  evm?: string;
  patternId: string;
  truth: {
    status: "settled" | "contested" | "out_of_scope";
    stance: "safe" | "unsafe" | "deprecated" | "mixed" | "unknown";
    controllingClaimIds: string[];
    staleClaimIds: string[];
  };
  trap: string;
}

export interface QuestionGrade {
  questionId: string;
  system: "A" | "B" | "C";
  isStale: boolean;
  isCitationCorrect: boolean;
  isStatusCorrect: boolean;
  isStanceCorrect: boolean;
  score: number; // 0 to 1
  latencyMs: number;
}

/**
 * Deterministically grades a Verdict against ground truth.
 * Rules per BACKEND_SCHEMA.md section 8:
 * - Stale answer: stance equals stance of a staleClaimIds claim or cited claims overlap staleClaimIds.
 * - Correct citation: cited claim IDs include a controllingClaimIds entry.
 * - Contested handling: status equals contested on contested questions.
 */
export function gradeVerdict(
  question: StaleTrapQuestion,
  verdict: Verdict,
  system: "A" | "B" | "C",
  latencyMs: number
): QuestionGrade {
  const { truth } = question;
  const controllingClaimIds = new Set(verdict.controllingClaimIds);

  // 1. Check for stale answer / citations: controlling claims must not be stale
  const hasStaleControllingClaim = truth.staleClaimIds.some((id) =>
    controllingClaimIds.has(id)
  );
  const isStaleStance =
    truth.staleClaimIds.length > 0 &&
    verdict.stance !== truth.stance &&
    verdict.stance !== "unknown";

  const isStale = hasStaleControllingClaim || isStaleStance;

  // 2. Check controlling citation correctness
  let isCitationCorrect = false;
  if (truth.status === "out_of_scope") {
    isCitationCorrect = verdict.status === "out_of_scope";
  } else {
    isCitationCorrect = truth.controllingClaimIds.some((id) =>
      verdict.controllingClaimIds.includes(id)
    );
  }

  // 3. Check status & stance
  const isStatusCorrect = verdict.status === truth.status;
  const isStanceCorrect = verdict.stance === truth.stance;

  // Calculate composite score (0 to 1)
  let score = 0;
  if (!isStale) score += 0.35;
  if (isCitationCorrect) score += 0.35;
  if (isStatusCorrect) score += 0.15;
  if (isStanceCorrect) score += 0.15;

  return {
    questionId: question.id,
    system,
    isStale,
    isCitationCorrect,
    isStatusCorrect,
    isStanceCorrect,
    score: Number(score.toFixed(2)),
    latencyMs,
  };
}

export interface SystemSummary {
  system: "A" | "B" | "C";
  name: string;
  description: string;
  staleAnswerRate: number; // lower is better (%)
  controllingCitationRate: number; // higher is better (%)
  statusAccuracyRate: number; // (%)
  medianLatencyMs: number;
  totalQuestions: number;
}

export function computeSystemSummary(
  grades: QuestionGrade[],
  system: "A" | "B" | "C",
  name: string,
  description: string
): SystemSummary {
  const systemGrades = grades.filter((g) => g.system === system);
  const total = systemGrades.length || 1;

  const staleCount = systemGrades.filter((g) => g.isStale).length;
  const citationCount = systemGrades.filter((g) => g.isCitationCorrect).length;
  const statusCount = systemGrades.filter((g) => g.isStatusCorrect).length;

  const latencies = systemGrades.map((g) => g.latencyMs).sort((a, b) => a - b);
  const medianLatency = latencies[Math.floor(latencies.length / 2)] || 0;

  return {
    system,
    name,
    description,
    staleAnswerRate: Number(((staleCount / total) * 100).toFixed(1)),
    controllingCitationRate: Number(((citationCount / total) * 100).toFixed(1)),
    statusAccuracyRate: Number(((statusCount / total) * 100).toFixed(1)),
    medianLatencyMs: medianLatency,
    totalQuestions: total,
  };
}
