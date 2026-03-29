import { useEffect, useState } from 'react';
import { Plus, Phone, Mail, AlertCircle } from 'lucide-react';
import { activeApi as api } from '../../api/client';
import { formatPhone, getInitials } from '../../lib/utils';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

type Teacher = Record<string, unknown>;

function TeacherCard({ teacher }: { teacher: Teacher }) {
  const instruments = (teacher.Instruments as string[] | string) || [];
  const instrumentList = Array.isArray(instruments) ? instruments : String(instruments).split(',').map(s => s.trim()).filter(Boolean);

  return (
    <div className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-zinc-300 transition-colors">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-semibold shrink-0">
          {getInitials((teacher.Name as string) || 'T')}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-zinc-900 truncate">{String(teacher.Name || '')}</h3>
          <Badge variant={teacher.Status as string}>{String(teacher.Status || 'Active')}</Badge>
        </div>
      </div>

      {instrumentList.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {instrumentList.map((inst) => (
            <span key={inst} className="px-2 py-0.5 text-xs font-medium bg-zinc-100 text-zinc-600 rounded-full">
              {inst}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-1.5 text-sm text-zinc-600">
        {Boolean(teacher.Phone) && (
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-zinc-400" />
            <span>{formatPhone(String(teacher.Phone))}</span>
          </div>
        )}
        {Boolean(teacher.Email) && (
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-zinc-400" />
            <span className="truncate">{String(teacher.Email)}</span>
          </div>
        )}
      </div>

      {Boolean(teacher.Availability) && (
        <p className="mt-3 pt-3 border-t border-zinc-100 text-xs text-zinc-400">
          {String(teacher.Availability)}
        </p>
      )}
    </div>
  );
}

function TeacherForm({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', instruments: '', availability: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await api.createTeacher({
        Name: form.name,
        Phone: form.phone,
        Email: form.email,
        Instruments: form.instruments.split(',').map(s => s.trim()).filter(Boolean).join(','),
        Availability: form.availability,
      });
      if (res.status === 'ok') { onSave(); onClose(); }
      else setError(res.message || 'Failed to add teacher');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally { setSaving(false); }
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
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
          <label className="block text-sm font-medium text-zinc-700 mb-1">Name *</label>
          <input required value={form.name} onChange={set('name')} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Phone *</label>
          <input required value={form.phone} onChange={set('phone')} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
          <input type="email" value={form.email} onChange={set('email')} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Instruments</label>
          <input value={form.instruments} onChange={set('instruments')} placeholder="Guitar, Drums" className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-zinc-700 mb-1">Availability</label>
          <input value={form.availability} onChange={set('availability')} placeholder="Mon-Fri, 10am-6pm" className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">Cancel</button>
        <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50">{saving ? 'Saving...' : 'Add Teacher'}</button>
      </div>
    </form>
  );
}

export default function Teachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  const load = () => {
    setLoading(true);
    api.listTeachers()
      .then((res) => {
        if (res.status === 'ok') setTeachers((res.data as Teacher[]) || []);
        else setError(res.message || 'Failed to load teachers');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{teachers.length} teachers</p>
        <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
          <Plus size={16} />Add Teacher
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
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-zinc-200" />
                <div className="h-4 w-24 bg-zinc-200 rounded" />
              </div>
              <div className="h-3 w-full bg-zinc-100 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.map((t, i) => <TeacherCard key={i} teacher={t} />)}
          {teachers.length === 0 && (
            <p className="text-sm text-zinc-400 col-span-full text-center py-12">No teachers found</p>
          )}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Teacher" size="lg">
        <TeacherForm onClose={() => setAddOpen(false)} onSave={load} />
      </Modal>
    </div>
  );
}
