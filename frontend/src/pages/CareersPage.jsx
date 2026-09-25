import { useProfileData } from '../lib/profileData';

const careerRoles = ['Software Engineer', 'AI Engineer', 'Data Scientist', 'DevOps Engineer', 'Full Stack Developer', 'Product Engineer', 'Cybersecurity Engineer'];

export default function CareersPage() {
  const { profile, analysis, loading, error } = useProfileData();

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.25em] text-blue-300">Career Explorer</p>
          <h1 className="mt-2 text-3xl font-bold">Explore roles</h1>
        </div>
        {loading ? <p role="status" className="text-slate-400">Loading your profile...</p> : (
          <>
            {profile?.target_career && <p className="mb-5 text-slate-300">Selected target: <span className="font-medium text-white">{profile.target_career}</span></p>}
            {error && <p role="alert" className="mb-5 text-sm text-rose-300">{error}</p>}
            {analysis?.summary && <p className="mb-6 max-w-3xl text-slate-300">{analysis.summary}</p>}
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {careerRoles.map((role) => (
                <div key={role} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                  <h2 className="text-lg font-semibold text-white">{role}</h2>
                  {role === profile?.target_career && <p className="mt-2 text-sm text-blue-300">Your selected target</p>}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
