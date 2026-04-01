import { CLIENT } from '../config/client';
import { mockStudents, mockClasses, mockConfig, mockMessageLog } from './mockData';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
const LATENCY = 300;

let students = [...mockStudents];
let classes = [...mockClasses];

function ok<T>(data: T) {
  return { status: 'ok', data };
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
      return { status: 'error', message: 'Invalid email or password.' };
    }
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ email, name: user.name, role: user.role, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 86400 }));
    const fakeJwt = `${header}.${payload}.mock-signature`;
    return { status: 'ok', data: { token: fakeJwt, user: { email, name: user.name, role: user.role } } };
  },

  // --- Students & Classes (for broadcast targeting) ---
  listStudents: async (filters?: Record<string, string>) => {
    await delay(LATENCY);
    let result = [...students];
    if (filters?.class) result = result.filter(s => s.Class === filters.class);
    if (filters?.status === 'active') result = result.filter(s => s.Active);
    return ok(result);
  },
  listClasses: async (filters?: Record<string, string>) => {
    await delay(LATENCY);
    let result = [...classes];
    if (filters?.instrument) result = result.filter(c => c.Instrument === filters.instrument);
    return ok(result);
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
  getMessageLog: async () => {
    await delay(LATENCY);
    return ok(mockMessageLog);
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

  // --- Health ---
  health: async () => {
    await delay(LATENCY);
    return { status: 'ok', timestamp: new Date().toISOString(), triggerCount: 2, mode: 'mock' };
  },
};
