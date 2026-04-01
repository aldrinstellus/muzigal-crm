import { mockApi } from '../__mocks__/mockApi';
import { isDemo } from '../lib/mode';
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
  return localStorage.getItem('zoo_wa_token');
}

export function setToken(token: string) {
  localStorage.setItem('zoo_wa_token', token);
}

export function clearToken() {
  localStorage.removeItem('zoo_wa_token');
  localStorage.removeItem('zoo_wa_user');
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

export const api = {
  login: (credentials: string) =>
    request<{ token: string; user: { email: string; name: string; role: string } }>(
      'login', 'GET', { credentials }
    ),

  // --- Students & Classes (for broadcast) ---
  listStudents: (filters?: Record<string, string>) =>
    request<Array<Record<string, unknown>>>('list_students', 'GET', filters),
  listClasses: (filters?: Record<string, string>) =>
    request<Array<Record<string, unknown>>>('list_classes', 'GET', filters),

  // --- WhatsApp ---
  sendTest: (phone: string, message: string) =>
    request('send_test', 'POST', undefined, { phone, message }),
  sendOverride: (targetType: string, targetValue: string, message: string, sentBy: string) =>
    request('send_override', 'POST', undefined, {
      target_type: targetType, target_value: targetValue, message, sent_by: sentBy,
    }),

  // --- Config ---
  getConfig: () =>
    request<Record<string, string>>('get_config'),
  setConfig: (key: string, value: string) =>
    request('set_config', 'GET', { key, value }),

  // --- Health ---
  health: () => request('health'),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const activeApi: any = new Proxy({} as any, {
  get(_target, prop) {
    return isDemo() ? (mockApi as any)[prop] : (api as any)[prop];
  },
});
