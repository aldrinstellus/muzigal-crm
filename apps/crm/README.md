# Muzigal CRM

Custom music academy CRM built for [Muzigal](https://muzigal.com), Whitefield, Bangalore. React + TypeScript + Tailwind CSS on Vercel, backed by Google Apps Script + Google Sheets. Zero infrastructure cost.

**Live**: [zoo-crm-app.vercel.app](https://zoo-crm-app.vercel.app)

---

## Features

- **Dashboard** -- Key metrics, enrollment trends, revenue charts, and upcoming classes at a glance
- **Student Management** -- Full student directory with search, filtering, and contact details
- **Teacher Management** -- Teacher profiles, instrument assignments, and schedule overview
- **Class Management** -- Create and manage classes by instrument, grade level, and time slot
- **Enrollment Pipeline** -- Track inquiries from initial contact through trial class to active enrollment
- **Attendance Tracking** -- Mark and review attendance per class with visual summaries
- **Payment Tracking** -- Fee collection, payment history, outstanding balances, and receipt generation
- **Reports** -- Attendance summaries, enrollment stats, and revenue breakdowns with Recharts visualizations
- **Public Enrollment Form** -- Parent-facing form at the root URL for new student registration
- **WhatsApp Integration** -- Automated class notifications via the backend system (schedule changes, reminders, broadcasts)

---

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Login | `/` | Redirects to login — entry point |
| Login | `/login` | Admin sign-in (Production or Demo mode) |
| Public Enrollment | `/enroll` | Parent-facing enrollment form |
| Dashboard | `/admin` | Overview with charts and key metrics |
| Students | `/admin/students` | Student directory and management |
| Teachers | `/admin/teachers` | Teacher profiles and assignments |
| Classes | `/admin/classes` | Class scheduling and management |
| Enrollment | `/admin/enrollment` | Enrollment pipeline and tracking |
| Attendance | `/admin/attendance` | Attendance marking and history |
| Payments | `/admin/payments` | Fee tracking and payment records |
| Reports | `/admin/reports` | Visual reports and analytics |
| Settings | `/admin/settings` | System configuration |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Build tool | Vite |
| Charts | Recharts |
| Icons | lucide-react |
| Hosting | Vercel |
| Backend | Google Apps Script + Google Sheets ([repo](https://github.com/aldrinstellus/zoo-crm (apps/backend))) |
| Testing | Vitest + React Testing Library |

---

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

The dev server starts at `http://localhost:5173`. The app uses mock data in development -- no backend connection required.

---

## Demo vs Production Mode

The app supports runtime mode switching — no rebuild required.

| Mode | Data | Login credentials |
|------|------|-------------------|
| **Demo** | Fake / mock data | `demo@zoo.crm` / `demo` |
| **Production** | Real Google Sheet | Credentials from Users sheet in GAS backend |

**To switch modes:**
- Toggle on the `/login` page
- Or use URL params: `/login?mode=demo` or `/login?mode=prod`
- Choice is persisted in localStorage

A **Demo** badge appears in the top bar when running in demo mode.

---

## Test Coverage

**109 tests** passing across **4 test suites**, covering **5 personas**:

| Persona | Role | Tests |
|---------|------|-------|
| Receptionist | Enrollment intake, student registration | Enrollment form, student CRUD |
| Teacher | Class management, attendance marking | Attendance workflows, class views |
| Owner | Financial oversight, reports | Payment tracking, revenue reports |
| Parent | Public enrollment | Enrollment form submission |
| Admin | Full system access, settings | All pages, configuration |

See [docs/PERSONAS-AND-TEST-CASES.md](docs/PERSONAS-AND-TEST-CASES.md) for the full test plan.

---

## File Structure

```
muzigal-crm/
  src/
    api/            # API client and endpoint definitions
    assets/         # Static assets
    auth/           # Authentication utilities
    components/     # Reusable UI components
    hooks/          # Custom React hooks
    lib/            # Shared utilities and helpers
    pages/
      index.tsx     # Public enrollment form
      admin/        # 9 admin pages (dashboard, students, teachers, etc.)
      portal/       # Portal pages
    __mocks__/      # Mock data for development and testing
    __tests__/      # Test suites (4 files, 109 tests)
    App.tsx         # Root component with routing
    main.tsx        # Entry point
  docs/             # Documentation
  public/           # Static public assets
```

---

## System Overview

This is the frontend half of a two-repo system:

| Repo | Purpose | LOC |
|------|---------|-----|
| [whatsapp-class-notifications](https://github.com/aldrinstellus/zoo-crm (apps/backend)) | Backend -- Google Apps Script, WhatsApp API, 25+ REST endpoints | 4,115 |
| **muzigal-crm** (this repo) | Frontend -- React CRM dashboard and public enrollment | 2,614 |
| **Total** | | **6,729** |

---

## Cost

| Component | Monthly Cost |
|-----------|-------------|
| Vercel hosting | Rs. 0 |
| Vercel Serverless Functions | Rs. 0 |
| Google Apps Script backend | Rs. 0 |
| Google Sheets database | Rs. 0 |
| **Infrastructure total** | **Rs. 0/month** |

WhatsApp message delivery is the only variable cost (~Rs. 0.35 per message).

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

Built by **Aldrin Stellus** for **Muzigal**, Bangalore
