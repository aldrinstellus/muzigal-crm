import { useState } from 'react';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';
import { activeApi as api } from '../api/client';
import { cn } from '../lib/utils';
import { Card } from '@zoo/ui';
import { Input, Textarea, Button, Label } from '../components/ui/form';

export default function TestMessage() {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('Hello from Muzigal WhatsApp!');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; text: string } | null>(null);
  const [history, setHistory] = useState<Array<{ phone: string; message: string; time: string; success: boolean }>>([]);

  const handleSend = async () => {
    if (!phone.trim()) return;
    setSending(true);
    setResult(null);
    try {
      const res = await api.sendTest(phone.trim(), message);
      const success = res.status === 'ok';
      setResult({
        success,
        text: success ? 'Test message sent successfully' : (res.message || 'Failed to send'),
      });
      setHistory(prev => [{
        phone: phone.trim(),
        message,
        time: new Date().toLocaleTimeString('en-IN'),
        success,
      }, ...prev].slice(0, 10));
    } catch (err) {
      setResult({
        success: false,
        text: err instanceof Error ? err.message : 'Failed to send',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Left: Send form */}
      <div className="lg:col-span-3">
        <Card title="Send Test Message">
          <div className="space-y-4">
            <div>
              <Label>Phone Number</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="919876543210"
              />
              <p className="text-xs text-zinc-400 mt-1">Enter number with country code, no + or spaces (e.g. 919876543210)</p>
            </div>
            <div>
              <Label>Message</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>
            <Button onClick={handleSend} disabled={sending || !phone.trim()}>
              <Send size={14} />
              {sending ? 'Sending...' : 'Send Test Message'}
            </Button>
            {result && (
              <div className={cn(
                'flex items-center gap-2 p-3 rounded-xl text-sm',
                result.success
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                  : 'bg-red-50 border border-red-200 text-red-700'
              )}>
                {result.success ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                {result.text}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Right: History */}
      <div className="lg:col-span-2">
        <Card title="Recent Tests">
          {history.length === 0 ? (
            <p className="text-sm text-zinc-400 text-center py-8">No tests sent yet</p>
          ) : (
            <div className="space-y-2">
              {history.map((entry, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-zinc-50">
                  <div className="min-w-0">
                    <p className="text-sm text-zinc-700 font-medium">{entry.phone}</p>
                    <p className="text-xs text-zinc-400 truncate">{entry.message}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-zinc-400">{entry.time}</span>
                    <span className={cn(
                      'w-2 h-2 rounded-full',
                      entry.success ? 'bg-emerald-500' : 'bg-red-500'
                    )} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
