import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, MessageCircle, Users, CheckCircle, AlertCircle, BookOpen, Clock } from 'lucide-react';
import { activeApi as api } from '../api/client';
import { Card, StatCard } from '@zoo/ui';
import { cn, formatDate } from '../lib/utils';
import type { MessageLogEntry, Student, Enquiry } from '../types';

const typeColors: Record<string, string> = {
  daily_schedule: 'bg-blue-100 text-blue-700',
  broadcast: 'bg-emerald-100 text-emerald-700',
  teacher_change: 'bg-amber-100 text-amber-700',
  cancellation: 'bg-red-100 text-red-700',
  reschedule: 'bg-violet-100 text-violet-700',
  test: 'bg-zinc-100 text-zinc-700',
};

const typeLabels: Record<string, string> = {
  daily_schedule: 'Schedule',
  broadcast: 'Broadcast',
  teacher_change: 'Teacher Change',
  cancellation: 'Cancellation',
  reschedule: 'Reschedule',
  test: 'Test',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [log, setLog] = useState<MessageLogEntry[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [expiringCount, setExpiringCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getMessageLog?.()?.catch(() => ({ data: [] })) || Promise.resolve({ data: [] }),
      api.listStudents()?.catch(() => ({ data: [] })),
      api.listEnquiries?.()?.catch(() => ({ data: [] })) || Promise.resolve({ data: [] }),
      api.listStudents?.({ expiring_days: '30' })?.catch(() => ({ data: [] })) || Promise.resolve({ data: [] }),
    ]).then(([logRes, studentsRes, enquiriesRes, expiringRes]) => {
      if (logRes?.status === 'ok' || logRes?.data) setLog((logRes.data || []) as MessageLogEntry[]);
      if (studentsRes?.status === 'ok') setStudents(((studentsRes.data as Student[]) || []).filter(s => s.Active));
      if (enquiriesRes?.status === 'ok') setEnquiries((enquiriesRes.data || []) as Enquiry[]);
      if (expiringRes?.status === 'ok') setExpiringCount(((expiringRes.data as Student[]) || []).length);
    }).finally(() => setLoading(false));
  }, []);

  const totalSent = log.reduce((sum, m) => sum + m.delivered, 0);
  const totalFailed = log.reduce((sum, m) => sum + m.failed, 0);
  const deliveryRate = totalSent + totalFailed > 0
    ? Math.round((totalSent / (totalSent + totalFailed)) * 100)
    : 100;

  if (loading) {
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

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Students"
          value={students.length}
          icon={<Users size={20} />}
          trend={`${enquiries.length} enquiries`}
        />
        <StatCard
          label="Messages Sent"
          value={totalSent}
          icon={<Send size={20} />}
          trend={`${log.length} total messages`}
        />
        <StatCard
          label="Delivery Rate"
          value={`${deliveryRate}%`}
          icon={<CheckCircle size={20} />}
          trendUp={deliveryRate >= 95}
        />
        <StatCard
          label="Expiring Soon"
          value={expiringCount}
          icon={<Clock size={20} />}
          trend="within 30 days"
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => navigate('/dashboard/broadcast')}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
        >
          <Send size={14} />
          Send Broadcast
        </button>
        <button
          onClick={() => navigate('/dashboard/test')}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg transition-colors"
        >
          <MessageCircle size={14} />
          Send Test
        </button>
        <button
          onClick={() => navigate('/dashboard/students')}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg transition-colors"
        >
          <BookOpen size={14} />
          View Students
        </button>
      </div>

      {/* Message Log */}
      <Card title="Recent Messages">
        {log.length === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-8">No messages sent yet</p>
        ) : (
          <div className="space-y-2">
            {log.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-zinc-50 transition-colors">
                <span className={cn('px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase shrink-0 mt-0.5', typeColors[entry.type] || 'bg-zinc-100 text-zinc-600')}>
                  {typeLabels[entry.type] || entry.type}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-700 truncate">{entry.message}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {entry.sentBy} · {formatDate(entry.sentAt)} · {entry.delivered}/{entry.recipients} delivered
                    {entry.failed > 0 && <span className="text-red-500"> · {entry.failed} failed</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
