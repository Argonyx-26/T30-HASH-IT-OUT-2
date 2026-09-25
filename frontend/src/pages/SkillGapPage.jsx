import { useProfileData } from '../lib/profileData';

const groups = [
  { level: 'strong', title: 'Strengths', border: 'border-emerald-500/30', text: 'text-emerald-300' },
  { level: 'developing', title: 'Developing', border: 'border-amber-500/30', text: 'text-amber-300' },
  { level: 'gap', title: 'Skills to build', border: 'border-rose-500/30', text: 'text-rose-300' },
];

export default function SkillGapPage() {
  const { profile, analysis, loading, error } = useProfileData();

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[0.25em] text-blue-300">Skill Gap Analysis</p>
        <h1 className="mt-2 text-3xl font-bold">Your Skills vs {profile?.target_career || 'Target Role'}</h1>

        {loading ? <p role="status" className="mt-8 text-slate-400">Loading your analysis...</p> : error ? (
          <p role="alert" className="mt-8 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-rose-300">{error}</p>
        ) : !analysis?.skillAssessment?.length ? (
          <p className="mt-8 rounded-xl border border-slate-800 bg-slate-900 p-5 text-slate-400">No AI skill-gap analysis is available yet. It will appear after your profile is analyzed.</p>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {groups.map((group) => (
              <div key={group.level} className={`rounded-2xl border ${group.border} bg-slate-900 p-6`}>
                <h2 className={`text-xl font-semibold ${group.text}`}>{group.title}</h2>
                {analysis.skillAssessment.some((item) => item.level === group.level) ? (
                  <ul className="mt-5 space-y-4 text-slate-200">
                    {analysis.skillAssessment.filter((item) => item.level === group.level).map((item) => (
                      <li key={item.name}><span className="font-medium">{item.name}</span>{item.reason && <p className="mt-1 text-sm text-slate-400">{item.reason}</p>}</li>
                    ))}
                  </ul>
                ) : <p className="mt-4 text-sm text-slate-400">No skills in this category.</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
