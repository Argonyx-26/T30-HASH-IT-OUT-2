import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Download, FileUp, WandSparkles } from 'lucide-react';
import { useProfileData } from '../lib/profileData';
import { supabase } from '../lib/supabase';

const emptyResume = {
  fullName: '',
  targetRole: '',
  contact: '',
  summary: '',
  skills: '',
  experience: '',
  education: '',
  projects: '',
  certifications: '',
};

const fieldClass = 'mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-blue-400';

function listText(items, formatItem = (item) => item) {
  return Array.isArray(items) ? items.map(formatItem).filter(Boolean).join('\n\n') : '';
}

function resumeFromProfile(profile) {
  const data = profile?.resume_data || {};
  const savedDraft = data.builderDraft || {};
  const educationDetails = data.educationDetails || {};
  return {
    ...emptyResume,
    fullName: savedDraft.fullName || profile?.full_name || '',
    targetRole: savedDraft.targetRole || profile?.target_career || '',
    contact: savedDraft.contact || '',
    summary: savedDraft.summary || data.summary || '',
    skills: savedDraft.skills || (profile?.skills || data.skills || []).join(', '),
    experience: savedDraft.experience || listText(data.workExperience, (item) => (
      [item.title, item.company, item.duration, ...(item.highlights || [])].filter(Boolean).join('\n')
    )),
    education: savedDraft.education || [educationDetails.degree, educationDetails.institution, educationDetails.graduationYear, profile?.education].filter(Boolean).join('\n'),
    projects: savedDraft.projects || listText(data.projects, (item) => [item.title, item.description, ...(item.skills || [])].filter(Boolean).join('\n')),
    certifications: savedDraft.certifications || (data.certifications || []).join(', '),
  };
}

function formatResume(resume) {
  const sections = [
    [resume.fullName, resume.targetRole, resume.contact].filter(Boolean).join('\n'),
    resume.summary && `PROFESSIONAL SUMMARY\n${resume.summary}`,
    resume.skills && `SKILLS\n${resume.skills}`,
    resume.experience && `EXPERIENCE\n${resume.experience}`,
    resume.education && `EDUCATION\n${resume.education}`,
    resume.projects && `PROJECTS\n${resume.projects}`,
    resume.certifications && `CERTIFICATIONS\n${resume.certifications}`,
  ].filter(Boolean);
  return sections.join('\n\n');
}

export default function ResumeBuilderPage() {
  const navigate = useNavigate();
  const { profile, loading } = useProfileData();
  const [mode, setMode] = useState('build');
  const [resume, setResume] = useState(emptyResume);
  const [generatedResume, setGeneratedResume] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (!loading) {
      setResume(resumeFromProfile(profile));
      setGeneratedResume(profile?.resume_data?.builderResume || '');
    }
  }, [loading, profile]);

  const updateField = (field, value) => {
    setResume((current) => ({ ...current, [field]: value }));
    setGeneratedResume('');
    setStatus('');
  };

  const getSession = async () => {
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) {
      navigate('/login');
      throw new Error('Sign in to use Resume Builder.');
    }
    return session;
  };

  const importResume = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setBusy(true);
    setError('');
    setStatus('Extracting your existing resume...');
    try {
      const session = await getSession();
      const formData = new FormData();
      formData.append('resume', file);
      const response = await fetch('/api/resume/extract', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: formData,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Resume import failed.');

      const extractedResume = {
        ...resume,
        targetRole: result.extracted.targetCareer || resume.targetRole,
        summary: result.resumeData.summary || resume.summary,
        skills: (result.resumeData.skills || result.extracted.skills || []).join(', '),
        experience: listText(result.resumeData.workExperience, (item) => (
          [item.title, item.company, item.duration, ...(item.highlights || [])].filter(Boolean).join('\n')
        )),
        education: [result.resumeData.educationDetails?.degree, result.resumeData.educationDetails?.institution, result.resumeData.educationDetails?.graduationYear, result.extracted.educationOther || result.extracted.education].filter(Boolean).join('\n'),
        projects: listText(result.resumeData.projects, (item) => [item.title, item.description, ...(item.skills || [])].filter(Boolean).join('\n')),
        certifications: (result.resumeData.certifications || []).join(', '),
      };
      setResume(extractedResume);
      setGeneratedResume('');
      setMode('improve');
      setStatus('Resume imported. Review the details, then improve it with AI.');
    } catch (importError) {
      setError(importError.message || 'Resume import failed.');
      setStatus('');
    } finally {
      setBusy(false);
    }
  };

  const generateResume = async () => {
    setBusy(true);
    setError('');
    setStatus('Creating your resume...');
    try {
      const session = await getSession();
      const response = await fetch('/api/resume/build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ mode, resume }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Resume generation failed.');

      setGeneratedResume(result.resume);
      const skills = resume.skills.split(',').map((skill) => skill.trim()).filter(Boolean);
      const { error: saveError } = await supabase.from('profiles').upsert({
        id: session.user.id,
        full_name: resume.fullName || profile?.full_name || session.user.user_metadata?.name || '',
        education: resume.education || profile?.education || '',
        skills,
        target_career: resume.targetRole || profile?.target_career || '',
        weekly_learning_hours: profile?.weekly_learning_hours || 0,
        experience_level: profile?.experience_level || '',
        ai_analysis: profile?.ai_analysis || {},
        resume_data: {
          ...(profile?.resume_data || {}),
          summary: resume.summary,
          skills,
          builderDraft: resume,
          builderResume: result.resume,
        },
        updated_at: new Date().toISOString(),
      });
      if (saveError) throw saveError;
      setStatus('Resume created and saved to your profile.');
    } catch (generationError) {
      setError(generationError.message || 'Resume generation failed.');
      setStatus('');
    } finally {
      setBusy(false);
    }
  };

  const downloadResume = () => {
    const content = generatedResume || formatResume(resume);
    if (!content.trim()) return;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = (resume.fullName || 'resume').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'resume';
    link.href = url;
    link.download = `${filename}-resume.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const preview = generatedResume || formatResume(resume);

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-blue-300">Resume Builder</p>
            <h1 className="mt-2 text-3xl font-bold">Build a resume that sounds like you</h1>
          </div>
          <Link to="/resume" className="text-sm text-blue-300 hover:text-blue-200">Open Resume Analysis</Link>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4" role="tablist" aria-label="Resume builder mode">
          <button type="button" role="tab" aria-selected={mode === 'build'} onClick={() => { setMode('build'); setError(''); }} className={`rounded-lg px-4 py-2 text-sm font-medium ${mode === 'build' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-900'}`}>Start from scratch</button>
          <button type="button" role="tab" aria-selected={mode === 'improve'} onClick={() => { setMode('improve'); setError(''); }} className={`rounded-lg px-4 py-2 text-sm font-medium ${mode === 'improve' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-900'}`}>Improve an existing resume</button>
          {mode === 'improve' && (
            <label className={`ml-auto inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-900 ${busy ? 'pointer-events-none opacity-60' : ''}`}>
              <FileUp size={16} /> Import PDF or DOCX
              <input type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="sr-only" onChange={importResume} disabled={busy} />
            </label>
          )}
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.85fr)]">
          <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-lg font-semibold text-white">Resume details</h2>
            <p className="mt-1 text-sm text-slate-400">AI will reorganize and polish only the facts you provide.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm text-slate-300">Full name
                <input className={fieldClass} value={resume.fullName} onChange={(event) => updateField('fullName', event.target.value)} placeholder="Your name" />
              </label>
              <label className="text-sm text-slate-300">Target role
                <input className={fieldClass} value={resume.targetRole} onChange={(event) => updateField('targetRole', event.target.value)} placeholder="Role you are applying for" />
              </label>
              <label className="text-sm text-slate-300 sm:col-span-2">Contact details and links
                <input className={fieldClass} value={resume.contact} onChange={(event) => updateField('contact', event.target.value)} placeholder="Email · phone · location · LinkedIn · GitHub" />
              </label>
              <label className="text-sm text-slate-300 sm:col-span-2">Professional summary
                <textarea className={`${fieldClass} min-h-24`} value={resume.summary} onChange={(event) => updateField('summary', event.target.value)} placeholder="Your experience, strengths, and career focus" />
              </label>
              <label className="text-sm text-slate-300 sm:col-span-2">Skills
                <textarea className={`${fieldClass} min-h-20`} value={resume.skills} onChange={(event) => updateField('skills', event.target.value)} placeholder="JavaScript, React, SQL..." />
              </label>
              <label className="text-sm text-slate-300 sm:col-span-2">Work experience
                <textarea className={`${fieldClass} min-h-32`} value={resume.experience} onChange={(event) => updateField('experience', event.target.value)} placeholder="Role, company, dates, and outcomes" />
              </label>
              <label className="text-sm text-slate-300 sm:col-span-2">Education
                <textarea className={`${fieldClass} min-h-20`} value={resume.education} onChange={(event) => updateField('education', event.target.value)} placeholder="Degree, institution, graduation year" />
              </label>
              <label className="text-sm text-slate-300 sm:col-span-2">Projects
                <textarea className={`${fieldClass} min-h-24`} value={resume.projects} onChange={(event) => updateField('projects', event.target.value)} placeholder="Project, what you built, and technologies used" />
              </label>
              <label className="text-sm text-slate-300 sm:col-span-2">Certifications
                <textarea className={`${fieldClass} min-h-16`} value={resume.certifications} onChange={(event) => updateField('certifications', event.target.value)} placeholder="Certification names, one per line" />
              </label>
            </div>
            {error && <p role="alert" className="mt-4 text-sm text-rose-300">{error}</p>}
            {status && <p role="status" className="mt-4 text-sm text-emerald-300">{status}</p>}
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" onClick={generateResume} disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60">
                <WandSparkles size={16} /> {busy ? 'Working...' : mode === 'improve' ? 'Improve with AI' : 'Build with AI'}
              </button>
              <button type="button" onClick={downloadResume} disabled={!preview.trim()} className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-50">
                <Download size={16} /> Download .txt
              </button>
            </div>
          </section>

          <section className="rounded-xl border border-slate-700 bg-slate-900 p-6 text-slate-100 xl:sticky xl:top-6">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">Live preview</p>
            <pre className="mt-5 min-h-96 whitespace-pre-wrap break-words font-sans text-sm leading-6 text-slate-100">{preview || 'Your resume preview will appear here as you add details.'}</pre>
          </section>
        </div>
      </div>
    </div>
  );
}