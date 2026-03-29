/**
 * fees.gs — Fee payment reminders via WhatsApp
 *
 * Reads the Fees tab, detects upcoming and overdue fees,
 * sends WhatsApp reminders, and logs to FeeRemindersLog to avoid duplicates.
 *
 * Fees tab columns:
 *   A: FeeID, B: StudentName, C: ParentPhone, D: Amount,
 *   E: DueDate, F: Status (Pending/Paid/Overdue), G: PaidDate, H: Notes
 *
 * FeeRemindersLog tab columns:
 *   A: Timestamp, B: FeeID, C: StudentName, D: Phone,
 *   E: ReminderType, F: DeliveryStatus, G: WhatsAppMsgID, H: Error
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

var FEE_REMINDER_DAYS_BEFORE_ = 3; // Send "upcoming" reminder this many days before due

// ---------------------------------------------------------------------------
// Main entry point — called by daily trigger
// ---------------------------------------------------------------------------

/**
 * Checks all fees and sends appropriate reminders.
 * - Pending fees due within 3 days -> "upcoming" reminder
 * - Pending fees past due -> mark Overdue, send "overdue" reminder
 * Skips fees that already have a reminder logged for the same type on the same day.
 */
function checkFeeReminders() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var feesSheet = ss.getSheetByName('Fees');
  if (!feesSheet || feesSheet.getLastRow() <= 1) {
    Logger.log('Fees tab not found or empty. Exiting.');
    return;
  }

  var today = getIndiaDate();
  var todayDate = parseDate_(today);
  var data = feesSheet.getDataRange().getValues();
  var sentToday = getSentRemindersToday_(today);

  var totalSent = 0;
  var totalFailed = 0;
  var totalSkipped = 0;
  var allErrors = [];

  for (var i = 1; i < data.length; i++) {
    var feeId = String(data[i][0]);
    var studentName = String(data[i][1]);
    var parentPhone = String(data[i][2]);
    var amount = Number(data[i][3]) || 0;
    var dueDate = formatDateValue_(data[i][4]);
    var status = String(data[i][5]);
    var rowIndex = i + 1; // 1-based sheet row

    // Skip paid fees
    if (status === 'Paid') continue;

    // Skip rows with missing essential data
    if (!feeId || !parentPhone || amount <= 0 || !dueDate) continue;

    var dueDateObj = parseDate_(dueDate);
    if (!dueDateObj) continue;

    var daysUntilDue = daysBetween_(todayDate, dueDateObj);

    if (status === 'Pending' && daysUntilDue < 0) {
      // Past due — mark as Overdue
      feesSheet.getRange(rowIndex, 6).setValue('Overdue');
      status = 'Overdue';
      Logger.log('Auto-marked fee ' + feeId + ' as Overdue (due: ' + dueDate + ')');
    }

    var reminderType = null;

    if (status === 'Overdue') {
      reminderType = 'overdue';
    } else if (status === 'Pending' && daysUntilDue >= 0 && daysUntilDue <= FEE_REMINDER_DAYS_BEFORE_) {
      reminderType = 'upcoming';
    }

    if (!reminderType) continue;

    // Check duplicate: skip if same feeId + reminderType already sent today
    var dedupKey = feeId + '|' + reminderType;
    if (sentToday[dedupKey]) {
      totalSkipped++;
      continue;
    }

    // Send the reminder
    var result = sendFeeReminder(parentPhone, studentName, amount, dueDate, reminderType);

    // Log the reminder
    logFeeReminder_({
      feeId: feeId,
      studentName: studentName,
      phone: formatPhoneNumber(parentPhone),
      reminderType: reminderType,
      deliveryStatus: result.success ? 'sent' : 'failed',
      whatsappMsgId: result.messageId || '',
      error: result.error || ''
    });

    if (result.success) {
      totalSent++;
    } else {
      totalFailed++;
      allErrors.push(studentName + ' (' + parentPhone + '): ' + result.error);
    }

    // Rate limiting: 200ms between sends
    Utilities.sleep(200);
  }

  Logger.log('Fee reminders complete. Sent: ' + totalSent
    + ', Failed: ' + totalFailed + ', Skipped (already sent): ' + totalSkipped);

  // Send summary email if any reminders were attempted
  if (totalSent > 0 || totalFailed > 0) {
    sendSummaryEmail({
      subject: 'Fee Reminders Summary — ' + today
        + ' (' + totalSent + ' sent, ' + totalFailed + ' failed)',
      sent: totalSent,
      failed: totalFailed,
      errors: allErrors,
      details: 'Skipped (duplicate): ' + totalSkipped
    });
  }
}

// ---------------------------------------------------------------------------
// Reminder sending
// ---------------------------------------------------------------------------

/**
 * Sends a fee payment reminder via WhatsApp.
 *
 * @param {string} phone - Parent's phone number
 * @param {string} studentName - Student's name
 * @param {number} amount - Fee amount in INR
 * @param {string} dueDate - Due date (YYYY-MM-DD)
 * @param {string} type - 'upcoming' or 'overdue'
 * @return {Object} { success: boolean, messageId: string, error: string }
 */
function sendFeeReminder(phone, studentName, amount, dueDate, type) {
  var formattedPhone = formatPhoneNumber(phone);
  var message = composeFeeReminderMessage_(studentName, amount, dueDate, type);

  // Use template-based sending (business-initiated, no 24hr window needed)
  var templateName = getConfig('TEMPLATE_NAME') || 'class_update';
  var result = sendTemplate(formattedPhone, templateName, [message]);

  // Also log to the main Log tab for unified visibility
  logToSheet({
    studentName: studentName,
    phone: formattedPhone,
    messageType: 'fee_reminder_' + type,
    messageSent: message,
    deliveryStatus: result.success ? 'sent' : 'failed',
    whatsappMsgId: result.messageId || '',
    error: result.error || ''
  });

  return result;
}

// ---------------------------------------------------------------------------
// Message composition
// ---------------------------------------------------------------------------

/**
 * Composes a fee reminder message. English only, friendly professional tone.
 * @private
 * @param {string} studentName - Full name of the student
 * @param {number} amount - Fee amount in INR
 * @param {string} dueDate - Due date (YYYY-MM-DD)
 * @param {string} type - 'upcoming' or 'overdue'
 * @return {string} Plain text message
 */
function composeFeeReminderMessage_(studentName, amount, dueDate, type) {
  var firstName = studentName.split(' ')[0];
  var academyName = getConfig('ACADEMY_NAME') || getConfig('SCHOOL_NAME') || 'Academy';
  var formattedAmount = formatCurrency_(amount);
  var formattedDate = formatDisplayDate_(dueDate);

  if (type === 'upcoming') {
    return 'Hi ' + firstName + ', this is a friendly reminder that the fee of '
      + formattedAmount + ' for ' + academyName + ' is due on '
      + formattedDate + '. Please make the payment before the due date to avoid any late charges. '
      + 'Thank you! - ' + academyName;
  }

  if (type === 'overdue') {
    return 'Hi ' + firstName + ', the fee of ' + formattedAmount
      + ' for ' + academyName + ' was due on ' + formattedDate
      + ' and is now overdue. Please make the payment at your earliest convenience. '
      + 'If you have already paid, please disregard this message. '
      + 'Thank you! - ' + academyName;
  }

  // Fallback (should not happen)
  return 'Hi ' + firstName + ', you have a pending fee of ' + formattedAmount
    + ' at ' + academyName + '. Please contact us for details. - ' + academyName;
}

// ---------------------------------------------------------------------------
// Duplicate detection — FeeRemindersLog
// ---------------------------------------------------------------------------

/**
 * Returns a map of reminders already sent today, keyed by "FeeID|ReminderType".
 * @private
 * @param {string} today - Today's date (YYYY-MM-DD)
 * @return {Object} Map of dedupKey -> true
 */
function getSentRemindersToday_(today) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('FeeRemindersLog');
  if (!sheet || sheet.getLastRow() <= 1) return {};

  var data = sheet.getDataRange().getValues();
  var sentMap = {};

  for (var i = 1; i < data.length; i++) {
    var timestamp = String(data[i][0]);
    var feeId = String(data[i][1]);
    var reminderType = String(data[i][4]);
    var deliveryStatus = String(data[i][5]);

    // Only count successful sends from today
    if (deliveryStatus === 'sent' && timestamp.indexOf(today) === 0) {
      sentMap[feeId + '|' + reminderType] = true;
    }
  }

  return sentMap;
}

/**
 * Appends a row to the FeeRemindersLog tab.
 * @private
 * @param {Object} logData - { feeId, studentName, phone, reminderType, deliveryStatus, whatsappMsgId, error }
 */
function logFeeReminder_(logData) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('FeeRemindersLog');
  if (!sheet) {
    Logger.log('FeeRemindersLog tab not found. Skipping log.');
    return;
  }

  sheet.appendRow([
    getIndiaTimestamp(),
    logData.feeId || '',
    logData.studentName || '',
    logData.phone || '',
    logData.reminderType || '',
    logData.deliveryStatus || '',
    logData.whatsappMsgId || '',
    logData.error || ''
  ]);
}

// ---------------------------------------------------------------------------
// Date and formatting helpers
// ---------------------------------------------------------------------------

/**
 * Parses a YYYY-MM-DD string into a Date object (midnight IST).
 * @private
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @return {Date|null}
 */
function parseDate_(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  var parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  var d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Returns the number of days between two dates (positive if b is after a).
 * @private
 * @param {Date} a
 * @param {Date} b
 * @return {number}
 */
function daysBetween_(a, b) {
  var msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((b.getTime() - a.getTime()) / msPerDay);
}

/**
 * Formats amount as INR currency string (e.g. "INR 2,500.00").
 * @private
 * @param {number} amount
 * @return {string}
 */
function formatCurrency_(amount) {
  var str = amount.toFixed(2);
  // Add commas for Indian numbering (last 3, then every 2)
  var parts = str.split('.');
  var intPart = parts[0];
  var decPart = parts[1];

  if (intPart.length > 3) {
    var last3 = intPart.slice(-3);
    var remaining = intPart.slice(0, -3);
    // Add commas every 2 digits for the remaining part
    remaining = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    intPart = remaining + ',' + last3;
  }

  return 'INR ' + intPart + '.' + decPart;
}

/**
 * Formats a YYYY-MM-DD date into a human-readable string (e.g. "29 Mar 2026").
 * @private
 * @param {string} dateStr - Date in YYYY-MM-DD format
 * @return {string}
 */
function formatDisplayDate_(dateStr) {
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var d = parseDate_(dateStr);
  if (!d) return dateStr; // fallback to raw string
  return d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

// ---------------------------------------------------------------------------
// Trigger setup
// ---------------------------------------------------------------------------

/**
 * Installs a daily time-driven trigger for fee reminders at 9:00 AM IST.
 * Safe to call multiple times — removes existing fee reminder triggers first.
 */
function installFeeReminderTrigger() {
  // Remove any existing fee reminder triggers
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'checkFeeReminders') {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  ScriptApp.newTrigger('checkFeeReminders')
    .timeBased()
    .atHour(9)
    .nearMinute(0)
    .everyDays(1)
    .inTimezone('Asia/Kolkata')
    .create();

  Logger.log('Fee reminder trigger installed: daily at 9:00 AM IST.');
}

/**
 * Removes the fee reminder trigger only (leaves other triggers intact).
 */
function removeFeeReminderTrigger() {
  var triggers = ScriptApp.getProjectTriggers();
  var removed = 0;

  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'checkFeeReminders') {
      ScriptApp.deleteTrigger(trigger);
      removed++;
    }
  });

  Logger.log('Removed ' + removed + ' fee reminder trigger(s).');
}

// ---------------------------------------------------------------------------
// Manual utilities
// ---------------------------------------------------------------------------

/**
 * Manually sends a fee reminder for a specific fee row (by FeeID).
 * Useful for testing or one-off sends.
 * @param {string} feeId - The FeeID to send a reminder for
 * @param {string} type - 'upcoming' or 'overdue'
 * @return {Object} { success, messageId, error }
 */
function sendFeeReminderById(feeId, type) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Fees');
  if (!sheet || sheet.getLastRow() <= 1) {
    return { success: false, messageId: '', error: 'Fees tab not found or empty' };
  }

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === feeId) {
      var studentName = String(data[i][1]);
      var parentPhone = String(data[i][2]);
      var amount = Number(data[i][3]) || 0;
      var dueDate = formatDateValue_(data[i][4]);

      return sendFeeReminder(parentPhone, studentName, amount, dueDate, type || 'upcoming');
    }
  }

  return { success: false, messageId: '', error: 'FeeID not found: ' + feeId };
}
