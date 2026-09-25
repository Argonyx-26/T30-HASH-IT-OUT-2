import { Link } from 'react-router-dom';
import { useProfileData } from '../lib/profileData';

export default function RoadmapPage() {
  const { profile, analysis, loading, error } = useProfileData();

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[0.25em] text-blue-300">Personalized Roadmap</p>
        <h1 className="mt-2 text-3xl font-bold">{profile?.target_career || 'Career'} Roadmap</h1>

        {loading ? <p role="status" className="mt-8 text-slate-400">Loading your roadmap...</p> : error ? (
          <p role="alert" className="mt-8 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-rose-300">{error}</p>
        ) : !analysis?.roadmap?.length ? (
          <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-5 text-slate-400">
            <p>No AI roadmap has been generated yet.</p>
            <Link to="/resume" className="mt-4 inline-flex text-blue-300 hover:text-blue-200">Upload a resume or update your profile</Link>
          </div>
        ) : (
          <div className="mt-8 space-y-5">
          {analysis.roadmap.map((phase, index) => (
            <div key={`${phase.title}-${index}`} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{phase.title}</h2>
                </div>
                {phase.duration && <div className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-sm text-slate-300">{phase.duration}</div>}
              </div>
              <p className="mb-4 text-slate-300">{phase.objective}</p>
              <div className="flex flex-wrap gap-2">
                {phase.skills.map((item) => (
                  <span key={item} className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-sm text-slate-200">{item}</span>
                ))}
              </div>
              {phase.project && <p className="mt-5 text-sm text-slate-400">Suggested project: {phase.project}</p>}
            </div>
          ))}
          </div>
        )}
      </div>
    </div>
  );
}
