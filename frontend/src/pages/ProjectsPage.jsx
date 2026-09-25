import { Link } from 'react-router-dom';
import { useProfileData } from '../lib/profileData';

export default function ProjectsPage() {
  const { profile, analysis, loading, error } = useProfileData();

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[0.25em] text-blue-300">Projects</p>
        <h1 className="mt-2 text-3xl font-bold">Recommended projects</h1>

        {loading ? <p role="status" className="mt-8 text-slate-400">Loading project recommendations...</p> : error ? (
          <p role="alert" className="mt-8 rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-rose-300">{error}</p>
        ) : (
          <div className="mt-8 space-y-10">
            {profile?.resume_data?.projects?.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-white">Projects from your resume</h2>
                <div className="mt-4 space-y-4">
                  {profile.resume_data.projects.map((project) => (
                    <div key={project.title} className="border-b border-slate-800 pb-4">
                      <h3 className="font-medium text-white">{project.title}</h3>
                      {project.description && <p className="mt-2 text-slate-300">{project.description}</p>}
                      <div className="mt-3 flex flex-wrap gap-2">{(project.skills || []).map((skill) => <span key={skill} className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-200">{skill}</span>)}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}
            <section>
              <h2 className="text-xl font-semibold text-white">AI recommendations</h2>
              {!analysis?.projects?.length ? (
                <div className="mt-4 rounded-xl border border-slate-800 bg-slate-900 p-5 text-slate-400">
                  <p>AI project recommendations will appear here after your profile is analyzed.</p>
                  <Link to="/resume" className="mt-4 inline-flex text-blue-300 hover:text-blue-200">Upload a resume or update your profile</Link>
                </div>
              ) : (
                <div className="mt-4 grid gap-5 md:grid-cols-2">
                  {analysis.projects.map((project) => (
                    <div key={project.title} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
                      <h3 className="text-xl font-semibold text-white">{project.title}</h3>
                      <p className="mt-3 text-slate-300">{project.description}</p>
                      <div className="mt-5 flex flex-wrap gap-2">
                        {(project.skills || []).map((skill) => <span key={skill} className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs text-slate-200">{skill}</span>)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
