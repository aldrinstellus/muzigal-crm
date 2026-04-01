import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';
import { CLIENT } from '../config/client';
import { activeApi as api, setToken } from '../api/client';
import { getMode, setMode, type AppMode } from '../lib/mode';
import { MessageCircle } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setModeState] = useState<AppMode>(getMode);

  useEffect(() => {
    const param = searchParams.get('mode');
    if (param === 'demo' || param === 'prod') {
      setMode(param);
      setModeState(param);
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  function handleModeToggle(newMode: AppMode) {
    setMode(newMode);
    setModeState(newMode);
    setError('');
    setEmail('');
    setPassword('');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.login(email + ':' + password);

      if (res.status === 'ok' && res.data?.token) {
        setToken(res.data.token);
        login(res.data.token, res.data.user);
        navigate('/dashboard', { replace: true });
      } else {
        setError(res.data?.error || res.message || 'Invalid email or password.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Muzigal WhatsApp</h1>
          <p className="text-zinc-500 text-sm mt-1">{CLIENT.portalTitle}</p>
        </div>

        <div className="flex items-center justify-center mb-6">
          <div className="flex bg-zinc-100 rounded-lg p-1 gap-1">
            <button
              onClick={() => handleModeToggle('prod')}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
                mode === 'prod'
                  ? 'bg-white text-zinc-900 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              Production
            </button>
            <button
              onClick={() => handleModeToggle('demo')}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
                mode === 'demo'
                  ? 'bg-amber-400 text-amber-900 shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              Demo
            </button>
          </div>
        </div>

        {mode === 'demo' && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            <p className="font-semibold mb-1">Demo mode — fake data only</p>
            <p>Email: <span className="font-mono">{CLIENT.demoUser.email}</span> · Password: <span className="font-mono">{CLIENT.demoUser.password}</span></p>
          </div>
        )}

        <div className="bg-white border border-zinc-200 rounded-xl p-6 sm:p-8">
          <h2 className="text-base font-semibold text-zinc-900 mb-1">Sign in</h2>
          <p className="text-sm text-zinc-500 mb-6">Enter your credentials to access the dashboard.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-zinc-300 mt-6">Powered by ZOO CRM</p>
      </div>
    </div>
  );
}
