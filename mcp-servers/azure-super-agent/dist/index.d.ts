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
export {};
