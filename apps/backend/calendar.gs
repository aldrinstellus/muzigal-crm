/**
 * calendar.gs — Google Calendar sync for class schedules
 *
 * Syncs class schedule from the Schedule tab to Google Calendar.
 * Uses CalendarApp (built-in Apps Script service, no API key needed).
 * Tracks event IDs in a CalendarSync tab for create/update/delete operations.
 *
 * Config key: CALENDAR_ID — the Google Calendar ID to sync events to.
 * If blank, uses the script owner's default calendar.
 */

// CalendarSync tab column indices (1-based for sheet operations)
var CALSYNC_COLS_ = {
  SCHEDULE_ROW: 1,
  SCHEDULE_ID: 2,
  CALENDAR_EVENT_ID: 3,
  LAST_SYNCED: 4,
  STATUS: 5
};

// ---------------------------------------------------------------------------
// Main sync function
// ---------------------------------------------------------------------------

/**
 * Reads the Schedule tab and creates/updates/deletes Google Calendar events.
 * Tracks event mappings in the CalendarSync tab.
 *
 * Flow:
 *  1. Load all Schedule rows
 *  2. Load existing CalendarSync mappings
 *  3. For each schedule row:
 *     - If new (no mapping) and Active → create event
 *     - If existing mapping and Active → update event
 *     - If existing mapping and Cancelled → delete event
 *  4. Write updated mappings back to CalendarSync tab
 */
function syncScheduleToCalendar() {
  var calendar = getCalendar_();
  if (!calendar) {
    Logger.log('Calendar sync aborted: could not get calendar. Check CALENDAR_ID config.');
    return;
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var scheduleSheet = ss.getSheetByName('Schedule');
  if (!scheduleSheet || scheduleSheet.getLastRow() <= 1) {
    Logger.log('No schedule data found. Nothing to sync.');
    return;
  }

  var scheduleData = scheduleSheet.getDataRange().getValues();

  // Load existing sync mappings: { scheduleId: { row, eventId, status } }
  var syncMap = loadSyncMap_();

  var stats = { created: 0, updated: 0, deleted: 0, skipped: 0, errors: [] };

  for (var i = 1; i < scheduleData.length; i++) {
    var classData = parseScheduleRow_(scheduleData[i], i + 1);

    try {
      var existing = syncMap[classData.scheduleId];

      if (classData.status === 'Cancelled') {
        // Delete event if it exists in calendar
        if (existing && existing.status !== 'deleted') {
          deleteClassEvent(calendar, existing.eventId);
          updateSyncEntry_(classData.scheduleId, existing.eventId, 'deleted');
          stats.deleted++;
        } else {
          stats.skipped++;
        }
      } else if (classData.status === 'Active' || classData.status === 'Rescheduled') {
        if (existing && existing.status !== 'deleted') {
          // Update existing event
          updateClassEvent(calendar, existing.eventId, classData);
          updateSyncEntry_(classData.scheduleId, existing.eventId, 'synced');
          stats.updated++;
        } else {
          // Create new event
          var eventId = createClassEvent(calendar, classData);
          if (eventId) {
            updateSyncEntry_(classData.scheduleId, eventId, 'synced');
            stats.created++;
          } else {
            stats.errors.push('Failed to create event for ' + classData.scheduleId);
          }
        }
      } else {
        stats.skipped++;
      }
    } catch (err) {
      stats.errors.push(classData.scheduleId + ': ' + err.message);
      Logger.log('Error syncing ' + classData.scheduleId + ': ' + err.message);
    }
  }

  Logger.log('Calendar sync complete. Created: ' + stats.created
    + ', Updated: ' + stats.updated
    + ', Deleted: ' + stats.deleted
    + ', Skipped: ' + stats.skipped
    + ', Errors: ' + stats.errors.length);

  if (stats.errors.length > 0) {
    sendSummaryEmail({
      subject: 'Calendar Sync — ' + stats.errors.length + ' error(s)',
      sent: stats.created + stats.updated,
      failed: stats.errors.length,
      errors: stats.errors,
      details: 'Created: ' + stats.created + ', Updated: ' + stats.updated
        + ', Deleted: ' + stats.deleted + ', Skipped: ' + stats.skipped
    });
  }

  return stats;
}

// ---------------------------------------------------------------------------
// Event CRUD
// ---------------------------------------------------------------------------

/**
 * Creates a single Google Calendar event for a class.
 *
 * @param {Calendar} calendar - CalendarApp calendar object
 * @param {Object} classData - Parsed schedule row
 * @return {string|null} The created event ID, or null on failure
 */
function createClassEvent(calendar, classData) {
  var times = parseClassTimes_(classData.date, classData.time);
  if (!times) {
    Logger.log('Cannot create event: invalid date/time for ' + classData.scheduleId);
    return null;
  }

  var title = buildEventTitle_(classData);
  var description = buildEventDescription_(classData);

  var event = calendar.createEvent(title, times.start, times.end, {
    location: classData.room || '',
    description: description
  });

  var eventId = event.getId();
  Logger.log('Created calendar event: ' + title + ' (ID: ' + eventId + ')');
  return eventId;
}

/**
 * Updates an existing Google Calendar event with new class data.
 *
 * @param {Calendar} calendar - CalendarApp calendar object
 * @param {string} eventId - Existing calendar event ID
 * @param {Object} classData - Updated schedule row data
 */
function updateClassEvent(calendar, eventId, classData) {
  var event = calendar.getEventById(eventId);
  if (!event) {
    // Event was deleted outside of sync — recreate it
    Logger.log('Event ' + eventId + ' not found in calendar. Recreating.');
    var newId = createClassEvent(calendar, classData);
    if (newId) {
      updateSyncEntry_(classData.scheduleId, newId, 'synced');
    }
    return;
  }

  var times = parseClassTimes_(classData.date, classData.time);
  if (!times) {
    Logger.log('Cannot update event: invalid date/time for ' + classData.scheduleId);
    return;
  }

  event.setTitle(buildEventTitle_(classData));
  event.setDescription(buildEventDescription_(classData));
  event.setLocation(classData.room || '');
  event.setTime(times.start, times.end);

  Logger.log('Updated calendar event: ' + classData.scheduleId + ' (ID: ' + eventId + ')');
}

/**
 * Deletes a Google Calendar event by ID.
 *
 * @param {Calendar} calendar - CalendarApp calendar object
 * @param {string} eventId - Calendar event ID to delete
 */
function deleteClassEvent(calendar, eventId) {
  var event = calendar.getEventById(eventId);
  if (event) {
    var title = event.getTitle();
    event.deleteEvent();
    Logger.log('Deleted calendar event: ' + title + ' (ID: ' + eventId + ')');
  } else {
    Logger.log('Event ' + eventId + ' already deleted from calendar.');
  }
}

// ---------------------------------------------------------------------------
// Trigger setup
// ---------------------------------------------------------------------------

/**
 * Sets up an automatic trigger to sync the schedule to Google Calendar.
 * Runs every hour to catch any changes. Also syncs immediately on first call.
 *
 * Call this once during initial setup. Safe to call multiple times
 * (removes existing calendar sync triggers before creating a new one).
 */
function setupCalendarSync() {
  // Ensure CalendarSync tab exists
  ensureCalendarSyncTab_();

  // Ensure CALENDAR_ID config key exists
  ensureCalendarIdConfig_();

  // Remove existing calendar sync triggers
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'syncScheduleToCalendar') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // Create hourly trigger
  ScriptApp.newTrigger('syncScheduleToCalendar')
    .timeBased()
    .everyHours(1)
    .create();

  Logger.log('Calendar sync trigger installed (hourly). Running initial sync...');

  // Run immediate sync
  syncScheduleToCalendar();
}

// ---------------------------------------------------------------------------
// onEdit integration
// ---------------------------------------------------------------------------

/**
 * Called from onScheduleEdit (watcher.gs) when a schedule change is detected.
 * Syncs the changed row to Google Calendar immediately.
 *
 * @param {Object} scheduleRow - The modified schedule row object from getScheduleRow()
 * @param {string} changeType - Type of change (cancellation, teacher_change, etc.)
 */
function syncScheduleRowToCalendar(scheduleRow, changeType) {
  var calendar = getCalendar_();
  if (!calendar) return;

  var classData = {
    scheduleId: scheduleRow.scheduleId,
    className: scheduleRow.className,
    subject: scheduleRow.subject,
    teacher: scheduleRow.teacher,
    room: scheduleRow.room,
    date: scheduleRow.date,
    time: scheduleRow.time,
    status: scheduleRow.status,
    rowIndex: scheduleRow.rowIndex
  };

  var syncMap = loadSyncMap_();
  var existing = syncMap[classData.scheduleId];

  try {
    if (changeType === 'cancellation') {
      if (existing && existing.status !== 'deleted') {
        deleteClassEvent(calendar, existing.eventId);
        updateSyncEntry_(classData.scheduleId, existing.eventId, 'deleted');
        Logger.log('Calendar event deleted for cancelled class: ' + classData.scheduleId);
      }
    } else {
      // Any other change — update or create
      if (existing && existing.status !== 'deleted') {
        updateClassEvent(calendar, existing.eventId, classData);
        updateSyncEntry_(classData.scheduleId, existing.eventId, 'synced');
      } else {
        var eventId = createClassEvent(calendar, classData);
        if (eventId) {
          updateSyncEntry_(classData.scheduleId, eventId, 'synced');
        }
      }
      Logger.log('Calendar event synced for change (' + changeType + '): ' + classData.scheduleId);
    }
  } catch (err) {
    Logger.log('Calendar sync error for ' + classData.scheduleId + ': ' + err.message);
  }
}

// ---------------------------------------------------------------------------
// CalendarSync tab management
// ---------------------------------------------------------------------------

/**
 * Loads the CalendarSync tab into a lookup map.
 * @return {Object} Map of scheduleId → { row, eventId, status }
 * @private
 */
function loadSyncMap_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('CalendarSync');
  if (!sheet || sheet.getLastRow() <= 1) return {};

  var data = sheet.getDataRange().getValues();
  var map = {};

  for (var i = 1; i < data.length; i++) {
    var scheduleId = String(data[i][1]); // ScheduleID column
    map[scheduleId] = {
      sheetRow: i + 1, // 1-based row in CalendarSync tab
      scheduleRow: data[i][0],
      eventId: String(data[i][2]),
      lastSynced: data[i][3],
      status: String(data[i][4])
    };
  }

  return map;
}

/**
 * Creates or updates a sync entry in the CalendarSync tab.
 * @param {string} scheduleId
 * @param {string} eventId
 * @param {string} status - 'synced' or 'deleted'
 * @private
 */
function updateSyncEntry_(scheduleId, eventId, status) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('CalendarSync');
  if (!sheet) {
    sheet = ensureCalendarSyncTab_();
  }

  var data = sheet.getDataRange().getValues();
  var now = getIndiaTimestamp();

  // Look for existing entry
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]) === String(scheduleId)) {
      // Update existing row
      var row = i + 1;
      sheet.getRange(row, CALSYNC_COLS_.CALENDAR_EVENT_ID).setValue(eventId);
      sheet.getRange(row, CALSYNC_COLS_.LAST_SYNCED).setValue(now);
      sheet.getRange(row, CALSYNC_COLS_.STATUS).setValue(status);
      return;
    }
  }

  // New entry — append row
  sheet.appendRow([
    '', // ScheduleRow (legacy, kept for reference)
    scheduleId,
    eventId,
    now,
    status
  ]);
}

/**
 * Creates the CalendarSync tab if it doesn't exist.
 * @return {Sheet} The CalendarSync sheet
 * @private
 */
function ensureCalendarSyncTab_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('CalendarSync');

  if (!sheet) {
    sheet = ss.insertSheet('CalendarSync');
    sheet.appendRow([
      'ScheduleRow', 'ScheduleID', 'CalendarEventID', 'LastSynced', 'Status'
    ]);
    sheet.getRange('A1:E1').setFontWeight('bold');
    Logger.log('Created CalendarSync tab.');
  }

  return sheet;
}

/**
 * Adds CALENDAR_ID to Config tab if not present.
 * @private
 */
function ensureCalendarIdConfig_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var configSheet = ss.getSheetByName('Config');
  if (!configSheet) return;

  var data = configSheet.getDataRange().getValues();
  for (var i = 0; i < data.length; i++) {
    if (data[i][0] === 'CALENDAR_ID') return; // Already exists
  }

  configSheet.appendRow(['CALENDAR_ID', '(placeholder)']);
  Logger.log('Added CALENDAR_ID to Config tab. Set it to your Google Calendar ID.');
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Gets the Google Calendar instance based on CALENDAR_ID config.
 * Falls back to the default calendar if CALENDAR_ID is blank or placeholder.
 * @return {Calendar|null}
 * @private
 */
function getCalendar_() {
  var calendarId = getConfig('CALENDAR_ID');

  if (!calendarId || calendarId === '(placeholder)' || calendarId.trim() === '') {
    Logger.log('CALENDAR_ID not set. Using default calendar.');
    return CalendarApp.getDefaultCalendar();
  }

  var calendar = CalendarApp.getCalendarById(calendarId);
  if (!calendar) {
    Logger.log('ERROR: Calendar not found for ID: ' + calendarId
      + '. Check that the ID is correct and the script has access.');
    return null;
  }

  return calendar;
}

/**
 * Parses a schedule row array into a classData object.
 * @param {Array} row - Raw row from Schedule sheet
 * @param {number} rowIndex - 1-based row number in the sheet
 * @return {Object} Parsed class data
 * @private
 */
function parseScheduleRow_(row, rowIndex) {
  return {
    scheduleId: String(row[0]),
    className: String(row[1]),
    subject: String(row[2]),
    teacher: String(row[3]),
    room: String(row[4]),
    date: formatDateValue_(row[5]),
    time: String(row[6]),
    status: String(row[7]),
    rowIndex: rowIndex
  };
}

/**
 * Parses date (YYYY-MM-DD) and time (e.g. "10:00 AM", "14:30", "10:00-11:00")
 * into start and end Date objects. Defaults to 1-hour duration if no end time.
 *
 * @param {string} dateStr - YYYY-MM-DD
 * @param {string} timeStr - Time string (various formats supported)
 * @return {Object|null} { start: Date, end: Date } or null if unparseable
 * @private
 */
function parseClassTimes_(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;

  var dateParts = dateStr.split('-');
  if (dateParts.length !== 3) return null;

  var year = parseInt(dateParts[0], 10);
  var month = parseInt(dateParts[1], 10) - 1; // 0-based month
  var day = parseInt(dateParts[2], 10);

  // Handle time ranges like "10:00-11:00" or "10:00 AM - 11:00 AM"
  var timeParts = timeStr.split(/\s*[-–]\s*/);
  var startTime = parseTimeString_(timeParts[0].trim());
  if (!startTime) return null;

  var startDate = new Date(year, month, day, startTime.hours, startTime.minutes);

  var endDate;
  if (timeParts.length > 1) {
    var endTime = parseTimeString_(timeParts[1].trim());
    if (endTime) {
      endDate = new Date(year, month, day, endTime.hours, endTime.minutes);
    }
  }

  // Default: 1 hour duration
  if (!endDate) {
    endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
  }

  return { start: startDate, end: endDate };
}

/**
 * Parses a time string like "10:00", "10:00 AM", "14:30", "2:30 PM".
 * @param {string} str
 * @return {Object|null} { hours, minutes } in 24-hour format
 * @private
 */
function parseTimeString_(str) {
  if (!str) return null;

  var match = str.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return null;

  var hours = parseInt(match[1], 10);
  var minutes = parseInt(match[2], 10);
  var ampm = match[3] ? match[3].toUpperCase() : null;

  if (ampm === 'PM' && hours < 12) hours += 12;
  if (ampm === 'AM' && hours === 12) hours = 0;

  return { hours: hours, minutes: minutes };
}

/**
 * Builds the event title from class data.
 * Format: "Class: {Subject} - {Teacher}"
 * @param {Object} classData
 * @return {string}
 * @private
 */
function buildEventTitle_(classData) {
  var parts = ['Class:'];
  if (classData.subject) {
    parts.push(classData.subject);
  } else if (classData.className) {
    parts.push(classData.className);
  }
  if (classData.teacher) {
    parts.push('-');
    parts.push(classData.teacher);
  }
  return parts.join(' ');
}

/**
 * Builds the event description including student list for the class.
 * @param {Object} classData
 * @return {string}
 * @private
 */
function buildEventDescription_(classData) {
  var lines = [];

  lines.push('Class: ' + (classData.className || ''));
  lines.push('Subject: ' + (classData.subject || ''));
  lines.push('Teacher: ' + (classData.teacher || ''));
  lines.push('Room: ' + (classData.room || ''));
  lines.push('');

  // Fetch student list for this class
  try {
    var students = getStudentsByClass(classData.className);
    if (students.length > 0) {
      lines.push('Students (' + students.length + '):');
      students.forEach(function(s) {
        lines.push('  • ' + s.name);
      });
    } else {
      lines.push('Students: (none enrolled)');
    }
  } catch (err) {
    lines.push('Students: (could not load)');
  }

  lines.push('');
  lines.push('— Synced by ZOO CRM');

  return lines.join('\n');
}
