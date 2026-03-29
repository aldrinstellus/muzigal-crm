# Setup Guide -- WhatsApp Class Notifications

Complete step-by-step guide to deploy this system for Muzigal (or any music academy).

---

## Prerequisites

- **Google account** (free) -- for Google Sheets and Apps Script
- **Meta Developer account** (free) -- [developers.facebook.com](https://developers.facebook.com)
- **Anthropic API key** (optional) -- [console.anthropic.com](https://console.anthropic.com) for Claude-powered message composition
- **A phone with WhatsApp** -- to receive test messages during setup

---

## Step 1: Create the Google Apps Script Project

### Option A: Manual (browser)

1. Open [script.google.com](https://script.google.com)
2. Click **New Project**
3. Rename the project to `WhatsApp Class Notifications`
4. Delete the default contents of `Code.gs`

Create a script file for each `.gs` file in this repository:

| File to create | How |
|----------------|-----|
| `setup.gs` | Click `+` next to Files > Script > name it `setup` |
| `config.gs` | Click `+` next to Files > Script > name it `config` |
| `utils.gs` | Click `+` next to Files > Script > name it `utils` |
| `composer.gs` | Click `+` next to Files > Script > name it `composer` |
| `sender.gs` | Click `+` next to Files > Script > name it `sender` |
| `watcher.gs` | Click `+` next to Files > Script > name it `watcher` |
| `scheduler.gs` | Click `+` next to Files > Script > name it `scheduler` |
| `webapp.gs` | Click `+` next to Files > Script > name it `webapp` |

Copy-paste the contents of each local `.gs` file into the matching script file. You can delete the default `Code.gs` after copying everything.

### Option B: Using clasp (CLI)

```bash
# Install clasp globally
npm install -g @google/clasp

# Log in to your Google account
clasp login

# Create a new Apps Script project
clasp create --title "WhatsApp Class Notifications" --type sheets

# Push all .gs files
clasp push
```

The `.clasp.json.example` file in this repository shows the expected clasp configuration format.

---

## Step 2: Build the Sheet Structure

1. In the Apps Script editor, select `setup.gs` from the file list
2. Select `createSheetStructure` from the function dropdown (top toolbar)
3. Click **Run**
4. When prompted, click **Review permissions** > choose your Google account > **Allow**
5. Check the **Execution log** -- it should say `Sheet structure created successfully`
6. Open the linked Google Sheet -- you should see 5 tabs:

| Tab | Purpose |
|-----|---------|
| **Students** | Student roster with names, phones, instrument classes, active status |
| **Schedule** | Daily class schedule with teacher, room, time, date, status |
| **Log** | Delivery log for every WhatsApp message sent |
| **Overrides** | Record of manual/emergency broadcast messages |
| **Config** | Key-value configuration (API tokens, settings) |

---

## Step 3: Set Up WhatsApp Business API

### 3a: Create a Meta Developer App

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Click **My Apps** > **Create App**
3. Select **Other** > **Business** > fill in the app name (e.g., "Muzigal Notifications")
4. On the app dashboard, find **WhatsApp** > click **Set Up**
5. You will get a **temporary access token** and **Phone Number ID** -- copy both

### 3b: Create a Message Template

1. In the Meta Business Manager, go to **WhatsApp Manager** > **Message Templates**
2. Click **Create Template**
3. Configure:
   - **Category**: Utility
   - **Template name**: `class_update`
   - **Language**: English
   - **Body**: `{{1}}`
4. Submit for review

When using Meta's test phone numbers, templates are approved instantly. For production numbers, approval typically takes a few minutes to a few hours.

### 3c: Add Your Test Phone as a Recipient

1. In the WhatsApp setup page, under **API Setup**
2. Find the **To** field > click **Manage phone number list**
3. Add your personal WhatsApp number (the number that will RECEIVE test messages)
4. Verify with the OTP sent to your WhatsApp

---

## Step 4: Fill the Config Tab

Open the Google Sheet > **Config** tab. Update all 10 values:

| Key | Value to Enter | Where to Get It |
|-----|----------------|-----------------|
| `WHATSAPP_TOKEN` | `EAAxxxxxxx...` | Meta App Dashboard > WhatsApp > API Setup > Temporary access token |
| `PHONE_NUMBER_ID` | `1234567890` | Meta App Dashboard > WhatsApp > API Setup > Phone Number ID |
| `TEMPLATE_NAME` | `class_update` | The template name you created in Step 3b |
| `CLAUDE_API_KEY` | `sk-ant-xxxxx` | console.anthropic.com > API Keys (or leave as placeholder if USE_CLAUDE is FALSE) |
| `USE_CLAUDE` | `TRUE` or `FALSE` | Set `FALSE` to use built-in templates instead of Claude AI |
| `DAILY_SEND_HOUR` | `8` | Hour in 24hr format (IST) when daily reminders are sent |
| `DAILY_SEND_MINUTE` | `0` | Minute for daily sends (e.g., `0` for 8:00 AM, `30` for 8:30 AM) |
| `TIMEZONE` | `Asia/Kolkata` | Leave as-is for IST (Bangalore time) |
| `SCHOOL_NAME` | `Muzigal` | Your academy name -- appears in all student messages |
| `WEBHOOK_SECRET` | `muzigal-notify-2026` | You choose this -- a strong secret string for web app POST authentication |

---

## Step 5: Add Test Data

### Students tab

Add rows below the header. Replace at least one phone number with YOUR real WhatsApp number to receive test messages.

```
StudentID | Name              | Phone          | Class         | Active
MZ001     | Arjun Nair        | +919876543210  | Guitar Batch  | TRUE
MZ002     | Kavya Reddy       | +919876543211  | Guitar Batch  | TRUE
MZ003     | Rohan Menon       | +919876543212  | Piano Basics  | TRUE
MZ004     | Sneha Iyer        | +919876543213  | Drums Level 2 | TRUE
MZ005     | Aditya Krishnan   | +919876543214  | Vocals        | TRUE
MZ006     | Priya Sharma      | +919876543215  | Violin Grade 1| TRUE
```

### Schedule tab

Add rows with today's date:

```
ScheduleID | Class          | Subject            | Teacher           | Room       | Date       | Time  | Status | LastModified | ModifiedBy
SCH001     | Guitar Batch   | Acoustic Guitar    | Mr. Rajesh Kumar  | Studio A   | 2026-03-23 | 10:00 | Active |              |
SCH002     | Guitar Batch   | Music Theory       | Ms. Divya Nair    | Room 3     | 2026-03-23 | 11:30 | Active |              |
SCH003     | Piano Basics   | Piano Fundamentals | Mrs. Lakshmi Rao  | Piano Room | 2026-03-23 | 10:00 | Active |              |
SCH004     | Drums Level 2  | Drum Kit           | Mr. Sanjay Patil  | Studio B   | 2026-03-23 | 14:00 | Active |              |
SCH005     | Vocals         | Carnatic Vocals    | Ms. Ananya Bhat   | Room 2     | 2026-03-23 | 15:00 | Active |              |
SCH006     | Violin Grade 1 | Violin Basics      | Mr. Vikram Joshi  | Studio A   | 2026-03-23 | 16:30 | Active |              |
```

Update the `Date` column to today's actual date (YYYY-MM-DD format).

---

## Step 6: Validate Setup

1. In the Apps Script editor, select `setup.gs`
2. Select `testSetup` from the function dropdown > click **Run**
3. Check the execution log for:
   - `All config values are set. Setup is valid.` -- all Config entries are filled
   - `All required tabs exist.` -- all 5 tabs are present
   - `Active triggers: 0` -- triggers not installed yet (expected at this step)

If you see `Missing or placeholder config keys: [...]`, go back to the Config tab and fill those values.

---

## Step 7: Deploy as Web App

1. In the Apps Script editor: **Deploy** > **New deployment**
2. Click the gear icon > **Web app**
3. Configure:
   - **Description**: `Muzigal WhatsApp Notifications v1`
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click **Deploy**
5. Copy the **Web app URL** -- this is your POST/GET endpoint

Test the health check endpoint:

```bash
curl "YOUR_WEB_APP_URL"
```

Expected response:

```json
{"status":"ok","timestamp":"2026-03-23 10:30:00","triggerCount":0}
```

---

## Step 8: Install Triggers

1. In the Apps Script editor, select `setup.gs`
2. Select `installTriggers` from the function dropdown > click **Run**
3. Verify in the execution log: `Triggers installed: daily at 8:0 IST, onEdit for Schedule tab.`
4. Confirm on the **Triggers** page (clock icon in the left sidebar) -- you should see 2 triggers:
   - `sendDailySchedule` -- Time-driven, daily
   - `onScheduleEdit` -- From spreadsheet, On edit

---

## Step 9: End-to-End Test

Run these 4 tests in order to verify the complete system.

### Test A: Manual WhatsApp Send

In the Apps Script editor, create a temporary function or use the test functions from [TESTING.md](TESTING.md). Run `testWhatsAppSend` with your real phone number. You should receive a WhatsApp message within seconds.

### Test B: Edit Trigger

1. Open the Schedule tab in Google Sheets
2. Change a teacher name (e.g., `Mr. Rajesh Kumar` > `Ms. Priya Menon`)
3. Wait 5-10 seconds (the trigger fires asynchronously)
4. Check the **Log** tab -- a new row should appear with delivery status
5. Check your WhatsApp -- you should receive a teacher change notification

### Test C: Web App Override

Send an emergency broadcast via the API:

```bash
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "muzigal-notify-2026",
    "action": "send_override",
    "target_type": "class",
    "target_value": "Guitar Batch",
    "message": "Guitar class today has been moved to Studio B due to maintenance. Please head to Studio B at 10:00 AM.",
    "sent_by": "Front Desk"
  }'
```

### Test D: Daily Schedule

Run `sendDailySchedule()` manually from the Apps Script editor. Check the Log tab for results and your WhatsApp for the schedule message.

---

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| "WhatsApp API not configured" | WHATSAPP_TOKEN or PHONE_NUMBER_ID is missing or still set to `(placeholder)` | Fill both values in the Config tab from your Meta App Dashboard |
| Template not found error | Template name in Config does not match the one created in Meta | Verify the exact template name (case-sensitive) and that it is approved |
| 401 Unauthorized from WhatsApp | Temporary access token has expired (they last 24 hours) | Generate a new token from Meta Dashboard > WhatsApp > API Setup |
| Claude API returns null | CLAUDE_API_KEY is invalid or has no credits | Verify the key at console.anthropic.com; or set `USE_CLAUDE=FALSE` to use fallback templates |
| No message received on WhatsApp | Your number is not in Meta's test recipient list | Add your number under API Setup > Manage phone number list > verify with OTP |
| onEdit trigger not firing | Using a simple `onEdit()` instead of the installable trigger | Run `installTriggers()` from `setup.gs` -- this creates the proper installable trigger |
| Permissions error on first run | Google has not yet been granted access | Re-run any function and click Review permissions > Allow when prompted |

---

## Going to Production

When you are ready to move beyond test mode and send to real students:

1. **Register a WhatsApp Business number** -- Verify your academy's phone number through Meta Business Manager (not just the test sandbox number)

2. **Get a permanent System User token** -- Temporary tokens expire in 24 hours. Create a System User in Business Settings and generate a permanent token with the `whatsapp_business_messaging` permission.

3. **Get your message template approved** -- Submit the `class_update` template with your actual message format. Meta reviews these within minutes to hours.

4. **Add all student phone numbers** -- Populate the Students tab with every active student's WhatsApp number. Use the `Class` column to group by instrument/batch (e.g., `Guitar Batch`, `Piano Basics`, `Drums Level 2`).

5. **Set the daily trigger time** -- Update `DAILY_SEND_HOUR` and `DAILY_SEND_MINUTE` in the Config tab to when you want morning reminders sent (e.g., `7` and `30` for 7:30 AM IST).

6. **Monitor the Log tab** -- Check regularly for delivery failures. The system also sends email summaries after each daily run and when batch sends have errors.

7. **Rotate secrets periodically** -- Update `WEBHOOK_SECRET` every few months and update any external integrations that call your web app endpoint.
