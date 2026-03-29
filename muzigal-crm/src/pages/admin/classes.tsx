import { useEffect, useState } from 'react';
import { Plus, Clock, MapPin, Users, AlertCircle } from 'lucide-react';
import { activeApi as api } from '../../api/client';
import { formatCurrency } from '../../lib/utils';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

type ClassItem = Record<string, unknown>;

function ClassCard({ cls }: { cls: ClassItem }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-zinc-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">{String(cls.Instrument || '')}</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{String(cls.Level || '')}</p>
        </div>
        <Badge variant={cls.Status as string}>{String(cls.Status || 'Active')}</Badge>
      </div>
      <div className="space-y-2 text-sm text-zinc-600">
        {Boolean(cls.Teacher) && (
          <div className="flex items-center gap-2">
            <Users size={14} className="text-zinc-400" />
            <span>{String(cls.Teacher)}</span>
          </div>
        )}
        {Boolean(cls.Room) && (
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-zinc-400" />
            <span>{String(cls.Room)}</span>
          </div>
        )}
        {Boolean(cls.Day || cls.Time) && (
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-zinc-400" />
            <span>{[cls.Day, cls.Time].filter(Boolean).map(String).join(' / ')}</span>
          </div>
        )}
      </div>
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-100">
        <span className="text-xs text-zinc-400">
          {String(cls.CurrentStudents ?? 0)}/{String(cls.MaxStudents ?? '-')} students
        </span>
        <span className="text-sm font-semibold text-zinc-900">
          {formatCurrency(Number(cls.Fee) || 0)}/mo
        </span>
      </div>
    </div>
  );
}

function ClassForm({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    instrument: '', level: '', teacher: '', room: '', day: '', time: '', maxStudents: '', fee: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await api.createClass({
        Instrument: form.instrument,
        Level: form.level,
        Name: `${form.instrument} - ${form.level}`,
        Teacher: form.teacher,
        Room: form.room,
        Day: form.day,
        Time: form.time,
        MaxStudents: Number(form.maxStudents) || 0,
        Fee: Number(form.fee) || 0,
      });
      if (res.status === 'ok') { onSave(); onClose(); }
      else setError(res.message || 'Failed to create class');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally { setSaving(false); }
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle size={14} />{error}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Instrument *</label>
          <select required value={form.instrument} onChange={set('instrument')} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
            <option value="">Select</option>
            <option value="Guitar">Guitar</option>
            <option value="Keyboard">Keyboard</option>
            <option value="Drums">Drums</option>
            <option value="Vocals">Vocals</option>
            <option value="Violin">Violin</option>
            <option value="Ukulele">Ukulele</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Level</label>
          <select value={form.level} onChange={set('level')} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
            <option value="">Select</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Teacher</label>
          <input value={form.teacher} onChange={set('teacher')} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Room</label>
          <input value={form.room} onChange={set('room')} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Day</label>
          <select value={form.day} onChange={set('day')} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
            <option value="">Select</option>
            {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Time</label>
          <input type="time" value={form.time} onChange={set('time')} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Max Students</label>
          <input type="number" value={form.maxStudents} onChange={set('maxStudents')} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Fee (INR/mo) *</label>
          <input required type="number" value={form.fee} onChange={set('fee')} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">Cancel</button>
        <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50">{saving ? 'Saving...' : 'Create Class'}</button>
      </div>
    </form>
  );
}

export default function Classes() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  const load = () => {
    setLoading(true);
    api.listClasses()
      .then((res) => {
        if (res.status === 'ok') setClasses((res.data as ClassItem[]) || []);
        else setError(res.message || 'Failed to load classes');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{classes.length} classes</p>
        <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
          <Plus size={16} />Add Class
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle size={14} />{error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-zinc-200 rounded-xl p-5 animate-pulse">
              <div className="h-4 w-24 bg-zinc-200 rounded mb-2" />
              <div className="h-3 w-16 bg-zinc-100 rounded mb-4" />
              <div className="space-y-2">
                <div className="h-3 w-full bg-zinc-100 rounded" />
                <div className="h-3 w-3/4 bg-zinc-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls, i) => <ClassCard key={i} cls={cls} />)}
          {classes.length === 0 && (
            <p className="text-sm text-zinc-400 col-span-full text-center py-12">No classes found</p>
          )}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Create Class" size="lg">
        <ClassForm onClose={() => setAddOpen(false)} onSave={load} />
      </Modal>
    </div>
  );
}
