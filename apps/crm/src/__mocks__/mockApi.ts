// ============================================================================
// MUZIGAL CRM — Mock API Layer
// Intercepts api calls and returns mock data for development/testing
// Enable by setting VITE_USE_MOCK=true in .env.local
// ============================================================================

import {
  mockStudents, mockClasses, mockTeachers, mockPayments,
  mockEnrollment, mockAttendance, mockDashboardStats, mockConfig,
} from './mockData';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// Simulate API latency
const LATENCY = 300;

// Mutable copies for CRUD operations
let students = [...mockStudents];
let classes = [...mockClasses];
let teachers = [...mockTeachers];
let payments = [...mockPayments];
let enrollment = [...mockEnrollment];
let attendance = [...mockAttendance];

function ok<T>(data: T) {
  return { status: 'ok', data };
}

function nextId(items: { [key: string]: any }[], prefix: string): string {
  const nums = items.map(i => {
    const val = Object.values(i)[0] as string;
    const n = parseInt(val.replace(prefix, ''), 10);
    return isNaN(n) ? 0 : n;
  });
  return `${prefix}${String(Math.max(0, ...nums) + 1).padStart(3, '0')}`;
}

export const mockApi = {
  // --- Auth ---
  login: async (credentials: string) => {
    await delay(LATENCY);
    // Parse email:password format
    const [email, password] = credentials.split(':');
    // Mock users (in production this checks Google Sheet)
    const users: Record<string, { password: string; name: string; role: string }> = {
      'aldrin@atc.xyz': { password: 'admin123', name: 'Aldrin Stellus', role: 'admin' },
      'cecil@muzigal.com': { password: 'cecil123', name: 'Cecil', role: 'admin' },
      'giri@muzigal.com': { password: 'giri123', name: 'Giri', role: 'admin' },
      'demo@zoo.crm': { password: 'demo', name: 'Demo User', role: 'admin' },
    };
    const user = users[email];
    if (!user || user.password !== password) {
      return { status: 'error', message: 'Invalid email or password.' };
    }
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ email, name: user.name, role: user.role, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 }));
    const fakeJwt = `${header}.${payload}.mock-signature`;
    return { status: 'ok', data: { token: fakeJwt, user: { email, name: user.name, role: user.role } } };
  },

  // --- Students ---
  listStudents: async (filters?: Record<string, string>) => {
    await delay(LATENCY);
    let result = [...students];
    if (filters?.class) result = result.filter(s => s.Class === filters.class);
    if (filters?.instrument) result = result.filter(s => s.Instrument === filters.instrument);
    if (filters?.status === 'active') result = result.filter(s => s.Active);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(s => s.Name.toLowerCase().includes(q) || s.Phone.includes(q));
    }
    return ok(result);
  },
  getStudent: async (id: string) => {
    await delay(LATENCY);
    return ok(students.find(s => s.StudentID === id) || null);
  },
  createStudent: async (data: any) => {
    await delay(LATENCY);
    const newStudent = { StudentID: nextId(students, 'S'), ...data, Active: true, EnrollmentDate: new Date().toISOString().split('T')[0] };
    students.push(newStudent);
    return ok(newStudent);
  },
  updateStudent: async (id: string, data: any) => {
    await delay(LATENCY);
    const idx = students.findIndex(s => s.StudentID === id);
    if (idx >= 0) { students[idx] = { ...students[idx], ...data }; return ok(students[idx]); }
    return { status: 'error', message: 'Student not found' };
  },
  deactivateStudent: async (id: string) => {
    await delay(LATENCY);
    const idx = students.findIndex(s => s.StudentID === id);
    if (idx >= 0) { students[idx].Active = false; return ok({ success: true }); }
    return { status: 'error', message: 'Student not found' };
  },

  // --- Classes ---
  listClasses: async (filters?: Record<string, string>) => {
    await delay(LATENCY);
    let result = [...classes];
    if (filters?.instrument) result = result.filter(c => c.Instrument === filters.instrument);
    if (filters?.teacher) result = result.filter(c => c.Teacher === filters.teacher);
    if (filters?.status) result = result.filter(c => c.Status === filters.status);
    return ok(result);
  },
  getClass: async (id: string) => {
    await delay(LATENCY);
    const cls = classes.find(c => c.ClassID === id);
    return ok(cls ? { ...cls, enrolledStudents: students.filter(s => s.Class === cls.Name) } : null);
  },
  createClass: async (data: any) => {
    await delay(LATENCY);
    const newClass = { ClassID: nextId(classes, 'CLS'), ...data, CurrentStudents: 0, Status: 'Active' };
    classes.push(newClass);
    return ok(newClass);
  },
  updateClass: async (id: string, data: any) => {
    await delay(LATENCY);
    const idx = classes.findIndex(c => c.ClassID === id);
    if (idx >= 0) { classes[idx] = { ...classes[idx], ...data }; return ok(classes[idx]); }
    return { status: 'error', message: 'Class not found' };
  },

  // --- Teachers ---
  listTeachers: async (filters?: Record<string, string>) => {
    await delay(LATENCY);
    let result = [...teachers];
    if (filters?.instrument) result = result.filter(t => t.Instruments.includes(filters.instrument!));
    if (filters?.status) result = result.filter(t => t.Status === filters.status);
    return ok(result);
  },
  createTeacher: async (data: any) => {
    await delay(LATENCY);
    const newTeacher = { TeacherID: nextId(teachers, 'T'), ...data, Status: 'Active', JoinDate: new Date().toISOString().split('T')[0] };
    teachers.push(newTeacher);
    return ok(newTeacher);
  },
  updateTeacher: async (id: string, data: any) => {
    await delay(LATENCY);
    const idx = teachers.findIndex(t => t.TeacherID === id);
    if (idx >= 0) { teachers[idx] = { ...teachers[idx], ...data }; return ok(teachers[idx]); }
    return { status: 'error', message: 'Teacher not found' };
  },

  // --- Enrollment ---
  listInquiries: async (filters?: Record<string, string>) => {
    await delay(LATENCY);
    let result = [...enrollment];
    if (filters?.status) result = result.filter(e => e.Status === filters.status);
    if (filters?.source) result = result.filter(e => e.Source === filters.source);
    return ok(result);
  },
  createInquiry: async (data: any) => {
    await delay(LATENCY);
    const newInquiry = { InquiryID: nextId(enrollment, 'INQ'), ...data, Status: 'New', CreatedAt: new Date().toISOString() };
    enrollment.push(newInquiry);
    return ok(newInquiry);
  },
  updateInquiry: async (id: string, data: any) => {
    await delay(LATENCY);
    const idx = enrollment.findIndex(e => e.InquiryID === id);
    if (idx >= 0) { enrollment[idx] = { ...enrollment[idx], ...data }; return ok(enrollment[idx]); }
    return { status: 'error', message: 'Inquiry not found' };
  },
  convertInquiry: async (id: string) => {
    await delay(LATENCY);
    const inquiry = enrollment.find(e => e.InquiryID === id);
    if (!inquiry) return { status: 'error', message: 'Inquiry not found' };
    inquiry.Status = 'Enrolled';
    const newStudent = { StudentID: nextId(students, 'S'), Name: inquiry.Name, Phone: inquiry.Phone, Email: inquiry.Email, Class: `${inquiry.Instrument} - Beginners`, Instrument: inquiry.Instrument, Level: 'Beginners', Active: true, ParentName: '', ParentPhone: '', EnrollmentDate: new Date().toISOString().split('T')[0], DOB: '', Notes: `Converted from inquiry ${id}` };
    students.push(newStudent);
    return ok({ inquiry, student: newStudent });
  },

  // --- Payments ---
  listPayments: async (filters?: Record<string, string>) => {
    await delay(LATENCY);
    let result = [...payments];
    if (filters?.studentId) result = result.filter(p => p.StudentID === filters.studentId);
    if (filters?.status) result = result.filter(p => p.Status === filters.status);
    if (filters?.month) result = result.filter(p => p.Month === filters.month);
    return ok(result);
  },
  pendingPayments: async () => {
    await delay(LATENCY);
    return ok(payments.filter(p => p.Status === 'Pending' || p.Status === 'Overdue'));
  },
  recordPayment: async (data: any) => {
    await delay(LATENCY);
    const newPayment = { PaymentID: nextId(payments, 'PAY'), ...data, Date: new Date().toISOString().split('T')[0], Status: 'Paid' };
    payments.push(newPayment);
    return ok(newPayment);
  },
  createPaymentLink: async (_studentId: string, amount: number, description: string) => {
    await delay(LATENCY);
    return ok({ shortUrl: `https://rzp.io/i/mock_${Date.now()}`, paymentLinkId: `plink_mock_${Date.now()}` });
  },

  // --- Attendance ---
  getAttendance: async (classId: string, date: string) => {
    await delay(LATENCY);
    return ok(attendance.filter(a => a.ClassID === classId && a.Date === date));
  },
  markAttendance: async (data: any) => {
    await delay(LATENCY);
    const newRecord = { AttendanceID: nextId(attendance, 'ATT'), ...data };
    attendance.push(newRecord);
    return ok(newRecord);
  },

  // --- Reports ---
  dashboardStats: async () => {
    await delay(LATENCY);
    return ok(mockDashboardStats);
  },
  revenueReport: async (_start: string, _end: string) => {
    await delay(LATENCY);
    return ok({
      totalRevenue: 53500,
      paymentCount: 11,
      byMonth: [
        { month: 'Jan 2026', amount: 24500 },
        { month: 'Feb 2026', amount: 28500 },
        { month: 'Mar 2026', amount: 25000 },
      ],
      byMethod: [
        { method: 'Razorpay', amount: 18000 },
        { method: 'UPI', amount: 11000 },
        { method: 'Cash', amount: 7000 },
      ],
    });
  },
  attendanceReport: async (_filters: Record<string, string>) => {
    await delay(LATENCY);
    return ok({ totalClasses: 20, present: 16, absent: 3, late: 1, attendanceRate: 82 });
  },
  enrollmentReport: async () => {
    await delay(LATENCY);
    return ok({
      total: 5,
      byStatus: { New: 2, 'Demo Scheduled': 1, Trial: 1, Enrolled: 0, Lost: 1 },
      conversionRate: 0,
      bySource: { Website: 3, 'Walk-in': 1, Referral: 1 },
    });
  },

  // --- Config ---
  getConfig: async () => {
    await delay(LATENCY);
    return { status: 'ok', config: mockConfig };
  },
  setConfig: async (key: string, value: string) => {
    await delay(LATENCY);
    (mockConfig as any)[key] = value;
    return { status: 'ok', message: `Config ${key} updated` };
  },

  // --- WhatsApp ---
  sendTest: async (phone: string, message: string) => {
    await delay(LATENCY);
    console.log(`[MOCK] WhatsApp test to ${phone}: ${message}`);
    return { status: 'ok', success: true, message: 'Mock: Test message sent', messageId: `mock_wamid_${Date.now()}` };
  },
  sendOverride: async (targetType: string, targetValue: string, message: string, sentBy: string) => {
    await delay(LATENCY);
    console.log(`[MOCK] Override ${targetType}/${targetValue} by ${sentBy}: ${message}`);
    return { status: 'ok', success: true, sent: targetType === 'all' ? students.filter(s => s.Active).length : 1, failed: 0 };
  },

  // --- Health ---
  health: async () => {
    await delay(LATENCY);
    return { status: 'ok', timestamp: new Date().toISOString(), triggerCount: 2, mode: 'mock' };
  },
};
