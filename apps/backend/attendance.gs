/**
 * attendance.gs — WhatsApp-integrated attendance tracking
 *
 * Extends the base attendance system (api.gs) with parent/guardian
 * WhatsApp notifications for absences, bulk marking, daily reports,
 * and attendance summaries.
 *
 * Sheet tab: Attendance
 * Columns: AttendanceID, StudentID, StudentName, StudentPhone, ParentPhone,
 *          ClassID, Date, Status, MarkedBy, MarkedAt, NotificationSent
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

var ATTENDANCE_TAB_ = 'Attendance';
var ATTENDANCE_STATUSES_ = ['Present', 'Absent', 'Late'];

// ---------------------------------------------------------------------------
// Single attendance mark (by student name)
// ---------------------------------------------------------------------------

/**
 * Marks attendance for a student by name, date, and status.
 * Looks up the student in the Students tab to resolve phone numbers.
 * If a record already exists for this student + date, it updates in place.
 *
 * @param {string} studentName - The student's name (must match Students tab)
 * @param {string} date - Date string (YYYY-MM-DD)
 * @param {string} status - 'Present', 'Absent', or 'Late'
 * @return {Object} The created/updated attendance record
 */
function markAttendanceByName(studentName, date, status) {
  if (!studentName) {
    throw new Error('studentName is required');
  }
  if (!date) {
    throw new Error('date is required');
  }

  // Validate status
  status = String(status || 'Present');
  if (ATTENDANCE_STATUSES_.indexOf(status) === -1) {
    throw new Error('Invalid status: ' + status + '. Must be one of: ' + ATTENDANCE_STATUSES_.join(', '));
  }

  // Look up student by name
  var student = findStudentByName_(studentName);
  if (!student) {
    throw new Error('Student not found: ' + studentName);
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(ATTENDANCE_TAB_);
  if (!sheet) {
    throw new Error(ATTENDANCE_TAB_ + ' tab not found. Run createSheetStructure() first.');
  }

  var now = getIndiaTimestamp();
  var parentPhone = getParentPhone_(student);

  // Check for existing record (same student + date) to avoid duplicates
  var existing = findAttendanceRow_(sheet, student.studentId, date);
  if (existing.rowIndex > 0) {
    // Update existing record
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var statusCol = headers.indexOf('Status');
    var markedAtCol = headers.indexOf('MarkedAt');
    var notifCol = headers.indexOf('NotificationSent');

    if (statusCol !== -1) sheet.getRange(existing.rowIndex, statusCol + 1).setValue(status);
    if (markedAtCol !== -1) sheet.getRange(existing.rowIndex, markedAtCol + 1).setValue(now);
    if (notifCol !== -1) sheet.getRange(existing.rowIndex, notifCol + 1).setValue('No');

    Logger.log('Attendance updated: ' + studentName + ' on ' + date + ' -> ' + status);

    return {
      attendanceId: existing.attendanceId,
      studentId: student.studentId,
      studentName: studentName,
      studentPhone: student.phone,
      parentPhone: parentPhone,
      classId: student.className,
      date: date,
      status: status,
      markedAt: now,
      notificationSent: 'No',
      updated: true
    };
  }

  // Create new record
  var newId = generateId_(sheet, 'ATT');
  var newRow = [
    newId,
    student.studentId,
    studentName,
    formatPhoneNumber(student.phone),
    parentPhone,
    student.className,
    date,
    status,
    'API',
    now,
    'No'
  ];

  sheet.appendRow(newRow);
  Logger.log('Attendance marked: ' + newId + ' — ' + studentName + ' ' + status + ' on ' + date);

  return {
    attendanceId: newId,
    studentId: student.studentId,
    studentName: studentName,
    studentPhone: formatPhoneNumber(student.phone),
    parentPhone: parentPhone,
    classId: student.className,
    date: date,
    status: status,
    markedBy: 'API',
    markedAt: now,
    notificationSent: 'No'
  };
}

// ---------------------------------------------------------------------------
// Bulk attendance
// ---------------------------------------------------------------------------

/**
 * Marks attendance for multiple students at once.
 *
 * @param {string} date - Date string (YYYY-MM-DD)
 * @param {Object[]} attendanceList - Array of { studentName, status }
 * @return {Object} { marked: number, failed: number, results: Object[], errors: string[] }
 */
function markBulkAttendance(date, attendanceList) {
  if (!date) {
    throw new Error('date is required');
  }
  if (!attendanceList || !Array.isArray(attendanceList) || attendanceList.length === 0) {
    throw new Error('attendanceList must be a non-empty array');
  }

  var marked = 0;
  var failed = 0;
  var results = [];
  var errors = [];

  for (var i = 0; i < attendanceList.length; i++) {
    var entry = attendanceList[i];
    try {
      var result = markAttendanceByName(
        entry.studentName,
        date,
        entry.status || 'Present'
      );
      results.push(result);
      marked++;
    } catch (err) {
      failed++;
      errors.push(entry.studentName + ': ' + err.message);
      Logger.log('Bulk attendance error for ' + entry.studentName + ': ' + err.message);
    }
  }

  Logger.log('Bulk attendance for ' + date + ': ' + marked + ' marked, ' + failed + ' failed');

  return {
    date: date,
    marked: marked,
    failed: failed,
    results: results,
    errors: errors
  };
}

// ---------------------------------------------------------------------------
// Absence notifications via WhatsApp
// ---------------------------------------------------------------------------

/**
 * Sends WhatsApp messages to parents of students marked absent on a given date.
 * Only sends to students whose NotificationSent column is not 'Yes'.
 * Updates the NotificationSent column after sending.
 *
 * @param {string} date - Date string (YYYY-MM-DD)
 * @return {Object} { sent: number, failed: number, skipped: number, errors: string[] }
 */
function notifyAbsences(date) {
  if (!date) {
    date = getIndiaDate();
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(ATTENDANCE_TAB_);
  if (!sheet || sheet.getLastRow() <= 1) {
    return { sent: 0, failed: 0, skipped: 0, errors: [], message: 'No attendance records found' };
  }

  var data = sheet.getDataRange().getValues();
  var headers = data[0];

  // Resolve column indices
  var cols = resolveAttendanceColumns_(headers);
  var schoolName = getConfig('SCHOOL_NAME') || getConfig('ACADEMY_NAME') || 'the academy';

  var sent = 0;
  var failed = 0;
  var skipped = 0;
  var errors = [];

  for (var i = 1; i < data.length; i++) {
    var rowDate = formatAttendanceDate_(data[i][cols.date]);
    var rowStatus = String(data[i][cols.status] || '');
    var notified = String(data[i][cols.notificationSent] || '');

    if (rowDate !== date) continue;
    if (rowStatus !== 'Absent') continue;

    // Already notified — skip
    if (notified === 'Yes') {
      skipped++;
      continue;
    }

    var studentName = String(data[i][cols.studentName] || '');
    var parentPhone = String(data[i][cols.parentPhone] || '');
    var studentPhone = String(data[i][cols.studentPhone] || '');

    // Determine which phone to send to: prefer parent, fall back to student
    var targetPhone = parentPhone || studentPhone;
    if (!targetPhone || targetPhone === 'undefined' || targetPhone === '') {
      failed++;
      errors.push(studentName + ': No phone number available');
      continue;
    }

    var formattedPhone = formatPhoneNumber(targetPhone);

    // Compose the absence notification message
    var message = studentName + ' was marked absent from class on ' + date
      + '. If this is incorrect, please contact us. - ' + schoolName;

    // Send via WhatsApp template
    var templateName = getConfig('TEMPLATE_NAME') || 'class_update';
    var result = sendTemplate(formattedPhone, templateName, [message]);

    // Log the notification
    logToSheet({
      studentName: studentName,
      phone: formattedPhone,
      messageType: 'absence_notification',
      messageSent: message,
      deliveryStatus: result.success ? 'sent' : 'failed',
      whatsappMsgId: result.messageId || '',
      error: result.error || ''
    });

    if (result.success) {
      sent++;
      // Update NotificationSent column
      if (cols.notificationSent !== -1) {
        sheet.getRange(i + 1, cols.notificationSent + 1).setValue('Yes');
      }
    } else {
      failed++;
      errors.push(studentName + ': ' + result.error);
    }

    // Rate limiting: 200ms between sends
    Utilities.sleep(200);
  }

  Logger.log('Absence notifications for ' + date + ': sent=' + sent + ', failed=' + failed + ', skipped=' + skipped);

  // Send summary email if there were failures
  if (failed > 0) {
    sendSummaryEmail({
      subject: 'Absence Notification Failures — ' + date + ' (' + failed + ' failed)',
      sent: sent,
      failed: failed,
      errors: errors,
      details: 'Date: ' + date + '\nSkipped (already notified): ' + skipped
    });
  }

  return {
    date: date,
    sent: sent,
    failed: failed,
    skipped: skipped,
    errors: errors
  };
}

// ---------------------------------------------------------------------------
// Attendance reports
// ---------------------------------------------------------------------------

/**
 * Returns an attendance summary for a student over a date range.
 *
 * @param {string} studentName - The student's name
 * @param {string} startDate - Start date (YYYY-MM-DD), inclusive
 * @param {string} endDate - End date (YYYY-MM-DD), inclusive
 * @return {Object} { studentName, startDate, endDate, totalDays, present, absent, late, attendanceRate, records[] }
 */
function getAttendanceReportByName(studentName, startDate, endDate) {
  if (!studentName) {
    throw new Error('studentName is required');
  }
  if (!startDate || !endDate) {
    throw new Error('startDate and endDate are required');
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(ATTENDANCE_TAB_);
  if (!sheet || sheet.getLastRow() <= 1) {
    return {
      studentName: studentName,
      startDate: startDate,
      endDate: endDate,
      totalDays: 0,
      present: 0,
      absent: 0,
      late: 0,
      attendanceRate: 0,
      records: []
    };
  }

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var cols = resolveAttendanceColumns_(headers);

  var records = [];
  var present = 0;
  var absent = 0;
  var late = 0;

  for (var i = 1; i < data.length; i++) {
    var rowName = String(data[i][cols.studentName] || '');
    var rowDate = formatAttendanceDate_(data[i][cols.date]);
    var rowStatus = String(data[i][cols.status] || '');

    // Match by student name (case-insensitive)
    if (rowName.toLowerCase() !== studentName.toLowerCase()) continue;

    // Apply date range filter
    if (rowDate < startDate || rowDate > endDate) continue;

    records.push({
      date: rowDate,
      status: rowStatus,
      markedBy: String(data[i][cols.markedBy] || ''),
      markedAt: String(data[i][cols.markedAt] || '')
    });

    var statusLower = rowStatus.toLowerCase();
    if (statusLower === 'present') present++;
    else if (statusLower === 'absent') absent++;
    else if (statusLower === 'late') late++;
  }

  // Sort records by date ascending
  records.sort(function(a, b) {
    return a.date > b.date ? 1 : a.date < b.date ? -1 : 0;
  });

  var totalDays = records.length;
  var attendanceRate = totalDays > 0 ? Math.round(((present + late) / totalDays) * 100) : 0;

  return {
    studentName: studentName,
    startDate: startDate,
    endDate: endDate,
    totalDays: totalDays,
    present: present,
    absent: absent,
    late: late,
    attendanceRate: attendanceRate,
    records: records
  };
}

/**
 * Returns all attendance records for a given date.
 *
 * @param {string} date - Date string (YYYY-MM-DD)
 * @return {Object} { date, total, present, absent, late, attendanceRate, records[] }
 */
function getDailyAttendanceReport(date) {
  if (!date) {
    date = getIndiaDate();
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(ATTENDANCE_TAB_);
  if (!sheet || sheet.getLastRow() <= 1) {
    return {
      date: date,
      total: 0,
      present: 0,
      absent: 0,
      late: 0,
      attendanceRate: 0,
      records: []
    };
  }

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var cols = resolveAttendanceColumns_(headers);

  var records = [];
  var present = 0;
  var absent = 0;
  var late = 0;

  for (var i = 1; i < data.length; i++) {
    var rowDate = formatAttendanceDate_(data[i][cols.date]);

    if (rowDate !== date) continue;

    var rowStatus = String(data[i][cols.status] || '');
    var record = {
      attendanceId: String(data[i][cols.attendanceId] || ''),
      studentId: String(data[i][cols.studentId] || ''),
      studentName: String(data[i][cols.studentName] || ''),
      studentPhone: String(data[i][cols.studentPhone] || ''),
      parentPhone: String(data[i][cols.parentPhone] || ''),
      classId: String(data[i][cols.classId] || ''),
      date: rowDate,
      status: rowStatus,
      markedBy: String(data[i][cols.markedBy] || ''),
      markedAt: String(data[i][cols.markedAt] || ''),
      notificationSent: String(data[i][cols.notificationSent] || '')
    };

    records.push(record);

    var statusLower = rowStatus.toLowerCase();
    if (statusLower === 'present') present++;
    else if (statusLower === 'absent') absent++;
    else if (statusLower === 'late') late++;
  }

  var total = records.length;
  var attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  return {
    date: date,
    total: total,
    present: present,
    absent: absent,
    late: late,
    attendanceRate: attendanceRate,
    records: records
  };
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * Finds a student by name from the Students tab.
 * Matches case-insensitively. Returns the first match.
 * @private
 * @param {string} name - Student name
 * @return {Object|null} Student object or null
 */
function findStudentByName_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Students');
  if (!sheet || sheet.getLastRow() <= 1) return null;

  var data = sheet.getDataRange().getValues();
  var nameLower = name.toLowerCase();

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][1]).toLowerCase() === nameLower) {
      return {
        studentId: String(data[i][0]),
        name: String(data[i][1]),
        phone: String(data[i][2]),
        className: String(data[i][3]),
        active: String(data[i][4]).toUpperCase() === 'TRUE'
      };
    }
  }

  return null;
}

/**
 * Returns the parent/guardian phone for a student.
 * Checks for a ParentPhone column in the Students tab; falls back to student phone.
 * @private
 * @param {Object} student - Student object from findStudentByName_
 * @return {string} Formatted parent phone number
 */
function getParentPhone_(student) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Students');
  if (!sheet || sheet.getLastRow() <= 1) return formatPhoneNumber(student.phone);

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var parentPhoneCol = -1;

  for (var j = 0; j < headers.length; j++) {
    var header = String(headers[j]).toLowerCase();
    if (header === 'parentphone' || header === 'parent_phone' || header === 'guardianphone') {
      parentPhoneCol = j;
      break;
    }
  }

  if (parentPhoneCol === -1) {
    // No parent phone column — fall back to student phone
    return formatPhoneNumber(student.phone);
  }

  // Find the student row and get parent phone
  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === student.studentId) {
      var parentPhone = String(data[i][parentPhoneCol]);
      if (parentPhone && parentPhone !== '' && parentPhone !== 'undefined') {
        return formatPhoneNumber(parentPhone);
      }
      break;
    }
  }

  return formatPhoneNumber(student.phone);
}

/**
 * Finds an existing attendance row for a student on a given date.
 * @private
 * @param {Sheet} sheet - The Attendance sheet
 * @param {string} studentId - The StudentID
 * @param {string} date - Date string (YYYY-MM-DD)
 * @return {Object} { rowIndex: number (1-based, 0 if not found), attendanceId: string }
 */
function findAttendanceRow_(sheet, studentId, date) {
  if (sheet.getLastRow() <= 1) return { rowIndex: 0, attendanceId: '' };

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var cols = resolveAttendanceColumns_(headers);

  for (var i = 1; i < data.length; i++) {
    var rowStudentId = String(data[i][cols.studentId] || '');
    var rowDate = formatAttendanceDate_(data[i][cols.date]);

    if (rowStudentId === studentId && rowDate === date) {
      return {
        rowIndex: i + 1, // 1-based sheet row
        attendanceId: String(data[i][cols.attendanceId] || '')
      };
    }
  }

  return { rowIndex: 0, attendanceId: '' };
}

/**
 * Resolves column indices for the Attendance tab headers.
 * Handles both the original 6-column format and the extended 11-column format.
 * @private
 * @param {string[]} headers - Array of header strings
 * @return {Object} Map of field names to column indices (0-based)
 */
function resolveAttendanceColumns_(headers) {
  var cols = {
    attendanceId: -1,
    studentId: -1,
    studentName: -1,
    studentPhone: -1,
    parentPhone: -1,
    classId: -1,
    date: -1,
    status: -1,
    markedBy: -1,
    markedAt: -1,
    notificationSent: -1
  };

  for (var j = 0; j < headers.length; j++) {
    var h = String(headers[j]);
    switch (h) {
      case 'AttendanceID': cols.attendanceId = j; break;
      case 'StudentID': cols.studentId = j; break;
      case 'StudentName': cols.studentName = j; break;
      case 'StudentPhone': cols.studentPhone = j; break;
      case 'ParentPhone': cols.parentPhone = j; break;
      case 'ClassID': cols.classId = j; break;
      case 'Date': cols.date = j; break;
      case 'Status': cols.status = j; break;
      case 'MarkedBy': cols.markedBy = j; break;
      case 'MarkedAt': cols.markedAt = j; break;
      case 'NotificationSent': cols.notificationSent = j; break;
      // Handle legacy column name
      case 'CreatedAt': if (cols.markedAt === -1) cols.markedAt = j; break;
    }
  }

  return cols;
}
