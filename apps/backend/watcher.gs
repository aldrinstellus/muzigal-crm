/**
 * watcher.gs — Installable onEdit handler for the Schedule tab
 *
 * Detects changes to teacher, room, status, time, or date columns
 * and sends targeted WhatsApp notifications to affected students.
 */

// Column index map for the Schedule tab (0-based)
var SCHEDULE_COLUMNS_ = {
  SCHEDULE_ID: 1,
  CLASS: 2,
  SUBJECT: 3,
  TEACHER: 4,
  ROOM: 5,
  DATE: 6,
  TIME: 7,
  STATUS: 8,
  LAST_MODIFIED: 9,
  MODIFIED_BY: 10
};

// Map column numbers to change types
var COLUMN_CHANGE_MAP_ = {
  4: 'teacher_change',   // Teacher column
  5: 'room_change',      // Room column
  7: 'time_change',      // Time column
  6: 'date_change',      // Date column
  8: null                // Status — handled specially (cancellation or reschedule)
};

/**
 * Installable onEdit trigger handler.
 * Detects relevant changes in the Schedule tab and sends notifications.
 *
 * @param {Object} e - Event object from Apps Script onEdit trigger
 */
function onScheduleEdit(e) {
  if (!e || !e.range) return;

  var sheet = e.range.getSheet();

  // Only act on edits to the Schedule tab
  if (sheet.getName() !== 'Schedule') return;

  var row = e.range.getRow();
  var col = e.range.getColumn();

  // Ignore header row
  if (row <= 1) return;

  // Check if this is a monitored column
  var changeType = null;

  if (col === 8) {
    // Status column — determine if cancellation or reschedule
    var newStatus = String(e.value || '').trim();
    if (newStatus === 'Cancelled') {
      changeType = 'cancellation';
    } else if (newStatus === 'Rescheduled') {
      changeType = 'reschedule';
    } else {
      // Status changed to something else (e.g. back to Active) — no notification
      return;
    }
  } else if (COLUMN_CHANGE_MAP_.hasOwnProperty(col)) {
    changeType = COLUMN_CHANGE_MAP_[col];
  } else {
    // Not a monitored column — exit silently
    return;
  }

  if (!changeType) return;

  var oldValue = e.oldValue || '';
  var newValue = e.value || '';

  // Update LastModified and ModifiedBy columns
  var now = getIndiaTimestamp();
  var user = Session.getActiveUser().getEmail() || 'unknown';
  sheet.getRange(row, SCHEDULE_COLUMNS_.LAST_MODIFIED).setValue(now);
  sheet.getRange(row, SCHEDULE_COLUMNS_.MODIFIED_BY).setValue(user);

  // Get the full schedule row data
  var scheduleRow = getScheduleRow(row);

  // Find all active students in the affected class
  var students = getStudentsByClass(scheduleRow.className);

  if (students.length === 0) {
    Logger.log('No active students found for class: ' + scheduleRow.className);
    return;
  }

  Logger.log('Schedule change detected: ' + changeType
    + ' for class ' + scheduleRow.className
    + ' (' + students.length + ' students)');

  // Send notifications to all affected students
  var result = batchSend(students, scheduleRow, changeType, oldValue, newValue);

  Logger.log('Batch send complete: ' + result.sent + ' sent, ' + result.failed + ' failed');

  // Send summary email if there were failures
  if (result.failed > 0) {
    sendSummaryEmail({
      subject: 'WhatsApp Alert: ' + result.failed + ' delivery failure(s) — ' + changeType,
      sent: result.sent,
      failed: result.failed,
      errors: result.errors,
      details: 'Change: ' + changeType + '\nClass: ' + scheduleRow.className
        + '\nOld: ' + oldValue + '\nNew: ' + newValue
    });
  }
}
