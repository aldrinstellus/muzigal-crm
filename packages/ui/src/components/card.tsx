import { cn } from "../lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
}

export function Card({ children, className, title, action }: CardProps) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground border border-border rounded-xl p-6",
        className
      )}
    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          )}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
