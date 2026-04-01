import { useState } from 'react';
import { CheckCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { Card } from '@zoo/ui';
import { Switch } from '../ui/Switch';
import type { AutomationConfig as AutomationConfigType } from '../../types';

interface Props {
  config: AutomationConfigType;
  onChange: (config: AutomationConfigType) => void;
  onSave: () => void;
  saving: boolean;
}

export default function AutomationConfig({ config, onChange, onSave, saving }: Props) {
  const [showAiKey, setShowAiKey] = useState(false);

  const update = (partial: Partial<AutomationConfigType>) => onChange({ ...config, ...partial });

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

  return (
    <div className="space-y-6">
      {/* Daily Schedule */}
      <Card title="Daily Schedule Notifications">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-800">Send daily class reminders</p>
              <p className="text-xs text-zinc-400 mt-0.5">Automatically sends schedule reminders to all students with classes that day</p>
            </div>
            <Switch checked={config.dailyScheduleEnabled} onCheckedChange={(v) => update({ dailyScheduleEnabled: v })} />
          </div>

          {config.dailyScheduleEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-100">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Send at</label>
                <div className="flex items-center gap-2">
                  <select value={config.dailySendHour} onChange={(e) => update({ dailySendHour: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {hours.map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}</option>)}
                  </select>
                  <span className="text-zinc-400">:</span>
                  <select value={config.dailySendMinute} onChange={(e) => update({ dailySendMinute: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                    {minutes.map(m => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Timezone</label>
                <select value={config.timezone} onChange={(e) => update({ timezone: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                  <option value="America/New_York">America/New_York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Fee Reminders */}
      <Card title="Fee Reminders">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-800">Automatic fee reminders</p>
              <p className="text-xs text-zinc-400 mt-0.5">Sends payment reminders before the due date and on overdue</p>
            </div>
            <Switch checked={config.feeReminderEnabled} onCheckedChange={(v) => update({ feeReminderEnabled: v })} />
          </div>

          {config.feeReminderEnabled && (
            <div className="pt-2 border-t border-zinc-100">
              <label className="block text-sm font-medium text-zinc-700 mb-1">Remind before due date</label>
              <select value={config.feeReminderDaysBefore} onChange={(e) => update({ feeReminderDaysBefore: parseInt(e.target.value) })}
                className="px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                <option value={1}>1 day before</option>
                <option value={2}>2 days before</option>
                <option value={3}>3 days before</option>
                <option value={5}>5 days before</option>
                <option value={7}>7 days before</option>
              </select>
            </div>
          )}
        </div>
      </Card>

      {/* AI Message Composition */}
      <Card title="AI Message Composition">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-800">AI-powered messages</p>
              <p className="text-xs text-zinc-400 mt-0.5">Use Claude to compose context-aware, personalized messages instead of static templates</p>
            </div>
            <Switch checked={config.aiEnabled} onCheckedChange={(v) => update({ aiEnabled: v })} />
          </div>

          {config.aiEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-zinc-100">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">AI Provider</label>
                <select value={config.aiProvider} onChange={(e) => update({ aiProvider: e.target.value as 'claude' | 'none' })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="claude">Claude (Anthropic)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-1">Model</label>
                <select value={config.aiModel} onChange={(e) => update({ aiModel: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option value="claude-sonnet-4-20250514">Claude Sonnet 4 (Recommended)</option>
                  <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5 (Faster)</option>
                  <option value="claude-opus-4-6">Claude Opus 4.6 (Most capable)</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-zinc-700 mb-1">API Key</label>
                <div className="relative">
                  <input
                    type={showAiKey ? 'text' : 'password'}
                    value={config.aiApiKey}
                    onChange={(e) => update({ aiApiKey: e.target.value })}
                    placeholder="sk-ant-api03-..."
                    className="w-full px-3 py-2 pr-10 border border-zinc-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <button onClick={() => setShowAiKey(!showAiKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600">
                    {showAiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Rate Limiting & Retries */}
      <Card title="Delivery Settings">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Retry Attempts</label>
            <select value={config.retryAttempts} onChange={(e) => update({ retryAttempts: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value={0}>No retries</option>
              <option value={1}>1 retry</option>
              <option value={2}>2 retries</option>
              <option value={3}>3 retries</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Retry Delay</label>
            <select value={config.retryDelayMs} onChange={(e) => update({ retryDelayMs: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value={1000}>1 second</option>
              <option value={3000}>3 seconds</option>
              <option value={5000}>5 seconds</option>
              <option value={10000}>10 seconds</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Rate Limit</label>
            <select value={config.rateLimitMs} onChange={(e) => update({ rateLimitMs: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500">
              <option value={100}>100ms</option>
              <option value={200}>200ms (Recommended)</option>
              <option value={500}>500ms</option>
              <option value={1000}>1 second</option>
            </select>
            <p className="text-xs text-zinc-400 mt-1">Delay between each WhatsApp message to avoid rate limits</p>
          </div>
        </div>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <button onClick={onSave} disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
          {saving ? 'Saving...' : 'Save Automation Settings'}
        </button>
      </div>
    </div>
  );
}
