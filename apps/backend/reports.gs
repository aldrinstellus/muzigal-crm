/**
 * reports.gs — Reporting and analytics for the admin dashboard
 *
 * Provides dashboard stats, revenue reports, attendance reports,
 * enrollment funnel, teacher reports, student progress, and CSV export.
 */

/**
 * Returns comprehensive dashboard statistics.
 * @return {Object} Dashboard stats object
 */
function getDashboardStats() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var today = getIndiaDate();
  var thisMonth = today.substring(0, 7); // YYYY-MM
  var lastMonth = getOffsetMonth_(thisMonth, -1);

  return {
    students: getStudentStats_(ss, thisMonth),
    classes: getClassStats_(ss),
    revenue: getRevenueStats_(ss, thisMonth, lastMonth),
    attendance: getAttendanceStats_(ss, today),
    enrollment: getEnrollmentStats_(ss, thisMonth),
    schedule: getScheduleStats_(ss, today),
    recentActivity: getRecentActivity_(ss, 10)
  };
}

/**
 * Returns a revenue report for a given date range.
 * @param {string} startDate - YYYY-MM-DD
 * @param {string} endDate - YYYY-MM-DD
 * @return {Object} { totalRevenue, paymentCount, byMonth, byMethod, byInstrument }
 */
function getRevenueReport(startDate, endDate) {
  var payments = listPayments({
    status: 'Paid',
    dateRange: { start: startDate, end: endDate }
  });

  var totalRevenue = 0;
  var byMonth = {};
  var byMethod = {};
  var byInstrument = {};

  // Load student-class mapping for instrument lookup
  var classInstruments = getClassInstrumentMap_();

  payments.forEach(function(p) {
    var amt = Number(p.amount) || 0;
    totalRevenue += amt;

    var month = p.date.substring(0, 7);
    byMonth[month] = (byMonth[month] || 0) + amt;

    var method = p.method || 'Unknown';
    byMethod[method] = (byMethod[method] || 0) + amt;

    // Look up instrument from student's class
    var student = getStudentById_(p.studentId);
    var instrument = (student && classInstruments[student.className]) || 'Unknown';
    byInstrument[instrument] = (byInstrument[instrument] || 0) + amt;
  });

  return {
    totalRevenue: totalRevenue,
    paymentCount: payments.length,
    byMonth: mapToArray_(byMonth, 'month', 'amount'),
    byMethod: mapToArray_(byMethod, 'method', 'amount'),
    byInstrument: mapToArray_(byInstrument, 'instrument', 'amount')
  };
}

/**
 * Returns an attendance report with optional filters.
 * @param {Object} [filters] - { studentId, classId, dateRange: { start, end } }
 * @return {Object} { totalClasses, present, absent, late, attendanceRate, details }
 */
function getAttendanceReport(filters) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Attendance');
  if (!sheet || sheet.getLastRow() <= 1) {
    return { totalClasses: 0, present: 0, absent: 0, late: 0, attendanceRate: 0, details: [] };
  }

  var data = sheet.getDataRange().getValues();
  var records = [];

  for (var i = 1; i < data.length; i++) {
    var record = {
      date: formatDateValue_(data[i][0]),
      studentId: String(data[i][1]),
      classId: String(data[i][2]),
      status: String(data[i][3])
    };

    if (filters) {
      if (filters.studentId && record.studentId !== filters.studentId) continue;
      if (filters.classId && record.classId !== filters.classId) continue;
      if (filters.dateRange) {
        if (filters.dateRange.start && record.date < filters.dateRange.start) continue;
        if (filters.dateRange.end && record.date > filters.dateRange.end) continue;
      }
    }

    records.push(record);
  }

  var present = 0;
  var absent = 0;
  var late = 0;

  records.forEach(function(r) {
    var s = r.status.toLowerCase();
    if (s === 'present') present++;
    else if (s === 'absent') absent++;
    else if (s === 'late') late++;
  });

  var total = records.length;
  var rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  return {
    totalClasses: total,
    present: present,
    absent: absent,
    late: late,
    attendanceRate: rate,
    details: records.map(function(r) { return { date: r.date, status: r.status }; })
  };
}

/**
 * Returns enrollment funnel statistics for a date range.
 * @param {Object} [dateRange] - { start, end } in YYYY-MM-DD
 * @return {Object} { total, byStatus, conversionRate, bySource, byInstrument }
 */
function getEnrollmentReport(dateRange) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Enrollment');
  if (!sheet || sheet.getLastRow() <= 1) {
    return { total: 0, byStatus: {}, conversionRate: 0, bySource: {}, byInstrument: {} };
  }

  var data = sheet.getDataRange().getValues();
  var byStatus = {};
  var bySource = {};
  var byInstrument = {};
  var total = 0;

  for (var i = 1; i < data.length; i++) {
    var date = formatDateValue_(data[i][0]);

    if (dateRange) {
      if (dateRange.start && date < dateRange.start) continue;
      if (dateRange.end && date > dateRange.end) continue;
    }

    total++;

    var status = String(data[i][2]) || 'Unknown';
    byStatus[status] = (byStatus[status] || 0) + 1;

    var source = String(data[i][3]) || 'Unknown';
    bySource[source] = (bySource[source] || 0) + 1;

    var instrument = String(data[i][4]) || 'Unknown';
    byInstrument[instrument] = (byInstrument[instrument] || 0) + 1;
  }

  var enrolled = byStatus['Enrolled'] || 0;
  var conversionRate = total > 0 ? Math.round((enrolled / total) * 100) : 0;

  return {
    total: total,
    byStatus: byStatus,
    conversionRate: conversionRate,
    bySource: bySource,
    byInstrument: byInstrument
  };
}

/**
 * Returns a report for a specific teacher.
 * @param {string} teacherId - Teacher name or ID
 * @return {Object} { name, totalClasses, totalStudents, attendanceRate, instruments }
 */
function getTeacherReport(teacherId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var scheduleSheet = ss.getSheetByName('Schedule');
  if (!scheduleSheet || scheduleSheet.getLastRow() <= 1) {
    return { name: teacherId, totalClasses: 0, totalStudents: 0, attendanceRate: 0, instruments: [] };
  }

  var scheduleData = scheduleSheet.getDataRange().getValues();
  var classNames = {};
  var instruments = {};

  for (var i = 1; i < scheduleData.length; i++) {
    if (String(scheduleData[i][3]) === teacherId) {
      classNames[String(scheduleData[i][1])] = true;
      var subject = String(scheduleData[i][2]);
      if (subject) instruments[subject] = true;
    }
  }

  var classNameList = Object.keys(classNames);
  var totalStudents = 0;
  classNameList.forEach(function(cn) {
    totalStudents += getStudentsByClass(cn).length;
  });

  // Attendance rate for teacher's classes
  var attendanceReport = { attendanceRate: 0 };
  if (classNameList.length > 0) {
    var combined = { total: 0, present: 0 };
    classNameList.forEach(function(cn) {
      var report = getAttendanceReport({ classId: cn });
      combined.total += report.totalClasses;
      combined.present += report.present + report.late;
    });
    attendanceReport.attendanceRate = combined.total > 0
      ? Math.round((combined.present / combined.total) * 100) : 0;
  }

  return {
    name: teacherId,
    totalClasses: classNameList.length,
    totalStudents: totalStudents,
    attendanceRate: attendanceReport.attendanceRate,
    instruments: Object.keys(instruments)
  };
}

/**
 * Returns a comprehensive progress report for a student.
 * @param {string} studentId
 * @return {Object} Student info + attendance + payments + classes
 */
function getStudentProgressReport(studentId) {
  var student = getStudentById_(studentId);
  if (!student) {
    return { error: 'Student not found: ' + studentId };
  }

  var attendance = getAttendanceReport({ studentId: studentId });
  var payments = getStudentPayments(studentId);

  var totalPaid = 0;
  var totalPending = 0;
  payments.forEach(function(p) {
    if (p.status === 'Paid') totalPaid += p.amount;
    else totalPending += p.amount;
  });

  return {
    student: student,
    attendance: {
      totalClasses: attendance.totalClasses,
      present: attendance.present,
      absent: attendance.absent,
      late: attendance.late,
      rate: attendance.attendanceRate
    },
    payments: {
      total: payments.length,
      totalPaid: totalPaid,
      totalPending: totalPending,
      history: payments
    },
    className: student.className
  };
}

/**
 * Generates a CSV string for download.
 * @param {string} reportType - 'students', 'payments', 'attendance', or 'enrollment'
 * @param {Object} [filters] - Optional filters for the report
 * @return {string} CSV string
 */
function exportReportToCSV(reportType, filters) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet;
  var headers;

  switch (reportType) {
    case 'students':
      sheet = ss.getSheetByName('Students');
      headers = ['StudentID', 'Name', 'Phone', 'Class', 'Active'];
      break;
    case 'payments':
      sheet = ss.getSheetByName('Payments');
      headers = ['PaymentID', 'StudentID', 'Amount', 'Date', 'DueDate', 'Status', 'Method', 'RazorpayRef', 'Month', 'Notes', 'CreatedAt'];
      break;
    case 'attendance':
      sheet = ss.getSheetByName('Attendance');
      headers = ['Date', 'StudentID', 'ClassID', 'Status'];
      break;
    case 'enrollment':
      sheet = ss.getSheetByName('Enrollment');
      headers = ['Date', 'Name', 'Status', 'Source', 'Instrument'];
      break;
    default:
      return 'Error: Unknown report type "' + reportType + '"';
  }

  if (!sheet || sheet.getLastRow() <= 1) {
    return headers.join(',') + '\n';
  }

  var data = sheet.getDataRange().getValues();
  var rows = [headers.join(',')];

  for (var i = 1; i < data.length; i++) {
    // Apply date range filter if provided
    if (filters && filters.dateRange) {
      var dateCol = reportType === 'payments' ? 3 : 0; // Date column index
      var rowDate = formatDateValue_(data[i][dateCol]);
      if (filters.dateRange.start && rowDate < filters.dateRange.start) continue;
      if (filters.dateRange.end && rowDate > filters.dateRange.end) continue;
    }

    var csvRow = [];
    for (var j = 0; j < headers.length; j++) {
      var val = j < data[i].length ? data[i][j] : '';
      val = formatDateValue_(val);
      // Escape commas and quotes in CSV
      val = String(val).replace(/"/g, '""');
      if (String(val).indexOf(',') !== -1 || String(val).indexOf('"') !== -1 || String(val).indexOf('\n') !== -1) {
        val = '"' + val + '"';
      }
      csvRow.push(val);
    }
    rows.push(csvRow.join(','));
  }

  Logger.log('CSV export: ' + reportType + ' - ' + (rows.length - 1) + ' row(s)');
  return rows.join('\n');
}

// ---------------------------------------------------------------------------
// Private helpers for getDashboardStats
// ---------------------------------------------------------------------------

/**
 * Student statistics.
 * @private
 */
function getStudentStats_(ss, thisMonth) {
  var sheet = ss.getSheetByName('Students');
  if (!sheet || sheet.getLastRow() <= 1) {
    return { total: 0, active: 0, inactive: 0, newThisMonth: 0 };
  }

  var data = sheet.getDataRange().getValues();
  var total = 0;
  var active = 0;
  var inactive = 0;
  var newThisMonth = 0;

  for (var i = 1; i < data.length; i++) {
    total++;
    var isActive = String(data[i][4]).toUpperCase() === 'TRUE';
    if (isActive) active++; else inactive++;

    // Check if student was added this month (column 5 if exists, else skip)
    if (data[i].length > 5 && data[i][5]) {
      var joinDate = formatDateValue_(data[i][5]);
      if (joinDate.substring(0, 7) === thisMonth) newThisMonth++;
    }
  }

  return { total: total, active: active, inactive: inactive, newThisMonth: newThisMonth };
}

/**
 * Class statistics.
 * @private
 */
function getClassStats_(ss) {
  var sheet = ss.getSheetByName('Classes');
  if (!sheet || sheet.getLastRow() <= 1) {
    return { total: 0, active: 0, totalCapacity: 0, totalEnrolled: 0 };
  }

  var data = sheet.getDataRange().getValues();
  var total = 0;
  var active = 0;
  var totalCapacity = 0;
  var totalEnrolled = 0;

  for (var i = 1; i < data.length; i++) {
    total++;
    var status = String(data[i][1]).toLowerCase();
    if (status === 'active') active++;
    totalCapacity += Number(data[i][2]) || 0;
    totalEnrolled += Number(data[i][3]) || 0;
  }

  return { total: total, active: active, totalCapacity: totalCapacity, totalEnrolled: totalEnrolled };
}

/**
 * Revenue statistics for this month and last month.
 * @private
 */
function getRevenueStats_(ss, thisMonth, lastMonth) {
  var thisMonthRev = getRevenueByMonth(thisMonth);
  var lastMonthRev = getRevenueByMonth(lastMonth);

  var growth = 0;
  if (lastMonthRev.total > 0) {
    growth = Math.round(((thisMonthRev.total - lastMonthRev.total) / lastMonthRev.total) * 100);
  }

  var pendingPayments = listPayments({ status: 'Pending' });
  var overduePayments = listPayments({ status: 'Overdue' });
  var pendingTotal = 0;
  pendingPayments.concat(overduePayments).forEach(function(p) {
    pendingTotal += Number(p.amount) || 0;
  });

  return {
    thisMonth: thisMonthRev.total,
    lastMonth: lastMonthRev.total,
    growth: growth,
    pending: pendingTotal
  };
}

/**
 * Attendance statistics for today.
 * @private
 */
function getAttendanceStats_(ss, today) {
  var sheet = ss.getSheetByName('Attendance');
  if (!sheet || sheet.getLastRow() <= 1) {
    return { averageRate: 0, todayPresent: 0, todayAbsent: 0 };
  }

  var data = sheet.getDataRange().getValues();
  var allPresent = 0;
  var allTotal = 0;
  var todayPresent = 0;
  var todayAbsent = 0;

  for (var i = 1; i < data.length; i++) {
    var date = formatDateValue_(data[i][0]);
    var status = String(data[i][3]).toLowerCase();
    allTotal++;

    if (status === 'present' || status === 'late') allPresent++;

    if (date === today) {
      if (status === 'present' || status === 'late') todayPresent++;
      else if (status === 'absent') todayAbsent++;
    }
  }

  var averageRate = allTotal > 0 ? Math.round((allPresent / allTotal) * 100) : 0;

  return { averageRate: averageRate, todayPresent: todayPresent, todayAbsent: todayAbsent };
}

/**
 * Enrollment funnel statistics for this month.
 * @private
 */
function getEnrollmentStats_(ss, thisMonth) {
  var report = getEnrollmentReport({
    start: thisMonth + '-01',
    end: thisMonth + '-31'
  });

  return {
    newInquiries: report.byStatus['New'] || 0,
    demosScheduled: report.byStatus['Demo'] || 0,
    enrolled: report.byStatus['Enrolled'] || 0,
    lost: report.byStatus['Lost'] || 0,
    conversionRate: report.conversionRate
  };
}

/**
 * Schedule statistics for today.
 * @private
 */
function getScheduleStats_(ss, today) {
  var todayClasses = getTodaySchedule(null, today);

  // Upcoming = next 7 days (excluding today)
  var upcoming = [];
  for (var d = 1; d <= 7; d++) {
    var futureDate = getOffsetDate_(today, d);
    var daySchedule = getTodaySchedule(null, futureDate);
    upcoming = upcoming.concat(daySchedule);
  }

  return {
    todayClasses: todayClasses.length,
    upcomingClasses: upcoming.length
  };
}

/**
 * Returns the last N activity rows from the Log tab.
 * @private
 * @param {Spreadsheet} ss
 * @param {number} limit
 * @return {Object[]}
 */
function getRecentActivity_(ss, limit) {
  var sheet = ss.getSheetByName('Log');
  if (!sheet || sheet.getLastRow() <= 1) return [];

  var lastRow = sheet.getLastRow();
  var startRow = Math.max(2, lastRow - limit + 1);
  var numRows = lastRow - startRow + 1;
  var data = sheet.getRange(startRow, 1, numRows, 8).getValues();

  var activities = [];
  for (var i = data.length - 1; i >= 0; i--) {
    activities.push({
      type: String(data[i][3]),
      message: String(data[i][1]) + ' - ' + String(data[i][4]).substring(0, 80),
      timestamp: String(data[i][0])
    });
  }

  return activities;
}

// ---------------------------------------------------------------------------
// Shared private helpers
// ---------------------------------------------------------------------------

/**
 * Returns a month string offset by N months.
 * @private
 * @param {string} monthStr - YYYY-MM
 * @param {number} offset - Number of months to offset (negative = past)
 * @return {string} YYYY-MM
 */
function getOffsetMonth_(monthStr, offset) {
  var parts = monthStr.split('-');
  var year = parseInt(parts[0], 10);
  var month = parseInt(parts[1], 10) + offset;

  while (month < 1) { month += 12; year--; }
  while (month > 12) { month -= 12; year++; }

  return year + '-' + ('0' + month).slice(-2);
}

/**
 * Returns a date string offset by N days.
 * @private
 * @param {string} dateStr - YYYY-MM-DD
 * @param {number} days - Number of days to offset
 * @return {string} YYYY-MM-DD
 */
function getOffsetDate_(dateStr, days) {
  var parts = dateStr.split('-');
  var date = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  date.setDate(date.getDate() + days);
  return Utilities.formatDate(date, 'Asia/Kolkata', 'yyyy-MM-dd');
}

/**
 * Converts a key-value map to an array of objects.
 * @private
 * @param {Object} map - { key: value }
 * @param {string} keyName - Property name for the key
 * @param {string} valueName - Property name for the value
 * @return {Object[]}
 */
function mapToArray_(map, keyName, valueName) {
  var arr = [];
  for (var k in map) {
    var obj = {};
    obj[keyName] = k;
    obj[valueName] = map[k];
    arr.push(obj);
  }
  return arr;
}

/**
 * Returns a map of class names to their instrument/subject.
 * @private
 * @return {Object} { className: instrument }
 */
function getClassInstrumentMap_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Classes');
  if (!sheet || sheet.getLastRow() <= 1) return {};

  var data = sheet.getDataRange().getValues();
  var map = {};
  for (var i = 1; i < data.length; i++) {
    var className = String(data[i][0]);
    var instrument = String(data[i][5]) || String(data[i][2]) || ''; // instrument or subject column
    if (className) map[className] = instrument;
  }
  return map;
}
