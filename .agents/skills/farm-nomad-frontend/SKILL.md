---
name: farm-nomad-frontend
description: Frontend quality workflow for FarmNomad web interfaces. Use when Codex is asked to design, redesign, polish, review, implement, or build FarmNomad frontend UI, pages, layouts, components, responsive behaviour, browser validation, visual QA, accessibility checks, screenshots, or frontend completion criteria.
---

# FarmNomad Frontend

## Purpose

Use this skill to keep FarmNomad frontend work visually specific, token-driven, accessible, responsive, and verified in a real browser before it is called complete.

This skill covers frontend craft and validation only. Keep product scope, role rules, backend contracts, and MVP acceptance criteria in the project docs and `AGENTS.md`.

## Required Context

Before changing UI, follow the repository `AGENTS.md` reading order. For frontend work, also inspect the actual web code, shared components, theme/tokens, route structure, and any current CSS before deciding what to build.

Use these references when relevant:

- `references/visual-quality-checklist.md` for visual direction, token use, page composition, state polish, and FarmNomad-specific anti-patterns.
- `references/responsive-viewport-checklist.md` for browser viewport coverage, screenshot expectations, keyboard checks, and completion criteria.

## Visual Direction

Follow the Modern Agrarian Editorial direction: grounded, tactile, credible, and composed. FarmNomad should feel like practical agricultural infrastructure with editorial warmth, not a generic green SaaS dashboard.

Use typography intentionally:

- Use Instrument Serif selectively for editorial moments, such as public-page hero headings, market storytelling, or high-emphasis section titles.
- Use Manrope for operational UI: navigation, forms, filters, tables, dashboard metrics, buttons, labels, and dense workflow surfaces.
- Do not use display typography in compact controls, tables, cards with dense metadata, or validation messages.

Reuse established colour, typography, spacing, radius, shadow, layout, and motion tokens from the repo. If tokens are missing or inconsistent, add the smallest token-level correction that matches the existing system instead of hard-coding one-off values.

Avoid generic green SaaS styling: do not let the page become a flat spread of green gradients, pill cards, vague leaf motifs, or interchangeable dashboard blocks. Use green as a disciplined brand/action colour with ink, surface, amber, blue, and border tokens doing their jobs.

## Composition Rules

Do not place every section in a card. Use full-width page bands, unframed layouts, tables, lists, dividers, drawers, and repeated item cards according to the content. Reserve cards for repeated listings, compact stats, modals, and genuinely framed tools.

Follow the approved spacing scale and responsive page gutters. Keep page structure calm and scannable: consistent vertical rhythm, clear hierarchy, and no viewport-scaled font sizing.

Reuse shared components before creating new ones. If a shared primitive or feature component nearly fits, extend it narrowly and preserve its accessibility contract.

Remove dead controls, placeholder UI, fake filters, nonfunctional buttons, and decorative controls that do not have implemented behaviour. If a control must remain disabled, make the unavailable state honest and accessible.

## Navigation And State

Use contextual back navigation on nested pages. The label and destination should reflect the user's entry context, such as returning from a listing detail to market results, from an edit form to listing management, or from an order detail to the order list.

Preserve listing search, filter, pagination, and scroll state when returning from detail pages. Prefer URL-backed state for shareable market pages; use history state or narrowly scoped session restoration only when URL state is inappropriate.

Do not reset a user's working context after save, cancel, archive, or browser Back unless the flow explicitly calls for it.

## Browser Validation

Before calling UI work complete:

1. Read `references/visual-quality-checklist.md` and apply it to the changed routes/components.
2. Read `references/responsive-viewport-checklist.md` and validate from 320px through 1440px.
3. Use Playwright or browser inspection against the running app, not static reasoning alone.
4. Check keyboard navigation, visible focus states, form labelling, interactive target sizes, and screen-reader-relevant error/status wiring.
5. Capture screenshots of important changed routes and states after visual work.
6. Run the repo's frontend quality gates: lint, typecheck, tests, and build. Use the commands exposed by the actual package scripts when they differ from documentation.

If any required validation cannot run, report exactly what could not run and why, then describe the remaining risk.
