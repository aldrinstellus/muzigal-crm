/**
 * sender.gs — WhatsApp Cloud API sending logic
 *
 * Supports both free-form text (within 24hr window) and template-based
 * business-initiated messages. Defaults to template for all scheduled sends.
 */

/**
 * Composes a message and sends it via WhatsApp, then logs the result.
 *
 * @param {Object} student - { name, phone, className }
 * @param {Object} scheduleRow - Schedule row object
 * @param {string} changeType - Type of change/notification
 * @param {string} [oldValue] - Previous value
 * @param {string} [newValue] - New value
 * @return {Object} { success, messageId, error }
 */
function composeAndSend(student, scheduleRow, changeType, oldValue, newValue) {
  var messageText = composeMessage(student, scheduleRow, changeType, oldValue, newValue);
  var phone = formatPhoneNumber(student.phone);

  // Default to template-based sending for all scheduled/triggered sends.
  // Template sends don't require a prior student message (no 24hr window needed).
  var result = sendTemplate(phone, getConfig('TEMPLATE_NAME') || 'class_update', [messageText]);

  logToSheet({
    studentName: student.name,
    phone: phone,
    messageType: changeType,
    messageSent: messageText,
    deliveryStatus: result.success ? 'sent' : 'failed',
    whatsappMsgId: result.messageId || '',
    error: result.error || ''
  });

  return result;
}

/**
 * Sends a free-form text message via WhatsApp Cloud API.
 * NOTE: This only works within a 24-hour window after the student last
 * messaged your business number. For business-initiated outbound messages
 * (scheduled notifications, triggered alerts), use sendTemplate() instead.
 *
 * @param {string} phone - E.164 phone number
 * @param {string} text - Message text
 * @return {Object} { success: boolean, messageId: string, error: string }
 */
function sendFreeForm(phone, text) {
  var token = getConfig('WHATSAPP_TOKEN');
  var phoneNumberId = getConfig('PHONE_NUMBER_ID');

  if (!token || token === '(placeholder)' || !phoneNumberId || phoneNumberId === '(placeholder)') {
    return { success: false, messageId: '', error: 'WhatsApp API not configured' };
  }

  var url = 'https://graph.facebook.com/v19.0/' + phoneNumberId + '/messages';

  var payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: phone,
    type: 'text',
    text: { body: text }
  };

  return executeWhatsAppRequest_(url, token, payload);
}

/**
 * Sends a template-based message via WhatsApp Cloud API.
 * Use this for business-initiated outbound messages (no prior student message needed).
 * The template must be pre-approved in the Meta Business Manager.
 *
 * @param {string} phone - E.164 phone number
 * @param {string} templateName - Approved template name (e.g. 'class_update')
 * @param {string[]} params - Template parameter values (positional)
 * @return {Object} { success: boolean, messageId: string, error: string }
 */
function sendTemplate(phone, templateName, params) {
  var token = getConfig('WHATSAPP_TOKEN');
  var phoneNumberId = getConfig('PHONE_NUMBER_ID');

  if (!token || token === '(placeholder)' || !phoneNumberId || phoneNumberId === '(placeholder)') {
    return { success: false, messageId: '', error: 'WhatsApp API not configured' };
  }

  var url = 'https://graph.facebook.com/v19.0/' + phoneNumberId + '/messages';

  // Build template components with parameters
  var components = [];
  if (params && params.length > 0) {
    var parameters = params.map(function(p) {
      return { type: 'text', text: String(p) };
    });
    components.push({
      type: 'body',
      parameters: parameters
    });
  }

  var payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: phone,
    type: 'template',
    template: {
      name: templateName,
      language: { code: 'en' },
      components: components
    }
  };

  return executeWhatsAppRequest_(url, token, payload);
}

/**
 * Executes a WhatsApp Cloud API request.
 * @private
 * @param {string} url
 * @param {string} token
 * @param {Object} payload
 * @return {Object} { success, messageId, error }
 */
function executeWhatsAppRequest_(url, token, payload) {
  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + token
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  try {
    var response = UrlFetchApp.fetch(url, options);
    var code = response.getResponseCode();
    var body = JSON.parse(response.getContentText());

    if (code === 200 && body.messages && body.messages.length > 0) {
      return {
        success: true,
        messageId: body.messages[0].id,
        error: ''
      };
    }

    var errorMsg = 'HTTP ' + code;
    if (body.error) {
      errorMsg += ': ' + (body.error.message || JSON.stringify(body.error));
    }
    return { success: false, messageId: '', error: errorMsg };

  } catch (e) {
    return { success: false, messageId: '', error: 'Request failed: ' + e.message };
  }
}

/**
 * Sends messages to multiple students with rate limiting.
 * Inserts a 200ms delay between sends to avoid WhatsApp rate limits.
 *
 * @param {Object[]} students - Array of student objects
 * @param {Object} scheduleRow - Schedule row object
 * @param {string} changeType - Type of change
 * @param {string} [oldValue] - Previous value
 * @param {string} [newValue] - New value
 * @return {Object} { sent: number, failed: number, errors: string[] }
 */
function batchSend(students, scheduleRow, changeType, oldValue, newValue) {
  var sent = 0;
  var failed = 0;
  var errors = [];

  for (var i = 0; i < students.length; i++) {
    var result = composeAndSend(students[i], scheduleRow, changeType, oldValue, newValue);

    if (result.success) {
      sent++;
    } else {
      failed++;
      errors.push(students[i].name + ' (' + students[i].phone + '): ' + result.error);
    }

    // 200ms delay between sends to respect rate limits
    if (i < students.length - 1) {
      Utilities.sleep(200);
    }
  }

  return { sent: sent, failed: failed, errors: errors };
}
