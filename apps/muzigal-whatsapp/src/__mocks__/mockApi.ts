import { CLIENT } from '../config/client';
import { mockStudents, mockClasses, mockEnquiries, mockBatches, mockConfig, mockMessageLog } from './mockData';
import type { AppSettings, ConnectionTestResult, MessageTemplate } from '../types';

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
const LATENCY = 300;

function ok<T>(data: T) {
  return { status: 'ok' as const, data };
}

// ── Demo settings state (in-memory, persists during session) ──
const demoSettings: AppSettings = {
  provider: {
    provider: 'meta',
    whatsappToken: 'EAAM5X064FqABO3zZC...(demo-token)',
    tokenType: 'temporary',
    phoneNumberId: '1085043881349577',
    wabaId: '284901754710853',
    apiVersion: 'v19.0',
    twilioAccountSid: '',
    twilioAuthToken: '',
    twilioFromNumber: '',
    gupshupApiKey: '',
    gupshupSourcePhone: '',
    gupshupAppName: '',
    customWebhookUrl: '',
    customHeaders: '',
    webhookUrl: 'https://script.google.com/macros/s/DEMO_DEPLOY_ID/exec',
    webhookSecret: 'demo-webhook-secret-2026',
    connectionStatus: 'connected',
    lastTestedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  business: {
    academyName: CLIENT.name,
    fullName: CLIENT.fullName,
    email: CLIENT.email,
    phone: CLIENT.phone,
    website: 'https://muzigal.com',
    address: 'HSR Layout, Bangalore 560102',
    admins: CLIENT.admins.map(a => ({ email: a.email, name: a.name, role: 'admin' as const, active: true })),
    teachers: CLIENT.teachers.map(t => ({ ...t, active: true })),
    templates: [
      { id: 'tpl_01', name: 'class_update', language: 'en', category: 'UTILITY', body: 'Hi {{1}}, your {{2}} class update: {{3}}', status: 'APPROVED' as const, variables: ['student_name', 'subject', 'message'] },
      { id: 'tpl_02', name: 'fee_reminder', language: 'en', category: 'UTILITY', body: 'Hi {{1}}, your fee of {{2}} is due on {{3}}. Please clear it at the earliest. - Muzigal', status: 'APPROVED' as const, variables: ['student_name', 'amount', 'due_date'] },
      { id: 'tpl_03', name: 'welcome_message', language: 'en', category: 'MARKETING', body: 'Welcome to Muzigal, {{1}}! Your {{2}} classes begin {{3}}. See you soon!', status: 'APPROVED' as const, variables: ['student_name', 'subject', 'start_date'] },
      { id: 'tpl_04', name: 'class_cancellation', language: 'en', category: 'UTILITY', body: 'Hi {{1}}, your {{2}} class on {{3}} has been cancelled. Next class: {{4}}.', status: 'APPROVED' as const, variables: ['student_name', 'subject', 'date', 'next_date'] },
      { id: 'tpl_05', name: 'demo_invite', language: 'en', category: 'MARKETING', body: 'Hi {{1}}, we have a free demo for {{2}} this {{3}}. Would you like to attend?', status: 'PENDING' as const, variables: ['name', 'instrument', 'day'] },
    ],
  },
  automation: {
    dailyScheduleEnabled: true,
    dailySendHour: 8,
    dailySendMinute: 0,
    timezone: 'Asia/Kolkata',
    feeReminderEnabled: true,
    feeReminderDaysBefore: 3,
    aiEnabled: false,
    aiProvider: 'claude',
    aiApiKey: '',
    aiModel: 'claude-sonnet-4-20250514',
    retryAttempts: 2,
    retryDelayMs: 5000,
    rateLimitMs: 200,
  },
  dataSource: {
    googleSheetUrl: '',
    autoSyncEnabled: false,
    autoSyncIntervalMinutes: 60,
    lastSyncedAt: null,
    lastImportFile: 'MS Data Migration (2).xlsx',
    lastImportAt: new Date().toISOString(),
  },
};

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

  // --- Settings (structured) ---
  getSettings: async (): Promise<{ status: 'ok'; data: AppSettings }> => {
    await delay(LATENCY);
    return ok({ ...demoSettings });
  },

  saveSettings: async (section: string, data: Partial<AppSettings>): Promise<{ status: 'ok'; message: string }> => {
    await delay(LATENCY * 2);
    if (section === 'provider' && data.provider) Object.assign(demoSettings.provider, data.provider);
    if (section === 'business' && data.business) Object.assign(demoSettings.business, data.business);
    if (section === 'automation' && data.automation) Object.assign(demoSettings.automation, data.automation);
    if (section === 'dataSource' && data.dataSource) Object.assign(demoSettings.dataSource, data.dataSource);
    return { status: 'ok' as const, message: `${section} settings saved` };
  },

  testConnection: async (): Promise<{ status: 'ok'; data: ConnectionTestResult }> => {
    await delay(1200); // Simulate real network latency
    demoSettings.provider.connectionStatus = 'connected';
    demoSettings.provider.lastTestedAt = new Date().toISOString();
    return ok({
      success: true,
      message: 'WhatsApp Cloud API connection successful',
      details: `Provider: Meta Cloud API (${demoSettings.provider.apiVersion}) · Phone: ${demoSettings.provider.phoneNumberId} · Token type: ${demoSettings.provider.tokenType}`,
      latencyMs: 187,
    });
  },

  listTemplates: async (): Promise<{ status: 'ok'; data: MessageTemplate[] }> => {
    await delay(LATENCY);
    return ok(demoSettings.business.templates);
  },

  // --- Legacy Config (backward compat) ---
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
    return {
      status: 'ok' as const,
      timestamp: new Date().toISOString(),
      triggerCount: 4,
      mode: 'mock',
      whatsapp: demoSettings.provider.connectionStatus,
      activeStudents: mockStudents.filter(s => s.Active).length,
      dailySchedule: demoSettings.automation.dailyScheduleEnabled ? 'enabled' : 'disabled',
      feeReminders: demoSettings.automation.feeReminderEnabled ? 'enabled' : 'disabled',
      aiComposer: demoSettings.automation.aiEnabled ? 'enabled' : 'disabled',
    };
  },
};
