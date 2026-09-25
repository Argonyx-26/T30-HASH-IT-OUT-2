import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!supabase) {
      setError('Supabase is not configured. Set the VITE_SUPABASE values in frontend/.env.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to sign in.');
      const { error: sessionError } = await supabase.auth.setSession(result.session);
      if (sessionError) throw sessionError;
      navigate('/dashboard');
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
          <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Welcome back</p>
          <h1 className="mt-3 text-3xl font-bold">Login to SkillPilot</h1>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm text-slate-300">Email</label>
            <input className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-300">Password</label>
            <input className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Password" />
          </div>
          {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
          <button disabled={loading} className="w-full rounded-xl bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-500 disabled:opacity-60">{loading ? 'Signing in...' : 'Login'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-400">
          No account? <Link to="/register" className="text-blue-300">Create one</Link>
        </p>
      </div>
    </div>
  );
}
