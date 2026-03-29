# ZOO CRM

Generic CRM platform for academies, schools, and training centers. Zero infrastructure cost (Google Apps Script + Google Sheets backend, Cloudflare Pages frontend).

## Monorepo Structure

```
apps/
├── crm/        React + Vite frontend (Cloudflare Pages)
├── docs/       Next.js documentation portal (Vercel)
└── backend/    Google Apps Script backend (clasp)
```

## Apps

### CRM Frontend (`apps/crm/`)
React 19 + TypeScript + Tailwind CSS + Vite. 10 admin pages, public enrollment form, demo mode.

```bash
cd apps/crm
npm install
npm run dev        # localhost:5173
npm run build      # production build
npm run test       # 109 tests
```

**Deploy:** Cloudflare Pages — https://zoo-crm.pages.dev

### Documentation Portal (`apps/docs/`)
Next.js 16 + Supabase. Access-controlled docs with admin approval workflow.

```bash
cd apps/docs
npm install
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

## Current Customer

**Muzigal** — Music academy, Whitefield, Bangalore. Contacts: Cecil & Giri.

## Tech Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| Frontend | React, Vite, Tailwind | Free (Cloudflare Pages) |
| Backend | Google Apps Script | Free |
| Database | Google Sheets | Free |
| Docs | Next.js, Supabase | Free (Vercel + Supabase free tier) |
| Payments | Razorpay | Per-transaction |
| Notifications | WhatsApp Cloud API | Per-message |
