import { cn } from "../lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ label, value, icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-card text-card-foreground border border-border rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
          {trend && (
            <p
              className={cn(
                "mt-1 text-xs font-medium",
                trendUp ? "text-emerald-600" : "text-red-500"
              )}
            >
              {trendUp ? "+" : ""}{trend}
            </p>
          )}
        </div>
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
    </div>
  );
}
