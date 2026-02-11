# Memory-Bank Feature Artifacts

For every feature change create:

- `memory-bank/features/<feature-slug>/plan.md`
- `memory-bank/features/<feature-slug>/wiring-audit.md`
- `memory-bank/features/<feature-slug>/regression-report.md`

Use prompts in `.github/prompts/` to generate these artifacts.

Tier guide:
- T1: minimum plan + smoke + build
- T2: full plan + wiring-audit + regression + build
- T3: full 7+2 workflow + security gate + build
