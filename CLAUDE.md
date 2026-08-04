# FarmNomad Claude Handoff

This repository is shared with Codex at:

`C:\Users\user\OneDrive\Documents\Farm nomad rebuild`

Use this file as the quick entry point when opening the project in Claude. The canonical agent instructions remain in `AGENTS.md`; read that file before making changes.

## Required Reading

Before editing code, read these in order:

1. `AGENTS.md`
2. `README.md`
3. `docs/DECISIONS.md`
4. `docs/ARCHITECTURE.md`
5. Relevant work-area docs:
   - Product/scope: `docs/PRD.md`
   - Frontend: `docs/DESIGN-SYSTEM.md` and `docs/USER-FLOWS.md`
   - Backend/API: `docs/API-SPEC.md`
   - Data: `docs/DATABASE-SCHEMA.md`
6. `docs/IMPLEMENTATION-PLAN.md`

The code is the source of truth when docs and implementation disagree. Reconcile by inspecting the code first, then update docs when a change alters an endpoint, table, user flow, or decision.

## Previewing the Web App

From the repository root:

```powershell
npm run dev
```

Or from the web workspace:

```powershell
cd web
npm run dev -- --hostname 127.0.0.1 --port 5174
```

Open the URL printed by Next.js. A known-good local URL used by Codex is:

`http://127.0.0.1:5174`

Useful preview routes:

- `/`
- `/market`
- `/market/listing-carrots`
- `/producers/vendor-northfield`
- `/login`
- `/register`
- `/dashboard`
- `/listings`
- `/listings/new`
- `/listings/listing-carrots/edit`
- `/orders`
- `/orders/order-1001`
- `/organisation/requests`
- `/admin/users`
- `/admin/listings`
- `/admin/orders`
- `/admin/deliveries`
- `/settings`

## Verification Commands

From the repository root:

```powershell
npm run lint
npm run build
npm run test
npm run test:e2e
```

Backend tests:

```powershell
cd backend
.\mvnw test
```

Run only the checks relevant to the files you changed, unless the change touches shared behavior.

## Coordination Notes

- Do not edit the same file concurrently in Claude and Codex.
- Check `git status --short` before editing and preserve unrelated user/Codex changes.
- Use Conventional Commits if asked to commit.
- Do not commit secrets. Treat any credential in code or history as compromised.
- Roles are exactly `FARMER`, `KITCHEN`, `ORGANISATION`, `CUSTOMER`, `DRIVER`, `ADMIN`.
- Brand spelling is `FarmNomad`. Any surviving `AgroRoute`, `agriroute`, or `FOODBANK` reference is a bug.

## Figma Note

The Figma connector is session-specific and is not stored in this folder. Claude can preview and edit the code from this shared project folder, but Figma control requires Claude's own Figma integration and edit access to the FarmNomad Figma file.
