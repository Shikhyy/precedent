import { google } from "@ai-sdk/google";
import { anthropic } from "@ai-sdk/anthropic";
import { ToolLoopAgent, stepCountIs, Output, type LanguageModel, type ToolSet } from "ai";
import { PRECEDENT_SYSTEM_PROMPT } from "./prompt";
import { Verdict } from "./verdict";
import { getContextMCPTools } from "./mcp";

export function getLanguageModel(): LanguageModel {
  const modelId = process.env.MODEL_ID || "gemini-2.0-flash";

  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return google(modelId);
  }

  if (process.env.ANTHROPIC_API_KEY) {
    return anthropic(modelId);
  }

  // Default to google provider instance
  return google(modelId);
}

export interface PrecedentAgentInstance {
  agent: ToolLoopAgent<never, ToolSet, ReturnType<typeof Output.object<Verdict>>>;
  close: () => Promise<void>;
  isMcpConfigured: boolean;
}

/**
 * Creates an instance of Precedent ToolLoopAgent connected to runtime MCP tools.
 */
export async function createPrecedentAgent(): Promise<PrecedentAgentInstance> {
  const { tools, close, isConfigured } = await getContextMCPTools();
  const model = getLanguageModel();

  const agent = new ToolLoopAgent({
    model,
    instructions: PRECEDENT_SYSTEM_PROMPT,
    tools,
    stopWhen: stepCountIs(8),
    output: Output.object({ schema: Verdict }),
  });

  return { agent, close, isMcpConfigured: isConfigured };
}
