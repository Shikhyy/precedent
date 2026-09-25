import { createMCPClient } from "@ai-sdk/mcp";
import { tool, type ToolSet } from "ai";
import { z } from "zod";
import { sanityClient } from "@/lib/sanity/client";
import { versionKey } from "@/lib/sanity/version";
import { IN_SCOPE_CLAIMS_QUERY, PATTERN_LOOKUP_QUERY } from "@/lib/sanity/queries";

export interface ContextMCPClients {
  tools: ToolSet;
  close: () => Promise<void>;
  isConfigured: boolean;
}

/**
 * Connects to Sanity Context MCP endpoints:
 * - Endpoint A (Knowledge Base mode): surfaces published sources and conflicts
 * - Endpoint B (GROQ mode): executes structured dataset queries
 *
 * Tools are discovered at runtime via mcpClient.tools() rather than hardcoded.
 */
export async function getContextMCPTools(): Promise<ContextMCPClients> {
  const kbUrl = process.env.CONTEXT_KB_MCP_URL;
  const groqUrl = process.env.CONTEXT_GROQ_MCP_URL;
  const token = process.env.CONTEXT_MCP_TOKEN;

  const closers: Array<() => Promise<void>> = [];

  // If MCP URLs are provided, connect via @ai-sdk/mcp
  if (kbUrl && groqUrl) {
    try {
      const authHeaders: Record<string, string> | undefined = token
        ? { Authorization: `Bearer ${token}` }
        : undefined;

      const kbClient = await createMCPClient({
        transport: {
          type: "http",
          url: kbUrl,
          headers: authHeaders,
        },
      });
      closers.push(() => kbClient.close());

      const groqClient = await createMCPClient({
        transport: {
          type: "http",
          url: groqUrl,
          headers: authHeaders,
        },
      });
      closers.push(() => groqClient.close());

      // Discover tool names at runtime from both endpoints
      const kbTools = (await kbClient.tools()) as ToolSet;
      const groqTools = (await groqClient.tools()) as ToolSet;

      return {
        tools: {
          ...kbTools,
          ...groqTools,
        },
        close: async () => {
          await Promise.all(closers.map((fn) => fn().catch(() => {})));
        },
        isConfigured: true,
      };
    } catch (err) {
      console.warn("Failed to connect to Sanity Context MCP endpoints, using native GROQ client tools:", err);
    }
  }

  // Native Sanity tools fallback (when MCP endpoints are pending provisioning)
  // Queries the exact same Sanity dataset schema without mocking or hardcoding.
  const queryPattern = tool({
    description: "Search for a Solidity pattern by name, keyword, or alias in the Sanity dataset",
    inputSchema: z.object({
      query: z.string().describe("The pattern keyword, function name, or concept (e.g. transfer, selfdestruct, SafeMath)"),
    }),
    execute: async ({ query }: { query: string }) => {
      try {
        const patterns = await sanityClient.fetch(PATTERN_LOOKUP_QUERY, { q: query });
        return { patterns };
      } catch (err) {
        return { error: `Failed to query pattern: ${err instanceof Error ? err.message : String(err)}` };
      }
    },
  });

  const queryInScopeClaims = tool({
    description: "Fetch verified case-law claims for a pattern ID and compiler version, including supersession links",
    inputSchema: z.object({
      patternId: z.string().describe("Sanity document ID of the pattern"),
      compilerVersion: z.string().describe("Solidity compiler version (e.g. '0.8.28' or '0.4.24')"),
    }),
    execute: async ({ patternId, compilerVersion }: { patternId: string; compilerVersion: string }) => {
      try {
        const v = versionKey(compilerVersion);
        const claims = await sanityClient.fetch(IN_SCOPE_CLAIMS_QUERY, { patternId, v });
        return { claims, compilerVersion, versionKey: v };
      } catch (err) {
        return { error: `Failed to fetch in-scope claims: ${err instanceof Error ? err.message : String(err)}` };
      }
    },
  });

  const fallbackTools: ToolSet = {
    queryPattern,
    queryInScopeClaims,
  };

  return {
    tools: fallbackTools,
    close: async () => {},
    isConfigured: false,
  };
}
