import { cn, statusColor } from "../lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: string;
  className?: string;
}

export function Badge({ children, variant, className }: BadgeProps) {
  const colors = variant
    ? statusColor(variant)
    : "bg-muted text-muted-foreground border-border";

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full border",
        colors,
        className
      )}
    >
      {children}
    </span>
  );
}
