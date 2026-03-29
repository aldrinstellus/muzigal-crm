export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: string | Date): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatPhone(phone: string): string {
  if (!phone) return '';
  const clean = phone.replace(/\D/g, '');
  if (clean.length === 10) return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
  if (clean.length === 12 && clean.startsWith('91')) return `+91 ${clean.slice(2, 7)} ${clean.slice(7)}`;
  return phone;
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Present: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Enrolled: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    'Demo Scheduled': 'bg-blue-50 text-blue-700 border-blue-200',
    Trial: 'bg-violet-50 text-violet-700 border-violet-200',
    New: 'bg-sky-50 text-sky-700 border-sky-200',
    Overdue: 'bg-red-50 text-red-700 border-red-200',
    Cancelled: 'bg-zinc-100 text-zinc-500 border-zinc-200',
    Absent: 'bg-red-50 text-red-700 border-red-200',
    Late: 'bg-amber-50 text-amber-700 border-amber-200',
    Lost: 'bg-zinc-100 text-zinc-400 border-zinc-200',
    Inactive: 'bg-zinc-100 text-zinc-400 border-zinc-200',
  };
  return map[status] || 'bg-zinc-100 text-zinc-600 border-zinc-200';
}
