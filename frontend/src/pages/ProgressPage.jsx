import { useProfileData } from '../lib/profileData';

export default function ProgressPage() {
  const { profile, loading, error } = useProfileData();

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[0.25em] text-blue-300">Progress Tracker</p>
        <h1 className="mt-2 text-3xl font-bold">Learning progress</h1>
        {loading ? <p role="status" className="mt-8 text-slate-400">Loading your profile...</p> : error ? (
          <p role="alert" className="mt-8 text-sm text-rose-300">{error}</p>
        ) : profile ? (
          <>
            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><p className="text-slate-400">Skills in profile</p><p className="mt-2 text-2xl font-semibold text-white">{profile.skills?.length || 0}</p></div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5"><p className="text-slate-400">Weekly learning goal</p><p className="mt-2 text-2xl font-semibold text-white">{profile.weekly_learning_hours || 0} hours</p></div>
            </div>
            <p className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-5 text-slate-400">No completed learning or roadmap activity has been recorded yet.</p>
          </>
        ) : <p className="mt-8 text-slate-400">Complete onboarding to see your profile.</p>}
      </div>
    </div>
  );
}
