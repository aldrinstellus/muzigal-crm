import { useState } from 'react';
import { Music, CheckCircle, AlertCircle, Phone, MapPin } from 'lucide-react';
import { activeApi as api } from '../api/client';

export default function PublicEnrollment() {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    instrument: '',
    ageGroup: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await api.createInquiry({
        Name: form.name,
        Phone: form.phone,
        Email: form.email,
        Instrument: form.instrument,
        AgeGroup: form.ageGroup,
        Status: 'New',
        Source: 'Website',
        CreatedAt: new Date().toISOString(),
      });
      if (res.status === 'ok') {
        setSubmitted(true);
      } else {
        setError(res.message || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-4">
              <Music size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Muzigal</h1>
            <p className="text-sm text-zinc-500 mt-1">Begin your musical journey</p>
          </div>

          {submitted ? (
            <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-50 rounded-full mb-4">
                <CheckCircle size={24} className="text-emerald-600" />
              </div>
              <h2 className="text-lg font-semibold text-zinc-900 mb-2">Thank you!</h2>
              <p className="text-sm text-zinc-500">
                We'll contact you to schedule a demo class. Looking forward to making music together!
              </p>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-zinc-900 mb-1">Enroll Now</h2>
              <p className="text-sm text-zinc-500 mb-6">Fill in your details and we'll get in touch</p>

              {error && (
                <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle size={14} />{error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Full Name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={set('name')}
                    placeholder="Your name"
                    className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Phone *</label>
                  <input
                    required
                    value={form.phone}
                    onChange={set('phone')}
                    placeholder="Your phone number"
                    className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={set('email')}
                    placeholder="Your email address"
                    className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1">Instrument *</label>
                  <select
                    required
                    value={form.instrument}
                    onChange={set('instrument')}
                    className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="">Select an instrument</option>
                    <option value="Guitar">Guitar</option>
                    <option value="Keyboard">Keyboard</option>
                    <option value="Drums">Drums</option>
                    <option value="Vocals">Vocals</option>
                    <option value="Violin">Violin</option>
                    <option value="Ukulele">Ukulele</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-2">Age Group *</label>
                  <div className="flex gap-3">
                    {[
                      { value: '3-6', label: '3-6 years' },
                      { value: '7+', label: '7+ years' },
                      { value: 'Adult', label: 'Adult' },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex-1 flex items-center justify-center px-3 py-2.5 border rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                          form.ageGroup === opt.value
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="ageGroup"
                          value={opt.value}
                          checked={form.ageGroup === opt.value}
                          onChange={set('ageGroup')}
                          className="sr-only"
                          required
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Enrollment'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-6 px-4">
        <div className="max-w-md mx-auto text-center space-y-2">
          <p className="text-sm font-semibold text-zinc-900">Muzigal Music Academy</p>
          <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-500">
            <MapPin size={12} />
            <span>Bangalore, Karnataka, India</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-500">
            <Phone size={12} />
            <span>Contact us for more info</span>
          </div>
          <p className="text-[10px] text-zinc-300 mt-3">Powered by ZOO CRM</p>
        </div>
      </footer>
    </div>
  );
}
