/**
 * setup.gs — Sheet structure creation and trigger management
 *
 * Creates all required tabs, headers, and default config values.
 * Installs time-driven and installable onEdit triggers.
 */

/**
 * Creates all sheet tabs and headers if they don't exist.
 * Pre-populates the Config tab with default key-value pairs.
 */
function createSheetStructure() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Tab 1: Students
  var studentsSheet = getOrCreateSheet_(ss, 'Students');
  if (studentsSheet.getLastRow() === 0) {
    studentsSheet.appendRow(['StudentID', 'Name', 'Phone', 'Class', 'Active']);
    studentsSheet.getRange('A1:E1').setFontWeight('bold');
    studentsSheet.setColumnWidth(3, 160); // Phone column wider
  }

  // Tab 2: Schedule
  var scheduleSheet = getOrCreateSheet_(ss, 'Schedule');
  if (scheduleSheet.getLastRow() === 0) {
    scheduleSheet.appendRow([
      'ScheduleID', 'Class', 'Subject', 'Teacher', 'Room',
      'Date', 'Time', 'Status', 'LastModified', 'ModifiedBy'
    ]);
    scheduleSheet.getRange('A1:J1').setFontWeight('bold');
  }

  // Tab 3: Log
  var logSheet = getOrCreateSheet_(ss, 'Log');
  if (logSheet.getLastRow() === 0) {
    logSheet.appendRow([
      'Timestamp', 'StudentName', 'Phone', 'MessageType',
      'MessageSent', 'DeliveryStatus', 'WhatsAppMsgID', 'Error'
    ]);
    logSheet.getRange('A1:H1').setFontWeight('bold');
  }

  // Tab 4: Overrides
  var overridesSheet = getOrCreateSheet_(ss, 'Overrides');
  if (overridesSheet.getLastRow() === 0) {
    overridesSheet.appendRow([
      'Timestamp', 'TargetType', 'TargetValue', 'Message', 'SentBy', 'Status'
    ]);
    overridesSheet.getRange('A1:F1').setFontWeight('bold');
  }

  // Tab 5: Config
  var configSheet = getOrCreateSheet_(ss, 'Config');
  if (configSheet.getLastRow() === 0) {
    configSheet.appendRow(['Key', 'Value']);
    configSheet.getRange('A1:B1').setFontWeight('bold');

    var defaults = [
      ['WHATSAPP_TOKEN', '(placeholder)'],
      ['PHONE_NUMBER_ID', '(placeholder)'],
      ['TEMPLATE_NAME', 'class_update'],
      ['CLAUDE_API_KEY', '(placeholder)'],
      ['USE_CLAUDE', 'TRUE'],
      ['DAILY_SEND_HOUR', '8'],
      ['DAILY_SEND_MINUTE', '0'],
      ['TIMEZONE', 'Asia/Kolkata'],
      ['SCHOOL_NAME', '(placeholder)'],
      ['WEBHOOK_SECRET', '(placeholder)']
    ];

    defaults.forEach(function(row) {
      configSheet.appendRow(row);
    });
  }

  // Tab 6: Classes (Phase 2)
  var classesSheet = getOrCreateSheet_(ss, 'Classes');
  if (classesSheet.getLastRow() === 0) {
    classesSheet.appendRow([
      'ClassID', 'Instrument', 'Level', 'Name', 'Teacher', 'Room',
      'Day', 'Time', 'Duration', 'MaxStudents', 'CurrentStudents', 'Fee', 'Status'
    ]);
    classesSheet.getRange('A1:M1').setFontWeight('bold');
  }

  // Tab 7: Teachers (Phase 2)
  var teachersSheet = getOrCreateSheet_(ss, 'Teachers');
  if (teachersSheet.getLastRow() === 0) {
    teachersSheet.appendRow([
      'TeacherID', 'Name', 'Phone', 'Email', 'Instruments',
      'Availability', 'Status', 'JoinDate'
    ]);
    teachersSheet.getRange('A1:H1').setFontWeight('bold');
  }

  // Tab 8: Payments (Phase 2)
  var paymentsSheet = getOrCreateSheet_(ss, 'Payments');
  if (paymentsSheet.getLastRow() === 0) {
    paymentsSheet.appendRow([
      'PaymentID', 'StudentID', 'Amount', 'Date', 'DueDate',
      'Status', 'Method', 'RazorpayRef', 'Month', 'Notes'
    ]);
    paymentsSheet.getRange('A1:J1').setFontWeight('bold');
  }

  // Tab 9: Enrollment (Phase 2)
  var enrollmentSheet = getOrCreateSheet_(ss, 'Enrollment');
  if (enrollmentSheet.getLastRow() === 0) {
    enrollmentSheet.appendRow([
      'InquiryID', 'Name', 'Phone', 'Email', 'Instrument',
      'AgeGroup', 'Source', 'Status', 'DemoDate', 'AssignedTo', 'Notes', 'CreatedAt'
    ]);
    enrollmentSheet.getRange('A1:L1').setFontWeight('bold');
  }

  // Tab 10: Attendance (Phase 2)
  var attendanceSheet = getOrCreateSheet_(ss, 'Attendance');
  if (attendanceSheet.getLastRow() === 0) {
    attendanceSheet.appendRow([
      'AttendanceID', 'StudentID', 'ClassID', 'Date', 'Status', 'MarkedBy'
    ]);
    attendanceSheet.getRange('A1:F1').setFontWeight('bold');
  }

  // Tab 11: Users (Auth)
  var usersSheet = getOrCreateSheet_(ss, 'Users');
  if (usersSheet.getLastRow() === 0) {
    usersSheet.appendRow([
      'Email', 'Password', 'Name', 'Role', 'Active'
    ]);
    usersSheet.getRange('A1:E1').setFontWeight('bold');
    // Add default admin users
    usersSheet.appendRow(['aldrin@atc.xyz', 'admin123', 'Aldrin Stellus', 'admin', 'TRUE']);
    usersSheet.appendRow(['cecil@muzigal.com', 'cecil123', 'Cecil', 'admin', 'TRUE']);
    usersSheet.appendRow(['giri@muzigal.com', 'giri123', 'Giri', 'admin', 'TRUE']);
  }

  // Add Phase 2 config defaults if not present
  var configData = configSheet.getDataRange().getValues();
  var existingKeys = configData.map(function(row) { return row[0]; });
  var phase2Defaults = [
    ['JWT_SECRET', '(placeholder)'],
    ['ADMIN_EMAILS', '(placeholder)'],
    ['RAZORPAY_KEY_ID', '(placeholder)'],
    ['RAZORPAY_KEY_SECRET', '(placeholder)'],
    ['ACADEMY_NAME', 'Muzigal'],
    ['ACADEMY_PHONE', '+919403890891'],
    ['ACADEMY_EMAIL', 'muzigal.borewell@gmail.com']
  ];
  phase2Defaults.forEach(function(row) {
    if (existingKeys.indexOf(row[0]) === -1) {
      configSheet.appendRow(row);
    }
  });

  Logger.log('Sheet structure created successfully (Phase 1 + Phase 2 tabs).');
}

/**
 * Returns an existing sheet by name, or creates a new one.
 */
function getOrCreateSheet_(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

/**
 * Installs all required triggers:
 * - Daily time-driven trigger (reads hour/minute from Config)
 * - Installable onEdit trigger on any edit (filters in handler)
 */
function installTriggers() {
  // Remove existing triggers first to avoid duplicates
  removeAllTriggers();

  var hour = parseInt(getConfig('DAILY_SEND_HOUR'), 10) || 8;
  var minute = parseInt(getConfig('DAILY_SEND_MINUTE'), 10) || 0;

  // Daily schedule trigger — runs every day at configured time
  ScriptApp.newTrigger('sendDailySchedule')
    .timeBased()
    .atHour(hour)
    .nearMinute(minute)
    .everyDays(1)
    .inTimezone('Asia/Kolkata')
    .create();

  // Installable onEdit trigger — fires on any spreadsheet edit
  // The handler (onScheduleEdit) filters for Schedule tab only
  ScriptApp.newTrigger('onScheduleEdit')
    .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
    .onEdit()
    .create();

  Logger.log('Triggers installed: daily at ' + hour + ':' + minute + ' IST, onEdit for Schedule tab.');
}

/**
 * Removes all project triggers (cleanup utility).
 */
function removeAllTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(trigger) {
    ScriptApp.deleteTrigger(trigger);
  });
  Logger.log('Removed ' + triggers.length + ' trigger(s).');
}

/**
 * Validates that all Config values are filled (not placeholder).
 * Logs results and returns an array of missing/invalid keys.
 */
function testSetup() {
  var result = validateConfig();

  if (result.length === 0) {
    Logger.log('All config values are set. Setup is valid.');
  } else {
    Logger.log('Missing or placeholder config keys: ' + result.join(', '));
  }

  // Check that all tabs exist
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var requiredTabs = ['Students', 'Schedule', 'Log', 'Overrides', 'Config'];
  var missingTabs = [];

  requiredTabs.forEach(function(tab) {
    if (!ss.getSheetByName(tab)) {
      missingTabs.push(tab);
    }
  });

  if (missingTabs.length > 0) {
    Logger.log('Missing tabs: ' + missingTabs.join(', ') + '. Run createSheetStructure() first.');
  } else {
    Logger.log('All required tabs exist.');
  }

  // Check triggers
  var triggers = ScriptApp.getProjectTriggers();
  Logger.log('Active triggers: ' + triggers.length);
  triggers.forEach(function(t) {
    Logger.log('  - ' + t.getHandlerFunction() + ' (' + t.getEventType() + ')');
  });

  return { missingConfig: result, missingTabs: missingTabs, triggerCount: triggers.length };
}
