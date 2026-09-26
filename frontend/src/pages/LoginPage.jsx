import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100 overflow-hidden relative">
      
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/10 blur-[120px]" />
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.1 }} className="absolute bottom-[-20%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="w-full max-w-md relative z-10 perspective-1000">
        <div className="rounded-3xl border border-slate-700/50 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-xl transition-transform duration-200 hover:rotate-y-2 hover:rotate-x-2">
          <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-tr from-blue-500/30 to-cyan-500/30 opacity-20 blur-xl"></div>
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 text-white mb-8 mx-auto shadow-lg shadow-blue-500/30 group">
              <Sparkles size={24} className="transition-transform group-hover:scale-110" />
            </Link>
            
            <div className="mb-8 text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400 mb-2">Welcome Back</p>
              <h1 className="text-3xl font-display font-bold text-white tracking-tight">Login to SkillPilot</h1>
            </div>
            
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Email Address</label>
                <input className="w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3.5 text-slate-100 outline-none transition-all focus:border-blue-500 focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">Password</label>
                <input className="w-full rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3.5 text-slate-100 outline-none transition-all focus:border-blue-500 focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" />
              </div>
              
              {error && <p role="alert" className="text-sm font-medium text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">{error}</p>}
              
              <button disabled={loading} className="group relative w-full overflow-hidden rounded-xl bg-blue-600 px-4 py-3.5 font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-500 active:scale-95 disabled:opacity-60 disabled:active:scale-100 flex items-center justify-center gap-2">
                <span className="relative z-10">{loading ? 'Authenticating...' : 'Sign In'}</span>
                {!loading && <ArrowRight size={18} className="relative z-10 transition-transform group-hover:translate-x-1" />}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            </form>
            
            <p className="mt-8 text-center text-sm font-medium text-slate-400">
              New to SkillPilot? <Link to="/register" className="text-blue-400 hover:text-blue-300 underline underline-offset-4 decoration-blue-500/30 hover:decoration-blue-400">Create an account</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
