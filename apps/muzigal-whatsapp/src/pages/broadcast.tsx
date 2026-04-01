import { useEffect, useState } from 'react';
import { Send, AlertCircle, CheckCircle, Users, User, MessageCircle } from 'lucide-react';
import { activeApi as api } from '../api/client';
import { cn } from '../lib/utils';
import { Card } from '@zoo/ui';

type TargetType = 'all' | 'class' | 'student';

type ClassItem = { ClassID: string; Instrument: string; Level: string; Name: string };
type StudentItem = { StudentID: string; Name: string; Phone: string; Class: string; Active: boolean };

export default function Broadcast() {
  const [targetType, setTargetType] = useState<TargetType>('all');
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.listClasses()
      .then((res) => {
        if (res.status === 'ok') setClasses((res.data as ClassItem[]) || []);
      })
      .catch(() => {});
    api.listStudents()
      .then((res) => {
        if (res.status === 'ok') setStudents(((res.data as StudentItem[]) || []).filter(s => s.Active));
      })
      .catch(() => {});
  }, []);

  const handleSend = async () => {
    if (!message.trim()) return;
    const targetValue = targetType === 'class' ? selectedClass
      : targetType === 'student' ? selectedStudent
      : 'all';
    if (targetType === 'class' && !selectedClass) {
      setError('Please select a class');
      return;
    }
    if (targetType === 'student' && !selectedStudent) {
      setError('Please select a student');
      return;
    }
    setSending(true);
    setError('');
    setSuccess('');
    try {
      const res = await api.sendOverride(targetType, targetValue, message.trim(), 'admin');
      if (res.status === 'ok') {
        const sent = (res as { sent?: number }).sent;
        setSuccess(`Message sent successfully${sent ? ` to ${sent} recipient${sent > 1 ? 's' : ''}` : ''}`);
        setMessage('');
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(res.message || 'Failed to send message');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSending(false);
    }
  };

  const filteredStudents = selectedClass
    ? students.filter(s => {
        const cls = classes.find(c => c.ClassID === selectedClass);
        return cls && s.Class === cls.Name;
      })
    : students;

  const recipientCount = targetType === 'all' ? students.length
    : targetType === 'class' ? filteredStudents.length
    : 1;

  return (
    <div className="space-y-6 max-w-2xl">
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

      <Card title="Send WhatsApp Message">
        <div className="space-y-4">
          {/* Target type */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Send to</label>
            <div className="flex gap-2">
              {([
                { value: 'all', label: 'All Students', icon: Users },
                { value: 'class', label: 'By Class', icon: MessageCircle },
                { value: 'student', label: 'Individual', icon: User },
              ] as const).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setTargetType(opt.value); setError(''); }}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-colors',
                    targetType === opt.value
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                  )}
                >
                  <opt.icon size={16} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Class selector */}
          {targetType === 'class' && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              >
                <option value="">Select class</option>
                {classes.map((cls) => (
                  <option key={cls.ClassID} value={cls.ClassID}>
                    {cls.Instrument} - {cls.Level}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Student selector */}
          {targetType === 'student' && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Student</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              >
                <option value="">Select student</option>
                {students.map((s) => (
                  <option key={s.StudentID} value={s.StudentID}>
                    {s.Name} — {s.Class}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={4}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Quick templates */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">Quick Templates</label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'Test', text: 'CRM test: If you receive this, WhatsApp integration is working.' },
                { label: 'Closure', text: 'Muzigal will be closed on [date] for [reason]. Classes resume [date].' },
                { label: 'Fee Reminder', text: 'Hi, your monthly fee is due. Please clear it at the earliest. - Muzigal' },
              ].map((tpl) => (
                <button
                  key={tpl.label}
                  onClick={() => setMessage(tpl.text)}
                  className="px-2.5 py-1 text-xs font-medium text-zinc-500 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Send button */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-zinc-400">
              {recipientCount} recipient{recipientCount !== 1 ? 's' : ''}
            </p>
            <button
              onClick={handleSend}
              disabled={sending || !message.trim()}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Send size={14} />
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
