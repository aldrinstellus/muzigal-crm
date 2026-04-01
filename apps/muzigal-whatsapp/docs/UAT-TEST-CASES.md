# Muzigal WhatsApp — UAT Test Cases

**Document Version**: 1.0
**Date**: 2026-04-01
**Application**: Muzigal WhatsApp Messaging Dashboard
**Platform**: Web (React + Vite, deployed on Vercel)
**Prepared by**: ZOO CRM Engineering

---

## App Info

| Property | Value |
|---|---|
| **URL** | https://muzigal-whatsapp.vercel.app |
| **Demo Credentials** | `demo@zoo.crm` / `demo` |
| **Prod Credentials** | `aldrin@atc.xyz` / `admin123` (requires `VITE_GAS_URL` env var) |
| **Other Prod Users** | `cecil@muzigal.com` / `cecil123`, `giri@muzigal.com` / `giri123` |
| **Technology** | React 18, React Router, Vite, Tailwind CSS, @zoo/ui design system |
| **Backend** | Google Apps Script (Production) / In-memory seed data (Demo) |
| **Data Source** | Excel migration file — 255 students, 905 enquiries, 511 batches, 138 classes |

---

## How to Use This Document

1. Execute each test case following the **Steps** in order.
2. Compare results against **Expected Result**.
3. Fill in the **Actual Result** and **Status** columns during testing.
4. Status values: **PASS**, **FAIL**, **BLOCKED**, **SKIPPED**.
5. For any FAIL, note the deviation in the Actual Result column and raise a defect.

---

## Test Matrix

### TC-001: Login — Demo Mode

| Field | Value |
|---|---|
| **ID** | TC-001 |
| **Title** | Login — Demo Mode |
| **Priority** | P1 |
| **Preconditions** | User is not logged in. Browser cache cleared or incognito window. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to https://muzigal-whatsapp.vercel.app | Login page loads with Muzigal WhatsApp branding, green MessageCircle icon, Production/Demo mode toggle, email and password fields. |
| 2 | Click the "Demo" toggle button | Toggle switches to amber/yellow highlight. A yellow info box appears showing demo credentials: `demo@zoo.crm` / `demo`. |
| 3 | Enter email: `demo@zoo.crm` | Email field accepts input. |
| 4 | Enter password: `demo` | Password field accepts input (masked). |
| 5 | Click "Sign in" | Button shows "Signing in..." briefly, then user is redirected to `/dashboard`. Dashboard loads with stats cards, quick actions, and message log. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-002: Login — Prod Mode (No Backend)

| Field | Value |
|---|---|
| **ID** | TC-002 |
| **Title** | Login — Prod Mode (No Backend) |
| **Priority** | P2 |
| **Preconditions** | User is not logged in. The deployment does NOT have `VITE_GAS_URL` configured. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to the login page | Login page loads with "Production" toggle active by default. |
| 2 | Enter email: `aldrin@atc.xyz`, password: `admin123` | Fields accept input. |
| 3 | Click "Sign in" | Red error banner appears: "Backend not configured. Please set the VITE_GAS_URL environment variable in Vercel, or switch to Demo mode to explore the app." |

| Actual Result | Status |
|---|---|
| | |

---

### TC-003: Login — Invalid Credentials

| Field | Value |
|---|---|
| **ID** | TC-003 |
| **Title** | Login — Invalid Credentials |
| **Priority** | P1 |
| **Preconditions** | User is not logged in. Demo mode is active. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click "Demo" toggle on login page | Demo mode activates. |
| 2 | Enter email: `wrong@email.com`, password: `wrongpass` | Fields accept input. |
| 3 | Click "Sign in" | Red error banner appears with message "Invalid email or password." |
| 4 | Leave both fields empty and click "Sign in" | Error message: "Please enter both email and password." |
| 5 | Enter only email, leave password empty, click "Sign in" | Error message: "Please enter both email and password." |

| Actual Result | Status |
|---|---|
| | |

---

### TC-004: Login — Mode Toggle

| Field | Value |
|---|---|
| **ID** | TC-004 |
| **Title** | Login — Mode Toggle |
| **Priority** | P2 |
| **Preconditions** | User is on the login page. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Observe the mode toggle | Two buttons: "Production" and "Demo". Production has white bg with shadow when active; Demo has amber bg when active. |
| 2 | Click "Demo" | Demo mode activates. Amber credential info box appears. Email and password fields are cleared. Any previous error is cleared. |
| 3 | Click "Production" | Production mode activates. Credential info box disappears. Fields are cleared. Errors cleared. |
| 4 | Navigate to `/?mode=demo` | Page loads directly in Demo mode. |
| 5 | Navigate to `/?mode=prod` | Page loads directly in Production mode. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-005: Dashboard — Stats Display

| Field | Value |
|---|---|
| **ID** | TC-005 |
| **Title** | Dashboard — Stats Display |
| **Priority** | P1 |
| **Preconditions** | User is logged in (demo mode). |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/dashboard` | Four stat cards are displayed in a responsive grid (1 col mobile, 2 col tablet, 4 col desktop). |
| 2 | Verify "Active Students" card | Shows count of active students with Users icon. Subtext shows total enquiry count (e.g., "905 enquiries"). |
| 3 | Verify "Messages Sent" card | Shows total delivered messages with Send icon. Subtext shows total message log count. |
| 4 | Verify "Delivery Rate" card | Shows percentage (e.g., "100%") with CheckCircle icon. Green trend indicator if >= 95%. |
| 5 | Verify "Expiring Soon" card | Shows count of students expiring within 30 days with Clock icon. Subtext: "within 30 days". |
| 6 | While data loads, verify skeleton | Before data resolves, 4 skeleton cards with pulse animation should display. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-006: Dashboard — Quick Actions Navigation

| Field | Value |
|---|---|
| **ID** | TC-006 |
| **Title** | Dashboard — Quick Actions Navigation |
| **Priority** | P1 |
| **Preconditions** | User is on the Dashboard page. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Verify quick action buttons | Three buttons visible: "Send Broadcast" (primary/green), "Send Test" (secondary), "View Students" (secondary). |
| 2 | Click "Send Broadcast" | Navigates to `/dashboard/broadcast`. Broadcast page loads. |
| 3 | Navigate back to Dashboard | Dashboard loads. |
| 4 | Click "Send Test" | Navigates to `/dashboard/test`. Test Message page loads. |
| 5 | Navigate back to Dashboard | Dashboard loads. |
| 6 | Click "View Students" | Navigates to `/dashboard/students`. Students page loads. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-007: Dashboard — Message Log

| Field | Value |
|---|---|
| **ID** | TC-007 |
| **Title** | Dashboard — Message Log |
| **Priority** | P2 |
| **Preconditions** | User is on the Dashboard page (demo mode). |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Scroll to "Recent Messages" card | Card displays below quick actions. |
| 2 | If log entries exist, verify each entry | Each entry shows: colored type badge (Schedule/Broadcast/Test/etc.), truncated message text, sender name, formatted date, delivery stats (delivered/total), failed count in red if > 0. |
| 3 | If no log entries exist | Text displays: "No messages sent yet" centered in the card. |
| 4 | Verify type badge colors | `daily_schedule` = blue, `broadcast` = emerald, `teacher_change` = amber, `cancellation` = red, `reschedule` = violet, `test` = zinc. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-008: Students — Full List Display (255 records)

| Field | Value |
|---|---|
| **ID** | TC-008 |
| **Title** | Students — Full List Display (255 records) |
| **Priority** | P1 |
| **Preconditions** | User is logged in (demo mode). |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to `/dashboard/students` | Students page loads. Skeleton shown during load, then table appears. |
| 2 | Verify student count label | Text reads "255 students found" (or the total count with no filters). |
| 3 | Verify table columns | 9 columns: ID, Name, Subject, Level, Status, Duration, Expiry, Sessions, Contact. |
| 4 | Verify first row data | First student (STUD-00001): ID in monospace, Name in bold, Subject shown, Status badge (green for Active, red for Inactive), Duration text, Expiry date (amber if within 30 days), Sessions as "completed/total (pending left)", Phone in monospace with +91 prefix. |
| 5 | Verify 25 rows per page | Table shows exactly 25 rows on the first page. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-009: Students — Search by Name

| Field | Value |
|---|---|
| **ID** | TC-009 |
| **Title** | Students — Search by Name |
| **Priority** | P1 |
| **Preconditions** | User is on the Students page. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click in the search field | Search field has magnifying glass icon and placeholder "Search by name, ID, phone, or email..." |
| 2 | Type "Niketh" | Table filters in real-time. Student count updates. STUD-00001 (Niketh) appears in results. |
| 3 | Type a partial name (e.g., "Par") | All students with "Par" in their name appear (case-insensitive). Count updates. |
| 4 | Type a name with no match (e.g., "ZZZZZ") | Table shows 0 results. Count reads "0 students found". |
| 5 | Clear the search field | Full list returns. Count shows 255. Pagination resets to page 1. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-010: Students — Search by Phone

| Field | Value |
|---|---|
| **ID** | TC-010 |
| **Title** | Students — Search by Phone |
| **Priority** | P2 |
| **Preconditions** | User is on the Students page. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Type "9986697635" in the search field | STUD-00001 (Niketh) appears. Search matches against both `Phone` (+91 prefixed) and raw `ContactNumber`. |
| 2 | Type "+919986697635" | Same student appears (matches the +91 prefixed Phone field). |
| 3 | Type a partial phone number (e.g., "9986") | All students whose phone number contains "9986" appear. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-011: Students — Filter by Subject

| Field | Value |
|---|---|
| **ID** | TC-011 |
| **Title** | Students — Filter by Subject |
| **Priority** | P1 |
| **Preconditions** | User is on the Students page. No search text entered. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Verify subject dropdown | Dropdown shows options: All Subjects, Piano, Guitar, Drums, Carnatic Vocals, Western Vocals, Violin, Hindustani Vocals. Has custom chevron icon. |
| 2 | Select "Piano" | Table filters to show only Piano students. Count updates. Pagination resets to page 1. |
| 3 | Select "Guitar" | Table filters to Guitar students only. |
| 4 | Select "All Subjects" | Full list returns (255 students, or current search-filtered count). |

| Actual Result | Status |
|---|---|
| | |

---

### TC-012: Students — Filter by Status

| Field | Value |
|---|---|
| **ID** | TC-012 |
| **Title** | Students — Filter by Status |
| **Priority** | P1 |
| **Preconditions** | User is on the Students page. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Verify status dropdown | Options: All Statuses, Active, Renewed, Re-Enrolled, Not Renewed, InActive. |
| 2 | Select "Active" | Only students with Status "Active" or EnrolmentStatus "Active" are shown. Active students have green badge. |
| 3 | Select "Not Renewed" | Only "Not Renewed" students shown. These have red badge. |
| 4 | Select "All Statuses" | Full list restores. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-013: Students — Filter by Duration

| Field | Value |
|---|---|
| **ID** | TC-013 |
| **Title** | Students — Filter by Duration |
| **Priority** | P2 |
| **Preconditions** | User is on the Students page. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Verify duration dropdown | Options: All Durations, 12 MONTHS, 6 MONTHS, 3 MONTHS, 1 MONTHS. |
| 2 | Select "12 MONTHS" | Only students enrolled for 12 months are shown. Duration column confirms. Count updates. |
| 3 | Select "3 MONTHS" | Only 3-month students shown. |
| 4 | Combine with subject filter: select "Piano" + "12 MONTHS" | Only Piano students with 12-month enrollment shown. Filters are AND-combined. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-014: Students — Column Sorting

| Field | Value |
|---|---|
| **ID** | TC-014 |
| **Title** | Students — Column Sorting |
| **Priority** | P2 |
| **Preconditions** | User is on the Students page with no filters. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Default sort | Table is sorted by StudentID ascending (STUD-00001 first). ChevronUp icon appears next to "ID" header. |
| 2 | Click "ID" header | Sort toggles to descending. ChevronDown icon appears. Last student ID appears first. |
| 3 | Click "Name" header | Table sorts by student name ascending (A-Z). Sort icon moves to "Name" column. |
| 4 | Click "Name" header again | Sorts by name descending (Z-A). |
| 5 | Click "Subject" header | Sorts alphabetically by subject name. |
| 6 | Click "Expiry" header | Sorts by expiry date. Students with no expiry date sort to bottom (ascending) or top (descending). |
| 7 | Click "Sessions" header | Sorts by PendingSessions count. Right-aligned sort icon. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-015: Students — Pagination

| Field | Value |
|---|---|
| **ID** | TC-015 |
| **Title** | Students — Pagination |
| **Priority** | P1 |
| **Preconditions** | User is on the Students page, no filters applied (255 records). |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Verify pagination controls | Bottom of table shows "Page 1 of 11" (ceil(255/25)). Prev button is disabled. Next button is enabled. |
| 2 | Click "Next" | Page 2 loads with next 25 students. "Page 2 of 11" shown. Prev button is now enabled. |
| 3 | Click "Prev" | Returns to page 1. Prev disabled again. |
| 4 | Navigate to last page | Page 11 shows remaining students (255 - 250 = 5 rows). Next button is disabled. |
| 5 | Apply a filter that reduces results to < 25 | Pagination controls disappear (only shown when totalPages > 1). |
| 6 | Change a filter while on page 3 | Page resets to 1 automatically. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-016: Broadcast — All Students Target

| Field | Value |
|---|---|
| **ID** | TC-016 |
| **Title** | Broadcast — All Students Target |
| **Priority** | P1 |
| **Preconditions** | User is logged in and on `/dashboard/broadcast`. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Verify target type buttons | Five buttons: "All Students" (Users icon), "By Batch" (MessageCircle icon), "By Subject" (Music icon), "Individual" (User icon), "Expiring" (Clock icon). |
| 2 | "All Students" is selected by default | Button has green bg/white text. No additional selector fields shown. |
| 3 | Verify recipient count | Bottom-left shows total active student count (e.g., "X recipients"). |
| 4 | Verify recipient preview panel | Right panel "Recipients (X)" shows list of all active students with avatar initial, name, instrument, and phone number. Scrollable. Shows max 100, with "+X more" if over 100. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-017: Broadcast — By Batch Target (searchable)

| Field | Value |
|---|---|
| **ID** | TC-017 |
| **Title** | Broadcast — By Batch Target (searchable) |
| **Priority** | P1 |
| **Preconditions** | User is on the Broadcast page. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click "By Batch" button | Button turns green. A batch search input and scrollable batch list appear. |
| 2 | Verify batch list | Shows all 138 derived classes. Each item shows class name (e.g., "Guitar -- 11 AM to 12 PM (Sunday)") with student count in parentheses. |
| 3 | Type "Piano" in batch search | List filters to show only Piano batches. |
| 4 | Click a batch item | Item highlights in green. Recipient count updates to that batch's student count. Right panel updates to show only students in that batch. |
| 5 | Clear search | Full batch list returns. Selected batch remains highlighted. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-018: Broadcast — By Subject Target

| Field | Value |
|---|---|
| **ID** | TC-018 |
| **Title** | Broadcast — By Subject Target |
| **Priority** | P1 |
| **Preconditions** | User is on the Broadcast page. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click "By Subject" button | Button turns green. Subject pill buttons appear: Piano, Guitar, Drums, Carnatic Vocals, Western Vocals, Violin, Hindustani Vocals. Each shows student count in parentheses. |
| 2 | Click "Piano" | Piano pill turns green. Recipient count and preview update to show only Piano students. |
| 3 | Click "Guitar" | Selection changes to Guitar. Preview updates. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-019: Broadcast — Individual Target (searchable)

| Field | Value |
|---|---|
| **ID** | TC-019 |
| **Title** | Broadcast — Individual Target (searchable) |
| **Priority** | P1 |
| **Preconditions** | User is on the Broadcast page. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click "Individual" button | Button turns green. A student search input and scrollable student list appear. |
| 2 | Verify student list | Shows active students (max 50 visible). Each item shows name (bold), StudentID, and instrument. If more than 50, shows "Showing 50 of X -- refine your search". |
| 3 | Type "Niketh" in search | List filters to match. |
| 4 | Click a student | Item highlights green. Recipient count shows "1 recipient". Right panel shows that single student. |
| 5 | Search by phone number | Matching students appear. |
| 6 | Search by StudentID (e.g., "STUD-00001") | Matching student appears. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-020: Broadcast — Expiring Target

| Field | Value |
|---|---|
| **ID** | TC-020 |
| **Title** | Broadcast — Expiring Target |
| **Priority** | P2 |
| **Preconditions** | User is on the Broadcast page. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click "Expiring" button | Button turns green. An "Expiring within" dropdown appears with options: 7, 14, 30, 60, 90 days. Default is 30. |
| 2 | Verify count label | Next to the dropdown, shows "X students expiring". |
| 3 | Change to "7 days" | Count updates. Only students whose ExpiryDate is within 7 days from today (and not in the past) are counted. Recipient preview updates. |
| 4 | Change to "90 days" | Count increases to include more expiring students. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-021: Broadcast — Quick Templates

| Field | Value |
|---|---|
| **ID** | TC-021 |
| **Title** | Broadcast — Quick Templates |
| **Priority** | P2 |
| **Preconditions** | User is on the Broadcast page. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Verify "Quick Templates" section | Five template buttons below the message textarea: Test, Closure, Fee Reminder, Session Reminder, Expiry Warning. Styled as small zinc pills. |
| 2 | Click "Test" | Message textarea fills with: "CRM test: If you receive this, WhatsApp integration is working." |
| 3 | Click "Fee Reminder" | Textarea replaces with: "Hi, your monthly fee is due. Please clear it at the earliest. - Muzigal" |
| 4 | Click "Closure" | Textarea fills with: "Muzigal will be closed on [date] for [reason]. Classes resume [date]." (contains placeholder brackets). |

| Actual Result | Status |
|---|---|
| | |

---

### TC-022: Broadcast — Send Message

| Field | Value |
|---|---|
| **ID** | TC-022 |
| **Title** | Broadcast — Send Message |
| **Priority** | P1 |
| **Preconditions** | User is on the Broadcast page with "All Students" selected. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Leave message empty, click "Send Message" | Button is disabled (greyed out) when message is empty. Nothing happens. |
| 2 | Type a message: "Hello students!" | Send button becomes enabled. Recipient count is displayed. |
| 3 | Click "Send Message" | Button changes to "Sending..." with disabled state. On success, green banner appears: "Message sent successfully to X recipients". Message field clears. Success banner disappears after 5 seconds. |
| 4 | Select "By Batch" but do not select a batch, type a message, click send | Red error: "Please select a class". |
| 5 | Select "Individual" but do not select a student, type a message, click send | Red error: "Please select a student". |
| 6 | Select "By Subject" but do not select a subject, type a message | Send button is disabled (0 recipients). |

| Actual Result | Status |
|---|---|
| | |

---

### TC-023: Broadcast — Recipient Preview

| Field | Value |
|---|---|
| **ID** | TC-023 |
| **Title** | Broadcast — Recipient Preview |
| **Priority** | P2 |
| **Preconditions** | User is on the Broadcast page. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | With no target selected or "All Students" | Right panel titled "Recipients (X)" shows full active student list. |
| 2 | Each recipient entry | Shows: circular green avatar with first initial, student name, instrument, and phone number with +91 prefix. |
| 3 | If recipients > 100 | Only first 100 shown. Text at bottom: "+ X more". |
| 4 | With 0 recipients (e.g., subject with no students) | Panel shows: "Select a target to see recipients". |
| 5 | Layout | On desktop (lg+), preview is in a 2-column right panel. On mobile, it stacks below the send form. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-024: Test Message — Send Test

| Field | Value |
|---|---|
| **ID** | TC-024 |
| **Title** | Test Message — Send Test |
| **Priority** | P1 |
| **Preconditions** | User is on `/dashboard/test`. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Verify page layout | Left panel (3 cols on desktop): "Send Test Message" card with Phone Number input, Message textarea, Send button. Right panel (2 cols): "Recent Tests" card. |
| 2 | Verify phone input | Placeholder: "919876543210". Helper text: "Enter number with country code, no + or spaces (e.g. 919876543210)". |
| 3 | Verify default message | Textarea pre-filled with: "Hello from Muzigal WhatsApp!" |
| 4 | Leave phone empty, click "Send Test Message" | Button is disabled when phone is empty. |
| 5 | Enter phone: "919876543210", click "Send Test Message" | Button shows "Sending..." in disabled state. On completion, green success or red error banner appears with result message. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-025: Test Message — Recent Tests History

| Field | Value |
|---|---|
| **ID** | TC-025 |
| **Title** | Test Message — Recent Tests History |
| **Priority** | P2 |
| **Preconditions** | User is on the Test Message page. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Before any test is sent | "Recent Tests" panel shows: "No tests sent yet". |
| 2 | Send a test message | After sending, a new entry appears in the Recent Tests list showing: phone number (bold), truncated message, time (HH:MM:SS format), green dot (success) or red dot (failure). |
| 3 | Send multiple test messages | History shows most recent first. Maximum 10 entries retained (older entries are dropped). |
| 4 | History is session-only | Refreshing the page clears the history (stored in React state, not persisted). |

| Actual Result | Status |
|---|---|
| | |

---

### TC-026: Settings — Connection Tab (Provider Selector)

| Field | Value |
|---|---|
| **ID** | TC-026 |
| **Title** | Settings — Connection Tab (Provider Selector) |
| **Priority** | P1 |
| **Preconditions** | User is on `/dashboard/settings`. Connection tab is active (default). |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Verify tab navigation | Four tabs: Connection (Wifi icon), Business (Building icon), Automation (Zap icon), Data (Database icon). Connection tab is active with white bg and shadow. |
| 2 | Verify connection status banner | Top banner shows current status: "Not Yet Tested" (zinc), "WhatsApp API Connected" (green), "Not Connected" (red), "Token Expiring Soon" (amber), or "Connection Error" (red). Includes "Test Connection" button. |
| 3 | Verify provider cards | Four provider cards in 2x2 grid: Meta Cloud API, Twilio, Gupshup, Custom Webhook. Each shows name (bold) and description. |
| 4 | Click "Meta Cloud API" | Card gets green border and green background. Meta-specific credential fields appear below. |
| 5 | Click "Twilio" | Selection changes to Twilio. Twilio-specific fields appear. Meta fields disappear. |
| 6 | Click "Gupshup" | Gupshup fields appear. |
| 7 | Click "Custom Webhook" | Custom webhook URL and headers fields appear. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-027: Settings — Connection Tab (Meta Credentials)

| Field | Value |
|---|---|
| **ID** | TC-027 |
| **Title** | Settings — Connection Tab (Meta Credentials) |
| **Priority** | P1 |
| **Preconditions** | Settings > Connection tab. Meta Cloud API provider selected. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Verify Token Type selector | Two buttons: "Temporary (24hr)" and "System User (Permanent)". One is active (green). |
| 2 | Click "Temporary (24hr)" | Help text: "Temporary tokens expire every 24 hours. Generate new ones at developers.facebook.com." |
| 3 | Click "System User (Permanent)" | Help text changes to: "System user tokens are permanent. Create them in Meta Business Manager > System Users." |
| 4 | Verify Access Token field | Password-masked input with show/hide toggle (Eye/EyeOff icon) and copy button. Placeholder: "EAAM5X064FqABO..." Monospace font. |
| 5 | Click the Eye icon | Token value becomes visible. Icon changes to EyeOff. |
| 6 | Click the Copy icon | Token is copied to clipboard. |
| 7 | Verify Phone Number ID field | Monospace input. Placeholder: "1085043881349577". Help text: "Found in Meta Developer Dashboard > WhatsApp > API Setup". |
| 8 | Verify WABA ID field | Monospace input. Placeholder: "284901754710853". |
| 9 | Verify API Version dropdown | Options: v21.0 (Latest), v20.0, v19.0. Custom chevron icon. |
| 10 | Verify documentation link | "Meta WhatsApp Cloud API Documentation" link with ExternalLink icon. Opens in new tab. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-028: Settings — Connection Tab (Test Connection)

| Field | Value |
|---|---|
| **ID** | TC-028 |
| **Title** | Settings — Connection Tab (Test Connection) |
| **Priority** | P1 |
| **Preconditions** | Settings > Connection tab. Any provider selected. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click "Test Connection" button | Button shows spinner and "Testing..." text. Button is disabled during test. |
| 2 | On success | Green result box appears: success message, optional details, optional latency in ms. Status banner updates to "WhatsApp API Connected" (green). "Last tested" timestamp updates. |
| 3 | On failure | Red result box appears with error message and details. Status banner updates to "Connection Error" (red). |

| Actual Result | Status |
|---|---|
| | |

---

### TC-029: Settings — Connection Tab (Twilio Form)

| Field | Value |
|---|---|
| **ID** | TC-029 |
| **Title** | Settings — Connection Tab (Twilio Form) |
| **Priority** | P2 |
| **Preconditions** | Settings > Connection tab. Twilio provider selected. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Verify "Twilio WhatsApp" card | Three fields: Account SID, Auth Token, From Number. |
| 2 | Verify Account SID field | Placeholder: "ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx". Monospace font. |
| 3 | Verify Auth Token field | Password-type input. Monospace font. |
| 4 | Verify From Number field | Placeholder: "whatsapp:+14155238886". Monospace. Help text: "Your Twilio WhatsApp-enabled phone number". |

| Actual Result | Status |
|---|---|
| | |

---

### TC-030: Settings — Connection Tab (Gupshup Form)

| Field | Value |
|---|---|
| **ID** | TC-030 |
| **Title** | Settings — Connection Tab (Gupshup Form) |
| **Priority** | P2 |
| **Preconditions** | Settings > Connection tab. Gupshup provider selected. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Verify "Gupshup WhatsApp" card | Three fields: API Key, Source Phone, App Name. |
| 2 | Verify API Key field | Password-type input. Monospace font. |
| 3 | Verify Source Phone field | Placeholder: "919876543210". Monospace. |
| 4 | Verify App Name field | Placeholder: "MuzigalWhatsApp". Regular font. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-031: Settings — Connection Tab (Custom Webhook Form)

| Field | Value |
|---|---|
| **ID** | TC-031 |
| **Title** | Settings — Connection Tab (Custom Webhook Form) |
| **Priority** | P3 |
| **Preconditions** | Settings > Connection tab. Custom Webhook provider selected. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Verify "Custom Webhook" card | Two fields: Webhook URL, Custom Headers (JSON). |
| 2 | Verify Webhook URL field | Placeholder: "https://your-api.com/send-whatsapp". Monospace. Help text explains expected POST body format: `{ to: "+91...", message: "..." }`. |
| 3 | Verify Custom Headers field | Textarea, monospace font. Placeholder: `{"Authorization": "Bearer your-token"}`. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-032: Settings — Business Tab (Academy Info)

| Field | Value |
|---|---|
| **ID** | TC-032 |
| **Title** | Settings — Business Tab (Academy Info) |
| **Priority** | P2 |
| **Preconditions** | User is on Settings page. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click "Business" tab | Tab activates with white bg. Description shows: "Academy profile, admins & templates". |
| 2 | Verify "Academy Information" card | 6 fields in 2-column grid: Academy Name, Full Legal Name, Email, Phone, Website (placeholder "https://"), Address. |
| 3 | Edit Academy Name | Field accepts input. Value updates in state. |
| 4 | Verify pre-populated values (demo mode) | Fields show Muzigal's information (name: "Muzigal", email: "muzigal.borewell@gmail.com", phone: "+919403890891"). |

| Actual Result | Status |
|---|---|
| | |

---

### TC-033: Settings — Business Tab (Admin CRUD)

| Field | Value |
|---|---|
| **ID** | TC-033 |
| **Title** | Settings — Business Tab (Admin CRUD) |
| **Priority** | P2 |
| **Preconditions** | Settings > Business tab. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Verify "Admin Users" card | Shows existing admin users. Card header has "Add Admin" button. |
| 2 | Verify each admin row | 3-column grid: Name input, Email input, Role dropdown (Admin/Staff). Trash icon button on the right. Row has zinc-50 background. |
| 3 | Click "Add Admin" | New empty row appended with default role "staff" and active=true. |
| 4 | Fill in new admin details | Fields accept input (name, email, role dropdown). |
| 5 | Click trash icon on an admin row | Row is removed immediately from the list. |
| 6 | If all admins removed | Text shows: "No admin users configured". |

| Actual Result | Status |
|---|---|
| | |

---

### TC-034: Settings — Business Tab (Teacher CRUD)

| Field | Value |
|---|---|
| **ID** | TC-034 |
| **Title** | Settings — Business Tab (Teacher CRUD) |
| **Priority** | P2 |
| **Preconditions** | Settings > Business tab. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Verify "Teachers" card | Shows existing teachers. Card header has "Add Teacher" button. |
| 2 | Verify each teacher row | 4-column grid: Name, Email, Phone, Instrument. Trash icon on the right. |
| 3 | Verify pre-populated teachers (demo) | Cecil (Guitar), Giri (Piano), Lakshmi (Carnatic Vocals). |
| 4 | Click "Add Teacher" | New empty row appended with auto-generated ID (T004, T005, etc.). |
| 5 | Click trash icon | Teacher row is removed. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-035: Settings — Business Tab (Templates)

| Field | Value |
|---|---|
| **ID** | TC-035 |
| **Title** | Settings — Business Tab (Templates) |
| **Priority** | P2 |
| **Preconditions** | Settings > Business tab. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Verify "WhatsApp Message Templates" card | Explanatory text about template approval. List of templates with expand/collapse. |
| 2 | Verify each template row | Shows: status badge (APPROVED=green, PENDING=amber, REJECTED=red), template name (bold), category and language. Chevron icon for expand. |
| 3 | Click a template row | Expands to show: template body (monospace in zinc-50 box), variables list with `{{1}} = variable_name` format in blue pills. |
| 4 | Click the same template again | Collapses the expanded section. |
| 5 | Click a different template | Previously expanded template collapses. Newly clicked one expands (accordion behavior). |

| Actual Result | Status |
|---|---|
| | |

---

### TC-036: Settings — Automation Tab (Daily Schedule Toggle)

| Field | Value |
|---|---|
| **ID** | TC-036 |
| **Title** | Settings — Automation Tab (Daily Schedule Toggle) |
| **Priority** | P2 |
| **Preconditions** | Settings > Automation tab selected. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click "Automation" tab | Tab activates. Description: "Scheduling, reminders & AI". |
| 2 | Verify "Daily Schedule Notifications" card | Toggle switch with label "Send daily class reminders". Description: "Automatically sends schedule reminders to all students with classes that day". |
| 3 | Toggle ON | Switch turns green. Additional fields appear: Send at (hour:minute dropdowns), Timezone dropdown (IST, GST, EST, GMT). |
| 4 | Change hour to "08", minute to "00" | Dropdowns accept selection. Hours: 00-23. Minutes: 00, 15, 30, 45. |
| 5 | Toggle OFF | Additional fields disappear. Switch turns zinc/grey. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-037: Settings — Automation Tab (Fee Reminders)

| Field | Value |
|---|---|
| **ID** | TC-037 |
| **Title** | Settings — Automation Tab (Fee Reminders) |
| **Priority** | P2 |
| **Preconditions** | Settings > Automation tab. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Verify "Fee Reminders" card | Toggle switch: "Automatic fee reminders". Description: "Sends payment reminders before the due date and on overdue". |
| 2 | Toggle ON | Switch turns green. "Remind before due date" dropdown appears: 1 day, 2 days, 3 days, 5 days, 7 days. |
| 3 | Select "3 days before" | Dropdown accepts selection. |
| 4 | Toggle OFF | Dropdown disappears. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-038: Settings — Automation Tab (AI Composition)

| Field | Value |
|---|---|
| **ID** | TC-038 |
| **Title** | Settings — Automation Tab (AI Composition) |
| **Priority** | P3 |
| **Preconditions** | Settings > Automation tab. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Verify "AI Message Composition" card | Toggle: "AI-powered messages". Description mentions Claude for personalized messages. |
| 2 | Toggle ON | Switch turns green. Fields appear: AI Provider dropdown (Claude), Model dropdown (Sonnet 4 / Haiku 4.5 / Opus 4.6), API Key (password field with show/hide). |
| 3 | Click Eye icon on API Key | Key becomes visible. Icon changes. |
| 4 | Select model "Claude Haiku 4.5 (Faster)" | Dropdown updates. |
| 5 | Toggle OFF | All AI fields disappear. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-039: Settings — Automation Tab (Delivery Settings)

| Field | Value |
|---|---|
| **ID** | TC-039 |
| **Title** | Settings — Automation Tab (Delivery Settings) |
| **Priority** | P2 |
| **Preconditions** | Settings > Automation tab. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Verify "Delivery Settings" card | Three dropdowns in a 3-column grid: Retry Attempts, Retry Delay, Rate Limit. |
| 2 | Verify Retry Attempts options | No retries, 1 retry, 2 retries, 3 retries. |
| 3 | Verify Retry Delay options | 1 second, 3 seconds, 5 seconds, 10 seconds. |
| 4 | Verify Rate Limit options | 100ms, 200ms (Recommended), 500ms, 1 second. Help text: "Delay between each WhatsApp message to avoid rate limits". |
| 5 | Change all three values | Dropdowns accept selections and state updates. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-040: Settings — Data Tab (Summary)

| Field | Value |
|---|---|
| **ID** | TC-040 |
| **Title** | Settings — Data Tab (Summary) |
| **Priority** | P1 |
| **Preconditions** | Settings > Data tab selected. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Click "Data" tab | Tab activates. Description: "Import, sync & data management". |
| 2 | Verify "Current Data" card | Shows 4 large numbers in a grid: Students (255), Enquiries (905), Batches (511), Classes (138). Database icon. |
| 3 | Verify seed generation timestamp | Below counts: "Seed generated: [date/time]". |
| 4 | If data was previously imported | Shows: "Last import: [filename] -- [date/time]". |

| Actual Result | Status |
|---|---|
| | |

---

### TC-041: Settings — Data Tab (Excel Import)

| Field | Value |
|---|---|
| **ID** | TC-041 |
| **Title** | Settings — Data Tab (Excel Import) |
| **Priority** | P1 |
| **Preconditions** | Settings > Data tab. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Verify "Import Excel File" card | Description mentions browser-only parsing. "Choose .xlsx File" button with Upload icon. |
| 2 | Click "Choose .xlsx File" | Native file picker opens. Accepts `.xlsx` and `.xls` files only. |
| 3 | Select a valid .xlsx file | Button changes to "Parsing..." with spinner. On success, green banner: 'Parsed "[filename]": X students, X enquiries, X batches, X derived classes'. |
| 4 | Select an invalid file | Red error banner appears with parse error message. |
| 5 | After successful import | Last import file name and timestamp are shown in Current Data card. File input resets (can import again). |

| Actual Result | Status |
|---|---|
| | |

---

### TC-042: Settings — Data Tab (Google Sheet Sync)

| Field | Value |
|---|---|
| **ID** | TC-042 |
| **Title** | Settings — Data Tab (Google Sheet Sync) |
| **Priority** | P2 |
| **Preconditions** | Settings > Data tab. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Verify "Google Sheet Sync" card | Description about live data from Google Sheet. URL input with Link icon. Auto-sync toggle. |
| 2 | Verify URL input | Placeholder: "https://docs.google.com/spreadsheets/d/...". Link icon on left. Help text: "The sheet must have the same tab structure as the migration Excel file". |
| 3 | Enter a Google Sheet URL | Field accepts input. |
| 4 | Toggle "Auto-sync" ON | Switch turns green. "Sync Interval" dropdown appears: 15 min, 30 min, 1 hour, 6 hours, once a day. |
| 5 | Toggle "Auto-sync" OFF | Interval dropdown disappears. |
| 6 | If last sync exists | Shows "Last synced: [timestamp]". |

| Actual Result | Status |
|---|---|
| | |

---

### TC-043: Settings — System Health Check

| Field | Value |
|---|---|
| **ID** | TC-043 |
| **Title** | Settings — System Health Check |
| **Priority** | P2 |
| **Preconditions** | User is on the Settings page (any tab). |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Scroll to bottom | "System Health" card is always visible below the active tab content, regardless of which tab is selected. |
| 2 | Before clicking Check | Text shows: 'Click "Check" to run a full system health check'. |
| 3 | Click "Check" button | RefreshCw icon spins. Button disabled during check. |
| 4 | On completion | JSON response displayed in a monospace pre block with zinc-50 background. Shows system health details (backend status, version, etc.). |
| 5 | On error | JSON shows `{ "error": "..." }` message. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-044: Settings — Save (all tabs)

| Field | Value |
|---|---|
| **ID** | TC-044 |
| **Title** | Settings — Save (all tabs) |
| **Priority** | P1 |
| **Preconditions** | User is on the Settings page. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | On Connection tab, click "Save Connection Settings" | Button shows spinner and "Saving...". On success, green banner: "Settings saved successfully" (disappears after 3 seconds). On error, red banner with message. |
| 2 | On Business tab, click "Save Business Profile" | Same save behavior. |
| 3 | On Automation tab, click "Save Automation Settings" | Same save behavior. |
| 4 | On Data tab, click "Save Data Settings" | Same save behavior. |
| 5 | Verify each save button has a CheckCircle icon | Icon visible when not saving. Spinner icon when saving. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-045: Navigation — Sidebar Links

| Field | Value |
|---|---|
| **ID** | TC-045 |
| **Title** | Navigation — Sidebar Links |
| **Priority** | P1 |
| **Preconditions** | User is logged in. On desktop viewport. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Verify sidebar structure | Left sidebar (240px wide) with: "Muzigal-WhatsApp" branding (bold) + "Powered by ZOO-CRM" subtitle, 5 nav items, user section at bottom. |
| 2 | Verify nav items | Dashboard (LayoutDashboard icon), Students (Users icon), Broadcast (Send icon), Test Message (MessageCircle icon), Settings (Settings icon). |
| 3 | Click "Students" | Navigates to `/dashboard/students`. Students page loads. |
| 4 | Click "Broadcast" | Navigates to `/dashboard/broadcast`. Broadcast page loads. |
| 5 | Click "Test Message" | Navigates to `/dashboard/test`. Test page loads. |
| 6 | Click "Settings" | Navigates to `/dashboard/settings`. Settings page loads. |
| 7 | Click "Dashboard" | Navigates to `/dashboard`. Dashboard page loads. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-046: Navigation — Active State

| Field | Value |
|---|---|
| **ID** | TC-046 |
| **Title** | Navigation — Active State |
| **Priority** | P2 |
| **Preconditions** | User is logged in. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | On Dashboard page | "Dashboard" nav item has emerald-50 background and emerald-700 text color. All other items have zinc text. |
| 2 | Click "Students" | "Students" item activates (green highlight). "Dashboard" returns to inactive style. |
| 3 | Click "Settings" | "Settings" activates. "Students" deactivates. |
| 4 | Dashboard uses `end` match | Dashboard nav item is only active on exact `/dashboard` route, NOT on child routes like `/dashboard/students`. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-047: Navigation — Logout

| Field | Value |
|---|---|
| **ID** | TC-047 |
| **Title** | Navigation — Logout |
| **Priority** | P1 |
| **Preconditions** | User is logged in. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Verify user section at sidebar bottom | Shows user avatar (initials circle), user name, user email. LogOut icon button on the right. |
| 2 | Verify displayed name (demo mode) | Name: "Demo User", Email: "demo@zoo.crm". |
| 3 | Hover over logout icon | Button gets zinc-100 background and darker icon color. |
| 4 | Click logout icon | User is redirected to `/login`. Session is cleared. |
| 5 | Try to access `/dashboard` directly after logout | Redirected to `/login` (ProtectedRoute guard). |

| Actual Result | Status |
|---|---|
| | |

---

### TC-048: Responsive — Mobile (375px)

| Field | Value |
|---|---|
| **ID** | TC-048 |
| **Title** | Responsive — Mobile (375px) |
| **Priority** | P1 |
| **Preconditions** | User is logged in. Browser or DevTools set to 375px width. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Verify sidebar | Sidebar is hidden off-screen (`-translate-x-full`). |
| 2 | Open sidebar (hamburger menu or swipe) | Sidebar slides in from the left. Dark overlay (bg-black/30) covers the rest of the screen. |
| 3 | Click overlay | Sidebar closes. |
| 4 | Click a nav item | Sidebar closes (onClose called). Page navigates. |
| 5 | Verify Dashboard stat cards | Stack in single column (1 col grid). |
| 6 | Verify Students table | Horizontal scroll enabled (`overflow-x-auto`). |
| 7 | Verify Broadcast page | Send form and recipient preview stack vertically (single column). |
| 8 | Verify Settings tabs | Tab icons only visible (labels hidden with `hidden sm:inline`). |
| 9 | Verify login page | Centered, max-width 384px. All elements fit without overflow. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-049: Responsive — Tablet (768px)

| Field | Value |
|---|---|
| **ID** | TC-049 |
| **Title** | Responsive — Tablet (768px) |
| **Priority** | P2 |
| **Preconditions** | User is logged in. Browser set to 768px width. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Verify sidebar | Still hidden on tablet (< lg breakpoint). Hamburger menu available. |
| 2 | Verify Dashboard stat cards | 2-column grid (`sm:grid-cols-2`). |
| 3 | Verify Students filters | Filters wrap naturally with `flex-wrap`. Search input takes full row, dropdowns wrap below. |
| 4 | Verify Settings tab labels | Tab labels visible alongside icons (`sm:inline`). |
| 5 | Verify Settings forms | 2-column grids for form fields (`sm:grid-cols-2`). |

| Actual Result | Status |
|---|---|
| | |

---

### TC-050: Responsive — Desktop (1440px)

| Field | Value |
|---|---|
| **ID** | TC-050 |
| **Title** | Responsive — Desktop (1440px) |
| **Priority** | P1 |
| **Preconditions** | User is logged in. Browser set to 1440px width. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Verify sidebar | Sidebar is permanently visible on the left (`lg:translate-x-0 lg:static`). No overlay. |
| 2 | Verify Dashboard stat cards | 4-column grid (`lg:grid-cols-4`). All 4 cards in one row. |
| 3 | Verify Broadcast page layout | 5-column grid: send form takes 3 cols, recipient preview takes 2 cols. Side by side. |
| 4 | Verify Test Message layout | 5-column grid: form 3 cols, history 2 cols. |
| 5 | Verify Students table | Full width, all columns visible without horizontal scroll. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-051: Design System — All Inputs use shared Input component

| Field | Value |
|---|---|
| **ID** | TC-051 |
| **Title** | Design System — All Inputs use shared Input component |
| **Priority** | P2 |
| **Preconditions** | User navigates through all pages. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Inspect any text input across the app | All inputs have consistent styling: rounded-lg border, border-zinc-200, bg-white, text-sm, zinc-400 placeholder, emerald-500 focus ring. |
| 2 | Verify Login page inputs | Email and password inputs use the shared Input component. |
| 3 | Verify Students search input | Uses shared Input with additional padding-left for the search icon. |
| 4 | Verify Broadcast message textarea | Uses shared Textarea component (same base styles, resize-none). |
| 5 | Verify Settings form inputs | All credential fields, profile fields, URL fields use shared Input component. |
| 6 | Focus on any input | Green focus ring (ring-emerald-500) appears. Border becomes transparent. |
| 7 | Verify disabled state on any input | Reduced opacity (50%) and not-allowed cursor. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-052: Design System — All Selects have custom chevron

| Field | Value |
|---|---|
| **ID** | TC-052 |
| **Title** | Design System — All Selects have custom chevron |
| **Priority** | P3 |
| **Preconditions** | User navigates to pages with dropdown selects. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Inspect any `<select>` element | Native select appearance is hidden (`appearance-none`). Custom SVG chevron-down icon appears on the right side via CSS background-image. |
| 2 | Verify Students page dropdowns | Subject, Status, and Duration filters all show custom chevron. |
| 3 | Verify Settings dropdowns | API Version, Timezone, Role, Sync Interval -- all have custom chevron. |
| 4 | Verify chevron color | Zinc/gray color (#71717a) matching the design system. |
| 5 | Verify right padding | Extra right padding (pr-9) ensures text does not overlap the chevron. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-053: Design System — Switch accessibility (role, aria-checked)

| Field | Value |
|---|---|
| **ID** | TC-053 |
| **Title** | Design System — Switch accessibility (role, aria-checked) |
| **Priority** | P2 |
| **Preconditions** | User is on Settings > Automation tab (or any page with Switch components). |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Inspect any Switch component in the DOM | Element is a `<button>` with `role="switch"` and `type="button"`. |
| 2 | When switch is ON | `aria-checked="true"`. Background is emerald-600. Thumb is translated right (`translate-x-4`). |
| 3 | When switch is OFF | `aria-checked="false"`. Background is zinc-200. Thumb is at rest (`translate-x-0`). |
| 4 | Focus the switch via keyboard (Tab) | Visible focus ring: emerald-500, ring-offset-2. |
| 5 | Verify disabled state | If disabled prop is set: reduced opacity, not-allowed cursor, click has no effect. |
| 6 | Verify all switch instances | Daily Schedule, Fee Reminders, AI Composition, Auto-sync (Data tab) all use the same Switch component. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-054: Data Integrity — Student count matches Excel (255)

| Field | Value |
|---|---|
| **ID** | TC-054 |
| **Title** | Data Integrity — Student count matches Excel (255) |
| **Priority** | P1 |
| **Preconditions** | User is logged in (demo mode). |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to Students page | Count label shows "255 students found" with no filters applied. |
| 2 | Navigate to Settings > Data tab | "Current Data" card shows Students: 255. |
| 3 | Navigate to Dashboard | "Active Students" stat card shows the count of active students (subset of 255 where Active=true). |

| Actual Result | Status |
|---|---|
| | |

---

### TC-055: Data Integrity — Enquiry count (905)

| Field | Value |
|---|---|
| **ID** | TC-055 |
| **Title** | Data Integrity — Enquiry count (905) |
| **Priority** | P1 |
| **Preconditions** | User is logged in (demo mode). |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to Dashboard | "Active Students" stat card subtext shows "905 enquiries". |
| 2 | Navigate to Settings > Data tab | "Current Data" card shows Enquiries: 905. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-056: Data Integrity — Batch count (511)

| Field | Value |
|---|---|
| **ID** | TC-056 |
| **Title** | Data Integrity — Batch count (511) |
| **Priority** | P1 |
| **Preconditions** | User is logged in (demo mode). |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to Settings > Data tab | "Current Data" card shows Batches: 511. |

| Actual Result | Status |
|---|---|
| | |

---

### TC-057: Data Integrity — Class derivation (138)

| Field | Value |
|---|---|
| **ID** | TC-057 |
| **Title** | Data Integrity — Class derivation (138) |
| **Priority** | P1 |
| **Preconditions** | User is logged in (demo mode). |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Navigate to Settings > Data tab | "Current Data" card shows Classes: 138. |
| 2 | Navigate to Broadcast > By Batch | Batch list should contain 138 items (total count when no search applied). |
| 3 | Verify class name format | Each class follows: "Subject -- BatchTime (Day)" format (e.g., "Piano -- 05 PM to 06 PM (Wednesday)"). |

| Actual Result | Status |
|---|---|
| | |

---

### TC-058: Data Integrity — Phone normalization (+91 format)

| Field | Value |
|---|---|
| **ID** | TC-058 |
| **Title** | Data Integrity — Phone normalization (+91 format) |
| **Priority** | P1 |
| **Preconditions** | User is on the Students page (demo mode). |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Verify Contact column in Students table | All phone numbers display with +91 prefix (e.g., "+919986697635"). |
| 2 | Check first student (STUD-00001) | Raw ContactNumber: "9986697635". Displayed Phone: "+919986697635". |
| 3 | Navigate to Broadcast > Individual > select any student | Recipient preview shows phone with +91 prefix. |
| 4 | Verify no phone numbers without +91 | Scroll through multiple pages. All contacts should have the +91 prefix in the Phone field (the Contact column shows `s.Phone || s.ContactNumber`). |

| Actual Result | Status |
|---|---|
| | |

---

### TC-059: Data Integrity — Date accuracy (matches Excel)

| Field | Value |
|---|---|
| **ID** | TC-059 |
| **Title** | Data Integrity — Date accuracy (matches Excel) |
| **Priority** | P2 |
| **Preconditions** | User is on the Students page. Original Excel file available for cross-reference. |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Verify STUD-00001 Expiry Date | Should show "2027-04-02" (matches seed data). |
| 2 | Verify STUD-00001 Start Date | StartDate in seed: "2025-10-09". |
| 3 | Spot-check 5 random students | Compare ExpiryDate, StartDate, EnrollmentDate against the source Excel file. All dates must match. |
| 4 | Verify date format in table | Dates display in YYYY-MM-DD format or the locale-formatted output. Null dates show "---" (em dash). |

| Actual Result | Status |
|---|---|
| | |

---

### TC-060: Data Integrity — No duplicate StudentIDs

| Field | Value |
|---|---|
| **ID** | TC-060 |
| **Title** | Data Integrity — No duplicate StudentIDs |
| **Priority** | P1 |
| **Preconditions** | User is on the Students page (demo mode). |

| Step | Action | Expected Result |
|---|---|---|
| 1 | Sort by StudentID ascending | IDs appear in sequential order: STUD-00001, STUD-00002, ..., STUD-00255. |
| 2 | Verify no gaps or duplicates | Each page shows sequential IDs without repetition. Total distinct count equals 255. |
| 3 | Open browser console and run validation | Execute: `document.querySelectorAll('td.font-mono').length` or equivalent to count ID cells. Alternatively, verify via the search: searching for a specific StudentID returns exactly 1 result. |
| 4 | Search "STUD-00001" | Exactly 1 result returned. |
| 5 | Search "STUD-00255" | Exactly 1 result returned (last student). |

| Actual Result | Status |
|---|---|
| | |

---

## Summary

| Category | Count | P1 | P2 | P3 |
|---|---|---|---|---|
| Login & Auth | TC-001 to TC-004 | 2 | 2 | 0 |
| Dashboard | TC-005 to TC-007 | 2 | 1 | 0 |
| Students | TC-008 to TC-015 | 4 | 4 | 0 |
| Broadcast | TC-016 to TC-023 | 4 | 4 | 0 |
| Test Message | TC-024 to TC-025 | 1 | 1 | 0 |
| Settings — Connection | TC-026 to TC-031 | 3 | 2 | 1 |
| Settings — Business | TC-032 to TC-035 | 0 | 4 | 0 |
| Settings — Automation | TC-036 to TC-039 | 0 | 3 | 1 |
| Settings — Data | TC-040 to TC-042 | 2 | 1 | 0 |
| Settings — General | TC-043 to TC-044 | 1 | 1 | 0 |
| Navigation | TC-045 to TC-047 | 2 | 1 | 0 |
| Responsive | TC-048 to TC-050 | 2 | 1 | 0 |
| Design System | TC-051 to TC-053 | 0 | 2 | 1 |
| Data Integrity | TC-054 to TC-060 | 5 | 1 | 0 |
| **Total** | **60** | **28** | **28** | **3** |

---

## Sign-off

| Role | Name | Date | Signature |
|---|---|---|---|
| QA Lead | | | |
| Product Owner | | | |
| Client Representative | | | |

---

*Document generated by ZOO CRM Engineering. For questions or clarifications, contact aldrin@atc.xyz.*
