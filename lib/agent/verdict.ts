import { z } from "zod";

export const VerdictStatus = z.enum(["settled", "contested", "out_of_scope"]);
export type VerdictStatus = z.infer<typeof VerdictStatus>;

export const Stance = z.enum(["safe", "unsafe", "deprecated", "mixed", "unknown"]);
export type Stance = z.infer<typeof Stance>;

export const KnowledgeBaseRef = z.object({
  title: z.string(),
  url: z.string().url(),
});
export type KnowledgeBaseRef = z.infer<typeof KnowledgeBaseRef>;

export const Verdict = z.object({
  status: VerdictStatus,
  pattern: z.object({
    id: z.string().nullable(),
    name: z.string(),
  }),
  version: z.object({
    solc: z.string().nullable(),
    evm: z.string().nullable(),
    assumedLatest: z.boolean(),
  }),
  stance: Stance,
  headline: z.string().max(160), // one-sentence ruling, grounded only in claim statements
  controllingClaimIds: z.array(z.string()),
  overruledClaimIds: z.array(z.string()),
  knowledgeBaseRefs: z.array(KnowledgeBaseRef),
  caveats: z.array(z.string()).max(3),
});

export type Verdict = z.infer<typeof Verdict>;

/**
 * Hydrated claim structure for UI display and timeline rendering
 */
export interface HydratedSource {
  _id: string;
  title: string;
  url: string;
  publisher?: string;
  kind?: "docs" | "eip" | "audit" | "release-notes" | "blog";
  publishedAt: string;
  license?: string;
}

export interface HydratedClaim {
  _id: string;
  statement: string;
  stance: "safe" | "unsafe" | "deprecated" | "mixed";
  fromVersion?: number;
  toVersion?: number;
  evmFork?: string;
  pattern?: {
    _id: string;
    name: string;
    slug: string;
  };
  source: HydratedSource;
  supersedes?: string[];
  contradicts?: string[];
  supersededBy?: string[];
  isControlling?: boolean;
}

/**
 * Deterministic resolution logic shared between agent post-check,
 * API route re-validation, and eval ground truth.
 */
export function resolveClaimsStatus(claims: Array<{ _id: string; stance: string; supersededBy?: string[] }>): {
  status: "settled" | "contested" | "out_of_scope";
  controllingIds: string[];
  overruledIds: string[];
  stances: string[];
} {
  const inScope = new Set(claims.map((c) => c._id));
  const overruled = claims.filter(
    (c) => c.supersededBy && c.supersededBy.some((id) => inScope.has(id))
  );
  const controlling = claims.filter(
    (c) => !c.supersededBy || !c.supersededBy.some((id) => inScope.has(id))
  );

  const controllingIds = controlling.map((c) => c._id);
  const overruledIds = overruled.map((c) => c._id);
  const stances = Array.from(new Set(controlling.map((c) => c.stance)));

  let status: "settled" | "contested" | "out_of_scope";
  if (controlling.length === 0) {
    status = "out_of_scope";
  } else if (stances.length > 1) {
    status = "contested";
  } else {
    status = "settled";
  }

  return { status, controllingIds, overruledIds, stances };
}
