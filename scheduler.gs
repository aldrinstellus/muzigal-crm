/**
 * scheduler.gs — Daily schedule notification sender
 *
 * Time-triggered function that runs each morning to send
 * today's class schedule to all active students.
 */

/**
 * Sends daily schedule notifications to all active students.
 * Called by the time-driven trigger at the configured hour.
 *
 * For each class that has active schedule entries today,
 * sends a personalized message to every active student in that class.
 */
function sendDailySchedule() {
  var today = getIndiaDate();
  Logger.log('Running daily schedule for: ' + today);

  // Get all schedule rows for today
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var scheduleSheet = ss.getSheetByName('Schedule');
  if (!scheduleSheet || scheduleSheet.getLastRow() <= 1) {
    Logger.log('No schedule data found. Exiting.');
    return;
  }

  var data = scheduleSheet.getDataRange().getValues();
  var todaySchedules = {}; // Grouped by class name

  for (var i = 1; i < data.length; i++) {
    var rowDate = formatDateValue_(data[i][5]);
    var status = String(data[i][7]);

    if (rowDate === today && status === 'Active') {
      var className = String(data[i][1]);
      if (!todaySchedules[className]) {
        todaySchedules[className] = [];
      }
      todaySchedules[className].push({
        scheduleId: data[i][0],
        className: className,
        subject: data[i][2],
        teacher: data[i][3],
        room: data[i][4],
        date: rowDate,
        time: String(data[i][6]),
        status: status,
        rowIndex: i + 1
      });
    }
  }

  var classNames = Object.keys(todaySchedules);

  if (classNames.length === 0) {
    Logger.log('No active classes scheduled for today (' + today + '). Nothing to send.');
    return;
  }

  Logger.log('Found ' + classNames.length + ' class(es) with schedules today.');

  var totalSent = 0;
  var totalFailed = 0;
  var allErrors = [];

  classNames.forEach(function(className) {
    var schedules = todaySchedules[className];
    var students = getStudentsByClass(className);

    if (students.length === 0) {
      Logger.log('No active students for class: ' + className + '. Skipping.');
      return;
    }

    Logger.log('Sending to ' + students.length + ' student(s) in ' + className
      + ' (' + schedules.length + ' class(es) today)');

    // For daily schedule, send one message per student covering all their classes today.
    // If there's only one class, send info about that class.
    // If multiple classes, compose a combined message.
    students.forEach(function(student) {
      if (schedules.length === 1) {
        // Single class today — straightforward
        var result = composeAndSend(student, schedules[0], 'daily_schedule');
        if (result.success) totalSent++; else {
          totalFailed++;
          allErrors.push(student.name + ': ' + result.error);
        }
      } else {
        // Multiple classes today — send combined daily summary
        var combinedSchedule = {
          className: className,
          subject: schedules.map(function(s) { return s.subject; }).join(', '),
          teacher: schedules.map(function(s) { return s.teacher; }).join(', '),
          room: schedules.map(function(s) { return s.room; }).join(', '),
          time: schedules.map(function(s) { return s.time; }).join(', '),
          date: today,
          status: 'Active'
        };

        var result = composeAndSend(student, combinedSchedule, 'daily_schedule');
        if (result.success) totalSent++; else {
          totalFailed++;
          allErrors.push(student.name + ': ' + result.error);
        }
      }

      // 200ms delay between students
      Utilities.sleep(200);
    });
  });

  Logger.log('Daily schedule complete. Sent: ' + totalSent + ', Failed: ' + totalFailed);

  // Send summary email
  sendSummaryEmail({
    subject: 'Daily Schedule Summary — ' + today + ' (' + totalSent + ' sent, ' + totalFailed + ' failed)',
    sent: totalSent,
    failed: totalFailed,
    errors: allErrors,
    details: 'Classes: ' + classNames.join(', ')
  });
}

/**
 * Manually trigger daily schedule for a specific date.
 * Useful for testing or re-sending.
 *
 * @param {string} [dateStr] - Date in YYYY-MM-DD format (defaults to today IST)
 */
function sendDailyScheduleForDate(dateStr) {
  // Temporarily override getIndiaDate if a custom date is provided
  if (dateStr) {
    var originalFn = getIndiaDate;
    // We can't easily override, so use a different approach:
    // Directly query for the given date
    sendDailyScheduleWithDate_(dateStr);
  } else {
    sendDailySchedule();
  }
}

/**
 * Internal: sends daily schedule for a specific date.
 * @private
 */
function sendDailyScheduleWithDate_(dateStr) {
  Logger.log('Running daily schedule for custom date: ' + dateStr);

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var scheduleSheet = ss.getSheetByName('Schedule');
  if (!scheduleSheet || scheduleSheet.getLastRow() <= 1) {
    Logger.log('No schedule data found.');
    return;
  }

  var data = scheduleSheet.getDataRange().getValues();
  var todaySchedules = {};

  for (var i = 1; i < data.length; i++) {
    var rowDate = formatDateValue_(data[i][5]);
    var status = String(data[i][7]);

    if (rowDate === dateStr && status === 'Active') {
      var className = String(data[i][1]);
      if (!todaySchedules[className]) {
        todaySchedules[className] = [];
      }
      todaySchedules[className].push({
        scheduleId: data[i][0],
        className: className,
        subject: data[i][2],
        teacher: data[i][3],
        room: data[i][4],
        date: rowDate,
        time: String(data[i][6]),
        status: status,
        rowIndex: i + 1
      });
    }
  }

  var classNames = Object.keys(todaySchedules);

  if (classNames.length === 0) {
    Logger.log('No active classes for ' + dateStr + '.');
    return;
  }

  var totalSent = 0;
  var totalFailed = 0;
  var allErrors = [];

  classNames.forEach(function(className) {
    var students = getStudentsByClass(className);
    var schedules = todaySchedules[className];

    students.forEach(function(student) {
      var schedule = schedules.length === 1 ? schedules[0] : {
        className: className,
        subject: schedules.map(function(s) { return s.subject; }).join(', '),
        teacher: schedules.map(function(s) { return s.teacher; }).join(', '),
        room: schedules.map(function(s) { return s.room; }).join(', '),
        time: schedules.map(function(s) { return s.time; }).join(', '),
        date: dateStr,
        status: 'Active'
      };

      var result = composeAndSend(student, schedule, 'daily_schedule');
      if (result.success) totalSent++; else {
        totalFailed++;
        allErrors.push(student.name + ': ' + result.error);
      }
      Utilities.sleep(200);
    });
  });

  Logger.log('Custom date schedule complete. Sent: ' + totalSent + ', Failed: ' + totalFailed);
}
