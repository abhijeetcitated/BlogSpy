#!/usr/bin/env node

/**
 * Azure Super Agent MCP Server
 *
 * Directly calls Azure OpenAI deployed models (o3-pro + gpt-5.2)
 * from VS Code Copilot Chat. No Azure Agent Service needed.
 *
 * Tools:
 *  - ask_o3_pro    → Deep reasoning, planning, architecture (o3-pro)
 *  - ask_gpt52     → Fast coding, implementation, research (gpt-5.2)
 *  - ask_super     → Auto-routes: o3-pro thinks → gpt-5.2 implements
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { DefaultAzureCredential } from "@azure/identity";

// ── Config ─────────────────────────────────────────────────────────────────────

const AZURE_ENDPOINT =
  process.env.AZURE_OPENAI_ENDPOINT ??
  "https://aif-ageurob73eu.cognitiveservices.azure.com";

const API_VERSION = process.env.AZURE_OPENAI_API_VERSION ?? "2025-04-01-preview";

const DEPLOYMENTS = {
  "o3-pro": process.env.AZURE_DEPLOYMENT_O3PRO ?? "o3-pro",
  "gpt-5.2": process.env.AZURE_DEPLOYMENT_GPT52 ?? "gpt-5.2",
  "gpt-5.2-codex": process.env.AZURE_DEPLOYMENT_CODEX ?? "gpt-5.2-codex",
} as const;

// ── Azure AD Auth ──────────────────────────────────────────────────────────────

const credential = new DefaultAzureCredential();

async function getToken(): Promise<string> {
  const res = await credential.getToken(
    "https://cognitiveservices.azure.com/.default"
  );
  return res.token;
}

// ── Model API Calls ────────────────────────────────────────────────────────────

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * GPT-5.2 uses Chat Completions API:
 *   POST /openai/deployments/{deployment}/chat/completions
 */
async function callGpt52(
  messages: ChatMessage[],
  temperature = 0.7,
  maxTokens?: number
): Promise<string> {
  const token = await getToken();
  const deployment = DEPLOYMENTS["gpt-5.2"];
  const url = `${AZURE_ENDPOINT}/openai/deployments/${deployment}/chat/completions?api-version=${API_VERSION}`;

  const body: Record<string, unknown> = {
    messages,
    temperature,
  };
  if (maxTokens) body.max_completion_tokens = maxTokens;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Azure OpenAI gpt-5.2 ${res.status}: ${err}`);
  }

  const data = (await res.json()) as {
    choices: Array<{ message: { content: string } }>;
    usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
  };

  const reply = data.choices?.[0]?.message?.content ?? "No response.";
  const usage = data.usage;

  if (usage) {
    console.error(
      `[gpt-5.2] tokens: ${usage.prompt_tokens} in / ${usage.completion_tokens} out / ${usage.total_tokens} total`
    );
  }

  return reply;
}

/**
 * o3-pro uses Responses API:
 *   POST /openai/responses  (with model param, NOT deployment path)
 */
async function callO3Pro(
  input: string | ChatMessage[],
  maxTokens?: number
): Promise<string> {
  const token = await getToken();
  const url = `${AZURE_ENDPOINT}/openai/responses?api-version=${API_VERSION}`;

  // Convert ChatMessage[] to single string if needed
  let inputStr: string;
  if (typeof input === "string") {
    inputStr = input;
  } else {
    inputStr = input
      .map((m) => (m.role === "system" ? `[System] ${m.content}` : m.role === "user" ? m.content : `[Previous] ${m.content}`))
      .join("\n\n");
  }

  const body: Record<string, unknown> = {
    model: DEPLOYMENTS["o3-pro"],
    input: inputStr,
  };
  if (maxTokens) body.max_output_tokens = maxTokens;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Azure OpenAI o3-pro ${res.status}: ${err}`);
  }

  const data = (await res.json()) as {
    output: Array<{
      type: string;
      content?: Array<{ type: string; text: string }>;
    }>;
    usage?: { input_tokens: number; output_tokens: number; total_tokens: number };
  };

  // Extract text from Responses API output
  const reply =
    data.output
      ?.filter((o) => o.type === "message")
      ?.map((o) => o.content?.map((c) => c.text).join(""))
      .join("") ?? "No response.";

  const usage = data.usage;
  if (usage) {
    console.error(
      `[o3-pro] tokens: ${usage.input_tokens} in / ${usage.output_tokens} out / ${usage.total_tokens} total`
    );
  }

  return reply;
}

/**
 * GPT-5.2-Codex uses Responses API (same as o3-pro):
 *   POST /openai/responses  (with model param, NOT deployment path)
 *   Optimized for agentic coding: refactors, migrations, large codebase analysis.
 *   400K context window.
 */
async function callCodex(
  input: string | ChatMessage[],
  maxTokens?: number
): Promise<string> {
  const token = await getToken();
  const url = `${AZURE_ENDPOINT}/openai/responses?api-version=${API_VERSION}`;

  // Convert ChatMessage[] to single string if needed
  let inputStr: string;
  if (typeof input === "string") {
    inputStr = input;
  } else {
    inputStr = input
      .map((m) => (m.role === "system" ? `[System] ${m.content}` : m.role === "user" ? m.content : `[Previous] ${m.content}`))
      .join("\n\n");
  }

  const body: Record<string, unknown> = {
    model: DEPLOYMENTS["gpt-5.2-codex"],
    input: inputStr,
  };
  if (maxTokens) body.max_output_tokens = maxTokens;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Azure OpenAI gpt-5.2-codex ${res.status}: ${err}`);
  }

  const data = (await res.json()) as {
    output: Array<{
      type: string;
      content?: Array<{ type: string; text: string }>;
    }>;
    usage?: { input_tokens: number; output_tokens: number; total_tokens: number };
  };

  // Extract text from Responses API output
  const reply =
    data.output
      ?.filter((o) => o.type === "message")
      ?.map((o) => o.content?.map((c) => c.text).join(""))
      .join("") ?? "No response.";

  const usage = data.usage;
  if (usage) {
    console.error(
      `[gpt-5.2-codex] tokens: ${usage.input_tokens} in / ${usage.output_tokens} out / ${usage.total_tokens} total`
    );
  }

  return reply;
}

// ── Conversation History (per-session, per-model) ──────────────────────────────

const history: Record<string, ChatMessage[]> = {
  "o3-pro": [],
  "gpt-5.2": [],
  "gpt-5.2-codex": [],
  super: [],
};

function addToHistory(
  key: string,
  role: "user" | "assistant",
  content: string
) {
  if (!history[key]) history[key] = [];
  history[key].push({ role, content });
  // Keep last 20 messages to avoid token overflow
  if (history[key].length > 20) {
    history[key] = history[key].slice(-20);
  }
}

// ── MCP Server ─────────────────────────────────────────────────────────────────

const server = new McpServer({
  name: "azure-super-agent",
  version: "2.0.0",
});

// ── Tool: ask_o3_pro ───────────────────────────────────────────────────────────

server.tool(
  "ask_o3_pro",
  "[STEP 3 of 3] Architecture review brain. Call this LAST, after ask_gpt52 and ask_codex. " +
    "For: architecture decisions, risk prioritization, threat modeling, final sign-off. " +
    "Send SUMMARIES and FINDINGS (not raw code). " +
    "NEVER use this for code-level line-by-line audit — use ask_codex for that.",
  {
    message: z.string().describe("Your question or task for o3-pro"),
    system_prompt: z
      .string()
      .optional()
      .describe("Optional system instruction (default: expert developer)"),
    new_conversation: z
      .boolean()
      .optional()
      .default(false)
      .describe("Clear history and start fresh"),
  },
  async ({ message, system_prompt, new_conversation }) => {
    try {
      if (new_conversation) history["o3-pro"] = [];

      const systemMsg: ChatMessage = {
        role: "system",
        content:
          system_prompt ??
          "You are an expert senior developer and architect. Provide thorough, well-reasoned analysis. Think step by step.",
      };

      addToHistory("o3-pro", "user", message);

      const messages: ChatMessage[] = [systemMsg, ...history["o3-pro"]];
      const reply = await callO3Pro(messages);
      addToHistory("o3-pro", "assistant", reply);

      return {
        content: [
          {
            type: "text" as const,
            text: `**o3-pro**\n\n${reply}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error (o3-pro): ${error instanceof Error ? error.message : String(error)}\n\n` +
              `Fix: Run \`az login\` in terminal first.`,
          },
        ],
        isError: true,
      };
    }
  }
);

// ── Tool: ask_gpt52 ───────────────────────────────────────────────────────────

server.tool(
  "ask_gpt52",
  "[STEP 1 of 3] Research synthesis brain. Call this FIRST to analyze raw search results, " +
    "synthesize best practices, and provide tech recommendations. " +
    "For security audits: call ask_gpt52 FIRST, then ask_codex, then ask_o3_pro. " +
    "This tool uses GPT-5.2 (fast, good at research). NOT for code-level audits.",
  {
    message: z.string().describe("Your question or task for GPT-5.2"),
    system_prompt: z
      .string()
      .optional()
      .describe("Optional system instruction"),
    new_conversation: z
      .boolean()
      .optional()
      .default(false)
      .describe("Clear history and start fresh"),
  },
  async ({ message, system_prompt, new_conversation }) => {
    try {
      if (new_conversation) history["gpt-5.2"] = [];

      const systemMsg: ChatMessage = {
        role: "system",
        content:
          system_prompt ??
          "You are an expert full-stack developer. Provide clear, actionable code and explanations. Be concise and precise.",
      };

      addToHistory("gpt-5.2", "user", message);

      const messages: ChatMessage[] = [systemMsg, ...history["gpt-5.2"]];
      const reply = await callGpt52(messages, 0.7);
      addToHistory("gpt-5.2", "assistant", reply);

      return {
        content: [
          {
            type: "text" as const,
            text: `**GPT-5.2**\n\n${reply}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error (gpt-5.2): ${error instanceof Error ? error.message : String(error)}\n\n` +
              `Fix: Run \`az login\` in terminal first.`,
          },
        ],
        isError: true,
      };
    }
  }
);

// ── Tool: ask_codex ────────────────────────────────────────────────────────────

server.tool(
  "ask_codex",
  "[STEP 2 of 3] Code-level auditor brain. Call this AFTER ask_gpt52, BEFORE ask_o3_pro. " +
    "MANDATORY for: OWASP security audits, line-by-line code review, large refactors, migrations. " +
    "Send full file contents (400K context window). " +
    "DO NOT use ask_o3_pro or ask_super for code-level scanning — only this tool can do it. " +
    "Uses GPT-5.2-Codex model.",
  {
    message: z.string().describe("Your coding task or code analysis request for GPT-5.2-Codex"),
    system_prompt: z
      .string()
      .optional()
      .describe("Optional system instruction (default: expert agentic coder)"),
    new_conversation: z
      .boolean()
      .optional()
      .default(false)
      .describe("Clear history and start fresh"),
  },
  async ({ message, system_prompt, new_conversation }) => {
    try {
      if (new_conversation) history["gpt-5.2-codex"] = [];

      const systemMsg: ChatMessage = {
        role: "system",
        content:
          system_prompt ??
          "You are an expert agentic coder optimized for large-scale code operations. " +
          "Excel at: refactors, migrations, multi-file edits, security audits, and deep codebase analysis. " +
          "Provide complete, production-ready code. Be precise and thorough.",
      };

      addToHistory("gpt-5.2-codex", "user", message);

      const messages: ChatMessage[] = [systemMsg, ...history["gpt-5.2-codex"]];
      const reply = await callCodex(messages);
      addToHistory("gpt-5.2-codex", "assistant", reply);

      return {
        content: [
          {
            type: "text" as const,
            text: `**GPT-5.2-Codex**\n\n${reply}`,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text" as const,
            text: `Error (gpt-5.2-codex): ${error instanceof Error ? error.message : String(error)}\n\n` +
              `Fix: Run \`az login\` in terminal first.`,
          },
        ],
        isError: true,
      };
    }
  }
);

// ── Tool: ask_super (smart multi-model pipeline) ───────────────────────────────

const SECURITY_KEYWORDS = [
  "security", "audit", "owasp", "vulnerab", "exploit", "attack",
  "auth", "csrf", "xss", "injection", "bypass", "hack", "penetration",
  "threat", "malicious", "ssl", "tls", "encrypt", "breach", "leak",
  "privilege", "escalat", "rls", "spoofing", "session fixation",
  "code review", "code audit", "security review", "hardening",
] as const;

function isSecurityTask(message: string): boolean {
  const lower = message.toLowerCase();
  return SECURITY_KEYWORDS.some((kw) => lower.includes(kw));
}

/** Safe wrapper: calls a brain, returns result or error string. NEVER throws. */
async function safeBrainCall(
  brainName: string,
  fn: () => Promise<string>
): Promise<{ ok: boolean; result: string; ms: number }> {
  const start = Date.now();
  try {
    const result = await fn();
    const ms = Date.now() - start;
    console.error(`[${brainName}] ✅ SUCCESS in ${ms}ms`);
    return { ok: true, result, ms };
  } catch (error) {
    const ms = Date.now() - start;
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error(`[${brainName}] ❌ FAILED after ${ms}ms: ${errMsg}`);
    return {
      ok: false,
      result: `⚠️ ${brainName} FAILED (${ms}ms): ${errMsg}`,
      ms,
    };
  }
}

server.tool(
  "ask_super",
  "Smart pipeline that auto-detects task type and routes to correct brains. " +
    "For security/audit tasks: runs GPT-5.2 → Codex → o3-pro (all 3 brains). " +
    "For planning/implementation tasks: runs o3-pro → GPT-5.2 (2 brains). " +
    "Automatically chooses the right sequence based on your message content.",
  {
    message: z.string().describe("Your task for the super agent pipeline"),
    system_prompt: z
      .string()
      .optional()
      .describe("Optional system instruction for all models"),
  },
  async ({ message, system_prompt }) => {
    if (isSecurityTask(message)) {
      // ── SECURITY/AUDIT MODE: gpt-5.2 → codex → o3-pro (ALL 3 MANDATORY) ──
      console.error("[ask_super] ===== SECURITY PIPELINE START (3 brains) =====");
      const pipelineStart = Date.now();

      // Step 1: GPT-5.2 synthesizes research — MANDATORY
      console.error("[ask_super] Step 1/3: GPT-5.2 research synthesis...");
      const step1 = await safeBrainCall("gpt-5.2", () => {
        const researchPrompt: ChatMessage[] = [
          {
            role: "system",
            content:
              system_prompt ??
              "You are a senior security researcher. Analyze the provided code and context. " +
              "Synthesize latest security best practices, known risks, and actionable patterns.",
          },
          { role: "user", content: message },
        ];
        return callGpt52(researchPrompt, 0.5);
      });

      // Step 2: Codex code-level OWASP audit — MANDATORY (runs even if step1 failed)
      console.error("[ask_super] Step 2/3: Codex code-level OWASP scan...");
      const step2 = await safeBrainCall("gpt-5.2-codex", () => {
        const codexInput =
          `[System] You are an OWASP-certified application security auditor. ` +
          `Perform a thorough code-level security audit. Rate every finding by severity ` +
          `(CRITICAL/HIGH/MEDIUM/LOW). For each finding: explain the attack vector and suggest a fix.\n\n` +
          (step1.ok
            ? `## Research Context (from GPT-5.2)\n${step1.result}\n\n`
            : `## Note: GPT-5.2 research step failed — audit code independently.\n\n`) +
          `## Code & Task\n${message}`;
        return callCodex(codexInput);
      });

      // Step 3: o3-pro architecture review — MANDATORY (runs even if step1/step2 failed)
      console.error("[ask_super] Step 3/3: o3-pro architecture review...");
      const step3 = await safeBrainCall("o3-pro", () => {
        const archInput =
          `[System] You are the Chief Security Architect. Review findings from the research team ` +
          `and code auditor. Validate or challenge each finding. Identify anything they missed. ` +
          `Rank what to fix FIRST. Give GO/NO-GO verdict.\n\n` +
          `## GPT-5.2 Research Synthesis\n${step1.ok ? step1.result : "(UNAVAILABLE — brain failed)"}\n\n` +
          `## Codex Code-Level Audit\n${step2.ok ? step2.result : "(UNAVAILABLE — brain failed)"}\n\n` +
          `## Original Task\n${message}\n\n` +
          `Tasks:\n1. Validate/challenge findings\n2. What did they miss?\n` +
          `3. Priority fix order\n4. GO/NO-GO verdict`;
        return callO3Pro(archInput);
      });

      const totalMs = Date.now() - pipelineStart;
      const brainStatus = [
        `gpt-5.2: ${step1.ok ? "✅" : "❌"} (${step1.ms}ms)`,
        `codex: ${step2.ok ? "✅" : "❌"} (${step2.ms}ms)`,
        `o3-pro: ${step3.ok ? "✅" : "❌"} (${step3.ms}ms)`,
      ].join(" | ");
      console.error(`[ask_super] ===== PIPELINE COMPLETE: ${totalMs}ms | ${brainStatus} =====`);

      addToHistory("super", "user", message);
      addToHistory(
        "super",
        "assistant",
        `[gpt-5.2]\n${step1.result}\n\n[codex]\n${step2.result}\n\n[o3-pro]\n${step3.result}`
      );

      return {
        content: [
          {
            type: "text" as const,
            text:
              `# Security Audit Report (3-Brain Pipeline)\n` +
              `> **Brain Status:** ${brainStatus} | Total: ${totalMs}ms\n\n` +
              `---\n## 🔬 Step 1: GPT-5.2 Research Synthesis ${step1.ok ? "✅" : "❌"}\n\n${step1.result}\n\n` +
              `---\n## 🔍 Step 2: Codex Code-Level OWASP Audit ${step2.ok ? "✅" : "❌"}\n\n${step2.result}\n\n` +
              `---\n## 🏗️ Step 3: o3-pro Architecture Review ${step3.ok ? "✅" : "❌"}\n\n${step3.result}`,
          },
        ],
      };
    } else {
      // ── PLAN+IMPLEMENT MODE: o3-pro → gpt-5.2 (BOTH MANDATORY) ──
      console.error("[ask_super] ===== PLAN PIPELINE START (2 brains) =====");
      const pipelineStart = Date.now();

      // Step 1: o3-pro thinks deeply — MANDATORY
      console.error("[ask_super] Step 1/2: o3-pro planning...");
      const step1 = await safeBrainCall("o3-pro", () => {
        const planPrompt: ChatMessage[] = [
          {
            role: "system",
            content:
              system_prompt ??
              "You are a senior architect. Analyze the request deeply. " +
              "Produce a clear, structured plan with specific steps. " +
              "Your output will be given to an implementation agent.",
          },
          { role: "user", content: message },
        ];
        return callO3Pro(planPrompt);
      });

      // Step 2: gpt-5.2 implements — MANDATORY (runs even if step1 failed)
      console.error("[ask_super] Step 2/2: GPT-5.2 implementing...");
      const step2 = await safeBrainCall("gpt-5.2", () => {
        const implPrompt: ChatMessage[] = [
          {
            role: "system",
            content:
              "You are an expert implementer. You received a plan from o3-pro (senior architect). " +
              "Execute the plan precisely. Provide complete, production-ready output.",
          },
          {
            role: "user",
            content: step1.ok
              ? `## Original Request\n${message}\n\n## o3-pro Analysis & Plan\n${step1.result}\n\n## Your Task\nImplement/execute the above plan completely.`
              : `## Original Request\n${message}\n\n## Note: o3-pro planning step failed — implement based on the original request directly.\n\n## Your Task\nAnalyze and implement a complete solution.`,
          },
        ];
        return callGpt52(implPrompt, 0.5);
      });

      const totalMs = Date.now() - pipelineStart;
      const brainStatus = [
        `o3-pro: ${step1.ok ? "✅" : "❌"} (${step1.ms}ms)`,
        `gpt-5.2: ${step2.ok ? "✅" : "❌"} (${step2.ms}ms)`,
      ].join(" | ");
      console.error(`[ask_super] ===== PIPELINE COMPLETE: ${totalMs}ms | ${brainStatus} =====`);

      addToHistory("super", "user", message);
      addToHistory(
        "super",
        "assistant",
        `[o3-pro plan]\n${step1.result}\n\n[gpt-5.2 implementation]\n${step2.result}`
      );

      return {
        content: [
          {
            type: "text" as const,
            text:
              `# Super Agent Report (2-Brain Pipeline)\n` +
              `> **Brain Status:** ${brainStatus} | Total: ${totalMs}ms\n\n` +
              `---\n### 🏗️ o3-pro Analysis ${step1.ok ? "✅" : "❌"}\n\n${step1.result}\n\n` +
              `---\n### ⚡ GPT-5.2 Implementation ${step2.ok ? "✅" : "❌"}\n\n${step2.result}`,
          },
        ],
      };
    }
  }
);

// ── Tool: clear_history ────────────────────────────────────────────────────────

// ── Tool: ask_audit (composite: gpt52 → codex → o3-pro) ───────────────────────

server.tool(
  "ask_audit",
  "PREFERRED tool for security audits. Automatically runs all 3 brains in correct sequence: " +
    "(1) GPT-5.2 analyzes research, (2) Codex does code-level OWASP scan, (3) o3-pro does architecture review. " +
    "Send: research context + full file contents + audit questions. " +
    "Use this instead of calling ask_gpt52/ask_codex/ask_o3_pro separately for security tasks.",
  {
    research_context: z.string().describe("Research data, best practices, search results to synthesize"),
    code_to_audit: z.string().describe("Full file contents to audit (paste all code here)"),
    audit_questions: z.string().describe("Specific security questions or focus areas"),
    system_prompt: z
      .string()
      .optional()
      .describe("Optional system instruction for all 3 brains"),
  },
  async ({ research_context, code_to_audit, audit_questions, system_prompt }) => {
    console.error("[ask_audit] ===== 3-BRAIN AUDIT PIPELINE START =====");
    const pipelineStart = Date.now();

    // ── STEP 1: GPT-5.2 synthesizes research — MANDATORY ──
    console.error("[ask_audit] Step 1/3: GPT-5.2 research synthesis...");
    const step1 = await safeBrainCall("gpt-5.2", () => {
      const researchPrompt: ChatMessage[] = [
        {
          role: "system",
          content:
            system_prompt ??
            "You are a senior security researcher. Analyze the provided research data and synthesize " +
            "the latest security best practices, known risks, and actionable patterns. Be specific.",
        },
        {
          role: "user",
          content: `## Research Data to Analyze\n${research_context}\n\n## Focus Areas\n${audit_questions}`,
        },
      ];
      return callGpt52(researchPrompt, 0.5);
    });

    // ── STEP 2: Codex code-level OWASP audit — MANDATORY (runs even if step1 failed) ──
    console.error("[ask_audit] Step 2/3: Codex code-level OWASP scan...");
    const step2 = await safeBrainCall("gpt-5.2-codex", () => {
      const codexInput =
        `[System] You are an OWASP-certified application security auditor. ` +
        `Perform a thorough code-level security audit. Rate every finding by severity (CRITICAL/HIGH/MEDIUM/LOW). ` +
        `For each finding: explain the attack vector and suggest a fix.\n\n` +
        (step1.ok
          ? `## Research Context (from GPT-5.2)\n${step1.result}\n\n`
          : `## Note: GPT-5.2 research step failed — audit code independently.\n\n`) +
        `## Code to Audit\n${code_to_audit}\n\n` +
        `## Audit Questions\n${audit_questions}`;
      return callCodex(codexInput);
    });

    // ── STEP 3: o3-pro architecture review — MANDATORY (runs even if step1/step2 failed) ──
    console.error("[ask_audit] Step 3/3: o3-pro architecture review...");
    const step3 = await safeBrainCall("o3-pro", () => {
      const archInput =
        `[System] You are the Chief Security Architect. Review the findings from the research team ` +
        `and code auditor. Validate or challenge each finding. Identify anything they missed. ` +
        `Rank what to fix FIRST. Give an overall architecture verdict.\n\n` +
        `## GPT-5.2 Research Synthesis\n${step1.ok ? step1.result : "(UNAVAILABLE — brain failed)"}\n\n` +
        `## Codex Code-Level Audit Findings\n${step2.ok ? step2.result : "(UNAVAILABLE — brain failed)"}\n\n` +
        `## Questions\n${audit_questions}\n\n` +
        `## Original Code Context\n${code_to_audit.slice(0, 2000)}...\n\n` +
        `Tasks:\n1. Validate or challenge each finding\n2. Identify anything both missed\n` +
        `3. Rank fixes by priority\n4. Give GO/NO-GO verdict for production`;
      return callO3Pro(archInput);
    });

    const totalMs = Date.now() - pipelineStart;
    const brainStatus = [
      `gpt-5.2: ${step1.ok ? "✅" : "❌"} (${step1.ms}ms)`,
      `codex: ${step2.ok ? "✅" : "❌"} (${step2.ms}ms)`,
      `o3-pro: ${step3.ok ? "✅" : "❌"} (${step3.ms}ms)`,
    ].join(" | ");
    console.error(`[ask_audit] ===== PIPELINE COMPLETE: ${totalMs}ms | ${brainStatus} =====`);

    return {
      content: [
        {
          type: "text" as const,
          text:
            `# Security Audit Report (3-Brain Pipeline)\n` +
            `> **Brain Status:** ${brainStatus} | Total: ${totalMs}ms\n\n` +
            `---\n## 🔬 Step 1: GPT-5.2 Research Synthesis ${step1.ok ? "✅" : "❌"}\n\n${step1.result}\n\n` +
            `---\n## 🔍 Step 2: Codex Code-Level OWASP Audit ${step2.ok ? "✅" : "❌"}\n\n${step2.result}\n\n` +
            `---\n## 🏗️ Step 3: o3-pro Architecture Review ${step3.ok ? "✅" : "❌"}\n\n${step3.result}`,
        },
      ],
    };
  }
);

server.tool(
  "clear_history",
  "Clear conversation history for a model or all models.",
  {
    model: z
      .enum(["o3-pro", "gpt-5.2", "gpt-5.2-codex", "super", "all"])
      .optional()
      .default("all"),
  },
  async ({ model }) => {
    if (model === "all") {
      history["o3-pro"] = [];
      history["gpt-5.2"] = [];
      history["gpt-5.2-codex"] = [];
      history["super"] = [];
    } else {
      history[model] = [];
    }
    return {
      content: [
        {
          type: "text" as const,
          text: `Cleared history for: ${model}`,
        },
      ],
    };
  }
);

// ── Start ──────────────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Azure Super Agent MCP Server v3.0 — 4 Brains");
  console.error(`Endpoint: ${AZURE_ENDPOINT}`);
  console.error(`Deployments: o3-pro=${DEPLOYMENTS["o3-pro"]}, gpt-5.2=${DEPLOYMENTS["gpt-5.2"]}, codex=${DEPLOYMENTS["gpt-5.2-codex"]}`);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
