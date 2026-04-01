import { useState } from 'react';
import { Wifi, WifiOff, CheckCircle, AlertCircle, Loader2, Eye, EyeOff, Copy, ExternalLink } from 'lucide-react';
import { Card } from '@zoo/ui';
import { cn } from '../../lib/utils';
import type { ProviderConfig, Provider, TokenType, ConnectionTestResult } from '../../types';

const PROVIDERS: { value: Provider; label: string; description: string }[] = [
  { value: 'meta', label: 'Meta Cloud API', description: 'Direct WhatsApp Business API — free tier, requires Meta Business verification' },
  { value: 'twilio', label: 'Twilio', description: 'Managed messaging — per-message pricing, easier setup' },
  { value: 'gupshup', label: 'Gupshup', description: 'India-focused messaging platform — popular for WhatsApp Business' },
  { value: 'custom', label: 'Custom Webhook', description: 'Any HTTP endpoint that accepts { to, message } POST requests' },
];

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: typeof Wifi }> = {
  connected: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: Wifi },
  disconnected: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: WifiOff },
  token_expiring: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: AlertCircle },
  error: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: AlertCircle },
  untested: { bg: 'bg-zinc-50 border-zinc-200', text: 'text-zinc-500', icon: WifiOff },
};

interface Props {
  config: ProviderConfig;
  onChange: (config: ProviderConfig) => void;
  onSave: () => void;
  onTestConnection: () => Promise<ConnectionTestResult>;
  saving: boolean;
}

export default function ConnectionSetup({ config, onChange, onSave, onTestConnection, saving }: Props) {
  const [showToken, setShowToken] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<ConnectionTestResult | null>(null);

  const update = (partial: Partial<ProviderConfig>) => onChange({ ...config, ...partial });

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await onTestConnection();
      setTestResult(result);
    } catch {
      setTestResult({ success: false, message: 'Connection test failed' });
    } finally {
      setTesting(false);
    }
  };

  const status = STATUS_STYLES[config.connectionStatus] || STATUS_STYLES.untested;
  const StatusIcon = status.icon;

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <div className={cn('flex items-center gap-3 p-4 rounded-xl border', status.bg)}>
        <StatusIcon size={20} className={status.text} />
        <div className="flex-1">
          <p className={cn('text-sm font-medium', status.text)}>
            {config.connectionStatus === 'connected' && 'WhatsApp API Connected'}
            {config.connectionStatus === 'disconnected' && 'Not Connected'}
            {config.connectionStatus === 'token_expiring' && 'Token Expiring Soon'}
            {config.connectionStatus === 'error' && 'Connection Error'}
            {config.connectionStatus === 'untested' && 'Not Yet Tested'}
          </p>
          {config.lastTestedAt && (
            <p className="text-xs text-zinc-400 mt-0.5">Last tested: {new Date(config.lastTestedAt).toLocaleString()}</p>
          )}
        </div>
        <button
          onClick={handleTest}
          disabled={testing}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50"
        >
          {testing ? <Loader2 size={14} className="animate-spin" /> : <Wifi size={14} />}
          {testing ? 'Testing...' : 'Test Connection'}
        </button>
      </div>

      {/* Test Result */}
      {testResult && (
        <div className={cn('flex items-start gap-2 p-3 rounded-lg border text-sm',
          testResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
        )}>
          {testResult.success ? <CheckCircle size={14} className="mt-0.5 shrink-0" /> : <AlertCircle size={14} className="mt-0.5 shrink-0" />}
          <div>
            <p className="font-medium">{testResult.message}</p>
            {testResult.details && <p className="text-xs mt-1 opacity-80">{testResult.details}</p>}
            {testResult.latencyMs && <p className="text-xs mt-0.5 opacity-60">Latency: {testResult.latencyMs}ms</p>}
          </div>
        </div>
      )}

      {/* Provider Selector */}
      <Card title="Provider">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PROVIDERS.map((p) => (
            <button
              key={p.value}
              onClick={() => update({ provider: p.value })}
              className={cn(
                'text-left p-3 rounded-lg border-2 transition-all',
                config.provider === p.value
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-zinc-200 hover:border-zinc-300'
              )}
            >
              <p className={cn('text-sm font-semibold', config.provider === p.value ? 'text-emerald-700' : 'text-zinc-800')}>{p.label}</p>
              <p className="text-xs text-zinc-500 mt-1">{p.description}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Provider-specific Credentials */}
      {config.provider === 'meta' && (
        <Card title="Meta WhatsApp Cloud API">
          <div className="space-y-4">
            {/* Token Type */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Token Type</label>
              <div className="flex gap-2">
                {(['temporary', 'system_user'] as TokenType[]).map(t => (
                  <button
                    key={t}
                    onClick={() => update({ tokenType: t })}
                    className={cn('px-3 py-1.5 text-sm rounded-lg border transition-colors',
                      config.tokenType === t ? 'bg-emerald-600 text-white border-emerald-600' : 'text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                    )}
                  >
                    {t === 'temporary' ? 'Temporary (24hr)' : 'System User (Permanent)'}
                  </button>
                ))}
              </div>
              <p className="text-xs text-zinc-400 mt-1.5">
                {config.tokenType === 'temporary'
                  ? 'Temporary tokens expire every 24 hours. Generate new ones at developers.facebook.com.'
                  : 'System user tokens are permanent. Create them in Meta Business Manager > System Users.'}
              </p>
            </div>

            {/* Access Token */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Access Token</label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  value={config.whatsappToken}
                  onChange={(e) => update({ whatsappToken: e.target.value })}
                  placeholder="EAAM5X064FqABO..."
                  className="w-full px-3 py-2 pr-20 border border-zinc-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <button onClick={() => setShowToken(!showToken)} className="p-1 text-zinc-400 hover:text-zinc-600" title={showToken ? 'Hide' : 'Show'}>
                    {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button onClick={() => navigator.clipboard.writeText(config.whatsappToken)} className="p-1 text-zinc-400 hover:text-zinc-600" title="Copy">
                    <Copy size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Phone Number ID */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Phone Number ID</label>
              <input
                value={config.phoneNumberId}
                onChange={(e) => update({ phoneNumberId: e.target.value })}
                placeholder="1085043881349577"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-zinc-400 mt-1">Found in Meta Developer Dashboard &gt; WhatsApp &gt; API Setup</p>
            </div>

            {/* WABA ID */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">WhatsApp Business Account ID</label>
              <input
                value={config.wabaId}
                onChange={(e) => update({ wabaId: e.target.value })}
                placeholder="284901754710853"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* API Version */}
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">API Version</label>
              <select
                value={config.apiVersion}
                onChange={(e) => update({ apiVersion: e.target.value })}
                className="px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="v21.0">v21.0 (Latest)</option>
                <option value="v20.0">v20.0</option>
                <option value="v19.0">v19.0</option>
              </select>
            </div>

            <div className="pt-2 flex items-center gap-2 text-xs text-zinc-400">
              <ExternalLink size={12} />
              <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-600 underline">
                Meta WhatsApp Cloud API Documentation
              </a>
            </div>
          </div>
        </Card>
      )}

      {config.provider === 'twilio' && (
        <Card title="Twilio WhatsApp">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Account SID</label>
              <input value={config.twilioAccountSid} onChange={(e) => update({ twilioAccountSid: e.target.value })}
                placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Auth Token</label>
              <input type="password" value={config.twilioAuthToken} onChange={(e) => update({ twilioAuthToken: e.target.value })}
                placeholder="Your Twilio auth token"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">From Number</label>
              <input value={config.twilioFromNumber} onChange={(e) => update({ twilioFromNumber: e.target.value })}
                placeholder="whatsapp:+14155238886"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <p className="text-xs text-zinc-400 mt-1">Your Twilio WhatsApp-enabled phone number</p>
            </div>
          </div>
        </Card>
      )}

      {config.provider === 'gupshup' && (
        <Card title="Gupshup WhatsApp">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">API Key</label>
              <input type="password" value={config.gupshupApiKey} onChange={(e) => update({ gupshupApiKey: e.target.value })}
                placeholder="Your Gupshup API key"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Source Phone</label>
              <input value={config.gupshupSourcePhone} onChange={(e) => update({ gupshupSourcePhone: e.target.value })}
                placeholder="919876543210"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">App Name</label>
              <input value={config.gupshupAppName} onChange={(e) => update({ gupshupAppName: e.target.value })}
                placeholder="MuzigalWhatsApp"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
        </Card>
      )}

      {config.provider === 'custom' && (
        <Card title="Custom Webhook">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Webhook URL</label>
              <input value={config.customWebhookUrl} onChange={(e) => update({ customWebhookUrl: e.target.value })}
                placeholder="https://your-api.com/send-whatsapp"
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500" />
              <p className="text-xs text-zinc-400 mt-1">Must accept POST with JSON body: {"{"} to: "+91...", message: "..." {"}"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Custom Headers (JSON)</label>
              <textarea value={config.customHeaders} onChange={(e) => update({ customHeaders: e.target.value })}
                placeholder='{"Authorization": "Bearer your-token"}'
                rows={3}
                className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none" />
            </div>
          </div>
        </Card>
      )}

      {/* Webhook (read-only) */}
      <Card title="Incoming Webhook">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Webhook URL (read-only)</label>
            <div className="flex gap-2">
              <input value={config.webhookUrl} readOnly
                className="flex-1 px-3 py-2 border border-zinc-200 rounded-lg text-sm font-mono bg-zinc-50 text-zinc-500" />
              <button onClick={() => navigator.clipboard.writeText(config.webhookUrl)}
                className="px-3 py-2 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors" title="Copy">
                <Copy size={14} className="text-zinc-500" />
              </button>
            </div>
            <p className="text-xs text-zinc-400 mt-1">Paste this into your Meta App's webhook configuration</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Webhook Verify Token</label>
            <input value={config.webhookSecret} onChange={(e) => update({ webhookSecret: e.target.value })}
              placeholder="your-webhook-secret"
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <button onClick={onSave} disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
          {saving ? 'Saving...' : 'Save Connection Settings'}
        </button>
      </div>
    </div>
  );
}
