// ============================================================================
// MUZIGAL CRM — Mock Data for Development & Testing
// Realistic Bangalore music academy data
// ============================================================================

export const mockStudents = [
  { StudentID: 'S001', Name: 'Aarav Krishnan', Phone: '+919845708094', Class: 'Guitar - Grade 3', Instrument: 'Guitar', Level: 'Grade 3', Active: true, ParentName: 'Ramesh Krishnan', ParentPhone: '+919845708095', EnrollmentDate: '2025-09-15', DOB: '2014-03-20', Email: 'ramesh.k@gmail.com', Notes: '' },
  { StudentID: 'S002', Name: 'Priya Sharma', Phone: '+919876543210', Class: 'Piano - Beginners', Instrument: 'Piano', Level: 'Beginners', Active: true, ParentName: 'Anita Sharma', ParentPhone: '+919876543211', EnrollmentDate: '2025-10-01', DOB: '2015-07-12', Email: 'anita.sharma@email.com', Notes: 'Very enthusiastic learner' },
  { StudentID: 'S003', Name: 'Arjun Reddy', Phone: '+919823456789', Class: 'Drums - Intermediate', Instrument: 'Drums', Level: 'Intermediate', Active: true, ParentName: '', ParentPhone: '', EnrollmentDate: '2025-06-10', DOB: '2008-11-05', Email: 'arjun.reddy@email.com', Notes: 'Preparing for Rockschool Grade 4' },
  { StudentID: 'S004', Name: 'Meera Nair', Phone: '+919834567890', Class: 'Carnatic Vocals - Grade 2', Instrument: 'Carnatic Vocals', Level: 'Grade 2', Active: true, ParentName: 'Lakshmi Nair', ParentPhone: '+919834567891', EnrollmentDate: '2025-08-20', DOB: '2012-01-15', Email: 'lakshmi.nair@email.com', Notes: '' },
  { StudentID: 'S005', Name: 'Rohan Das', Phone: '+919845123456', Class: 'Guitar - Grade 3', Instrument: 'Guitar', Level: 'Grade 3', Active: true, ParentName: 'Sanjay Das', ParentPhone: '+919845123457', EnrollmentDate: '2025-09-15', DOB: '2013-09-30', Email: 'sanjay.das@email.com', Notes: '' },
  { StudentID: 'S006', Name: 'Kavya Iyer', Phone: '+919856789012', Class: 'Western Vocals - Advanced', Instrument: 'Western Vocals', Level: 'Advanced', Active: true, ParentName: '', ParentPhone: '', EnrollmentDate: '2024-12-01', DOB: '2005-04-18', Email: 'kavya.iyer@email.com', Notes: 'Preparing for Trinity Grade 6' },
  { StudentID: 'S007', Name: 'Vikram Patel', Phone: '+919867890123', Class: 'Piano - Beginners', Instrument: 'Piano', Level: 'Beginners', Active: false, ParentName: 'Deepa Patel', ParentPhone: '+919867890124', EnrollmentDate: '2025-10-01', DOB: '2016-02-28', Email: 'deepa.patel@email.com', Notes: 'On break — will resume in April' },
  { StudentID: 'S008', Name: 'Ananya Rao', Phone: '+919878901234', Class: 'Violin - Foundation', Instrument: 'Violin', Level: 'Foundation', Active: true, ParentName: 'Suresh Rao', ParentPhone: '+919878901235', EnrollmentDate: '2026-01-10', DOB: '2019-06-22', Email: 'suresh.rao@email.com', Notes: 'Age 6 — Foundation program' },
  { StudentID: 'S009', Name: 'Nikhil Hegde', Phone: '+919889012345', Class: 'Hindustani Vocals - Beginners', Instrument: 'Hindustani Vocals', Level: 'Beginners', Active: true, ParentName: '', ParentPhone: '', EnrollmentDate: '2025-11-15', DOB: '2001-08-10', Email: 'nikhil.hegde@email.com', Notes: 'Adult learner — hobby' },
  { StudentID: 'S010', Name: 'Riya Menon', Phone: '+919890123456', Class: 'Drums - Intermediate', Instrument: 'Drums', Level: 'Intermediate', Active: true, ParentName: 'Vijay Menon', ParentPhone: '+919890123457', EnrollmentDate: '2025-07-01', DOB: '2010-12-03', Email: 'vijay.menon@email.com', Notes: '' },
];

export const mockClasses = [
  { ClassID: 'CLS001', Instrument: 'Guitar', Level: 'Grade 3', Name: 'Guitar - Grade 3', Teacher: 'Mr. Cecil', Room: 'Studio A', Day: 'Monday,Wednesday', Time: '10:00', Duration: 60, MaxStudents: 8, CurrentStudents: 3, Fee: 3500, Status: 'Active' },
  { ClassID: 'CLS002', Instrument: 'Piano', Level: 'Beginners', Name: 'Piano - Beginners', Teacher: 'Mr. Giri', Room: 'Studio B', Day: 'Tuesday,Thursday', Time: '11:30', Duration: 60, MaxStudents: 6, CurrentStudents: 2, Fee: 4000, Status: 'Active' },
  { ClassID: 'CLS003', Instrument: 'Drums', Level: 'Intermediate', Name: 'Drums - Intermediate', Teacher: 'Mr. Cecil', Room: 'Studio A', Day: 'Monday,Friday', Time: '16:00', Duration: 60, MaxStudents: 4, CurrentStudents: 2, Fee: 3500, Status: 'Active' },
  { ClassID: 'CLS004', Instrument: 'Carnatic Vocals', Level: 'Grade 2', Name: 'Carnatic Vocals - Grade 2', Teacher: 'Mrs. Lakshmi', Room: 'Studio C', Day: 'Wednesday,Saturday', Time: '14:00', Duration: 45, MaxStudents: 6, CurrentStudents: 1, Fee: 3000, Status: 'Active' },
  { ClassID: 'CLS005', Instrument: 'Western Vocals', Level: 'Advanced', Name: 'Western Vocals - Advanced', Teacher: 'Mrs. Lakshmi', Room: 'Studio C', Day: 'Tuesday,Thursday', Time: '15:00', Duration: 60, MaxStudents: 5, CurrentStudents: 1, Fee: 4500, Status: 'Active' },
  { ClassID: 'CLS006', Instrument: 'Violin', Level: 'Foundation', Name: 'Violin - Foundation', Teacher: 'Mr. Giri', Room: 'Studio B', Day: 'Saturday', Time: '11:00', Duration: 45, MaxStudents: 6, CurrentStudents: 1, Fee: 3000, Status: 'Active' },
  { ClassID: 'CLS007', Instrument: 'Hindustani Vocals', Level: 'Beginners', Name: 'Hindustani Vocals - Beginners', Teacher: 'Mrs. Lakshmi', Room: 'Studio C', Day: 'Monday,Wednesday', Time: '17:00', Duration: 60, MaxStudents: 6, CurrentStudents: 1, Fee: 3500, Status: 'Active' },
];

export const mockTeachers = [
  { TeacherID: 'T001', Name: 'Cecil', Phone: '+919403890891', Email: 'cecil@muzigal.com', Instruments: 'Guitar,Ukulele,Drums', Availability: 'Mon-Sat 11:00-21:00', Status: 'Active', JoinDate: '2023-08-16' },
  { TeacherID: 'T002', Name: 'Giri', Phone: '+919403890892', Email: 'giri@muzigal.com', Instruments: 'Piano,Keyboard,Violin', Availability: 'Mon-Sat 11:00-21:00', Status: 'Active', JoinDate: '2023-08-16' },
  { TeacherID: 'T003', Name: 'Lakshmi', Phone: '+919403890893', Email: 'lakshmi@muzigal.com', Instruments: 'Western Vocals,Carnatic Vocals,Hindustani Vocals', Availability: 'Mon-Sat 11:00-19:00', Status: 'Active', JoinDate: '2024-01-10' },
];

export const mockPayments = [
  { PaymentID: 'PAY001', StudentID: 'S001', Amount: 3500, Date: '2026-03-01', DueDate: '2026-03-05', Status: 'Paid', Method: 'Razorpay', RazorpayRef: 'pay_N1abc123', Month: 'March 2026', Notes: '' },
  { PaymentID: 'PAY002', StudentID: 'S002', Amount: 4000, Date: '2026-03-03', DueDate: '2026-03-05', Status: 'Paid', Method: 'UPI', RazorpayRef: '', Month: 'March 2026', Notes: '' },
  { PaymentID: 'PAY003', StudentID: 'S003', Amount: 3500, Date: '', DueDate: '2026-03-05', Status: 'Overdue', Method: '', RazorpayRef: '', Month: 'March 2026', Notes: 'Reminder sent on WhatsApp' },
  { PaymentID: 'PAY004', StudentID: 'S004', Amount: 3000, Date: '2026-03-02', DueDate: '2026-03-05', Status: 'Paid', Method: 'Cash', RazorpayRef: '', Month: 'March 2026', Notes: '' },
  { PaymentID: 'PAY005', StudentID: 'S005', Amount: 3500, Date: '', DueDate: '2026-03-05', Status: 'Pending', Method: '', RazorpayRef: '', Month: 'March 2026', Notes: '' },
  { PaymentID: 'PAY006', StudentID: 'S006', Amount: 4500, Date: '2026-03-01', DueDate: '2026-03-05', Status: 'Paid', Method: 'Razorpay', RazorpayRef: 'pay_N1def456', Month: 'March 2026', Notes: '' },
  { PaymentID: 'PAY007', StudentID: 'S008', Amount: 3000, Date: '', DueDate: '2026-03-05', Status: 'Pending', Method: '', RazorpayRef: '', Month: 'March 2026', Notes: '' },
  { PaymentID: 'PAY008', StudentID: 'S009', Amount: 3500, Date: '2026-03-04', DueDate: '2026-03-05', Status: 'Paid', Method: 'UPI', RazorpayRef: '', Month: 'March 2026', Notes: '' },
  { PaymentID: 'PAY009', StudentID: 'S010', Amount: 3500, Date: '', DueDate: '2026-03-05', Status: 'Overdue', Method: '', RazorpayRef: '', Month: 'March 2026', Notes: '' },
  { PaymentID: 'PAY010', StudentID: 'S001', Amount: 3500, Date: '2026-02-02', DueDate: '2026-02-05', Status: 'Paid', Method: 'Razorpay', RazorpayRef: 'pay_N0xyz789', Month: 'February 2026', Notes: '' },
  { PaymentID: 'PAY011', StudentID: 'S002', Amount: 4000, Date: '2026-02-01', DueDate: '2026-02-05', Status: 'Paid', Method: 'Cash', RazorpayRef: '', Month: 'February 2026', Notes: '' },
];

export const mockEnrollment = [
  { InquiryID: 'INQ001', Name: 'Aditya Kumar', Phone: '+919901234567', Email: 'aditya.k@email.com', Instrument: 'Guitar', AgeGroup: '7+', Source: 'Website', Status: 'New', DemoDate: '', AssignedTo: 'Receptionist', Notes: 'Interested in acoustic guitar', CreatedAt: '2026-03-22T10:30:00' },
  { InquiryID: 'INQ002', Name: 'Sneha Gupta', Phone: '+919912345678', Email: 'sneha.g@email.com', Instrument: 'Piano', AgeGroup: '3-6 years', Source: 'Walk-in', Status: 'Demo Scheduled', DemoDate: '2026-03-25', AssignedTo: 'Mr. Giri', Notes: 'Mother brought her in for demo', CreatedAt: '2026-03-20T14:15:00' },
  { InquiryID: 'INQ003', Name: 'Rahul Venkat', Phone: '+919923456789', Email: 'rahul.v@email.com', Instrument: 'Drums', AgeGroup: 'Adult', Source: 'Referral', Status: 'Trial', DemoDate: '2026-03-18', AssignedTo: 'Mr. Cecil', Notes: 'Referred by S003 Arjun', CreatedAt: '2026-03-15T09:00:00' },
  { InquiryID: 'INQ004', Name: 'Divya Shetty', Phone: '+919934567890', Email: 'divya.s@email.com', Instrument: 'Carnatic Vocals', AgeGroup: '7+', Source: 'Website', Status: 'New', DemoDate: '', AssignedTo: 'Receptionist', Notes: '', CreatedAt: '2026-03-23T08:45:00' },
  { InquiryID: 'INQ005', Name: 'Karthik Bhat', Phone: '+919945678901', Email: 'karthik.b@email.com', Instrument: 'Western Vocals', AgeGroup: 'Adult', Source: 'Website', Status: 'Lost', DemoDate: '2026-03-10', AssignedTo: 'Mrs. Lakshmi', Notes: 'Did not respond after demo', CreatedAt: '2026-03-05T16:30:00' },
];

export const mockAttendance = [
  { AttendanceID: 'ATT001', StudentID: 'S001', ClassID: 'CLS001', Date: '2026-03-23', Status: 'Present', MarkedBy: 'Mr. Cecil' },
  { AttendanceID: 'ATT002', StudentID: 'S005', ClassID: 'CLS001', Date: '2026-03-23', Status: 'Present', MarkedBy: 'Mr. Cecil' },
  { AttendanceID: 'ATT003', StudentID: 'S003', ClassID: 'CLS003', Date: '2026-03-23', Status: 'Absent', MarkedBy: 'Mr. Cecil' },
  { AttendanceID: 'ATT004', StudentID: 'S010', ClassID: 'CLS003', Date: '2026-03-23', Status: 'Present', MarkedBy: 'Mr. Cecil' },
  { AttendanceID: 'ATT005', StudentID: 'S002', ClassID: 'CLS002', Date: '2026-03-22', Status: 'Present', MarkedBy: 'Mr. Giri' },
  { AttendanceID: 'ATT006', StudentID: 'S004', ClassID: 'CLS004', Date: '2026-03-22', Status: 'Late', MarkedBy: 'Mrs. Lakshmi' },
  { AttendanceID: 'ATT007', StudentID: 'S006', ClassID: 'CLS005', Date: '2026-03-22', Status: 'Present', MarkedBy: 'Mrs. Lakshmi' },
  { AttendanceID: 'ATT008', StudentID: 'S001', ClassID: 'CLS001', Date: '2026-03-21', Status: 'Present', MarkedBy: 'Mr. Cecil' },
  { AttendanceID: 'ATT009', StudentID: 'S005', ClassID: 'CLS001', Date: '2026-03-21', Status: 'Absent', MarkedBy: 'Mr. Cecil' },
  { AttendanceID: 'ATT010', StudentID: 'S009', ClassID: 'CLS007', Date: '2026-03-21', Status: 'Present', MarkedBy: 'Mrs. Lakshmi' },
];

export const mockDashboardStats = {
  students: { total: 10, active: 9, inactive: 1, newThisMonth: 2 },
  classes: { total: 7, active: 7, totalCapacity: 41, totalEnrolled: 11 },
  revenue: { thisMonth: 25000, lastMonth: 28500, growth: -12.3, pending: 13500 },
  attendance: { averageRate: 82, todayPresent: 6, todayAbsent: 1 },
  enrollment: { newInquiries: 2, demosScheduled: 1, enrolled: 0, lost: 1, conversionRate: 0 },
  schedule: { todayClasses: 3, upcomingClasses: 7 },
  recentActivity: [
    { type: 'enrollment', message: 'New inquiry: Divya Shetty — Carnatic Vocals', timestamp: '2026-03-23 08:45:00' },
    { type: 'payment', message: 'Payment received: Nikhil Hegde — ₹3,500 (UPI)', timestamp: '2026-03-23 07:30:00' },
    { type: 'attendance', message: 'Attendance marked: Guitar - Grade 3 (2 present)', timestamp: '2026-03-23 10:15:00' },
    { type: 'whatsapp', message: 'Daily schedule sent to 9 students', timestamp: '2026-03-23 08:00:00' },
    { type: 'schedule', message: 'Teacher changed: Drums Intermediate — Mr. Cecil → Mr. Giri', timestamp: '2026-03-22 16:00:00' },
    { type: 'enrollment', message: 'New inquiry: Aditya Kumar — Guitar', timestamp: '2026-03-22 10:30:00' },
    { type: 'payment', message: 'Payment overdue: Arjun Reddy — ₹3,500', timestamp: '2026-03-22 09:00:00' },
  ],
};

export const mockSchedule = [
  { ScheduleID: 'SCH001', Class: 'Guitar - Grade 3', Subject: 'Acoustic Guitar Practice', Teacher: 'Mr. Cecil', Room: 'Studio A', Date: '2026-03-24', Time: '10:00', Status: 'Active' },
  { ScheduleID: 'SCH002', Class: 'Piano - Beginners', Subject: 'Piano Basics', Teacher: 'Mr. Giri', Room: 'Studio B', Date: '2026-03-24', Time: '11:30', Status: 'Active' },
  { ScheduleID: 'SCH003', Class: 'Carnatic Vocals - Grade 2', Subject: 'Ragam Practice', Teacher: 'Mrs. Lakshmi', Room: 'Studio C', Date: '2026-03-24', Time: '14:00', Status: 'Active' },
  { ScheduleID: 'SCH004', Class: 'Drums - Intermediate', Subject: 'Percussion Workshop', Teacher: 'Mr. Cecil', Room: 'Studio A', Date: '2026-03-24', Time: '16:00', Status: 'Active' },
  { ScheduleID: 'SCH005', Class: 'Hindustani Vocals - Beginners', Subject: 'Raag Introduction', Teacher: 'Mrs. Lakshmi', Room: 'Studio C', Date: '2026-03-24', Time: '17:00', Status: 'Active' },
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
  SCHOOL_NAME: 'Muzigal',
  WEBHOOK_SECRET: '(hidden)',
  JWT_SECRET: '(hidden)',
  ADMIN_EMAILS: 'aldrin@atc.xyz,cecil@muzigal.com,giri@muzigal.com',
  RAZORPAY_KEY_ID: '(hidden)',
  RAZORPAY_KEY_SECRET: '(hidden)',
  ACADEMY_NAME: 'Muzigal',
  ACADEMY_PHONE: '+919403890891',
  ACADEMY_EMAIL: 'muzigal.borewell@gmail.com',
};
