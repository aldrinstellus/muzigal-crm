import { useEffect, useState } from 'react';
import { Plus, MessageCircle, AlertCircle } from 'lucide-react';
import { activeApi as api } from '../../api/client';
import { CLIENT } from '../../config/client';
import { formatCurrency, formatDate, cn } from '../../lib/utils';
import { Table, Badge, Modal } from '@zoo/ui';
import type { Column } from '@zoo/ui';

type Payment = Record<string, unknown>;

const tabs = ['All', 'Pending', 'Overdue', 'Paid'] as const;

function PaymentForm({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({
    studentId: '', studentName: '', amount: '', method: '', razorpayRef: '', notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const res = await api.recordPayment({
        StudentID: form.studentId,
        StudentName: form.studentName,
        Amount: Number(form.amount),
        Method: form.method,
        RazorpayRef: form.razorpayRef,
        Notes: form.notes,
        Status: 'Paid',
        Date: new Date().toISOString().split('T')[0],
      });
      if (res.status === 'ok') { onSave(); onClose(); }
      else setError(res.message || 'Failed to record payment');
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
          <label className="block text-sm font-medium text-zinc-700 mb-1">Student Name *</label>
          <input required value={form.studentName} onChange={set('studentName')} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Amount (INR) *</label>
          <input required type="number" value={form.amount} onChange={set('amount')} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Method</label>
          <select value={form.method} onChange={set('method')} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
            <option value="">Select</option>
            <option value="Razorpay">Razorpay</option>
            <option value="UPI">UPI</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1">Razorpay Ref</label>
          <input value={form.razorpayRef} onChange={set('razorpayRef')} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-zinc-700 mb-1">Notes</label>
          <input value={form.notes} onChange={set('notes')} className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">Cancel</button>
        <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50">{saving ? 'Saving...' : 'Record Payment'}</button>
      </div>
    </form>
  );
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<typeof tabs[number]>('All');
  const [addOpen, setAddOpen] = useState(false);
  const [sending, setSending] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api.listPayments()
      .then((res) => {
        if (res.status === 'ok') setPayments((res.data as Payment[]) || []);
        else setError(res.message || 'Failed to load payments');
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const sendReminder = async (payment: Payment) => {
    const id = payment.PaymentID as string;
    setSending(id);
    try {
      const phone = (payment.Phone as string) || '';
      const name = (payment.StudentName as string) || (payment.StudentID as string) || '';
      const amount = formatCurrency(Number(payment.Amount) || 0);
      await api.sendOverride(
        'phone', phone,
        CLIENT.messages.paymentReminder(name, amount),
        'Admin'
      );
    } catch {
      // silent
    } finally {
      setSending(null);
    }
  };

  const filtered = tab === 'All'
    ? payments
    : payments.filter((p) => (p.Status as string) === tab);

  const columns: Column<Payment>[] = [
    {
      key: 'StudentID',
      header: 'Student',
      render: (row) => <span className="font-medium text-zinc-900">{(row.StudentName as string) || (row.StudentID as string)}</span>,
    },
    {
      key: 'Amount',
      header: 'Amount',
      render: (row) => formatCurrency(Number(row.Amount) || 0),
    },
    {
      key: 'DueDate',
      header: 'Due Date',
      render: (row) => formatDate((row.DueDate as string) || ''),
    },
    {
      key: 'Status',
      header: 'Status',
      render: (row) => <Badge variant={row.Status as string}>{row.Status as string}</Badge>,
    },
    { key: 'Method', header: 'Method' },
    { key: 'RazorpayRef', header: 'Razorpay Ref' },
    {
      key: 'actions',
      header: '',
      render: (row) => {
        const status = row.Status as string;
        if (status === 'Paid') return null;
        return (
          <button
            onClick={(e) => { e.stopPropagation(); sendReminder(row); }}
            disabled={sending === (row.PaymentID as string)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <MessageCircle size={12} />
            {sending === (row.PaymentID as string) ? 'Sending...' : 'Remind'}
          </button>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex gap-1 bg-zinc-100 p-1 rounded-lg">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                tab === t
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700'
              )}
            >
              {t}
            </button>
          ))}
        </div>
        <button onClick={() => setAddOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
          <Plus size={16} />Record Payment
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle size={14} />{error}
        </div>
      )}

      <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-zinc-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <Table columns={columns} data={filtered} emptyMessage="No payments found" />
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Record Payment" size="lg">
        <PaymentForm onClose={() => setAddOpen(false)} onSave={load} />
      </Modal>
    </div>
  );
}
