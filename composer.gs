/**
 * composer.gs — Message composition with Claude API integration
 *
 * Builds context-aware messages for WhatsApp delivery.
 * Uses Claude API when USE_CLAUDE=TRUE, falls back to templates otherwise.
 */

/**
 * Composes a notification message for a student.
 *
 * @param {Object} student - { name, phone, className }
 * @param {Object} scheduleRow - { subject, teacher, room, date, time, status }
 * @param {string} changeType - 'daily_schedule'|'teacher_change'|'room_change'|'cancellation'|'reschedule'|'time_change'|'date_change'|'override'
 * @param {string} [oldValue] - Previous value (for change notifications)
 * @param {string} [newValue] - New value (for change notifications)
 * @return {string} Composed message text (plain text, no markdown, under 1024 chars)
 */
function composeMessage(student, scheduleRow, changeType, oldValue, newValue) {
  var useClaude = String(getConfig('USE_CLAUDE')).toUpperCase() === 'TRUE';

  if (useClaude) {
    try {
      var prompt = buildClaudePrompt(student, scheduleRow, changeType, oldValue, newValue);
      var claudeMessage = callClaudeAPI(prompt.system, prompt.user);
      if (claudeMessage) {
        // Enforce plain text: strip any markdown artifacts
        claudeMessage = claudeMessage.replace(/[*_~`#]/g, '');
        // Enforce max length
        if (claudeMessage.length > 1024) {
          claudeMessage = claudeMessage.substring(0, 1021) + '...';
        }
        return claudeMessage;
      }
    } catch (e) {
      Logger.log('Claude API error, falling back to template: ' + e.message);
    }
  }

  // Fallback: hardcoded templates
  return buildFallbackMessage_(student, scheduleRow, changeType, oldValue, newValue);
}

/**
 * Builds Claude API prompt (system + user messages).
 *
 * @param {Object} student
 * @param {Object} schedule
 * @param {string} changeType
 * @param {string} [oldValue]
 * @param {string} [newValue]
 * @return {{ system: string, user: string }}
 */
function buildClaudePrompt(student, schedule, changeType, oldValue, newValue) {
  var schoolName = getConfig('SCHOOL_NAME') || 'School';

  var system = 'You are a school notification assistant for ' + schoolName + '. '
    + 'Write brief, warm WhatsApp messages to students about their class schedule. '
    + 'Plain text only. No markdown. No asterisks. No bold. No bullet points. '
    + 'Under 160 characters ideally, never exceed 300 characters. '
    + 'Always start with the student\'s first name. '
    + 'Be direct and include all essential details (subject, time, room, teacher as relevant). '
    + 'End with a friendly but professional tone.';

  var context = {
    type: changeType,
    student_name: student.name,
    class: student.className,
    school_name: schoolName
  };

  if (schedule) {
    context.subject = schedule.subject;
    context.teacher = schedule.teacher;
    context.room = schedule.room;
    context.time = schedule.time;
    context.date = schedule.date;
    context.status = schedule.status;
  }

  if (oldValue) context.old_value = oldValue;
  if (newValue) context.new_value = newValue;

  var user = 'Generate a WhatsApp notification message for this context:\n'
    + JSON.stringify(context, null, 2);

  return { system: system, user: user };
}

/**
 * Calls the Anthropic Claude API.
 *
 * @param {string} systemPrompt - System message
 * @param {string} userMessage - User message
 * @return {string|null} Claude's response text, or null on error
 */
function callClaudeAPI(systemPrompt, userMessage) {
  var apiKey = getConfig('CLAUDE_API_KEY');
  if (!apiKey || apiKey === '(placeholder)') {
    Logger.log('Claude API key not configured.');
    return null;
  }

  var url = 'https://api.anthropic.com/v1/messages';

  var payload = {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    system: systemPrompt,
    messages: [
      { role: 'user', content: userMessage }
    ]
  };

  var options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(url, options);
  var code = response.getResponseCode();
  var body = response.getContentText();

  if (code !== 200) {
    Logger.log('Claude API error (HTTP ' + code + '): ' + body);
    return null;
  }

  try {
    var parsed = JSON.parse(body);
    if (parsed.content && parsed.content.length > 0 && parsed.content[0].text) {
      return parsed.content[0].text.trim();
    }
  } catch (e) {
    Logger.log('Claude API response parse error: ' + e.message);
  }

  return null;
}

/**
 * Builds a fallback message using hardcoded templates (no Claude).
 * @private
 */
function buildFallbackMessage_(student, schedule, changeType, oldValue, newValue) {
  var firstName = student.name.split(' ')[0];
  var schoolName = getConfig('SCHOOL_NAME') || 'School';

  switch (changeType) {
    case 'daily_schedule':
      return firstName + ', your ' + schedule.subject + ' class is today at '
        + schedule.time + ' in ' + schedule.room + ' with ' + schedule.teacher
        + '. See you there! - ' + schoolName;

    case 'teacher_change':
      return firstName + ', heads up! Your ' + schedule.subject + ' teacher has changed from '
        + (oldValue || 'previous teacher') + ' to ' + (newValue || schedule.teacher)
        + '. Class is still at ' + schedule.time + ' in ' + schedule.room
        + '. - ' + schoolName;

    case 'room_change':
      return firstName + ', room change! Your ' + schedule.subject + ' class has moved from '
        + (oldValue || 'old room') + ' to ' + (newValue || schedule.room)
        + '. Same time: ' + schedule.time + ' with ' + schedule.teacher
        + '. - ' + schoolName;

    case 'time_change':
      return firstName + ', time change for ' + schedule.subject + '! '
        + 'New time: ' + (newValue || schedule.time) + ' (was ' + (oldValue || 'earlier') + '). '
        + 'Room: ' + schedule.room + ', Teacher: ' + schedule.teacher
        + '. - ' + schoolName;

    case 'date_change':
      return firstName + ', your ' + schedule.subject + ' class has been moved to '
        + (newValue || schedule.date) + ' (was ' + (oldValue || 'original date') + '). '
        + 'Time: ' + schedule.time + ', Room: ' + schedule.room
        + '. - ' + schoolName;

    case 'cancellation':
      return firstName + ', your ' + schedule.subject + ' class on '
        + schedule.date + ' at ' + schedule.time + ' has been cancelled. '
        + 'No need to come to ' + schedule.room + '. - ' + schoolName;

    case 'reschedule':
      return firstName + ', your ' + schedule.subject + ' class has been rescheduled. '
        + 'Please check with your teacher ' + schedule.teacher + ' for the new timing. '
        + '- ' + schoolName;

    case 'override':
      // For override messages, the message is passed directly
      return newValue || ('Hi ' + firstName + ', please check the latest update from ' + schoolName + '.');

    default:
      return firstName + ', there has been an update to your ' + (schedule ? schedule.subject : '')
        + ' class. Please check with your teacher for details. - ' + schoolName;
  }
}
