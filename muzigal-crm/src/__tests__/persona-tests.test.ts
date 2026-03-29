import { describe, it, expect } from 'vitest';
import { mockApi } from '../__mocks__/mockApi';

// ============================================================================
// COMPREHENSIVE PERSONA-BASED TEST SUITE
// Tests every workflow from each user's perspective
// ============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// PERSONA 1: RECEPTIONIST (Front desk — enrollment, student queries, scheduling)
// ─────────────────────────────────────────────────────────────────────────────

describe('Persona: Receptionist', () => {
  describe('Handle walk-in inquiry', () => {
    it('should create a new lead from a parent walking in', async () => {
      const res = await mockApi.createInquiry({
        Name: 'Ananya Verma', Phone: '+919876000222', Email: 'parent.verma@email.com',
        Instrument: 'Piano', AgeGroup: '3-6 years', Source: 'Walk-in',
      });
      expect(res.data.Status).toBe('New');
      expect(res.data.InquiryID).toBeDefined();
    });

    it('should schedule a demo class for the lead', async () => {
      const leads = await mockApi.listInquiries({ status: 'New' });
      const lead = leads.data[0];
      const res = await mockApi.updateInquiry(lead.InquiryID, {
        Status: 'Demo Scheduled', DemoDate: '2026-04-01', AssignedTo: 'Mr. Giri',
      });
      expect(res.data.Status).toBe('Demo Scheduled');
      expect(res.data.DemoDate).toBe('2026-04-01');
    });
  });

  describe('Look up student information', () => {
    it('should search students by name', async () => {
      const res = await mockApi.listStudents({ search: 'Aarav' });
      expect(res.data.length).toBeGreaterThanOrEqual(1);
      expect(res.data[0].Name).toContain('Aarav');
    });

    it('should search students by phone', async () => {
      const res = await mockApi.listStudents({ search: '9845708094' });
      expect(res.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should get full student details', async () => {
      const res = await mockApi.getStudent('S001');
      expect(res.data.Name).toBe('Aarav Krishnan');
      expect(res.data.Phone).toBeDefined();
      expect(res.data.Class).toBeDefined();
      expect(res.data.ParentName).toBeDefined();
    });
  });

  describe('Check class availability', () => {
    it('should list all active classes', async () => {
      const res = await mockApi.listClasses({ status: 'Active' });
      expect(res.data.length).toBeGreaterThan(0);
      res.data.forEach((cls: any) => expect(cls.Status).toBe('Active'));
    });

    it('should check if a class has capacity', async () => {
      const res = await mockApi.getClass('CLS001');
      const available = res.data.MaxStudents - res.data.CurrentStudents;
      expect(available).toBeGreaterThanOrEqual(0);
    });

    it('should filter classes by instrument', async () => {
      const res = await mockApi.listClasses({ instrument: 'Piano' });
      res.data.forEach((cls: any) => expect(cls.Instrument).toBe('Piano'));
    });
  });

  describe('Register a new student', () => {
    it('should create student record with all required fields', async () => {
      const res = await mockApi.createStudent({
        Name: 'Isha Patel', Phone: '+919888777666', Email: 'isha.parent@email.com',
        Class: 'Piano - Beginners', Instrument: 'Piano', Level: 'Beginners',
        ParentName: 'Deepak Patel', ParentPhone: '+919888777667',
        DOB: '2017-05-15', Notes: 'Referred by existing student',
      });
      expect(res.data.StudentID).toBeDefined();
      expect(res.data.Active).toBe(true);
      expect(res.data.EnrollmentDate).toBeDefined();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PERSONA 2: TEACHER (Cecil, Giri, Lakshmi — attendance, class management)
// ─────────────────────────────────────────────────────────────────────────────

describe('Persona: Teacher (Mr. Cecil)', () => {
  describe('View my classes', () => {
    it('should list classes assigned to Cecil', async () => {
      const res = await mockApi.listClasses({ teacher: 'Mr. Cecil' });
      expect(res.data.length).toBeGreaterThanOrEqual(2); // Guitar + Drums
      res.data.forEach((cls: any) => expect(cls.Teacher).toBe('Mr. Cecil'));
    });

    it('should see enrolled students in my class', async () => {
      const res = await mockApi.getClass('CLS001'); // Guitar - Grade 3
      expect(res.data.enrolledStudents).toBeDefined();
      expect(res.data.enrolledStudents.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Mark attendance', () => {
    it('should mark a student present', async () => {
      const res = await mockApi.markAttendance({
        StudentID: 'S001', ClassID: 'CLS001', Date: '2026-03-25',
        Status: 'Present', MarkedBy: 'Mr. Cecil',
      });
      expect(res.data.AttendanceID).toBeDefined();
      expect(res.data.Status).toBe('Present');
    });

    it('should mark a student absent', async () => {
      const res = await mockApi.markAttendance({
        StudentID: 'S005', ClassID: 'CLS001', Date: '2026-03-25',
        Status: 'Absent', MarkedBy: 'Mr. Cecil',
      });
      expect(res.data.Status).toBe('Absent');
    });

    it('should mark a student late', async () => {
      const res = await mockApi.markAttendance({
        StudentID: 'S005', ClassID: 'CLS001', Date: '2026-03-26',
        Status: 'Late', MarkedBy: 'Mr. Cecil',
      });
      expect(res.data.Status).toBe('Late');
    });

    it('should view attendance for a class on a date', async () => {
      const res = await mockApi.getAttendance('CLS001', '2026-03-23');
      expect(res.data.length).toBeGreaterThanOrEqual(1);
      res.data.forEach((a: any) => {
        expect(a.ClassID).toBe('CLS001');
        expect(['Present', 'Absent', 'Late']).toContain(a.Status);
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PERSONA 3: ACADEMY OWNER (Cecil & Giri — revenue, reports, all access)
// ─────────────────────────────────────────────────────────────────────────────

describe('Persona: Academy Owner (Cecil & Giri)', () => {
  describe('View dashboard overview', () => {
    it('should see total students, classes, and revenue', async () => {
      const res = await mockApi.dashboardStats();
      expect(res.data.students.total).toBeGreaterThan(0);
      expect(res.data.classes.active).toBeGreaterThan(0);
      expect(res.data.revenue.thisMonth).toBeGreaterThanOrEqual(0);
    });

    it('should see enrollment pipeline', async () => {
      const res = await mockApi.dashboardStats();
      expect(res.data.enrollment).toBeDefined();
      expect(res.data.enrollment.newInquiries).toBeGreaterThanOrEqual(0);
    });

    it('should see recent activity feed', async () => {
      const res = await mockApi.dashboardStats();
      expect(res.data.recentActivity.length).toBeGreaterThan(0);
      expect(res.data.recentActivity[0].type).toBeDefined();
      expect(res.data.recentActivity[0].message).toBeDefined();
    });
  });

  describe('Revenue tracking', () => {
    it('should view monthly revenue breakdown', async () => {
      const res = await mockApi.revenueReport('2026-01-01', '2026-03-31');
      expect(res.data.totalRevenue).toBeGreaterThan(0);
      expect(res.data.byMonth.length).toBeGreaterThanOrEqual(1);
    });

    it('should view revenue by payment method', async () => {
      const res = await mockApi.revenueReport('2026-01-01', '2026-03-31');
      expect(res.data.byMethod.length).toBeGreaterThanOrEqual(1);
      const methods = res.data.byMethod.map((m: any) => m.method);
      expect(methods).toContain('Razorpay');
    });

    it('should see pending payment total', async () => {
      const res = await mockApi.dashboardStats();
      expect(res.data.revenue.pending).toBeGreaterThan(0);
    });
  });

  describe('Student management', () => {
    it('should view all students', async () => {
      const res = await mockApi.listStudents();
      expect(res.data.length).toBeGreaterThanOrEqual(10);
    });

    it('should deactivate a student who leaves', async () => {
      const res = await mockApi.deactivateStudent('S007');
      expect(res.data.success).toBe(true);
    });

    it('should filter inactive students', async () => {
      const all = await mockApi.listStudents();
      const active = await mockApi.listStudents({ status: 'active' });
      expect(active.data.length).toBeLessThan(all.data.length);
    });
  });

  describe('Teacher oversight', () => {
    it('should view all teachers', async () => {
      const res = await mockApi.listTeachers();
      expect(res.data.length).toBe(3);
    });

    it('should add a new guest teacher', async () => {
      const res = await mockApi.createTeacher({
        Name: 'Rajesh Menon', Phone: '+919777888999', Email: 'rajesh@muzigal.com',
        Instruments: 'Tabla,Mrudangam', Availability: 'Sat-Sun 11:00-17:00',
      });
      expect(res.data.TeacherID).toBeDefined();
      expect(res.data.Status).toBe('Active');
    });
  });

  describe('Send WhatsApp broadcast', () => {
    it('should send holiday announcement to all students', async () => {
      const res = await mockApi.sendOverride(
        'all', 'all',
        'Muzigal will be closed on March 29 for Ugadi. Classes resume March 31.',
        'Cecil'
      );
      expect(res.sent).toBeGreaterThan(0);
      expect(res.status).toBe('ok');
    });

    it('should send class-specific message', async () => {
      const res = await mockApi.sendOverride(
        'class', 'Guitar - Grade 3',
        'Guitar Grade 3: Extra jam session this Saturday at 3 PM in Studio A!',
        'Cecil'
      );
      expect(res.status).toBe('ok');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PERSONA 4: PARENT (Public — enrollment, payment, schedule viewing)
// ─────────────────────────────────────────────────────────────────────────────

describe('Persona: Parent', () => {
  describe('Enroll child through website', () => {
    it('should submit enrollment form for a 5-year-old', async () => {
      const res = await mockApi.createInquiry({
        Name: 'Aanya Rao', Phone: '+919876111333', Email: 'rao.parent@email.com',
        Instrument: 'Violin', AgeGroup: '3-6 years', Source: 'Website',
      });
      expect(res.data.Status).toBe('New');
      expect(res.data.InquiryID).toBeDefined();
    });

    it('should submit enrollment form for an adult', async () => {
      const res = await mockApi.createInquiry({
        Name: 'Suresh Kumar', Phone: '+919876444555', Email: 'suresh.k@email.com',
        Instrument: 'Guitar', AgeGroup: 'Adult', Source: 'Website',
      });
      expect(res.data.Status).toBe('New');
    });
  });

  describe('Check payment status', () => {
    it('should view payment history for my child', async () => {
      const res = await mockApi.listPayments({ studentId: 'S001' });
      expect(res.data.length).toBeGreaterThanOrEqual(1);
      res.data.forEach((p: any) => expect(p.StudentID).toBe('S001'));
    });

    it('should see overdue payments', async () => {
      const res = await mockApi.pendingPayments();
      const overdue = res.data.filter((p: any) => p.Status === 'Overdue');
      expect(overdue.length).toBeGreaterThanOrEqual(1);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PERSONA 5: SYSTEM ADMINISTRATOR (Aldrin — config, health, deployment)
// ─────────────────────────────────────────────────────────────────────────────

describe('Persona: System Administrator (Aldrin)', () => {
  describe('System health monitoring', () => {
    it('should verify system is operational', async () => {
      const res = await mockApi.health();
      expect(res.status).toBe('ok');
      expect(res.triggerCount).toBe(2);
    });

    it('should view all config values', async () => {
      const res = await mockApi.getConfig();
      expect(res.config.ACADEMY_NAME).toBe('Muzigal');
      expect(res.config.TIMEZONE).toBe('Asia/Kolkata');
      expect(res.config.WHATSAPP_TOKEN).toBeDefined();
      expect(res.config.PHONE_NUMBER_ID).toBeDefined();
    });
  });

  describe('Configuration management', () => {
    it('should update daily send hour', async () => {
      await mockApi.setConfig('DAILY_SEND_HOUR', '9');
      const res = await mockApi.getConfig();
      expect(res.config.DAILY_SEND_HOUR).toBe('9');
      await mockApi.setConfig('DAILY_SEND_HOUR', '8'); // restore
    });

    it('should update school name', async () => {
      await mockApi.setConfig('SCHOOL_NAME', 'Muzigal Academy');
      const res = await mockApi.getConfig();
      expect(res.config.SCHOOL_NAME).toBe('Muzigal Academy');
      await mockApi.setConfig('SCHOOL_NAME', 'Muzigal'); // restore
    });
  });

  describe('WhatsApp integration test', () => {
    it('should send test message to verify WhatsApp works', async () => {
      const res = await mockApi.sendTest('+919845708094', 'System check from admin panel');
      expect(res.success).toBe(true);
      expect(res.messageId).toBeDefined();
    });
  });

  describe('Authentication', () => {
    it('should login as admin', async () => {
      const res = await mockApi.login('aldrin@atc.xyz:admin123');
      expect(res.data.user.role).toBe('admin');
      expect(res.data.user.email).toBe('aldrin@atc.xyz');
      expect(res.data.token).toBeDefined();
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CROSS-PERSONA: Integration workflows that span multiple personas
// ─────────────────────────────────────────────────────────────────────────────

describe('Cross-Persona: Full Student Lifecycle', () => {
  it('Parent enrolls → Receptionist schedules demo → Teacher runs trial → Owner converts → System notifies', async () => {
    // 1. Parent submits form
    const inquiry = await mockApi.createInquiry({
      Name: 'Lifecycle Test Student', Phone: '+919000111222', Email: 'lifecycle@test.com',
      Instrument: 'Drums', AgeGroup: '7+', Source: 'Website',
    });
    expect(inquiry.data.Status).toBe('New');

    // 2. Receptionist schedules demo
    await mockApi.updateInquiry(inquiry.data.InquiryID, {
      Status: 'Demo Scheduled', DemoDate: '2026-04-05', AssignedTo: 'Mr. Cecil',
    });

    // 3. Teacher runs trial
    await mockApi.updateInquiry(inquiry.data.InquiryID, { Status: 'Trial' });

    // 4. Owner converts to enrolled student
    const converted = await mockApi.convertInquiry(inquiry.data.InquiryID);
    expect(converted.data.inquiry.Status).toBe('Enrolled');
    const student = converted.data.student;
    expect(student.Active).toBe(true);

    // 5. Verify student in directory
    const students = await mockApi.listStudents({ search: 'Lifecycle' });
    expect(students.data.length).toBeGreaterThanOrEqual(1);

    // 6. Admin sends welcome WhatsApp
    const welcome = await mockApi.sendTest('+919000111222', 'Welcome to Muzigal! Your Drums classes start next week.');
    expect(welcome.success).toBe(true);

    // 7. First payment recorded
    const payment = await mockApi.recordPayment({
      StudentID: student.StudentID, Amount: 3500, Method: 'Razorpay',
      RazorpayRef: 'pay_lifecycle_001', Month: 'April 2026',
    });
    expect(payment.data.Status).toBe('Paid');

    // 8. First attendance marked
    const att = await mockApi.markAttendance({
      StudentID: student.StudentID, ClassID: 'CLS003', Date: '2026-04-07',
      Status: 'Present', MarkedBy: 'Mr. Cecil',
    });
    expect(att.data.Status).toBe('Present');

    // 9. Dashboard reflects new student
    const stats = await mockApi.dashboardStats();
    expect(stats.data.students.total).toBeGreaterThan(0);
  });
});

describe('Cross-Persona: Emergency Scenario', () => {
  it('Teacher sick → Owner updates schedule → System notifies all affected students', async () => {
    // 1. Owner checks Cecil's classes
    const cecilClasses = await mockApi.listClasses({ teacher: 'Mr. Cecil' });
    expect(cecilClasses.data.length).toBeGreaterThanOrEqual(2);

    // 2. Owner reassigns Guitar class to Giri
    await mockApi.updateClass('CLS001', { Teacher: 'Mr. Giri' });

    // 3. Owner sends targeted WhatsApp to Guitar students
    const msg = await mockApi.sendOverride(
      'class', 'Guitar - Grade 3',
      'Guitar Grade 3: Mr. Cecil is unwell today. Mr. Giri will take your class. Same time and studio.',
      'Giri'
    );
    expect(msg.status).toBe('ok');

    // 4. Owner cancels Drums class
    await mockApi.updateClass('CLS003', { Status: 'Cancelled' });

    // 5. Notify Drums students
    const cancelMsg = await mockApi.sendOverride(
      'class', 'Drums - Intermediate',
      'Drums Intermediate: Today\'s class has been cancelled due to teacher unavailability. We apologize for the inconvenience.',
      'Giri'
    );
    expect(cancelMsg.status).toBe('ok');

    // 6. Verify changes reflected
    const updated = await mockApi.getClass('CLS001');
    expect(updated.data.Teacher).toBe('Mr. Giri');
  });
});

describe('Cross-Persona: Month-End Billing', () => {
  it('System generates invoices → Owner reviews → Receptionist collects → Reminders sent for overdue', async () => {
    // 1. Check current pending payments
    const pending = await mockApi.pendingPayments();
    expect(pending.data.length).toBeGreaterThan(0);

    // 2. Record a cash payment collected at reception
    const cashPay = await mockApi.recordPayment({
      StudentID: 'S003', Amount: 3500, Method: 'Cash', Month: 'March 2026',
      Notes: 'Collected at front desk',
    });
    expect(cashPay.data.Status).toBe('Paid');

    // 3. Generate Razorpay link for overdue student
    const link = await mockApi.createPaymentLink('S010', 3500, 'March 2026 — Drums Intermediate');
    expect(link.data.shortUrl).toBeDefined();

    // 4. Send WhatsApp reminder with payment link
    const reminder = await mockApi.sendTest(
      '+919890123456',
      'Hi Riya, your March fee of Rs 3,500 for Drums is pending. Pay here: ' + link.data.shortUrl
    );
    expect(reminder.success).toBe(true);

    // 5. Check revenue report
    const revenue = await mockApi.revenueReport('2026-03-01', '2026-03-31');
    expect(revenue.data.totalRevenue).toBeGreaterThan(0);
  });
});
