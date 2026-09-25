import { Link } from 'react-router-dom';
import { useProfileData } from '../lib/profileData';

export default function DashboardPage() {
  const { profile, analysis, loading, generating, error } = useProfileData(true);

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm uppercase tracking-[0.25em] text-blue-300">Dashboard</p>
        {loading ? (
          <p role="status" className="mt-6 text-slate-400">Loading your profile...</p>
        ) : !profile ? (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h1 className="text-2xl font-semibold text-white">Your profile is not set up yet</h1>
            <p className="mt-2 text-slate-300">Complete onboarding to start a personalized analysis.</p>
            <Link to="/onboarding" className="mt-5 inline-flex rounded-xl bg-blue-600 px-4 py-3 font-medium text-white">Set up profile</Link>
          </div>
        ) : (
          <>
            <h1 className="mt-2 text-3xl font-bold">Welcome back, {profile.full_name || 'there'}</h1>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">Target career</p>
                <p className="mt-2 text-xl font-semibold text-white">{profile.target_career || 'Not set'}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">Education</p>
                <p className="mt-2 text-xl font-semibold text-white">{profile.education || 'Not provided'}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">Experience</p>
                <p className="mt-2 text-xl font-semibold text-white">{profile.experience_level || 'Not provided'}</p>
              </div>
            </div>

            <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold text-white">Your skills</h2>
              {profile.skills?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.skills.map((skill) => <span key={skill} className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-sm text-slate-200">{skill}</span>)}
                </div>
              ) : <p className="mt-3 text-slate-400">No skills have been added yet.</p>}
            </section>

            <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-white">AI career analysis</h2>
                {generating && <span role="status" className="text-sm text-blue-300">Analyzing your profile...</span>}
              </div>
              {error && <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}
              {analysis ? (
                <>
                  <p className="mt-4 text-slate-300">{analysis.summary}</p>
                  {analysis.actions?.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-medium text-white">Recommended next actions</h3>
                      <ul className="mt-3 space-y-2 text-slate-300">
                        {analysis.actions.map((action) => <li key={action}>{action}</li>)}
                      </ul>
                    </div>
                  )}
                </>
              ) : !generating && !error && <p className="mt-3 text-slate-400">AI analysis will appear here when available.</p>}
              <Link to="/mentor" className="mt-6 inline-flex rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800">Open AI mentor</Link>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
