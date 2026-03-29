# WhatsApp Class Notifications

**Automated student notification system for class schedules via WhatsApp.**

Built for [Muzigal](https://muzigal.com) -- a musical academy in Whitefield, Bangalore -- this system sends real-time WhatsApp alerts when class schedules change and delivers daily schedule reminders every morning. It runs entirely on Google Apps Script with zero server infrastructure.

---

## Phase 2: Full CRM Application

The backend has expanded from 8 files (1,615 LOC) to **12 files (4,115 LOC)** with four new modules:

| New File | Purpose |
|----------|---------|
| `api.gs` | 25+ REST API endpoints for the CRM frontend |
| `auth.gs` | Role-based authentication (Receptionist, Teacher, Owner, Parent, Admin) |
| `payments.gs` | Payment tracking, fee management, and receipt generation |
| `reports.gs` | Attendance summaries, enrollment stats, and revenue reports |

**New Google Sheet tabs**: Classes, Teachers, Payments, Enrollment, Attendance

**Frontend**: A full React + TypeScript + Tailwind CRM deployed on Vercel with 10 admin pages and a public enrollment form.

| | |
|---|---|
| **Frontend repo** | [aldrinstellus/zoo-crm](https://github.com/aldrinstellus/zoo-crm) |
| **Live app** | [zoo-crm-app.vercel.app](https://zoo-crm-app.vercel.app) |
| **Admin dashboard** | [zoo-crm-app.vercel.app/admin](https://zoo-crm-app.vercel.app/admin) |
| **Tests** | 109 passing across 4 suites, 5 personas |
| **Total system** | 6,729 LOC (4,115 backend + 2,614 frontend) |
| **Infrastructure cost** | Rs. 0/month |

---

## Features

- **Real-time change alerts** -- Teacher, room, time, or date changes trigger instant WhatsApp notifications to all affected students
- **Daily schedule reminders** -- Configurable morning messages with each student's class lineup for the day
- **Emergency broadcasts** -- Send override messages to a single student, an entire class, or all students via API
- **AI-powered messages** -- Optional Claude integration composes warm, context-aware notification text (falls back to templates when disabled)
- **Zero infrastructure cost** -- Google Apps Script runs free; no servers, no hosting, no CI/CD
- **Full audit trail** -- Every message is logged with timestamp, delivery status, and WhatsApp message ID
- **Web app API** -- Deployable POST/GET endpoints for external integrations and manual triggers
- **Email summaries** -- Automatic email reports after daily sends and on delivery failures

---

## Architecture

```
+------------------+         +-------------------------+         +--------------------+
|                  |         |                         |         |                    |
|  Google Sheet    | ------> |  Google Apps Script      | ------> |  WhatsApp Cloud    |
|                  |         |  (Triggers)             |         |  API (Meta)        |
|  - Students      |         |                         |         |                    |
|  - Schedule      |  onEdit |  - watcher.gs           |  HTTPS  |  Template-based    |
|  - Config        | ------> |  - composer.gs          | ------> |  messages          |
|  - Log           |         |  - sender.gs            |         |                    |
|  - Overrides     |  Timer  |  - scheduler.gs         |         +--------+-----------+
|                  | ------> |  - webapp.gs            |                  |
+------------------+         +--------+----------------+                  |
                                      |                                   v
                              Optional|                          +------------------+
                                      v                          |                  |
                             +------------------+                |  Student Phones   |
                             |  Claude API      |                |  (WhatsApp)       |
                             |  (Anthropic)     |                |                  |
                             +------------------+                +------------------+
```

**Data flow:**
1. Staff edits the Schedule tab in Google Sheets (teacher, room, time, date, or status)
2. An installable `onEdit` trigger fires `watcher.gs`, which detects the change type
3. `composer.gs` builds a personalized message (via Claude API or fallback templates)
4. `sender.gs` delivers the message through WhatsApp Cloud API using an approved template
5. The result is logged to the Log tab and optionally emailed to the admin

---

## Quick Start

1. **Create the project** -- Open [script.google.com](https://script.google.com), create a new project, and copy all 8 `.gs` files into the editor.

2. **Build the sheet** -- Run `createSheetStructure()` from `setup.gs`. This creates 5 tabs (Students, Schedule, Log, Overrides, Config) with headers and default config values.

3. **Configure WhatsApp** -- Set up a Meta Developer app, get your access token and phone number ID, create a `class_update` message template, and fill the Config tab.

4. **Add students and schedule** -- Populate the Students tab with names, phone numbers, and instrument classes. Add schedule entries for today.

5. **Install triggers** -- Run `installTriggers()` to set up the daily morning timer and the onEdit watcher. Edit a schedule row to test.

For detailed instructions, see [SETUP.md](SETUP.md).

---

## File Overview

| File | Lines | Purpose |
|------|------:|---------|
| `setup.gs` | 170 | Sheet structure creation, trigger installation, setup validation |
| `config.gs` | 100 | Key-value config reader with CacheService (10-min TTL) |
| `utils.gs` | 303 | Student lookups, phone formatting, date helpers, logging, email summaries |
| `composer.gs` | 202 | Message composition with Claude API integration and fallback templates |
| `sender.gs` | 193 | WhatsApp Cloud API calls (template sends, free-form, batch with rate limiting) |
| `watcher.gs` | 114 | Installable onEdit handler -- detects schedule changes, triggers notifications |
| `scheduler.gs` | 219 | Daily schedule sender -- groups by class, handles single and multi-class days |
| `webapp.gs` | 314 | Web app endpoints (POST for overrides/tests/daily, GET for health/config/setup) |
| **Total** | **1,615** | |

---

## Cost Summary

| Component | Cost |
|-----------|------|
| Google Apps Script hosting | Free |
| Google Sheets storage | Free |
| WhatsApp Cloud API (template messages) | ~Rs. 0.35 per message |
| Claude API (optional, for AI-composed messages) | ~$0.003 per message |
| **Monthly estimate (100 students, 30 days)** | **~Rs. 1,050** (WhatsApp only) |

With `USE_CLAUDE=FALSE`, the system uses built-in templates at no additional cost beyond WhatsApp's per-message fee.

---

## Documentation

| Document | Description |
|----------|-------------|
| [SETUP.md](SETUP.md) | Complete setup guide -- prerequisites through production deployment |
| [TESTING.md](TESTING.md) | Testing guide -- 11 test functions, curl examples, verification checklist |

---

## Configuration Keys

All configuration is stored in the Config tab of the Google Sheet:

| Key | Example | Description |
|-----|---------|-------------|
| `WHATSAPP_TOKEN` | `EAAxxxxxxx...` | Meta WhatsApp Cloud API access token |
| `PHONE_NUMBER_ID` | `1234567890` | WhatsApp Business phone number ID |
| `TEMPLATE_NAME` | `class_update` | Approved message template name |
| `CLAUDE_API_KEY` | `sk-ant-xxxxx` | Anthropic API key (optional) |
| `USE_CLAUDE` | `TRUE` / `FALSE` | Enable or disable AI message composition |
| `DAILY_SEND_HOUR` | `8` | Hour for daily schedule send (24hr, IST) |
| `DAILY_SEND_MINUTE` | `0` | Minute for daily schedule send |
| `TIMEZONE` | `Asia/Kolkata` | Timezone for all date/time operations |
| `SCHOOL_NAME` | `Muzigal` | Academy name used in messages |
| `WEBHOOK_SECRET` | `my-secret-123` | Shared secret for web app POST requests |

---

## License

MIT License. See [LICENSE](LICENSE) for details.

---

Built by **Aldrin Stellus** | Designed for **Muzigal**, Bangalore
