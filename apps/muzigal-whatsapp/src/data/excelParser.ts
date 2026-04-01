/* ───── Parse Excel migration file into MuzigalDataset ───── */

import * as XLSX from 'xlsx';
import type {
  Student, Enquiry, Batch, DerivedClass, MuzigalDataset,
  InstrumentDetail, BatchDetail, SourceDetail, LevelDetail,
  StudentStatusDetail, DurationDetail, PaymentModeDetail,
} from '../types';
import {
  normalizePhone, normalizeSource, normalizeEnquiryStatus,
  normalizeInstrument, isActiveStatus, normalizeDate, normalizeDuration,
} from './normalizer';

type Row = Record<string, unknown>;

function sheetToRows(wb: XLSX.WorkBook, name: string): Row[] {
  const ws = wb.Sheets[name];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json<Row>(ws, { defval: null });
}

function str(v: unknown): string {
  if (v == null) return '';
  return String(v).trim();
}

function num(v: unknown): number | null {
  if (v == null) return null;
  const n = Number(v);
  return isNaN(n) ? null : n;
}

function dateStr(v: unknown): string | null {
  if (v instanceof Date) return v.toISOString().split('T')[0];
  return normalizeDate(v);
}

// ── Parse Students ──
function parseStudents(rows: Row[], batchMap: Map<string, Batch[]>): Student[] {
  return rows
    .filter(r => str(r['Student ID']))
    .map(r => {
      const id = str(r['Student ID']);
      const name = str(r['Student Name']);
      const subject = normalizeInstrument(r['Subjects']);
      const status = str(r['Status']) || 'Active';
      const level = str(r['Level Details']) || '';
      const phone = normalizePhone(r['Contact Number']);
      const batches = batchMap.get(id) || [];
      const batchLabel = batches.length > 0
        ? `${batches[0].Subject} — ${batches[0].BatchTime} (${batches[0].Days})`
        : `${subject}`;

      return {
        StudentID: id,
        StudentName: name,
        EnrollmentNumber: str(r['Enrollment Number']) || null,
        EnrollmentDate: dateStr(r['Enrollment Date']),
        LevelDetails: level || null,
        Subjects: subject,
        Duration: normalizeDuration(r['Duration']),
        StartDate: dateStr(r['Start Date']),
        ExpiryDate: dateStr(r['Expiry date '] ?? r['Expiry date']),
        Status: status,
        EnrolmentStatus: str(r['Enrolment Status']) || status,
        Email: str(r['Email']) || null,
        ContactNumber: str(r['Contact Number']),
        DurationInDays: num(r['Duration in Days']),
        TotalAmount: num(r['Total Amount']),
        TotalSessions: num(r['Total Sessions']),
        SessionEnrolled: num(r['Session Enrolled']),
        BonusSession: num(r['Bonus Session']),
        CompletedSessions: num(r['Completed Sessions']),
        PendingSessions: num(r['Pending Sessions']),
        PreviousSessionCompleted: num(r['Previous Session Completed']),
        PaymentModeDetails: str(r['Payment Mode Details']) || null,
        InvoiceDate: dateStr(r['Invoice Date']),
        // Computed
        Active: isActiveStatus(status),
        Name: name,
        Phone: phone,
        Instrument: subject,
        Level: level,
        Class: batchLabel,
      };
    });
}

// ── Parse Enquiries ──
function parseEnquiries(rows: Row[]): Enquiry[] {
  return rows
    .filter(r => str(r['Name of Contact']) || str(r['Contact Number']))
    .map(r => {
      const phone = normalizePhone(r['Contact Number']);
      return {
        EnquiryDate: dateStr(r['Enquiry Date']),
        NameOfContact: str(r['Name of Contact']),
        NameOfLearner: str(r['Name of Learner']) || null,
        ContactNumber: str(r['Contact Number']),
        Age: num(r['Age']),
        Source: normalizeSource(r['Source']),
        DemoStatus: str(r['Demo Status']) || 'No',
        CallBackDate: dateStr(r['Call Back Date']),
        CallBackDescription: str(r['Call Back Description']) || null,
        Status: normalizeEnquiryStatus(r['Status']),
        InstrumentInterested: normalizeInstrument(r['Instrument Interested']),
        Duration: str(r['Duration '] ?? r['Duration']) || null,
        ReferenceName: str(r['Referenec Name'] ?? r['Reference Name']) || null,
        Email: str(r['Email']) || null,
        Phone: phone,
      };
    });
}

// ── Parse Batches ──
function parseBatches(rows: Row[]): Batch[] {
  return rows
    .filter(r => str(r['Student ID']))
    .map(r => ({
      StudentName: str(r['Student Name']),
      StudentID: str(r['Student ID']),
      BatchTime: str(r['Batch Time']),
      Days: str(r['Days']),
      Subject: normalizeInstrument(r['Subject']),
    }));
}

// ── Derive Classes from Batches ──
function deriveClasses(batches: Batch[]): DerivedClass[] {
  const groups = new Map<string, { subject: string; batchTime: string; day: string; studentIDs: Set<string> }>();

  for (const b of batches) {
    const key = `${b.Subject}|${b.BatchTime}|${b.Days}`;
    const existing = groups.get(key);
    if (existing) {
      existing.studentIDs.add(b.StudentID);
    } else {
      groups.set(key, {
        subject: b.Subject,
        batchTime: b.BatchTime,
        day: b.Days,
        studentIDs: new Set([b.StudentID]),
      });
    }
  }

  let idx = 1;
  const classes: DerivedClass[] = [];
  for (const [, g] of groups) {
    classes.push({
      ClassID: `CLS-${String(idx++).padStart(3, '0')}`,
      Name: `${g.subject} — ${g.batchTime} (${g.day})`,
      Subject: g.subject,
      BatchTime: g.batchTime,
      Day: g.day,
      StudentIDs: [...g.studentIDs],
      StudentCount: g.studentIDs.size,
    });
  }

  return classes.sort((a, b) => a.Name.localeCompare(b.Name));
}

// ── Parse Lookups ──
function parseLookups(wb: XLSX.WorkBook) {
  const instruments: InstrumentDetail[] = sheetToRows(wb, 'Instrument Details').map(r => ({
    Instrument: str(r['Instrument']),
    MaxStudents: num(r[' Max no of students'] ?? r['Max no of students']) ?? 5,
    Status: str(r['Status']),
  }));

  const batchSlots: BatchDetail[] = sheetToRows(wb, 'Batch Details').map(r => ({
    StartTime: str(r['Start Time']),
    EndTime: str(r['End Time']),
    DurationHrs: num(r['Duration(hrs)']) ?? 1,
    BatchTime: str(r['Batch Time']),
    Status: str(r['Status']),
  }));

  const sources: SourceDetail[] = sheetToRows(wb, 'Source Details').map(r => ({
    Source: str(r['Source']),
    Status: str(r['Status']),
  }));

  const levels: LevelDetail[] = sheetToRows(wb, 'Level Details').map(r => ({
    Level: str(r['Level']),
    Status: str(r['Status']),
  }));

  const statuses: StudentStatusDetail[] = sheetToRows(wb, 'Student Status Details').map(r => ({
    EnrolmentStatus: str(r['Enrolment Status']),
    Status: str(r['Status']),
  }));

  const durations: DurationDetail[] = sheetToRows(wb, 'Duration Details').map(r => ({
    Duration: str(r['Duration']),
    Status: str(r['Status']),
  }));

  const paymentModes: PaymentModeDetail[] = sheetToRows(wb, 'Payment Mode').map(r => ({
    PaymentMode: str(r['Payment Mode']),
    Status: str(r['Status']),
  }));

  return { instruments, batchSlots, sources, levels, statuses, durations, paymentModes };
}

// ── Main: Parse an Excel workbook into MuzigalDataset ──
export function parseExcelToDataset(buffer: ArrayBuffer, filename = 'unknown'): MuzigalDataset {
  const wb = XLSX.read(buffer, { type: 'array', cellDates: true });

  // Parse batches first (needed for student class derivation)
  const batches = parseBatches(sheetToRows(wb, 'Student Batch'));

  // Build batch lookup by student ID
  const batchMap = new Map<string, Batch[]>();
  for (const b of batches) {
    const existing = batchMap.get(b.StudentID);
    if (existing) existing.push(b);
    else batchMap.set(b.StudentID, [b]);
  }

  const students = parseStudents(sheetToRows(wb, 'Student Details'), batchMap);
  const enquiries = parseEnquiries(sheetToRows(wb, 'Enquiry Details'));
  const classes = deriveClasses(batches);
  const lookups = parseLookups(wb);

  return {
    students,
    enquiries,
    batches,
    classes,
    lookups,
    meta: {
      generatedAt: new Date().toISOString(),
      source: filename,
      counts: {
        students: students.length,
        enquiries: enquiries.length,
        batches: batches.length,
        classes: classes.length,
      },
    },
  };
}
