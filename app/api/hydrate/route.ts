import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sanityClient } from "@/lib/sanity/client";
import { HYDRATE_CLAIMS_QUERY } from "@/lib/sanity/queries";
import * as fs from "fs";
import * as path from "path";

const HydrateSchema = z.object({
  claimIds: z.array(z.string()),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = HydrateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid claimIds array" }, { status: 400 });
    }

    const { claimIds } = parsed.data;
    if (claimIds.length === 0) {
      return NextResponse.json({ claims: [] });
    }

    // 1. Fetch from live Sanity dataset
    try {
      const claims = await sanityClient.fetch(HYDRATE_CLAIMS_QUERY, { claimIds });
      if (claims && claims.length > 0) {
        return NextResponse.json({ claims }, {
          headers: {
            "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
          },
        });
      }
    } catch (err) {
      console.warn("Sanity fetch failed during hydrate, checking local verified claims file:", err);
    }

    // 2. Fallback to local verified claims template if Sanity is not yet seeded
    const filePath = path.resolve(process.cwd(), "data/claims.json");
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const seedData = JSON.parse(raw);
      const sourcesMap = new Map((seedData.sources || []).map((s: { _id: string }) => [s._id, s]));
      const patternMap = new Map((seedData.patterns || []).map((p: { _id: string }) => [p._id, p]));

      const targetIdSet = new Set(claimIds);
      const matchedClaims = (seedData.claims || [])
        .filter((c: { _id: string }) => targetIdSet.has(c._id))
        .map((c: any) => {
          const srcId = c.source?._ref;
          const patId = c.pattern?._ref;
          const supersededBy = (seedData.claims || [])
            .filter((other: any) => other.supersedes?.some((ref: any) => ref._ref === c._id))
            .map((other: any) => other._id);

          return {
            _id: c._id,
            statement: c.statement,
            stance: c.stance,
            fromVersion: c.fromVersion,
            toVersion: c.toVersion,
            evmFork: c.evmFork,
            pattern: patId ? patternMap.get(patId) : undefined,
            source: srcId ? sourcesMap.get(srcId) : { title: "Primary Source", url: "#", publishedAt: "2024-01-01" },
            supersedes: (c.supersedes || []).map((ref: any) => ref._ref),
            contradicts: (c.contradicts || []).map((ref: any) => ref._ref),
            supersededBy,
          };
        });

      return NextResponse.json({ claims: matchedClaims });
    }

    return NextResponse.json({ claims: [] });
  } catch (err) {
    console.error("Error in /api/hydrate:", err);
    return NextResponse.json({ error: "Failed to hydrate claims" }, { status: 500 });
  }
}
