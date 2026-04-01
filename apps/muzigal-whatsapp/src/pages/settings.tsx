import { useEffect, useState } from 'react';
import { Wifi, Building2, Zap, Database, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { activeApi as api } from '../api/client';
import { cn } from '../lib/utils';
import { Card } from '@zoo/ui';
import ConnectionSetup from '../components/settings/ConnectionSetup';
import BusinessProfile from '../components/settings/BusinessProfile';
import AutomationConfig from '../components/settings/AutomationConfig';
import DataSource from '../components/settings/DataSource';
import type { AppSettings, ConnectionTestResult } from '../types';

type Tab = 'connection' | 'business' | 'automation' | 'data';

const TABS: { value: Tab; label: string; icon: typeof Wifi; description: string }[] = [
  { value: 'connection', label: 'Connection', icon: Wifi, description: 'WhatsApp API provider & credentials' },
  { value: 'business', label: 'Business', icon: Building2, description: 'Academy profile, admins & templates' },
  { value: 'automation', label: 'Automation', icon: Zap, description: 'Scheduling, reminders & AI' },
  { value: 'data', label: 'Data', icon: Database, description: 'Import, sync & data management' },
];

export default function Settings() {
  const [tab, setTab] = useState<Tab>('connection');
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Health
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  useEffect(() => {
    api.getSettings()
      .then((res: { status: string; data?: AppSettings }) => {
        if (res.status === 'ok' && res.data) setSettings(res.data);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (section: Tab) => {
    if (!settings) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const sectionData: Partial<AppSettings> = {};
      if (section === 'connection') sectionData.provider = settings.provider;
      if (section === 'business') sectionData.business = settings.business;
      if (section === 'automation') sectionData.automation = settings.automation;
      if (section === 'data') sectionData.dataSource = settings.dataSource;

      const res = await api.saveSettings(section, sectionData as Record<string, unknown>);
      if (res.status === 'ok') {
        setSuccess('Settings saved successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(res.message || 'Failed to save');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async (): Promise<ConnectionTestResult> => {
    const res = await api.testConnection();
    if (res.status === 'ok' && res.data) {
      // Update local state with connection status
      if (settings) {
        const result = res.data as ConnectionTestResult;
        setSettings({
          ...settings,
          provider: {
            ...settings.provider,
            connectionStatus: result.success ? 'connected' : 'error',
            lastTestedAt: new Date().toISOString(),
          },
        });
        return result;
      }
    }
    return { success: false, message: 'Connection test failed' };
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-14 bg-zinc-100 rounded-xl animate-pulse" />
        <div className="h-96 bg-zinc-100 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
        <AlertCircle size={14} />Failed to load settings
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle size={14} />{error}
          <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">&times;</button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
          <CheckCircle size={14} />{success}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-zinc-100 rounded-xl">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium rounded-lg transition-all',
              tab === t.value
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700'
            )}
          >
            <t.icon size={16} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Description */}
      <p className="text-xs text-zinc-400">
        {TABS.find(t => t.value === tab)?.description}
      </p>

      {/* Tab Content */}
      {tab === 'connection' && (
        <ConnectionSetup
          config={settings.provider}
          onChange={(provider) => setSettings({ ...settings, provider })}
          onSave={() => handleSave('connection')}
          onTestConnection={handleTestConnection}
          saving={saving}
        />
      )}

      {tab === 'business' && (
        <BusinessProfile
          config={settings.business}
          onChange={(business) => setSettings({ ...settings, business })}
          onSave={() => handleSave('business')}
          saving={saving}
        />
      )}

      {tab === 'automation' && (
        <AutomationConfig
          config={settings.automation}
          onChange={(automation) => setSettings({ ...settings, automation })}
          onSave={() => handleSave('automation')}
          saving={saving}
        />
      )}

      {tab === 'data' && (
        <DataSource
          config={settings.dataSource}
          onChange={(dataSource) => setSettings({ ...settings, dataSource })}
          onSave={() => handleSave('data')}
          saving={saving}
        />
      )}

      {/* System Health — always visible */}
      <Card
        title="System Health"
        action={
          <button onClick={checkHealth} disabled={checkingHealth}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-colors disabled:opacity-50">
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
          <p className="text-sm text-zinc-400">Click "Check" to run a full system health check</p>
        )}
      </Card>
    </div>
  );
}
