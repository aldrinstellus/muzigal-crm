import { useState } from 'react';
import { Plus, Trash2, CheckCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from '@zoo/ui';
import { cn } from '../../lib/utils';
import type { BusinessProfile as BusinessProfileType, AdminUser, Teacher, MessageTemplate } from '../../types';

interface Props {
  config: BusinessProfileType;
  onChange: (config: BusinessProfileType) => void;
  onSave: () => void;
  saving: boolean;
}

export default function BusinessProfile({ config, onChange, onSave, saving }: Props) {
  const [expandedTemplate, setExpandedTemplate] = useState<string | null>(null);

  const update = (partial: Partial<BusinessProfileType>) => onChange({ ...config, ...partial });

  const updateAdmin = (idx: number, partial: Partial<AdminUser>) => {
    const admins = [...config.admins];
    admins[idx] = { ...admins[idx], ...partial };
    update({ admins });
  };

  const addAdmin = () => {
    update({ admins: [...config.admins, { email: '', name: '', role: 'staff', active: true }] });
  };

  const removeAdmin = (idx: number) => {
    update({ admins: config.admins.filter((_, i) => i !== idx) });
  };

  const updateTeacher = (idx: number, partial: Partial<Teacher>) => {
    const teachers = [...config.teachers];
    teachers[idx] = { ...teachers[idx], ...partial };
    update({ teachers });
  };

  const addTeacher = () => {
    update({ teachers: [...config.teachers, { id: `T${String(config.teachers.length + 1).padStart(3, '0')}`, name: '', email: '', phone: '', instrument: '', active: true }] });
  };

  const removeTeacher = (idx: number) => {
    update({ teachers: config.teachers.filter((_, i) => i !== idx) });
  };

  return (
    <div className="space-y-6">
      {/* Academy Info */}
      <Card title="Academy Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Academy Name</label>
            <input value={config.academyName} onChange={(e) => update({ academyName: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Full Legal Name</label>
            <input value={config.fullName} onChange={(e) => update({ fullName: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
            <input type="email" value={config.email} onChange={(e) => update({ email: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Phone</label>
            <input value={config.phone} onChange={(e) => update({ phone: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Website</label>
            <input value={config.website} onChange={(e) => update({ website: e.target.value })}
              placeholder="https://"
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Address</label>
            <input value={config.address} onChange={(e) => update({ address: e.target.value })}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>
      </Card>

      {/* Admin Users */}
      <Card title="Admin Users" action={
        <button onClick={addAdmin} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 border border-emerald-200 rounded-lg transition-colors">
          <Plus size={12} /> Add Admin
        </button>
      }>
        <div className="space-y-3">
          {config.admins.map((admin, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input value={admin.name} onChange={(e) => updateAdmin(idx, { name: e.target.value })}
                  placeholder="Name" className="px-2 py-1.5 border border-zinc-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <input value={admin.email} onChange={(e) => updateAdmin(idx, { email: e.target.value })}
                  placeholder="email@example.com" className="px-2 py-1.5 border border-zinc-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <select value={admin.role} onChange={(e) => updateAdmin(idx, { role: e.target.value as 'admin' | 'staff' })}
                  className="px-2 py-1.5 border border-zinc-200 rounded text-sm bg-white">
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                </select>
              </div>
              <button onClick={() => removeAdmin(idx)} className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors" title="Remove">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {config.admins.length === 0 && <p className="text-sm text-zinc-400 text-center py-4">No admin users configured</p>}
        </div>
      </Card>

      {/* Teachers */}
      <Card title="Teachers" action={
        <button onClick={addTeacher} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-600 hover:bg-emerald-50 border border-emerald-200 rounded-lg transition-colors">
          <Plus size={12} /> Add Teacher
        </button>
      }>
        <div className="space-y-3">
          {config.teachers.map((teacher, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-zinc-50 rounded-lg">
              <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <input value={teacher.name} onChange={(e) => updateTeacher(idx, { name: e.target.value })}
                  placeholder="Name" className="px-2 py-1.5 border border-zinc-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <input value={teacher.email} onChange={(e) => updateTeacher(idx, { email: e.target.value })}
                  placeholder="Email" className="px-2 py-1.5 border border-zinc-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <input value={teacher.phone} onChange={(e) => updateTeacher(idx, { phone: e.target.value })}
                  placeholder="Phone" className="px-2 py-1.5 border border-zinc-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                <input value={teacher.instrument} onChange={(e) => updateTeacher(idx, { instrument: e.target.value })}
                  placeholder="Instrument" className="px-2 py-1.5 border border-zinc-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <button onClick={() => removeTeacher(idx)} className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors" title="Remove">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Message Templates */}
      <Card title="WhatsApp Message Templates">
        <p className="text-xs text-zinc-400 mb-3">Templates registered with your WhatsApp Business provider. Templates must be approved before they can be used for business-initiated messages.</p>
        <div className="space-y-2">
          {config.templates.map((tpl) => (
            <div key={tpl.id} className="border border-zinc-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedTemplate(expandedTemplate === tpl.id ? null : tpl.id)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors text-left"
              >
                <span className={cn('inline-block px-2 py-0.5 text-[10px] font-semibold rounded-full uppercase',
                  tpl.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                  tpl.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                )}>
                  {tpl.status}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-800">{tpl.name}</p>
                  <p className="text-xs text-zinc-400">{tpl.category} · {tpl.language}</p>
                </div>
                {expandedTemplate === tpl.id ? <ChevronUp size={14} className="text-zinc-400" /> : <ChevronDown size={14} className="text-zinc-400" />}
              </button>
              {expandedTemplate === tpl.id && (
                <div className="px-4 pb-3 space-y-2">
                  <div className="p-3 bg-zinc-50 rounded-lg">
                    <p className="text-xs font-medium text-zinc-500 mb-1">Template Body</p>
                    <p className="text-sm text-zinc-700 font-mono">{tpl.body}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-zinc-500 mb-1">Variables</p>
                    <div className="flex flex-wrap gap-1">
                      {tpl.variables.map((v, i) => (
                        <span key={i} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded font-mono">{`{{${i + 1}}}`} = {v}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <button onClick={onSave} disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
          {saving ? 'Saving...' : 'Save Business Profile'}
        </button>
      </div>
    </div>
  );
}
