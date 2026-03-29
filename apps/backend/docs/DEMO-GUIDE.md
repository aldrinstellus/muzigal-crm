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
  headerTemplate: '<div style="font-size:8px;color:#999;width:100%;text-align:right;margin-right:20mm;">Muzigal — WhatsApp Notifications Demo Guide</div>'
  footerTemplate: '<div style="font-size:8px;color:#999;width:100%;text-align:center;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>'
css: |-
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  body { font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; color: #1a1a2e; line-height: 1.75; font-size: 11pt; }
  h1 { color: #1a1a2e; font-weight: 700; font-size: 22pt; border-bottom: 2px solid #16213e; padding-bottom: 6px; margin-top: 36px; }
  h2 { color: #16213e; font-weight: 600; font-size: 15pt; border-bottom: 1px solid #e0e0e0; padding-bottom: 4px; margin-top: 28px; }
  h3 { color: #2d3748; font-weight: 600; font-size: 12pt; margin-top: 18px; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 9.5pt; }
  th { background-color: #1a1a2e; color: #fff; padding: 8px 10px; text-align: left; font-weight: 600; }
  td { border: 1px solid #ddd; padding: 7px 10px; }
  tr:nth-child(even) { background-color: #f8f9fa; }
  code { background-color: #f0f0f0; padding: 1px 5px; border-radius: 3px; font-size: 9.5pt; color: #c7254e; }
  pre { background-color: #1a1a2e; color: #e8e8e8; padding: 14px; border-radius: 5px; font-size: 8.5pt; overflow-x: auto; line-height: 1.5; }
  pre code { background: none; color: inherit; padding: 0; }
  blockquote { border-left: 4px solid #25D366; margin: 14px 0; padding: 10px 16px; background: #f0faf0; color: #1a1a2e; font-style: normal; border-radius: 0 6px 6px 0; }
  blockquote strong { color: #25D366; }
  .page-break { page-break-before: always; }
  .cover { text-align: center; padding-top: 180px; page-break-after: always; }
  .cover h1 { font-size: 28pt; border: none; color: #1a1a2e; margin-bottom: 4px; letter-spacing: -0.5px; }
  .cover .subtitle { font-size: 14pt; color: #555; font-weight: 300; margin-bottom: 50px; }
  .cover .divider { width: 60px; height: 3px; background: #16213e; margin: 30px auto; }
  .cover .meta { font-size: 10.5pt; color: #444; line-height: 2; }
  .step-box { background: #f8f9fa; border: 1px solid #e0e0e0; border-radius: 6px; padding: 14px 16px; margin: 12px 0; }
  .result-box { background: #f0faf0; border: 1px solid #c8e6c9; border-radius: 6px; padding: 14px 16px; margin: 12px 0; }
  .warn-box { background: #fff8e1; border: 1px solid #ffe082; border-radius: 6px; padding: 14px 16px; margin: 12px 0; }
---

<div class="cover">

# Demo Guide

<div class="subtitle">See Your WhatsApp Notification System in Action</div>

<div class="divider"></div>

<div class="meta">

**For** Cecil & Giri — Muzigal, Whitefield, Bangalore

**From** Aldrin Stellus

March 2026

</div>

</div>

# What This Guide Covers

This guide walks you through **8 hands-on demos** that show exactly what the system can do. Each demo follows a simple pattern:

1. **You do something** (type in a spreadsheet, run a command)
2. **The system does its thing** (processes the change, sends messages)
3. **Students receive a WhatsApp message** (you can verify on your phone)

No coding. No technical knowledge. Just follow the steps.

### The 8 Demos

| # | Demo | What You'll See |
|---|------|----------------|
| 1 | Add a Student | Register a new student in the system |
| 2 | Add a Class Schedule | Set up a music class for a specific date |
| 3 | Daily Morning Reminder | See what students receive every morning at 8 AM |
| 4 | Change a Teacher | Edit a teacher name and watch the WhatsApp arrive |
| 5 | Change a Room | Move a class to a different studio |
| 6 | Cancel a Class | Mark a class as cancelled — students know instantly |
| 7 | Emergency Announcement | Send a custom message to everyone |
| 8 | Check Delivery Logs | Verify every message was delivered |

**Time to complete all demos**: About 15 minutes.

<div class="page-break"></div>

# Before You Start

You need two things open:

### 1. The Google Sheet

Open the Muzigal WhatsApp Notifications spreadsheet in your browser. You'll see 5 tabs at the bottom:

```
[ Students ]  [ Schedule ]  [ Log ]  [ Overrides ]  [ Config ]
```

### 2. Your Phone

Keep your phone nearby with WhatsApp open. You'll receive test messages as you go through the demos.

### 3. Your Web App URL (for Demo 7)

This is the system's web address. It looks like:

```
https://script.google.com/macros/s/XXXX.../exec
```

You'll find the exact URL in the Config tab or from the person who set up the system.

---

**Ready? Let's go.**

<div class="page-break"></div>

# Demo 1: Add a Student

**Goal**: Register a new student so they receive WhatsApp notifications.

### What to do

**Step 1.** Click the **Students** tab at the bottom of the Google Sheet.

**Step 2.** Go to the first empty row and type in these values:

| Column | What to type | Example |
|--------|-------------|---------|
| A (StudentID) | A unique ID | `S010` |
| B (Name) | Student's full name | `Aarav Krishnan` |
| C (Phone) | Their WhatsApp number | `+919876543210` |
| D (Class) | Which class they're in | `Guitar - Grade 3` |
| E (Active) | `TRUE` | `TRUE` |

**Step 3.** Press Enter. That's it — the student is registered.

### What happens

Nothing visible yet — adding a student just registers them in the system. They'll start receiving notifications when you add schedule entries for their class.

### Tips

- The **Class** name must match exactly between the Students tab and the Schedule tab. `Guitar - Grade 3` and `guitar - grade 3` are different.
- Phone numbers work in multiple formats: `+919876543210`, `919876543210`, `9876543210`, or `09876543210`. The system auto-formats them.
- Set **Active** to `FALSE` if a student takes a break. Switch back to `TRUE` when they return.

<div class="page-break"></div>

# Demo 2: Add a Class Schedule

**Goal**: Set up a music class so the system knows what's happening and when.

### What to do

**Step 1.** Click the **Schedule** tab.

**Step 2.** Go to the first empty row and type:

| Column | What to type | Example |
|--------|-------------|---------|
| A (ScheduleID) | A unique ID | `SCH020` |
| B (Class) | Class name (must match Students tab) | `Guitar - Grade 3` |
| C (Subject) | What's being taught | `Acoustic Guitar Practice` |
| D (Teacher) | Teacher's name | `Mr. Cecil` |
| E (Room) | Studio or room | `Studio A` |
| F (Date) | Date in YYYY-MM-DD format | `2026-03-25` |
| G (Time) | Time in 24-hour format | `10:00` |
| H (Status) | `Active` | `Active` |

**Step 3.** Press Enter. The class is now scheduled.

### What happens

The class is registered in the system. Students in `Guitar - Grade 3` will:
- Receive a **daily reminder** at 8:00 AM on March 25th
- Get **instant alerts** if you change any detail (teacher, room, time) later

### Tips

- Use tomorrow's date so you can test the daily reminder in Demo 3.
- **Status** should be `Active`. Other options are `Cancelled` and `Rescheduled` (we'll use those in Demo 6).
- Add multiple rows for multiple classes on the same day.
- Leave **LastModified** and **ModifiedBy** columns empty — the system fills these automatically.

<div class="page-break"></div>

# Demo 3: Daily Morning Reminder

**Goal**: See the automatic 8:00 AM daily schedule message that students receive.

Every morning at 8:00 AM, the system automatically sends each student their classes for the day. You don't need to do anything — it just works.

But for this demo, we'll trigger it manually so you can see it right now.

### What to do

**Step 1.** Open the Apps Script editor:
- In the Google Sheet, go to **Extensions** > **Apps Script**

**Step 2.** In the file list on the left, click **scheduler.gs**

**Step 3.** In the function dropdown at the top, select **sendDailySchedule**

**Step 4.** Click the **Run** button (the play triangle icon)

**Step 5.** If prompted for permissions, click **Review permissions** > **Allow**

### What students receive

If you set up a class for today (or used today's date in Demo 2), every student in that class will receive a WhatsApp message like this:

> Hi Aarav, here's your schedule for today at Muzigal: Acoustic Guitar Practice with Mr. Cecil in Studio A at 10:00. Have a great session!

If a student has **multiple classes** today, they get one combined message:

> Hi Aarav, today at Muzigal you have: Acoustic Guitar Practice with Mr. Cecil in Studio A at 10:00, and Music Theory with Mrs. Lakshmi in Room 2 at 14:00. See you there!

### What to check

- Open the **Log** tab — you should see new rows with:
  - **MessageType**: `daily_schedule`
  - **DeliveryStatus**: `sent`
  - **WhatsAppMsgID**: A long ID (confirms WhatsApp received it)

### Note

In production, this runs automatically every day at 8:00 AM. You never need to trigger it manually.

<div class="page-break"></div>

# Demo 4: Change a Teacher

**Goal**: See what happens when a teacher changes — students are notified instantly.

This is where the magic happens. You edit one cell, and students get a WhatsApp message within seconds.

### What to do

**Step 1.** Click the **Schedule** tab.

**Step 2.** Find the class you added in Demo 2 (e.g., `Acoustic Guitar Practice` with `Mr. Cecil`).

**Step 3.** Click on the **Teacher** cell (column D) for that row.

**Step 4.** Change it from `Mr. Cecil` to `Mr. Giri`

**Step 5.** Press Enter.

### What happens next (automatically)

1. The system detects the change (within 2-3 seconds)
2. It looks up all students in `Guitar - Grade 3`
3. It sends each of them a WhatsApp message
4. It logs the delivery in the Log tab
5. It updates the **LastModified** and **ModifiedBy** columns

### What students receive

> Hi Aarav, heads up — your Acoustic Guitar Practice class now has Mr. Giri instead of Mr. Cecil. Same time and studio. See you there!

### What to check

- **Schedule tab**: The **LastModified** column now shows the current time, and **ModifiedBy** shows your email.
- **Log tab**: A new row with **MessageType** = `teacher_change` and **DeliveryStatus** = `sent`.
- **Your phone**: The WhatsApp message should arrive within seconds.

### That's it. One cell edit. Instant notification. Zero effort.

<div class="page-break"></div>

# Demo 5: Change a Room

**Goal**: Move a class to a different studio and see students get notified.

### What to do

**Step 1.** In the **Schedule** tab, find the same class row.

**Step 2.** Click on the **Room** cell (column E).

**Step 3.** Change it from `Studio A` to `Studio C`

**Step 4.** Press Enter.

### What students receive

> Hi Aarav, your Acoustic Guitar Practice class has moved to Studio C. See you at 10:00!

### What to check

- **Log tab**: New row with **MessageType** = `room_change`
- **Your phone**: Message arrives within seconds

<div class="page-break"></div>

# Demo 6: Cancel a Class

**Goal**: Cancel a class and see students get notified immediately.

### What to do

**Step 1.** In the **Schedule** tab, find the class row.

**Step 2.** Click on the **Status** cell (column H).

**Step 3.** Change it from `Active` to `Cancelled`

**Step 4.** Press Enter.

### What students receive

> Hi Aarav, unfortunately your Acoustic Guitar Practice class for today has been cancelled. We'll keep you posted on the reschedule. — Muzigal

### What to check

- **Log tab**: New row with **MessageType** = `cancellation`
- **Your phone**: Cancellation message arrives within seconds

### Also works for rescheduling

If you change the status to `Rescheduled` instead of `Cancelled`, students get:

> Hi Aarav, your Acoustic Guitar Practice class has been rescheduled. Please check the updated details. — Muzigal

### Other changes that trigger notifications

| What you change | Notification sent |
|----------------|-------------------|
| Teacher name | "Your class now has [new teacher] instead of [old teacher]" |
| Room/Studio | "Your class has moved to [new room]" |
| Time | "Your class has been shifted to [new time]" |
| Date | "Your class has been rescheduled to [new date]" |
| Status → Cancelled | "Your class has been cancelled" |
| Status → Rescheduled | "Your class has been rescheduled" |

**Every change = instant WhatsApp. No extra steps.**

<div class="page-break"></div>

# Demo 7: Send an Emergency Announcement

**Goal**: Send a custom message to all students, a specific class, or one student.

This is for situations outside of schedule changes — like holiday closures, event announcements, or special notices.

### Option A: Send to everyone

Open a terminal (or ask your system administrator to run this):

```bash
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "your-webhook-secret",
    "action": "send_override",
    "target_type": "all",
    "target_value": "all",
    "message": "Muzigal will be closed tomorrow for Ugadi. Classes resume on Thursday. Happy Ugadi!",
    "sent_by": "Admin"
  }'
```

**Every active student** receives:

> Muzigal will be closed tomorrow for Ugadi. Classes resume on Thursday. Happy Ugadi!

### Option B: Send to one class

Change `target_type` to `"class"` and `target_value` to the class name:

```bash
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "your-webhook-secret",
    "action": "send_override",
    "target_type": "class",
    "target_value": "Guitar - Grade 3",
    "message": "Guitar Grade 3: Extra practice session this Saturday at 2 PM in Studio A!",
    "sent_by": "Mr. Cecil"
  }'
```

### Option C: Send to one student

Change `target_type` to `"student"` and `target_value` to their phone number:

```bash
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "your-webhook-secret",
    "action": "send_test",
    "phone": "+919876543210",
    "message": "Hi Aarav, your make-up guitar session is confirmed for Friday at 3 PM."
  }'
```

### What to check

- **Overrides tab**: Shows a log of the announcement (who sent it, to whom, what)
- **Log tab**: Individual delivery records for each student
- **Your phone**: The message arrives within seconds

<div class="page-break"></div>

# Demo 8: Check Delivery Logs

**Goal**: Verify that messages are being delivered and spot any problems.

### What to do

**Step 1.** Click the **Log** tab.

**Step 2.** Look at the most recent rows (at the bottom). Each row is one message sent.

### How to read the Log tab

| Column | What it tells you |
|--------|------------------|
| **Timestamp** | When the message was sent |
| **StudentName** | Who it was sent to |
| **Phone** | Their phone number |
| **MessageType** | Why it was sent (`daily_schedule`, `teacher_change`, `cancellation`, etc.) |
| **MessageSent** | The exact message text |
| **DeliveryStatus** | `sent` = delivered, `failed` = problem |
| **WhatsAppMsgID** | WhatsApp's confirmation code (proof of delivery) |
| **Error** | If failed, this tells you why |

### What "sent" means

`sent` means WhatsApp accepted the message. It will be delivered to the student's phone when they're online.

### What to do if you see "failed"

| Error message | What it means | What to do |
|--------------|---------------|------------|
| "Recipient phone number not in allowed list" | Number not registered for test mode | Add the number in Meta Developer Dashboard |
| "Invalid OAuth access token" | WhatsApp token expired | Get a new token from Meta Developer Dashboard |
| "WhatsApp API not configured" | Token or Phone ID missing | Check the Config tab |
| "Template not found" | Template name mismatch | Verify `TEMPLATE_NAME` in Config matches your approved template |

<div class="page-break"></div>

# Bonus: Health Check

**Goal**: Quickly verify the system is alive and running.

### What to do

Open this URL in your browser (replace with your actual web app URL):

```
YOUR_WEB_APP_URL
```

### What you see

```json
{
  "status": "ok",
  "timestamp": "2026-03-25 10:30:15",
  "triggerCount": 2
}
```

### What the numbers mean

| Field | Good value | Problem if... |
|-------|-----------|---------------|
| `status` | `ok` | Never — always returns ok |
| `timestamp` | Current time in IST | Clock is significantly wrong |
| `triggerCount` | `2` | `0` means triggers are not installed — run `installTriggers()` |

<div class="page-break"></div>

# Troubleshooting Quick Reference

Five most common issues and their one-line fixes:

| # | Problem | Fix |
|---|---------|-----|
| 1 | "No message received on WhatsApp" | Make sure the phone number is registered as a test recipient in the Meta Developer Dashboard |
| 2 | "Token expired" error in Log tab | Go to Meta Developer Dashboard > WhatsApp > API Setup > Generate a new access token |
| 3 | Editing the Schedule tab doesn't trigger a notification | Open Apps Script > Run `installTriggers()` — the onEdit trigger may not be installed |
| 4 | Daily 8 AM reminder didn't go out | Check that there are Schedule rows with today's date and Status = `Active` |
| 5 | Students in the wrong class got the message | The **Class** name in Students tab must match the **Class** name in Schedule tab exactly (case-sensitive) |

<div class="page-break"></div>

# What's Next

You've seen everything the system can do. Here's where to go from here:

| Document | What it covers |
|----------|---------------|
| [User Guide](USER-GUIDE.md) | Day-to-day operations reference for staff |
| [Full Proposal](PROPOSAL.md) | Complete system overview with architecture and costing |
| [API Reference](API-REFERENCE.md) | Technical details of all 10 endpoints |
| [Cost Analysis](COST-ANALYSIS.md) | Monthly cost projections and comparisons |
| [Architecture](ARCHITECTURE.md) | How the system works under the hood |
| [Setup Guide](../SETUP.md) | How to set up the system from scratch |
| [Testing Guide](../TESTING.md) | How to run all 11 test functions |

### Questions or Support

**Aldrin Stellus** — aldrin@atc.xyz

---

<div style="text-align: center; margin-top: 40px; color: #999; font-size: 9pt;">

Built with care by Aldrin Stellus — Designed for Muzigal, Bangalore

Demo Guide v1.0 — March 2026

</div>
