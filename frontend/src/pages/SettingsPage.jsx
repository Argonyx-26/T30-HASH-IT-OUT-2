import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Send, Terminal } from 'lucide-react';
import { supabase } from '../lib/supabase';

const emptyProfile = {
  fullName: '',
  education: '',
  skills: '',
  targetCareer: '',
  weeklyLearningHours: '0',
  experienceLevel: '',
};

const inputClass = 'mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-emerald-500';

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
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="font-mono text-sm uppercase tracking-widest text-emerald-400">ACCOUNT_SETTINGS.INF</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Settings</h1>
        </div>

        <section className="border-b border-slate-800 pb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-emerald-400">PROFILE_DATA</p>
              <h2 className="mt-2 text-xl font-semibold text-white">Update your profile</h2>
            </div>
            <button type="button" onClick={logout} disabled={signingOut} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-900 disabled:opacity-50">
              <LogOut size={16} /> {signingOut ? 'Signing out...' : 'Log out'}
            </button>
          </div>

          {loading ? <p role="status" className="mt-5 text-sm text-slate-400">Loading account settings...</p> : !profileId ? (
            <div className="mt-5">
              {profileError && <p role="alert" className="text-sm text-rose-300">{profileError}</p>}
              {!user && <Link to="/login" className="mt-3 inline-flex text-sm text-emerald-400 hover:text-emerald-300">Go to login</Link>}
              {user && <Link to="/onboarding" className="mt-3 inline-flex text-sm text-emerald-400 hover:text-emerald-300">Complete profile setup</Link>}
            </div>
          ) : (
            <form onSubmit={saveProfile} className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-slate-300">Full name
                <input className={inputClass} value={form.fullName} onChange={(event) => updateField('fullName', event.target.value)} autoComplete="name" />
              </label>
              <label className="text-sm text-slate-300">Target career
                <input className={inputClass} value={form.targetCareer} onChange={(event) => updateField('targetCareer', event.target.value)} />
              </label>
              <label className="text-sm text-slate-300">Education
                <input className={inputClass} value={form.education} onChange={(event) => updateField('education', event.target.value)} />
              </label>
              <label className="text-sm text-slate-300">Experience level
                <select className={inputClass} value={form.experienceLevel} onChange={(event) => updateField('experienceLevel', event.target.value)}>
                  <option value="">Not specified</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </label>
              <label className="text-sm text-slate-300">Weekly learning hours
                <input className={inputClass} type="number" min="0" max="168" value={form.weeklyLearningHours} onChange={(event) => updateField('weeklyLearningHours', event.target.value)} />
              </label>
              <label className="text-sm text-slate-300 sm:col-span-2">Skills, separated by commas
                <textarea className={`${inputClass} min-h-24`} value={form.skills} onChange={(event) => updateField('skills', event.target.value)} />
              </label>
              {profileError && <p role="alert" className="text-sm text-rose-300 sm:col-span-2">{profileError}</p>}
              {profileStatus && <p role="status" className="text-sm text-emerald-300 sm:col-span-2">{profileStatus}</p>}
              <div className="sm:col-span-2">
                <button type="submit" disabled={savingProfile} className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50">
                  {savingProfile ? 'Saving...' : 'Save profile'}
                </button>
              </div>
            </form>
          )}
        </section>

        <section className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-6 sm:p-8">
          <div className="mx-auto max-w-xl text-center">
            <Terminal className="mx-auto h-14 w-14 text-emerald-500" strokeWidth={2.5} />
            <p className="mt-6 font-mono text-xs uppercase tracking-widest text-emerald-400">CONTACT_CHANNEL.INF</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Technical Feedback &amp; Support</h2>
            <h3 className="mt-8 font-mono text-lg font-bold uppercase tracking-wider text-violet-300">INITIATE_COMMUNICATION</h3>
            <p className="mt-3 text-sm leading-6 text-slate-400">Submit technical feedback or request system assistance.</p>
          </div>

          <form onSubmit={submitFeedback} className="mx-auto mt-8 max-w-xl space-y-5">
            <label className="block rounded-lg border border-slate-700 bg-slate-950 p-3 text-xs uppercase tracking-widest text-slate-400">
              SENDER_EMAIL
              <input readOnly value={user?.email || ''} placeholder="Sign in to attach your email" className="mt-2 w-full bg-transparent text-base normal-case tracking-normal text-slate-100 outline-none" />
            </label>
            <label className="block rounded-lg border border-slate-700 bg-slate-950 p-4 text-sm text-slate-300">
              ENCRYPTED_MESSAGE
              <textarea required value={supportMessage} onChange={(event) => { setSupportMessage(event.target.value); setSupportStatus(''); }} maxLength={4000} rows={6} className="mt-3 w-full resize-y bg-transparent text-slate-100 outline-none" />
            </label>
            {supportStatus && <p role="status" className="text-sm text-emerald-300">{supportStatus}</p>}
            <button type="submit" disabled={!supportMessage.trim()} className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-4 font-mono text-sm font-bold uppercase tracking-widest text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50">
              <Send size={16} /> EXECUTE_SEND
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}