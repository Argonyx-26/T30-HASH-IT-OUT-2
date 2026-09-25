import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileUp } from 'lucide-react';
import { useProfileData } from '../lib/profileData';
import { supabase } from '../lib/supabase';

export default function ResumePage() {
  const navigate = useNavigate();
  const { profile, loading, error } = useProfileData();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploadError('');
    if (!supabase) {
      setUploadError('Supabase is not configured. Check the frontend environment settings.');
      return;
    }

    setUploading(true);
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
      if (!response.ok) throw new Error(result.message || 'Resume analysis failed.');

      const { data: currentProfile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, education, skills, target_career, weekly_learning_hours, experience_level')
        .eq('id', session.user.id)
        .maybeSingle();
      if (profileError) throw profileError;

      const { extracted, resumeData } = result;
      const { error: saveError } = await supabase.from('profiles').upsert({
        id: session.user.id,
        full_name: session.user.user_metadata?.name || currentProfile?.full_name || '',
        education: (extracted.education === 'Other' ? extracted.educationOther : extracted.education) || currentProfile?.education || '',
        skills: extracted.skills?.length ? extracted.skills : currentProfile?.skills || [],
        target_career: extracted.targetCareer || currentProfile?.target_career || '',
        weekly_learning_hours: currentProfile?.weekly_learning_hours || 0,
        experience_level: extracted.experienceLevel || currentProfile?.experience_level || '',
        resume_data: resumeData || {},
        ai_analysis: {},
        updated_at: new Date().toISOString(),
      });
      if (saveError) throw saveError;

      navigate('/dashboard');
    } catch (uploadFailure) {
      setUploadError(uploadFailure.message || 'Unable to analyze this resume.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-blue-300">Resume Intelligence</p>
            <h1 className="mt-2 text-3xl font-bold">Profile analysis</h1>
          </div>
          <Link to="/onboarding" className="rounded-xl border border-slate-700 px-4 py-3 font-medium text-slate-200 hover:bg-slate-900">Enter details manually</Link>
        </div>

        <section className="mb-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold text-white">Analyze your resume</h2>
          <p className="mt-2 text-slate-400">Upload a PDF or DOCX. AI will extract your skills and experience, save your profile, and generate recommendations.</p>
          <label className={`mt-5 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-500 ${uploading ? 'pointer-events-none opacity-60' : ''}`}>
            <FileUp size={18} />
            {uploading ? 'Analyzing resume...' : 'Upload resume'}
            <input type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleResumeUpload} className="sr-only" disabled={uploading} />
          </label>
          {uploading && <p role="status" className="mt-3 text-sm text-blue-300">Extracting resume details and saving your profile...</p>}
          {uploadError && <p role="alert" className="mt-3 text-sm text-rose-300">{uploadError}</p>}
        </section>

        {loading ? <p role="status" className="text-slate-400">Loading your profile...</p> : error ? (
          <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-rose-300">{error}</p>
        ) : !profile ? (
          <p className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-slate-400">No profile is available yet. Upload a resume above or enter your details manually.</p>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold text-white">Your profile</h2>
              <p className="mt-4 text-slate-300">Education: {profile.education || 'Not provided'}</p>
              <p className="mt-2 text-slate-300">Target role: {profile.target_career || 'Not provided'}</p>
              <p className="mt-2 text-slate-300">Experience level: {profile.experience_level || 'Not provided'}</p>
              <p className="mt-2 text-slate-300">Weekly learning goal: {profile.weekly_learning_hours || 0} hours</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {(profile.skills || []).map((skill) => <span key={skill} className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-sm text-slate-200">{skill}</span>)}
              </div>
            </section>
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold text-white">Resume details</h2>
              {profile.resume_data?.summary ? <p className="mt-4 text-slate-300">{profile.resume_data.summary}</p> : <p className="mt-4 text-slate-400">Upload a resume to see extracted details here.</p>}
              {profile.resume_data?.educationDetails?.degree && <p className="mt-4 text-slate-300">Degree: {profile.resume_data.educationDetails.degree}</p>}
              {profile.resume_data?.educationDetails?.institution && <p className="mt-2 text-slate-300">Institution: {profile.resume_data.educationDetails.institution}</p>}
              {profile.resume_data?.educationDetails?.graduationYear && <p className="mt-2 text-slate-300">Graduation year: {profile.resume_data.educationDetails.graduationYear}</p>}
              {profile.resume_data?.workExperience?.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium text-white">Work experience</h3>
                  <ul className="mt-3 space-y-4">
                    {profile.resume_data.workExperience.map((item, index) => (
                      <li key={`${item.title}-${item.company}-${index}`} className="border-t border-slate-800 pt-3">
                        <p className="font-medium text-slate-200">{item.title}{item.company ? ` at ${item.company}` : ''}</p>
                        {item.duration && <p className="mt-1 text-sm text-slate-400">{item.duration}</p>}
                        {item.highlights?.length > 0 && <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-400">{item.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {profile.resume_data?.projects?.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium text-white">Projects</h3>
                  <ul className="mt-3 space-y-4">
                    {profile.resume_data.projects.map((project) => (
                      <li key={project.title} className="border-t border-slate-800 pt-3">
                        <p className="font-medium text-slate-200">{project.title}</p>
                        {project.description && <p className="mt-1 text-sm text-slate-400">{project.description}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {profile.resume_data?.certifications?.length > 0 && <p className="mt-6 text-slate-300">Certifications: {profile.resume_data.certifications.join(', ')}</p>}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
