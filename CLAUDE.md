# ZOO CRM — Claude Code Instructions

## Monorepo Architecture
- **Root**: npm workspaces (`apps/*`, `packages/*`)
- **Apps**: `apps/crm/` (Vite+React), `apps/muzigal-borewell/` (Next.js 16), `apps/kidzee-polichalur/` (Next.js 16), `apps/backend/` (Google Apps Script)
- **Packages**: `@zoo/design-tokens` (pure CSS), `@zoo/ui` (shared React components)

## Design System Rules
1. **Never hardcode hex in components** — use `var(--color-*)` or Tailwind semantic classes (`bg-primary`, `text-foreground`, etc.)
2. **Theme overrides are thin** — ~20 vars per client, everything else inherited from `base.css`
3. **Import chain**: `@import "tailwindcss"` → `@import "@zoo/ui/globals.css"` → `@import "@zoo/design-tokens/themes/<client>"`
4. **shadcn-bridge.css** maps `--color-primary` → `--primary` so shadcn/Tailwind classes work automatically
5. **New client** = copy `packages/design-tokens/themes/_template.css`, override ~20 vars

## Shared Components (@zoo/ui)
- Card, StatCard, Badge, Table, Modal — all use semantic tokens
- `cn()` from `@zoo/ui` (clsx + tailwind-merge)
- App-specific components (Sidebar, TopBar, AppShell) stay in each app

## Build Commands
```bash
# From root — install all workspace deps
npm install

# Per-app
cd apps/crm && npm run build && npm test    # 109 tests
cd apps/kidzee-polichalur && npm run build
cd apps/muzigal-borewell && npm run build
```

## Key Conventions
- CRM uses Vite + React Router (not Next.js)
- Muzigal & Kidzee use Next.js 16 (breaking changes — check `node_modules/next/dist/docs/`)
- Backend is Google Apps Script (clasp deploy)
- All apps deploy to Vercel separately (each client = separate deployment)
