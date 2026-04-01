/* ───── Data normalization for messy Excel imports ───── */

import type { EnquiryStatus } from '../types';

// ── Phone ──
export function normalizePhone(raw: unknown): string {
  if (!raw) return '';
  const digits = String(raw).replace(/[^0-9]/g, '');
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`;
  if (digits.length === 13 && digits.startsWith('91')) return `+${digits.slice(0, 12)}`;
  return digits.length >= 10 ? `+${digits}` : '';
}

// ── Source ──
const SOURCE_MAP: Record<string, string> = {
  'fb': 'Facebook', 'f b': 'Facebook', 'facebook': 'Facebook',
  'ig': 'Instagram', 'i g': 'Instagram', 'instagram': 'Instagram', 'insta': 'Instagram',
  'google': 'Google', 'ggl': 'Google', 'googlr': 'Google',
  'walk in': 'Walk-in', 'walkin': 'Walk-in', 'walkinn': 'Walk-in',
  'friends': 'Friends',
  'reference': 'Reference', 'ref': 'Reference', 'referance': 'Reference',
  'building branding': 'Building Branding', 'bulding': 'Building Branding',
  'bulding advertise': 'Building Branding', 'building branding(tv)': 'Building Branding (TV)',
  'call': 'Phone Call', 'old call': 'Phone Call',
  'whatsapp': 'WhatsApp', 'whats app': 'WhatsApp',
  'newspaper insert': 'Newspaper Insert',
  'vt ads': 'VT Ads',
  'website': 'Website',
  'old lead': 'Old Lead', 'old lener': 'Old Lead',
};

export function normalizeSource(raw: unknown): string {
  if (!raw) return 'Unknown';
  const key = String(raw).trim().toLowerCase().replace(/\s+/g, ' ');
  // Check direct match
  if (SOURCE_MAP[key]) return SOURCE_MAP[key];
  // Check partial match
  for (const [pattern, canonical] of Object.entries(SOURCE_MAP)) {
    if (key.includes(pattern)) return canonical;
  }
  // Capitalize first letter
  return String(raw).trim().replace(/^\w/, c => c.toUpperCase());
}

// ── Enquiry Status ──
const STATUS_MAP: Record<string, EnquiryStatus> = {
  'pending': 'Pending',
  'cold': 'Cold',
  'converted': 'Converted',
  'no response': 'No Response',
  'not interested': 'Not Interested',
  'hold': 'Hold',
};

export function normalizeEnquiryStatus(raw: unknown): EnquiryStatus {
  if (!raw) return 'Pending';
  const val = String(raw).trim().toLowerCase();
  if (STATUS_MAP[val]) return STATUS_MAP[val];
  // Check partial matches
  if (val.includes('convert') || val.includes('enrol') || val.includes('join')) return 'Converted';
  if (val.includes('cold') || val.includes('not interest') || val.includes('cancel') || val.includes('far away')) return 'Not Interested';
  if (val.includes('no response') || val.includes('not answer') || val.includes('switch') || val.includes('busy')) return 'No Response';
  if (val.includes('hold') || val.includes('expect') || val.includes('expt') || val.includes('week') || val.includes('later') || val.includes('january') || val.includes('call back')) return 'Hold';
  if (val.includes('pending') || val.includes('demo') || val.includes('visit')) return 'Pending';
  // If it looks like a date (common in the data), treat as Hold
  if (/^\d{4}-\d{2}-\d{2}/.test(val)) return 'Hold';
  return 'Other';
}

// ── Instrument ──
const INSTRUMENT_MAP: Record<string, string> = {
  'piano': 'Piano', 'keyboard': 'Piano', 'key board': 'Piano', 'keys': 'Piano',
  'guitar': 'Guitar', 'guiter': 'Guitar', 'guitaer': 'Guitar', 'gruitar': 'Guitar',
  'drums': 'Drums', 'drum': 'Drums', 'drem': 'Drums',
  'carnatic': 'Carnatic Vocals', 'carnatic vocal': 'Carnatic Vocals', 'carnatic vocals': 'Carnatic Vocals', 'cranatic': 'Carnatic Vocals',
  'western vocal': 'Western Vocals', 'western vocals': 'Western Vocals', 'western voc': 'Western Vocals',
  'hindustani': 'Hindustani Vocals', 'hindustani vocal': 'Hindustani Vocals', 'hindustani vocals': 'Hindustani Vocals', 'hindusani': 'Hindustani Vocals', 'hinsustani': 'Hindustani Vocals', 'hindustan': 'Hindustani Vocals',
  'violin': 'Violin', 'voilin': 'Violin', 'volin': 'Violin',
  'flute': 'Flute',
  'tabla': 'Tabla', 'tabala': 'Tabla',
  'ukelele': 'Ukulele', 'uklele': 'Ukulele', 'ukhili': 'Ukulele',
  'vocal': 'Vocals', 'vocals': 'Vocals',
  'music': 'Music',
};

export function normalizeInstrument(raw: unknown): string {
  if (!raw) return 'Unknown';
  const val = String(raw).trim().toLowerCase().replace(/[\n\r]+/g, ' ').replace(/\s+/g, ' ');
  // Direct match
  if (INSTRUMENT_MAP[val]) return INSTRUMENT_MAP[val];
  // Try first word/phrase
  for (const [pattern, canonical] of Object.entries(INSTRUMENT_MAP)) {
    if (val.startsWith(pattern) || val.includes(pattern)) return canonical;
  }
  return String(raw).trim().replace(/^\w/, c => c.toUpperCase());
}

// ── Student Status → Active boolean ──
export function isActiveStatus(status: string | null): boolean {
  if (!status) return false;
  const s = status.trim().toLowerCase();
  return s === 'active' || s === 'renewed' || s === 're-enrolled';
}

// ── Date ──
export function normalizeDate(raw: unknown): string | null {
  if (!raw) return null;
  if (raw instanceof Date) return raw.toISOString().split('T')[0];
  const s = String(raw).trim();
  // ISO format already
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.split('T')[0];
  // Try DD/MM/YYYY
  const dmy = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
  return null;
}

// ── Duration normalization ──
export function normalizeDuration(raw: unknown): string {
  if (!raw) return 'Unknown';
  const s = String(raw).trim().toUpperCase();
  if (s.includes('12') || s.includes('1 YEAR') || s.includes('YEAR')) return '12 MONTHS';
  if (s.includes('6')) return '6 MONTHS';
  if (s.includes('3')) return '3 MONTHS';
  if (s.includes('1')) return '1 MONTHS';
  return s;
}
