import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

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
        navigate('/dashboard');
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
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100 overflow-hidden relative">
      
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="absolute top-[10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-600/10 blur-[120px]" />
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.1 }} className="absolute bottom-[-20%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="w-full max-w-md relative z-10 perspective-1000 mt-10 mb-10">
        <div className="rounded-3xl border border-slate-700/50 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl transition-transform duration-200 hover:rotate-y-2 hover:rotate-x-2">
          <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-tr from-cyan-500/30 to-blue-500/30 opacity-20 blur-xl"></div>
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 text-white mb-6 mx-auto shadow-lg shadow-cyan-500/30 group">
              <Sparkles size={24} className="transition-transform group-hover:scale-110" />
            </Link>
            
            <div className="mb-8 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-cyan-400 mb-2">Get Started</p>
              <h1 className="text-3xl font-display font-bold text-white tracking-tight">Create your account</h1>
            </div>
            
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Full Name</label>
                <input className="w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-slate-100 outline-none transition-all focus:border-cyan-500 focus:bg-slate-900 focus:ring-2 focus:ring-cyan-500/20" type="text" autoComplete="name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="John Doe" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Email Address</label>
                <input className="w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-slate-100 outline-none transition-all focus:border-cyan-500 focus:bg-slate-900 focus:ring-2 focus:ring-cyan-500/20" type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="you@example.com" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Password</label>
                <input className="w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-slate-100 outline-none transition-all focus:border-cyan-500 focus:bg-slate-900 focus:ring-2 focus:ring-cyan-500/20" type="password" autoComplete="new-password" minLength={8} required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Min 8 characters" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-300">Confirm Password</label>
                <input className="w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-slate-100 outline-none transition-all focus:border-cyan-500 focus:bg-slate-900 focus:ring-2 focus:ring-cyan-500/20" type="password" autoComplete="new-password" minLength={8} required value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} placeholder="Repeat password" />
              </div>
              
              {error && <p role="alert" className="text-sm font-medium text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">{error}</p>}
              {message && <p role="status" className="text-sm font-medium text-emerald-400 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">{message}</p>}
              
              <button disabled={loading} className="group relative w-full overflow-hidden rounded-xl bg-cyan-600 px-4 py-3.5 font-bold text-white shadow-lg shadow-cyan-500/25 transition-all hover:bg-cyan-500 active:scale-95 disabled:opacity-60 disabled:active:scale-100 flex items-center justify-center gap-2 mt-2">
                <span className="relative z-10">{loading ? 'Creating account...' : 'Create Account'}</span>
                {!loading && <ArrowRight size={18} className="relative z-10 transition-transform group-hover:translate-x-1" />}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-500 opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            </form>
            
            <p className="mt-8 text-center text-sm font-medium text-slate-400">
              Already have an account? <Link to="/login" className="text-cyan-400 hover:text-cyan-300 underline underline-offset-4 decoration-cyan-500/30 hover:decoration-cyan-400">Sign in</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
