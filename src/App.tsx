import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import Dashboard from './pages/admin/index';
import Students from './pages/admin/students';
import Classes from './pages/admin/classes';
import Teachers from './pages/admin/teachers';
import Enrollment from './pages/admin/enrollment';
import Payments from './pages/admin/payments';
import Attendance from './pages/admin/attendance';
import Reports from './pages/admin/reports';
import Settings from './pages/admin/settings';
import PublicEnrollment from './pages/index';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<PublicEnrollment />} />

        {/* Admin */}
        <Route path="/admin" element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="classes" element={<Classes />} />
          <Route path="teachers" element={<Teachers />} />
          <Route path="enrollment" element={<Enrollment />} />
          <Route path="payments" element={<Payments />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
