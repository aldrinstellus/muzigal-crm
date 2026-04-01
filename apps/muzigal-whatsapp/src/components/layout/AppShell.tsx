import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

const titleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/students': 'Students',
  '/dashboard/broadcast': 'Broadcast',
  '/dashboard/test': 'Test Message',
  '/dashboard/guide': 'Guide',
  '/dashboard/settings': 'Settings',
};

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const pageTitle = titleMap[location.pathname] || 'Muzigal WhatsApp';

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
