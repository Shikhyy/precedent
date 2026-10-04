# Precedent

> **Smart-contract security advice, with a docket.**  
> An autonomous agent that treats Solidity security guidance like case law: every claim carries a date and compiler version scope, and newer rulings supersede older ones. Built for the **DEV × Sanity Challenge (Path 1: Agent on Sanity Context)**.

---

## The Problem

Solidity security guidance is fraught with contradictions across time. Best practices that were recommended in 2016 (such as relying on `.transfer()` for its 2300 gas stipend to mitigate reentrancy) became anti-patterns after EVM opcode repricing (EIP-1884). Libraries like `SafeMath`, once indispensable, became redundant and wasteful with Solidity 0.8.0 native checked arithmetic.

Standard keyword search and general-purpose LLMs lack temporal and version awareness. They retrieve the most repeated historical advice, frequently answering with dangerous, obsolete patterns.

**Precedent solves this by keeping the docket:**
1. **Truth has a date:** Every claim is scoped to a publication date and compiler version range (`fromVersion` to `toVersion`).
2. **Explicit supersession:** Newer rulings explicitly supersede older claims. Overruled claims remain visible on the docket, struck through, showing what overruled them.
3. **Contested handling:** When primary authorities disagree, Precedent refuses to invent consensus and presents both sides.
4. **ID-only agent boundary:** The agent produces verified document IDs only; the application hydrates text and citations directly from Sanity.

---

## Architecture

```mermaid
flowchart TD
    User([Solidity Developer]) -->|Query + solc version| WebUI[Next.js 15 Web Application]
    WebUI -->|POST /api/ask SSE Stream| RouteHandler[Route Handler /api/ask]
    
    subgraph AgentRuntime [Agent Runtime - Vercel AI SDK 6]
        RouteHandler -->|Execute| Agent[ToolLoopAgent]
        Agent -->|Endpoint A: Knowledge Base| KBClient[Sanity Context MCP Client A]
        Agent -->|Endpoint B: GROQ Mode| GROQClient[Sanity Context MCP Client B]
    end

    subgraph SanityContext [Sanity Context Infrastructure]
        KBClient -->|Semantic Search & Conflict Detection| SanityKB[(Knowledge Base)]
        GROQClient -->|In-Scope Claims & Supersession Graph| SanityDataset[(Sanity Production Dataset)]
    end

    RouteHandler -->|Server-Side Re-validation| SanityVerify[(Sanity Read Client)]
    RouteHandler -->|Streamed Verdict IDs & Trace| WebUI
    WebUI -->|POST /api/hydrate| HydrateAPI[/api/hydrate]
    HydrateAPI -->|Fetch Claim Texts & Sources| SanityDataset
    HydrateAPI -->|Hydrated Verdict & Docket| WebUI
```

---

## Tech Stack

| Layer | Choice |
|---|---|
| **Framework** | Next.js 15 (App Router), React 19, TypeScript (strict mode) |
| **Agent & AI** | Vercel AI SDK 6 (`ai`, `@ai-sdk/mcp`, `@ai-sdk/react`), Google Gemini 2.0 / Anthropic Claude |
| **Data & CMS** | Sanity Studio (embedded at `/studio`), Sanity Content Lake, Sanity Context MCP |
| **Styling & Tokens** | Tailwind CSS with CSS variable tokens (dark-first, system light theme) |
| **Motion** | `motion` (Spring-based, respects `prefers-reduced-motion`) |
| **Evaluation** | Deterministic grading harness (`tsx eval/run.ts`) + `minisearch` |

---

## Sanity Context MCP Configuration

Precedent connects to two distinct Sanity Context endpoints:

1. **Endpoint A: Knowledge Base Mode (`CONTEXT_KB_MCP_URL`)**  
   Configured with raw source documents (EIP specifications, Solidity documentation, OpenZeppelin release notes, audit reports). Surfaces semantic context and flags initial conflicts with primary links.
2. **Endpoint B: GROQ Dataset Mode (`CONTEXT_GROQ_MCP_URL`)**  
   Configured with the Sanity dataset. Enables the agent to execute structured GROQ queries to traverse verified claims, version keys, and supersession links.

Tools are discovered dynamically at runtime via `mcpClient.tools()` rather than hardcoded.

---

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Configure the following variables:

```ini
# Sanity Project Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_READ_TOKEN=your_read_token
SANITY_API_WRITE_TOKEN=your_write_token # Local seed script only, never deployed

# Sanity Context MCP Endpoints
CONTEXT_KB_MCP_URL=https://...sanity.io/v1/context/mcp/knowledge-base
CONTEXT_GROQ_MCP_URL=https://...sanity.io/v1/context/mcp/groq
CONTEXT_MCP_TOKEN=your_context_mcp_token

# Model Provider
MODEL_ID=gemini-2.0-flash
GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key
# Or use Anthropic:
# ANTHROPIC_API_KEY=your_anthropic_key
```

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Seed Sanity Dataset
The dataset seed script is idempotent (`createOrReplace`) and uploads 5 verified Solidity patterns, primary sources, and temporal claims:
```bash
npm run seed
```

### 3. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application or [http://localhost:3000/studio](http://localhost:3000/studio) to manage records in Sanity Studio.

---

## Stale-Trap Evaluation & Benchmark

Precedent includes an empirical benchmark evaluating 13 verified questions across three systems:
- **System A (Keyword Search):** BM25 term frequency over raw text (no graph or version bounds).
- **System B (Knowledge Base Only):** Semantic search over raw documents without structured supersession.
- **System C (Precedent):** Knowledge Base + GROQ Supersession Graph.

Run the evaluation runner:
```bash
npm run eval
```

### Measured Results

| System | Stale-Answer Rate (↓) | Controlling Citation Rate (↑) | Status Accuracy (↑) | Median Latency |
|---|---|---|---|---|
| **System A (Keyword)** | 30.8% | 15.4% | 100% | ~120 ms |
| **System B (KB Only)** | 7.7% | 100.0% | 100% | ~840 ms |
| **System C (Precedent)** | **0.0%** | **100.0%** | **100%** | ~1450 ms |

View the interactive results breakdown and grouped comparison bars at `/benchmark`.

---

## Repository Structure

```
precedent/
├── app/
│   ├── api/
│   │   ├── ask/route.ts        # Streaming ToolLoopAgent run with ID revalidation
│   │   ├── hydrate/route.ts    # Hydrates claim text and source citations
│   │   └── patterns/route.ts   # Data-driven pattern listing
│   ├── benchmark/page.tsx      # Stale-Trap benchmark dashboard
│   ├── method/page.tsx         # Legal docket methodology explainer
│   ├── studio/[[...tool]]/     # Embedded Sanity Studio
│   ├── globals.css             # Apple-grade design tokens (dark/light)
│   ├── layout.tsx              # Font configurations and theme script
│   └── page.tsx                # Landing page and live docket composer
├── components/
│   ├── Composer.tsx            # Vibrancy search bar with version picker
│   ├── DocketTimeline.tsx      # Chronological timeline with strike animation
│   ├── SourcesSheet.tsx        # Slide-over primary sources drawer
│   ├── StanceBadge.tsx         # Accessible semantic status pill
│   ├── StatusCards.tsx         # Error and out-of-scope fallback states
│   ├── ThemeToggle.tsx         # Light/dark mode toggle
│   ├── TracePanel.tsx          # Real-time execution trace drawer
│   └── VerdictCard.tsx         # Headline ruling card with disclaimer
├── data/
│   ├── claims.json             # Verified primary-source claims and patterns
│   └── stale-trap.json         # Benchmark questions and ground-truth labels
├── eval/
│   ├── grade.ts                # Deterministic scoring functions
│   ├── results.json            # Benchmark outputs and breakdown
│   └── run.ts                  # Multi-system test harness
├── lib/
│   ├── agent/                  # ToolLoopAgent, prompt, verdict schema, and MCP
│   ├── sanity/                 # Sanity client, version key helper, and GROQ queries
│   ├── ui/                     # Tokens and motion settings
│   └── rate-limit.ts           # In-memory per-IP sliding window rate limiter
├── sanity/
│   └── schemaTypes/            # Pattern, Source, and Claim document schemas
└── scripts/
    └── seed.ts                 # Idempotent database population script
```

---

## Mandatory Legal Disclaimer

> **Summarizes published sources. Not an audit.**  
> Precedent summarizes published primary documentation, EIP specifications, and security advisories. It does not audit smart contract code or provide exploit guidance.

---

## License

MIT License. See [LICENSE](LICENSE) for details.
