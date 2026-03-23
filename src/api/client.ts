const GAS_URL = import.meta.env.VITE_GAS_URL || '';
const PROXY_URL = import.meta.env.VITE_PROXY_URL || '/api';

interface ApiResponse<T = unknown> {
  status: string;
  data?: T;
  config?: Record<string, string>;
  success?: boolean;
  message?: string;
}

function getToken(): string | null {
  return localStorage.getItem('muzigal_token');
}

export function setToken(token: string) {
  localStorage.setItem('muzigal_token', token);
}

export function clearToken() {
  localStorage.removeItem('muzigal_token');
}

async function request<T>(
  action: string,
  method: 'GET' | 'POST' = 'GET',
  params?: Record<string, string>,
  body?: Record<string, unknown>
): Promise<ApiResponse<T>> {
  const url = new URL(GAS_URL || PROXY_URL);

  if (method === 'GET') {
    url.searchParams.set('action', action);
    if (params) {
      Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }
    const token = getToken();
    if (token) url.searchParams.set('token', token);
  }

  const options: RequestInit = { method };

  if (method === 'POST') {
    const secret = import.meta.env.VITE_WEBHOOK_SECRET || '';
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify({
      secret,
      action,
      token: getToken(),
      ...body,
    });
  }

  const res = await fetch(url.toString(), options);
  const text = await res.text();

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Invalid API response: ${text.substring(0, 200)}`);
  }
}

// --- Auth ---
export const api = {
  login: (idToken: string) =>
    request<{ token: string; user: { email: string; name: string; role: string } }>(
      'login', 'GET', { id_token: idToken }
    ),

  // --- Students ---
  listStudents: (filters?: Record<string, string>) =>
    request<Array<Record<string, unknown>>>('list_students', 'GET', filters),
  getStudent: (id: string) =>
    request<Record<string, unknown>>('get_student', 'GET', { id }),
  createStudent: (data: Record<string, unknown>) =>
    request('create_student', 'POST', undefined, { data }),
  updateStudent: (id: string, data: Record<string, unknown>) =>
    request('update_student', 'POST', undefined, { id, data }),
  deactivateStudent: (id: string) =>
    request('deactivate_student', 'POST', undefined, { id }),

  // --- Classes ---
  listClasses: (filters?: Record<string, string>) =>
    request<Array<Record<string, unknown>>>('list_classes', 'GET', filters),
  getClass: (id: string) =>
    request<Record<string, unknown>>('get_class', 'GET', { id }),
  createClass: (data: Record<string, unknown>) =>
    request('create_class', 'POST', undefined, { data }),
  updateClass: (id: string, data: Record<string, unknown>) =>
    request('update_class', 'POST', undefined, { id, data }),

  // --- Teachers ---
  listTeachers: (filters?: Record<string, string>) =>
    request<Array<Record<string, unknown>>>('list_teachers', 'GET', filters),
  createTeacher: (data: Record<string, unknown>) =>
    request('create_teacher', 'POST', undefined, { data }),
  updateTeacher: (id: string, data: Record<string, unknown>) =>
    request('update_teacher', 'POST', undefined, { id, data }),

  // --- Enrollment ---
  listInquiries: (filters?: Record<string, string>) =>
    request<Array<Record<string, unknown>>>('list_inquiries', 'GET', filters),
  createInquiry: (data: Record<string, unknown>) =>
    request('create_inquiry', 'POST', undefined, { data }),
  updateInquiry: (id: string, data: Record<string, unknown>) =>
    request('update_inquiry', 'POST', undefined, { id, data }),
  convertInquiry: (id: string) =>
    request('convert_inquiry', 'POST', undefined, { id }),

  // --- Payments ---
  listPayments: (filters?: Record<string, string>) =>
    request<Array<Record<string, unknown>>>('list_payments', 'GET', filters),
  pendingPayments: () =>
    request<Array<Record<string, unknown>>>('pending_payments'),
  recordPayment: (data: Record<string, unknown>) =>
    request('record_payment', 'POST', undefined, { data }),
  createPaymentLink: (studentId: string, amount: number, description: string) =>
    request('create_payment_link', 'POST', undefined, { studentId, amount, description }),

  // --- Attendance ---
  getAttendance: (classId: string, date: string) =>
    request<Array<Record<string, unknown>>>('get_attendance', 'GET', { classId, date }),
  markAttendance: (data: Record<string, unknown>) =>
    request('mark_attendance', 'POST', undefined, { data }),

  // --- Reports ---
  dashboardStats: () =>
    request<Record<string, unknown>>('dashboard_stats'),
  revenueReport: (start: string, end: string) =>
    request('report_revenue', 'GET', { start, end }),
  attendanceReport: (filters: Record<string, string>) =>
    request('report_attendance', 'GET', filters),
  enrollmentReport: () =>
    request('report_enrollment'),

  // --- Config ---
  getConfig: () =>
    request<Record<string, string>>('get_config'),
  setConfig: (key: string, value: string) =>
    request('set_config', 'GET', { key, value }),

  // --- WhatsApp ---
  sendTest: (phone: string, message: string) =>
    request('send_test', 'POST', undefined, { phone, message }),
  sendOverride: (targetType: string, targetValue: string, message: string, sentBy: string) =>
    request('send_override', 'POST', undefined, {
      target_type: targetType, target_value: targetValue, message, sent_by: sentBy,
    }),

  // --- Health ---
  health: () => request('health'),
};
