import { useEffect, useState } from 'react';
import { Users, BookOpen, IndianRupee, AlertCircle } from 'lucide-react';
import { activeApi as api } from '../../api/client';
import { formatCurrency, formatDate } from '../../lib/utils';
import { StatCard, Card, Badge } from '@zoo/ui';

function Skeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white border border-zinc-200 rounded-xl p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-3 w-20 bg-zinc-200 rounded" />
              <div className="h-7 w-16 bg-zinc-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.dashboardStats()
      .then((res: any) => {
        if (res.status === 'ok' && res.data) {
          setStats(res.data);
        } else {
          setError(res.message || 'Failed to load dashboard');
        }
      })
      .catch((err: any) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton />;

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
        <AlertCircle size={16} />
        {error}
      </div>
    );
  }

  const s = stats?.students || {};
  const c = stats?.classes || {};
  const r = stats?.revenue || {};
  const e = stats?.enrollment || {};
  const activity = stats?.recentActivity || [];

  const pipeline: Record<string, number> = {
    'New': e.newInquiries || 0,
    'Demo Scheduled': e.demosScheduled || 0,
    'Trial': 0,
    'Enrolled': e.enrolled || 0,
    'Lost': e.lost || 0,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Students"
          value={s.total ?? 0}
          icon={<Users size={20} />}
          trend={s.newThisMonth ? `+${s.newThisMonth} this month` : undefined}
          trendUp={true}
        />
        <StatCard
          label="Active Classes"
          value={c.active ?? 0}
          icon={<BookOpen size={20} />}
          trend={`${c.totalEnrolled ?? 0}/${c.totalCapacity ?? 0} enrolled`}
        />
        <StatCard
          label="Revenue This Month"
          value={formatCurrency(r.thisMonth ?? 0)}
          icon={<IndianRupee size={20} />}
          trend={r.growth ? `${r.growth > 0 ? '+' : ''}${r.growth}%` : undefined}
          trendUp={r.growth > 0}
        />
        <StatCard
          label="Pending Payments"
          value={formatCurrency(r.pending ?? 0)}
          icon={<AlertCircle size={20} />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Recent Activity">
          {activity.length === 0 ? (
            <p className="text-sm text-zinc-400">No recent activity</p>
          ) : (
            <ul className="space-y-3">
              {activity.slice(0, 8).map((item: any, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                    item.type === 'payment' ? 'bg-emerald-500' :
                    item.type === 'enrollment' ? 'bg-blue-500' :
                    item.type === 'whatsapp' ? 'bg-green-500' :
                    item.type === 'attendance' ? 'bg-violet-500' :
                    'bg-zinc-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-700">{item.message}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{item.timestamp}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Enrollment Pipeline">
          <div className="space-y-3">
            {Object.entries(pipeline).map(([stage, count]) => (
              <div key={stage} className="flex items-center justify-between">
                <Badge variant={stage}>{stage}</Badge>
                <span className="text-sm font-semibold text-zinc-900">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
