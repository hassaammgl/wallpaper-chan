# Agent instructions

**Source of truth for this whole project: `.ai/`** (not `.cursor`).

Read `.ai/README.md` first. All architecture, coding standards, workflows, checklists, prompts, and conventions live under `.ai/`.

## Before coding

1. `.ai/workflows/before-coding.md`
2. `.ai/rules/architecture.md` + `.ai/rules/coding.md` + `.ai/rules/oop.md`
3. Stack files for this app: `.ai/rules/react.md`, `.ai/rules/frontend.md`, `.ai/rules/api.md`, `.ai/rules/backend.md`, `.ai/rules/database.md`, `.ai/rules/security.md`
4. Search/read existing code in the feature area — do not invent APIs, env vars, or models

## Hard limits (from `.ai`)

| Rule | Limit | File |
|------|-------|------|
| Function body | ≤ **30** lines | `.ai/rules/coding.md` |
| Parameters | ≤ **4** (else options object) | `.ai/rules/coding.md` |
| Component / page file | ≤ **150** lines | `.ai/rules/react.md` R3 |
| One responsibility per function | pass/fail | `.ai/rules/coding.md` |
| Verb-phrase names | not `process` / `helper` alone | `.ai/rules/coding.md` |
| No unexplained empty `catch` | surface / rethrow / comment | `.ai/rules/coding.md` |

## During / after

- Implement via `.ai/workflows/implementation.md`
- Self-review via `.ai/workflows/code-review.md`
- Checklists: `.ai/checklists/` (`frontend`, `api`, `backend`, `security`, …)

## Project map

| Area | Path |
|------|------|
| Pages | `src/app/(main)/`, `src/app/admin/` |
| API | `src/app/api/` |
| UI | `src/components/` |
| Hooks | `src/hooks/` |
| Lib | `src/lib/` |
| Models | `src/lib/models/` |
| **Rules handbook** | **`.ai/`** |
