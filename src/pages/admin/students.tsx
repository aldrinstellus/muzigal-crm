import { useEffect, useState } from 'react';
import { Search, Plus, AlertCircle } from 'lucide-react';
import { api } from '../../api/client';
import { formatDate, formatPhone } from '../../lib/utils';
import Table from '../../components/ui/Table';
import type { Column } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

type Student = Record<string, unknown>;

const columns: Column<Student>[] = [
  {
    key: 'name',
    header: 'Name',
    render: (row) => (
      <span className="font-medium text-zinc-900">{row.name as string}</span>
    ),
  },
  {
    key: 'phone',
    header: 'Phone',
    render: (row) => formatPhone((row.phone as string) || ''),
  },
  { key: 'class', header: 'Class' },
  { key: 'instrument', header: 'Instrument' },
  {
    key: 'status',
    header: 'Status',
    render: (row) => <Badge variant={row.status as string}>{row.status as string}</Badge>,
  },
  {
    key: 'enrolledDate',
    header: 'Enrolled',
    render: (row) => formatDate((row.enrolledDate as string) || ''),
  },
];

function StudentForm({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', instrument: '', class: '', parentName: '', parentPhone: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await api.createStudent(form);
      if (res.status === 'success') {
        onSave();
        onClose();
      } else {
        setError(res.message || 'Failed to create student');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <AlertCircle size={14} />
          {error}
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
          <label className="block text-sm font-medium text-zinc-700 mb-1">Instrument</label>
          <select value={form.instrument} onChange={set('instrument')} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
            <option value="">Select instrument</option>
            <option value="Guitar">Guitar</option>
            <option value="Keyboard">Keyboard</option>
            <option value="Drums">Drums</option>
            <option value="Vocals">Vocals</option>
            <option value="Violin">Violin</option>
            <option value="Ukulele">Ukulele</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Parent Name</label>
          <input value={form.parentName} onChange={set('parentName')} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Parent Phone</label>
          <input value={form.parentPhone} onChange={set('parentPhone')} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50">
          {saving ? 'Saving...' : 'Add Student'}
        </button>
      </div>
    </form>
  );
}

function StudentDetail({ student, onClose }: { student: Student; onClose: () => void }) {
  const fields = [
    { label: 'Name', value: student.name as string },
    { label: 'Phone', value: formatPhone((student.phone as string) || '') },
    { label: 'Email', value: student.email as string },
    { label: 'Instrument', value: student.instrument as string },
    { label: 'Class', value: student.class as string },
    { label: 'Status', value: student.status as string },
    { label: 'Enrolled', value: formatDate((student.enrolledDate as string) || '') },
    { label: 'Parent Name', value: student.parentName as string },
    { label: 'Parent Phone', value: formatPhone((student.parentPhone as string) || '') },
  ];

  return (
    <div className="space-y-3">
      {fields.map((f) => (
        <div key={f.label} className="flex items-start">
          <span className="w-32 shrink-0 text-sm text-zinc-500">{f.label}</span>
          <span className="text-sm text-zinc-900">{f.value || '-'}</span>
        </div>
      ))}
      <div className="flex justify-end pt-4">
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">
          Close
        </button>
      </div>
    </div>
  );
}

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<Student | null>(null);

  const load = () => {
    setLoading(true);
    api.listStudents()
      .then((res) => {
        if (res.status === 'success') setStudents((res.data as Student[]) || []);
        else setError(res.message || 'Failed to load students');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = students.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      String(s.name || '').toLowerCase().includes(q) ||
      String(s.phone || '').includes(q) ||
      String(s.instrument || '').toLowerCase().includes(q) ||
      String(s.class || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students..."
            className="w-full pl-9 pr-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          <Plus size={16} />
          Add Student
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-zinc-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <Table
            columns={columns}
            data={filtered}
            onRowClick={setSelected}
            emptyMessage="No students found"
          />
        )}
      </div>

      {/* Add modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Student" size="lg">
        <StudentForm onClose={() => setAddOpen(false)} onSave={load} />
      </Modal>

      {/* Detail modal */}
      <Modal open={!!selected} onClose={() => setSelected(null)} title="Student Details">
        {selected && <StudentDetail student={selected} onClose={() => setSelected(null)} />}
      </Modal>
    </div>
  );
}
