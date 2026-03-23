import { useEffect, useState } from 'react';
import { Save, Send, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { activeApi as api } from '../../api/client';
import Card from '../../components/ui/Card';

export default function Settings() {
  const [config, setConfig] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // WhatsApp test
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Hello from ZOO CRM!');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState('');

  // Health
  const [health, setHealth] = useState<Record<string, unknown> | null>(null);
  const [checkingHealth, setCheckingHealth] = useState(false);

  useEffect(() => {
    api.getConfig()
      .then((res) => {
        if (res.status === 'ok' && res.config) {
          setConfig(res.config);
        } else if (res.status === 'ok' && res.data) {
          setConfig(res.data as Record<string, string>);
        }
      })
      .catch((err) => setError(err.message))
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

  const handleSendTest = async () => {
    if (!testPhone) return;
    setSendingTest(true);
    setTestResult('');
    try {
      const res = await api.sendTest(testPhone, testMessage);
      setTestResult(res.status === 'ok' ? 'Message sent successfully' : (res.message || 'Failed to send'));
    } catch (err) {
      setTestResult(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setSendingTest(false);
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

      {/* Config */}
      <Card title="Configuration">
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
                  className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={() => handleSave(key, value)}
                  disabled={saving === key}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* WhatsApp Test */}
      <Card title="WhatsApp Test">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Phone Number</label>
            <input
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="919876543210"
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Message</label>
            <input
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSendTest}
            disabled={sendingTest || !testPhone}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <Send size={14} />
            {sendingTest ? 'Sending...' : 'Send Test Message'}
          </button>
          {testResult && (
            <p className="text-sm text-zinc-600">{testResult}</p>
          )}
        </div>
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
