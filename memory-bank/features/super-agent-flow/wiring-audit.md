# Wiring Audit: Super Agent Flow Routing

Date: 2026-02-10

## Scope
- Agent configuration files under `.github/agents/**`.

## Dependency/Wiring Notes
- `super-agent.agent.md` defines global tool access and routing rules (critical governance surface).
- `gama.agent.md` orchestrates planner → implementer → reviewer and optional data-analyst handoff.
- No direct runtime code dependencies, but changes affect AI workflow behavior and tool access.

## Impacted Files (Planned)
- `.github/agents/super-agent.agent.md`
- `.github/agents/gama.agent.md`
- `.github/agents/researcher.agent.md` (new)
- Optional: planner/implementer/reviewer agent docs for model preferences.

## Known Constraints
- “Bing Search” is not listed in available tools; must map to `brave-search/brave_web_search` or `exa/web_search_exa`.

## Regression Scope
- Validate agent selection/routing in VS Code after edits.
- Confirm tool list remains intact and no YAML header regression.
