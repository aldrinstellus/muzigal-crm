# User Guide — Muzigal Staff Operations

This guide is for non-technical staff at Muzigal who will use the WhatsApp Class Notification System day-to-day. No coding knowledge is required — everything is done through Google Sheets.

---

## Getting Started

The system uses a **Google Sheet** as the main interface. All you need to do is manage data in the spreadsheet — the system handles everything else automatically.

**Google Sheet link**: *(provided during setup)*

The sheet has 5 tabs:

| Tab | What it does |
|-----|-------------|
| **Students** | Your student contact directory |
| **Schedule** | Class timetable — edits here trigger WhatsApp notifications |
| **Config** | System settings (API keys, school name) — rarely changed |
| **Log** | Delivery records — check if messages were sent successfully |
| **Overrides** | History of manual/emergency messages |

---

## 1. Managing Students

Open the **Students** tab to add, edit, or deactivate students.

### Adding a New Student

Add a row with these columns:

| Column | Example | Notes |
|--------|---------|-------|
| StudentID | `S015` | Unique ID (any format you prefer) |
| Name | `Priya Sharma` | Full name |
| Phone | `+919845708094` | WhatsApp number with country code |
| Class | `Guitar - Grade 3` | Class or instrument group |
| Active | `TRUE` | Set to `FALSE` to stop notifications |

**Phone number formats accepted:**
- `+919845708094` (recommended)
- `919845708094`
- `9845708094` (auto-adds +91)
- `09845708094` (auto-adds +91)

### Grouping Students

Use the **Class** column to group students. When a schedule change happens for "Guitar - Grade 3", all students in that class get notified.

Examples of class names:
- `Guitar - Grade 3`
- `Piano - Beginners`
- `Vocals - Advanced`
- `Drums - Intermediate`
- `Violin - Grade 2`

### Deactivating a Student

To stop sending notifications to a student (e.g., they've taken a break), change their **Active** column to `FALSE`. Their data stays in the sheet for when they return.

---

## 2. Managing the Class Schedule

Open the **Schedule** tab to set up and modify class timetables.

### Adding a Class

Add a row with these columns:

| Column | Example | Notes |
|--------|---------|-------|
| ScheduleID | `SCH042` | Unique ID |
| Class | `Guitar - Grade 3` | Must match the class name in Students tab |
| Subject | `Guitar Practice` | What's being taught |
| Teacher | `Mr. Cecil` | Teacher/instructor name |
| Room | `Studio A` | Room or studio |
| Date | `2026-03-25` | Format: YYYY-MM-DD |
| Time | `10:00` | 24-hour format |
| Status | `Active` | Active, Cancelled, or Rescheduled |
| LastModified | *(auto-filled)* | System fills this when changes are made |
| ModifiedBy | *(auto-filled)* | System records who made the change |

### What Triggers Automatic Notifications

When you edit any of these columns in an existing schedule row, **all students in that class are notified instantly via WhatsApp**:

| Column Changed | Notification Type | Example Message |
|----------------|-------------------|-----------------|
| Teacher | Teacher change | "Hi Priya, your Guitar Practice class now has Mr. Giri instead of Mr. Cecil. Same time, same studio." |
| Room | Room change | "Hi Priya, your Guitar Practice has moved to Studio B. See you at 10:00!" |
| Time | Time change | "Hi Priya, Guitar Practice has been shifted to 11:30 today." |
| Date | Date change | "Hi Priya, Guitar Practice has been rescheduled to March 26." |
| Status → Cancelled | Cancellation | "Hi Priya, Guitar Practice for today has been cancelled. We'll update you on the next session." |
| Status → Rescheduled | Reschedule | "Hi Priya, Guitar Practice has been rescheduled. Check the updated details." |

### Cancelling a Class

Simply change the **Status** column from `Active` to `Cancelled`. All students in that class will be notified immediately.

### Rescheduling a Class

1. Change the **Status** to `Rescheduled` (students get notified)
2. Update the **Date** and/or **Time** (students get notified again with new details)

Or update Date/Time directly — each change sends a notification.

---

## 3. Automatic Daily Reminders

Every morning at **8:00 AM IST**, the system automatically sends each student their schedule for the day.

**What happens:**
1. System checks the Schedule tab for today's date
2. Groups classes by class name
3. Sends each student their classes for the day

**Example message:**
> Hi Priya, here's your schedule for today at Muzigal: Guitar Practice with Mr. Cecil in Studio A at 10:00. Have a great session!

If a student has multiple classes, they receive one combined message.

**No action needed from staff** — this runs automatically every day.

---

## 4. Sending Emergency/Custom Messages

For announcements outside of schedule changes (e.g., "Academy closed due to weather"), use the **web app endpoint** or ask the system administrator to send a POST request.

**Types of custom messages:**

| Target | What it does | Example |
|--------|-------------|---------|
| All students | Message everyone | "Muzigal will be closed tomorrow for Holi. Classes resume Monday." |
| One class | Message a class group | "Guitar Grade 3: Extra practice session this Saturday at 2 PM!" |
| One student | Message an individual | "Priya, your make-up class is confirmed for Friday at 3 PM." |

---

## 5. Checking Delivery Status

Open the **Log** tab to see every message that was sent.

| Column | What it shows |
|--------|--------------|
| Timestamp | When the message was sent |
| StudentName | Who it was sent to |
| Phone | Their phone number |
| MessageType | daily_schedule, teacher_change, room_change, etc. |
| MessageSent | The actual message content |
| DeliveryStatus | `sent` or `failed` |
| WhatsAppMsgID | WhatsApp's confirmation ID |
| Error | Error details if delivery failed |

**Check this tab regularly** to ensure messages are being delivered. If you see `failed` status, common causes are:
- Invalid phone number
- WhatsApp access token expired (needs renewal)
- Student hasn't registered their number with the WhatsApp test system

---

## 6. Checking Override History

The **Overrides** tab logs all custom/emergency messages sent through the web app.

| Column | What it shows |
|--------|--------------|
| Timestamp | When the override was sent |
| TargetType | class, student, or all |
| TargetValue | Which class/student/all |
| Message | The message content |
| SentBy | Who authorized the send |
| Status | sent, partial, or failed |

---

## Frequently Asked Questions

**Q: A student didn't receive their notification. What do I check?**
1. Check the **Log** tab for their name — is the status `sent` or `failed`?
2. Check the **Students** tab — is their phone number correct? Is Active = TRUE?
3. Check if the class name in Students matches the class name in Schedule exactly.

**Q: Can I add a class that happens weekly?**
Yes, but you need to add a separate row for each date. The system looks at specific dates, not recurring patterns. Add rows for each upcoming week.

**Q: What if I need to change multiple things at once (teacher AND room)?**
Edit one column at a time. Each edit sends a separate notification. Or, if you prefer one message, update all columns quickly — the system sends a notification per edit.

**Q: How do I stop notifications for a student temporarily?**
Change their Active column to `FALSE` in the Students tab. Change it back to `TRUE` when they return.

**Q: The WhatsApp token expired. What do I do?**
Contact the system administrator (Aldrin). Temporary tokens expire every 24 hours. For long-term use, a permanent System User token should be set up.

**Q: Can parents receive notifications instead of students?**
Yes! Just put the parent's WhatsApp number in the Phone column. The message will be personalized with the student's name regardless of whose phone it goes to.

---

## Quick Reference

| Task | Where to do it |
|------|---------------|
| Add a student | Students tab → new row |
| Remove a student | Students tab → Active = FALSE |
| Add a class | Schedule tab → new row |
| Cancel a class | Schedule tab → Status = Cancelled |
| Change a teacher | Schedule tab → edit Teacher column |
| Change a room | Schedule tab → edit Room column |
| Check if messages sent | Log tab |
| View override history | Overrides tab |
