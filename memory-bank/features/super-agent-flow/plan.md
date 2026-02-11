# Feature Plan: Super Agent Flow Routing

Date: 2026-02-10

## Goal
Align super-agent orchestration so specific roles map to desired Azure models and required tools per the user’s table, and ensure the flow is explicitly documented in agent configs.

## Risk Tier
**Tier-3 (High)** — edits touch `.github/agents/**` which is a governance/agent control surface listed under root critical files.

## Requirements
- Gama (Boss) → o3-pro
- Planner → o3-pro
- Implementer → GPT-5.2
- Researcher → GPT-5.2 + web search tool
- Reviewer → GPT-5.2
- Provide a documented “flow” so the orchestrator uses the above routing.

## Open Decisions
- “Bing Search” tool is not available in current tool list. Need user confirmation to map it to either:
  - `brave-search/brave_web_search` (recommended), or
  - `exa/web_search_exa`.

## Impacted Files
- `.github/agents/super-agent.agent.md` (routing instructions + model mapping table)
- `.github/agents/gama.agent.md` (handoff flow + optional researcher role)
- `.github/agents/planner.agent.md` (optional: clarify model preference)
- `.github/agents/implementer.agent.md` (optional: clarify model preference)
- `.github/agents/reviewer.agent.md` (optional: clarify model preference)
- `.github/agents/researcher.agent.md` (new file; if approved)

## Implementation Outline
1. Add explicit model-routing guidance and quick summary table to `super-agent.agent.md`.
2. Extend `gama.agent.md` handoffs to include Researcher (if approved).
3. Add `researcher.agent.md` with tool set that matches chosen search provider.
4. Ensure all roles reference external research standards where applicable.

## Verification
- Validate agent config files load without syntax errors.
- Run `npm run build` after changes (per AGENTS.md).

## Risks & Mitigations
- **Risk:** Misconfigured tools or unsupported search provider.
  - **Mitigation:** Confirm search tool mapping with user and use available provider.
- **Risk:** Governance changes could break agent routing.
  - **Mitigation:** Keep changes minimal; preserve existing handoffs and tools.
