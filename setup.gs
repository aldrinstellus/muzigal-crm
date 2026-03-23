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

  Logger.log('Sheet structure created successfully.');
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
