import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  UserPlus,
  CreditCard,
  ClipboardCheck,
  BarChart3,
  MessageCircle,
  Settings,
} from 'lucide-react';
import { cn, getInitials } from '../../lib/utils';

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/students', icon: Users, label: 'Students' },
  { to: '/admin/classes', icon: BookOpen, label: 'Classes' },
  { to: '/admin/teachers', icon: GraduationCap, label: 'Teachers' },
  { to: '/admin/enrollment', icon: UserPlus, label: 'Enrollment' },
  { to: '/admin/payments', icon: CreditCard, label: 'Payments' },
  { to: '/admin/attendance', icon: ClipboardCheck, label: 'Attendance' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { to: '/admin/whatsapp', icon: MessageCircle, label: 'WhatsApp' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const userName = 'Admin User';

  return (
    <>
      {/* Mobile overlay */}
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
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-zinc-100">
          <span className="text-lg font-bold text-zinc-900 tracking-tight">ZOO</span>
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">CRM</span>
        </div>

        {/* Navigation */}
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
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-zinc-100 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center text-xs font-semibold">
              {getInitials(userName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 truncate">{userName}</p>
              <p className="text-xs text-zinc-400">Admin</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
