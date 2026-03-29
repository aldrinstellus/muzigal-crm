import { describe, it, expect } from 'vitest';
import { cn, formatCurrency, formatDate, formatPhone, getInitials, statusColor } from '../lib/utils';

describe('Utility Functions', () => {
  describe('cn() — class name merger', () => {
    it('joins truthy classes', () => {
      expect(cn('a', 'b', 'c')).toBe('a b c');
    });
    it('filters out falsy values', () => {
      expect(cn('a', false, undefined, null, 'b')).toBe('a b');
    });
    it('returns empty string for no truthy values', () => {
      expect(cn(false, undefined)).toBe('');
    });
  });

  describe('formatCurrency() — INR formatting', () => {
    it('formats positive amounts', () => {
      const result = formatCurrency(3500);
      expect(result).toContain('3,500');
    });
    it('formats zero', () => {
      const result = formatCurrency(0);
      expect(result).toContain('0');
    });
    it('formats large amounts with commas (Indian numbering)', () => {
      const result = formatCurrency(150000);
      expect(result).toContain('1,50,000');
    });
  });

  describe('formatDate() — Indian date formatting', () => {
    it('formats a date string', () => {
      const result = formatDate('2026-03-25');
      expect(result).toContain('25');
      expect(result).toContain('Mar');
      expect(result).toContain('2026');
    });
    it('returns empty for empty input', () => {
      expect(formatDate('')).toBe('');
    });
  });

  describe('formatPhone() — Indian phone formatting', () => {
    it('formats 10-digit number', () => {
      expect(formatPhone('9845708094')).toBe('+91 98457 08094');
    });
    it('formats 12-digit with country code', () => {
      expect(formatPhone('919845708094')).toBe('+91 98457 08094');
    });
    it('formats numbers with +91 prefix', () => {
      // formatPhone always formats for display
      const result = formatPhone('+919845708094');
      expect(result).toContain('98457');
    });
    it('returns empty for empty input', () => {
      expect(formatPhone('')).toBe('');
    });
  });

  describe('getInitials()', () => {
    it('gets initials from full name', () => {
      expect(getInitials('Aarav Krishnan')).toBe('AK');
    });
    it('handles single name', () => {
      expect(getInitials('Cecil')).toBe('C');
    });
    it('limits to 2 chars for long names', () => {
      expect(getInitials('John Michael Smith')).toBe('JM');
    });
  });

  describe('statusColor() — badge color mapping', () => {
    it('returns green for Active', () => {
      expect(statusColor('Active')).toContain('emerald');
    });
    it('returns green for Paid', () => {
      expect(statusColor('Paid')).toContain('emerald');
    });
    it('returns amber for Pending', () => {
      expect(statusColor('Pending')).toContain('amber');
    });
    it('returns red for Overdue', () => {
      expect(statusColor('Overdue')).toContain('red');
    });
    it('returns red for Absent', () => {
      expect(statusColor('Absent')).toContain('red');
    });
    it('returns blue for Demo Scheduled', () => {
      expect(statusColor('Demo Scheduled')).toContain('blue');
    });
    it('returns default for unknown status', () => {
      expect(statusColor('Unknown')).toContain('zinc');
    });
  });
});
