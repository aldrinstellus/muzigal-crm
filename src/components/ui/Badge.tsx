import { cn, statusColor } from '../../lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: string;
  className?: string;
}

export default function Badge({ children, variant, className }: BadgeProps) {
  const colors = variant ? statusColor(variant) : 'bg-zinc-100 text-zinc-600 border-zinc-200';

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border',
        colors,
        className
      )}
    >
      {children}
    </span>
  );
}
