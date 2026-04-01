import { Bell, Menu } from 'lucide-react';
import { getInitials } from '../../lib/utils';
import { isDemo } from '../../lib/mode';

interface TopBarProps {
  title: string;
  onMenuClick: () => void;
}

export default function TopBar({ title, onMenuClick }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-zinc-200">
      <div className="flex items-center justify-between h-14 px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 transition-colors lg:hidden"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-semibold text-zinc-900">{title}</h1>
          {isDemo() && (
            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-semibold rounded-full uppercase tracking-wide">
              Demo
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full" />
          </button>
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-semibold ml-1">
            {getInitials('Admin User')}
          </div>
        </div>
      </div>
    </header>
  );
}
