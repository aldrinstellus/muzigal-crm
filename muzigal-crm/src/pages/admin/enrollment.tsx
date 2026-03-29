import { useEffect, useState } from 'react';
import { Plus, Phone, Calendar, AlertCircle, ChevronRight } from 'lucide-react';
import { activeApi as api } from '../../api/client';
import { formatPhone, formatDate, cn } from '../../lib/utils';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

type Inquiry = Record<string, unknown>;

const STAGES = ['New', 'Demo Scheduled', 'Trial', 'Enrolled', 'Lost'] as const;

function InquiryCard({
  inquiry,
  onMove,
}: {
  inquiry: Inquiry;
  onMove: (id: string, stage: string) => void;
}) {
  const id = inquiry.InquiryID as string;
  const currentStage = (inquiry.Status as string) || 'New';
  const currentIndex = STAGES.indexOf(currentStage as typeof STAGES[number]);

  return (
    <div className="bg-white border border-zinc-200 rounded-lg p-3 hover:border-zinc-300 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm font-medium text-zinc-900">{String(inquiry.Name || '')}</p>
      </div>
      {Boolean(inquiry.Phone) && (
        <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-1">
          <Phone size={12} />
          <span>{formatPhone(String(inquiry.Phone))}</span>
        </div>
      )}
      {Boolean(inquiry.Instrument) && (
        <p className="text-xs text-zinc-500 mb-1">{String(inquiry.Instrument)}</p>
      )}
      {Boolean(inquiry.DemoDate) && (
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Calendar size={12} />
          <span>{formatDate(String(inquiry.DemoDate))}</span>
        </div>
      )}
      {currentStage !== 'Enrolled' && currentStage !== 'Lost' && currentIndex < STAGES.length - 2 && (
        <button
          onClick={() => onMove(id, STAGES[currentIndex + 1])}
          className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          Move to {STAGES[currentIndex + 1]}
          <ChevronRight size={12} />
        </button>
      )}
    </div>
  );
}

function InquiryForm({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    name: '', phone: '', email: '', instrument: '', ageGroup: '', source: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await api.createInquiry({
        Name: form.name,
        Phone: form.phone,
        Email: form.email,
        Instrument: form.instrument,
        AgeGroup: form.ageGroup,
        Source: form.source,
        Status: 'New',
      });
      if (res.status === 'ok') { onSave(); onClose(); }
      else setError(res.message || 'Failed to create inquiry');
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
          <label className="block text-sm font-medium text-zinc-700 mb-1">Age Group</label>
          <select value={form.ageGroup} onChange={set('ageGroup')} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
            <option value="">Select</option>
            <option value="3-6">3-6 years</option>
            <option value="7+">7+ years</option>
            <option value="Adult">Adult</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Source</label>
          <select value={form.source} onChange={set('source')} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
            <option value="">Select</option>
            <option value="Website">Website</option>
            <option value="Walk-in">Walk-in</option>
            <option value="Referral">Referral</option>
            <option value="Social Media">Social Media</option>
            <option value="Google">Google</option>
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">Cancel</button>
        <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50">{saving ? 'Saving...' : 'Add Lead'}</button>
      </div>
    </form>
  );
}

export default function Enrollment() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  const load = () => {
    setLoading(true);
    api.listInquiries()
      .then((res: any) => {
        console.log('[Enrollment] API response:', JSON.stringify(res).substring(0, 200));
        if (res.status === 'ok' && res.data) setInquiries(res.data as Inquiry[]);
        else setError('Failed to load inquiries');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleMove = async (id: string, stage: string) => {
    try {
      await api.updateInquiry(id, { Status: stage });
      setInquiries((prev) =>
        prev.map((inq) => (inq.InquiryID === id ? { ...inq, Status: stage } : inq))
      );
    } catch {
      // silent fail
    }
  };

  const grouped = STAGES.reduce(
    (acc, stage) => {
      acc[stage] = inquiries.filter((inq) => (inq.Status as string || 'New') === stage);
      return acc;
    },
    {} as Record<string, Inquiry[]>
  );

  const stageColors: Record<string, string> = {
    New: 'bg-sky-500',
    'Demo Scheduled': 'bg-blue-500',
    Trial: 'bg-violet-500',
    Enrolled: 'bg-emerald-500',
    Lost: 'bg-zinc-400',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{inquiries.length} leads</p>
        <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
          <Plus size={16} />Add Lead
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle size={14} />{error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {STAGES.map((stage) => (
            <div key={stage} className="space-y-3">
              <div className="h-4 w-24 bg-zinc-200 rounded animate-pulse" />
              {[...Array(2)].map((_, i) => (
                <div key={i} className="bg-white border border-zinc-200 rounded-lg p-3 animate-pulse">
                  <div className="h-3 w-20 bg-zinc-200 rounded mb-2" />
                  <div className="h-3 w-full bg-zinc-100 rounded" />
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {STAGES.map((stage) => (
            <div key={stage} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className={cn('w-2 h-2 rounded-full', stageColors[stage])} />
                <h3 className="text-sm font-semibold text-zinc-700">{stage}</h3>
                <Badge>{String(grouped[stage]?.length || 0)}</Badge>
              </div>
              <div className="space-y-2">
                {grouped[stage]?.map((inq, i) => (
                  <InquiryCard key={i} inquiry={inq} onMove={handleMove} />
                ))}
                {(grouped[stage]?.length || 0) === 0 && (
                  <p className="text-xs text-zinc-300 text-center py-6">No leads</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Lead" size="lg">
        <InquiryForm onClose={() => setAddOpen(false)} onSave={load} />
      </Modal>
    </div>
  );
}
