/**
 * utils.gs — Shared utility functions
 *
 * Student lookups, date helpers, phone formatting, logging, email summaries.
 */

/**
 * Returns an array of active student row objects for a given class.
 * @param {string} className - e.g. "Grade 10A"
 * @return {Object[]} Array of { studentId, name, phone, class, active }
 */
function getStudentsByClass(className) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Students');
  if (!sheet || sheet.getLastRow() <= 1) return [];

  var data = sheet.getDataRange().getValues();
  var students = [];

  for (var i = 1; i < data.length; i++) {
    var active = String(data[i][4]).toUpperCase() === 'TRUE';
    if (active && data[i][3] === className) {
      students.push({
        studentId: data[i][0],
        name: data[i][1],
        phone: String(data[i][2]),
        className: data[i][3],
        active: true
      });
    }
  }

  return students;
}

/**
 * Returns all active student objects (across all classes).
 * @return {Object[]}
 */
function getAllActiveStudents() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Students');
  if (!sheet || sheet.getLastRow() <= 1) return [];

  var data = sheet.getDataRange().getValues();
  var students = [];

  for (var i = 1; i < data.length; i++) {
    var active = String(data[i][4]).toUpperCase() === 'TRUE';
    if (active) {
      students.push({
        studentId: data[i][0],
        name: data[i][1],
        phone: String(data[i][2]),
        className: data[i][3],
        active: true
      });
    }
  }

  return students;
}

/**
 * Returns a student object by phone number.
 * @param {string} phone - E.164 format
 * @return {Object|null}
 */
function getStudentByPhone(phone) {
  var normalized = formatPhoneNumber(phone);
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Students');
  if (!sheet || sheet.getLastRow() <= 1) return null;

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (formatPhoneNumber(String(data[i][2])) === normalized) {
      return {
        studentId: data[i][0],
        name: data[i][1],
        phone: String(data[i][2]),
        className: data[i][3],
        active: String(data[i][4]).toUpperCase() === 'TRUE'
      };
    }
  }
  return null;
}

/**
 * Returns today's schedule rows for a given class (or all classes if null).
 * Only returns rows with Status = 'Active'.
 * @param {string} [className] - Optional class filter
 * @param {string} [dateStr] - Optional date override (YYYY-MM-DD), defaults to today IST
 * @return {Object[]} Array of schedule row objects
 */
function getTodaySchedule(className, dateStr) {
  var today = dateStr || getIndiaDate();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Schedule');
  if (!sheet || sheet.getLastRow() <= 1) return [];

  var data = sheet.getDataRange().getValues();
  var schedules = [];

  for (var i = 1; i < data.length; i++) {
    var rowDate = formatDateValue_(data[i][5]);
    var status = String(data[i][7]);

    if (rowDate === today && status === 'Active') {
      if (!className || data[i][1] === className) {
        schedules.push({
          scheduleId: data[i][0],
          className: data[i][1],
          subject: data[i][2],
          teacher: data[i][3],
          room: data[i][4],
          date: rowDate,
          time: String(data[i][6]),
          status: status,
          lastModified: data[i][8],
          modifiedBy: data[i][9],
          rowIndex: i + 1 // 1-based sheet row
        });
      }
    }
  }

  return schedules;
}

/**
 * Reads a full schedule row by its 1-based sheet row number.
 * @param {number} rowNum - 1-based row number in the Schedule sheet
 * @return {Object} Schedule row object
 */
function getScheduleRow(rowNum) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Schedule');
  var data = sheet.getRange(rowNum, 1, 1, 10).getValues()[0];

  return {
    scheduleId: data[0],
    className: data[1],
    subject: data[2],
    teacher: data[3],
    room: data[4],
    date: formatDateValue_(data[5]),
    time: String(data[6]),
    status: String(data[7]),
    lastModified: data[8],
    modifiedBy: data[9],
    rowIndex: rowNum
  };
}

/**
 * Normalizes a Date object or string to YYYY-MM-DD format.
 * @param {*} val
 * @return {string}
 */
function formatDateValue_(val) {
  if (val instanceof Date) {
    return Utilities.formatDate(val, 'Asia/Kolkata', 'yyyy-MM-dd');
  }
  return String(val);
}

/**
 * Returns today's date string in Asia/Kolkata timezone (YYYY-MM-DD).
 * @return {string}
 */
function getIndiaDate() {
  return Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd');
}

/**
 * Returns current timestamp string in Asia/Kolkata timezone.
 * @return {string}
 */
function getIndiaTimestamp() {
  return Utilities.formatDate(new Date(), 'Asia/Kolkata', 'yyyy-MM-dd HH:mm:ss');
}

/**
 * Ensures a phone number is in E.164 format (+91XXXXXXXXXX).
 * Handles common Indian number formats.
 * @param {string} phone
 * @return {string} E.164 formatted phone number
 */
function formatPhoneNumber(phone) {
  var cleaned = String(phone).replace(/[\s\-\(\)]/g, '');

  // Already E.164 with country code
  if (/^\+\d{10,15}$/.test(cleaned)) {
    return cleaned;
  }

  // Starts with country code without +
  if (/^91\d{10}$/.test(cleaned)) {
    return '+' + cleaned;
  }

  // Indian 10-digit number
  if (/^\d{10}$/.test(cleaned)) {
    return '+91' + cleaned;
  }

  // Starts with 0 (domestic format)
  if (/^0\d{10}$/.test(cleaned)) {
    return '+91' + cleaned.substring(1);
  }

  // Return as-is if we can't parse it
  Logger.log('Warning: Could not normalize phone number: ' + phone);
  return cleaned;
}

/**
 * Appends a row to the Log tab.
 * @param {Object} logData - { studentName, phone, messageType, messageSent, deliveryStatus, whatsappMsgId, error }
 */
function logToSheet(logData) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Log');
  if (!sheet) return;

  sheet.appendRow([
    getIndiaTimestamp(),
    logData.studentName || '',
    logData.phone || '',
    logData.messageType || '',
    logData.messageSent || '',
    logData.deliveryStatus || '',
    logData.whatsappMsgId || '',
    logData.error || ''
  ]);
}

/**
 * Appends a row to the Overrides tab.
 * @param {Object} data - { targetType, targetValue, message, sentBy, status }
 */
function logToOverrides(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Overrides');
  if (!sheet) return;

  sheet.appendRow([
    getIndiaTimestamp(),
    data.targetType || '',
    data.targetValue || '',
    data.message || '',
    data.sentBy || '',
    data.status || ''
  ]);
}

/**
 * Sends a summary email to the spreadsheet owner.
 * @param {Object} summary - { subject, sent, failed, errors[], details }
 */
function sendSummaryEmail(summary) {
  var recipient = Session.getEffectiveUser().getEmail();
  if (!recipient) {
    Logger.log('Cannot send summary email: no effective user email.');
    return;
  }

  var body = 'WhatsApp Notification Summary\n'
    + '================================\n'
    + 'Time: ' + getIndiaTimestamp() + '\n'
    + 'Sent: ' + (summary.sent || 0) + '\n'
    + 'Failed: ' + (summary.failed || 0) + '\n';

  if (summary.errors && summary.errors.length > 0) {
    body += '\nErrors:\n';
    summary.errors.forEach(function(err) {
      body += '  - ' + err + '\n';
    });
  }

  if (summary.details) {
    body += '\nDetails:\n' + summary.details + '\n';
  }

  MailApp.sendEmail({
    to: recipient,
    subject: summary.subject || 'WhatsApp Notification Summary',
    body: body
  });

  Logger.log('Summary email sent to ' + recipient);
}

/**
 * Wrapper around getConfig for convenience.
 * @param {string} key
 * @return {string|null}
 */
function getConfigValue(key) {
  return getConfig(key);
}
