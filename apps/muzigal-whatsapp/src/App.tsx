import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './auth/ProtectedRoute';

const Login = lazy(() => import('./pages/login'));
const Dashboard = lazy(() => import('./pages/dashboard'));
const Broadcast = lazy(() => import('./pages/broadcast'));
const Test = lazy(() => import('./pages/test'));
const Settings = lazy(() => import('./pages/settings'));
const Students = lazy(() => import('./pages/students'));
const Guide = lazy(() => import('./pages/guide'));

function Loading() {
  return <div className="flex items-center justify-center min-h-screen text-muted-foreground">Loading…</div>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="broadcast" element={<Broadcast />} />
            <Route path="test" element={<Test />} />
            <Route path="students" element={<Students />} />
            <Route path="guide" element={<Guide />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
