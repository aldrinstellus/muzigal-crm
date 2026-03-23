# API Reference

## WhatsApp Class Notification System for Muzigal

**Client:** Muzigal Musical Academy, Borewell Road, Whitefield, Bangalore
**Developer:** Aldrin Stellus

---

## Base URL

```
https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec
```

Replace `{DEPLOYMENT_ID}` with the actual deployment ID from the Apps Script web app deployment. The deployment ID is a long alphanumeric string generated when you deploy the script as a web app.

---

## Authentication

| Method | Authentication | Details |
|---|---|---|
| GET | None required | All GET endpoints are publicly accessible |
| POST | Webhook secret | Include `"secret": "<WEBHOOK_SECRET>"` in the JSON request body |

The `WEBHOOK_SECRET` value is stored in the Config tab of the Google Sheet. POST requests with a missing or incorrect secret will receive a `403` error response.

---

## Important Notes

- **Apps Script always returns HTTP 200.** Even when an error occurs, the HTTP status code will be 200. Success or failure is indicated by the `success` or `status` field in the JSON response body.
- **Rate limiting**: Batch operations insert a 200ms delay between individual WhatsApp sends to avoid Meta API rate limits. This is handled server-side; clients do not need to implement their own rate limiting.
- **Execution timeout**: Google Apps Script has a 6-minute execution limit. For large batches (100+ students), monitor the response to ensure completion.

---

## Error Response Format

All error responses follow this structure:

```json
{
  "success": false,
  "message": "Description of what went wrong"
}
```

For GET endpoints, errors use `"status": "error"` instead of `"success": false`:

```json
{
  "status": "error",
  "message": "Description of what went wrong"
}
```

---

## GET Endpoints

All GET endpoints use the `?action=` query parameter to select the operation. If no action is specified, the default `health` action is used.

---

### 1. Health Check

Returns system status, current timestamp, and active trigger count.

| Property | Value |
|---|---|
| **Method** | GET |
| **Action** | `health` (default) |

**Parameters**

| Name | Type | Required | Description |
|---|---|---|---|
| `action` | string | No | Omit or set to `health` |

**Example Request**

```bash
curl "https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec"
```

```bash
curl "https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec?action=health"
```

**Example Success Response**

```json
{
  "status": "ok",
  "timestamp": "2026-03-24 08:00:00",
  "triggerCount": 2
}
```

**Notes**

- The `triggerCount` reflects the number of active Apps Script triggers (typically 2: one daily time-driven and one onEdit).

---

### 2. Setup

Creates the full sheet structure: all 5 tabs (Students, Schedule, Config, Log, Overrides) with headers and default config values.

| Property | Value |
|---|---|
| **Method** | GET |
| **Action** | `setup` |

**Parameters**

| Name | Type | Required | Description |
|---|---|---|---|
| `action` | string | Yes | Must be `setup` |

**Example Request**

```bash
curl "https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec?action=setup"
```

**Example Success Response**

```json
{
  "status": "ok",
  "message": "Sheet structure created successfully",
  "timestamp": "2026-03-24 08:00:00"
}
```

**Notes**

- Safe to call multiple times. If tabs and headers already exist, they will not be duplicated.
- The Config tab will be pre-populated with 10 default key-value pairs (all placeholder values).

---

### 3. Set Config

Updates a single config key-value pair in the Config tab. If the key does not exist, it will be appended as a new row.

| Property | Value |
|---|---|
| **Method** | GET |
| **Action** | `set_config` |

**Parameters**

| Name | Type | Required | Description |
|---|---|---|---|
| `action` | string | Yes | Must be `set_config` |
| `key` | string | Yes | Config key name (e.g., `SCHOOL_NAME`) |
| `value` | string | Yes | Config value to set (e.g., `Muzigal`) |

**Example Request**

```bash
curl "https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec?action=set_config&key=SCHOOL_NAME&value=Muzigal"
```

**Example Success Response**

```json
{
  "status": "ok",
  "message": "Config SCHOOL_NAME updated",
  "timestamp": "2026-03-24 08:00:00"
}
```

**Example Error Response**

```json
{
  "status": "error",
  "message": "Missing key or value parameter"
}
```

**Notes**

- The cache entry for the updated key is cleared immediately, ensuring the new value is used on the next read.
- Sensitive values (API keys, tokens) can be set via this endpoint but will be visible in the Config tab of the spreadsheet.

---

### 4. Get Config

Returns all config key-value pairs from the Config tab.

| Property | Value |
|---|---|
| **Method** | GET |
| **Action** | `get_config` |

**Parameters**

| Name | Type | Required | Description |
|---|---|---|---|
| `action` | string | Yes | Must be `get_config` |

**Example Request**

```bash
curl "https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec?action=get_config"
```

**Example Success Response**

```json
{
  "status": "ok",
  "config": {
    "WHATSAPP_TOKEN": "EAABx...",
    "PHONE_NUMBER_ID": "10620...",
    "TEMPLATE_NAME": "class_update",
    "CLAUDE_API_KEY": "sk-ant-...",
    "USE_CLAUDE": "TRUE",
    "DAILY_SEND_HOUR": "8",
    "DAILY_SEND_MINUTE": "0",
    "TIMEZONE": "Asia/Kolkata",
    "SCHOOL_NAME": "Muzigal",
    "WEBHOOK_SECRET": "mysecret123"
  }
}
```

**Notes**

- This endpoint returns sensitive values (API keys, tokens) in plaintext. Use with caution in production.
- The response is not cached; it reads directly from the Config sheet.

---

### 5. Add Student

Adds a new student row to the Students tab.

| Property | Value |
|---|---|
| **Method** | GET |
| **Action** | `add_student` |

**Parameters**

| Name | Type | Required | Description |
|---|---|---|---|
| `action` | string | Yes | Must be `add_student` |
| `id` | string | Yes | Student ID (e.g., `STU001`) |
| `name` | string | Yes | Student full name (e.g., `Ravi Kumar`) |
| `phone` | string | Yes | Phone number (e.g., `9876543210`) |
| `cls` | string | Yes | Class name (e.g., `Guitar Beginner`) |

**Example Request**

```bash
curl "https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec?action=add_student&id=STU001&name=Ravi%20Kumar&phone=9876543210&cls=Guitar%20Beginner"
```

**Example Success Response**

```json
{
  "status": "ok",
  "message": "Student added"
}
```

**Notes**

- The student is automatically set to `Active = TRUE`.
- The `cls` parameter name is used instead of `class` to avoid JavaScript reserved word conflicts.
- Phone numbers are stored as-is; they are normalized to E.164 format at send time.

---

### 6. Add Schedule

Adds a new schedule entry to the Schedule tab.

| Property | Value |
|---|---|
| **Method** | GET |
| **Action** | `add_schedule` |

**Parameters**

| Name | Type | Required | Description |
|---|---|---|---|
| `action` | string | Yes | Must be `add_schedule` |
| `id` | string | Yes | Schedule ID (e.g., `SCH001`) |
| `cls` | string | Yes | Class name (e.g., `Guitar Beginner`) |
| `subject` | string | Yes | Subject name (e.g., `Guitar`) |
| `teacher` | string | Yes | Teacher name (e.g., `Mr. Sharma`) |
| `room` | string | Yes | Room name (e.g., `Studio 3`) |
| `date` | string | Yes | Class date in YYYY-MM-DD format |
| `time` | string | Yes | Class time (e.g., `10:00 AM`) |

**Example Request**

```bash
curl "https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec?action=add_schedule&id=SCH001&cls=Guitar%20Beginner&subject=Guitar&teacher=Mr.%20Sharma&room=Studio%203&date=2026-03-24&time=10:00%20AM"
```

**Example Success Response**

```json
{
  "status": "ok",
  "message": "Schedule added"
}
```

**Notes**

- The schedule entry is automatically set to `Status = Active`.
- LastModified and ModifiedBy are initially empty; they are populated when the row is later edited via the sheet.

---

### 7. Install Triggers

Installs (or reinstalls) all Apps Script triggers: the daily time-driven trigger and the installable onEdit trigger.

| Property | Value |
|---|---|
| **Method** | GET |
| **Action** | `install_triggers` |

**Parameters**

| Name | Type | Required | Description |
|---|---|---|---|
| `action` | string | Yes | Must be `install_triggers` |

**Example Request**

```bash
curl "https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec?action=install_triggers"
```

**Example Success Response**

```json
{
  "status": "ok",
  "message": "Triggers installed",
  "timestamp": "2026-03-24 08:00:00"
}
```

**Notes**

- This removes all existing triggers before installing new ones, preventing duplicates.
- The daily trigger time is read from `DAILY_SEND_HOUR` and `DAILY_SEND_MINUTE` in the Config tab.
- The daily trigger uses `nearMinute()`, which means the actual execution may occur within a 15-minute window around the configured time.

---

## POST Endpoints

All POST endpoints require a valid `secret` field in the JSON body matching the `WEBHOOK_SECRET` config value.

---

### 1. Send Override

Sends a custom message to a specific class, individual student, or all active students.

| Property | Value |
|---|---|
| **Method** | POST |
| **Action** | `send_override` |

**Parameters (JSON body)**

| Name | Type | Required | Description |
|---|---|---|---|
| `secret` | string | Yes | Must match `WEBHOOK_SECRET` in Config |
| `action` | string | Yes | Must be `send_override` |
| `target_type` | string | Yes | Target scope: `class`, `student`, or `all` |
| `target_value` | string | Conditional | Class name (for `class`), phone number (for `student`), or omit for `all` |
| `message` | string | Yes | Message text. Use `{name}` placeholder for student's first name |
| `sent_by` | string | No | Sender identifier (defaults to `API`) |

**Example Request**

```bash
curl -X POST "https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "your_webhook_secret",
    "action": "send_override",
    "target_type": "class",
    "target_value": "Guitar Beginner",
    "message": "Hi {name}, Muzigal will be closed tomorrow for a public holiday. No classes scheduled. Enjoy your day off!",
    "sent_by": "admin@muzigal.com"
  }'
```

**Example Success Response**

```json
{
  "success": true,
  "sent": 12,
  "failed": 0,
  "errors": [],
  "message": "Override sent to 12 student(s)"
}
```

**Example Error Response**

```json
{
  "success": false,
  "message": "Student not found: +919999999999"
}
```

**Notes**

- The `{name}` placeholder in the message is replaced with each student's first name before sending.
- Override messages are logged in both the Log tab (per-recipient) and the Overrides tab (per-broadcast).
- A 200ms delay is applied between each individual send.

---

### 2. Send Daily

Triggers the daily schedule notification flow, optionally for a specific date.

| Property | Value |
|---|---|
| **Method** | POST |
| **Action** | `send_daily` |

**Parameters (JSON body)**

| Name | Type | Required | Description |
|---|---|---|---|
| `secret` | string | Yes | Must match `WEBHOOK_SECRET` in Config |
| `action` | string | Yes | Must be `send_daily` |
| `date` | string | No | Date in YYYY-MM-DD format (defaults to today IST) |

**Example Request**

```bash
curl -X POST "https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "your_webhook_secret",
    "action": "send_daily"
  }'
```

**Example Request (specific date)**

```bash
curl -X POST "https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "your_webhook_secret",
    "action": "send_daily",
    "date": "2026-03-25"
  }'
```

**Example Success Response**

```json
{
  "success": true,
  "message": "Daily schedule triggered for 2026-03-24"
}
```

**Example Error Response**

```json
{
  "success": false,
  "message": "Invalid secret"
}
```

**Notes**

- This performs the same operation as the daily time-driven trigger but can be invoked manually at any time.
- Useful for re-sending notifications after a failure or for testing with a future/past date.
- A summary email is sent to the spreadsheet owner after completion.

---

### 3. Send Test

Sends a single test message to a specified phone number.

| Property | Value |
|---|---|
| **Method** | POST |
| **Action** | `send_test` |

**Parameters (JSON body)**

| Name | Type | Required | Description |
|---|---|---|---|
| `secret` | string | Yes | Must match `WEBHOOK_SECRET` in Config |
| `action` | string | Yes | Must be `send_test` |
| `phone` | string | Yes | Recipient phone number (any Indian format) |
| `message` | string | No | Custom test message (defaults to a standard test message) |

**Example Request**

```bash
curl -X POST "https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "your_webhook_secret",
    "action": "send_test",
    "phone": "9876543210",
    "message": "Hello from Muzigal! This is a test notification."
  }'
```

**Example Success Response**

```json
{
  "success": true,
  "messageId": "wamid.HBgNOTE4NjU0MzIxMDAVAgARGBI1QjRGRjA2MzYwNTNBQzgwRQA=",
  "message": "Test message sent"
}
```

**Example Error Response**

```json
{
  "success": false,
  "messageId": "",
  "message": "Failed: HTTP 400: (#131030) Recipient phone number not in allowed list"
}
```

**Notes**

- The default test message is: "This is a test message from the WhatsApp Class Notification System."
- The phone number is automatically normalized to E.164 format before sending.
- The test send is logged to the Log tab with `MessageType = test` and `StudentName = TEST`.
- In WhatsApp test mode (before business verification), only phone numbers added to your test recipient list in Meta Business Manager will receive messages.

---

## Rate Limiting

The system implements server-side rate limiting for batch operations:

| Context | Delay | Applied In |
|---|---|---|
| Daily schedule sends | 200ms between students | `scheduler.gs :: sendDailySchedule()` |
| Batch sends (change notifications) | 200ms between students | `sender.gs :: batchSend()` |
| Override broadcasts | 200ms between students | `webapp.gs :: handleOverride_()` |

Individual sends (test messages, single student overrides) do not have rate limiting applied.

---

## Message Types

The system supports the following notification types, used in both the `changeType` parameter and the `MessageType` column of the Log tab:

| Type | Trigger | Description |
|---|---|---|
| `daily_schedule` | Time-driven or POST send_daily | Today's class schedule summary |
| `teacher_change` | onEdit (Teacher column) | Teacher assignment changed |
| `room_change` | onEdit (Room column) | Room/studio assignment changed |
| `time_change` | onEdit (Time column) | Class time changed |
| `date_change` | onEdit (Date column) | Class date changed |
| `cancellation` | onEdit (Status = Cancelled) | Class cancelled |
| `reschedule` | onEdit (Status = Rescheduled) | Class rescheduled |
| `override` | POST send_override | Custom/emergency message |
| `test` | POST send_test | Test message |

---

*Document generated for Muzigal Musical Academy by Aldrin Stellus.*
