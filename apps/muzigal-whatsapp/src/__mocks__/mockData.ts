import { CLIENT } from '../config/client';

export const mockStudents = [
  { StudentID: 'S001', Name: 'Aarav Krishnan', Phone: '+919845708094', Class: 'Guitar - Grade 3', Instrument: 'Guitar', Level: 'Grade 3', Active: true },
  { StudentID: 'S002', Name: 'Priya Sharma', Phone: '+919876543210', Class: 'Piano - Beginners', Instrument: 'Piano', Level: 'Beginners', Active: true },
  { StudentID: 'S003', Name: 'Arjun Reddy', Phone: '+919823456789', Class: 'Drums - Intermediate', Instrument: 'Drums', Level: 'Intermediate', Active: true },
  { StudentID: 'S004', Name: 'Meera Nair', Phone: '+919834567890', Class: 'Carnatic Vocals - Grade 2', Instrument: 'Carnatic Vocals', Level: 'Grade 2', Active: true },
  { StudentID: 'S005', Name: 'Rohan Das', Phone: '+919845123456', Class: 'Guitar - Grade 3', Instrument: 'Guitar', Level: 'Grade 3', Active: true },
  { StudentID: 'S006', Name: 'Kavya Iyer', Phone: '+919856789012', Class: 'Western Vocals - Advanced', Instrument: 'Western Vocals', Level: 'Advanced', Active: true },
  { StudentID: 'S007', Name: 'Vikram Patel', Phone: '+919867890123', Class: 'Piano - Beginners', Instrument: 'Piano', Level: 'Beginners', Active: false },
  { StudentID: 'S008', Name: 'Ananya Rao', Phone: '+919878901234', Class: 'Violin - Foundation', Instrument: 'Violin', Level: 'Foundation', Active: true },
  { StudentID: 'S009', Name: 'Nikhil Hegde', Phone: '+919889012345', Class: 'Hindustani Vocals - Beginners', Instrument: 'Hindustani Vocals', Level: 'Beginners', Active: true },
  { StudentID: 'S010', Name: 'Riya Menon', Phone: '+919890123456', Class: 'Drums - Intermediate', Instrument: 'Drums', Level: 'Intermediate', Active: true },
];

export const mockClasses = [
  { ClassID: 'CLS001', Instrument: 'Guitar', Level: 'Grade 3', Name: 'Guitar - Grade 3', Teacher: 'Mr. Cecil', Status: 'Active' },
  { ClassID: 'CLS002', Instrument: 'Piano', Level: 'Beginners', Name: 'Piano - Beginners', Teacher: 'Mr. Giri', Status: 'Active' },
  { ClassID: 'CLS003', Instrument: 'Drums', Level: 'Intermediate', Name: 'Drums - Intermediate', Teacher: 'Mr. Cecil', Status: 'Active' },
  { ClassID: 'CLS004', Instrument: 'Carnatic Vocals', Level: 'Grade 2', Name: 'Carnatic Vocals - Grade 2', Teacher: 'Mrs. Lakshmi', Status: 'Active' },
  { ClassID: 'CLS005', Instrument: 'Western Vocals', Level: 'Advanced', Name: 'Western Vocals - Advanced', Teacher: 'Mrs. Lakshmi', Status: 'Active' },
  { ClassID: 'CLS006', Instrument: 'Violin', Level: 'Foundation', Name: 'Violin - Foundation', Teacher: 'Mr. Giri', Status: 'Active' },
  { ClassID: 'CLS007', Instrument: 'Hindustani Vocals', Level: 'Beginners', Name: 'Hindustani Vocals - Beginners', Teacher: 'Mrs. Lakshmi', Status: 'Active' },
];

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

export const mockMessageLog = [
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
