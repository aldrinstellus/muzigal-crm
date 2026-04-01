import { CLIENT } from '../config/client';
import { mockStudents, mockClasses, mockEnquiries, mockBatches, mockConfig, mockMessageLog } from './mockData';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
const LATENCY = 300;

function ok<T>(data: T) {
  return { status: 'ok' as const, data };
}

export const mockApi = {
  // --- Auth ---
  login: async (credentials: string) => {
    await delay(LATENCY);
    const [email, password] = credentials.split(':');
    const users: Record<string, { password: string; name: string; role: string }> = {};
    for (const u of CLIENT.admins) users[u.email] = { password: u.password, name: u.name, role: u.role };
    users[CLIENT.demoUser.email] = { password: CLIENT.demoUser.password, name: CLIENT.demoUser.name, role: CLIENT.demoUser.role };
    const user = users[email];
    if (!user || user.password !== password) {
      return { status: 'error' as const, message: 'Invalid email or password.' };
    }
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ email, name: user.name, role: user.role, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 }));
    const fakeJwt = `${header}.${payload}.mock-signature`;
    return { status: 'ok' as const, data: { token: fakeJwt, user: { email, name: user.name, role: user.role } } };
  },

  // --- Students ---
  listStudents: async (filters?: Record<string, string>) => {
    await delay(LATENCY);
    let result = [...mockStudents];
    if (filters?.class) result = result.filter(s => s.Class === filters.class);
    if (filters?.subject) result = result.filter(s => s.Subjects === filters.subject || s.Instrument === filters.subject);
    if (filters?.level) result = result.filter(s => s.LevelDetails === filters.level || s.Level === filters.level);
    if (filters?.status === 'active') result = result.filter(s => s.Active);
    if (filters?.status === 'inactive') result = result.filter(s => !s.Active);
    if (filters?.duration) result = result.filter(s => s.Duration === filters.duration);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(s =>
        s.Name.toLowerCase().includes(q) ||
        s.StudentID.toLowerCase().includes(q) ||
        s.Phone.includes(q) ||
        s.ContactNumber.includes(q)
      );
    }
    if (filters?.expiring_days) {
      const days = parseInt(filters.expiring_days);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() + days);
      result = result.filter(s => {
        if (!s.ExpiryDate) return false;
        const exp = new Date(s.ExpiryDate);
        return exp <= cutoff && exp >= new Date();
      });
    }
    return ok(result);
  },

  // --- Classes ---
  listClasses: async (filters?: Record<string, string>) => {
    await delay(LATENCY);
    let result = [...mockClasses];
    if (filters?.subject) result = result.filter(c => c.Subject === filters.subject);
    if (filters?.day) result = result.filter(c => c.Day === filters.day);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(c => c.Name.toLowerCase().includes(q));
    }
    return ok(result);
  },

  // --- Enquiries ---
  listEnquiries: async (filters?: Record<string, string>) => {
    await delay(LATENCY);
    let result = [...mockEnquiries];
    if (filters?.status) result = result.filter(e => e.Status === filters.status);
    if (filters?.source) result = result.filter(e => e.Source === filters.source);
    if (filters?.instrument) result = result.filter(e => e.InstrumentInterested === filters.instrument);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(e =>
        e.NameOfContact.toLowerCase().includes(q) ||
        (e.NameOfLearner?.toLowerCase().includes(q)) ||
        e.ContactNumber.includes(q)
      );
    }
    return ok(result);
  },

  // --- Batches ---
  listBatches: async (filters?: Record<string, string>) => {
    await delay(LATENCY);
    let result = [...mockBatches];
    if (filters?.studentId) result = result.filter(b => b.StudentID === filters.studentId);
    if (filters?.subject) result = result.filter(b => b.Subject === filters.subject);
    if (filters?.day) result = result.filter(b => b.Days === filters.day);
    return ok(result);
  },

  // --- WhatsApp ---
  sendTest: async (phone: string, message: string) => {
    await delay(LATENCY);
    console.log(`[MOCK] WhatsApp test to ${phone}: ${message}`);
    return { status: 'ok' as const, success: true, message: 'Mock: Test message sent', messageId: `mock_wamid_${Date.now()}` };
  },
  sendOverride: async (targetType: string, targetValue: string, message: string, sentBy: string) => {
    await delay(LATENCY);
    console.log(`[MOCK] Override ${targetType}/${targetValue} by ${sentBy}: ${message}`);
    const count = targetType === 'all' ? mockStudents.filter(s => s.Active).length
      : targetType === 'subject' ? mockStudents.filter(s => s.Active && s.Subjects === targetValue).length
      : targetType === 'class' ? (mockClasses.find(c => c.ClassID === targetValue)?.StudentCount ?? 1)
      : 1;
    return { status: 'ok' as const, success: true, sent: count, failed: 0 };
  },
  getMessageLog: async () => {
    await delay(LATENCY);
    return ok(mockMessageLog);
  },

  // --- Config ---
  getConfig: async () => {
    await delay(LATENCY);
    return { status: 'ok' as const, config: mockConfig };
  },
  setConfig: async (key: string, value: string) => {
    await delay(LATENCY);
    (mockConfig as Record<string, string>)[key] = value;
    return { status: 'ok' as const, message: `Config ${key} updated` };
  },

  // --- Health ---
  health: async () => {
    await delay(LATENCY);
    return { status: 'ok' as const, timestamp: new Date().toISOString(), triggerCount: 2, mode: 'mock' };
  },
};
