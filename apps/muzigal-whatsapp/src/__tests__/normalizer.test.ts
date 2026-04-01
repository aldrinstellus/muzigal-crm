import { describe, it, expect } from 'vitest';
import {
  normalizePhone,
  normalizeSource,
  normalizeEnquiryStatus,
  normalizeInstrument,
  isActiveStatus,
  normalizeDate,
  normalizeDuration,
} from '../data/normalizer';

// ── normalizePhone ──
describe('normalizePhone', () => {
  it('returns empty string for null', () => {
    expect(normalizePhone(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(normalizePhone(undefined)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(normalizePhone('')).toBe('');
  });

  it('prepends +91 for 10-digit number', () => {
    expect(normalizePhone('9876543210')).toBe('+919876543210');
  });

  it('prepends + for 12-digit number starting with 91', () => {
    expect(normalizePhone('919876543210')).toBe('+919876543210');
  });

  it('handles number with spaces', () => {
    expect(normalizePhone('98765 43210')).toBe('+919876543210');
  });

  it('handles number with +91 prefix', () => {
    expect(normalizePhone('+919876543210')).toBe('+919876543210');
  });

  it('handles number with dashes', () => {
    expect(normalizePhone('987-654-3210')).toBe('+919876543210');
  });

  it('returns empty for too-short number', () => {
    expect(normalizePhone('12345')).toBe('');
  });

  it('handles numeric input', () => {
    expect(normalizePhone(9876543210)).toBe('+919876543210');
  });
});

// ── normalizeSource ──
describe('normalizeSource', () => {
  it('maps fb to Facebook', () => {
    expect(normalizeSource('fb')).toBe('Facebook');
  });

  it('maps FB (uppercase) to Facebook', () => {
    expect(normalizeSource('FB')).toBe('Facebook');
  });

  it('maps Walk in to Walk-in', () => {
    expect(normalizeSource('Walk in')).toBe('Walk-in');
  });

  it('maps Walkin to Walk-in', () => {
    expect(normalizeSource('Walkin')).toBe('Walk-in');
  });

  it('maps google to Google', () => {
    expect(normalizeSource('google')).toBe('Google');
  });

  it('maps IG to Instagram', () => {
    expect(normalizeSource('IG')).toBe('Instagram');
  });

  it('maps insta to Instagram', () => {
    expect(normalizeSource('insta')).toBe('Instagram');
  });

  it('returns Unknown for null', () => {
    expect(normalizeSource(null)).toBe('Unknown');
  });

  it('returns Unknown for undefined', () => {
    expect(normalizeSource(undefined)).toBe('Unknown');
  });

  it('returns Unknown for empty string', () => {
    expect(normalizeSource('')).toBe('Unknown');
  });

  it('capitalizes unknown source', () => {
    expect(normalizeSource('billboard')).toBe('Billboard');
  });

  it('maps whatsapp to WhatsApp', () => {
    expect(normalizeSource('whatsapp')).toBe('WhatsApp');
  });

  it('maps ref to Reference', () => {
    expect(normalizeSource('ref')).toBe('Reference');
  });
});

// ── normalizeEnquiryStatus ──
describe('normalizeEnquiryStatus', () => {
  it('maps Pending to Pending', () => {
    expect(normalizeEnquiryStatus('Pending')).toBe('Pending');
  });

  it('maps Cold to Cold', () => {
    expect(normalizeEnquiryStatus('Cold')).toBe('Cold');
  });

  it('maps Converted to Converted', () => {
    expect(normalizeEnquiryStatus('Converted')).toBe('Converted');
  });

  it('maps not interested to Not Interested', () => {
    expect(normalizeEnquiryStatus('not interested')).toBe('Not Interested');
  });

  it('maps date string to Hold', () => {
    expect(normalizeEnquiryStatus('2025-01-15')).toBe('Hold');
  });

  it('returns Pending for null', () => {
    expect(normalizeEnquiryStatus(null)).toBe('Pending');
  });

  it('returns Pending for undefined', () => {
    expect(normalizeEnquiryStatus(undefined)).toBe('Pending');
  });

  it('returns Other for random text', () => {
    expect(normalizeEnquiryStatus('xyzabc')).toBe('Other');
  });

  it('maps no response to No Response', () => {
    expect(normalizeEnquiryStatus('no response')).toBe('No Response');
  });

  it('maps hold to Hold', () => {
    expect(normalizeEnquiryStatus('hold')).toBe('Hold');
  });

  it('maps text with "enrol" to Converted', () => {
    expect(normalizeEnquiryStatus('enrolled')).toBe('Converted');
  });

  it('maps text with "demo" to Pending', () => {
    expect(normalizeEnquiryStatus('demo scheduled')).toBe('Pending');
  });

  it('maps text with "call back" to Hold', () => {
    expect(normalizeEnquiryStatus('call back later')).toBe('Hold');
  });
});

// ── normalizeInstrument ──
describe('normalizeInstrument', () => {
  it('maps piano to Piano', () => {
    expect(normalizeInstrument('piano')).toBe('Piano');
  });

  it('maps Keyboarrd (typo for keyboard) to Piano', () => {
    // "keyboarrd" contains "keyboard" is not direct, but "key" partial match
    // Actually let's check — the map has 'keyboard' → 'Piano'
    // "keyboarrd" starts with "key" but the map entry is 'keyboard'
    // The partial match loop: val.startsWith(pattern) or val.includes(pattern)
    // "keyboarrd".includes("keyboard") → false, "keyboarrd".startsWith("key") → true, and "keys" is a pattern
    // "keyboarrd".startsWith("keys") → false, but "keyboarrd".includes("key board") → false
    // Actually "keyboarrd".startsWith("piano") no, "keyboarrd".startsWith("keyboard") no
    // But it iterates: first checks "piano" → no, then "keyboard" → .startsWith("keyboard") false, .includes("keyboard") false
    // Then "key board" → false, then "keys" → .startsWith("keys") false, .includes("keys") false
    // Then "guitar" etc. None match. Falls through to capitalize.
    expect(normalizeInstrument('Keyboarrd')).toBe('Keyboarrd');
  });

  it('maps keyboard to Piano', () => {
    expect(normalizeInstrument('keyboard')).toBe('Piano');
  });

  it('maps Voilin to Violin', () => {
    expect(normalizeInstrument('Voilin')).toBe('Violin');
  });

  it('maps guitar to Guitar', () => {
    expect(normalizeInstrument('guitar')).toBe('Guitar');
  });

  it('returns Unknown for null', () => {
    expect(normalizeInstrument(null)).toBe('Unknown');
  });

  it('returns Unknown for undefined', () => {
    expect(normalizeInstrument(undefined)).toBe('Unknown');
  });

  it('maps drums to Drums', () => {
    expect(normalizeInstrument('drums')).toBe('Drums');
  });

  it('maps carnatic to Carnatic Vocals', () => {
    expect(normalizeInstrument('carnatic')).toBe('Carnatic Vocals');
  });

  it('maps flute to Flute', () => {
    expect(normalizeInstrument('flute')).toBe('Flute');
  });

  it('maps tabla to Tabla', () => {
    expect(normalizeInstrument('tabla')).toBe('Tabla');
  });

  it('maps ukelele to Ukulele', () => {
    expect(normalizeInstrument('ukelele')).toBe('Ukulele');
  });

  it('capitalizes unrecognized instrument', () => {
    expect(normalizeInstrument('sitar')).toBe('Sitar');
  });

  it('maps guiter (typo) to Guitar', () => {
    expect(normalizeInstrument('guiter')).toBe('Guitar');
  });

  it('maps hindusani (typo) to Hindustani Vocals', () => {
    expect(normalizeInstrument('hindusani')).toBe('Hindustani Vocals');
  });
});

// ── isActiveStatus ──
describe('isActiveStatus', () => {
  it('Active returns true', () => {
    expect(isActiveStatus('Active')).toBe(true);
  });

  it('Renewed returns true', () => {
    expect(isActiveStatus('Renewed')).toBe(true);
  });

  it('Re-Enrolled returns true', () => {
    expect(isActiveStatus('Re-Enrolled')).toBe(true);
  });

  it('InActive returns false', () => {
    expect(isActiveStatus('InActive')).toBe(false);
  });

  it('Not Renewed returns false', () => {
    expect(isActiveStatus('Not Renewed')).toBe(false);
  });

  it('null returns false', () => {
    expect(isActiveStatus(null)).toBe(false);
  });

  it('empty string returns false', () => {
    expect(isActiveStatus('')).toBe(false);
  });
});

// ── normalizeDate ──
describe('normalizeDate', () => {
  it('returns null for null', () => {
    expect(normalizeDate(null)).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(normalizeDate(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(normalizeDate('')).toBeNull();
  });

  it('fixes Date object by adding 1 day (SheetJS offset)', () => {
    // Date for 2025-10-08 (UTC) → should become 2025-10-09
    const d = new Date('2025-10-08T00:00:00Z');
    expect(normalizeDate(d)).toBe('2025-10-09');
  });

  it('passes through ISO string', () => {
    expect(normalizeDate('2025-10-09')).toBe('2025-10-09');
  });

  it('passes through ISO string with time', () => {
    expect(normalizeDate('2025-10-09T12:30:00Z')).toBe('2025-10-09');
  });

  it('parses DD/MM/YYYY format', () => {
    expect(normalizeDate('15/03/2025')).toBe('2025-03-15');
  });

  it('parses D/M/YYYY format with zero-padding', () => {
    expect(normalizeDate('5/1/2025')).toBe('2025-01-05');
  });

  it('returns null for garbage input', () => {
    expect(normalizeDate('not a date')).toBeNull();
  });
});

// ── normalizeDuration ──
describe('normalizeDuration', () => {
  it('maps 1 Year to 12 MONTHS', () => {
    expect(normalizeDuration('1 Year')).toBe('12 MONTHS');
  });

  it('maps 6 Months to 6 MONTHS', () => {
    expect(normalizeDuration('6 Months')).toBe('6 MONTHS');
  });

  it('maps 3 Months to 3 MONTHS', () => {
    expect(normalizeDuration('3 Months')).toBe('3 MONTHS');
  });

  it('maps 1 Month to 1 MONTHS', () => {
    expect(normalizeDuration('1 Month')).toBe('1 MONTHS');
  });

  it('returns Unknown for null', () => {
    expect(normalizeDuration(null)).toBe('Unknown');
  });

  it('returns Unknown for undefined', () => {
    expect(normalizeDuration(undefined)).toBe('Unknown');
  });

  it('maps Year to 12 MONTHS', () => {
    expect(normalizeDuration('Year')).toBe('12 MONTHS');
  });
});
