/**
 * api.gs — Full CRUD operations for ZOO CRM
 *
 * Provides create, read, update operations for Students, Classes, Teachers,
 * Inquiries (enrollment pipeline), Attendance, and Dashboard stats.
 * All data is stored in Google Sheets tabs.
 */

// ---------------------------------------------------------------------------
// Student CRUD
// ---------------------------------------------------------------------------

/**
 * Returns an array of student objects with optional filters.
 * @param {Object} [filters] - Optional filters: {class, status, instrument, search}
 * @return {Object[]} Array of student objects
 */
function listStudents(filters) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Students');
  if (!sheet || sheet.getLastRow() <= 1) return [];

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var results = [];

  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }

    // Apply filters
    if (filters && filters.class && row.Class !== filters.class) continue;
    if (filters && filters.status === 'active' && String(row.Active).toUpperCase() !== 'TRUE') continue;
    if (filters && filters.status === 'inactive' && String(row.Active).toUpperCase() !== 'FALSE') continue;
    if (filters && filters.instrument && row.Instrument !== filters.instrument) continue;
    if (filters && filters.search) {
      var term = filters.search.toLowerCase();
      var match = (String(row.Name || '').toLowerCase().indexOf(term) !== -1) ||
                  (String(row.Email || '').toLowerCase().indexOf(term) !== -1) ||
                  (String(row.Phone || '').toLowerCase().indexOf(term) !== -1) ||
                  (String(row.StudentID || '').toLowerCase().indexOf(term) !== -1);
      if (!match) continue;
    }

    results.push(row);
  }

  return results;
}

/**
 * Returns a single student object by StudentID.
 * @param {string} id - The StudentID (e.g. "S001")
 * @return {Object|null} Student object or null if not found
 */
function getStudent(id) {
  if (!id) return null;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Students');
  if (!sheet || sheet.getLastRow() <= 1) return null;

  var data = sheet.getDataRange().getValues();
  var headers = data[0];

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      var row = {};
      for (var j = 0; j < headers.length; j++) {
        row[headers[j]] = data[i][j];
      }
      return row;
    }
  }

  return null;
}

/**
 * Creates a new student record in the Students tab.
 * @param {Object} data - Student data {Name, Phone, Email, Class, Instrument, ...}
 * @return {Object} The created student object with generated StudentID
 */
function createStudent(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Students');
  if (!sheet) {
    Logger.log('createStudent: Students tab not found');
    throw new Error('Students tab not found');
  }

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var newId = generateId_(sheet, 'S');

  var newRow = [];
  for (var j = 0; j < headers.length; j++) {
    var header = headers[j];
    if (header === 'StudentID') {
      newRow.push(newId);
    } else if (header === 'Active') {
      newRow.push('TRUE');
    } else if (header === 'CreatedAt') {
      newRow.push(getIndiaTimestamp());
    } else if (header === 'UpdatedAt') {
      newRow.push(getIndiaTimestamp());
    } else {
      newRow.push(data[header] || '');
    }
  }

  sheet.appendRow(newRow);
  Logger.log('Student created: ' + newId + ' — ' + (data.Name || ''));

  // Return the created object
  var result = {};
  for (var k = 0; k < headers.length; k++) {
    result[headers[k]] = newRow[k];
  }
  return result;
}

/**
 * Updates specific fields for a student by StudentID.
 * @param {string} id - The StudentID
 * @param {Object} data - Fields to update (key-value pairs matching column headers)
 * @return {Object|null} Updated student object or null if not found
 */
function updateStudent(id, data) {
  if (!id || !data) return null;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Students');
  if (!sheet || sheet.getLastRow() <= 1) return null;

  var allData = sheet.getDataRange().getValues();
  var headers = allData[0];
  var rowIndex = findRowById_(allData, id);

  if (rowIndex === -1) {
    Logger.log('updateStudent: Student not found — ' + id);
    return null;
  }

  // Update matching fields
  for (var j = 0; j < headers.length; j++) {
    if (data.hasOwnProperty(headers[j]) && headers[j] !== 'StudentID') {
      sheet.getRange(rowIndex + 1, j + 1).setValue(data[headers[j]]);
    }
  }

  // Update timestamp
  var updatedAtCol = headers.indexOf('UpdatedAt');
  if (updatedAtCol !== -1) {
    sheet.getRange(rowIndex + 1, updatedAtCol + 1).setValue(getIndiaTimestamp());
  }

  Logger.log('Student updated: ' + id);
  return getStudent(id);
}

/**
 * Deactivates a student by setting Active=FALSE.
 * @param {string} id - The StudentID
 * @return {Object|null} Updated student object or null if not found
 */
function deactivateStudent(id) {
  if (!id) return null;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Students');
  if (!sheet || sheet.getLastRow() <= 1) return null;

  var allData = sheet.getDataRange().getValues();
  var headers = allData[0];
  var rowIndex = findRowById_(allData, id);

  if (rowIndex === -1) {
    Logger.log('deactivateStudent: Student not found — ' + id);
    return null;
  }

  var activeCol = headers.indexOf('Active');
  if (activeCol !== -1) {
    sheet.getRange(rowIndex + 1, activeCol + 1).setValue('FALSE');
  }

  var updatedAtCol = headers.indexOf('UpdatedAt');
  if (updatedAtCol !== -1) {
    sheet.getRange(rowIndex + 1, updatedAtCol + 1).setValue(getIndiaTimestamp());
  }

  Logger.log('Student deactivated: ' + id);
  return getStudent(id);
}

// ---------------------------------------------------------------------------
// Class CRUD
// ---------------------------------------------------------------------------

/**
 * Returns an array of class objects with optional filters.
 * @param {Object} [filters] - Optional filters: {instrument, teacher, status}
 * @return {Object[]} Array of class objects
 */
function listClasses(filters) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Classes');
  if (!sheet || sheet.getLastRow() <= 1) return [];

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var results = [];

  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }

    // Apply filters
    if (filters && filters.instrument && row.Instrument !== filters.instrument) continue;
    if (filters && filters.teacher && row.Teacher !== filters.teacher) continue;
    if (filters && filters.status && String(row.Status).toLowerCase() !== filters.status.toLowerCase()) continue;

    results.push(row);
  }

  return results;
}

/**
 * Returns a single class object by ClassID, including enrolled student count.
 * @param {string} id - The ClassID (e.g. "CLS001")
 * @return {Object|null} Class object with enrolledCount, or null if not found
 */
function getClass(id) {
  if (!id) return null;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Classes');
  if (!sheet || sheet.getLastRow() <= 1) return null;

  var data = sheet.getDataRange().getValues();
  var headers = data[0];

  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      var row = {};
      for (var j = 0; j < headers.length; j++) {
        row[headers[j]] = data[i][j];
      }

      // Count enrolled students for this class
      var students = listStudents({ class: row.ClassName || row.Name || id, status: 'active' });
      row.enrolledCount = students.length;

      return row;
    }
  }

  return null;
}

/**
 * Creates a new class record in the Classes tab.
 * @param {Object} data - Class data {ClassName, Instrument, Teacher, Schedule, Capacity, ...}
 * @return {Object} The created class object with generated ClassID
 */
function createClass(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Classes');
  if (!sheet) {
    Logger.log('createClass: Classes tab not found');
    throw new Error('Classes tab not found');
  }

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var newId = generateId_(sheet, 'CLS');

  var newRow = [];
  for (var j = 0; j < headers.length; j++) {
    var header = headers[j];
    if (header === 'ClassID') {
      newRow.push(newId);
    } else if (header === 'Status') {
      newRow.push(data.Status || 'Active');
    } else if (header === 'CreatedAt') {
      newRow.push(getIndiaTimestamp());
    } else if (header === 'UpdatedAt') {
      newRow.push(getIndiaTimestamp());
    } else {
      newRow.push(data[header] || '');
    }
  }

  sheet.appendRow(newRow);
  Logger.log('Class created: ' + newId + ' — ' + (data.ClassName || ''));

  var result = {};
  for (var k = 0; k < headers.length; k++) {
    result[headers[k]] = newRow[k];
  }
  return result;
}

/**
 * Updates specific fields for a class by ClassID.
 * @param {string} id - The ClassID
 * @param {Object} data - Fields to update
 * @return {Object|null} Updated class object or null if not found
 */
function updateClass(id, data) {
  if (!id || !data) return null;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Classes');
  if (!sheet || sheet.getLastRow() <= 1) return null;

  var allData = sheet.getDataRange().getValues();
  var headers = allData[0];
  var rowIndex = findRowById_(allData, id);

  if (rowIndex === -1) {
    Logger.log('updateClass: Class not found — ' + id);
    return null;
  }

  for (var j = 0; j < headers.length; j++) {
    if (data.hasOwnProperty(headers[j]) && headers[j] !== 'ClassID') {
      sheet.getRange(rowIndex + 1, j + 1).setValue(data[headers[j]]);
    }
  }

  var updatedAtCol = headers.indexOf('UpdatedAt');
  if (updatedAtCol !== -1) {
    sheet.getRange(rowIndex + 1, updatedAtCol + 1).setValue(getIndiaTimestamp());
  }

  Logger.log('Class updated: ' + id);
  return getClass(id);
}

// ---------------------------------------------------------------------------
// Teacher CRUD
// ---------------------------------------------------------------------------

/**
 * Returns an array of teacher objects with optional filters.
 * @param {Object} [filters] - Optional filters: {instrument, status}
 * @return {Object[]} Array of teacher objects
 */
function listTeachers(filters) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Teachers');
  if (!sheet || sheet.getLastRow() <= 1) return [];

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var results = [];

  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }

    // Apply filters
    if (filters && filters.instrument && row.Instrument !== filters.instrument) continue;
    if (filters && filters.status && String(row.Status).toLowerCase() !== filters.status.toLowerCase()) continue;

    results.push(row);
  }

  return results;
}

/**
 * Creates a new teacher record in the Teachers tab.
 * @param {Object} data - Teacher data {Name, Email, Phone, Instrument, ...}
 * @return {Object} The created teacher object with generated TeacherID
 */
function createTeacher(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Teachers');
  if (!sheet) {
    Logger.log('createTeacher: Teachers tab not found');
    throw new Error('Teachers tab not found');
  }

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var newId = generateId_(sheet, 'T');

  var newRow = [];
  for (var j = 0; j < headers.length; j++) {
    var header = headers[j];
    if (header === 'TeacherID') {
      newRow.push(newId);
    } else if (header === 'Status') {
      newRow.push(data.Status || 'Active');
    } else if (header === 'CreatedAt') {
      newRow.push(getIndiaTimestamp());
    } else if (header === 'UpdatedAt') {
      newRow.push(getIndiaTimestamp());
    } else {
      newRow.push(data[header] || '');
    }
  }

  sheet.appendRow(newRow);
  Logger.log('Teacher created: ' + newId + ' — ' + (data.Name || ''));

  var result = {};
  for (var k = 0; k < headers.length; k++) {
    result[headers[k]] = newRow[k];
  }
  return result;
}

/**
 * Updates specific fields for a teacher by TeacherID.
 * @param {string} id - The TeacherID
 * @param {Object} data - Fields to update
 * @return {Object|null} Updated teacher object or null if not found
 */
function updateTeacher(id, data) {
  if (!id || !data) return null;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Teachers');
  if (!sheet || sheet.getLastRow() <= 1) return null;

  var allData = sheet.getDataRange().getValues();
  var headers = allData[0];
  var rowIndex = findRowById_(allData, id);

  if (rowIndex === -1) {
    Logger.log('updateTeacher: Teacher not found — ' + id);
    return null;
  }

  for (var j = 0; j < headers.length; j++) {
    if (data.hasOwnProperty(headers[j]) && headers[j] !== 'TeacherID') {
      sheet.getRange(rowIndex + 1, j + 1).setValue(data[headers[j]]);
    }
  }

  var updatedAtCol = headers.indexOf('UpdatedAt');
  if (updatedAtCol !== -1) {
    sheet.getRange(rowIndex + 1, updatedAtCol + 1).setValue(getIndiaTimestamp());
  }

  Logger.log('Teacher updated: ' + id);

  // Re-read and return updated record
  var updatedData = sheet.getDataRange().getValues();
  var updatedHeaders = updatedData[0];
  var updatedRowIndex = findRowById_(updatedData, id);
  if (updatedRowIndex === -1) return null;

  var result = {};
  for (var k = 0; k < updatedHeaders.length; k++) {
    result[updatedHeaders[k]] = updatedData[updatedRowIndex][k];
  }
  return result;
}

// ---------------------------------------------------------------------------
// Enrollment Pipeline
// ---------------------------------------------------------------------------

/**
 * Returns an array of inquiry objects with optional filters.
 * @param {Object} [filters] - Optional filters: {status, source, dateRange: {start, end}}
 * @return {Object[]} Array of inquiry objects
 */
function listInquiries(filters) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Inquiries');
  if (!sheet || sheet.getLastRow() <= 1) return [];

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var results = [];

  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }

    // Apply filters
    if (filters && filters.status && String(row.Status).toLowerCase() !== filters.status.toLowerCase()) continue;
    if (filters && filters.source && row.Source !== filters.source) continue;
    if (filters && filters.dateRange) {
      var rowDate = String(row.CreatedAt || '').substring(0, 10);
      if (filters.dateRange.start && rowDate < filters.dateRange.start) continue;
      if (filters.dateRange.end && rowDate > filters.dateRange.end) continue;
    }

    results.push(row);
  }

  return results;
}

/**
 * Creates a new inquiry (lead) in the Inquiries tab.
 * @param {Object} data - Inquiry data {Name, Phone, Email, Instrument, Source, Notes, ...}
 * @return {Object} The created inquiry object with generated InquiryID
 */
function createInquiry(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Inquiries');
  if (!sheet) {
    Logger.log('createInquiry: Inquiries tab not found');
    throw new Error('Inquiries tab not found');
  }

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var newId = generateId_(sheet, 'INQ');

  var newRow = [];
  for (var j = 0; j < headers.length; j++) {
    var header = headers[j];
    if (header === 'InquiryID') {
      newRow.push(newId);
    } else if (header === 'Status') {
      newRow.push(data.Status || 'New');
    } else if (header === 'CreatedAt') {
      newRow.push(getIndiaTimestamp());
    } else if (header === 'UpdatedAt') {
      newRow.push(getIndiaTimestamp());
    } else {
      newRow.push(data[header] || '');
    }
  }

  sheet.appendRow(newRow);
  Logger.log('Inquiry created: ' + newId + ' — ' + (data.Name || ''));

  var result = {};
  for (var k = 0; k < headers.length; k++) {
    result[headers[k]] = newRow[k];
  }
  return result;
}

/**
 * Updates an inquiry's fields. Used to move through pipeline stages.
 * Pipeline: New -> Demo -> Trial -> Enrolled -> Lost
 * @param {string} id - The InquiryID
 * @param {Object} data - Fields to update (e.g. {Status: 'Demo', Notes: '...'})
 * @return {Object|null} Updated inquiry object or null if not found
 */
function updateInquiry(id, data) {
  if (!id || !data) return null;

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Inquiries');
  if (!sheet || sheet.getLastRow() <= 1) return null;

  var allData = sheet.getDataRange().getValues();
  var headers = allData[0];
  var rowIndex = findRowById_(allData, id);

  if (rowIndex === -1) {
    Logger.log('updateInquiry: Inquiry not found — ' + id);
    return null;
  }

  for (var j = 0; j < headers.length; j++) {
    if (data.hasOwnProperty(headers[j]) && headers[j] !== 'InquiryID') {
      sheet.getRange(rowIndex + 1, j + 1).setValue(data[headers[j]]);
    }
  }

  var updatedAtCol = headers.indexOf('UpdatedAt');
  if (updatedAtCol !== -1) {
    sheet.getRange(rowIndex + 1, updatedAtCol + 1).setValue(getIndiaTimestamp());
  }

  Logger.log('Inquiry updated: ' + id + ' — Status: ' + (data.Status || 'unchanged'));

  // Re-read and return updated record
  var updatedData = sheet.getDataRange().getValues();
  var updatedHeaders = updatedData[0];
  var updatedRowIndex = findRowById_(updatedData, id);
  if (updatedRowIndex === -1) return null;

  var result = {};
  for (var k = 0; k < updatedHeaders.length; k++) {
    result[updatedHeaders[k]] = updatedData[updatedRowIndex][k];
  }
  return result;
}

/**
 * Converts an inquiry to a student record. Creates a new student from the
 * inquiry data, then marks the inquiry as Enrolled.
 * @param {string} inquiryId - The InquiryID to convert
 * @return {Object} {success, student, inquiry} or {success: false, error}
 */
function convertInquiryToStudent(inquiryId) {
  if (!inquiryId) {
    return { success: false, error: 'No inquiry ID provided' };
  }

  // Read inquiry data
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Inquiries');
  if (!sheet || sheet.getLastRow() <= 1) {
    return { success: false, error: 'Inquiries tab not found or empty' };
  }

  var allData = sheet.getDataRange().getValues();
  var headers = allData[0];
  var rowIndex = findRowById_(allData, inquiryId);

  if (rowIndex === -1) {
    return { success: false, error: 'Inquiry not found: ' + inquiryId };
  }

  var inquiry = {};
  for (var j = 0; j < headers.length; j++) {
    inquiry[headers[j]] = allData[rowIndex][j];
  }

  // Create student from inquiry data
  var studentData = {
    Name: inquiry.Name || '',
    Phone: inquiry.Phone || '',
    Email: inquiry.Email || '',
    Instrument: inquiry.Instrument || '',
    Class: inquiry.Class || '',
    Source: inquiry.Source || '',
    Notes: 'Converted from inquiry ' + inquiryId
  };

  try {
    var student = createStudent(studentData);

    // Mark inquiry as Enrolled
    updateInquiry(inquiryId, {
      Status: 'Enrolled',
      ConvertedStudentID: student.StudentID || ''
    });

    Logger.log('Inquiry converted to student: ' + inquiryId + ' -> ' + (student.StudentID || ''));

    return {
      success: true,
      student: student,
      inquiry: updateInquiry(inquiryId, {}) // Re-read current state
    };
  } catch (err) {
    Logger.log('convertInquiryToStudent error: ' + err.message);
    return { success: false, error: 'Conversion failed: ' + err.message };
  }
}

// ---------------------------------------------------------------------------
// Attendance
// ---------------------------------------------------------------------------

/**
 * Creates an attendance record in the Attendance tab.
 * @param {Object} data - {studentId, classId, date, status, markedBy}
 *   status: 'Present', 'Absent', 'Late', 'Excused'
 * @return {Object} The created attendance record
 */
function markAttendance(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Attendance');
  if (!sheet) {
    Logger.log('markAttendance: Attendance tab not found');
    throw new Error('Attendance tab not found');
  }

  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var newId = generateId_(sheet, 'ATT');

  var newRow = [];
  for (var j = 0; j < headers.length; j++) {
    var header = headers[j];
    if (header === 'AttendanceID') {
      newRow.push(newId);
    } else if (header === 'StudentID') {
      newRow.push(data.studentId || '');
    } else if (header === 'ClassID') {
      newRow.push(data.classId || '');
    } else if (header === 'Date') {
      newRow.push(data.date || getIndiaDate());
    } else if (header === 'Status') {
      newRow.push(data.status || 'Present');
    } else if (header === 'MarkedBy') {
      newRow.push(data.markedBy || '');
    } else if (header === 'CreatedAt') {
      newRow.push(getIndiaTimestamp());
    } else {
      newRow.push(data[header] || '');
    }
  }

  sheet.appendRow(newRow);
  Logger.log('Attendance marked: ' + newId + ' — ' + (data.studentId || '') + ' ' + (data.status || 'Present'));

  var result = {};
  for (var k = 0; k < headers.length; k++) {
    result[headers[k]] = newRow[k];
  }
  return result;
}

/**
 * Returns attendance records for a class on a specific date.
 * @param {string} classId - The ClassID
 * @param {string} date - Date string (YYYY-MM-DD)
 * @return {Object[]} Array of attendance record objects
 */
function getAttendance(classId, date) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Attendance');
  if (!sheet || sheet.getLastRow() <= 1) return [];

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var results = [];

  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }

    var rowClassId = String(row.ClassID || '');
    var rowDate = formatAttendanceDate_(row.Date);

    if (rowClassId === String(classId) && rowDate === String(date)) {
      results.push(row);
    }
  }

  return results;
}

/**
 * Returns attendance history for a student within an optional date range.
 * @param {string} studentId - The StudentID
 * @param {Object} [dateRange] - Optional {start, end} date strings (YYYY-MM-DD)
 * @return {Object[]} Array of attendance record objects, sorted by date descending
 */
function getStudentAttendance(studentId, dateRange) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Attendance');
  if (!sheet || sheet.getLastRow() <= 1) return [];

  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var results = [];

  for (var i = 1; i < data.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }

    if (String(row.StudentID || '') !== String(studentId)) continue;

    // Apply date range filter
    if (dateRange) {
      var rowDate = formatAttendanceDate_(row.Date);
      if (dateRange.start && rowDate < dateRange.start) continue;
      if (dateRange.end && rowDate > dateRange.end) continue;
    }

    results.push(row);
  }

  // Sort by date descending
  results.sort(function(a, b) {
    var dateA = formatAttendanceDate_(a.Date);
    var dateB = formatAttendanceDate_(b.Date);
    return dateB > dateA ? 1 : dateB < dateA ? -1 : 0;
  });

  return results;
}

// ---------------------------------------------------------------------------
// Dashboard Stats
// ---------------------------------------------------------------------------

/**
 * Returns a summary object with key CRM metrics for the dashboard.
 * @return {Object} Dashboard statistics
 */
function getDashboardStats() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var stats = {
    totalStudents: 0,
    activeStudents: 0,
    totalClasses: 0,
    totalTeachers: 0,
    pendingInquiries: 0,
    todaySchedule: [],
    recentEnrollments: [],
    attendanceRate: 0
  };

  // Student counts
  var studentsSheet = ss.getSheetByName('Students');
  if (studentsSheet && studentsSheet.getLastRow() > 1) {
    var studentData = studentsSheet.getDataRange().getValues();
    var studentHeaders = studentData[0];
    var activeCol = studentHeaders.indexOf('Active');

    stats.totalStudents = studentData.length - 1;
    for (var i = 1; i < studentData.length; i++) {
      if (activeCol !== -1 && String(studentData[i][activeCol]).toUpperCase() === 'TRUE') {
        stats.activeStudents++;
      }
    }
  }

  // Class count
  var classesSheet = ss.getSheetByName('Classes');
  if (classesSheet && classesSheet.getLastRow() > 1) {
    stats.totalClasses = classesSheet.getLastRow() - 1;
  }

  // Teacher count
  var teachersSheet = ss.getSheetByName('Teachers');
  if (teachersSheet && teachersSheet.getLastRow() > 1) {
    stats.totalTeachers = teachersSheet.getLastRow() - 1;
  }

  // Pending inquiries (New or Demo status)
  var inquiriesSheet = ss.getSheetByName('Inquiries');
  if (inquiriesSheet && inquiriesSheet.getLastRow() > 1) {
    var inqData = inquiriesSheet.getDataRange().getValues();
    var inqHeaders = inqData[0];
    var statusCol = inqHeaders.indexOf('Status');

    for (var ii = 1; ii < inqData.length; ii++) {
      var inqStatus = String(inqData[ii][statusCol] || '').toLowerCase();
      if (inqStatus === 'new' || inqStatus === 'demo' || inqStatus === 'trial') {
        stats.pendingInquiries++;
      }
    }

    // Recent enrollments (last 10 inquiries marked Enrolled)
    var enrolled = [];
    for (var ie = 1; ie < inqData.length; ie++) {
      if (String(inqData[ie][statusCol] || '').toLowerCase() === 'enrolled') {
        var enrollRow = {};
        for (var je = 0; je < inqHeaders.length; je++) {
          enrollRow[inqHeaders[je]] = inqData[ie][je];
        }
        enrolled.push(enrollRow);
      }
    }
    stats.recentEnrollments = enrolled.slice(-10).reverse();
  }

  // Today's schedule
  try {
    stats.todaySchedule = getTodaySchedule(null);
  } catch (schedErr) {
    Logger.log('getDashboardStats: Error fetching schedule — ' + schedErr.message);
    stats.todaySchedule = [];
  }

  // Attendance rate (last 30 days)
  var attendanceSheet = ss.getSheetByName('Attendance');
  if (attendanceSheet && attendanceSheet.getLastRow() > 1) {
    var attData = attendanceSheet.getDataRange().getValues();
    var attHeaders = attData[0];
    var attStatusCol = attHeaders.indexOf('Status');
    var attDateCol = attHeaders.indexOf('Date');

    var thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    var cutoffDate = Utilities.formatDate(thirtyDaysAgo, 'Asia/Kolkata', 'yyyy-MM-dd');

    var totalRecords = 0;
    var presentRecords = 0;

    for (var ia = 1; ia < attData.length; ia++) {
      var attDate = formatAttendanceDate_(attData[ia][attDateCol]);
      if (attDate >= cutoffDate) {
        totalRecords++;
        var attStatus = String(attData[ia][attStatusCol] || '').toLowerCase();
        if (attStatus === 'present' || attStatus === 'late') {
          presentRecords++;
        }
      }
    }

    stats.attendanceRate = totalRecords > 0 ? Math.round((presentRecords / totalRecords) * 100) : 0;
  }

  return stats;
}

// ---------------------------------------------------------------------------
// Helper functions (private)
// ---------------------------------------------------------------------------

/**
 * Generates the next auto-increment ID for a sheet.
 * Format: prefix + zero-padded number (e.g. S001, CLS001, T001, INQ001, ATT001)
 * @private
 * @param {Sheet} sheet - The Google Sheet
 * @param {string} prefix - ID prefix (e.g. 'S', 'CLS', 'T', 'INQ', 'ATT')
 * @return {string} The generated ID
 */
function generateId_(sheet, prefix) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    return prefix + '001';
  }

  // Read the last ID in column A to determine next number
  var lastId = String(sheet.getRange(lastRow, 1).getValue());
  var numericPart = lastId.replace(prefix, '');
  var nextNum = parseInt(numericPart, 10);

  if (isNaN(nextNum)) {
    // Fallback: use row count
    nextNum = lastRow - 1;
  }

  nextNum++;
  var padded = String(nextNum);
  while (padded.length < 3) {
    padded = '0' + padded;
  }

  return prefix + padded;
}

/**
 * Finds the row index (0-based in the data array) for a given ID in column A.
 * @private
 * @param {Array[]} data - The sheet data array (from getDataRange().getValues())
 * @param {string} id - The ID to search for
 * @return {number} The 0-based row index, or -1 if not found
 */
function findRowById_(data, id) {
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      return i;
    }
  }
  return -1;
}

/**
 * Normalizes an attendance date value to YYYY-MM-DD string.
 * Handles both Date objects and string values.
 * @private
 * @param {*} val - Date value from the sheet
 * @return {string} YYYY-MM-DD formatted date string
 */
function formatAttendanceDate_(val) {
  if (val instanceof Date) {
    return Utilities.formatDate(val, 'Asia/Kolkata', 'yyyy-MM-dd');
  }
  return String(val).substring(0, 10);
}
