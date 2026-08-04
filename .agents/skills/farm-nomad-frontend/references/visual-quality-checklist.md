# FarmNomad Visual-Quality Checklist

Use this checklist when designing, redesigning, polishing, reviewing, or implementing FarmNomad frontend interfaces.

## Direction

- The interface follows Modern Agrarian Editorial: practical, grounded, editorially composed, and specific to food, farming, markets, and logistics.
- The page avoids generic green SaaS styling: no overused green gradients, vague plant motifs, interchangeable metric cards, or decorative UI that could belong to any B2B product.
- Real content, real data shapes, and useful states drive the layout. Do not polish empty placeholders.
- Public market pages may carry more editorial warmth; operational dashboard pages stay denser, calmer, and work-focused.

## Typography

- Instrument Serif is used selectively for high-emphasis editorial headings only.
- Manrope is used for operational UI, forms, nav, tables, filters, metadata, buttons, and dashboard surfaces.
- Type sizes follow established tokens or local scale conventions. Do not use viewport-width font scaling.
- Headings, body copy, labels, helper text, and metadata have distinct hierarchy without cramming or oversized type in compact areas.
- Button, badge, tab, and table text fits at mobile and desktop sizes without clipping or awkward wrapping.

## Tokens

- Colours come from established theme/CSS/Tailwind tokens, not one-off hex values.
- Typography, spacing, radius, border, shadow, and motion values reuse existing tokens or the documented scale.
- Green is disciplined: primary actions, selected states, and brand moments. It is not the whole palette.
- Radius stays consistent with the established system; avoid inflated rounded cards unless already part of the component standard.
- Contrast meets WCAG AA for body text and UI controls.

## Layout

- Page gutters follow the approved responsive gutters. Content is not pinned to viewport edges at 320px.
- Spacing follows the approved scale and keeps vertical rhythm consistent.
- Sections are not all cards. Use unframed sections, bands, lists, dividers, tables, drawers, and repeated item cards intentionally.
- Cards are used for repeated objects or framed tools, not as a default wrapper for every block.
- Dense dashboard views prioritize scanning, comparison, and repeated use over marketing-style hero composition.
- Public pages keep the market/listing content visible and useful without overbuilding a landing-page wrapper.

## Components

- Shared components are reused before new primitives are created.
- New components match existing prop patterns, focus behaviour, loading/error states, and class/token conventions.
- Filters, search, pagination, tabs, menus, drawers, modals, and form controls use familiar UI patterns and accessible semantics.
- Icons come from the established icon library when available.
- Empty, loading, error, success, disabled, and permission states are visually complete and truthful.

## Navigation And State

- Nested pages include contextual back navigation with a specific destination label.
- Market/listing flows preserve search, filters, pagination, and scroll state when returning from detail.
- Save, cancel, archive, and error recovery flows preserve user context wherever practical.
- Browser Back behaves naturally and does not strand the user on stale or empty UI.

## Interaction Polish

- Hover, active, selected, disabled, loading, and focus states are visible and consistent.
- Keyboard focus is never removed without a visible replacement.
- Touch targets are at least 44 by 44px for primary interactive elements.
- Motion is functional, subtle, and respects reduced-motion preferences.
- Dead controls, fake links, placeholder filters, and unimplemented buttons are removed or made honestly unavailable.

## Completion Evidence

- Important changed routes and states have screenshots after the final visual pass.
- Browser inspection confirms no overlapping text, clipped controls, horizontal overflow, blank content regions, or broken image/media rendering.
- Lint, typecheck, tests, and build have been run or an explicit blocker has been reported.
