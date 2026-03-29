# System Architecture

## WhatsApp Class Notification System for Muzigal

**Client:** Muzigal Musical Academy, Borewell Road, Whitefield, Bangalore
**Developer:** Aldrin Stellus
**Version:** 1.0.0

---

## Overview

The WhatsApp Class Notification System is a serverless, event-driven messaging platform built entirely on Google Apps Script. It automates class schedule notifications for Muzigal's students via the WhatsApp Cloud API, with optional AI-powered message composition through Anthropic's Claude API. The system uses a Google Spreadsheet as its single source of truth for student data, class schedules, configuration, and delivery audit logs. Three independent trigger mechanisms (time-driven, edit-driven, and web app endpoints) ensure notifications are delivered for daily schedules, real-time schedule changes, and manual/emergency broadcasts.

---

## System Diagram

```
Google Sheet (Source of Truth)
  |
  +-- Students tab      --> Contact directory (name, phone, class, active status)
  +-- Schedule tab      --> Class timetable (subject, teacher, room, date, time, status)
  +-- Config tab        --> API keys & runtime settings (10 key-value pairs)
  +-- Log tab           --> Delivery audit trail (every message logged)
  +-- Overrides tab     --> Manual/emergency message log
  |
Triggers:
  |
  +-- Time-driven (8:00 AM IST)  --> scheduler.gs --> Daily schedule notifications
  +-- onEdit (Schedule tab)      --> watcher.gs   --> Real-time change alerts
  +-- Web app POST               --> webapp.gs    --> Manual/emergency broadcasts
  |
Message Pipeline:
  |
  Sheet data --> composer.gs (Claude AI or fallback templates) --> sender.gs (WhatsApp Cloud API) --> Student phones
  |
Observability:
  |
  +-- Log tab           --> Every message recorded with delivery status
  +-- Overrides tab     --> Manual sends tracked separately
  +-- Email summaries   --> Sent to spreadsheet owner on batch completions and failures
```

---

## Technology Stack

| Component | Technology | Version / Details |
|---|---|---|
| Runtime | Google Apps Script | V8 engine (ES6+ syntax support) |
| Data Store | Google Sheets | 5-tab spreadsheet (Students, Schedule, Config, Log, Overrides) |
| Messaging API | WhatsApp Cloud API | v19.0 via Meta Graph API |
| AI Composition | Anthropic Claude API | claude-sonnet-4-20250514 (optional, toggleable) |
| Caching | CacheService | Script-level cache, 10-minute TTL |
| Email | MailApp | Summary emails to spreadsheet owner |
| Triggers | ScriptApp | Time-driven (daily) + installable onEdit |
| Web Framework | ContentService | JSON REST endpoints (GET + POST) |
| Timezone | Asia/Kolkata | IST (UTC+5:30), hardcoded throughout |

---

## Data Flow Diagrams

### Trigger 1: Daily Schedule (Time-Driven)

```
[8:00 AM IST Trigger]
       |
       v
  scheduler.gs :: sendDailySchedule()
       |
       v
  Read Schedule tab --> filter rows where Date = today AND Status = 'Active'
       |
       v
  Group schedules by Class
       |
       v
  For each class:
       |
       +-- utils.gs :: getStudentsByClass(className)
       |       |
       |       v
       |   Read Students tab --> filter by Class + Active = TRUE
       |
       v
  For each student:
       |
       +-- composer.gs :: composeMessage()
       |       |
       |       +-- [USE_CLAUDE=TRUE] --> callClaudeAPI() --> AI-generated message
       |       |
       |       +-- [USE_CLAUDE=FALSE or error] --> buildFallbackMessage_() --> Template message
       |
       v
  sender.gs :: sendTemplate() --> WhatsApp Cloud API (POST)
       |
       v
  utils.gs :: logToSheet() --> Append to Log tab
       |
       v
  [200ms delay] --> next student
       |
       v
  utils.gs :: sendSummaryEmail() --> Email summary to owner
```

### Trigger 2: Real-Time Schedule Change (onEdit)

```
[User edits Schedule tab]
       |
       v
  watcher.gs :: onScheduleEdit(e)
       |
       v
  Validate: Sheet = 'Schedule', Row > 1, Column is monitored
       |
       +-- Col 4 (Teacher)  --> 'teacher_change'
       +-- Col 5 (Room)     --> 'room_change'
       +-- Col 6 (Date)     --> 'date_change'
       +-- Col 7 (Time)     --> 'time_change'
       +-- Col 8 (Status)   --> 'cancellation' or 'reschedule'
       |
       v
  Update LastModified + ModifiedBy columns
       |
       v
  utils.gs :: getScheduleRow(row) --> Read full row data
       |
       v
  utils.gs :: getStudentsByClass() --> Get affected students
       |
       v
  sender.gs :: batchSend() --> Compose + send to each student (200ms spacing)
       |
       v
  [If failures] --> sendSummaryEmail() with error details
```

### Trigger 3: Web App Endpoints (Manual/Emergency)

```
[HTTP Request]
       |
       +-- GET ?action=health     --> Return status JSON
       +-- GET ?action=setup      --> Create sheet structure
       +-- GET ?action=set_config --> Update a config key
       +-- GET ?action=get_config --> Return all config values
       +-- GET ?action=add_student --> Add a student row
       +-- GET ?action=add_schedule --> Add a schedule row
       +-- GET ?action=install_triggers --> Install all triggers
       |
       +-- POST (with secret)
              |
              +-- action=send_override --> Custom message to class/student/all
              +-- action=send_daily    --> Trigger daily schedule (optional date)
              +-- action=send_test     --> Test message to single phone
```

---

## Google Sheet Schema

### Tab 1: Students

| Column | Header | Data Type | Example | Description |
|---|---|---|---|---|
| A | StudentID | String | `STU001` | Unique student identifier |
| B | Name | String | `Ravi Kumar` | Full name of the student |
| C | Phone | String | `9876543210` | Phone number (any Indian format accepted) |
| D | Class | String | `Guitar Beginner` | Class/batch name (must match Schedule tab) |
| E | Active | Boolean | `TRUE` | Whether the student receives notifications |

### Tab 2: Schedule

| Column | Header | Data Type | Example | Description |
|---|---|---|---|---|
| A | ScheduleID | String | `SCH001` | Unique schedule entry identifier |
| B | Class | String | `Guitar Beginner` | Class/batch name (must match Students tab) |
| C | Subject | String | `Guitar` | Subject or instrument name |
| D | Teacher | String | `Mr. Sharma` | Teacher's name |
| E | Room | String | `Studio 3` | Room or studio name |
| F | Date | Date | `2026-03-24` | Class date (YYYY-MM-DD) |
| G | Time | String | `10:00 AM` | Class time |
| H | Status | String | `Active` | Status: Active, Cancelled, or Rescheduled |
| I | LastModified | Timestamp | `2026-03-23 14:30:00` | Auto-set by watcher on edit |
| J | ModifiedBy | String | `admin@muzigal.com` | Auto-set by watcher on edit |

### Tab 3: Log

| Column | Header | Data Type | Example | Description |
|---|---|---|---|---|
| A | Timestamp | Timestamp | `2026-03-24 08:01:23` | When the message was sent (IST) |
| B | StudentName | String | `Ravi Kumar` | Recipient student's name |
| C | Phone | String | `+919876543210` | E.164 formatted phone number |
| D | MessageType | String | `daily_schedule` | Notification type (see change types below) |
| E | MessageSent | String | `Ravi, your Guitar class...` | Full message text delivered |
| F | DeliveryStatus | String | `sent` | Delivery result: `sent` or `failed` |
| G | WhatsAppMsgID | String | `wamid.HBgNOTE...` | WhatsApp message ID for tracking |
| H | Error | String | | Error message (empty if successful) |

**Message Types:** `daily_schedule`, `teacher_change`, `room_change`, `time_change`, `date_change`, `cancellation`, `reschedule`, `override`, `test`

### Tab 4: Overrides

| Column | Header | Data Type | Example | Description |
|---|---|---|---|---|
| A | Timestamp | Timestamp | `2026-03-24 15:00:00` | When the override was sent (IST) |
| B | TargetType | String | `class` | Target scope: `class`, `student`, or `all` |
| C | TargetValue | String | `Guitar Beginner` | Class name, phone number, or `all` |
| D | Message | String | `Holiday tomorrow...` | The custom message that was broadcast |
| E | SentBy | String | `admin@muzigal.com` | Who initiated the override |
| F | Status | String | `sent` | Result: `sent` or `partial (3/5)` |

### Tab 5: Config

| Column | Header | Data Type | Example | Description |
|---|---|---|---|---|
| A | Key | String | `WHATSAPP_TOKEN` | Configuration key name |
| B | Value | String | `EAABx...` | Configuration value |

**Default Config Keys:**

| Key | Default Value | Description |
|---|---|---|
| `WHATSAPP_TOKEN` | (placeholder) | Meta WhatsApp Cloud API access token |
| `PHONE_NUMBER_ID` | (placeholder) | WhatsApp Business Phone Number ID |
| `TEMPLATE_NAME` | `class_update` | Approved WhatsApp message template name |
| `CLAUDE_API_KEY` | (placeholder) | Anthropic API key for Claude |
| `USE_CLAUDE` | `TRUE` | Enable/disable AI message composition |
| `DAILY_SEND_HOUR` | `8` | Hour to send daily schedule (0-23, IST) |
| `DAILY_SEND_MINUTE` | `0` | Minute to send daily schedule (0-59) |
| `TIMEZONE` | `Asia/Kolkata` | Timezone for all date/time operations |
| `SCHOOL_NAME` | (placeholder) | Academy name used in messages (e.g., Muzigal) |
| `WEBHOOK_SECRET` | (placeholder) | Shared secret for POST endpoint authentication |

---

## Security Model

### Authentication

| Layer | Mechanism | Details |
|---|---|---|
| GET Endpoints | No authentication | Public health check and setup utilities |
| POST Endpoints | Shared secret | `WEBHOOK_SECRET` must be included in JSON body as `secret` field |
| Google Sheets | Google OAuth | Only users with spreadsheet access can view/edit data |
| WhatsApp API | Bearer token | `WHATSAPP_TOKEN` sent as Authorization header |
| Claude API | API key | `CLAUDE_API_KEY` sent as `x-api-key` header |

### OAuth Scopes (appsscript.json)

| Scope | Purpose |
|---|---|
| `spreadsheets.currentonly` | Read/write the bound spreadsheet |
| `script.external_request` | Call WhatsApp and Claude APIs via UrlFetchApp |
| `script.send_mail` | Send summary emails via MailApp |
| `cache` | CacheService for config value caching |

### Token Management

- WhatsApp tokens and Claude API keys are stored in the Config tab of the spreadsheet (not hardcoded in source).
- CacheService stores config values in memory for 10 minutes, reducing sheet reads but ensuring changes propagate within a reasonable window.
- The `clearConfigCache()` function can be called to force immediate cache invalidation after a config update.

### Data Protection

- Phone numbers are normalized to E.164 format before sending, preventing format-related failures.
- All messages are logged in the Log tab, providing a complete audit trail.
- Override/emergency messages are separately tracked in the Overrides tab with sender attribution.

---

## Error Handling Strategy

### Design Principles

1. **Try-catch everywhere**: Every external API call (WhatsApp, Claude) is wrapped in try-catch blocks. Failures are logged, not thrown.
2. **Fallback templates**: If Claude API fails or is disabled, `buildFallbackMessage_()` provides hardcoded templates for all 8 message types.
3. **Graceful degradation**: A Claude API failure does not block message delivery. The system falls back silently.
4. **Email summaries**: After every batch operation (daily schedule, overrides), a summary email is sent to the spreadsheet owner with counts and error details.
5. **HTTP response wrapping**: All web app responses return structured JSON with `success` boolean and `message` string, even on errors.

### Error Flow

```
External API call fails
       |
       v
  catch(e) --> Logger.log(error details)
       |
       v
  [Claude API] --> Fall back to template message --> Continue sending
  [WhatsApp API] --> Return { success: false, error: "..." } --> Log to sheet
       |
       v
  After batch --> sendSummaryEmail() with error array
```

### Apps Script Limitations

- Apps Script web apps always return HTTP 200 regardless of internal errors. Success/failure is conveyed in the JSON response body.
- Execution time limit: 6 minutes per execution. Daily schedule sends are designed to complete well within this limit for typical class sizes.

---

## Performance Optimizations

| Optimization | Implementation | Impact |
|---|---|---|
| Config caching | CacheService with 10-minute TTL | Reduces spreadsheet reads by up to 90% during batch operations |
| Rate limiting | 200ms `Utilities.sleep()` between sends | Prevents WhatsApp API rate limit violations |
| Batch grouping | Schedules grouped by class before student lookup | Minimizes redundant sheet reads |
| Template sends | Uses pre-approved WhatsApp templates | No 24-hour window requirement; reliable delivery |
| Selective triggers | onEdit handler filters by sheet name and column | Avoids unnecessary processing on irrelevant edits |
| Markdown stripping | Claude responses cleaned of `*_~\`#` characters | Prevents WhatsApp rendering issues |
| Message length cap | Enforced 1024-character maximum on all messages | Prevents API rejection for oversized messages |

---

## Function Reference

41 functions across 8 files (1,615 lines of code).

### config.gs (4 functions, 100 LOC)

| Function | Visibility | Description |
|---|---|---|
| `getConfig(key)` | Public | Reads a config value by key with CacheService caching |
| `readConfigFromSheet_(key)` | Private | Reads a config value directly from the Config sheet |
| `clearConfigCache()` | Public | Clears all cached config values from CacheService |
| `validateConfig()` | Public | Validates all 10 required config keys are present and not placeholders |

### composer.gs (4 functions, 202 LOC)

| Function | Visibility | Description |
|---|---|---|
| `composeMessage(student, scheduleRow, changeType, oldValue, newValue)` | Public | Composes a notification message using Claude AI or fallback templates |
| `buildClaudePrompt(student, schedule, changeType, oldValue, newValue)` | Public | Builds system + user prompt objects for the Claude API |
| `callClaudeAPI(systemPrompt, userMessage)` | Public | Calls the Anthropic Claude Messages API and returns response text |
| `buildFallbackMessage_(student, schedule, changeType, oldValue, newValue)` | Private | Builds hardcoded template messages for all 8 notification types |

### scheduler.gs (3 functions, 219 LOC)

| Function | Visibility | Description |
|---|---|---|
| `sendDailySchedule()` | Public | Sends today's schedule notifications to all active students (trigger entry point) |
| `sendDailyScheduleForDate(dateStr)` | Public | Manually triggers daily schedule for a specific date |
| `sendDailyScheduleWithDate_(dateStr)` | Private | Internal implementation for custom-date daily schedule sends |

### sender.gs (5 functions, 193 LOC)

| Function | Visibility | Description |
|---|---|---|
| `composeAndSend(student, scheduleRow, changeType, oldValue, newValue)` | Public | Composes a message and sends it via WhatsApp, then logs the result |
| `sendFreeForm(phone, text)` | Public | Sends a free-form text message (requires 24-hour conversation window) |
| `sendTemplate(phone, templateName, params)` | Public | Sends a template-based message (no prior conversation required) |
| `executeWhatsAppRequest_(url, token, payload)` | Private | Executes a WhatsApp Cloud API HTTP request |
| `batchSend(students, scheduleRow, changeType, oldValue, newValue)` | Public | Sends messages to multiple students with 200ms rate limiting |

### setup.gs (5 functions, 170 LOC)

| Function | Visibility | Description |
|---|---|---|
| `createSheetStructure()` | Public | Creates all 5 sheet tabs with headers and default config values |
| `getOrCreateSheet_(ss, name)` | Private | Returns an existing sheet by name or creates a new one |
| `installTriggers()` | Public | Installs daily time-driven and installable onEdit triggers |
| `removeAllTriggers()` | Public | Removes all project triggers (cleanup utility) |
| `testSetup()` | Public | Validates config values, required tabs, and active triggers |

### utils.gs (11 functions, 303 LOC)

| Function | Visibility | Description |
|---|---|---|
| `getStudentsByClass(className)` | Public | Returns active student objects filtered by class name |
| `getAllActiveStudents()` | Public | Returns all active student objects across all classes |
| `getStudentByPhone(phone)` | Public | Looks up a student by phone number (E.164 normalized) |
| `getTodaySchedule(className, dateStr)` | Public | Returns today's active schedule rows, optionally filtered by class |
| `getScheduleRow(rowNum)` | Public | Reads a full schedule row by 1-based sheet row number |
| `formatDateValue_(val)` | Private | Normalizes a Date object or string to YYYY-MM-DD format |
| `getIndiaDate()` | Public | Returns today's date in IST (YYYY-MM-DD) |
| `getIndiaTimestamp()` | Public | Returns current IST timestamp (YYYY-MM-DD HH:mm:ss) |
| `formatPhoneNumber(phone)` | Public | Normalizes phone numbers to E.164 format (+91XXXXXXXXXX) |
| `logToSheet(logData)` | Public | Appends a delivery record to the Log tab |
| `logToOverrides(data)` | Public | Appends an override record to the Overrides tab |
| `sendSummaryEmail(summary)` | Public | Sends a summary email to the spreadsheet owner |
| `getConfigValue(key)` | Public | Convenience wrapper around getConfig() |

### watcher.gs (1 function, 114 LOC)

| Function | Visibility | Description |
|---|---|---|
| `onScheduleEdit(e)` | Public | Installable onEdit handler that detects schedule changes and sends notifications |

### webapp.gs (6 functions, 314 LOC)

| Function | Visibility | Description |
|---|---|---|
| `doPost(e)` | Public | POST endpoint handler for manual/emergency notifications |
| `doGet(e)` | Public | GET endpoint handler for health checks and setup utilities |
| `handleOverride_(body)` | Private | Processes send_override action (custom message to class/student/all) |
| `handleDailyTrigger_(body)` | Private | Processes send_daily action (trigger daily schedule) |
| `handleTestSend_(body)` | Private | Processes send_test action (test message to single phone) |
| `jsonResponse_(data, statusCode)` | Private | Creates a JSON ContentService response |

---

## Deployment Model

The system is deployed as a Google Apps Script project bound to a Google Spreadsheet:

1. **Script Editor**: All 8 `.gs` files are maintained in the Apps Script editor (or pushed via `clasp`).
2. **Web App**: Deployed via Apps Script deployment as a web app with "Execute as: Me" and "Access: Anyone" settings.
3. **Triggers**: Installed via `installTriggers()` -- one time-driven (daily) and one installable onEdit.
4. **No external infrastructure**: No servers, databases, or CI/CD pipelines required. The entire system runs within Google's free tier.

---

*Document generated for Muzigal Musical Academy by Aldrin Stellus.*
