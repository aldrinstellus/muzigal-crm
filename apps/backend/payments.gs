/**
 * payments.gs — Payment management and Razorpay integration
 *
 * Handles payment CRUD, Razorpay payment link creation, webhook processing,
 * monthly invoice generation, and revenue reporting.
 */

/**
 * Reads payments from the Payments tab with optional filters.
 * @param {Object} [filters] - { studentId, status, month, dateRange: { start, end } }
 * @return {Object[]} Array of payment objects
 */
function listPayments(filters) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Payments');
  if (!sheet || sheet.getLastRow() <= 1) return [];

  var data = sheet.getDataRange().getValues();
  var payments = [];

  for (var i = 1; i < data.length; i++) {
    var payment = rowToPayment_(data[i], i + 1);

    if (filters) {
      if (filters.studentId && payment.studentId !== filters.studentId) continue;
      if (filters.status && payment.status !== filters.status) continue;
      if (filters.month && payment.month !== filters.month) continue;
      if (filters.dateRange) {
        var pDate = payment.date;
        if (filters.dateRange.start && pDate < filters.dateRange.start) continue;
        if (filters.dateRange.end && pDate > filters.dateRange.end) continue;
      }
    }

    payments.push(payment);
  }

  return payments;
}

/**
 * Returns all payments for a student, sorted by date descending.
 * @param {string} studentId
 * @return {Object[]} Array of payment objects
 */
function getStudentPayments(studentId) {
  var payments = listPayments({ studentId: studentId });

  payments.sort(function(a, b) {
    if (a.date > b.date) return -1;
    if (a.date < b.date) return 1;
    return 0;
  });

  return payments;
}

/**
 * Returns all payments with Status = 'Pending' or 'Overdue'.
 * Auto-marks payments as 'Overdue' if DueDate < today and Status = 'Pending'.
 * @return {Object[]} Array of pending/overdue payment objects
 */
function getPendingPayments() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Payments');
  if (!sheet || sheet.getLastRow() <= 1) return [];

  var data = sheet.getDataRange().getValues();
  var today = getIndiaDate();
  var results = [];

  for (var i = 1; i < data.length; i++) {
    var status = String(data[i][5]);
    var dueDate = formatDateValue_(data[i][4]);

    // Auto-mark overdue
    if (status === 'Pending' && dueDate < today) {
      sheet.getRange(i + 1, 6).setValue('Overdue'); // col F = Status
      data[i][5] = 'Overdue';
      status = 'Overdue';
      Logger.log('Auto-marked payment ' + data[i][0] + ' as Overdue (due: ' + dueDate + ')');
    }

    if (status === 'Pending' || status === 'Overdue') {
      results.push(rowToPayment_(data[i], i + 1));
    }
  }

  return results;
}

/**
 * Records a new payment in the Payments tab.
 * Auto-generates PaymentID (PAY001, PAY002, etc.).
 * @param {Object} data - { studentId, amount, method, razorpayRef, month, notes }
 * @return {Object} The created payment object
 */
function recordPayment(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Payments');
  if (!sheet) {
    throw new Error('Payments tab not found. Run createSheetStructure() first.');
  }

  var paymentId = generatePaymentId_(sheet);
  var timestamp = getIndiaTimestamp();
  var date = getIndiaDate();
  var dueDate = data.dueDate || date;
  var status = data.razorpayRef ? 'Paid' : 'Pending';

  var row = [
    paymentId,
    data.studentId || '',
    data.amount || 0,
    date,
    dueDate,
    status,
    data.method || '',
    data.razorpayRef || '',
    data.month || '',
    data.notes || '',
    timestamp
  ];

  sheet.appendRow(row);
  Logger.log('Payment recorded: ' + paymentId + ' for student ' + data.studentId + ' - INR ' + data.amount);

  return {
    paymentId: paymentId,
    studentId: data.studentId,
    amount: data.amount,
    date: date,
    dueDate: dueDate,
    status: status,
    method: data.method || '',
    razorpayRef: data.razorpayRef || '',
    month: data.month || '',
    notes: data.notes || '',
    createdAt: timestamp
  };
}

/**
 * Creates a Razorpay payment link for a student.
 * Uses RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET from Config tab.
 * @param {string} studentId - The student to charge
 * @param {number} amount - Amount in INR (will be converted to paise)
 * @param {string} description - Payment description
 * @return {Object} { shortUrl, paymentLinkId } or { error }
 */
function createPaymentLink(studentId, amount, description) {
  var keyId = getConfig('RAZORPAY_KEY_ID');
  var keySecret = getConfig('RAZORPAY_KEY_SECRET');

  if (!keyId || !keySecret || keyId === '(placeholder)' || keySecret === '(placeholder)') {
    return { error: 'Razorpay API not configured' };
  }

  var url = 'https://api.razorpay.com/v1/payment_links';
  var authHeader = 'Basic ' + Utilities.base64Encode(keyId + ':' + keySecret);

  var payload = {
    amount: Math.round(amount * 100), // Convert INR to paise
    currency: 'INR',
    description: description || 'Muzigal fee payment',
    reference_id: studentId + '_' + getIndiaDate(),
    callback_url: '',
    callback_method: ''
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Authorization': authHeader },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    var body = JSON.parse(response.getContentText());

    if (code === 200 || code === 201) {
      Logger.log('Razorpay payment link created: ' + body.short_url);
      return {
        shortUrl: body.short_url,
        paymentLinkId: body.id
      };
    }

    var errorMsg = 'HTTP ' + code;
    if (body.error) {
      errorMsg += ': ' + (body.error.description || JSON.stringify(body.error));
    }
    Logger.log('Razorpay error: ' + errorMsg);
    return { error: errorMsg };

  } catch (e) {
    Logger.log('Razorpay request failed: ' + e.message);
    return { error: 'Request failed: ' + e.message };
  }
}

/**
 * Processes a Razorpay webhook payload for payment.captured events.
 * Updates the Payments tab and optionally sends a WhatsApp receipt.
 * @param {Object} payload - Razorpay webhook payload
 * @return {Object} { success, message }
 */
function handleRazorpayWebhook(payload) {
  if (!payload || !payload.event) {
    return { success: false, message: 'Invalid webhook payload' };
  }

  if (payload.event !== 'payment.captured') {
    return { success: true, message: 'Ignored event: ' + payload.event };
  }

  var payment = payload.payload && payload.payload.payment && payload.payload.payment.entity;
  if (!payment) {
    return { success: false, message: 'No payment entity in payload' };
  }

  var razorpayId = payment.id;
  var amountInr = (payment.amount || 0) / 100; // paise to INR
  var refId = payment.notes && payment.notes.reference_id ? payment.notes.reference_id : '';

  // Find and update matching payment row
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Payments');
  if (!sheet || sheet.getLastRow() <= 1) {
    return { success: false, message: 'Payments tab not found or empty' };
  }

  var data = sheet.getDataRange().getValues();
  var updated = false;

  for (var i = 1; i < data.length; i++) {
    var status = String(data[i][5]);
    var studentId = String(data[i][1]);

    // Match by reference or by student + amount + pending status
    var matchByRef = refId && refId.indexOf(studentId) === 0;
    var matchByAmount = Math.abs(Number(data[i][2]) - amountInr) < 1;
    var isPending = status === 'Pending' || status === 'Overdue';

    if (isPending && (matchByRef || matchByAmount)) {
      sheet.getRange(i + 1, 6).setValue('Paid');           // Status
      sheet.getRange(i + 1, 7).setValue('Razorpay');       // Method
      sheet.getRange(i + 1, 8).setValue(razorpayId);       // RazorpayRef
      sheet.getRange(i + 1, 11).setValue(getIndiaTimestamp()); // UpdatedAt
      updated = true;

      // Send WhatsApp receipt notification
      var student = getStudentById_(studentId);
      if (student && student.phone) {
        var receiptMsg = 'Hi ' + student.name.split(' ')[0]
          + ', your payment of INR ' + amountInr.toFixed(2)
          + ' has been received. Thank you!';
        sendTemplate(formatPhoneNumber(student.phone), getConfig('TEMPLATE_NAME') || 'class_update', [receiptMsg]);
      }

      Logger.log('Payment updated via webhook: ' + razorpayId + ' for student ' + studentId);
      break;
    }
  }

  return {
    success: updated,
    message: updated ? 'Payment recorded: ' + razorpayId : 'No matching pending payment found'
  };
}

/**
 * Generates monthly pending payment records for all active students.
 * Reads fee amount from the Classes tab.
 * @param {string} month - Month string (e.g. '2026-03')
 * @return {number} Count of invoices generated
 */
function generateMonthlyInvoices(month) {
  if (!month) {
    throw new Error('Month parameter is required (e.g. "2026-03")');
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // Read class fees from Classes tab
  var classesSheet = ss.getSheetByName('Classes');
  var classFees = {};
  if (classesSheet && classesSheet.getLastRow() > 1) {
    var classData = classesSheet.getDataRange().getValues();
    for (var c = 1; c < classData.length; c++) {
      var className = String(classData[c][0]); // ClassID or ClassName
      var fee = Number(classData[c][4]) || 0;  // Fee column (index 4)
      if (className) classFees[className] = fee;
    }
  }

  // Get existing payments for this month to avoid duplicates
  var existingPayments = listPayments({ month: month });
  var existingStudentIds = {};
  existingPayments.forEach(function(p) {
    existingStudentIds[p.studentId] = true;
  });

  var students = getAllActiveStudents();
  var count = 0;

  // Due date is the 10th of the given month
  var dueDate = month + '-10';

  students.forEach(function(student) {
    if (existingStudentIds[student.studentId]) return; // skip duplicates

    var fee = classFees[student.className] || 0;
    if (fee <= 0) {
      Logger.log('Skipping invoice for ' + student.name + ': no fee found for class ' + student.className);
      return;
    }

    recordPayment({
      studentId: student.studentId,
      amount: fee,
      method: '',
      razorpayRef: '',
      month: month,
      dueDate: dueDate,
      notes: 'Auto-generated monthly invoice'
    });
    count++;
  });

  Logger.log('Generated ' + count + ' monthly invoice(s) for ' + month);
  return count;
}

/**
 * Calculates revenue totals for a given month.
 * @param {string} month - Month string (e.g. '2026-03')
 * @return {Object} { total, count, breakdown: [{ method, amount }] }
 */
function getRevenueByMonth(month) {
  var payments = listPayments({ status: 'Paid', month: month });

  var total = 0;
  var methodTotals = {};

  payments.forEach(function(p) {
    var amt = Number(p.amount) || 0;
    total += amt;

    var method = p.method || 'Unknown';
    methodTotals[method] = (methodTotals[method] || 0) + amt;
  });

  var breakdown = [];
  for (var method in methodTotals) {
    breakdown.push({ method: method, amount: methodTotals[method] });
  }

  return {
    total: total,
    count: payments.length,
    breakdown: breakdown
  };
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * Converts a Payments sheet row to a payment object.
 * @private
 * @param {Array} row - Sheet row values
 * @param {number} rowIndex - 1-based sheet row number
 * @return {Object} Payment object
 */
function rowToPayment_(row, rowIndex) {
  return {
    paymentId: String(row[0]),
    studentId: String(row[1]),
    amount: Number(row[2]) || 0,
    date: formatDateValue_(row[3]),
    dueDate: formatDateValue_(row[4]),
    status: String(row[5]),
    method: String(row[6]),
    razorpayRef: String(row[7]),
    month: String(row[8]),
    notes: String(row[9]),
    createdAt: row[10] ? String(row[10]) : '',
    rowIndex: rowIndex
  };
}

/**
 * Generates the next sequential PaymentID (PAY001, PAY002, etc.).
 * @private
 * @param {Sheet} sheet - The Payments sheet
 * @return {string} New PaymentID
 */
function generatePaymentId_(sheet) {
  var lastRow = sheet.getLastRow();
  if (lastRow <= 1) return 'PAY001';

  var ids = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
  var maxNum = 0;

  for (var i = 0; i < ids.length; i++) {
    var id = String(ids[i][0]);
    var match = id.match(/^PAY(\d+)$/);
    if (match) {
      var num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  }

  var next = maxNum + 1;
  var padded = ('000' + next).slice(-3);
  return 'PAY' + padded;
}

/**
 * Looks up a student by StudentID from the Students tab.
 * @private
 * @param {string} studentId
 * @return {Object|null} Student object or null
 */
function getStudentById_(studentId) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Students');
  if (!sheet || sheet.getLastRow() <= 1) return null;

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(studentId)) {
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
