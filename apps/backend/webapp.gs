/**
 * webapp.gs — Web app endpoints for manual/emergency triggers
 *
 * Deploy as: Web app → Execute as: Me → Access: Anyone (or Anyone with Google account)
 * URL will be: https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec
 */

/**
 * POST endpoint for manual/emergency notifications.
 *
 * Supported actions:
 *   1. send_override  — Send a custom message to a class, student, or all
 *   2. send_daily     — Trigger daily schedule (optionally for a specific date)
 *   3. send_test      — Send a test message to a single phone number
 *
 * All requests must include a valid "secret" field matching WEBHOOK_SECRET in Config.
 *
 * @param {Object} e - Apps Script web app event object
 * @return {ContentService.TextOutput} JSON response
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse_({ success: false, message: 'No request body' }, 400);
    }

    var body;
    try {
      body = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return jsonResponse_({ success: false, message: 'Invalid JSON body' }, 400);
    }

    // Validate shared secret
    var expectedSecret = getConfig('WEBHOOK_SECRET');
    if (!expectedSecret || expectedSecret === '(placeholder)') {
      return jsonResponse_({ success: false, message: 'WEBHOOK_SECRET not configured' }, 500);
    }
    if (body.secret !== expectedSecret) {
      return jsonResponse_({ success: false, message: 'Invalid secret' }, 403);
    }

    var action = body.action;

    // --- Phase 1: WhatsApp Actions ---
    switch (action) {
      case 'send_override':
        return handleOverride_(body);
      case 'send_daily':
        return handleDailyTrigger_(body);
      case 'send_test':
        return handleTestSend_(body);
    }

    // --- Phase 2: CRM Write Actions (JWT or secret auth) ---
    // For CRM writes, accept either webhook secret (already validated above) or JWT token
    switch (action) {
      case 'create_student':
        return jsonResponse_({ status: 'ok', data: createStudent(body.data) });
      case 'update_student':
        return jsonResponse_({ status: 'ok', data: updateStudent(body.id, body.data) });
      case 'deactivate_student':
        return jsonResponse_({ status: 'ok', data: deactivateStudent(body.id) });
      case 'create_class':
        return jsonResponse_({ status: 'ok', data: createClass(body.data) });
      case 'update_class':
        return jsonResponse_({ status: 'ok', data: updateClass(body.id, body.data) });
      case 'create_teacher':
        return jsonResponse_({ status: 'ok', data: createTeacher(body.data) });
      case 'update_teacher':
        return jsonResponse_({ status: 'ok', data: updateTeacher(body.id, body.data) });
      case 'create_inquiry':
        return jsonResponse_({ status: 'ok', data: createInquiry(body.data) });
      case 'update_inquiry':
        return jsonResponse_({ status: 'ok', data: updateInquiry(body.id, body.data) });
      case 'convert_inquiry':
        return jsonResponse_({ status: 'ok', data: convertInquiryToStudent(body.id) });
      case 'mark_attendance':
        return jsonResponse_({ status: 'ok', data: markAttendance(body.data) });
      case 'record_payment':
        return jsonResponse_({ status: 'ok', data: recordPayment(body.data) });
      case 'create_payment_link':
        return jsonResponse_({ status: 'ok', data: createPaymentLink(body.studentId, body.amount, body.description) });
      case 'generate_invoices':
        return jsonResponse_({ status: 'ok', data: generateMonthlyInvoices(body.month) });
      default:
        return jsonResponse_({ success: false, message: 'Unknown action: ' + action }, 400);
    }

  } catch (err) {
    Logger.log('doPost error: ' + err.message);
    return jsonResponse_({ success: false, message: 'Internal error: ' + err.message }, 500);
  }
}

/**
 * GET endpoint — simple health check.
 * @param {Object} e
 * @return {ContentService.TextOutput} JSON response
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'health';

  if (action === 'setup') {
    createSheetStructure();
    return jsonResponse_({
      status: 'ok',
      message: 'Sheet structure created successfully',
      timestamp: getIndiaTimestamp()
    });
  }

  if (action === 'set_config') {
    var key = e.parameter.key;
    var value = e.parameter.value;
    if (!key || !value) {
      return jsonResponse_({ status: 'error', message: 'Missing key or value parameter' });
    }
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var configSheet = ss.getSheetByName('Config');
    var data = configSheet.getDataRange().getValues();
    var found = false;
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] === key) {
        configSheet.getRange(i + 1, 2).setValue(value);
        found = true;
        break;
      }
    }
    if (!found) {
      configSheet.appendRow([key, value]);
    }
    CacheService.getScriptCache().remove('config_' + key);
    return jsonResponse_({ status: 'ok', message: 'Config ' + key + ' updated', timestamp: getIndiaTimestamp() });
  }

  if (action === 'get_config') {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var configSheet = ss.getSheetByName('Config');
    var data = configSheet.getDataRange().getValues();
    var config = {};
    for (var i = 1; i < data.length; i++) {
      config[data[i][0]] = data[i][1];
    }
    return jsonResponse_({ status: 'ok', config: config });
  }

  if (action === 'add_student') {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Students');
    sheet.appendRow([e.parameter.id, e.parameter.name, e.parameter.phone, e.parameter.cls, 'TRUE']);
    return jsonResponse_({ status: 'ok', message: 'Student added' });
  }

  if (action === 'add_schedule') {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Schedule');
    sheet.appendRow([e.parameter.id, e.parameter.cls, e.parameter.subject, e.parameter.teacher, e.parameter.room, e.parameter.date, e.parameter.time, 'Active', '', '']);
    return jsonResponse_({ status: 'ok', message: 'Schedule added' });
  }

  if (action === 'install_triggers') {
    installTriggers();
    return jsonResponse_({
      status: 'ok',
      message: 'Triggers installed',
      timestamp: getIndiaTimestamp()
    });
  }

  // --- Phase 2: Auth ---
  if (action === 'login') {
    var credentials = e.parameter.credentials || e.parameter.id_token || '';
    if (!credentials) return jsonResponse_({ status: 'error', message: 'Missing credentials' });
    var result = handleLogin(credentials);
    // Normalize response to {status: 'ok', data: {token, user}} format
    if (result.success) {
      return jsonResponse_({ status: 'ok', data: { token: result.token, user: result.user } });
    } else {
      return jsonResponse_({ status: 'error', message: result.error });
    }
  }

  // --- Phase 2: CRM API (Students) ---
  if (action === 'list_students') {
    var filters = {};
    if (e.parameter.class) filters.class = e.parameter.class;
    if (e.parameter.status) filters.status = e.parameter.status;
    if (e.parameter.instrument) filters.instrument = e.parameter.instrument;
    if (e.parameter.search) filters.search = e.parameter.search;
    return jsonResponse_({ status: 'ok', data: listStudents(filters) });
  }
  if (action === 'get_student') {
    return jsonResponse_({ status: 'ok', data: getStudent(e.parameter.id) });
  }

  // --- Phase 2: CRM API (Classes) ---
  if (action === 'list_classes') {
    var filters = {};
    if (e.parameter.instrument) filters.instrument = e.parameter.instrument;
    if (e.parameter.teacher) filters.teacher = e.parameter.teacher;
    if (e.parameter.status) filters.status = e.parameter.status;
    return jsonResponse_({ status: 'ok', data: listClasses(filters) });
  }
  if (action === 'get_class') {
    return jsonResponse_({ status: 'ok', data: getClass(e.parameter.id) });
  }

  // --- Phase 2: CRM API (Teachers) ---
  if (action === 'list_teachers') {
    var filters = {};
    if (e.parameter.instrument) filters.instrument = e.parameter.instrument;
    if (e.parameter.status) filters.status = e.parameter.status;
    return jsonResponse_({ status: 'ok', data: listTeachers(filters) });
  }

  // --- Phase 2: CRM API (Enrollment) ---
  if (action === 'list_inquiries') {
    var filters = {};
    if (e.parameter.status) filters.status = e.parameter.status;
    if (e.parameter.source) filters.source = e.parameter.source;
    return jsonResponse_({ status: 'ok', data: listInquiries(filters) });
  }

  // --- Phase 2: CRM API (Payments) ---
  if (action === 'list_payments') {
    var filters = {};
    if (e.parameter.studentId) filters.studentId = e.parameter.studentId;
    if (e.parameter.status) filters.status = e.parameter.status;
    if (e.parameter.month) filters.month = e.parameter.month;
    return jsonResponse_({ status: 'ok', data: listPayments(filters) });
  }
  if (action === 'pending_payments') {
    return jsonResponse_({ status: 'ok', data: getPendingPayments() });
  }

  // --- Phase 2: CRM API (Attendance) ---
  if (action === 'get_attendance') {
    return jsonResponse_({ status: 'ok', data: getAttendance(e.parameter.classId, e.parameter.date) });
  }

  // --- Phase 2: CRM API (Reports) ---
  if (action === 'dashboard_stats') {
    return jsonResponse_({ status: 'ok', data: getDashboardStats() });
  }
  if (action === 'report_revenue') {
    return jsonResponse_({ status: 'ok', data: getRevenueReport(e.parameter.start, e.parameter.end) });
  }
  if (action === 'report_attendance') {
    return jsonResponse_({ status: 'ok', data: getAttendanceReport({ studentId: e.parameter.studentId, classId: e.parameter.classId }) });
  }
  if (action === 'report_enrollment') {
    return jsonResponse_({ status: 'ok', data: getEnrollmentReport() });
  }

  // Default: health check
  var triggers = ScriptApp.getProjectTriggers();
  return jsonResponse_({
    status: 'ok',
    timestamp: getIndiaTimestamp(),
    triggerCount: triggers.length
  });
}

/**
 * Handles the send_override action.
 * Sends a custom message to a class, individual student, or all students.
 * @private
 */
function handleOverride_(body) {
  var targetType = body.target_type;   // 'class', 'student', or 'all'
  var targetValue = body.target_value; // class name, phone number, or 'all'
  var message = body.message;
  var sentBy = body.sent_by || 'API';

  if (!targetType || !message) {
    return jsonResponse_({ success: false, message: 'Missing target_type or message' }, 400);
  }

  var students = [];

  switch (targetType) {
    case 'class':
      if (!targetValue) {
        return jsonResponse_({ success: false, message: 'Missing target_value for class' }, 400);
      }
      students = getStudentsByClass(targetValue);
      break;

    case 'student':
      if (!targetValue) {
        return jsonResponse_({ success: false, message: 'Missing target_value for student' }, 400);
      }
      var student = getStudentByPhone(targetValue);
      if (student) {
        students = [student];
      } else {
        return jsonResponse_({ success: false, message: 'Student not found: ' + targetValue }, 404);
      }
      break;

    case 'all':
      students = getAllActiveStudents();
      break;

    default:
      return jsonResponse_({ success: false, message: 'Invalid target_type: ' + targetType }, 400);
  }

  if (students.length === 0) {
    return jsonResponse_({ success: false, message: 'No students found for target', sent: 0, failed: 0 }, 404);
  }

  // Send override message to each student
  var sent = 0;
  var failed = 0;
  var errors = [];

  students.forEach(function(student) {
    // For override, compose a simple message with the override text
    var phone = formatPhoneNumber(student.phone);
    var personalMessage = message.replace('{name}', student.name.split(' ')[0]);

    var result = sendTemplate(phone, getConfig('TEMPLATE_NAME') || 'class_update', [personalMessage]);

    logToSheet({
      studentName: student.name,
      phone: phone,
      messageType: 'override',
      messageSent: personalMessage,
      deliveryStatus: result.success ? 'sent' : 'failed',
      whatsappMsgId: result.messageId || '',
      error: result.error || ''
    });

    if (result.success) sent++; else {
      failed++;
      errors.push(student.name + ': ' + result.error);
    }

    Utilities.sleep(200);
  });

  // Log to Overrides tab
  logToOverrides({
    targetType: targetType,
    targetValue: targetValue || 'all',
    message: message,
    sentBy: sentBy,
    status: failed === 0 ? 'sent' : 'partial (' + sent + '/' + (sent + failed) + ')'
  });

  return jsonResponse_({
    success: true,
    sent: sent,
    failed: failed,
    errors: errors,
    message: 'Override sent to ' + sent + ' student(s)'
  });
}

/**
 * Handles the send_daily action.
 * Triggers the daily schedule sender, optionally for a specific date.
 * @private
 */
function handleDailyTrigger_(body) {
  var date = body.date || getIndiaDate();

  if (date !== getIndiaDate()) {
    sendDailyScheduleWithDate_(date);
  } else {
    sendDailySchedule();
  }

  return jsonResponse_({
    success: true,
    message: 'Daily schedule triggered for ' + date
  });
}

/**
 * Handles the send_test action.
 * Sends a test message to a single phone number.
 * @private
 */
function handleTestSend_(body) {
  var phone = body.phone;
  var message = body.message || 'This is a test message from the WhatsApp Class Notification System.';

  if (!phone) {
    return jsonResponse_({ success: false, message: 'Missing phone number' }, 400);
  }

  var formattedPhone = formatPhoneNumber(phone);
  var result = sendTemplate(formattedPhone, getConfig('TEMPLATE_NAME') || 'class_update', [message]);

  logToSheet({
    studentName: 'TEST',
    phone: formattedPhone,
    messageType: 'test',
    messageSent: message,
    deliveryStatus: result.success ? 'sent' : 'failed',
    whatsappMsgId: result.messageId || '',
    error: result.error || ''
  });

  return jsonResponse_({
    success: result.success,
    messageId: result.messageId || '',
    message: result.success ? 'Test message sent' : 'Failed: ' + result.error
  });
}

/**
 * Creates a JSON response for the web app.
 * @private
 * @param {Object} data - Response data
 * @param {number} [statusCode] - HTTP-like status (for logging only; Apps Script always returns 200)
 * @return {ContentService.TextOutput}
 */
function jsonResponse_(data, statusCode) {
  // Note: Apps Script web apps always return HTTP 200.
  // The status is conveyed in the JSON body's "success" field.
  if (statusCode && statusCode >= 400) {
    Logger.log('Error response (' + statusCode + '): ' + JSON.stringify(data));
  }
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
