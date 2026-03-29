import { describe, it, expect } from 'vitest';
import { mockApi } from '../__mocks__/mockApi';

// ============================================================================
// MOCK API UNIT TESTS
// Tests all CRUD operations against the mock data layer
// ============================================================================

describe('Mock API — Students', () => {
  it('should list all students', async () => {
    const res = await mockApi.listStudents();
    expect(res.status).toBe('ok');
    expect(res.data.length).toBeGreaterThanOrEqual(10);
  });

  it('should filter students by class', async () => {
    const res = await mockApi.listStudents({ class: 'Guitar - Grade 3' });
    expect(res.data.every((s: any) => s.Class === 'Guitar - Grade 3')).toBe(true);
  });

  it('should filter active students only', async () => {
    const res = await mockApi.listStudents({ status: 'active' });
    expect(res.data.every((s: any) => s.Active === true)).toBe(true);
  });

  it('should search students by name', async () => {
    const res = await mockApi.listStudents({ search: 'priya' });
    expect(res.data.length).toBe(1);
    expect(res.data[0].Name).toBe('Priya Sharma');
  });

  it('should get a student by ID', async () => {
    const res = await mockApi.getStudent('S001');
    expect(res.data).not.toBeNull();
    expect(res.data.Name).toBe('Aarav Krishnan');
  });

  it('should create a new student', async () => {
    const res = await mockApi.createStudent({
      Name: 'Test Student', Phone: '+919999999999', Class: 'Guitar - Grade 3',
      Instrument: 'Guitar', Level: 'Grade 3',
    });
    expect(res.data.StudentID).toMatch(/^S\d+$/);
    expect(res.data.Active).toBe(true);
  });

  it('should deactivate a student', async () => {
    const res = await mockApi.deactivateStudent('S001');
    expect(res.data.success).toBe(true);
  });
});

describe('Mock API — Classes', () => {
  it('should list all classes', async () => {
    const res = await mockApi.listClasses();
    expect(res.status).toBe('ok');
    expect(res.data.length).toBeGreaterThanOrEqual(7);
  });

  it('should filter by instrument', async () => {
    const res = await mockApi.listClasses({ instrument: 'Guitar' });
    expect(res.data.every((c: any) => c.Instrument === 'Guitar')).toBe(true);
  });

  it('should get class with enrolled students', async () => {
    const res = await mockApi.getClass('CLS001');
    expect(res.data).not.toBeNull();
    expect(res.data.enrolledStudents).toBeDefined();
  });

  it('should create a new class', async () => {
    const res = await mockApi.createClass({
      Instrument: 'Ukulele', Level: 'Beginners', Name: 'Ukulele - Beginners',
      Teacher: 'Mr. Cecil', Room: 'Studio A', Day: 'Saturday', Time: '12:00',
      Duration: 45, MaxStudents: 6, Fee: 2500,
    });
    expect(res.data.ClassID).toMatch(/^CLS\d+$/);
  });
});

describe('Mock API — Teachers', () => {
  it('should list all teachers', async () => {
    const res = await mockApi.listTeachers();
    expect(res.data.length).toBe(3);
  });

  it('should filter by instrument', async () => {
    const res = await mockApi.listTeachers({ instrument: 'Guitar' });
    expect(res.data.length).toBeGreaterThanOrEqual(1);
    expect(res.data[0].Name).toBe('Cecil');
  });

  it('should create a teacher', async () => {
    const res = await mockApi.createTeacher({
      Name: 'Rajesh', Phone: '+919999888777', Email: 'rajesh@muzigal.com',
      Instruments: 'Tabla,Mrudangam', Availability: 'Sat-Sun 11:00-17:00',
    });
    expect(res.data.TeacherID).toMatch(/^T\d+$/);
  });
});

describe('Mock API — Enrollment Pipeline', () => {
  it('should list all inquiries', async () => {
    const res = await mockApi.listInquiries();
    expect(res.data.length).toBeGreaterThanOrEqual(5);
  });

  it('should filter by status', async () => {
    const res = await mockApi.listInquiries({ status: 'New' });
    expect(res.data.every((e: any) => e.Status === 'New')).toBe(true);
  });

  it('should create an inquiry', async () => {
    const res = await mockApi.createInquiry({
      Name: 'Test Lead', Phone: '+919111222333', Email: 'test@email.com',
      Instrument: 'Piano', AgeGroup: '7+', Source: 'Website',
    });
    expect(res.data.Status).toBe('New');
  });

  it('should convert inquiry to student', async () => {
    const res = await mockApi.convertInquiry('INQ003');
    expect(res.data.inquiry.Status).toBe('Enrolled');
    expect(res.data.student.StudentID).toMatch(/^S\d+$/);
  });
});

describe('Mock API — Payments', () => {
  it('should list all payments', async () => {
    const res = await mockApi.listPayments();
    expect(res.data.length).toBeGreaterThanOrEqual(10);
  });

  it('should filter by student', async () => {
    const res = await mockApi.listPayments({ studentId: 'S001' });
    expect(res.data.every((p: any) => p.StudentID === 'S001')).toBe(true);
  });

  it('should get pending payments', async () => {
    const res = await mockApi.pendingPayments();
    expect(res.data.every((p: any) => p.Status === 'Pending' || p.Status === 'Overdue')).toBe(true);
  });

  it('should record a payment', async () => {
    const res = await mockApi.recordPayment({
      StudentID: 'S005', Amount: 3500, Method: 'UPI', Month: 'March 2026',
    });
    expect(res.data.Status).toBe('Paid');
  });

  it('should create a payment link', async () => {
    const res = await mockApi.createPaymentLink('S003', 3500, 'March fee');
    expect(res.data.shortUrl).toContain('rzp.io');
  });
});

describe('Mock API — Attendance', () => {
  it('should get attendance for a class and date', async () => {
    const res = await mockApi.getAttendance('CLS001', '2026-03-23');
    expect(res.data.length).toBeGreaterThanOrEqual(1);
  });

  it('should mark attendance', async () => {
    const res = await mockApi.markAttendance({
      StudentID: 'S001', ClassID: 'CLS001', Date: '2026-03-24',
      Status: 'Present', MarkedBy: 'Mr. Cecil',
    });
    expect(res.data.AttendanceID).toMatch(/^ATT\d+$/);
  });
});

describe('Mock API — Reports & Dashboard', () => {
  it('should return dashboard stats', async () => {
    const res = await mockApi.dashboardStats();
    expect(res.data.students.total).toBe(10);
    expect(res.data.classes.total).toBe(7);
    expect(res.data.revenue.thisMonth).toBe(25000);
    expect(res.data.recentActivity.length).toBeGreaterThan(0);
  });

  it('should return revenue report', async () => {
    const res = await mockApi.revenueReport('2026-01-01', '2026-03-31');
    expect(res.data.totalRevenue).toBe(53500);
    expect(res.data.byMethod.length).toBe(3);
  });

  it('should return attendance report', async () => {
    const res = await mockApi.attendanceReport({});
    expect(res.data.attendanceRate).toBe(82);
  });

  it('should return enrollment report', async () => {
    const res = await mockApi.enrollmentReport();
    expect(res.data.total).toBe(5);
    expect(res.data.byStatus.New).toBe(2);
  });
});

describe('Mock API — Config & Health', () => {
  it('should return config', async () => {
    const res = await mockApi.getConfig();
    expect(res.config.ACADEMY_NAME).toBe('Muzigal');
    expect(res.config.TIMEZONE).toBe('Asia/Kolkata');
  });

  it('should update config', async () => {
    const res = await mockApi.setConfig('SCHOOL_NAME', 'Muzigal Academy');
    expect(res.message).toContain('updated');
  });

  it('should return health status', async () => {
    const res = await mockApi.health();
    expect(res.status).toBe('ok');
    expect(res.triggerCount).toBe(2);
  });
});

describe('Mock API — WhatsApp', () => {
  it('should send test message', async () => {
    const res = await mockApi.sendTest('+919845708094', 'Test from CRM');
    expect(res.success).toBe(true);
  });

  it('should send override to all', async () => {
    const res = await mockApi.sendOverride('all', 'all', 'Academy closed tomorrow', 'Admin');
    expect(res.sent).toBeGreaterThan(0);
  });
});

describe('Mock API — Auth', () => {
  it('should login and return JWT', async () => {
    const res = await mockApi.login('aldrin@atc.xyz:admin123');
    expect(res.data.token).toContain('.');
    expect(res.data.user.role).toBe('admin');
    expect(res.data.user.email).toBe('aldrin@atc.xyz');
  });
});
