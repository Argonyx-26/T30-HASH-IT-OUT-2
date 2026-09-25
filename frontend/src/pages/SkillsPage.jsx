import { useProfileData } from '../lib/profileData';

export default function SkillsPage() {
  const { profile, analysis, loading, error } = useProfileData();

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.25em] text-blue-300">Skill Graph</p>
          <h1 className="mt-2 text-3xl font-bold">Your core skills</h1>
        </div>

        {loading ? <p role="status" className="text-slate-400">Loading your skills...</p> : error ? (
          <p role="alert" className="text-sm text-rose-300">{error}</p>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            {!profile?.skills?.length ? <p className="text-slate-400">No skills have been added to your profile yet.</p> : (
              <div className="flex flex-wrap gap-3">
                {profile.skills.map((skill) => {
                  const assessment = analysis?.skillAssessment?.find((item) => item.name?.toLowerCase() === skill.toLowerCase());
                  return (
                    <div key={skill} className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3">
                      <p className="font-medium text-white">{skill}</p>
                      {assessment && <p className="mt-1 text-xs capitalize text-slate-400">{assessment.level}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
