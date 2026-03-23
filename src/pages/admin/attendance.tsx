import { useEffect, useState } from 'react';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';
import { activeApi as api } from '../../api/client';
import { cn } from '../../lib/utils';
import Card from '../../components/ui/Card';

type ClassItem = Record<string, unknown>;
type AttendanceRecord = Record<string, unknown>;

const statusOptions = ['Present', 'Absent', 'Late'] as const;
type Status = typeof statusOptions[number];

const statusStyles: Record<Status, { active: string; inactive: string }> = {
  Present: {
    active: 'bg-emerald-600 text-white border-emerald-600',
    inactive: 'text-emerald-700 border-emerald-200 hover:bg-emerald-50',
  },
  Absent: {
    active: 'bg-red-600 text-white border-red-600',
    inactive: 'text-red-700 border-red-200 hover:bg-red-50',
  },
  Late: {
    active: 'bg-amber-500 text-white border-amber-500',
    inactive: 'text-amber-700 border-amber-200 hover:bg-amber-50',
  },
};

export default function Attendance() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statuses, setStatuses] = useState<Record<string, Status>>({});

  // Load classes on mount
  useEffect(() => {
    api.listClasses()
      .then((res) => {
        if (res.status === 'ok') setClasses((res.data as ClassItem[]) || []);
      })
      .catch(() => {});
  }, []);

  // Load attendance when class/date changes
  useEffect(() => {
    if (!selectedClass || !date) return;
    setLoading(true);
    setError('');
    setSuccess('');
    api.getAttendance(selectedClass, date)
      .then((res) => {
        if (res.status === 'ok') {
          const data = (res.data as AttendanceRecord[]) || [];
          setRecords(data);
          const initial: Record<string, Status> = {};
          data.forEach((r) => {
            initial[r.studentId as string] = (r.status as Status) || 'Present';
          });
          setStatuses(initial);
        } else {
          setError(res.message || 'Failed to load attendance');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedClass, date]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const attendance = records.map((r) => ({
        studentId: r.studentId as string,
        studentName: r.studentName as string,
        status: statuses[r.studentId as string] || 'Present',
      }));
      const res = await api.markAttendance({
        classId: selectedClass,
        date,
        records: attendance,
      });
      if (res.status === 'ok') {
        setSuccess('Attendance saved successfully');
      } else {
        setError(res.message || 'Failed to save attendance');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = (studentId: string, status: Status) => {
    setStatuses((prev) => ({ ...prev, [studentId]: status }));
  };

  return (
    <div className="space-y-4 max-w-3xl">
      {/* Controls */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-zinc-700 mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="">Select class</option>
              {classes.map((cls, i) => (
                <option key={i} value={cls.id as string}>
                  {cls.instrument as string} - {cls.level as string} ({cls.day as string})
                </option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-48">
            <label className="block text-sm font-medium text-zinc-700 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </Card>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle size={14} />{error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
          <CheckCircle size={14} />{success}
        </div>
      )}

      {/* Student list */}
      {selectedClass && (
        <Card>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-zinc-100 rounded animate-pulse" />
              ))}
            </div>
          ) : records.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-8">No students found for this class</p>
          ) : (
            <>
              <div className="space-y-2">
                {records.map((record) => {
                  const studentId = record.studentId as string;
                  const current = statuses[studentId] || 'Present';
                  return (
                    <div
                      key={studentId}
                      className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-zinc-50 transition-colors"
                    >
                      <span className="text-sm font-medium text-zinc-900">
                        {record.studentName as string}
                      </span>
                      <div className="flex gap-1.5">
                        {statusOptions.map((status) => (
                          <button
                            key={status}
                            onClick={() => toggleStatus(studentId, status)}
                            className={cn(
                              'px-3 py-1 text-xs font-medium rounded-md border transition-colors',
                              current === status
                                ? statusStyles[status].active
                                : statusStyles[status].inactive
                            )}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-4 mt-4 border-t border-zinc-100">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Attendance'}
                </button>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
