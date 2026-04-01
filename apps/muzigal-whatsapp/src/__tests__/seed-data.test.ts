import { describe, it, expect } from 'vitest';
import seedData from '../data/seed.json';

describe('Seed data integrity', () => {
  // ── Counts ──
  it('has 255 students', () => {
    expect(seedData.students).toHaveLength(255);
  });

  it('has 905 enquiries', () => {
    expect(seedData.enquiries).toHaveLength(905);
  });

  it('has 511 batches', () => {
    expect(seedData.batches).toHaveLength(511);
  });

  it('has 138 classes', () => {
    expect(seedData.classes).toHaveLength(138);
  });

  // ── Student field presence ──
  it('all students have StudentID', () => {
    for (const s of seedData.students) {
      expect(s.StudentID).toBeTruthy();
    }
  });

  it('all students have Name', () => {
    for (const s of seedData.students) {
      expect(s.Name).toBeTruthy();
    }
  });

  it('all students have Phone field', () => {
    for (const s of seedData.students) {
      expect(s).toHaveProperty('Phone');
    }
  });

  it('all students have Subjects', () => {
    for (const s of seedData.students) {
      expect(s.Subjects).toBeTruthy();
    }
  });

  it('all students have Active field (boolean)', () => {
    for (const s of seedData.students) {
      expect(typeof s.Active).toBe('boolean');
    }
  });

  // ── Phone format ──
  it('all non-empty phones match +91XXXXXXXXXX', () => {
    for (const s of seedData.students) {
      if (s.Phone) {
        expect(s.Phone).toMatch(/^\+91\d{10}$/);
      }
    }
  });

  // ── No duplicate StudentIDs ──
  it('no duplicate StudentIDs', () => {
    const ids = seedData.students.map((s: { StudentID: string }) => s.StudentID);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // ── StudentID format ──
  it('all StudentIDs match STUD-XXXXX', () => {
    for (const s of seedData.students) {
      expect(s.StudentID).toMatch(/^STUD-\d{5}$/);
    }
  });

  // ── STUD-00001 verification ──
  it('STUD-00001 StartDate is 2025-10-09 (date fix verified)', () => {
    const stud1 = seedData.students.find((s: { StudentID: string }) => s.StudentID === 'STUD-00001');
    expect(stud1).toBeDefined();
    expect(stud1!.StartDate).toBe('2025-10-09');
  });

  it('STUD-00001 ExpiryDate is 2027-04-02', () => {
    const stud1 = seedData.students.find((s: { StudentID: string }) => s.StudentID === 'STUD-00001');
    expect(stud1!.ExpiryDate).toBe('2027-04-02');
  });

  // ── Lookups ──
  it('has 7 instruments in lookups', () => {
    expect(seedData.lookups.instruments).toHaveLength(7);
  });

  it('has 10 batchSlots in lookups', () => {
    expect(seedData.lookups.batchSlots).toHaveLength(10);
  });

  it('has 3 levels in lookups', () => {
    expect(seedData.lookups.levels).toHaveLength(3);
  });

  it('has 5 statuses in lookups', () => {
    expect(seedData.lookups.statuses).toHaveLength(5);
  });

  it('has 4 durations in lookups', () => {
    expect(seedData.lookups.durations).toHaveLength(4);
  });

  it('has 4 paymentModes in lookups', () => {
    expect(seedData.lookups.paymentModes).toHaveLength(4);
  });

  // ── Meta ──
  it('meta.generatedAt exists', () => {
    expect(seedData.meta.generatedAt).toBeTruthy();
  });

  // ── Classes uniqueness ──
  it('classes have unique Name values', () => {
    const names = seedData.classes.map((c: { Name: string }) => c.Name);
    expect(new Set(names).size).toBe(names.length);
  });
});

// ════════════════════════════════════════════════════════════
// Dashboard metrics deep drill-down verification
// ════════════════════════════════════════════════════════════

describe('Dashboard metrics accuracy', () => {
  const students = seedData.students as Array<{
    Active: boolean; Subjects: string; Instrument: string;
    ExpiryDate: string | null; Phone: string;
  }>;

  it('all 255 students are Active', () => {
    const active = students.filter(s => s.Active);
    expect(active).toHaveLength(255);
  });

  it('subject breakdown totals 255', () => {
    const subjects: Record<string, number> = {};
    for (const s of students) {
      subjects[s.Subjects] = (subjects[s.Subjects] || 0) + 1;
    }
    const total = Object.values(subjects).reduce((a, b) => a + b, 0);
    expect(total).toBe(255);
  });

  it('Piano count is 104', () => {
    expect(students.filter(s => s.Subjects === 'Piano').length).toBe(104);
  });

  it('Guitar count is 66', () => {
    expect(students.filter(s => s.Subjects === 'Guitar').length).toBe(66);
  });

  it('Drums count is 35', () => {
    expect(students.filter(s => s.Subjects === 'Drums').length).toBe(35);
  });

  it('Carnatic Vocals count is 17', () => {
    expect(students.filter(s => s.Subjects === 'Carnatic Vocals').length).toBe(17);
  });

  it('Hindustani Vocals count is 14', () => {
    expect(students.filter(s => s.Subjects === 'Hindustani Vocals').length).toBe(14);
  });

  it('Violin count is 10', () => {
    expect(students.filter(s => s.Subjects === 'Violin').length).toBe(10);
  });

  it('Western Vocals count is 9', () => {
    expect(students.filter(s => s.Subjects === 'Western Vocals').length).toBe(9);
  });

  it('zero students have empty phones', () => {
    const empty = students.filter(s => !s.Phone || s.Phone === '');
    expect(empty).toHaveLength(0);
  });

  it('expiring within 30 days count is 18', () => {
    const now = new Date('2026-04-01');
    const cutoff = new Date('2026-05-01');
    const expiring = students.filter(s => {
      if (!s.ExpiryDate) return false;
      const d = new Date(s.ExpiryDate);
      return d >= now && d <= cutoff;
    });
    expect(expiring.length).toBe(18);
  });
});

// ════════════════════════════════════════════════════════════
// Guide page existence verification
// ════════════════════════════════════════════════════════════

describe('Guide page', () => {
  it('guide.tsx exists and has all 8 sections', () => {
    const { readFileSync } = require('fs');
    const { join } = require('path');
    const content = readFileSync(join(__dirname, '..', 'pages', 'guide.tsx'), 'utf-8');
    expect(content).toContain('Getting Started');
    expect(content).toContain('Dashboard');
    expect(content).toContain('Students');
    expect(content).toContain('Broadcast');
    expect(content).toContain('Test Message');
    expect(content).toContain('Settings');
    expect(content).toContain('Limitation');
    expect(content).toContain('Adapting');
  });

  it('guide route is wired in App.tsx', () => {
    const { readFileSync } = require('fs');
    const { join } = require('path');
    const app = readFileSync(join(__dirname, '..', 'App.tsx'), 'utf-8');
    expect(app).toContain('guide');
    expect(app).toContain('Guide');
  });

  it('guide nav item is in Sidebar', () => {
    const { readFileSync } = require('fs');
    const { join } = require('path');
    const sidebar = readFileSync(join(__dirname, '..', 'components', 'layout', 'Sidebar.tsx'), 'utf-8');
    expect(sidebar).toContain('/dashboard/guide');
    expect(sidebar).toContain('Guide');
    expect(sidebar).toContain('BookOpen');
  });
});
