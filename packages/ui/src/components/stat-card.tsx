import { cn } from "../lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  iconLabel?: string;
}

export function StatCard({ label, value, icon, trend, trendUp, iconLabel }: StatCardProps) {
  const trendLabel = trend
    ? `${trendUp ? "Up" : "Down"} ${trend}`
    : undefined;

  return (
    <div className="bg-card text-card-foreground border border-border rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
          {trend && (
            <p
              className={cn(
                "mt-1 text-sm font-medium",
                trendUp
                  ? "text-[var(--color-success)]"
                  : "text-[var(--color-error)]"
              )}
              aria-label={trendLabel}
            >
              {trendUp ? "↑ +" : "↓ "}{trend}
            </p>
          )}
        </div>
        <div
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary"
          role={iconLabel ? "img" : "presentation"}
          aria-label={iconLabel}
          aria-hidden={!iconLabel}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
