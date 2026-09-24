import { createClient } from "next-sanity";
import * as fs from "fs";
import * as path from "path";

interface SanityDocStub {
  _id: string;
  _type: string;
  [key: string]: unknown;
}

interface SeedData {
  patterns: Array<SanityDocStub>;
  sources: Array<SanityDocStub>;
  claims: Array<SanityDocStub>;
}

async function seed() {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const token = process.env.SANITY_API_WRITE_TOKEN;

  if (!projectId || !token) {
    console.error("Missing required environment variables for seeding.");
    console.error("Please configure NEXT_PUBLIC_SANITY_PROJECT_ID and SANITY_API_WRITE_TOKEN in .env.local");
    process.exit(1);
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-10-01",
    useCdn: false,
    token,
  });

  const filePath = path.resolve(process.cwd(), "data/claims.json");
  if (!fs.existsSync(filePath)) {
    console.error(`Claims file not found at ${filePath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const data: SeedData = JSON.parse(raw);

  console.log(`Starting idempotent seed to Sanity project: ${projectId} (dataset: ${dataset})...`);

  // 1. Seed patterns
  console.log(`Seeding ${data.patterns.length} patterns...`);
  for (const pat of data.patterns) {
    await client.createOrReplace(pat);
    console.log(`  ✓ Pattern: ${pat._id} (${String(pat.name)})`);
  }

  // 2. Seed sources
  console.log(`Seeding ${data.sources.length} sources...`);
  for (const src of data.sources) {
    await client.createOrReplace(src);
    console.log(`  ✓ Source: ${src._id} (${String(src.title)})`);
  }

  // 3. Seed claims
  console.log(`Seeding ${data.claims.length} claims...`);
  for (const clm of data.claims) {
    await client.createOrReplace(clm);
    console.log(`  ✓ Claim: ${clm._id} [${String(clm.stance)}]`);
  }

  console.log("\nSeeding completed successfully.");
}

seed().catch((err) => {
  console.error("Error during seeding:", err);
  process.exit(1);
});
