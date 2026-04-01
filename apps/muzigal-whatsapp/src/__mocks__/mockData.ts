import { CLIENT } from '../config/client';
import seedData from '../data/seed.json';
import type { Student, Enquiry, Batch, DerivedClass, Lookups, MessageLogEntry } from '../types';

// Real data from Excel migration
export const mockStudents: Student[] = seedData.students as Student[];
export const mockEnquiries: Enquiry[] = seedData.enquiries as Enquiry[];
export const mockBatches: Batch[] = seedData.batches as Batch[];
export const mockClasses: DerivedClass[] = seedData.classes as DerivedClass[];
export const mockLookups: Lookups = seedData.lookups as unknown as Lookups;

// Operational data (not from Excel)
export const mockConfig = {
  WHATSAPP_TOKEN: 'EAAM5X064FqA...(hidden)',
  PHONE_NUMBER_ID: '1085043881349577',
  TEMPLATE_NAME: 'class_update',
  CLAUDE_API_KEY: '(hidden)',
  USE_CLAUDE: 'FALSE',
  DAILY_SEND_HOUR: '8',
  DAILY_SEND_MINUTE: '0',
  TIMEZONE: 'Asia/Kolkata',
  SCHOOL_NAME: CLIENT.name,
  WEBHOOK_SECRET: '(hidden)',
};

export const mockMessageLog: MessageLogEntry[] = [
  { id: 'MSG001', type: 'daily_schedule', target: 'all', message: 'Daily class schedule sent to all active students', sentBy: 'System', sentAt: '2026-04-01T08:00:00', recipients: 9, delivered: 9, failed: 0 },
  { id: 'MSG002', type: 'broadcast', target: 'all', message: 'Muzigal will be closed on April 5 for Ugadi. Classes resume April 7.', sentBy: 'Aldrin Stellus', sentAt: '2026-03-31T14:30:00', recipients: 9, delivered: 8, failed: 1 },
  { id: 'MSG003', type: 'teacher_change', target: 'class', message: 'Teacher changed: Drums Intermediate — Mr. Cecil → Mr. Giri', sentBy: 'System', sentAt: '2026-03-30T16:00:00', recipients: 2, delivered: 2, failed: 0 },
  { id: 'MSG004', type: 'broadcast', target: 'Guitar - Grade 3', message: 'Guitar exam prep session this Saturday at 10 AM. Please attend!', sentBy: 'Cecil', sentAt: '2026-03-29T11:00:00', recipients: 3, delivered: 3, failed: 0 },
  { id: 'MSG005', type: 'daily_schedule', target: 'all', message: 'Daily class schedule sent to all active students', sentBy: 'System', sentAt: '2026-03-29T08:00:00', recipients: 9, delivered: 9, failed: 0 },
  { id: 'MSG006', type: 'test', target: 'individual', message: 'CRM test: If you receive this, WhatsApp integration is working.', sentBy: 'Aldrin Stellus', sentAt: '2026-03-28T15:20:00', recipients: 1, delivered: 1, failed: 0 },
  { id: 'MSG007', type: 'cancellation', target: 'class', message: 'Piano class cancelled tomorrow due to teacher leave. Next class on Thursday.', sentBy: 'System', sentAt: '2026-03-27T18:00:00', recipients: 2, delivered: 2, failed: 0 },
  { id: 'MSG008', type: 'broadcast', target: 'all', message: 'Reminder: Monthly fees due by March 5th. UPI or cash accepted.', sentBy: 'Giri', sentAt: '2026-03-25T09:00:00', recipients: 9, delivered: 9, failed: 0 },
  { id: 'MSG009', type: 'daily_schedule', target: 'all', message: 'Daily class schedule sent to all active students', sentBy: 'System', sentAt: '2026-03-25T08:00:00', recipients: 9, delivered: 9, failed: 0 },
  { id: 'MSG010', type: 'reschedule', target: 'class', message: 'Carnatic Vocals rescheduled from 2 PM to 4 PM this Saturday', sentBy: 'System', sentAt: '2026-03-24T12:00:00', recipients: 1, delivered: 1, failed: 0 },
];
