import { NavLink, useNavigate } from 'react-router-dom';
import { CLIENT } from '../../config/client';
import {
  LayoutDashboard,
  Send,
  MessageCircle,
  Settings,
  LogOut,
  Users,
} from 'lucide-react';
import { cn, getInitials } from '../../lib/utils';
import { useAuth } from '../../auth/useAuth';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/dashboard/students', icon: Users, label: 'Students' },
  { to: '/dashboard/broadcast', icon: Send, label: 'Broadcast' },
  { to: '/dashboard/test', icon: MessageCircle, label: 'Test Message' },
  { to: '/dashboard/settings', icon: Settings, label: 'Settings' },
];

function UserSection() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const name = user?.name || 'Admin User';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="border-t border-zinc-100 px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center text-xs font-semibold">
          {getInitials(name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-900 truncate">{name}</p>
          <p className="text-xs text-zinc-400 truncate">{user?.email || 'Admin'}</p>
        </div>
        <button onClick={handleLogout} className="p-1.5 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors" title="Sign out">
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-60 bg-white border-r border-zinc-200 flex flex-col transition-transform duration-200',
          'lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="px-6 py-4 border-b border-zinc-100">
          <p className="text-sm font-bold text-zinc-900 tracking-tight">{CLIENT.name}-WhatsApp</p>
          <p className="text-[10px] text-zinc-400">Powered by ZOO-CRM</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mb-0.5',
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <UserSection />
      </aside>
    </>
  );
}
