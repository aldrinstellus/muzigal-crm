import { cn, statusColor } from "../lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function Badge({ children, variant, className, icon }: BadgeProps) {
  const colors = variant
    ? statusColor(variant)
    : "bg-muted text-muted-foreground border-border";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-sm font-medium rounded-full border",
        colors,
        className
      )}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}
