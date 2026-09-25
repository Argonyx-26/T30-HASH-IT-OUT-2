import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, FileUp } from 'lucide-react';
import { supabase } from '../lib/supabase';

const steps = [
  { key: 'education', title: 'What are you currently studying?', type: 'select', options: ['Computer Science', 'Data Science', 'Information Technology', 'Engineering', 'Business', 'Other'] },
  { key: 'skills', title: 'What technologies do you know?', type: 'multi-select', options: ['Java', 'JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'MongoDB', 'Git', 'Machine Learning', 'Data Structures', 'Docker', 'TypeScript'] },
  { key: 'targetCareer', title: 'What career are you interested in?', type: 'select', options: ['Software Engineer', 'AI Engineer', 'Data Scientist', 'DevOps Engineer', 'Full Stack Developer', 'Product Engineer', 'Cybersecurity Engineer'] },
  { key: 'learningHours', title: 'How much time can you spend learning per week?', type: 'select', options: ['2', '4', '6', '8', '10', '12', '15', '20'] },
  { key: 'experienceLevel', title: 'What is your experience level?', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced'] },
  { key: 'profileNotes', title: 'Add other experience, projects, or certifications', type: 'textarea' },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({ education: '', educationOther: '', skills: [], targetCareer: '', learningHours: '', experienceLevel: '', profileNotes: '', resumeData: {} });
  const [error, setError] = useState('');
  const [customSkill, setCustomSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [resumeMessage, setResumeMessage] = useState('');

  const current = steps[step];

  const saveProfile = async () => {
    if (!supabase) {
      setError('Supabase is not configured. Set the VITE_SUPABASE values in frontend/.env.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        navigate('/login');
        return;
      }

      const resumeData = profile.resumeData || {};
      const savedResumeData = {
        ...resumeData,
        summary: [resumeData.summary, profile.profileNotes.trim()].filter(Boolean).join('\n\n'),
        educationDetails: resumeData.educationDetails || {},
        skills: profile.skills,
        workExperience: resumeData.workExperience || [],
        projects: resumeData.projects || [],
        certifications: resumeData.certifications || [],
      };
      const { error: saveError } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: user.user_metadata?.name || '',
        education: profile.education === 'Other' ? profile.educationOther.trim() : profile.education,
        skills: profile.skills,
        target_career: profile.targetCareer,
        weekly_learning_hours: Number(profile.learningHours) || 0,
        experience_level: profile.experienceLevel,
        resume_data: savedResumeData,
        ai_analysis: {},
        updated_at: new Date().toISOString(),
      });
      if (saveError) throw saveError;
      navigate('/dashboard');
    } catch (saveError) {
      setError(saveError.message || 'Unable to save your profile.');
    } finally {
      setSaving(false);
    }
  };

  const continueOnboarding = () => {
    const answer = profile[current.key];
    if (current.key === 'education' && answer === 'Other' && !profile.educationOther.trim()) {
      setError('Enter what you are studying.');
      return;
    }
    if (current.key !== 'profileNotes' && (current.key === 'skills' ? answer.length === 0 : !answer)) {
      setError('Choose an option before continuing.');
      return;
    }
    setError('');
    if (step === steps.length - 1) {
      saveProfile();
    } else {
      setStep((previous) => Math.min(previous + 1, steps.length - 1));
    }
  };

  const toggleSkill = (skill) => {
    setProfile((currentProfile) => ({
      ...currentProfile,
      skills: currentProfile.skills.includes(skill)
        ? currentProfile.skills.filter((item) => item !== skill)
        : [...currentProfile.skills, skill],
    }));
    setError('');
  };

  const addCustomSkill = () => {
    const skill = customSkill.trim();
    if (!skill) return;
    setProfile((currentProfile) => ({
      ...currentProfile,
      skills: currentProfile.skills.some((item) => item.toLowerCase() === skill.toLowerCase())
        ? currentProfile.skills
        : [...currentProfile.skills, skill],
    }));
    setCustomSkill('');
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setError('');
    setResumeMessage('');
    if (!supabase) {
      setError('Supabase is not configured. Set the VITE_SUPABASE values in frontend/.env.');
      return;
    }

    setUploadingResume(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session) {
        navigate('/login');
        return;
      }

      const formData = new FormData();
      formData.append('resume', file);
      const response = await fetch('/api/resume/extract', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Resume extraction failed.');

      const extracted = result.extracted;
      setProfile((currentProfile) => ({
        ...currentProfile,
        education: extracted.education || currentProfile.education,
        educationOther: extracted.educationOther || currentProfile.educationOther,
        skills: extracted.skills?.length ? extracted.skills : currentProfile.skills,
        targetCareer: extracted.targetCareer || currentProfile.targetCareer,
        experienceLevel: extracted.experienceLevel || currentProfile.experienceLevel,
        resumeData: result.resumeData || currentProfile.resumeData,
      }));
      setResumeMessage('Resume details imported. Review each choice and fill anything missing.');
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploadingResume(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-6 text-slate-100">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-800 bg-slate-900 p-8 shadow-soft">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Onboarding</p>
            <h1 className="mt-3 text-3xl font-bold">Create your growth profile</h1>
          </div>
          <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-sm text-slate-300">{step + 1}/{steps.length}</span>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950 p-4">
          <div>
            <p className="font-medium text-white">Resume import <span className="text-sm font-normal text-slate-400">(optional)</span></p>
            <p className="mt-1 text-sm text-slate-400">PDF or DOCX, up to 10 MB</p>
            <p className="mt-1 text-xs text-slate-500">The original file is not stored; extracted profile details are saved to your account.</p>
          </div>
          <label className={`inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-500 ${uploadingResume || saving ? 'pointer-events-none opacity-60' : ''}`}>
            <FileUp size={18} />
            {uploadingResume ? 'Analyzing...' : 'Upload resume'}
            <input type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleResumeUpload} className="sr-only" disabled={uploadingResume || saving} />
          </label>
          {resumeMessage && <p role="status" className="basis-full text-sm text-emerald-300">{resumeMessage}</p>}
        </div>

        <div className="mb-8 h-2 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
        </div>

        <div className="space-y-6">
          <label className="block">
            <span className="mb-3 block text-lg font-medium text-white">{current.title}</span>
            {current.type === 'textarea' ? (
              <textarea
                value={profile.profileNotes}
                onChange={(event) => { setProfile({ ...profile, profileNotes: event.target.value }); setError(''); }}
                className="min-h-36 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
                placeholder="Roles, projects, certifications, or other career details"
              />
            ) : current.type === 'multi-select' ? (
              <>
                <details className="group relative">
                  <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 marker:hidden">
                    <span className={profile.skills.length ? 'text-slate-100' : 'text-slate-400'}>
                      {profile.skills.length ? `${profile.skills.length} selected` : 'Select technologies'}
                    </span>
                    <ChevronDown size={18} className="text-slate-400 transition group-open:rotate-180" />
                  </summary>
                  <div className="absolute z-10 mt-2 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-700 bg-slate-950 p-2 shadow-xl">
                    {current.options.map((option) => (
                      <label key={option} className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">
                        <input type="checkbox" checked={profile.skills.includes(option)} onChange={() => toggleSkill(option)} className="h-4 w-4 accent-blue-500" />
                        {option}
                      </label>
                    ))}
                  </div>
                </details>
                <div className="mt-3 flex gap-2">
                  <input
                    value={customSkill}
                    onChange={(event) => setCustomSkill(event.target.value)}
                    onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addCustomSkill(); } }}
                    className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
                    placeholder="Add another skill"
                    aria-label="Add another skill"
                  />
                  <button type="button" onClick={addCustomSkill} className="rounded-xl border border-slate-700 px-4 text-slate-200 hover:bg-slate-800">Add</button>
                </div>
                {profile.skills.length > 0 && <p className="mt-3 text-sm text-slate-400">Selected: {profile.skills.join(', ')}</p>}
              </>
            ) : (
              <select required value={profile[current.key]} onChange={(event) => { setProfile({ ...profile, [current.key]: event.target.value }); setError(''); }} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100">
                <option value="" disabled>Choose an option</option>
                {current.options.map((option) => (
                  <option key={option} value={option}>{current.key === 'learningHours' ? `${option} hours` : option}</option>
                ))}
              </select>
            )}
            {current.key === 'education' && profile.education === 'Other' && (
              <input
                autoFocus
                required
                value={profile.educationOther}
                onChange={(event) => { setProfile({ ...profile, educationOther: event.target.value }); setError(''); }}
                className="mt-3 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100"
                placeholder="Enter your area of study"
                aria-label="Other area of study"
              />
            )}
          </label>
        </div>

        {error && <p role="alert" className="mt-4 text-sm text-rose-300">{error}</p>}
        <div className="mt-8 flex justify-between gap-4">
          <button type="button" disabled={step === 0 || saving} onClick={() => setStep((prev) => Math.max(prev - 1, 0))} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-200 disabled:cursor-not-allowed disabled:opacity-40">Back</button>
          <button type="button" disabled={saving} onClick={continueOnboarding} className="rounded-xl bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-500 disabled:opacity-60">
            {saving ? 'Saving...' : step === steps.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
