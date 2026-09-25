import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!supabase) {
      setError('Supabase is not configured. Set the VITE_SUPABASE values in frontend/.env.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to create your account.');

      if (result.session) {
        const { error: sessionError } = await supabase.auth.setSession(result.session);
        if (sessionError) throw sessionError;
        navigate('/onboarding');
      } else {
        setMessage(result.message);
      }
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-soft">
        <div className="mb-8 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Get started</p>
          <h1 className="mt-3 text-3xl font-bold">Create your account</h1>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm text-slate-300">Name</label>
            <input className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100" type="text" autoComplete="name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="John Doe" />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300">Email</label>
            <input className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100" type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300">Password</label>
            <input className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100" type="password" autoComplete="new-password" minLength={8} required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Min 8 characters" />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300">Confirm Password</label>
            <input className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100" type="password" autoComplete="new-password" minLength={8} required value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} placeholder="Repeat password" />
          </div>
          {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
          {message && <p role="status" className="text-sm text-emerald-300">{message}</p>}
          <button disabled={loading} className="w-full rounded-xl bg-blue-600 px-4 py-3 text-center font-medium text-white hover:bg-blue-500 disabled:opacity-60">{loading ? 'Creating account...' : 'Create account'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account? <Link to="/login" className="text-blue-300">Login</Link>
        </p>
      </div>
    </div>
  );
}
