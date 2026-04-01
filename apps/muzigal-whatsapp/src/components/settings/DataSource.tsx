import { useRef, useState } from 'react';
import { Upload, Database, Link, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card } from '@zoo/ui';
import { Switch } from '../ui/Switch';
import { parseExcelToDataset } from '../../data/excelParser';
import type { DataSourceConfig } from '../../types';
import seedMeta from '../../data/seed.json';

interface Props {
  config: DataSourceConfig;
  onChange: (config: DataSourceConfig) => void;
  onSave: () => void;
  saving: boolean;
}

export default function DataSource({ config, onChange, onSave, saving }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState('');
  const [importError, setImportError] = useState('');

  const meta = (seedMeta as { meta?: { generatedAt?: string; counts?: Record<string, number> } }).meta;

  const update = (partial: Partial<DataSourceConfig>) => onChange({ ...config, ...partial });

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportResult('');
    setImportError('');
    try {
      const buffer = await file.arrayBuffer();
      const dataset = parseExcelToDataset(buffer, file.name);
      setImportResult(
        `Parsed "${file.name}": ${dataset.meta.counts.students} students, ` +
        `${dataset.meta.counts.enquiries} enquiries, ${dataset.meta.counts.batches} batches, ` +
        `${dataset.meta.counts.classes} derived classes`
      );
      update({
        lastImportFile: file.name,
        lastImportAt: new Date().toISOString(),
      });
    } catch (err) {
      setImportError(err instanceof Error ? err.message : 'Failed to parse Excel file');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Data Summary */}
      <Card title="Current Data">
        <div className="flex items-start gap-3 p-4 bg-zinc-50 rounded-lg">
          <Database size={18} className="text-zinc-500 mt-0.5 shrink-0" />
          <div className="text-sm flex-1">
            {meta?.counts ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-2xl font-bold text-zinc-800">{meta.counts.students}</p>
                  <p className="text-xs text-zinc-500">Students</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-800">{meta.counts.enquiries}</p>
                  <p className="text-xs text-zinc-500">Enquiries</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-800">{meta.counts.batches}</p>
                  <p className="text-xs text-zinc-500">Batches</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-800">{meta.counts.classes}</p>
                  <p className="text-xs text-zinc-500">Classes</p>
                </div>
              </div>
            ) : (
              <p className="text-zinc-400">No data loaded</p>
            )}
            {meta?.generatedAt && (
              <p className="text-xs text-zinc-400 mt-3">Seed generated: {new Date(meta.generatedAt).toLocaleString()}</p>
            )}
            {config.lastImportFile && (
              <p className="text-xs text-zinc-400 mt-1">Last import: {config.lastImportFile} — {config.lastImportAt ? new Date(config.lastImportAt).toLocaleString() : 'unknown'}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Excel Import */}
      <Card title="Import Excel File">
        <div className="space-y-3">
          <p className="text-xs text-zinc-500">Upload a new Excel migration file (.xlsx) to update student, enquiry, and batch data. The file is parsed entirely in your browser — nothing is uploaded to a server.</p>
          <div className="flex items-center gap-3">
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
            <button onClick={() => fileInputRef.current?.click()} disabled={importing}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg transition-colors disabled:opacity-50">
              {importing ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {importing ? 'Parsing...' : 'Choose .xlsx File'}
            </button>
          </div>
          {importResult && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs">
              <CheckCircle size={12} className="shrink-0" />{importResult}
            </div>
          )}
          {importError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-xs">
              <AlertCircle size={12} className="shrink-0" />{importError}
            </div>
          )}
        </div>
      </Card>

      {/* Google Sheet Sync */}
      <Card title="Google Sheet Sync">
        <div className="space-y-4">
          <p className="text-xs text-zinc-500">Connect to a Google Sheet for live data. The backend reads directly from the sheet on every API call, so data is always up to date.</p>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Google Sheet URL</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  value={config.googleSheetUrl}
                  onChange={(e) => update({ googleSheetUrl: e.target.value })}
                  placeholder="https://docs.google.com/spreadsheets/d/..."
                  className="w-full pl-9 pr-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
            <p className="text-xs text-zinc-400 mt-1">The sheet must have the same tab structure as the migration Excel file</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-800">Auto-sync</p>
              <p className="text-xs text-zinc-400 mt-0.5">Automatically refresh data from Google Sheet at a set interval</p>
            </div>
            <Switch checked={config.autoSyncEnabled} onCheckedChange={(v) => update({ autoSyncEnabled: v })} />
          </div>

          {config.autoSyncEnabled && (
            <div className="pt-2 border-t border-zinc-100">
              <label className="block text-sm font-medium text-zinc-700 mb-1">Sync Interval</label>
              <select value={config.autoSyncIntervalMinutes} onChange={(e) => update({ autoSyncIntervalMinutes: parseInt(e.target.value) })}
                className="px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value={15}>Every 15 minutes</option>
                <option value={30}>Every 30 minutes</option>
                <option value={60}>Every hour</option>
                <option value={360}>Every 6 hours</option>
                <option value={1440}>Once a day</option>
              </select>
            </div>
          )}

          {config.lastSyncedAt && (
            <p className="text-xs text-zinc-400">Last synced: {new Date(config.lastSyncedAt).toLocaleString()}</p>
          )}
        </div>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <button onClick={onSave} disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
          {saving ? 'Saving...' : 'Save Data Settings'}
        </button>
      </div>
    </div>
  );
}
