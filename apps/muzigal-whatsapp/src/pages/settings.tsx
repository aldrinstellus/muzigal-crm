import { useEffect, useState, useRef } from 'react';
import { Save, AlertCircle, CheckCircle, RefreshCw, Upload, Database } from 'lucide-react';
import { activeApi as api } from '../api/client';
import { Card } from '@zoo/ui';
import { parseExcelToDataset } from '../data/excelParser';
import seedMeta from '../data/seed.json';

export default function Settings() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Health
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  // Data import
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState('');

  const meta = (seedMeta as { meta?: { generatedAt?: string; counts?: Record<string, number> } }).meta;

  useEffect(() => {
    api.getConfig()
      .then((res) => {
        if (res.status === 'ok' && res.config) {
          setConfig(res.config);
        } else if (res.status === 'ok' && res.data) {
          setConfig(res.data as Record<string, string>);
        }
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (key: string, value: string) => {
    setSaving(key);
    setError('');
    setSuccess('');
    try {
      const res = await api.setConfig(key, value);
      if (res.status === 'ok') {
        setSuccess(`"${key}" updated`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(res.message || 'Failed to update config');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(null);
    }
  };

  const checkHealth = async () => {
    setCheckingHealth(true);
    try {
      const res = await api.health();
      setHealth(res as unknown as Record<string, unknown>);
    } catch (err) {
      setHealth({ error: err instanceof Error ? err.message : 'Health check failed' });
    } finally {
      setCheckingHealth(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult('');
    setError('');
    try {
      const buffer = await file.arrayBuffer();
      const dataset = parseExcelToDataset(buffer, file.name);
      setImportResult(
        `Parsed "${file.name}": ${dataset.meta.counts.students} students, ` +
        `${dataset.meta.counts.enquiries} enquiries, ${dataset.meta.counts.batches} batches, ` +
        `${dataset.meta.counts.classes} classes`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse Excel file');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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

      {/* Data Management */}
      <Card title="Data Management">
        <div className="space-y-4">
          {/* Current data summary */}
          <div className="flex items-start gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
            <Database size={16} className="text-zinc-500 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-zinc-700">Current Data</p>
              {meta?.counts ? (
                <div className="mt-1 text-zinc-500 space-y-0.5">
                  <p>{meta.counts.students} students · {meta.counts.enquiries} enquiries · {meta.counts.batches} batches · {meta.counts.classes} classes</p>
                  {meta.generatedAt && (
                    <p className="text-xs text-zinc-400">Generated: {new Date(meta.generatedAt).toLocaleString()}</p>
                  )}
                </div>
              ) : (
                <p className="text-zinc-400 mt-1">No seed data loaded</p>
              )}
            </div>
          </div>

          {/* Import Excel */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-2">Import Excel File</label>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImport}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg transition-colors disabled:opacity-50"
              >
                <Upload size={14} />
                {importing ? 'Parsing...' : 'Choose .xlsx File'}
              </button>
              <p className="text-xs text-zinc-400">Upload a new Excel migration file to preview data</p>
            </div>
            {importResult && (
              <div className="mt-2 flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs">
                <CheckCircle size={12} />{importResult}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Config */}
      <Card title="WhatsApp Configuration">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-zinc-100 rounded animate-pulse" />
            ))}
          </div>
        ) : Object.keys(config).length === 0 ? (
          <p className="text-sm text-zinc-400">No configuration found</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(config).map(([key, value]) => (
              <div key={key} className="flex items-center gap-3">
                <label className="w-48 shrink-0 text-sm font-medium text-zinc-600">{key}</label>
                <input
                  value={value}
                  onChange={(e) => setConfig((prev) => ({ ...prev, [key]: e.target.value }))}
                  className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <button
                  onClick={() => handleSave(key, value)}
                  disabled={saving === key}
                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* System Health */}
      <Card
        title="System Health"
        action={
          <button
            onClick={checkHealth}
            disabled={checkingHealth}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={checkingHealth ? 'animate-spin' : ''} />
            Check
          </button>
        }
      >
        {health ? (
          <pre className="text-xs text-zinc-600 bg-zinc-50 border border-zinc-200 rounded-lg p-4 overflow-x-auto">
            {JSON.stringify(health, null, 2)}
          </pre>
        ) : (
          <p className="text-sm text-zinc-400">Click "Check" to run health check</p>
        )}
      </Card>
    </div>
  );
}
