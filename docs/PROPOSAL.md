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
  headerTemplate: '<div style="font-size:8px;color:#999;width:100%;text-align:right;margin-right:20mm;">WhatsApp Class Notification System — Muzigal</div>'
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
  blockquote { border-left: 4px solid #16213e; margin: 14px 0; padding: 8px 16px; background: #f8f9fa; color: #555; font-style: italic; }
  .page-break { page-break-before: always; }
  .cover { text-align: center; padding-top: 200px; page-break-after: always; }
  .cover h1 { font-size: 30pt; border: none; color: #1a1a2e; margin-bottom: 4px; letter-spacing: -0.5px; }
  .cover .subtitle { font-size: 13pt; color: #555; font-weight: 300; margin-bottom: 60px; }
  .cover .divider { width: 60px; height: 3px; background: #16213e; margin: 30px auto; }
  .cover .meta { font-size: 10.5pt; color: #444; line-height: 2; }
  .cover .meta strong { color: #1a1a2e; }
  .highlight-box { background: #f0f4ff; border: 1px solid #d0d8e8; border-radius: 6px; padding: 16px; margin: 16px 0; }
  .stat-grid { display: flex; gap: 16px; margin: 16px 0; }
  .stat-box { flex: 1; background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 6px; padding: 12px; text-align: center; }
  .stat-box .num { font-size: 20pt; font-weight: 700; color: #1a1a2e; }
  .stat-box .label { font-size: 8.5pt; color: #666; margin-top: 2px; }
---

<div class="cover">

# WhatsApp Class Notification System

<div class="subtitle">Automated Student Communication Platform for Muzigal</div>

<div class="divider"></div>

<div class="meta">

**Prepared by** Aldrin Stellus

**Prepared for** Cecil & Giri — Muzigal

Borewell Road, Whitefield, Bangalore

<br/>

**Date** March 2026 &nbsp;&nbsp;|&nbsp;&nbsp; **Version** 1.0

</div>

</div>

# 1. Executive Summary

Muzigal deserves a communication system as refined as the music it teaches. This document presents a **fully built, tested, and operational** WhatsApp notification system that automates class schedule communication with students.

### The Problem

Managing class schedule communications manually — phone calls, group messages, or word-of-mouth — is time-consuming, error-prone, and inconsistent. When a guitar teacher changes rooms or a vocal class gets rescheduled, students need to know immediately.

### The Solution

A custom-built automation system that:

- **Sends daily class reminders** every morning at 8:00 AM
- **Instantly notifies students** when a teacher, room, time, or date changes
- **Handles cancellations** automatically — change the status and students are informed
- **Supports emergency broadcasts** — send custom messages to all students, a class, or an individual
- **Optionally uses AI** (Claude) to compose natural, warm messages

### Key Benefits

| Benefit | Detail |
|---------|--------|
| Zero infrastructure cost | Runs entirely on Google Apps Script (free tier) |
| Familiar interface | Staff manage everything through Google Sheets |
| Real-time notifications | Schedule changes trigger WhatsApp alerts instantly |
| Reliable delivery | Full audit trail with delivery status logging |
| Scalable | Handles hundreds of students with built-in rate limiting |
| AI-powered (optional) | Claude AI composes personalized, natural messages |

### System at a Glance

<div class="stat-grid">
<div class="stat-box"><div class="num">1,615</div><div class="label">Lines of Code</div></div>
<div class="stat-box"><div class="num">8</div><div class="label">Script Files</div></div>
<div class="stat-box"><div class="num">41</div><div class="label">Functions</div></div>
<div class="stat-box"><div class="num">10</div><div class="label">API Endpoints</div></div>
</div>

<div class="stat-grid">
<div class="stat-box"><div class="num">7</div><div class="label">Message Types</div></div>
<div class="stat-box"><div class="num">₹0</div><div class="label">Infrastructure Cost</div></div>
<div class="stat-box"><div class="num">2</div><div class="label">Automated Triggers</div></div>
<div class="stat-box"><div class="num">5</div><div class="label">Data Tabs</div></div>
</div>

**Status**: Fully built, deployed, and end-to-end tested with real WhatsApp message delivery.

<div class="page-break"></div>

# 2. System Architecture

### Overview

The system operates as an event-driven pipeline: data lives in Google Sheets, changes trigger notifications through Google Apps Script, and messages are delivered via the WhatsApp Cloud API.

```
┌─────────────────────────────────────────────────────────┐
│                    GOOGLE SHEETS                         │
│                  (Source of Truth)                        │
│                                                          │
│   Students   Schedule   Config   Log   Overrides         │
│   (contacts) (classes)  (keys)  (audit) (manual)         │
└──────┬──────────┬─────────────────┬──────────────────────┘
       │          │                 │
       │    ┌─────┴─────┐          │
       │    │  TRIGGERS  │          │
       │    ├────────────┤          │
       │    │ Daily 8AM  │──► scheduler.gs ──► Daily reminders
       │    │ onEdit     │──► watcher.gs   ──► Real-time alerts
       │    │ Web POST   │──► webapp.gs    ──► Manual/emergency
       │    └────────────┘
       │          │
       │    ┌─────┴─────┐
       │    │  COMPOSE   │
       │    │            │
       │    │ Claude AI  │──► AI-generated messages (optional)
       │    │ Templates  │──► Hardcoded fallback messages
       │    └─────┬──────┘
       │          │
       │    ┌─────┴─────┐
       │    │   SEND     │
       │    │            │
       │    │ WhatsApp   │──► Meta Cloud API v19.0
       │    │ Cloud API  │──► Template-based delivery
       │    └─────┬──────┘
       │          │
       │          ▼
       │    ┌───────────┐
       │    │  STUDENTS  │
       │    │  (phones)  │
       └───►│  WhatsApp  │
            └───────────┘
```

### Technology Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| Runtime | Google Apps Script | V8 | Serverless execution |
| Database | Google Sheets | — | Data storage and UI |
| Messaging | WhatsApp Cloud API | v19.0 | Message delivery |
| AI (optional) | Claude (Anthropic) | Sonnet 4 | Message composition |
| Deployment | Google Apps Script Web App | — | HTTP endpoints |
| CLI Tool | clasp | Latest | Code push/deployment |

### Google Sheet Schema

**Students Tab**

| Column | Type | Example | Description |
|--------|------|---------|-------------|
| StudentID | Text | `S001` | Unique identifier |
| Name | Text | `Priya Sharma` | Student full name |
| Phone | Text | `+919845708094` | WhatsApp number (E.164) |
| Class | Text | `Guitar - Grade 3` | Class/instrument group |
| Active | Boolean | `TRUE` | Receiving notifications |

**Schedule Tab**

| Column | Type | Example | Description |
|--------|------|---------|-------------|
| ScheduleID | Text | `SCH001` | Unique identifier |
| Class | Text | `Guitar - Grade 3` | Links to Students tab |
| Subject | Text | `Guitar Practice` | Session description |
| Teacher | Text | `Mr. Cecil` | Instructor name |
| Room | Text | `Studio A` | Room or studio |
| Date | Date | `2026-03-25` | YYYY-MM-DD format |
| Time | Text | `10:00` | 24-hour format |
| Status | Text | `Active` | Active/Cancelled/Rescheduled |
| LastModified | Auto | — | System-generated |
| ModifiedBy | Auto | — | System-generated |

**Config Tab** — 10 system configuration keys (see Section 6)

**Log Tab** — Delivery audit trail (timestamp, student, status, WhatsApp ID, errors)

**Overrides Tab** — Manual message history (target, message, sender, status)

<div class="page-break"></div>

# 3. Complete Setup Guide

For the full step-by-step guide, see [SETUP.md](../SETUP.md). Below is a condensed overview.

### Prerequisites

- Google account (free)
- Meta Developer account (free) — [developers.facebook.com](https://developers.facebook.com)
- A phone number with WhatsApp installed (to receive test messages)
- Node.js installed (for `clasp` CLI tool)

### Setup Steps

| Step | Action | Time |
|------|--------|------|
| 1 | Create Google Apps Script project (via clasp or browser) | 5 min |
| 2 | Push code (8 .gs files) | 2 min |
| 3 | Run `createSheetStructure()` to build all tabs | 1 min |
| 4 | Create Meta Developer App with WhatsApp product | 10 min |
| 5 | Create `class_update` message template | 5 min |
| 6 | Fill Config tab with API credentials | 5 min |
| 7 | Add test data (students + schedule) | 5 min |
| 8 | Deploy as web app | 2 min |
| 9 | Install triggers (daily + onEdit) | 1 min |
| 10 | Run end-to-end test | 5 min |
| | **Total setup time** | **~40 min** |

<div class="page-break"></div>

# 4. Code Documentation

### File Overview

| File | Lines | Purpose | Key Functions |
|------|-------|---------|---------------|
| `config.gs` | 100 | Configuration management with CacheService (10-min TTL) | `getConfig()`, `validateConfig()`, `clearConfigCache()` |
| `composer.gs` | 202 | Message composition — Claude AI with template fallback | `composeMessage()`, `callClaudeAPI()`, `buildFallbackMessage_()` |
| `scheduler.gs` | 219 | Daily schedule sender — groups by class, batch delivery | `sendDailySchedule()`, `sendDailyScheduleForDate()` |
| `sender.gs` | 193 | WhatsApp Cloud API — template and free-form sends | `sendTemplate()`, `sendFreeForm()`, `batchSend()` |
| `setup.gs` | 170 | Sheet creation, trigger management, validation | `createSheetStructure()`, `installTriggers()`, `testSetup()` |
| `utils.gs` | 303 | Student lookups, date helpers, phone formatting, logging | `formatPhoneNumber()`, `getStudentsByClass()`, `logToSheet()` |
| `watcher.gs` | 114 | Real-time edit handler for Schedule changes | `onScheduleEdit()` |
| `webapp.gs` | 314 | Web app — 7 GET + 3 POST endpoints | `doGet()`, `doPost()`, `handleOverride_()` |
| **Total** | **1,615** | | **41 functions** |

### Design Decisions

| Decision | Rationale |
|----------|-----------|
| Google Sheets as database | Familiar to non-technical staff, zero learning curve |
| CacheService for config | Prevents repeated sheet reads; 10-minute TTL balances freshness with performance |
| Template-based WhatsApp sends | Required for sending outside the 24-hour window; ensures deliverability |
| E.164 phone normalization | Handles any Indian phone format (10-digit, +91, 91, 0-prefix) |
| 200ms rate limiting | Respects WhatsApp API limits while maintaining throughput |
| Claude AI as optional | AI-powered messages add warmth; system works perfectly without it |
| Webhook secret authentication | Prevents unauthorized POST requests to the web app |
| Email summaries on failure | Proactive alerting — admin knows immediately when messages fail |

### Message Types

The system supports 7 distinct notification types, each with purpose-built message templates:

| Type | Trigger | Example Scenario |
|------|---------|-----------------|
| `daily_schedule` | 8:00 AM daily | Morning reminder: "Piano Practice with Mrs. Giri in Studio B at 2:00 PM" |
| `teacher_change` | Teacher column edited | "Your Guitar class now has Mr. Giri instead of Mr. Cecil" |
| `room_change` | Room column edited | "Vocal Practice has moved to Studio C" |
| `time_change` | Time column edited | "Drums class shifted to 4:30 PM" |
| `date_change` | Date column edited | "Violin class rescheduled to March 28" |
| `cancellation` | Status → Cancelled | "Piano Practice for today has been cancelled" |
| `reschedule` | Status → Rescheduled | "Guitar class has been rescheduled — check updated details" |

<div class="page-break"></div>

# 5. Configuration Reference

All configuration is managed through the **Config** tab in Google Sheets.

| Key | Type | Required | Default | Description |
|-----|------|----------|---------|-------------|
| `WHATSAPP_TOKEN` | String | Yes | — | Meta Cloud API bearer token |
| `PHONE_NUMBER_ID` | String | Yes | — | WhatsApp Business phone number ID |
| `TEMPLATE_NAME` | String | Yes | `class_update` | Approved message template name |
| `CLAUDE_API_KEY` | String | No | — | Anthropic API key (for AI messages) |
| `USE_CLAUDE` | Boolean | Yes | `FALSE` | Enable/disable Claude AI composition |
| `DAILY_SEND_HOUR` | Number | Yes | `8` | Hour for daily trigger (24hr, IST) |
| `DAILY_SEND_MINUTE` | Number | Yes | `0` | Minute for daily trigger |
| `TIMEZONE` | String | Yes | `Asia/Kolkata` | Timezone for all date operations |
| `SCHOOL_NAME` | String | Yes | `Muzigal` | Used in message composition |
| `WEBHOOK_SECRET` | String | Yes | — | Shared secret for POST authentication |

**Configuration caching**: Values are cached for 10 minutes using Google's CacheService. After changing a config value, it takes effect within 10 minutes (or immediately if `clearConfigCache()` is run).

<div class="page-break"></div>

# 6. User Guide

For the complete staff operations guide, see [USER-GUIDE.md](USER-GUIDE.md).

### Daily Workflow for Muzigal

**Morning (before classes):**
1. Open the Google Sheet
2. Verify today's schedule is correct in the Schedule tab
3. The system sends daily reminders automatically at 8:00 AM

**During the day (when changes happen):**
1. Teacher unavailable? Edit the Teacher column → students notified instantly
2. Room changed? Edit the Room column → students notified instantly
3. Class cancelled? Change Status to `Cancelled` → students notified instantly

**Weekly (admin tasks):**
1. Add next week's schedule rows to the Schedule tab
2. Check the Log tab for any delivery failures
3. Add new students or deactivate departed students

### Example: A Real Scenario

> **Situation**: Guitar teacher Mr. Cecil is sick. Mr. Giri will substitute. Also, the class moves from Studio A to Studio C.

**What staff does**: Edit two cells in the Schedule tab — Teacher and Room.

**What students receive** (two WhatsApp messages):
1. "Hi Priya, your Guitar Practice class now has Mr. Giri instead of Mr. Cecil. Same time at Studio A."
2. "Hi Priya, Guitar Practice has moved to Studio C. See you at 10:00!"

**Time taken**: Under 10 seconds of staff effort.

<div class="page-break"></div>

# 7. API Reference

The system exposes a web app with 10 HTTP endpoints. For complete documentation with curl examples, see [API-REFERENCE.md](API-REFERENCE.md).

### GET Endpoints (no authentication required)

| Action | Parameters | Purpose |
|--------|-----------|---------|
| `health` (default) | None | Health check — returns status and trigger count |
| `setup` | None | Creates/rebuilds sheet structure |
| `get_config` | None | Returns all configuration values |
| `set_config` | `key`, `value` | Updates a configuration value |
| `add_student` | `id`, `name`, `phone`, `cls` | Adds a student row |
| `add_schedule` | `id`, `cls`, `subject`, `teacher`, `room`, `date`, `time` | Adds a schedule row |
| `install_triggers` | None | Installs daily + onEdit triggers |

### POST Endpoints (require `secret` in body)

| Action | Parameters | Purpose |
|--------|-----------|---------|
| `send_override` | `target_type`, `target_value`, `message`, `sent_by` | Send custom message to class/student/all |
| `send_daily` | `date` (optional) | Trigger daily schedule for a specific date |
| `send_test` | `phone`, `message` (optional) | Send test message to a single number |

<div class="page-break"></div>

# 8. Testing and Verification

### Quick Verification Checklist

| Test | How | Expected Result |
|------|-----|-----------------|
| Health check | GET `{webapp_url}` | `{"status":"ok","triggerCount":2}` |
| Config validation | Run `testSetup()` in editor | "All config values are set" |
| WhatsApp send | POST `send_test` with your phone | WhatsApp message received |
| Edit trigger | Change a teacher name in Schedule | WhatsApp notification sent |
| Daily schedule | Run `sendDailySchedule()` manually | Today's classes sent to students |

### Troubleshooting

| Problem | Solution |
|---------|----------|
| "WhatsApp API not configured" | Fill WHATSAPP_TOKEN and PHONE_NUMBER_ID in Config |
| Template not found | Ensure template name in Config matches the approved template |
| 401 Unauthorized | Token expired — get new temporary token from Meta Dashboard |
| No message received | Verify phone number is in test recipient list on Meta Dashboard |
| onEdit trigger not firing | Run `installTriggers()` — must be installable, not simple onEdit |
| Permission error | Re-run any function and re-approve permissions when prompted |
| Claude returns null | Check CLAUDE_API_KEY; set USE_CLAUDE=FALSE for template fallback |

For the complete testing guide with 11 test functions and code, see [TESTING.md](../TESTING.md).

<div class="page-break"></div>

# 9. Costing and Value Analysis

For detailed cost projections and comparisons, see [COST-ANALYSIS.md](COST-ANALYSIS.md).

### Infrastructure Cost

| Component | Cost | Notes |
|-----------|------|-------|
| Google Apps Script | **₹0** | Free tier: 6 min/execution, 90 min/day total |
| Google Sheets | **₹0** | Free with Google account |
| Web app hosting | **₹0** | Hosted by Google at no cost |
| **Platform total** | **₹0/month** | |

### Per-Message Costs

| Component | Cost per Message | Notes |
|-----------|-----------------|-------|
| WhatsApp (utility template) | ~₹0.35 | India pricing, per Meta rate card |
| Claude AI (optional) | ~₹0.50–1.50 | Can be disabled with USE_CLAUDE=FALSE |

### Monthly Projections for Muzigal

| Scenario | Students | Messages/Day | WhatsApp/Month | Total/Month |
|----------|----------|-------------|----------------|-------------|
| Small batch | 25 | 25 | ₹263 | **₹263** |
| Current size | 50 | 50 | ₹525 | **₹525** |
| Growth | 100 | 100 | ₹1,050 | **₹1,050** |
| With Claude AI | 100 | 100 | ₹1,050 + ₹1,500 | **₹2,550** |

### Comparison with Commercial Alternatives

| Platform | Monthly Fee | Per-Message | 50 Students/Month |
|----------|------------|-------------|-------------------|
| **This system** | **₹0** | **₹0.35** | **₹525** |
| Interakt | ₹999 | ₹0.35+ | ₹1,524 |
| Wati | ₹2,499 | Included | ₹2,499 |
| AiSensy | ₹999 | ₹0.35+ | ₹1,524 |

### Development Value

| Metric | Value |
|--------|-------|
| Custom code written | 1,615 lines across 8 files |
| Functions built | 41 production-grade functions |
| APIs integrated | 3 (WhatsApp, Claude AI, Google Sheets) |
| Documentation | 8 comprehensive documents |
| Comparable market cost | ₹1,50,000 – ₹3,00,000 |

<div class="page-break"></div>

# 10. Proposed Workflow for Muzigal

### How This Maps to Your Music Academy

| Muzigal Concept | System Mapping |
|----------------|----------------|
| Instrument classes (Guitar, Piano, Drums, Vocals, Violin) | Class column in Students + Schedule tabs |
| Music teachers (Cecil, Giri, guest instructors) | Teacher column in Schedule tab |
| Studios and practice rooms | Room column in Schedule tab |
| Class timings | Date + Time columns in Schedule tab |
| Student/parent contacts | Phone column in Students tab |

### Recommended Setup

**Students Tab Example:**

| StudentID | Name | Phone | Class | Active |
|-----------|------|-------|-------|--------|
| S001 | Priya Sharma | +919845xxxxxx | Guitar - Grade 3 | TRUE |
| S002 | Arjun Reddy | +919876xxxxxx | Piano - Beginners | TRUE |
| S003 | Meera Nair | +919823xxxxxx | Vocals - Advanced | TRUE |
| S004 | Rohan Das | +919845xxxxxx | Drums - Intermediate | TRUE |

**Schedule Tab Example:**

| ScheduleID | Class | Subject | Teacher | Room | Date | Time |
|------------|-------|---------|---------|------|------|------|
| SCH001 | Guitar - Grade 3 | Guitar Practice | Mr. Cecil | Studio A | 2026-03-25 | 10:00 |
| SCH002 | Piano - Beginners | Piano Basics | Mr. Giri | Studio B | 2026-03-25 | 11:30 |
| SCH003 | Vocals - Advanced | Vocal Training | Mrs. Lakshmi | Studio C | 2026-03-25 | 14:00 |
| SCH004 | Drums - Intermediate | Percussion | Mr. Cecil | Studio A | 2026-03-25 | 16:00 |

### Weekly Admin Routine

1. **Sunday evening**: Add next week's schedule rows
2. **Daily**: No action needed — 8 AM reminders are automatic
3. **As needed**: Edit schedule for changes — notifications are instant
4. **Weekly review**: Check Log tab for delivery failures

<div class="page-break"></div>

# 11. Roadmap — Future Enhancements

### Phase 2 (Recommended Next Steps)

| Enhancement | Description | Effort |
|-------------|-------------|--------|
| Permanent API token | Replace temporary token with System User token | 1 hour |
| Student self-registration | Students message the WhatsApp number to register | 2–3 days |
| Attendance via WhatsApp | Students reply "Present" to confirm attendance | 2–3 days |
| Fee payment reminders | Automated monthly fee reminders with payment links | 1–2 days |
| Multi-language support | Messages in Kannada, Hindi, or English based on preference | 2–3 days |

### Phase 3 (Advanced)

| Enhancement | Description | Effort |
|-------------|-------------|--------|
| Google Calendar sync | Auto-populate Schedule tab from Google Calendar | 1–2 days |
| Performance/exam reminders | Notify students about upcoming exams or recitals | 1 day |
| Parent-teacher meeting scheduling | Coordinate scheduling via WhatsApp | 2–3 days |
| Dashboard web app | Visual dashboard showing delivery stats, active students | 3–5 days |
| Multiple academy locations | Support branch locations with location-based routing | 2–3 days |

<div class="page-break"></div>

# 12. Support and Maintenance

### Ongoing Maintenance Requirements

| Task | Frequency | Who |
|------|-----------|-----|
| Check Log tab for failures | Weekly | Muzigal staff |
| Renew WhatsApp access token | Every 24h (temp) or once (permanent) | Administrator |
| Add new schedule entries | Weekly | Muzigal staff |
| Update student records | As needed | Muzigal staff |
| Review delivery statistics | Monthly | Administrator |

### Token Management

The WhatsApp temporary access token expires every **24 hours**. For production use, we strongly recommend setting up a **permanent System User token** which does not expire. This is a one-time setup that takes approximately 1 hour.

### Scaling

The system is designed to handle growth:

- **Rate limiting**: 200ms between messages prevents API throttling
- **Batch operations**: Sends to entire classes in a single operation
- **Config caching**: Reduces sheet reads for better performance
- **Google Apps Script quotas**: 90 minutes/day execution time, 20,000 URL fetches/day — sufficient for hundreds of students

### Contact

For technical support, system modifications, or Phase 2 development:

**Aldrin Stellus**
Email: aldrin@atc.xyz

---

<div style="text-align: center; margin-top: 60px; color: #999; font-size: 9pt;">

Built with precision by Aldrin Stellus — Designed for Muzigal, Bangalore

WhatsApp Class Notification System v1.0 — March 2026

</div>
