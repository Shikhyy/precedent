import { NextResponse } from "next/server";
import { sanityClient } from "@/lib/sanity/client";
import { GET_PATTERNS_QUERY } from "@/lib/sanity/queries";
import * as fs from "fs";
import * as path from "path";

interface RawPatternDoc {
  _id: string;
  name: string;
  slug?: { current: string };
  summary?: string;
  aliases?: string[];
}

export async function GET() {
  try {
    // 1. Try querying Sanity
    try {
      const patterns = await sanityClient.fetch(GET_PATTERNS_QUERY);
      if (patterns && patterns.length > 0) {
        return NextResponse.json({ patterns }, {
          headers: {
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        });
      }
    } catch (err) {
      console.warn("Sanity fetch failed during patterns lookup, falling back to local file:", err);
    }

    // 2. Fallback to local verified claims patterns
    const filePath = path.resolve(process.cwd(), "data/claims.json");
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const seedData = JSON.parse(raw);
      const rawPatterns: RawPatternDoc[] = seedData.patterns || [];
      const patterns = rawPatterns.map((p) => ({
        _id: p._id,
        name: p.name,
        slug: p.slug?.current || p._id,
        summary: p.summary,
        aliases: p.aliases,
      }));
      return NextResponse.json({ patterns });
    }

    return NextResponse.json({ patterns: [] });
  } catch (err) {
    console.error("Error in /api/patterns:", err);
    return NextResponse.json({ error: "Failed to load patterns" }, { status: 500 });
  }
}
