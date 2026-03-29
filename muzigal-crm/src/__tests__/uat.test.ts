import { describe, it, expect } from 'vitest';
import { mockApi } from '../__mocks__/mockApi';

// ============================================================================
// USER ACCEPTANCE TESTS (UAT)
// End-to-end business workflow scenarios for Muzigal CRM
// ============================================================================

describe('UAT: Enrollment Workflow', () => {
  it('Scenario 1: New lead from website → Demo → Trial → Enrolled student', async () => {
    // Step 1: Prospective student fills enrollment form on website
    const inquiry = await mockApi.createInquiry({
      Name: 'Sita Ramani', Phone: '+919876000111', Email: 'sita@email.com',
      Instrument: 'Piano', AgeGroup: '7+', Source: 'Website',
    });
    expect(inquiry.data.Status).toBe('New');
    expect(inquiry.data.InquiryID).toBeDefined();

    // Step 2: Receptionist schedules demo class
    const updated = await mockApi.updateInquiry(inquiry.data.InquiryID, {
      Status: 'Demo Scheduled', DemoDate: '2026-03-28', AssignedTo: 'Mr. Giri',
    });
    expect(updated.data.Status).toBe('Demo Scheduled');

    // Step 3: After demo, student starts trial
    await mockApi.updateInquiry(inquiry.data.InquiryID, { Status: 'Trial' });

    // Step 4: Convert to enrolled student
    const converted = await mockApi.convertInquiry(inquiry.data.InquiryID);
    expect(converted.data.inquiry.Status).toBe('Enrolled');
    expect(converted.data.student.Name).toBe('Sita Ramani');
    expect(converted.data.student.Active).toBe(true);

    // Step 5: Verify student appears in student list
    const students = await mockApi.listStudents({ search: 'sita' });
    expect(students.data.length).toBeGreaterThanOrEqual(1);
  });

  it('Scenario 2: Lead goes cold → marked as Lost', async () => {
    const inquiry = await mockApi.createInquiry({
      Name: 'Cold Lead', Phone: '+919876111222', Email: 'cold@email.com',
      Instrument: 'Drums', AgeGroup: 'Adult', Source: 'Walk-in',
    });

    // Schedule demo
    await mockApi.updateInquiry(inquiry.data.InquiryID, { Status: 'Demo Scheduled', DemoDate: '2026-03-20' });

    // No response — mark as lost
    const lost = await mockApi.updateInquiry(inquiry.data.InquiryID, { Status: 'Lost', Notes: 'No response after demo' });
    expect(lost.data.Status).toBe('Lost');
  });
});

describe('UAT: Payment Workflow', () => {
  it('Scenario 3: Monthly fee collection cycle', async () => {
    // Step 1: Check pending payments
    const pending = await mockApi.pendingPayments();
    const initialPending = pending.data.length;
    expect(initialPending).toBeGreaterThan(0);

    // Step 2: Student pays via Razorpay
    const payment = await mockApi.recordPayment({
      StudentID: 'S005', Amount: 3500, Method: 'Razorpay',
      RazorpayRef: 'pay_test_abc123', Month: 'March 2026',
    });
    expect(payment.data.Status).toBe('Paid');
    expect(payment.data.PaymentID).toBeDefined();

    // Step 3: Generate payment link for overdue student
    const link = await mockApi.createPaymentLink('S003', 3500, 'March 2026 fee — Guitar Grade 3');
    expect(link.data.shortUrl).toBeDefined();

    // Step 4: Send WhatsApp reminder to overdue student
    const reminder = await mockApi.sendTest('+919823456789', 'Hi Arjun, your March fee of ₹3,500 is overdue. Pay here: ' + link.data.shortUrl);
    expect(reminder.success).toBe(true);
  });
});

describe('UAT: Class Management Workflow', () => {
  it('Scenario 4: Create a new class, assign teacher, enroll students', async () => {
    // Step 1: Create new class
    const cls = await mockApi.createClass({
      Instrument: 'Ukulele', Level: 'Beginners', Name: 'Ukulele - Beginners',
      Teacher: 'Mr. Cecil', Room: 'Studio A', Day: 'Saturday',
      Time: '12:00', Duration: 45, MaxStudents: 6, Fee: 2500,
    });
    expect(cls.data.ClassID).toBeDefined();

    // Step 2: Verify it appears in class list
    const classes = await mockApi.listClasses({ instrument: 'Ukulele' });
    expect(classes.data.length).toBeGreaterThanOrEqual(1);

    // Step 3: Create student for this class
    await mockApi.createStudent({
      Name: 'New Uke Student', Phone: '+919876222333', Class: 'Ukulele - Beginners',
      Instrument: 'Ukulele', Level: 'Beginners',
    });

    // Step 4: Verify class shows in teacher's load
    const teachers = await mockApi.listTeachers({ instrument: 'Ukulele' });
    expect(teachers.data.length).toBeGreaterThanOrEqual(1);
  });
});

describe('UAT: Attendance Workflow', () => {
  it('Scenario 5: Teacher marks attendance for a class', async () => {
    // Step 1: Mark attendance for Guitar - Grade 3
    const att1 = await mockApi.markAttendance({
      StudentID: 'S001', ClassID: 'CLS001', Date: '2026-03-24',
      Status: 'Present', MarkedBy: 'Mr. Cecil',
    });
    expect(att1.data.AttendanceID).toBeDefined();

    const att2 = await mockApi.markAttendance({
      StudentID: 'S005', ClassID: 'CLS001', Date: '2026-03-24',
      Status: 'Absent', MarkedBy: 'Mr. Cecil',
    });
    expect(att2.data.Status).toBe('Absent');

    // Step 2: Verify attendance records exist
    const records = await mockApi.getAttendance('CLS001', '2026-03-24');
    expect(records.data.length).toBeGreaterThanOrEqual(2);

    // Step 3: Check attendance report
    const report = await mockApi.attendanceReport({ classId: 'CLS001' });
    expect(report.data.attendanceRate).toBeDefined();
  });
});

describe('UAT: Dashboard & Reports', () => {
  it('Scenario 6: Admin views dashboard with real-time stats', async () => {
    const stats = await mockApi.dashboardStats();

    // Student metrics
    expect(stats.data.students.total).toBeGreaterThan(0);
    expect(stats.data.students.active).toBeLessThanOrEqual(stats.data.students.total);

    // Revenue metrics
    expect(stats.data.revenue.thisMonth).toBeGreaterThanOrEqual(0);

    // Enrollment funnel
    expect(stats.data.enrollment.newInquiries).toBeGreaterThanOrEqual(0);

    // Recent activity should have entries
    expect(stats.data.recentActivity.length).toBeGreaterThan(0);
    expect(stats.data.recentActivity[0].type).toBeDefined();
    expect(stats.data.recentActivity[0].message).toBeDefined();
  });

  it('Scenario 7: Revenue report for a quarter', async () => {
    const report = await mockApi.revenueReport('2026-01-01', '2026-03-31');
    expect(report.data.totalRevenue).toBeGreaterThan(0);
    expect(report.data.byMonth.length).toBeGreaterThanOrEqual(1);
    expect(report.data.byMethod.length).toBeGreaterThanOrEqual(1);
  });
});

describe('UAT: WhatsApp Integration', () => {
  it('Scenario 8: Send emergency broadcast to all students', async () => {
    const result = await mockApi.sendOverride(
      'all', 'all',
      'Muzigal will be closed tomorrow (March 25) for a local holiday. Classes resume Wednesday.',
      'Admin'
    );
    expect(result.sent).toBeGreaterThan(0);
    expect(result.status).toBe('ok');
  });

  it('Scenario 9: Send test WhatsApp to verify system', async () => {
    const result = await mockApi.sendTest('+919845708094', 'CRM test: If you receive this, WhatsApp integration is working.');
    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });
});

describe('UAT: System Health & Config', () => {
  it('Scenario 10: Health check returns operational status', async () => {
    const health = await mockApi.health();
    expect(health.status).toBe('ok');
    expect(health.triggerCount).toBe(2);
  });

  it('Scenario 11: Config management', async () => {
    // Read config
    const config = await mockApi.getConfig();
    expect(config.config.ACADEMY_NAME).toBe('Muzigal');
    expect(config.config.TIMEZONE).toBe('Asia/Kolkata');

    // Update config
    await mockApi.setConfig('DAILY_SEND_HOUR', '9');
    const updated = await mockApi.getConfig();
    expect(updated.config.DAILY_SEND_HOUR).toBe('9');

    // Restore
    await mockApi.setConfig('DAILY_SEND_HOUR', '8');
  });
});
