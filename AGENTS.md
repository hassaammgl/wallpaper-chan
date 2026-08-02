# Agent instructions

This repo uses the **`.ai/`** engineering knowledge base as the source of truth for architecture, coding standards, workflows, and checklists.

Cursor project rules in `.cursor/rules/` enforce that handbook for this stack (Next.js App Router, React, Tailwind, Mongoose, Better Auth).

## Before coding

1. Read `.ai/workflows/before-coding.md`
2. Read stack-relevant files under `.ai/rules/` (`react.md`, `frontend.md`, `api.md`, `coding.md`, …)
3. Search and read existing code in the feature area
4. Plan real file paths — do not invent APIs, env vars, or models

## After coding

1. Self-review with `.ai/workflows/code-review.md`
2. Run the matching checklist under `.ai/checklists/`

## Project map

| Area | Path |
|------|------|
| Pages | `src/app/(main)/`, `src/app/admin/` |
| API | `src/app/api/` |
| UI | `src/components/` |
| Lib | `src/lib/` |
| Models | `src/lib/models/` |
| AI handbook | `.ai/` |
