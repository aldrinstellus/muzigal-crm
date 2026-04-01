import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './auth/ProtectedRoute';

const Login = lazy(() => import('./pages/login'));
const Dashboard = lazy(() => import('./pages/admin/index'));
const Students = lazy(() => import('./pages/admin/students'));
const Classes = lazy(() => import('./pages/admin/classes'));
const Teachers = lazy(() => import('./pages/admin/teachers'));
const Enrollment = lazy(() => import('./pages/admin/enrollment'));
const Payments = lazy(() => import('./pages/admin/payments'));
const Attendance = lazy(() => import('./pages/admin/attendance'));
const Reports = lazy(() => import('./pages/admin/reports'));
const WhatsApp = lazy(() => import('./pages/admin/whatsapp'));
const Settings = lazy(() => import('./pages/admin/settings'));
const PublicEnrollment = lazy(() => import('./pages/index'));

function Loading() {
  return <div className="flex items-center justify-center min-h-screen text-muted-foreground">Loading…</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/enroll" element={<PublicEnrollment />} />

          {/* Admin (Protected) */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="students" element={<Students />} />
            <Route path="classes" element={<Classes />} />
            <Route path="teachers" element={<Teachers />} />
            <Route path="enrollment" element={<Enrollment />} />
            <Route path="payments" element={<Payments />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="reports" element={<Reports />} />
            <Route path="whatsapp" element={<WhatsApp />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
