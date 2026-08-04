# FarmNomad Responsive Viewport Checklist

Use this checklist before calling FarmNomad frontend UI work complete.

## Required Widths

Validate changed routes and important states at these widths, adjusting height to expose realistic content:

- 320px: minimum supported phone width.
- 375px: common small phone.
- 390px or 414px: modern phone.
- 640px: Tailwind `sm` boundary.
- 768px: tablet and platform-shell transition point.
- 1024px: laptop/tablet landscape.
- 1280px: desktop content max-width pressure.
- 1440px: wide desktop.

If time is tight, never skip 320px, 768px, 1024px, and 1440px.

## Global Checks

- No horizontal page overflow unless the component is intentionally horizontally scrollable and visibly supports it.
- Page gutters are present at small widths and content aligns cleanly at desktop widths.
- Text does not overlap, clip, or disappear inside buttons, cards, filters, table cells, badges, or nav.
- Images and media keep stable aspect ratios and do not push layout unexpectedly.
- Sticky headers, sidebars, drawers, and bottom actions do not cover important content.
- Loading, empty, error, and success states remain readable at each breakpoint.

## Public Market And Listing Pages

- Search, filters, sort, pagination, and listing cards are usable at 320px.
- Filter UI collapses into an accessible drawer or compact pattern on mobile.
- Returning from listing detail preserves search, filter, pagination, and scroll position.
- Listing cards retain image, title, price, quantity, vendor/location, and primary action hierarchy without crowding.
- Listing detail pages keep the primary image, title, price/quantity, vendor context, and CTA visible in a sensible order.
- Public pages remain light: avoid turning server-rendered market surfaces into unnecessary client-heavy UI.

## Platform And Dashboard Pages

- Sidebar collapses or becomes a drawer where needed; navigation remains keyboard reachable.
- Tables collapse, scroll, or convert to cards without hiding critical actions.
- TopBar content does not collide with page titles, actions, notification controls, or account controls.
- Forms keep labels, errors, hints, and action buttons close to their controls at mobile widths.
- Modals and drawers fit within the viewport and trap focus correctly.

## Keyboard And Focus

- Tab order follows the visual/task order.
- Every interactive element is reachable by keyboard.
- Focus states are visible at every breakpoint and not clipped by overflow containers.
- Escape closes modals/drawers/menus and returns focus to the trigger.
- Form validation errors are linked to inputs and announced through accessible error wiring.

## Browser Validation

- Use Playwright or browser inspection against the running app.
- Capture screenshots for important changed routes at representative mobile, tablet, desktop, and wide desktop widths.
- Inspect the DOM/CSS for token usage if visual values look one-off.
- Exercise real interactions: open filters, submit forms, navigate to details, go back, paginate, and trigger empty/error states where feasible.
- Check console output for runtime errors and hydration warnings.

## Quality Gates

Run the actual repo scripts for:

- lint
- typecheck
- unit tests
- relevant Playwright tests
- build

If any command does not exist or cannot run in the current environment, record the exact command attempted, the failure reason, and what validation remains unproven.
