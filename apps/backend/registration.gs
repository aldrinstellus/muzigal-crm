/**
 * registration.gs — Student self-registration via WhatsApp
 *
 * Conversational state machine that guides a prospective student through
 * registration over WhatsApp. State is persisted in the RegistrationState tab.
 *
 * Flow: WELCOME → NAME → INSTRUMENT → AGE → EXPERIENCE → PREFERRED_SCHEDULE → CONFIRM
 *
 * On completion, a new row is written to the Students tab with status "Registered"
 * and an Inquiry record is created with Source = "WhatsApp".
 */

// Registration steps in order
var REG_STEPS_ = ['WELCOME', 'NAME', 'INSTRUMENT', 'AGE', 'EXPERIENCE', 'PREFERRED_SCHEDULE', 'CONFIRM'];

// Timeout: 24 hours in milliseconds
var REG_TIMEOUT_MS_ = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Main handler — routes incoming messages based on current step
// ---------------------------------------------------------------------------

/**
 * Handles an incoming WhatsApp message from a phone number that is in
 * (or starting) a registration flow.
 *
 * @param {string} phone - E.164 formatted phone number
 * @param {string} message - The raw text message from the user
 * @return {Object} { handled: boolean, reply: string }
 */
function handleRegistrationMessage(phone, message) {
  var normalized = formatPhoneNumber(phone);
  var text = String(message || '').trim();
  var lower = text.toLowerCase();

  // Check for cancel at any step
  if (lower === 'cancel' || lower === 'stop' || lower === 'quit') {
    cancelRegistration(normalized);
    return {
      handled: true,
      reply: 'Registration cancelled. You can start again anytime by sending "register".'
    };
  }

  // Load current state
  var state = getRegistrationState_(normalized);

  if (!state) {
    // No active registration — this shouldn't normally be called without one,
    // but handle gracefully
    return { handled: false, reply: '' };
  }

  // Check timeout
  if (isRegistrationTimedOut_(state)) {
    cancelRegistration(normalized);
    return {
      handled: true,
      reply: 'Your registration session has expired due to inactivity. Send "register" to start again.'
    };
  }

  var data = state.data;
  var step = state.currentStep;
  var reply = '';
  var nextStep = '';

  switch (step) {
    case 'WELCOME':
      // User responded to welcome — move to NAME
      nextStep = 'NAME';
      reply = 'Great! What is your full name?';
      break;

    case 'NAME':
      if (text.length < 2 || text.length > 100) {
        reply = 'Please enter a valid name (2-100 characters).';
        nextStep = 'NAME';
        break;
      }
      data.name = text;
      nextStep = 'INSTRUMENT';
      reply = 'Nice to meet you, ' + text.split(' ')[0] + '! '
        + 'Which instrument or course are you interested in?\n\n'
        + 'For example: Guitar, Piano, Violin, Drums, Vocals, Keyboard, Flute, or any other.';
      break;

    case 'INSTRUMENT':
      if (text.length < 2) {
        reply = 'Please enter the instrument or course you are interested in.';
        nextStep = 'INSTRUMENT';
        break;
      }
      data.instrument = text;
      nextStep = 'AGE';
      reply = 'How old are you? (Please enter your age as a number, e.g. 12 or 25)';
      break;

    case 'AGE':
      var age = parseInt(text, 10);
      if (isNaN(age) || age < 3 || age > 100) {
        reply = 'Please enter a valid age between 3 and 100.';
        nextStep = 'AGE';
        break;
      }
      data.age = age;
      nextStep = 'EXPERIENCE';
      reply = 'What is your experience level with ' + data.instrument + '?\n\n'
        + '1. Complete beginner\n'
        + '2. Some experience (less than 1 year)\n'
        + '3. Intermediate (1-3 years)\n'
        + '4. Advanced (3+ years)\n\n'
        + 'Reply with a number (1-4) or describe in your own words.';
      break;

    case 'EXPERIENCE':
      data.experience = parseExperience_(text);
      nextStep = 'PREFERRED_SCHEDULE';
      reply = 'When would you prefer to attend classes?\n\n'
        + '1. Weekday mornings\n'
        + '2. Weekday afternoons\n'
        + '3. Weekday evenings\n'
        + '4. Weekends\n'
        + '5. Flexible / No preference\n\n'
        + 'Reply with a number (1-5) or describe your preferred timing.';
      break;

    case 'PREFERRED_SCHEDULE':
      data.preferredSchedule = parseSchedulePreference_(text);
      nextStep = 'CONFIRM';
      reply = buildConfirmationMessage_(data);
      break;

    case 'CONFIRM':
      if (lower === 'yes' || lower === 'y' || lower === 'confirm' || lower === '1') {
        var result = completeRegistration(normalized);
        if (result.success) {
          reply = 'You are all set! Your registration is complete.\n\n'
            + 'Student ID: ' + result.studentId + '\n\n'
            + 'Our team will reach out to you soon to schedule your first class. '
            + 'Welcome to ' + (getConfig('SCHOOL_NAME') || 'our academy') + '!';
        } else {
          reply = 'Something went wrong while completing your registration. '
            + 'Please try again later or contact us directly. Error: ' + result.error;
        }
        return { handled: true, reply: reply };
      } else if (lower === 'no' || lower === 'n' || lower === 'restart' || lower === '2') {
        cancelRegistration(normalized);
        reply = 'No worries! Your registration has been cancelled. '
          + 'Send "register" anytime to start over.';
        return { handled: true, reply: reply };
      } else {
        reply = 'Please reply "Yes" to confirm or "No" to cancel.';
        nextStep = 'CONFIRM';
      }
      break;

    default:
      Logger.log('handleRegistrationMessage: Unknown step "' + step + '" for ' + normalized);
      reply = 'Something went wrong. Send "register" to start a new registration.';
      cancelRegistration(normalized);
      return { handled: true, reply: reply };
  }

  // Update state with new step and data
  updateRegistrationState_(normalized, nextStep, data);

  return { handled: true, reply: reply };
}

// ---------------------------------------------------------------------------
// Start / Complete / Cancel
// ---------------------------------------------------------------------------

/**
 * Initiates the registration flow for a phone number.
 * Creates a new RegistrationState row and returns the welcome message.
 *
 * @param {string} phone - E.164 formatted phone number
 * @return {string} The welcome message to send
 */
function startRegistration(phone) {
  var normalized = formatPhoneNumber(phone);
  var schoolName = getConfig('SCHOOL_NAME') || 'our academy';

  // Check if already in a registration flow
  var existing = getRegistrationState_(normalized);
  if (existing && !isRegistrationTimedOut_(existing)) {
    // Resume from where they left off
    var resumeStep = existing.currentStep;
    return 'Welcome back! You have a registration in progress. '
      + getResumePrompt_(resumeStep, existing.data)
      + '\n\nSend "cancel" at any time to start over.';
  }

  // Clear any old state and create fresh
  if (existing) {
    deleteRegistrationState_(normalized);
  }

  var data = {};
  createRegistrationState_(normalized, 'WELCOME', data);

  return 'Welcome to ' + schoolName + '! We are excited you want to join us.\n\n'
    + 'I will ask you a few quick questions to get you registered. '
    + 'It will only take a minute.\n\n'
    + 'Send "cancel" at any time to stop.\n\n'
    + 'Ready? Just reply with anything to get started!';
}

/**
 * Finalizes the registration: writes to Students tab and creates an Inquiry.
 * Cleans up the RegistrationState row.
 *
 * @param {string} phone - E.164 formatted phone number
 * @return {Object} { success: boolean, studentId: string, error: string }
 */
function completeRegistration(phone) {
  var normalized = formatPhoneNumber(phone);
  var state = getRegistrationState_(normalized);

  if (!state) {
    return { success: false, studentId: '', error: 'No registration in progress' };
  }

  var data = state.data;

  try {
    // Determine age group for inquiry
    var ageGroup = '';
    if (data.age) {
      if (data.age < 6) ageGroup = 'Under 6';
      else if (data.age < 13) ageGroup = '6-12';
      else if (data.age < 18) ageGroup = '13-17';
      else ageGroup = '18+';
    }

    // Create student record
    var student = createStudent({
      Name: data.name || '',
      Phone: normalized,
      Email: '',
      Instrument: data.instrument || '',
      Class: '',
      Source: 'WhatsApp',
      Notes: 'Self-registered via WhatsApp. Age: ' + (data.age || 'N/A')
        + ', Experience: ' + (data.experience || 'N/A')
        + ', Preferred Schedule: ' + (data.preferredSchedule || 'N/A')
    });

    // Create inquiry record for the enrollment pipeline
    try {
      createInquiry({
        Name: data.name || '',
        Phone: normalized,
        Email: '',
        Instrument: data.instrument || '',
        AgeGroup: ageGroup,
        Source: 'WhatsApp',
        Status: 'New',
        Notes: 'Self-registered via WhatsApp. Experience: ' + (data.experience || 'N/A')
          + ', Preferred Schedule: ' + (data.preferredSchedule || 'N/A')
      });
    } catch (inqErr) {
      // Inquiry creation is supplementary — don't fail the whole registration
      Logger.log('completeRegistration: Inquiry creation failed (non-fatal): ' + inqErr.message);
    }

    // Log the event
    logToSheet({
      studentName: data.name || '',
      phone: normalized,
      messageType: 'registration_complete',
      messageSent: 'Self-registration completed via WhatsApp',
      deliveryStatus: 'completed',
      whatsappMsgId: '',
      error: ''
    });

    // Clean up state
    deleteRegistrationState_(normalized);

    Logger.log('Registration completed: ' + (student.StudentID || '') + ' — ' + (data.name || '') + ' (' + normalized + ')');

    return { success: true, studentId: student.StudentID || '', error: '' };

  } catch (err) {
    Logger.log('completeRegistration error: ' + err.message);
    return { success: false, studentId: '', error: err.message };
  }
}

/**
 * Cancels an in-progress registration and cleans up state.
 *
 * @param {string} phone - E.164 formatted phone number
 */
function cancelRegistration(phone) {
  var normalized = formatPhoneNumber(phone);
  deleteRegistrationState_(normalized);

  logToSheet({
    studentName: '',
    phone: normalized,
    messageType: 'registration_cancelled',
    messageSent: 'Registration cancelled',
    deliveryStatus: 'cancelled',
    whatsappMsgId: '',
    error: ''
  });

  Logger.log('Registration cancelled: ' + normalized);
}

// ---------------------------------------------------------------------------
// Timeout cleanup — call from a time-driven trigger
// ---------------------------------------------------------------------------

/**
 * Cleans up stale registration states that have timed out (no activity for 24h).
 * Should be called periodically via a time-driven trigger (e.g. every hour).
 */
function cleanupStaleRegistrations() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('RegistrationState');
  if (!sheet || sheet.getLastRow() <= 1) return;

  var data = sheet.getDataRange().getValues();
  var now = new Date().getTime();
  var rowsToDelete = [];

  for (var i = 1; i < data.length; i++) {
    var updatedAt = data[i][4]; // UpdatedAt column
    if (updatedAt) {
      var updatedTime = new Date(updatedAt).getTime();
      if (now - updatedTime > REG_TIMEOUT_MS_) {
        rowsToDelete.push(i + 1); // 1-based sheet row

        // Send timeout notification
        var phone = String(data[i][0]);
        if (phone) {
          try {
            sendFreeForm(phone,
              'Your registration session has expired due to inactivity. '
              + 'Send "register" anytime to start again!');
          } catch (sendErr) {
            Logger.log('cleanupStaleRegistrations: Failed to notify ' + phone + ': ' + sendErr.message);
          }
        }
      }
    }
  }

  // Delete rows bottom-up to avoid index shifting
  for (var r = rowsToDelete.length - 1; r >= 0; r--) {
    sheet.deleteRow(rowsToDelete[r]);
  }

  if (rowsToDelete.length > 0) {
    Logger.log('cleanupStaleRegistrations: Removed ' + rowsToDelete.length + ' stale registration(s).');
  }
}

// ---------------------------------------------------------------------------
// Check if a phone is in an active registration flow
// ---------------------------------------------------------------------------

/**
 * Returns true if the phone number has an active (non-timed-out) registration.
 *
 * @param {string} phone - E.164 formatted phone number
 * @return {boolean}
 */
function isInRegistrationFlow(phone) {
  var normalized = formatPhoneNumber(phone);
  var state = getRegistrationState_(normalized);
  if (!state) return false;
  if (isRegistrationTimedOut_(state)) {
    deleteRegistrationState_(normalized);
    return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// RegistrationState sheet operations (private)
// ---------------------------------------------------------------------------

/**
 * Returns the registration state for a phone number, or null if not found.
 * @private
 * @param {string} phone - Normalized E.164 phone
 * @return {Object|null} { phone, currentStep, data, startedAt, updatedAt, rowIndex }
 */
function getRegistrationState_(phone) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('RegistrationState');
  if (!sheet || sheet.getLastRow() <= 1) return null;

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === phone) {
      var jsonData = {};
      try {
        jsonData = JSON.parse(String(data[i][2]) || '{}');
      } catch (e) {
        jsonData = {};
      }
      return {
        phone: phone,
        currentStep: String(data[i][1]),
        data: jsonData,
        startedAt: String(data[i][3]),
        updatedAt: String(data[i][4]),
        rowIndex: i + 1
      };
    }
  }
  return null;
}

/**
 * Creates a new registration state row.
 * @private
 * @param {string} phone
 * @param {string} step
 * @param {Object} data
 */
function createRegistrationState_(phone, step, data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = getOrCreateRegistrationSheet_(ss);
  var now = getIndiaTimestamp();

  sheet.appendRow([
    phone,
    step,
    JSON.stringify(data || {}),
    now,
    now
  ]);
}

/**
 * Updates an existing registration state row.
 * @private
 * @param {string} phone
 * @param {string} newStep
 * @param {Object} newData
 */
function updateRegistrationState_(phone, newStep, newData) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('RegistrationState');
  if (!sheet || sheet.getLastRow() <= 1) return;

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === phone) {
      var row = i + 1;
      sheet.getRange(row, 2).setValue(newStep);           // CurrentStep
      sheet.getRange(row, 3).setValue(JSON.stringify(newData || {})); // Data_JSON
      sheet.getRange(row, 5).setValue(getIndiaTimestamp()); // UpdatedAt
      return;
    }
  }

  // If row not found, create it
  createRegistrationState_(phone, newStep, newData);
}

/**
 * Deletes the registration state row for a phone number.
 * @private
 * @param {string} phone
 */
function deleteRegistrationState_(phone) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('RegistrationState');
  if (!sheet || sheet.getLastRow() <= 1) return;

  var data = sheet.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === phone) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
}

/**
 * Checks if a registration state has timed out (no update for 24h).
 * @private
 * @param {Object} state - Registration state object
 * @return {boolean}
 */
function isRegistrationTimedOut_(state) {
  if (!state || !state.updatedAt) return true;

  var updatedTime = new Date(state.updatedAt).getTime();
  var now = new Date().getTime();

  return (now - updatedTime) > REG_TIMEOUT_MS_;
}

/**
 * Ensures the RegistrationState tab exists with correct headers.
 * @private
 * @param {Spreadsheet} ss
 * @return {Sheet}
 */
function getOrCreateRegistrationSheet_(ss) {
  var sheet = ss.getSheetByName('RegistrationState');
  if (!sheet) {
    sheet = ss.insertSheet('RegistrationState');
    sheet.appendRow(['Phone', 'CurrentStep', 'Data_JSON', 'StartedAt', 'UpdatedAt']);
    sheet.getRange('A1:E1').setFontWeight('bold');
  }
  return sheet;
}

// ---------------------------------------------------------------------------
// Message helpers (private)
// ---------------------------------------------------------------------------

/**
 * Parses experience level from user input.
 * @private
 * @param {string} text
 * @return {string} Normalized experience level
 */
function parseExperience_(text) {
  var lower = text.toLowerCase().trim();

  if (lower === '1' || lower.indexOf('beginner') !== -1 || lower.indexOf('none') !== -1 || lower.indexOf('no experience') !== -1) {
    return 'Beginner';
  }
  if (lower === '2' || lower.indexOf('some') !== -1 || lower.indexOf('little') !== -1 || lower.indexOf('less than') !== -1) {
    return 'Some experience (< 1 year)';
  }
  if (lower === '3' || lower.indexOf('intermediate') !== -1 || lower.indexOf('1-3') !== -1 || lower.indexOf('few year') !== -1) {
    return 'Intermediate (1-3 years)';
  }
  if (lower === '4' || lower.indexOf('advanced') !== -1 || lower.indexOf('3+') !== -1 || lower.indexOf('expert') !== -1 || lower.indexOf('professional') !== -1) {
    return 'Advanced (3+ years)';
  }

  // Return as-is if we can't parse
  return text;
}

/**
 * Parses schedule preference from user input.
 * @private
 * @param {string} text
 * @return {string} Normalized schedule preference
 */
function parseSchedulePreference_(text) {
  var lower = text.toLowerCase().trim();

  if (lower === '1' || lower.indexOf('weekday morning') !== -1 || lower.indexOf('morning') !== -1) {
    return 'Weekday mornings';
  }
  if (lower === '2' || lower.indexOf('weekday afternoon') !== -1 || lower.indexOf('afternoon') !== -1) {
    return 'Weekday afternoons';
  }
  if (lower === '3' || lower.indexOf('weekday evening') !== -1 || lower.indexOf('evening') !== -1) {
    return 'Weekday evenings';
  }
  if (lower === '4' || lower.indexOf('weekend') !== -1 || lower.indexOf('saturday') !== -1 || lower.indexOf('sunday') !== -1) {
    return 'Weekends';
  }
  if (lower === '5' || lower.indexOf('flexible') !== -1 || lower.indexOf('any') !== -1 || lower.indexOf('no preference') !== -1) {
    return 'Flexible';
  }

  // Return as-is if we can't parse
  return text;
}

/**
 * Builds the confirmation summary message.
 * @private
 * @param {Object} data - Registration data collected so far
 * @return {string} Confirmation message
 */
function buildConfirmationMessage_(data) {
  var schoolName = getConfig('SCHOOL_NAME') || 'our academy';

  return 'Here is a summary of your registration for ' + schoolName + ':\n\n'
    + 'Name: ' + (data.name || 'N/A') + '\n'
    + 'Instrument: ' + (data.instrument || 'N/A') + '\n'
    + 'Age: ' + (data.age || 'N/A') + '\n'
    + 'Experience: ' + (data.experience || 'N/A') + '\n'
    + 'Preferred Schedule: ' + (data.preferredSchedule || 'N/A') + '\n\n'
    + 'Does everything look correct?\n\n'
    + 'Reply "Yes" to confirm or "No" to cancel.';
}

/**
 * Returns a context-appropriate prompt when resuming a registration.
 * @private
 * @param {string} step - Current step
 * @param {Object} data - Data collected so far
 * @return {string} Resume prompt
 */
function getResumePrompt_(step, data) {
  switch (step) {
    case 'WELCOME':
      return 'Reply with anything to get started!';
    case 'NAME':
      return 'What is your full name?';
    case 'INSTRUMENT':
      return 'Which instrument or course are you interested in?';
    case 'AGE':
      return 'How old are you?';
    case 'EXPERIENCE':
      return 'What is your experience level with ' + (data.instrument || 'your instrument') + '? (1-4)';
    case 'PREFERRED_SCHEDULE':
      return 'When would you prefer to attend classes? (1-5)';
    case 'CONFIRM':
      return buildConfirmationMessage_(data);
    default:
      return 'Reply with anything to continue.';
  }
}
