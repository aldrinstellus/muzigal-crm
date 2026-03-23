import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const titleMap: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/students': 'Students',
  '/admin/classes': 'Classes',
  '/admin/teachers': 'Teachers',
  '/admin/enrollment': 'Enrollment',
  '/admin/payments': 'Payments',
  '/admin/attendance': 'Attendance',
  '/admin/reports': 'Reports',
  '/admin/whatsapp': 'WhatsApp',
  '/admin/settings': 'Settings',
};

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const pageTitle = titleMap[location.pathname] || 'Muzigal CRM';

  return (
    <div className="flex h-screen bg-surface">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar title={pageTitle} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
