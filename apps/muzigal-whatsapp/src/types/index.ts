/* ───── Muzigal WhatsApp — Shared Types ───── */

// ── Student (from Excel: "Student Details" sheet, 25 cols) ──
export interface Student {
  StudentID: string;       // STUD-00001
  StudentName: string;
  EnrollmentNumber: string | null;
  EnrollmentDate: string | null;
  LevelDetails: string | null;
  Subjects: string;        // Piano, Guitar, Drums, etc.
  Duration: string;        // 1 MONTHS, 3 MONTHS, 6 MONTHS, 12 MONTHS
  StartDate: string | null;
  ExpiryDate: string | null;
  Status: string;          // Active, Renewed, Re-Enrolled, Not Renewed, InActive
  EnrolmentStatus: string;
  Email: string | null;
  ContactNumber: string;
  DurationInDays: number | null;
  TotalAmount: number | null;
  TotalSessions: number | null;
  SessionEnrolled: number | null;
  BonusSession: number | null;
  CompletedSessions: number | null;
  PendingSessions: number | null;
  PreviousSessionCompleted: number | null;
  PaymentModeDetails: string | null;
  InvoiceDate: string | null;
  // Computed / backward-compat
  Active: boolean;
  /** Alias for StudentName */
  Name: string;
  /** Alias for ContactNumber (with +91 prefix) */
  Phone: string;
  /** Alias for Subjects */
  Instrument: string;
  /** Alias for LevelDetails */
  Level: string;
  /** Derived: "Subject — BatchTime (Day)" */
  Class: string;
}

// ── Enquiry (from Excel: "Enquiry Details" sheet, 14 cols) ──
export interface Enquiry {
  EnquiryDate: string | null;
  NameOfContact: string;
  NameOfLearner: string | null;
  ContactNumber: string;
  Age: number | null;
  Source: string;          // Normalized: Facebook, Google, Instagram, Walk-in, etc.
  DemoStatus: string;      // Yes, No, or other
  CallBackDate: string | null;
  CallBackDescription: string | null;
  Status: EnquiryStatus;
  InstrumentInterested: string | null;
  Duration: string | null;
  ReferenceName: string | null;
  Email: string | null;
  // Computed
  Phone: string;
}

export type EnquiryStatus =
  | 'Pending'
  | 'Cold'
  | 'Converted'
  | 'No Response'
  | 'Not Interested'
  | 'Hold'
  | 'Other';

// ── Batch (from Excel: "Student Batch" sheet, 5 cols) ──
export interface Batch {
  StudentName: string;
  StudentID: string;
  BatchTime: string;       // "11 AM to 12 PM"
  Days: string;            // "Sunday", "Monday", etc.
  Subject: string;
}

// ── Derived Class (grouped from batches) ──
export interface DerivedClass {
  ClassID: string;
  Name: string;            // "Guitar — 11 AM to 12 PM (Sunday)"
  Subject: string;
  BatchTime: string;
  Day: string;
  StudentIDs: string[];
  StudentCount: number;
}

// ── Lookups ──
export interface InstrumentDetail {
  Instrument: string;
  MaxStudents: number;
  Status: string;
}

export interface BatchDetail {
  StartTime: string;
  EndTime: string;
  DurationHrs: number;
  BatchTime: string;
  Status: string;
}

export interface SourceDetail {
  Source: string;
  Status: string;
}

export interface LevelDetail {
  Level: string;
  Status: string;
}

export interface StudentStatusDetail {
  EnrolmentStatus: string;
  Status: string;
}

export interface DurationDetail {
  Duration: string;
  Status: string;
}

export interface PaymentModeDetail {
  PaymentMode: string;
  Status: string;
}

export interface Lookups {
  instruments: InstrumentDetail[];
  batchSlots: BatchDetail[];
  sources: SourceDetail[];
  levels: LevelDetail[];
  statuses: StudentStatusDetail[];
  durations: DurationDetail[];
  paymentModes: PaymentModeDetail[];
}

// ── Full dataset ──
export interface MuzigalDataset {
  students: Student[];
  enquiries: Enquiry[];
  batches: Batch[];
  classes: DerivedClass[];
  lookups: Lookups;
  meta: {
    generatedAt: string;
    source: string;
    counts: {
      students: number;
      enquiries: number;
      batches: number;
      classes: number;
    };
  };
}

// ═══════════════════════════════════════════════
// ── Settings / Admin Configuration Types ──
// ═══════════════════════════════════════════════

export type Provider = 'meta' | 'twilio' | 'gupshup' | 'custom';
export type TokenType = 'temporary' | 'system_user';
export type ConnectionStatus = 'connected' | 'disconnected' | 'token_expiring' | 'error' | 'untested';

export interface ProviderConfig {
  provider: Provider;
  // Meta Cloud API
  whatsappToken: string;
  tokenType: TokenType;
  phoneNumberId: string;
  wabaId: string;
  apiVersion: string;
  // Twilio
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioFromNumber: string;
  // Gupshup
  gupshupApiKey: string;
  gupshupSourcePhone: string;
  gupshupAppName: string;
  // Custom webhook
  customWebhookUrl: string;
  customHeaders: string;
  // Shared
  webhookUrl: string;
  webhookSecret: string;
  connectionStatus: ConnectionStatus;
  lastTestedAt: string | null;
}

export interface BusinessProfile {
  academyName: string;
  fullName: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  admins: AdminUser[];
  teachers: Teacher[];
  templates: MessageTemplate[];
}

export interface AdminUser {
  email: string;
  name: string;
  role: 'admin' | 'staff';
  active: boolean;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  instrument: string;
  active: boolean;
}

export interface MessageTemplate {
  id: string;
  name: string;
  language: string;
  category: string;
  body: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  variables: string[];
}

export interface AutomationConfig {
  dailyScheduleEnabled: boolean;
  dailySendHour: number;
  dailySendMinute: number;
  timezone: string;
  feeReminderEnabled: boolean;
  feeReminderDaysBefore: number;
  aiEnabled: boolean;
  aiProvider: 'claude' | 'none';
  aiApiKey: string;
  aiModel: string;
  retryAttempts: number;
  retryDelayMs: number;
  rateLimitMs: number;
}

export interface DataSourceConfig {
  googleSheetUrl: string;
  autoSyncEnabled: boolean;
  autoSyncIntervalMinutes: number;
  lastSyncedAt: string | null;
  lastImportFile: string | null;
  lastImportAt: string | null;
}

export interface AppSettings {
  provider: ProviderConfig;
  business: BusinessProfile;
  automation: AutomationConfig;
  dataSource: DataSourceConfig;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  details?: string;
  latencyMs?: number;
}

// ── Message log (existing, unchanged) ──
export interface MessageLogEntry {
  id: string;
  type: string;
  target: string;
  message: string;
  sentBy: string;
  sentAt: string;
  recipients: number;
  delivered: number;
  failed: number;
}
