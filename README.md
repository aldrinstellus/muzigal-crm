# ZOO CRM

Generic CRM platform for academies, schools, and training centers. Zero infrastructure cost (Google Apps Script + Google Sheets backend, Vercel frontend).

## Monorepo Structure

```
zoo-crm/
├── package.json             npm workspaces root
├── apps/
│   ├── crm/                 React + Vite CRM frontend (Vercel)
│   ├── muzigal-borewell/    Muzigal docs portal (Vercel)
│   ├── backend/             Google Apps Script backend (clasp)
│   └── kidzee-polichalur/   Next.js preschool activity platform (Vercel)
│
└── packages/
    ├── design-tokens/       @zoo/design-tokens — master CSS variables + client themes
    │   ├── base.css         Unstyled foundation (~120 CSS variables)
    │   ├── shadcn-bridge.css Maps zoo tokens → shadcn/ui variable names
    │   ├── index.css        Barrel: base + bridge
    │   └── themes/          Client brand overrides (~20 vars each)
    │       ├── _template.css  Copy this for new clients
    │       ├── default.css    Neutral unbranded theme
    │       ├── muzigal.css    Navy + Blue, Inter, sharp radius
    │       └── kidzee.css     Purple + Yellow, Fredoka, round radius
    │
    └── ui/                  @zoo/ui — shared React component library
        ├── globals.css      Design tokens + Tailwind @theme inline block
        └── src/
            ├── index.ts     Barrel export
            ├── lib/utils.ts cn() + statusColor() utilities
            └── components/  Card, StatCard, Badge, Table, Modal
```

## Design System

Three-layer CSS variable cascade for white-labeling:

```
Layer 1: base.css      →  120 neutral CSS variables (foundation)
Layer 2: theme.css     →  ~20 brand overrides per client
Layer 3: bridge.css    →  Maps zoo tokens → shadcn/ui names
```

**Import chain per app:**
```css
@import "tailwindcss";
@import "@zoo/ui/globals.css";                    /* base + bridge + @theme */
@import "@zoo/design-tokens/themes/muzigal";      /* brand overrides */
```

Change one theme import → entire app rebrands. See `packages/design-tokens/DESIGN-SYSTEM.md` for full docs.

## Apps

### CRM Frontend (`apps/crm/`)
React 19 + TypeScript + Tailwind CSS + Vite. 10 admin pages, public enrollment form, demo mode. Imports shared components from `@zoo/ui`.

```bash
cd apps/crm
npm run dev        # localhost:5173
npm run build      # production build
npm run test       # 109 tests
```

**Deploy:** Vercel — https://zoo-crm-app.vercel.app

### Muzigal Docs Portal (`apps/muzigal-borewell/`)
Next.js 16 + Supabase. Access-controlled docs with admin approval workflow.

```bash
cd apps/muzigal-borewell
npm run dev        # localhost:3000
npm run build
```

**Deploy:** Vercel — https://muzigal-zoo.vercel.app

### Backend (`apps/backend/`)
Google Apps Script — 12 files, 4,100+ LOC. CRUD, auth (JWT), payments (Razorpay), WhatsApp notifications, reporting.

```bash
cd apps/backend
clasp push         # deploy to Google Apps Script
clasp open         # open in browser
```

**Deploy:** Google Apps Script web app

### Kidzee Polichalur (`apps/kidzee-polichalur/`)
Next.js 16 preschool activity platform. Public activity listing, admin dashboard, year-based browsing.

```bash
cd apps/kidzee-polichalur
npm run dev        # localhost:3000
npm run build
```

**Deploy:** Vercel — https://kidzee-polichalur.vercel.app

## Customers

1. **Muzigal** — Music academy, Whitefield, Bangalore. Contacts: Cecil & Giri.
2. **Kidzee Polichalur** — Preschool, Polichalur, Chennai. Contact: Imtiaz.

## Tech Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| Frontend | React, Vite, Tailwind | Free (Vercel) |
| Backend | Google Apps Script | Free |
| Database | Google Sheets | Free |
| Docs | Next.js, Supabase | Free (Vercel + Supabase free tier) |
| Design System | @zoo/design-tokens + @zoo/ui | Workspace packages |
| Payments | Razorpay | Per-transaction |
| Notifications | WhatsApp Cloud API | Per-message |

## Development

```bash
# Install all workspace dependencies from root
npm install

# Workspace packages are auto-linked:
#   @zoo/design-tokens → packages/design-tokens
#   @zoo/ui            → packages/ui
```
