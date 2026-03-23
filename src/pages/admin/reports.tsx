import { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
  PieChart, Pie, Cell,
} from 'recharts';
import { activeApi as api } from '../../api/client';
import { formatCurrency } from '../../lib/utils';
import Card from '../../components/ui/Card';

interface ReportData {
  monthlyRevenue?: Array<{ month: string; amount: number }>;
  attendanceRate?: Array<{ month: string; rate: number }>;
  enrollmentFunnel?: Array<{ name: string; value: number }>;
}

const PIE_COLORS = ['#2563eb', '#7c3aed', '#16a34a', '#d97706', '#9ca3af'];

function Skeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className={`bg-white border border-zinc-200 rounded-xl p-6 ${i === 0 ? 'lg:col-span-2' : ''}`}>
          <div className="animate-pulse">
            <div className="h-4 w-32 bg-zinc-200 rounded mb-4" />
            <div className="h-48 bg-zinc-100 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Reports() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.dashboardStats()
      .then((res) => {
        if (res.status === 'success' && res.data) {
          setData(res.data as unknown as ReportData);
        } else {
          setError(res.message || 'Failed to load reports');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Skeleton />;

  if (error) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
        <AlertCircle size={16} />{error}
      </div>
    );
  }

  const revenue = data?.monthlyRevenue || [
    { month: 'Jan', amount: 0 },
    { month: 'Feb', amount: 0 },
    { month: 'Mar', amount: 0 },
  ];

  const attendance = data?.attendanceRate || [
    { month: 'Jan', rate: 0 },
    { month: 'Feb', rate: 0 },
    { month: 'Mar', rate: 0 },
  ];

  const funnel = data?.enrollmentFunnel || [
    { name: 'New', value: 0 },
    { name: 'Demo', value: 0 },
    { name: 'Trial', value: 0 },
    { name: 'Enrolled', value: 0 },
    { name: 'Lost', value: 0 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Revenue Chart */}
      <Card title="Monthly Revenue" className="lg:col-span-2">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#71717a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#71717a' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatCurrency(v)} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '13px' }}
                formatter={(value) => [formatCurrency(Number(value)), 'Revenue']}
              />
              <Bar dataKey="amount" fill="#2563eb" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Attendance Chart */}
      <Card title="Attendance Rate">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={attendance}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#71717a' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#71717a' }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '13px' }}
                formatter={(value) => [`${value}%`, 'Attendance']}
              />
              <Line type="monotone" dataKey="rate" stroke="#2563eb" strokeWidth={2} dot={{ fill: '#2563eb', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Enrollment Funnel */}
      <Card title="Enrollment Funnel">
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={funnel}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
              >
                {funnel.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', fontSize: '13px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-3 mt-2">
          {funnel.map((item, i) => (
            <div key={item.name} className="flex items-center gap-1.5 text-xs text-zinc-600">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
              {item.name} ({item.value})
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
