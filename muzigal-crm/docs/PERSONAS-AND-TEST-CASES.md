# Muzigal CRM — Personas and Test Cases

> **109 tests across 4 suites, covering 5 personas and 3 cross-persona workflows**

---

## Personas

### 1. Receptionist (Front Desk Staff)

**Role**: First point of contact. Handles walk-ins, phone inquiries, student lookups, demo scheduling, and new registrations.

**Pages used**: Enrollment Pipeline, Students, Classes

**Key workflows**:
- Handle walk-in inquiry (create lead, assign to teacher)
- Schedule demo class (move lead to "Demo Scheduled")
- Look up student by name or phone
- Check class availability and capacity
- Register a new student with full details
- Answer parent questions about schedules and fees

**Test coverage**: 7 tests
- Create lead from walk-in
- Schedule demo class
- Search by name
- Search by phone
- Get student details
- List active classes with capacity
- Register new student

---

### 2. Teacher (Cecil, Giri, Lakshmi)

**Role**: Conducts classes. Marks attendance. Views enrolled students.

**Pages used**: Attendance, Classes, Students

**Key workflows**:
- View classes assigned to me
- See enrolled students in my class
- Mark attendance (Present / Absent / Late)
- View attendance history for a class on a date

**Test coverage**: 6 tests
- List classes by teacher
- View enrolled students in a class
- Mark present
- Mark absent
- Mark late
- View attendance for class + date

---

### 3. Academy Owner (Cecil & Giri)

**Role**: Full access. Revenue tracking, student management, teacher oversight, emergency broadcasts, strategic decisions.

**Pages used**: Dashboard, Reports, Students, Teachers, Payments, WhatsApp, Settings

**Key workflows**:
- View dashboard overview (students, classes, revenue, pending, activity)
- Track monthly revenue and payment methods
- Monitor enrollment pipeline
- Manage students (add, deactivate, filter)
- Add guest teachers
- Send WhatsApp broadcasts (all students or specific class)
- Review attendance reports

**Test coverage**: 12 tests
- Dashboard stats (students, classes, revenue)
- Enrollment pipeline visibility
- Recent activity feed
- Monthly revenue breakdown
- Revenue by payment method
- Pending payment total
- View all students
- Deactivate student
- Filter inactive students
- View all teachers
- Add guest teacher
- Send holiday announcement
- Send class-specific message

---

### 4. Parent

**Role**: External user. Enrolls child via public form. Checks payment status.

**Pages used**: Public Enrollment Form (no login), Payments (future portal)

**Key workflows**:
- Submit enrollment form for child (3-6 years or 7+)
- Submit enrollment form for themselves (adult learner)
- View payment history for their child
- See overdue payments

**Test coverage**: 4 tests
- Enroll 5-year-old (Foundation)
- Enroll adult learner
- View child's payment history
- See overdue payments

---

### 5. System Administrator (Aldrin)

**Role**: Technical admin. Manages configuration, monitors health, tests integrations, handles deployment.

**Pages used**: Settings, Dashboard

**Key workflows**:
- Verify system is operational (health check)
- View and update configuration values
- Test WhatsApp integration
- Authenticate as admin

**Test coverage**: 5 tests
- Health check (status + trigger count)
- View all config values
- Update daily send hour
- Update school name
- Send test WhatsApp message
- Login as admin

---

## Cross-Persona Workflows

### Workflow 1: Full Student Lifecycle

**Personas involved**: Parent → Receptionist → Teacher → Owner → System

**Steps**:
1. Parent submits enrollment form on website
2. Receptionist schedules demo class
3. Teacher runs trial session
4. Owner converts inquiry to enrolled student
5. System sends WhatsApp welcome message
6. First payment recorded
7. First attendance marked
8. Dashboard reflects new student

**Test coverage**: 1 comprehensive test (8 sequential assertions)

---

### Workflow 2: Emergency Scenario

**Personas involved**: Owner → System → Students

**Steps**:
1. Owner checks teacher's assigned classes
2. Owner reassigns Guitar class to substitute teacher
3. System sends WhatsApp to Guitar students about teacher change
4. Owner cancels Drums class
5. System sends cancellation WhatsApp to Drums students
6. Changes reflected in class management

**Test coverage**: 1 comprehensive test (6 sequential assertions)

---

### Workflow 3: Month-End Billing

**Personas involved**: System → Owner → Receptionist → Parent

**Steps**:
1. System generates pending payment records
2. Owner reviews overdue payments
3. Receptionist collects cash payment at front desk
4. System generates Razorpay payment link for overdue student
5. System sends WhatsApp reminder with payment link
6. Revenue report updated

**Test coverage**: 1 comprehensive test (5 sequential assertions)

---

## Test Suite Summary

| Suite | File | Tests | Focus |
|-------|------|-------|-------|
| Mock API Unit Tests | `mockApi.test.ts` | 30 | CRUD operations for all 8 entities |
| Utility Tests | `utils.test.ts` | 22 | Currency, dates, phones, badges, CSS |
| UAT Scenarios | `uat.test.ts` | 16 | 11 end-to-end business scenarios |
| Persona Tests | `persona-tests.test.ts` | 41 | 5 personas + 3 cross-persona workflows |
| **Total** | **4 files** | **109** | **Full coverage** |

## Running Tests

```bash
# Run all tests
npm test

# Run with watch mode
npm run test:watch

# Run specific suite
npx vitest run src/__tests__/persona-tests.test.ts

# Run with coverage report
npm run test:coverage
```

## Mock Data Summary

| Entity | Records | Key Data Points |
|--------|---------|----------------|
| Students | 10 | Guitar, Piano, Drums, Vocals, Violin students ages 6-25 |
| Classes | 7 | All instruments, 3 teachers, 3 studios, ₹2,500-4,500/mo |
| Teachers | 3 | Cecil (strings+drums), Giri (keys+violin), Lakshmi (vocals) |
| Payments | 11 | Mix of Paid, Pending, Overdue — Razorpay, UPI, Cash |
| Enrollment | 5 | Pipeline stages: New, Demo, Trial, Lost |
| Attendance | 10 | Present, Absent, Late across 3 days |
| Config | 17 | All system configuration keys |

All mock data uses realistic Bangalore names, Indian phone numbers (+91), and INR currency.
