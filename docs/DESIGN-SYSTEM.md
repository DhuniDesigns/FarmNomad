# FarmNomad — Design System

**Important:** A visual design revamp is in progress in Figma, led by the project's design lead. **Figma is the source of truth for visual design.** Confirmed facts here: Clash Grotesk as display font (self-hosted via `next/font/local`), Tailwind CSS v4, Framer Motion for animation, and the design→build workflow (Figma frames exported as images → reviewed → implemented as components). Everything else in this document — colour values, spacing scale, component specs — is **[Recommended]** as a working baseline for agents to build against, and must yield to Figma tokens when they are delivered.

---

## 1. Visual direction **[Recommended]**

Fresh, trustworthy, working-tool aesthetic: this is software farmers use in a yard on a phone with bad signal, not a lifestyle brand. Generous whitespace, high-contrast text, obvious touch targets, photography of real produce over illustration. Motion (Framer Motion) is functional — state transitions, reveal on scroll for marketing pages — never decorative on task screens.

## 2. Colour tokens **[Recommended — replace with Figma tokens when delivered]**

Define as CSS custom properties consumed by Tailwind v4 `@theme`:

| Token | Value | Use |
|---|---|---|
| `--color-primary-600` | `#178C4E` | Canonical FarmNomad brand green; primary action surface with dark foreground |
| `--color-primary-700` | `#157E46` | Hover/active action surface when white foreground is required |
| `--color-primary-800` | `#126F3E` | Pressed/selected dark green |
| `--color-primary-50` | `#E8F4ED` | Tinted backgrounds, selected states |
| `--color-brand-border` | `#B7DDC7` | Brand-tinted component boundaries |
| `--color-action-foreground` | `#000000` | Foreground for normal text on exact `#178C4E` buttons |
| `--color-accent-500` | `#E8A13A` | Harvest amber — highlights, badges |
| `--color-ink-950` | `#07110B` | Strong ink |
| `--color-ink-900` | `#102018` | Headings |
| `--color-ink-700` | `#3B4A40` | Body text |
| `--color-ink-500` | `#66766C` | Secondary text |
| `--color-surface-0` | `#FFFFFF` | Cards |
| `--color-surface-50` | `#F6F8F6` | Page background |
| `--color-border` | `#DDE5DF` | Dividers, input borders |
| `--color-success-600` | `#1F7A3D` | Success (shares brand green) |
| `--color-warning-600` | `#7A3F11` | Warnings on pale amber surfaces |
| `--color-danger-600` | `#B3261E` | Errors, destructive |
| `--color-info-600` | `#1D5FA6` | Informational |

Role accents (optional, for dashboard identity): Farmer green (primary), Kitchen amber, Organisation blue, Admin slate. Keep subtle — chips and sidebar accents only.

All text/background pairs must meet WCAG AA contrast (§9); verify any Figma-supplied palette against this before adoption.

## 3. Typography

- **Display/headings:** Clash Grotesk, self-hosted via `next/font/local` **[Confirmed choice; wiring is an open task]**. Weights 500/600.
- **Body/UI:** a workhorse sans **[Recommended: Inter or system stack]**, weights 400/500/600.
- Scale **[Recommended]** (rem): `display` 3.0, `h1` 2.25, `h2` 1.75, `h3` 1.375, `h4` 1.125, `body` 1.0, `small` 0.875, `caption` 0.75. Line-height 1.2 for headings, 1.5–1.6 for body. Minimum body size 16px; never below 14px for interactive text.

## 4. Spacing **[Recommended]**

4px base unit; use Tailwind's default scale and stick to steps 1, 2, 3, 4, 6, 8, 10, 12, 16, 20, 24 (4–96px). Section padding: 24px mobile, 48px desktop. Card padding: 16–24px. Form field vertical rhythm: 20px between fields, 32px between groups.

## 5. Grid **[Recommended]**

- Public/marketing pages: 12-column, max-width 1280px, 24px gutters.
- Platform (dashboard) pages: fixed Sidebar (~264px, collapsible to icon rail) + fluid content column with max-width 1120px and TopBar. This corresponds to the `(platform)` layout shell **[Confirmed as a required build item]**.
- Listing grids: responsive auto-fit cards, min 240px; 1 col <640px, 2 cols <1024px, 3–4 cols desktop.

## 6. Components **[Recommended inventory — align to Figma as frames arrive]**

Core set to build in `src/components/ui` (see ARCHITECTURE):

- **Button** — primary / secondary / ghost / destructive; sm / md / lg; loading state; renders as `<button>` or `<a>`.
- **Input, Textarea, Select, Checkbox, Radio** — labelled, with error slot; integrates react-hook-form + zod errors.
- **FormField** — label + control + hint + error wrapper with correct `aria-describedby` wiring.
- **Card** — listing card (image, title, price, quantity badge, vendor), stat card (dashboard metrics).
- **Badge/Chip** — statuses (order states, verification states, role accents).
- **Table/DataList** — orders and listings management; responsive collapse to cards on mobile.
- **Modal/Drawer** — confirmations (archive listing), mobile filters; focus-trapped.
- **Toast** — success/error feedback, screen-reader announced (`aria-live="polite"`).
- **Sidebar + TopBar** — role-aware navigation (nav items filtered by role), unread message/notification counts. Replaces the current non-functional Sidebar stub **[Confirmed as pending work]**.
- **EmptyState** — icon + message + CTA; used across USER-FLOWS empty states.
- **Pagination**, **SearchBar + FilterPanel**, **ImageUploader** (Cloudinary, per-file retry), **Skeleton** loaders.

Primary buttons use the darker accessible action surface (`--color-primary-700`) with white text. Components using the exact brand green must not use white text at normal label sizes; use `--color-action-foreground` on `--color-primary-600`, or keep `--color-primary-600` for links, icons, focus rings, selected indicators, badges, and charts.

Each component: typed props, no business logic, stories/examples optional but tests for logic-bearing ones.

## 7. Responsive behaviour **[Recommended]**

Breakpoints: Tailwind defaults (`sm` 640, `md` 768, `lg` 1024, `xl` 1280). Public pages are mobile-first and fully functional at 320px. Platform pages target ≥768px primarily (Vendors on laptops/tablets) but must not break on phones: Sidebar becomes a drawer, tables collapse to cards. Touch targets ≥44×44px. Public pages ship minimal client-side JS — they are Server Components by architectural decision **[Confirmed]**, so avoid client-only components there except leaf interactivity (search input, filter panel).

## 8. Motion **[Recommended]**

Framer Motion **[Confirmed as the animation library]**. Durations 150–250ms UI, 300–400ms page/section transitions; ease-out for entrances. Respect `prefers-reduced-motion` — disable non-essential animation. No motion on data-critical dashboard updates beyond subtle fades.

## 9. Accessibility requirements

WCAG 2.1 AA is the bar **[Confirmed expectation]**; specifics **[Recommended]**:

- Contrast ≥ 4.5:1 body text, ≥ 3:1 large text and UI components.
- Full keyboard operability; visible focus ring (2px, offset, brand green on light surfaces) — never `outline: none` without replacement.
- Semantic landmarks (`header`, `nav`, `main`, `footer`); one `h1` per page; logical heading order.
- Forms: programmatic labels, errors linked via `aria-describedby` and announced; do not rely on colour alone for state (pair icon/text with status colours).
- Modals: focus trap, `Esc` closes, focus returns to trigger.
- Live regions for toasts and async results.
- Images: meaningful alt text (listing photos: "{title} — {vendor}"); decorative images `alt=""`.
- Language: `lang="en-GB"`; British spellings in UI copy (Organisation, verified, etc.) **[Confirmed convention]**.
- Automated checks (axe via Playwright) in CI on new pages **[Recommended]**.
