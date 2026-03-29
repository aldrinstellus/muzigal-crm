# Testing Guide -- WhatsApp Class Notifications

Copy-paste these test functions into a `tests.gs` file in your Apps Script project, or run them one at a time in the editor. Tests 1-6 require no API keys. Tests 7-11 require WhatsApp configuration.

---

## Test 1: Validate Config

Checks that all 10 required keys are filled in the Config tab.

```javascript
function testValidateConfig() {
  var missing = validateConfig();
  if (missing.length === 0) {
    Logger.log('PASS: All config keys are set');
  } else {
    Logger.log('FAIL: Missing keys: ' + missing.join(', '));
  }
}
```

---

## Test 2: Sheet Structure

Verifies all 5 tabs exist with correct headers.

```javascript
function testSheetStructure() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var tabs = ['Students', 'Schedule', 'Log', 'Overrides', 'Config'];
  var pass = true;

  tabs.forEach(function(tab) {
    var sheet = ss.getSheetByName(tab);
    if (!sheet) {
      Logger.log('FAIL: Missing tab: ' + tab);
      pass = false;
    } else {
      Logger.log('OK: Tab exists: ' + tab + ' (' + sheet.getLastRow() + ' rows)');
    }
  });

  if (pass) Logger.log('PASS: All tabs exist');
}
```

---

## Test 3: Composer -- Fallback Templates (no API keys needed)

Tests message composition using built-in templates. Set `USE_CLAUDE=FALSE` in the Config tab first.

```javascript
function testComposerFallback() {
  var student = {
    name: 'Arjun Nair',
    phone: '+919876543210',
    className: 'Guitar Batch'
  };

  var schedule = {
    subject: 'Acoustic Guitar',
    teacher: 'Mr. Rajesh Kumar',
    room: 'Studio A',
    time: '10:00',
    date: '2026-03-23',
    status: 'Active'
  };

  var types = [
    ['daily_schedule', null, null],
    ['teacher_change', 'Mr. Rajesh Kumar', 'Ms. Priya Menon'],
    ['room_change', 'Studio A', 'Studio B'],
    ['time_change', '10:00', '14:00'],
    ['date_change', '2026-03-23', '2026-03-25'],
    ['cancellation', null, null],
    ['reschedule', null, null]
  ];

  types.forEach(function(t) {
    var msg = composeMessage(student, schedule, t[0], t[1], t[2]);
    Logger.log('[' + t[0] + '] ' + msg);

    // Verify constraints
    if (msg.length > 1024) {
      Logger.log('  FAIL: Message exceeds 1024 chars (' + msg.length + ')');
    }
    if (/[*_~`#]/.test(msg)) {
      Logger.log('  FAIL: Message contains markdown characters');
    }
    if (msg.indexOf('Arjun') === -1) {
      Logger.log('  FAIL: Message does not contain student first name');
    }
  });

  Logger.log('PASS: All 7 message types composed');
}
```

---

## Test 4: Composer -- Claude API (requires CLAUDE_API_KEY)

Tests message composition with Claude. Set `USE_CLAUDE=TRUE` in the Config tab first.

```javascript
function testComposerClaude() {
  var student = {
    name: 'Kavya Reddy',
    phone: '+919876543211',
    className: 'Guitar Batch'
  };

  var schedule = {
    subject: 'Music Theory',
    teacher: 'Ms. Divya Nair',
    room: 'Room 3',
    time: '11:30',
    date: '2026-03-23',
    status: 'Active'
  };

  var msg = composeMessage(student, schedule, 'daily_schedule');
  Logger.log('Claude message: ' + msg);

  if (msg && msg.length > 0 && msg.length <= 1024) {
    Logger.log('PASS: Claude composed a valid message (' + msg.length + ' chars)');
  } else {
    Logger.log('FAIL: Claude message invalid or empty');
  }
}
```

---

## Test 5: Phone Number Formatting

Tests that Indian phone numbers in various formats are normalized to E.164.

```javascript
function testPhoneFormatting() {
  var cases = [
    ['+919876543210', '+919876543210'],   // Already E.164
    ['919876543210', '+919876543210'],    // Missing +
    ['9876543210', '+919876543210'],      // 10-digit Indian number
    ['09876543210', '+919876543210'],     // Domestic format with leading 0
    ['98765 43210', '+919876543210'],     // With spaces
    ['+91 98765-43210', '+919876543210'], // With spaces and dashes
    ['+1 (555) 123-4567', '+15551234567'] // Non-Indian (US) number
  ];

  var pass = true;
  cases.forEach(function(c) {
    var result = formatPhoneNumber(c[0]);
    if (result === c[1]) {
      Logger.log('OK: ' + c[0] + ' -> ' + result);
    } else {
      Logger.log('FAIL: ' + c[0] + ' -> ' + result + ' (expected ' + c[1] + ')');
      pass = false;
    }
  });

  Logger.log(pass ? 'PASS: All phone formats correct' : 'FAIL: Some formats incorrect');
}
```

---

## Test 6: Student Lookup

Requires test data in the Students tab (see SETUP.md Step 5).

```javascript
function testStudentLookup() {
  var guitarStudents = getStudentsByClass('Guitar Batch');
  Logger.log('Guitar Batch students: ' + guitarStudents.length);
  guitarStudents.forEach(function(s) {
    Logger.log('  - ' + s.name + ' (' + s.phone + ')');
  });

  var pianoStudents = getStudentsByClass('Piano Basics');
  Logger.log('Piano Basics students: ' + pianoStudents.length);

  var all = getAllActiveStudents();
  Logger.log('All active students: ' + all.length);

  if (guitarStudents.length > 0 && all.length > 0) {
    Logger.log('PASS: Student lookup working');
  } else {
    Logger.log('FAIL: No students found. Add test data to Students tab (see SETUP.md Step 5).');
  }
}
```

---

## Test 7: WhatsApp Send -- Single Message (requires WhatsApp config)

Replace the phone number with YOUR WhatsApp number.

```javascript
function testWhatsAppSend() {
  var phone = '+919876543210'; // <-- REPLACE WITH YOUR NUMBER
  var result = sendTemplate(
    phone,
    getConfig('TEMPLATE_NAME') || 'class_update',
    ['Hi! This is a test from Muzigal WhatsApp Notifications. Your Guitar class is at 10:00 AM in Studio A.']
  );

  Logger.log('Result: ' + JSON.stringify(result));

  if (result.success) {
    Logger.log('PASS: Message sent! ID: ' + result.messageId);
  } else {
    Logger.log('FAIL: ' + result.error);
  }
}
```

---

## Test 8: Full Pipeline -- composeAndSend (requires WhatsApp config)

Tests the complete flow: compose message > send via WhatsApp > log to sheet.

```javascript
function testFullPipeline() {
  var student = {
    name: 'Arjun Nair',
    phone: '+919876543210', // <-- REPLACE WITH YOUR NUMBER
    className: 'Guitar Batch'
  };

  var schedule = {
    subject: 'Acoustic Guitar',
    teacher: 'Mr. Rajesh Kumar',
    room: 'Studio A',
    time: '10:00',
    date: '2026-03-23',
    status: 'Active'
  };

  var result = composeAndSend(student, schedule, 'daily_schedule');
  Logger.log('Result: ' + JSON.stringify(result));

  // Check the Log tab for the entry
  var logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Log');
  var lastRow = logSheet.getLastRow();
  Logger.log('Log tab now has ' + lastRow + ' rows (including header)');

  if (result.success) {
    Logger.log('PASS: Full pipeline works end-to-end');
  } else {
    Logger.log('FAIL: ' + result.error);
  }
}
```

---

## Test 9: Daily Scheduler (requires WhatsApp config + schedule data for today)

Triggers the full daily schedule send. Make sure the Schedule tab has rows with today's date and Status = "Active".

```javascript
function testDailyScheduler() {
  Logger.log('Running daily scheduler for today...');
  sendDailySchedule();
  Logger.log('Done. Check the Log tab for results and your WhatsApp for messages.');
}
```

---

## Test 10: Web App Endpoints (run from terminal, not Apps Script)

After deploying as a web app (SETUP.md Step 7), test these endpoints from your terminal.

### Health check (GET)

```bash
curl "YOUR_WEB_APP_URL"
```

Expected response:
```json
{"status":"ok","timestamp":"2026-03-23 10:30:00","triggerCount":2}
```

### Send a test message (POST)

```bash
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "muzigal-notify-2026",
    "action": "send_test",
    "phone": "+919876543210",
    "message": "Test from Muzigal! Your Piano class starts at 10:00 AM in the Piano Room."
  }'
```

### Send an override to a class (POST)

```bash
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "muzigal-notify-2026",
    "action": "send_override",
    "target_type": "class",
    "target_value": "Drums Level 2",
    "message": "Drums class is cancelled today due to studio maintenance. Next class is on Wednesday as usual.",
    "sent_by": "Muzigal Admin"
  }'
```

### Send an override to all students (POST)

```bash
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "muzigal-notify-2026",
    "action": "send_override",
    "target_type": "all",
    "target_value": "all",
    "message": "Muzigal annual concert rehearsal this Saturday at 4 PM in the main hall. All students please attend!",
    "sent_by": "Muzigal Admin"
  }'
```

### Trigger daily schedule via API (POST)

```bash
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "muzigal-notify-2026",
    "action": "send_daily"
  }'
```

### Trigger daily schedule for a specific date (POST)

```bash
curl -X POST "YOUR_WEB_APP_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "muzigal-notify-2026",
    "action": "send_daily",
    "date": "2026-03-25"
  }'
```

---

## Test 11: Edit Trigger -- Manual Verification

This test verifies the installable onEdit trigger is working. It cannot be automated -- you must perform it manually in the Google Sheet.

1. Open the Google Sheet > **Schedule** tab
2. Change the **Teacher** column in any row (e.g., `Mr. Rajesh Kumar` > `Ms. Priya Menon`)
3. Wait 5-10 seconds (the trigger fires asynchronously)
4. Check the **Log** tab -- a new row should appear with:
   - MessageType: `teacher_change`
   - DeliveryStatus: `sent`
5. Check your WhatsApp -- you should receive a notification about the teacher change
6. Verify the **LastModified** and **ModifiedBy** columns in the Schedule tab were updated

Try these additional change types:

| Column to Edit | Expected MessageType | Example Change |
|---------------|---------------------|----------------|
| **Teacher** | `teacher_change` | `Mr. Rajesh Kumar` > `Ms. Priya Menon` |
| **Room** | `room_change` | `Studio A` > `Studio B` |
| **Time** | `time_change` | `10:00` > `14:00` |
| **Date** | `date_change` | `2026-03-23` > `2026-03-25` |
| **Status** | `cancellation` | `Active` > `Cancelled` |
| **Status** | `reschedule` | `Active` > `Rescheduled` |

---

## Testing Checklist

| # | Test | Needs API Key? | Status |
|---|------|---------------|--------|
| 1 | Validate config | No | [ ] |
| 2 | Sheet structure | No | [ ] |
| 3 | Composer fallback (7 message types) | No | [ ] |
| 4 | Composer with Claude | Claude API key | [ ] |
| 5 | Phone number formatting (7 cases) | No | [ ] |
| 6 | Student lookup by class | No (needs test data) | [ ] |
| 7 | WhatsApp single send | WhatsApp token | [ ] |
| 8 | Full pipeline (compose + send + log) | WhatsApp token | [ ] |
| 9 | Daily scheduler | WhatsApp token + schedule data | [ ] |
| 10 | Web app endpoints (6 curl commands) | WhatsApp token + deployed web app | [ ] |
| 11 | Edit trigger (6 change types) | WhatsApp token + triggers installed | [ ] |

**Recommended order**: Run tests 1-6 first (no API keys needed), then 7-11 after configuring WhatsApp.

---

## Interpreting Log Tab Results

After running tests, check the Log tab for these columns:

| Column | What to Look For |
|--------|-----------------|
| **Timestamp** | Should be recent (IST timezone) |
| **StudentName** | Student name or `TEST` for test sends |
| **Phone** | E.164 format (e.g., `+919876543210`) |
| **MessageType** | Should match the test type (`daily_schedule`, `teacher_change`, `test`, etc.) |
| **MessageSent** | The composed message text |
| **DeliveryStatus** | `sent` = success, `failed` = check Error column |
| **WhatsAppMsgID** | Present if delivery succeeded (e.g., `wamid.xxxxx`) |
| **Error** | Empty if successful; contains error details if failed |
