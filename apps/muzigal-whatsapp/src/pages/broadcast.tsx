import { useEffect, useState, useMemo } from 'react';
import { Send, AlertCircle, CheckCircle, Users, User, MessageCircle, Music, Clock } from 'lucide-react';
import { activeApi as api } from '../api/client';
import { cn } from '../lib/utils';
import { Card } from '@zoo/ui';
import type { Student, DerivedClass } from '../types';

type TargetType = 'all' | 'class' | 'subject' | 'student' | 'expiring';

const SUBJECTS = ['Piano', 'Guitar', 'Drums', 'Carnatic Vocals', 'Western Vocals', 'Violin', 'Hindustani Vocals'];

export default function Broadcast() {
  const [targetType, setTargetType] = useState<TargetType>('all');
  const [classes, setClasses] = useState<DerivedClass[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [expiryDays, setExpiryDays] = useState('30');
  const [studentSearch, setStudentSearch] = useState('');
  const [classSearch, setClassSearch] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.listClasses()
      .then((res) => {
        if (res.status === 'ok') setClasses((res.data as DerivedClass[]) || []);
      })
      .catch(() => {});
    api.listStudents()
      .then((res) => {
        if (res.status === 'ok') setStudents(((res.data as Student[]) || []).filter(s => s.Active));
      })
      .catch(() => {});
  }, []);

  // Filtered classes for search
  const filteredClasses = useMemo(() => {
    if (!classSearch) return classes;
    const q = classSearch.toLowerCase();
    return classes.filter(c => c.Name.toLowerCase().includes(q));
  }, [classes, classSearch]);

  // Filtered students for search
  const filteredStudents = useMemo(() => {
    let result = students;
    if (targetType === 'class' && selectedClass) {
      const cls = classes.find(c => c.ClassID === selectedClass);
      if (cls) result = result.filter(s => cls.StudentIDs.includes(s.StudentID));
    }
    if (studentSearch) {
      const q = studentSearch.toLowerCase();
      result = result.filter(s =>
        s.Name.toLowerCase().includes(q) ||
        s.StudentID.toLowerCase().includes(q) ||
        s.Phone.includes(q)
      );
    }
    return result;
  }, [students, targetType, selectedClass, classes, studentSearch]);

  // Students by subject
  const subjectStudents = useMemo(() => {
    if (!selectedSubject) return [];
    return students.filter(s => s.Subjects === selectedSubject || s.Instrument === selectedSubject);
  }, [students, selectedSubject]);

  // Expiring students
  const expiringStudents = useMemo(() => {
    const days = parseInt(expiryDays) || 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);
    const now = new Date();
    return students.filter(s => {
      if (!s.ExpiryDate) return false;
      const exp = new Date(s.ExpiryDate);
      return exp <= cutoff && exp >= now;
    });
  }, [students, expiryDays]);

  // Recipient count
  const recipientCount = targetType === 'all' ? students.length
    : targetType === 'class' ? (classes.find(c => c.ClassID === selectedClass)?.StudentCount ?? 0)
    : targetType === 'subject' ? subjectStudents.length
    : targetType === 'expiring' ? expiringStudents.length
    : selectedStudent ? 1 : 0;

  const handleSend = async () => {
    if (!message.trim()) return;
    const targetValue = targetType === 'class' ? selectedClass
      : targetType === 'student' ? selectedStudent
      : targetType === 'subject' ? selectedSubject
      : targetType === 'expiring' ? `expiring_${expiryDays}`
      : 'all';
    if (targetType === 'class' && !selectedClass) { setError('Please select a class'); return; }
    if (targetType === 'student' && !selectedStudent) { setError('Please select a student'); return; }
    if (targetType === 'subject' && !selectedSubject) { setError('Please select a subject'); return; }
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

  const targets: { value: TargetType; label: string; icon: typeof Users }[] = [
    { value: 'all', label: 'All Students', icon: Users },
    { value: 'class', label: 'By Batch', icon: MessageCircle },
    { value: 'subject', label: 'By Subject', icon: Music },
    { value: 'student', label: 'Individual', icon: User },
    { value: 'expiring', label: 'Expiring', icon: Clock },
  ];

  // Recipients list for preview
  const recipientList = useMemo(() => {
    if (targetType === 'all') return students;
    if (targetType === 'class') {
      const cls = classes.find(c => c.ClassID === selectedClass);
      return cls ? students.filter(s => cls.StudentIDs.includes(s.StudentID)) : [];
    }
    if (targetType === 'subject') return subjectStudents;
    if (targetType === 'expiring') return expiringStudents;
    if (targetType === 'student') {
      const s = students.find(st => st.StudentID === selectedStudent);
      return s ? [s] : [];
    }
    return [];
  }, [targetType, students, classes, selectedClass, subjectStudents, expiringStudents, selectedStudent]);

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Left: Send form (3 cols) */}
      <div className="lg:col-span-3">
      <Card title="Send WhatsApp Message">
        <div className="space-y-4">
          {/* Target type */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Send to</label>
            <div className="flex flex-wrap gap-2">
              {targets.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setTargetType(opt.value); setError(''); }}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors',
                    targetType === opt.value
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                  )}
                >
                  <opt.icon size={14} />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Class/Batch selector */}
          {targetType === 'class' && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Batch</label>
              <input
                type="text"
                value={classSearch}
                onChange={(e) => setClassSearch(e.target.value)}
                placeholder="Search batches..."
                className="w-full px-3 py-2 mb-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <div className="max-h-48 overflow-y-auto border border-zinc-200 rounded-lg">
                {filteredClasses.length === 0 ? (
                  <p className="text-sm text-zinc-400 p-3">No batches found</p>
                ) : filteredClasses.map((cls) => (
                  <button
                    key={cls.ClassID}
                    onClick={() => setSelectedClass(cls.ClassID)}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm border-b border-zinc-100 last:border-0 transition-colors',
                      selectedClass === cls.ClassID
                        ? 'bg-emerald-50 text-emerald-700 font-medium'
                        : 'hover:bg-zinc-50 text-zinc-700'
                    )}
                  >
                    {cls.Name}
                    <span className="text-zinc-400 ml-2">({cls.StudentCount})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subject selector */}
          {targetType === 'subject' && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Subject</label>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((sub) => {
                  const count = students.filter(s => s.Subjects === sub || s.Instrument === sub).length;
                  return (
                    <button
                      key={sub}
                      onClick={() => setSelectedSubject(sub)}
                      className={cn(
                        'px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors',
                        selectedSubject === sub
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                      )}
                    >
                      {sub} <span className="opacity-60">({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Student selector */}
          {targetType === 'student' && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Student</label>
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search by name, ID, or phone..."
                className="w-full px-3 py-2 mb-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
              <div className="max-h-48 overflow-y-auto border border-zinc-200 rounded-lg">
                {filteredStudents.length === 0 ? (
                  <p className="text-sm text-zinc-400 p-3">No students found</p>
                ) : filteredStudents.slice(0, 50).map((s) => (
                  <button
                    key={s.StudentID}
                    onClick={() => setSelectedStudent(s.StudentID)}
                    className={cn(
                      'w-full text-left px-3 py-2 text-sm border-b border-zinc-100 last:border-0 transition-colors',
                      selectedStudent === s.StudentID
                        ? 'bg-emerald-50 text-emerald-700 font-medium'
                        : 'hover:bg-zinc-50 text-zinc-700'
                    )}
                  >
                    <span className="font-medium">{s.Name}</span>
                    <span className="text-zinc-400 ml-2">{s.StudentID} · {s.Instrument}</span>
                  </button>
                ))}
                {filteredStudents.length > 50 && (
                  <p className="text-xs text-zinc-400 p-2 text-center">Showing 50 of {filteredStudents.length} — refine your search</p>
                )}
              </div>
            </div>
          )}

          {/* Expiring selector */}
          {targetType === 'expiring' && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Expiring within</label>
              <div className="flex items-center gap-3">
                <select
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                  className="px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
                >
                  <option value="7">7 days</option>
                  <option value="14">14 days</option>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                </select>
                <span className="text-sm text-zinc-500">{expiringStudents.length} students expiring</span>
              </div>
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
                { label: 'Session Reminder', text: 'Reminder: Your class is scheduled for tomorrow. See you at Muzigal!' },
                { label: 'Expiry Warning', text: 'Hi, your enrollment is expiring soon. Please visit Muzigal to renew and continue your classes.' },
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
              disabled={sending || !message.trim() || recipientCount === 0}
              className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <Send size={14} />
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </div>
      </Card>
      </div>

      {/* Right: Recipient Preview (2 cols) */}
      <div className="lg:col-span-2">
        <Card title={`Recipients (${recipientCount})`}>
          {recipientCount === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-8">Select a target to see recipients</p>
          ) : (
            <div className="space-y-1 max-h-[520px] overflow-y-auto">
              {recipientList.slice(0, 100).map((s) => (
                <div key={s.StudentID} className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-zinc-50">
                  <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-semibold shrink-0">
                    {s.Name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-800 truncate">{s.Name}</p>
                    <p className="text-[11px] text-zinc-400 truncate">{s.Instrument} · {s.Phone}</p>
                  </div>
                </div>
              ))}
              {recipientList.length > 100 && (
                <p className="text-xs text-zinc-400 text-center py-2">+ {recipientList.length - 100} more</p>
              )}
            </div>
          )}
        </Card>
      </div>
      </div>
    </div>
  );
}
