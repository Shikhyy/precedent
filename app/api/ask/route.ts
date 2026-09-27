import { NextRequest } from "next/server";
import { z } from "zod";
import { createPrecedentAgent } from "@/lib/agent/agent";
import { Verdict, resolveClaimsStatus } from "@/lib/agent/verdict";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { sanityClient } from "@/lib/sanity/client";
import { HYDRATE_CLAIMS_QUERY } from "@/lib/sanity/queries";

export const maxDuration = 30; // 30 seconds max duration

const RequestSchema = z.object({
  question: z.string().min(1).max(1000).optional(),
  version: z.string().max(20).optional(),
  evm: z.string().max(30).optional(),
  messages: z.array(z.object({
    role: z.string(),
    content: z.string(),
  })).optional(),
});

/**
 * Re-validates the agent's Verdict against Sanity primary records.
 * Enforces that every cited ID exists and the status matches the deterministic resolution algorithm.
 */
async function revalidateVerdict(verdict: Verdict): Promise<{ isValid: boolean; sanitizedVerdict: Verdict; error?: string }> {
  // If out of scope with no claims, it is trivially valid
  if (verdict.status === "out_of_scope" && verdict.controllingClaimIds.length === 0) {
    return { isValid: true, sanitizedVerdict: verdict };
  }

  const allClaimIds = [...verdict.controllingClaimIds, ...verdict.overruledClaimIds];
  if (allClaimIds.length === 0) {
    return { isValid: true, sanitizedVerdict: verdict };
  }

  try {
    const claims = await sanityClient.fetch(HYDRATE_CLAIMS_QUERY, { claimIds: allClaimIds });
    const fetchedIds = new Set((claims || []).map((c: { _id: string }) => c._id));

    // Verify all cited claim IDs actually exist in Sanity
    const missingIds = allClaimIds.filter((id) => !fetchedIds.has(id));
    if (missingIds.length > 0) {
      console.warn("Agent cited non-existent claim IDs:", missingIds);
      // Strip invalid IDs to prevent hallucinated references
      const validControlling = verdict.controllingClaimIds.filter((id) => fetchedIds.has(id));
      const validOverruled = verdict.overruledClaimIds.filter((id) => fetchedIds.has(id));
      return {
        isValid: false,
        sanitizedVerdict: {
          ...verdict,
          controllingClaimIds: validControlling,
          overruledClaimIds: validOverruled,
          caveats: [...verdict.caveats, "Certain cited references could not be verified against primary sources."],
        },
        error: `Unverified claim references: ${missingIds.join(", ")}`,
      };
    }

    // Recompute deterministic status from the fetched claims
    const { status: computedStatus, controllingIds } = resolveClaimsStatus(claims);
    if (computedStatus !== verdict.status) {
      console.warn(`Status mismatch: agent gave ${verdict.status}, computed ${computedStatus}`);
      return {
        isValid: false,
        sanitizedVerdict: {
          ...verdict,
          status: computedStatus,
          controllingClaimIds: controllingIds,
          caveats: [...verdict.caveats, `Status corrected to ${computedStatus} based on strict supersession check.`],
        },
      };
    }

    return { isValid: true, sanitizedVerdict: verdict };
  } catch (err) {
    console.error("Server-side revalidation error:", err);
    return { isValid: true, sanitizedVerdict: verdict };
  }
}

export async function POST(req: NextRequest) {
  // 1. Per-IP rate limiting
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip, { limit: 20, windowMs: 60 * 1000 });
  if (!rateLimit.allowed) {
    return new Response(
      JSON.stringify({ error: "Rate limit exceeded. Please wait a moment before asking again." }),
      {
        status: 429,
        headers: { "Content-Type": "application/json", "Retry-After": "60" },
      }
    );
  }

  // 2. Body parsing and validation
  let jsonBody: unknown;
  try {
    jsonBody = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
  }

  const parseResult = RequestSchema.safeParse(jsonBody);
  if (!parseResult.success) {
    return new Response(JSON.stringify({ error: "Invalid request payload", details: parseResult.error.format() }), {
      status: 400,
    });
  }

  const { question, version, evm, messages } = parseResult.data;
  const promptText = question || (messages && messages.length > 0 ? messages[messages.length - 1].content : "");

  if (!promptText) {
    return new Response(JSON.stringify({ error: "Question cannot be empty" }), { status: 400 });
  }

  const queryContext = [
    `Question: ${promptText}`,
    version ? `Compiler Version: ${version}` : `Compiler Version: (assume latest available in dataset)`,
    evm ? `EVM Fork: ${evm}` : `EVM Fork: (default)`,
  ].join("\n");

  // 3. Create agent and SSE stream
  const encoder = new TextEncoder();
  const stream = new TransformStream();
  const writer = stream.writable.getWriter();

  const sendEvent = async (event: string, data: unknown) => {
    try {
      await writer.write(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
    } catch {
      // client may have disconnected
    }
  };

  (async () => {
    let agentInstance: Awaited<ReturnType<typeof createPrecedentAgent>> | null = null;
    try {
      await sendEvent("trace", {
        step: "init",
        message: "Initializing legal docket query...",
        timestamp: Date.now(),
      });

      agentInstance = await createPrecedentAgent();

      await sendEvent("trace", {
        step: "connecting",
        message: agentInstance.isMcpConfigured
          ? "Connected to Sanity Context MCP endpoints (Knowledge Base + GROQ)..."
          : "Consulting verified primary claims dataset...",
        timestamp: Date.now(),
      });

      const result = await agentInstance.agent.generate({
        prompt: queryContext,
      });

      await sendEvent("trace", {
        step: "resolving",
        message: "Applying supersession rules and version scope...",
        timestamp: Date.now(),
      });

      // Extract generated structured output
      const rawVerdict = (result as unknown as { output?: unknown }).output as Verdict | undefined;

      if (!rawVerdict) {
        throw new Error("The legal agent did not produce a structured verdict.");
      }

      // Re-validate against Sanity
      const { sanitizedVerdict } = await revalidateVerdict(rawVerdict);

      await sendEvent("trace", {
        step: "complete",
        message: "Ruling resolved.",
        timestamp: Date.now(),
      });

      await sendEvent("verdict", sanitizedVerdict);
    } catch (err) {
      console.error("Error in /api/ask execution:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred while resolving the ruling.";
      await sendEvent("error", { message: errorMessage });
    } finally {
      if (agentInstance) {
        await agentInstance.close().catch(() => {});
      }
      try {
        await writer.close();
      } catch {}
    }
  })();

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
