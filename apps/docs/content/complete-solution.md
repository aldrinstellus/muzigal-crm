---
pdf_options:
  format: A4
  margin:
    top: 25mm
    right: 20mm
    bottom: 25mm
    left: 20mm
  printBackground: true
  displayHeaderFooter: true
  headerTemplate: '<div style="font-size:8px;color:#999;width:100%;text-align:right;margin-right:20mm;">Muzigal — Complete Solution Overview</div>'
  footerTemplate: '<div style="font-size:8px;color:#999;width:100%;text-align:center;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>'
css: |-
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  body { font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; color: #1a1a2e; line-height: 1.7; font-size: 11pt; }
  h1 { color: #1a1a2e; font-weight: 700; font-size: 22pt; border-bottom: 2px solid #16213e; padding-bottom: 6px; margin-top: 36px; }
  h2 { color: #16213e; font-weight: 600; font-size: 15pt; border-bottom: 1px solid #e0e0e0; padding-bottom: 4px; margin-top: 28px; }
  h3 { color: #2d3748; font-weight: 600; font-size: 12pt; margin-top: 20px; }
  table { border-collapse: collapse; width: 100%; margin: 14px 0; font-size: 9.5pt; }
  th { background-color: #1a1a2e; color: #fff; padding: 8px 10px; text-align: left; font-weight: 600; }
  td { border: 1px solid #ddd; padding: 7px 10px; }
  tr:nth-child(even) { background-color: #f8f9fa; }
  code { background-color: #f0f0f0; padding: 1px 5px; border-radius: 3px; font-size: 9.5pt; color: #c7254e; }
  pre { background-color: #1a1a2e; color: #e8e8e8; padding: 14px; border-radius: 5px; font-size: 8.5pt; overflow-x: auto; line-height: 1.5; }
  pre code { background: none; color: inherit; padding: 0; }
  blockquote { border-left: 4px solid #25D366; margin: 14px 0; padding: 10px 16px; background: #f0faf0; color: #1a1a2e; font-style: normal; border-radius: 0 6px 6px 0; }
  .page-break { page-break-before: always; }
  .cover { text-align: center; padding-top: 160px; page-break-after: always; }
  .cover h1 { font-size: 30pt; border: none; color: #1a1a2e; margin-bottom: 4px; letter-spacing: -0.5px; }
  .cover .subtitle { font-size: 14pt; color: #555; font-weight: 300; margin-bottom: 20px; }
  .cover .tagline { font-size: 11pt; color: #777; font-weight: 300; margin-bottom: 50px; font-style: italic; }
  .cover .divider { width: 60px; height: 3px; background: #16213e; margin: 30px auto; }
  .cover .meta { font-size: 10.5pt; color: #444; line-height: 2; }
  .cover .meta strong { color: #1a1a2e; }
  .stat-grid { display: flex; gap: 16px; margin: 16px 0; }
  .stat-box { flex: 1; background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 6px; padding: 12px; text-align: center; }
  .stat-box .num { font-size: 20pt; font-weight: 700; color: #1a1a2e; }
  .stat-box .label { font-size: 8.5pt; color: #666; margin-top: 2px; }
  .highlight-box { background: #f0f4ff; border: 1px solid #d0d8e8; border-radius: 6px; padding: 16px; margin: 16px 0; }
  .flow-box { background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 6px; padding: 14px 16px; margin: 12px 0; }
---

<div class="cover">

# Muzigal Complete Solution

<div class="subtitle">CRM + WhatsApp Notification Platform</div>

<div class="tagline">One system to manage students, classes, payments, and communication</div>

<div class="divider"></div>

<div class="meta">

**Prepared by** Aldrin Stellus

**Prepared for** Cecil & Giri — Muzigal

Borewell Road, Whitefield, Bangalore

<br/>

**Date** March 2026 &nbsp;&nbsp;|&nbsp;&nbsp; **Version** 2.0

</div>

</div>

# 1. Executive Summary

What started as an automated WhatsApp notification system has grown into a **complete academy management platform** for Muzigal. The solution now has two parts that work together:

| Component | What It Does | Access |
|-----------|-------------|--------|
| **Muzigal CRM** | Web-based dashboard for managing students, classes, teachers, payments, enrollment, attendance, and reports | [zoo-crm-app.vercel.app](https://zoo-crm-app.vercel.app) |
| **WhatsApp Notifications** | Automated class reminders, instant schedule change alerts, emergency broadcasts — all via WhatsApp | Google Sheet + auto-triggers |

Together, they give Muzigal a **zero-cost infrastructure** management system that handles everything from a parent's first enquiry to daily class reminders — without needing any commercial software subscriptions.

### The Platform at a Glance

<div class="stat-grid">
<div class="stat-box"><div class="num">6,729</div><div class="label">Total Lines of Code</div></div>
<div class="stat-box"><div class="num">34</div><div class="label">Source Files</div></div>
<div class="stat-box"><div class="num">109</div><div class="label">Tests Passing</div></div>
<div class="stat-box"><div class="num">10</div><div class="label">CRM Pages</div></div>
</div>

<div class="stat-grid">
<div class="stat-box"><div class="num">25+</div><div class="label">API Endpoints</div></div>
<div class="stat-box"><div class="num">7</div><div class="label">WhatsApp Message Types</div></div>
<div class="stat-box"><div class="num">5</div><div class="label">User Personas Tested</div></div>
<div class="stat-box"><div class="num">₹0</div><div class="label">Monthly Infrastructure</div></div>
</div>

<div class="page-break"></div>

# 2. The Two Systems — How They Fit Together

The CRM is the **brain** — it's where you manage the academy. WhatsApp notifications are the **voice** — they keep students informed automatically.

```
┌─────────────────────────────────────────────────────────────┐
│                      MUZIGAL CRM                             │
│              (Web App — zoo-crm-app.vercel.app)                   │
│                                                              │
│   Dashboard  Students  Teachers  Classes  Enrollment         │
│   Attendance  Payments  Reports  Settings                    │
│   Public Enrollment Form (parent-facing)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │  25+ REST API Endpoints
                       │
┌──────────────────────▼──────────────────────────────────────┐
│               GOOGLE APPS SCRIPT BACKEND                     │
│              (Shared Backend for Both Systems)                │
│                                                              │
│   12 Script Files  •  4,115 Lines of Code                    │
│   Student CRUD  •  Class Management  •  Payment Tracking     │
│   Enrollment Pipeline  •  Attendance  •  Reports             │
│   WhatsApp Sender  •  Message Composer  •  Schedule Watcher  │
└──────────────────────┬──────────────────────────────────────┘
                       │
            ┌──────────┼──────────┐
            │          │          │
            ▼          ▼          ▼
     ┌───────────┐ ┌────────┐ ┌──────────┐
     │  GOOGLE   │ │WHATSAPP│ │ CLAUDE   │
     │  SHEETS   │ │ CLOUD  │ │ AI       │
     │  (Data)   │ │ API    │ │(Optional)│
     └───────────┘ └────┬───┘ └──────────┘
                        │
                        ▼
                  ┌───────────┐
                  │ STUDENTS  │
                  │ (WhatsApp │
                  │  on phone)│
                  └───────────┘
```

### Key Integration Points

| CRM Action | WhatsApp Result |
|------------|----------------|
| Teacher changed in class schedule | All students in that class get a WhatsApp alert instantly |
| Class cancelled or rescheduled | Affected students are notified within seconds |
| Room or time updated | Students receive updated details via WhatsApp |
| New student enrolled via CRM or public form | Student is registered and starts receiving daily reminders |
| Emergency broadcast sent | All students (or a specific class) get a custom WhatsApp message |

**The CRM manages the data. WhatsApp delivers the communication. Both share the same backend and data source.**

<div class="page-break"></div>

# 3. Muzigal CRM — The Management Dashboard

The CRM is a modern web application accessible from any browser — desktop, tablet, or phone. It's hosted on Vercel at zero cost.

**Live URL**: [zoo-crm-app.vercel.app](https://zoo-crm-app.vercel.app)

### 10 Admin Pages

| Page | What It Does |
|------|-------------|
| **Dashboard** | Key metrics at a glance — active students, revenue, enrollments, upcoming classes, and recent activity |
| **Students** | Full student directory with search, filters, contact details, class assignments, and status management |
| **Teachers** | Teacher profiles, instrument assignments, schedule overview, and guest teacher management |
| **Classes** | Create and manage classes by instrument, grade level, time slot, studio, and capacity |
| **Enrollment** | Pipeline tracking from first enquiry through demo class to active enrollment — drag-and-drop stages |
| **Attendance** | Mark daily attendance (Present / Absent / Late) per class with visual summaries and history |
| **Payments** | Fee collection, payment history, outstanding balances, overdue tracking, and receipt generation |
| **Reports** | Visual charts for attendance trends, enrollment stats, revenue breakdowns, and teacher utilization |
| **Settings** | System configuration — WhatsApp credentials, school name, timezone, AI toggle |
| **Public Enrollment** | Parent-facing form (no login needed) for new student registration — accessible at `/enroll` |

### Who Uses What

| Person | Role | CRM Pages They Use |
|--------|------|-------------------|
| **Cecil / Giri** (Owners) | Full oversight | Dashboard, Reports, Payments, Students, Settings, WhatsApp broadcasts |
| **Receptionist** (Front Desk) | Daily operations | Enrollment, Students, Classes — handle walk-ins, lookups, registrations |
| **Teachers** (Cecil, Giri, Lakshmi) | Class management | Attendance, Classes, Students — mark attendance, view enrolled students |
| **Parents** | External | Public Enrollment Form only — submit enrollment, no login required |
| **Admin** (Aldrin) | Technical | Settings, Dashboard — configuration, health monitoring |

### Demo Mode

The CRM has a built-in **Demo Mode** so you can explore all features with sample data — no risk of affecting real data.

| Mode | How to Access | Data |
|------|--------------|------|
| **Demo** | Toggle on login page, or visit `/login?mode=demo` | Realistic fake data — 10 students, 7 classes, 3 teachers |
| **Production** | Toggle on login page, or visit `/login?mode=prod` | Live data from Google Sheets |

A "Demo" badge appears in the top bar when demo mode is active. Switch freely between modes — no rebuild needed.

<div class="page-break"></div>

# 4. WhatsApp Notifications — Automated Communication

The WhatsApp system runs entirely through Google Sheets. Staff edit the spreadsheet; students receive WhatsApp messages automatically.

### What Gets Sent Automatically

| Trigger | What Happens | Example Message |
|---------|-------------|-----------------|
| **Every morning at 8 AM** | Each student gets their class schedule for the day | "Hi Priya, today at Muzigal: Guitar Practice with Mr. Cecil in Studio A at 10:00. Have a great session!" |
| **Teacher changed** | Staff edits the Teacher cell in the Schedule tab | "Your Guitar Practice class now has Mr. Giri instead of Mr. Cecil." |
| **Room changed** | Staff edits the Room cell | "Guitar Practice has moved to Studio C. See you at 10:00!" |
| **Time changed** | Staff edits the Time cell | "Guitar Practice has been shifted to 11:30 today." |
| **Date changed** | Staff edits the Date cell | "Guitar Practice has been rescheduled to March 28." |
| **Class cancelled** | Staff changes Status to "Cancelled" | "Guitar Practice for today has been cancelled. We'll update you on the next session." |
| **Emergency broadcast** | Sent via API or Settings page | "Muzigal will be closed tomorrow for Ugadi. Happy Ugadi!" |

### How It Works for Staff

**It takes 10 seconds of effort. Change one cell. Students are notified.**

1. Open the Google Sheet
2. Go to the **Schedule** tab
3. Edit a teacher name, room, time, or status
4. Press Enter
5. Students get a WhatsApp message within seconds

That's it. No app to open. No message to type. No group to manage. The system handles everything.

### Daily Workflow

| When | What Staff Does | What the System Does |
|------|----------------|---------------------|
| **Morning** | Nothing — verify today's schedule is correct | Sends 8 AM daily reminders to all students automatically |
| **During the day** | Edit schedule cells if anything changes | Sends instant WhatsApp alerts for every change |
| **Sunday evening** | Add next week's schedule rows | Ready for Monday morning reminders |
| **Weekly** | Check the Log tab for delivery failures | Logs every message with delivery status |

### AI-Powered Messages (Optional)

When enabled, Claude AI composes natural, warm messages instead of rigid templates:

| Without AI | With AI |
|-----------|---------|
| "Schedule change: Teacher for Guitar Practice changed from Mr. Cecil to Mr. Giri." | "Hi Priya, heads up — your Guitar Practice class now has Mr. Giri instead of Mr. Cecil. Same time and studio. See you there!" |

Toggle AI on or off in the CRM Settings page or the Google Sheet Config tab. The system works perfectly with or without it.

<div class="page-break"></div>

# 5. Complete Feature List

### CRM Features

| Category | Features |
|----------|---------|
| **Student Management** | Add/edit/deactivate students, search by name or phone, filter by class or status, view contact details and history |
| **Teacher Management** | Teacher profiles, instrument assignments, schedule overview, add guest/substitute teachers |
| **Class Management** | Create classes by instrument and grade, assign teachers and studios, set capacity and fees, manage time slots |
| **Enrollment Pipeline** | Track enquiries from first contact through demo class to active enrollment, move between stages |
| **Attendance** | Mark Present/Absent/Late per class per day, view attendance history, visual summaries |
| **Payments** | Record payments (UPI, Cash, Razorpay), track overdue balances, view payment history, generate receipts |
| **Reports & Analytics** | Revenue charts, enrollment trends, attendance summaries, teacher utilization — all with interactive Recharts visualizations |
| **Dashboard** | Key metrics, upcoming classes, recent activity, enrollment stats — all on one page |
| **Settings** | Manage WhatsApp credentials, school name, timezone, AI toggle, daily reminder time |
| **Public Enrollment Form** | Parent-facing, no login required — collects student name, age, instrument preference, parent contact |

### WhatsApp Features

| Category | Features |
|----------|---------|
| **Daily Reminders** | Automated 8 AM schedule for every student, combined message if multiple classes |
| **Real-Time Alerts** | Instant notification for teacher, room, time, date, or status changes — triggered by spreadsheet edits |
| **Emergency Broadcasts** | Custom messages to all students, a specific class, or an individual |
| **Delivery Tracking** | Full audit log — timestamp, student, message type, delivery status, WhatsApp confirmation ID |
| **Phone Format Handling** | Accepts any Indian format (10-digit, +91, 0-prefix) — auto-normalizes |
| **Rate Limiting** | 200ms spacing between messages to prevent API throttling |
| **AI Composition** | Optional Claude AI for natural, personalized message tone |
| **Fallback Templates** | 7 hardcoded templates when AI is disabled or unavailable |

<div class="page-break"></div>

# 6. Technology & Architecture

### Tech Stack

| Layer | Technology | Cost |
|-------|-----------|------|
| **CRM Frontend** | React 19, TypeScript, Tailwind CSS, Vite, Recharts | Free |
| **CRM Hosting** | Vercel | Free |
| **Backend** | Google Apps Script (12 files, 4,115 LOC) | Free |
| **Database** | Google Sheets (10 tabs) | Free |
| **WhatsApp** | Meta Cloud API v19.0 | ~₹0.35/message |
| **AI (Optional)** | Claude Sonnet (Anthropic) | ~₹0.18/message |
| **Testing** | Vitest + React Testing Library (109 tests) | Free |

### Codebase Breakdown

| Component | Files | Lines of Code | Purpose |
|-----------|-------|--------------|---------|
| CRM Frontend | 22 React/TS files | 2,614 | Dashboard, 10 admin pages, public enrollment |
| Backend | 12 GAS files | 4,115 | API endpoints, WhatsApp, data management |
| **Total** | **34 files** | **6,729** | |

### Data Storage (Google Sheets)

| Tab | Used By | Purpose |
|-----|---------|---------|
| Students | CRM + WhatsApp | Student directory and contact info |
| Schedule | CRM + WhatsApp | Class timetable — edits trigger WhatsApp |
| Classes | CRM | Class definitions (instrument, grade, fee, capacity) |
| Teachers | CRM | Teacher profiles and assignments |
| Payments | CRM | Payment records and balances |
| Enrollment | CRM | Pipeline tracking (enquiry → enrolled) |
| Attendance | CRM | Daily attendance records |
| Config | Both | System settings (API keys, school name, timezone) |
| Log | WhatsApp | Message delivery audit trail |
| Overrides | WhatsApp | Emergency/custom message history |

<div class="page-break"></div>

# 7. Costing

### Infrastructure: ₹0/month

| Component | Monthly Cost |
|-----------|-------------|
| Vercel (CRM hosting) | ₹0 |
| Vercel Serverless Functions (API proxy) | ₹0 |
| Google Apps Script (backend) | ₹0 |
| Google Sheets (database) | ₹0 |
| **Infrastructure total** | **₹0/month** |

### Operating Costs (WhatsApp Messages Only)

The only recurring cost is WhatsApp message delivery at ~₹0.35 per message (India pricing).

| Academy Size | Daily Messages | Monthly Cost | Annual Cost |
|-------------|---------------|-------------|------------|
| 25 students | 25 | ₹263 | ₹3,150 |
| 50 students | 50 | ₹525 | ₹6,300 |
| 100 students | 100 | ₹1,050 | ₹12,600 |
| 200 students | 200 | ₹2,100 | ₹25,200 |

*Optional Claude AI adds ~₹0.18/message. Can be toggled off at any time.*

### Comparison: This Solution vs. Commercial Platforms

| What You'd Need | Commercial Route (Annual) | This Solution (Annual) |
|----------------|--------------------------|----------------------|
| CRM / Student Management | ₹24,000 – ₹60,000 (Classplus, LeadSquared) | **₹0** |
| WhatsApp Automation | ₹12,000 – ₹30,000 (Wati, Interakt) | **₹6,300** (messages only) |
| Attendance Tracking | Often separate tool or premium tier | **Included** |
| Payment Management | Often separate tool | **Included** |
| Enrollment Pipeline | Often premium CRM feature | **Included** |
| Reports & Analytics | Often premium tier | **Included** |
| **Annual Total** | **₹36,000 – ₹90,000+** | **₹6,300** |

**Savings: ₹30,000 – ₹84,000 per year** compared to commercial platforms, with full ownership and customization.

<div class="page-break"></div>

# 8. Real Workflows — How Muzigal Uses This Daily

### Scenario 1: A New Student Walks In

<div class="flow-box">

1. **Parent** fills out the enrollment form at `zoo-crm-app.vercel.app/enroll` (or receptionist fills it in)
2. **Receptionist** sees the enquiry in the CRM Enrollment Pipeline
3. **Receptionist** schedules a demo class, moves the lead to "Demo Scheduled"
4. **Teacher** runs the trial session, marks attendance in the CRM
5. **Owner** converts the enquiry to an enrolled student
6. **System** adds the student to the Google Sheet — they start receiving daily WhatsApp reminders
7. **First payment** recorded in the CRM Payments page

</div>

### Scenario 2: A Teacher Calls in Sick

<div class="flow-box">

1. **Mr. Cecil** calls in sick at 7:30 AM
2. **Giri** opens the Google Sheet, changes the Teacher column from "Mr. Cecil" to "Mr. Giri" for today's Guitar class
3. **Within seconds**, all Guitar students receive a WhatsApp: *"Hi Priya, your Guitar Practice class now has Mr. Giri instead of Mr. Cecil. Same time and studio."*
4. If one class must be cancelled, Giri changes Status to "Cancelled" — students are notified instantly
5. The **CRM Dashboard** reflects the updated schedule

</div>

### Scenario 3: Month-End Fee Collection

<div class="flow-box">

1. **Owner** opens the CRM Payments page — sees all outstanding balances at a glance
2. Overdue payments are highlighted — sorted by student and amount
3. **Receptionist** collects cash from a walk-in parent, records it in the CRM
4. For remote parents, the system can send a WhatsApp reminder with a payment link
5. **Reports page** shows the monthly revenue breakdown by payment method (UPI, Cash, Razorpay)

</div>

### Scenario 4: Holiday Closure

<div class="flow-box">

1. **Owner** decides to close for Ugadi
2. Sends an emergency broadcast: *"Muzigal will be closed tomorrow for Ugadi. Classes resume Thursday. Happy Ugadi!"*
3. **Every active student** receives the WhatsApp message within seconds
4. The Overrides tab logs who sent it, when, and to whom

</div>

<div class="page-break"></div>

# 9. Testing & Quality

The system has been tested across **5 personas** covering every role that interacts with the platform.

### Test Coverage

| Suite | Tests | What It Covers |
|-------|-------|---------------|
| Mock API Unit Tests | 30 | CRUD operations for all 8 data entities |
| Utility Tests | 22 | Currency formatting, date handling, phone normalization, badges |
| UAT Scenarios | 16 | 11 end-to-end business scenarios |
| Persona Tests | 41 | 5 personas + 3 cross-persona workflows |
| **Total** | **109** | **Full coverage** |

### Personas Tested

| Persona | Key Tests |
|---------|----------|
| **Receptionist** | Walk-in handling, student search, demo scheduling, registration |
| **Teacher** | View assigned classes, mark attendance, view enrolled students |
| **Owner** | Dashboard stats, revenue tracking, WhatsApp broadcasts, reports |
| **Parent** | Public enrollment form, payment history |
| **Admin** | Health check, configuration, WhatsApp integration tests |

### Cross-Persona Workflows Tested

1. **Full Student Lifecycle** — Parent enrols → Receptionist schedules demo → Teacher runs trial → Owner converts → System sends WhatsApp → Payment recorded → Attendance marked
2. **Emergency Scenario** — Owner reassigns teacher → System alerts students → Owner cancels another class → Students notified
3. **Month-End Billing** — System generates pending payments → Owner reviews → Receptionist collects → Revenue updated

<div class="page-break"></div>

# 10. What's Included — Deliverables Summary

### Software

| Deliverable | Description |
|------------|-------------|
| **Muzigal CRM** (Frontend) | React web app — 10 admin pages + public enrollment form, deployed on Vercel |
| **Backend API** | Google Apps Script — 12 files, 25+ endpoints, WhatsApp integration, data management |
| **WhatsApp Automation** | 7 message types, daily reminders, real-time alerts, emergency broadcasts |
| **Test Suite** | 109 tests across 4 suites, 5 personas |

### Documentation

| Document | Purpose | Audience |
|----------|---------|----------|
| **This Document** (Complete Solution) | Full platform overview — what it does, how it works, what it costs | Owners / Decision Makers |
| **Proposal** | Original system proposal with architecture and code documentation | Owners / Decision Makers |
| **Cost Analysis** | Detailed cost projections, commercial comparisons, ROI | Owners / Decision Makers |
| **User Guide** | Day-to-day operations reference for managing students and schedules | Staff (Receptionist, Teachers) |
| **Demo Guide** | 8 hands-on demos to try the WhatsApp system | Anyone (15-minute walkthrough) |

### Live URLs

| What | URL |
|------|-----|
| CRM Application | [zoo-crm-app.vercel.app](https://zoo-crm-app.vercel.app) |
| Demo Login | Email: `demo@zoo.crm` / Password: `demo` |
| Public Enrollment Form | [zoo-crm-app.vercel.app/enroll](https://zoo-crm-app.vercel.app/enroll) |

### Repositories (Private)

| Repo | Contents |
|------|---------|
| `aldrinstellus/zoo-crm` | CRM frontend (React, 2,614 LOC) |
| `aldrinstellus/zoo-crm (apps/backend)` | Backend + WhatsApp system (GAS, 4,115 LOC) |

<div class="page-break"></div>

# 11. Recommended Reading Order

For anyone reviewing the full documentation set:

| Order | Document | Time to Read | What You'll Learn |
|-------|----------|-------------|-------------------|
| 1 | **Complete Solution** (this document) | 10 min | The big picture — what the platform does, how it fits together |
| 2 | **Proposal** | 15 min | Detailed architecture, code documentation, setup guide, roadmap |
| 3 | **Cost Analysis** | 10 min | Exact monthly costs, commercial comparisons, ROI projections |
| 4 | **Demo Guide** | 15 min (hands-on) | Try the WhatsApp system yourself — 8 step-by-step demos |
| 5 | **User Guide** | 10 min | Day-to-day reference for staff managing the Google Sheet |

<div class="page-break"></div>

# 12. What's Next

The platform is fully built, tested, and deployed. Recommended next steps:

### Immediate (This Week)

| Step | Action | Who |
|------|--------|-----|
| 1 | Log in to the CRM in Demo Mode and explore | Cecil & Giri |
| 2 | Walk through the Demo Guide with a real phone | Cecil & Giri |
| 3 | Set up the permanent WhatsApp API token (replaces the 24-hour temporary token) | Aldrin |
| 4 | Add real student data to the Google Sheet | Muzigal staff |

### Short-Term Enhancements (Available on Request)

| Enhancement | Description |
|-------------|-------------|
| Student self-registration via WhatsApp | Students message the WhatsApp number to register themselves |
| Fee payment reminders | Automated monthly reminders with Razorpay payment links |
| Attendance via WhatsApp | Students reply "Present" to confirm attendance |
| Multi-language messages | WhatsApp messages in Kannada, Hindi, or English based on student preference |
| Google Calendar sync | Auto-populate the schedule from Google Calendar |

---

### Contact

For questions, support, or enhancements:

**Aldrin Stellus** — aldrin@atc.xyz

---

<div style="text-align: center; margin-top: 60px; color: #999; font-size: 9pt;">

Built with precision by Aldrin Stellus — Designed for Muzigal, Bangalore

Complete Solution v2.0 — March 2026

</div>
