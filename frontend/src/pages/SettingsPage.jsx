import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Send, Terminal } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

const emptyProfile = {
  fullName: '',
  education: '',
  skills: '',
  targetCareer: '',
  weeklyLearningHours: '0',
  experienceLevel: '',
};

const inputClass = 'mt-2 w-full rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-3.5 text-slate-100 outline-none transition-all focus:border-blue-500 focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20';

export default function SettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileId, setProfileId] = useState('');
  const [form, setForm] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileStatus, setProfileStatus] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportStatus, setSupportStatus] = useState('');

  useEffect(() => {
    let active = true;

    const loadSettings = async () => {
      if (!supabase) {
        setProfileError('Supabase is not configured.');
        setLoading(false);
        return;
      }

      const { data: { user: signedInUser }, error: userError } = await supabase.auth.getUser();
      if (userError || !signedInUser) {
        if (active) {
          setProfileError('Sign in to manage your profile settings.');
          setLoading(false);
        }
        return;
      }
      if (active) setUser(signedInUser);

      const { data, error: loadError } = await supabase.from('profiles')
        .select('id, full_name, education, skills, target_career, weekly_learning_hours, experience_level')
        .eq('id', signedInUser.id)
        .maybeSingle();
      if (!active) return;
      if (loadError) {
        setProfileError(loadError.message);
      } else if (!data) {
        setProfileError('Set up your profile before editing settings.');
      } else {
        setProfileId(data.id);
        setForm({
          fullName: data.full_name || signedInUser.user_metadata?.name || '',
          education: data.education || '',
          skills: (data.skills || []).join(', '),
          targetCareer: data.target_career || '',
          weeklyLearningHours: String(data.weekly_learning_hours || 0),
          experienceLevel: data.experience_level || '',
        });
      }
      setLoading(false);
    };

    loadSettings();
    return () => { active = false; };
  }, []);

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setProfileStatus('');
    setProfileError('');
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    if (!supabase || !profileId) return;
    setSavingProfile(true);
    setProfileError('');
    setProfileStatus('');
    const skills = [...new Set(form.skills.split(/[\n,]/).map((skill) => skill.trim()).filter(Boolean))];
    const { error: saveError } = await supabase.from('profiles').update({
      full_name: form.fullName.trim(),
      education: form.education.trim(),
      skills,
      target_career: form.targetCareer.trim(),
      weekly_learning_hours: Math.max(0, Math.min(168, Number(form.weeklyLearningHours) || 0)),
      experience_level: form.experienceLevel,
      ai_analysis: {},
      updated_at: new Date().toISOString(),
    }).eq('id', profileId);

    if (saveError) setProfileError(saveError.message || 'Could not save your profile.');
    else setProfileStatus('Profile updated. Your next dashboard visit will refresh AI analysis.');
    setSavingProfile(false);
  };

  const logout = async () => {
    if (!supabase) return;
    setSigningOut(true);
    const { error: logoutError } = await supabase.auth.signOut();
    if (logoutError) {
      setProfileError(logoutError.message || 'Could not sign out.');
      setSigningOut(false);
      return;
    }
    navigate('/login');
  };

  const submitFeedback = (event) => {
    event.preventDefault();
    if (!supportMessage.trim()) return;
    const recipient = import.meta.env.VITE_SUPPORT_EMAIL || '';
    const subject = encodeURIComponent('SkillPilot technical feedback or support');
    const body = encodeURIComponent(`From: ${user?.email || 'Not signed in'}\n\n${supportMessage.trim()}`);
    window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
    setSupportStatus(recipient
      ? 'An email draft was opened in your email app.'
      : 'An email draft was opened. Add your support team address before sending.');
  };

  return (
    <div className="w-full">
      <div className="mx-auto max-w-4xl">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm uppercase tracking-[0.25em] text-blue-400 font-bold mb-2">Preferences</motion.p>
            <h1 className="text-4xl font-display font-bold text-white tracking-tight">Settings</h1>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={logout} disabled={signingOut} className="inline-flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-900/50 px-5 py-2.5 text-sm font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500/30 transition-all disabled:opacity-50">
              <LogOut size={16} /> {signingOut ? 'Signing out...' : 'Log out'}
            </button>
          </div>
        </header>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-8 backdrop-blur-sm shadow-xl mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="mb-8 border-b border-slate-800/50 pb-6">
              <h2 className="text-xl font-display font-bold text-white">Update your profile</h2>
              <p className="text-sm text-slate-400 mt-1">Manage your personal information and learning preferences.</p>
            </div>

            {loading ? <div className="flex justify-center items-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div> : !profileId ? (
              <div className="py-6 text-center">
                {profileError && <p role="alert" className="text-sm font-medium text-rose-400 mb-4">{profileError}</p>}
                {!user && <Link to="/login" className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-500">Go to login</Link>}
                {user && <Link to="/onboarding" className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-3 font-bold text-white shadow-lg hover:shadow-blue-500/25 transition-all">Complete profile setup</Link>}
              </div>
            ) : (
              <form onSubmit={saveProfile} className="grid gap-6 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-300">Full name
                  <input className={inputClass} value={form.fullName} onChange={(event) => updateField('fullName', event.target.value)} autoComplete="name" />
                </label>
                <label className="text-sm font-medium text-slate-300">Target career
                  <input className={inputClass} value={form.targetCareer} onChange={(event) => updateField('targetCareer', event.target.value)} />
                </label>
                <label className="text-sm font-medium text-slate-300">Education
                  <input className={inputClass} value={form.education} onChange={(event) => updateField('education', event.target.value)} />
                </label>
                <label className="text-sm font-medium text-slate-300">Experience level
                  <select className={inputClass} value={form.experienceLevel} onChange={(event) => updateField('experienceLevel', event.target.value)}>
                    <option value="">Not specified</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </label>
                <label className="text-sm font-medium text-slate-300">Weekly learning hours
                  <input className={inputClass} type="number" min="0" max="168" value={form.weeklyLearningHours} onChange={(event) => updateField('weeklyLearningHours', event.target.value)} />
                </label>
                <label className="text-sm font-medium text-slate-300 sm:col-span-2">Skills (separated by commas)
                  <textarea className={`${inputClass} min-h-[120px] resize-y`} value={form.skills} onChange={(event) => updateField('skills', event.target.value)} />
                </label>
                
                {profileError && <p role="alert" className="text-sm font-medium text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 sm:col-span-2">{profileError}</p>}
                {profileStatus && <p role="status" className="text-sm font-medium text-emerald-400 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20 sm:col-span-2">{profileStatus}</p>}
                
                <div className="sm:col-span-2 mt-2">
                  <button type="submit" disabled={savingProfile} className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-blue-600 px-8 py-3.5 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 active:scale-95 disabled:opacity-50 disabled:active:scale-100">
                    {savingProfile ? 'Saving Changes...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.1 }} className="rounded-3xl border border-blue-500/20 bg-blue-900/10 p-8 sm:p-10 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-400 mb-6">
              <Terminal size={32} strokeWidth={2} />
            </div>
            <p className="font-mono text-xs uppercase tracking-widest text-blue-400 mb-2">Support Channel</p>
            <h2 className="text-2xl font-display font-bold text-white mb-3">Need Help or Have Feedback?</h2>
            <p className="text-slate-400 mb-8">Reach out to our support team if you encounter any issues or have suggestions to improve your experience.</p>
            
            <form onSubmit={submitFeedback} className="w-full space-y-4 text-left">
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Sender Email</label>
                <input readOnly value={user?.email || ''} placeholder="Sign in to attach your email" className="w-full bg-transparent text-white outline-none font-medium" />
              </div>
              <div className="rounded-xl border border-slate-700/50 bg-slate-900/50 p-4 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/20 transition-all">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Message</label>
                <textarea required value={supportMessage} onChange={(event) => { setSupportMessage(event.target.value); setSupportStatus(''); }} maxLength={4000} rows={5} placeholder="Describe your issue or feedback..." className="w-full resize-y bg-transparent text-white outline-none placeholder-slate-600" />
              </div>
              
              {supportStatus && <p role="status" className="text-sm font-medium text-emerald-400 bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">{supportStatus}</p>}
              
              <button type="submit" disabled={!supportMessage.trim()} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-4 font-bold text-white transition-all hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
                <Send size={18} /> Send Message
              </button>
            </form>
          </div>
        </motion.section>
      </div>
    </div>
  );
}