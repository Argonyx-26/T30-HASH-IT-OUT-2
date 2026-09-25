import { Link } from 'react-router-dom';
import { useProfileData } from '../lib/profileData';

export default function ResumePage() {
  const { profile, analysis, loading, error } = useProfileData();

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-blue-300">Resume Intelligence</p>
            <h1 className="mt-2 text-3xl font-bold">Profile analysis</h1>
          </div>
          <Link to="/onboarding" className="rounded-xl bg-blue-600 px-4 py-3 font-medium text-white">Import resume</Link>
        </div>

        {loading ? <p role="status" className="text-slate-400">Loading your profile...</p> : error ? (
          <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-rose-300">{error}</p>
        ) : !profile ? (
          <p className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-slate-400">No profile is available yet. Import a resume or complete onboarding to get started.</p>
        ) : (
          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold text-white">Your profile</h2>
              <p className="mt-4 text-slate-300">Education: {profile.education || 'Not provided'}</p>
              <p className="mt-2 text-slate-300">Target role: {profile.target_career || 'Not provided'}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {(profile.skills || []).map((skill) => <span key={skill} className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-sm text-slate-200">{skill}</span>)}
              </div>
            </section>
            <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold text-white">AI analysis</h2>
              {analysis?.summary ? <p className="mt-4 text-slate-300">{analysis.summary}</p> : <p className="mt-4 text-slate-400">No AI analysis is available yet.</p>}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
