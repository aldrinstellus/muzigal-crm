import { useEffect, useState } from 'react';
import { Users, BookOpen, IndianRupee, AlertCircle } from 'lucide-react';
import { activeApi as api } from '../../api/client';
import { formatCurrency, formatDate } from '../../lib/utils';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

interface DashboardData {
  totalStudents?: number;
  activeClasses?: number;
  revenueThisMonth?: number;
  pendingPayments?: number;
  recentActivity?: Array<{
    type: string;
    description: string;
    date: string;
  }>;
  enrollmentPipeline?: Record<string, number>;
  studentsTrend?: string;
  revenueTrend?: string;
}

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white border border-zinc-200 rounded-xl p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-4 w-32 bg-zinc-200 rounded" />
              <div className="h-3 w-full bg-zinc-100 rounded" />
              <div className="h-3 w-3/4 bg-zinc-100 rounded" />
              <div className="h-3 w-5/6 bg-zinc-100 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.dashboardStats()
      .then((res) => {
        if (res.status === 'success' && res.data) {
          setData(res.data as unknown as DashboardData);
        } else {
          setError(res.message || 'Failed to load dashboard');
        }
      })
      .catch((err) => setError(err.message))
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

  const stats = data || {};
  const pipeline = stats.enrollmentPipeline || {};
  const activity = stats.recentActivity || [];

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Students"
          value={stats.totalStudents ?? 0}
          icon={<Users size={20} />}
          trend={stats.studentsTrend}
          trendUp={true}
        />
        <StatCard
          label="Active Classes"
          value={stats.activeClasses ?? 0}
          icon={<BookOpen size={20} />}
        />
        <StatCard
          label="Revenue This Month"
          value={formatCurrency(stats.revenueThisMonth ?? 0)}
          icon={<IndianRupee size={20} />}
          trend={stats.revenueTrend}
          trendUp={true}
        />
        <StatCard
          label="Pending Payments"
          value={stats.pendingPayments ?? 0}
          icon={<AlertCircle size={20} />}
        />
      </div>

      {/* Lower section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activity */}
        <Card title="Recent Activity">
          {activity.length === 0 ? (
            <p className="text-sm text-zinc-400">No recent activity</p>
          ) : (
            <ul className="space-y-3">
              {activity.slice(0, 8).map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-700">{item.description}</p>
                    <p className="text-xs text-zinc-400 mt-0.5">{formatDate(item.date)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Enrollment Pipeline */}
        <Card title="Enrollment Pipeline">
          {Object.keys(pipeline).length === 0 ? (
            <p className="text-sm text-zinc-400">No enrollment data</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(pipeline).map(([stage, count]) => (
                <div key={stage} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={stage}>{stage}</Badge>
                  </div>
                  <span className="text-sm font-semibold text-zinc-900">{count as number}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
