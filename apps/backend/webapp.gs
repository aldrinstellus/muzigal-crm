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

    // --- WhatsApp Incoming Message Webhook (from Meta) ---
    // Meta Cloud API webhooks have entry[].changes[] and no "secret" or "action" field.
    // Route these before secret validation since Meta signs webhooks differently.
    if (!body.action && body.entry && body.entry.length > 0) {
      return handleIncomingWhatsApp_(body);
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
      case 'validate_token':
        return handleValidateToken_();
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
      case 'mark_attendance_by_name':
        return jsonResponse_({ status: 'ok', data: markAttendanceByName(body.studentName, body.date, body.status) });
      case 'mark_bulk_attendance':
        return jsonResponse_({ status: 'ok', data: markBulkAttendance(body.date, body.attendanceList) });
      case 'notify_absences':
        return jsonResponse_({ status: 'ok', data: notifyAbsences(body.date) });
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
  // --- Meta WhatsApp Webhook Verification ---
  // Meta sends GET with hub.mode, hub.verify_token, hub.challenge to verify the endpoint.
  if (e && e.parameter && e.parameter['hub.mode'] === 'subscribe') {
    var verifyToken = getConfig('WEBHOOK_SECRET');
    if (e.parameter['hub.verify_token'] === verifyToken) {
      // Return the challenge value as plain text (not JSON) per Meta's requirement
      return ContentService.createTextOutput(e.parameter['hub.challenge']);
    }
    return ContentService.createTextOutput('Verification failed').setMimeType(ContentService.MimeType.TEXT);
  }

  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'health';

  if (action === 'setup') {
    createSheetStructure();
    return jsonResponse_({
      status: 'ok',
      message: 'Sheet structure created successfully',
      timestamp: getIndiaTimestamp()
    });
  }

  if (action === 'validate_token') {
    var result = validateWhatsAppToken();
    return jsonResponse_({
      status: result.valid ? 'ok' : 'error',
      data: result,
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
  if (action === 'daily_attendance') {
    return jsonResponse_({ status: 'ok', data: getDailyAttendanceReport(e.parameter.date) });
  }
  if (action === 'attendance_report') {
    return jsonResponse_({ status: 'ok', data: getAttendanceReportByName(e.parameter.studentName, e.parameter.startDate, e.parameter.endDate) });
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
 * Handles the validate_token action (POST).
 * Validates the WhatsApp token by calling the Meta Graph API.
 * @private
 * @return {ContentService.TextOutput} JSON response with validation result
 */
function handleValidateToken_() {
  var result = validateWhatsAppToken();
  return jsonResponse_({
    success: result.valid,
    tokenType: result.tokenType,
    details: result.details,
    error: result.error || '',
    message: result.valid
      ? 'WhatsApp token is valid (' + result.tokenType + ')'
      : 'WhatsApp token validation failed',
    timestamp: getIndiaTimestamp()
  });
}

/**
 * Handles incoming WhatsApp messages from the Meta Cloud API webhook.
 * Extracts the sender's phone and message text, then routes to the
 * registration flow if applicable.
 *
 * Meta webhook payload structure:
 *   { entry: [{ changes: [{ value: { messages: [{ from, text: { body } }] } }] }] }
 *
 * @private
 * @param {Object} body - Parsed webhook payload from Meta
 * @return {ContentService.TextOutput} JSON acknowledgement
 */
function handleIncomingWhatsApp_(body) {
  try {
    var entries = body.entry || [];

    for (var e = 0; e < entries.length; e++) {
      var changes = entries[e].changes || [];

      for (var c = 0; c < changes.length; c++) {
        var value = changes[c].value;
        if (!value || !value.messages) continue;

        var messages = value.messages;

        for (var m = 0; m < messages.length; m++) {
          var msg = messages[m];
          if (msg.type !== 'text' || !msg.text || !msg.text.body) continue;

          var senderPhone = formatPhoneNumber(msg.from || '');
          var messageText = String(msg.text.body).trim();
          var lowerText = messageText.toLowerCase();

          Logger.log('Incoming WhatsApp from ' + senderPhone + ': ' + messageText);

          // Check if user wants to start registration
          if (lowerText === 'register' || lowerText === 'signup' || lowerText === 'sign up' || lowerText === 'join') {
            var welcomeMsg = startRegistration(senderPhone);
            sendFreeForm(senderPhone, welcomeMsg);

            logToSheet({
              studentName: '',
              phone: senderPhone,
              messageType: 'registration_start',
              messageSent: welcomeMsg,
              deliveryStatus: 'sent',
              whatsappMsgId: msg.id || '',
              error: ''
            });

            continue;
          }

          // Check if user is in an active registration flow
          if (isInRegistrationFlow(senderPhone)) {
            var result = handleRegistrationMessage(senderPhone, messageText);

            if (result.handled && result.reply) {
              sendFreeForm(senderPhone, result.reply);

              logToSheet({
                studentName: '',
                phone: senderPhone,
                messageType: 'registration_step',
                messageSent: result.reply,
                deliveryStatus: 'sent',
                whatsappMsgId: msg.id || '',
                error: ''
              });
            }

            continue;
          }

          // Not in registration flow and not a registration keyword — ignore or handle elsewhere
          Logger.log('Unhandled incoming message from ' + senderPhone + ': ' + messageText);
        }
      }
    }
  } catch (err) {
    Logger.log('handleIncomingWhatsApp_ error: ' + err.message);
  }

  // Always return 200 OK to Meta to acknowledge receipt
  return jsonResponse_({ success: true, message: 'Webhook received' });
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
