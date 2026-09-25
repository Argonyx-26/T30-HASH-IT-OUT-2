import { useProfileData } from '../lib/profileData';

const groups = [
  { level: 'strong', title: 'Strong skills', panelClass: 'border-emerald-500/30 bg-emerald-500/5', titleClass: 'text-emerald-300' },
  { level: 'developing', title: 'Developing', panelClass: 'border-amber-500/30 bg-amber-500/5', titleClass: 'text-amber-300' },
  { level: 'gap', title: 'Gaps to cover', panelClass: 'border-rose-500/30 bg-rose-500/5', titleClass: 'text-rose-300' },
];

export default function SkillGapPage() {
  const { analysis, loading, error } = useProfileData(true);

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[0.25em] text-blue-300">Skill Gap Analysis</p>
        <h1 className="mt-2 text-3xl font-bold">Your Skills vs Target Role</h1>

        {loading ? <p role="status" className="mt-8 text-slate-400">Loading your analysis...</p> : error ? (
          <p role="alert" className="mt-8 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-rose-300">{error}</p>
        ) : !analysis?.skillAssessment?.length ? (
          <p className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-5 text-slate-400">No AI skill-gap analysis is available yet. It will appear after your profile is analyzed.</p>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {groups.map((group) => (
              <div key={group.level} className={`rounded-2xl border p-6 ${group.panelClass}`}>
                <h2 className={`text-xl font-semibold ${group.titleClass}`}>{group.title}</h2>
                <ul className="mt-5 space-y-4 text-slate-200">
                  {(analysis.skillAssessment || []).filter((item) => item.level === group.level).map((item) => (
                    <li key={item.name}>
                      <span className="font-medium">{item.name}</span>
                      {item.reason && <p className="mt-1 text-sm text-slate-400">{item.reason}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
