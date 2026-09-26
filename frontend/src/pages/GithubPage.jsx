import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Github, GitFork, Search, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

function Metric({ label, value }) {
  return (
    <div className="border-l border-slate-800 pl-4 first:border-0 first:pl-0">
      <p className="text-xs uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

export default function GithubPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const analyzeProfile = async (event) => {
    event.preventDefault();
    if (!username.trim() || loading) return;
    setError('');
    setResult(null);

    if (!supabase) {
      setError('Supabase is not configured. Check the frontend environment settings.');
      return;
    }

    setLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session) {
        navigate('/login');
        return;
      }

      const response = await fetch('/api/github/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ username: username.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'GitHub analysis failed.');
      setResult(data);
    } catch (analysisError) {
      setError(analysisError.message || 'GitHub analysis failed.');
    } finally {
      setLoading(false);
    }
  };

  const maxLanguageRepositories = Math.max(1, ...(result?.metrics.languages || []).map((item) => item.repositoriesUsing));

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.25em] text-blue-300">GitHub Intelligence</p>
          <h1 className="mt-2 text-3xl font-bold">Turn your public work into career signals</h1>
        </div>

        <form onSubmit={analyzeProfile} className="flex flex-col gap-3 border-b border-slate-800 pb-6 sm:flex-row">
          <label className="sr-only" htmlFor="github-username">GitHub username or profile URL</label>
          <div className="flex min-w-0 flex-1 items-center gap-3 rounded-lg border border-slate-700 bg-slate-900 px-4 focus-within:border-blue-400">
            <Github size={18} className="shrink-0 text-slate-400" />
            <input id="github-username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="GitHub username or profile URL" className="min-w-0 flex-1 bg-transparent py-3 text-sm text-slate-100 outline-none" />
          </div>
          <button type="submit" disabled={loading || !username.trim()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50">
            <Search size={16} /> {loading ? 'Analyzing...' : 'Analyze profile'}
          </button>
        </form>
        <p className="mt-3 text-xs text-slate-500">Analysis uses public profile and repository metadata; private repositories and source code are not inspected.</p>
        {error && <p role="alert" className="mt-5 rounded-lg border border-rose-500/30 bg-rose-500/5 p-4 text-sm text-rose-300">{error}</p>}
        {loading && <p role="status" className="mt-6 text-sm text-blue-300">Fetching public repositories and preparing your analysis...</p>}

        {result && (
          <div className="mt-8 space-y-10">
            <section className="flex flex-wrap items-start justify-between gap-5 border-b border-slate-800 pb-6">
              <div className="flex min-w-0 items-center gap-4">
                {result.profile.avatarUrl && <img src={result.profile.avatarUrl} alt="" className="h-16 w-16 rounded-full border border-slate-700" />}
                <div className="min-w-0">
                  <h2 className="truncate text-2xl font-semibold text-white">{result.profile.name || result.profile.username}</h2>
                  <a href={result.profile.profileUrl} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-sm text-blue-300 hover:text-blue-200">
                    @{result.profile.username} <ExternalLink size={13} />
                  </a>
                  {result.profile.bio && <p className="mt-2 max-w-2xl text-sm text-slate-400">{result.profile.bio}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                <Metric label="Public repos" value={result.profile.publicRepositories} />
                <Metric label="Analyzed" value={result.metrics.analyzedRepositories} />
                <Metric label="Stars" value={result.metrics.stars} />
                <Metric label="Followers" value={result.profile.followers} />
              </div>
            </section>

            <section className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
              <div>
                <h2 className="text-lg font-semibold text-white">Languages in your projects</h2>
                {result.metrics.languages.length ? (
                  <ul className="mt-5 space-y-4">
                    {result.metrics.languages.map((language) => (
                      <li key={language.name}>
                        <div className="mb-2 flex justify-between text-sm"><span className="text-slate-200">{language.name}</span><span className="text-slate-500">{language.repositoriesUsing} repos</span></div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-800"><div className="h-full rounded-full bg-cyan-400" style={{ width: `${Math.max(8, language.repositoriesUsing / maxLanguageRepositories * 100)}%` }} /></div>
                      </li>
                    ))}
                  </ul>
                ) : <p className="mt-3 text-sm text-slate-400">No language metadata was available on the public repositories.</p>}
                <div className="mt-6 flex items-center gap-2 text-sm text-slate-400"><GitFork size={15} /> {result.metrics.forks} forks across analyzed repositories</div>
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-white">Skills with public evidence</h3>
                  {result.analysis.skillsEvidence.length ? (
                    <ul className="mt-4 space-y-3">
                      {result.analysis.skillsEvidence.map((item) => <li key={item.skill} className="border-l border-blue-500 pl-3"><p className="font-medium text-slate-200">{item.skill}</p><p className="mt-1 text-sm leading-5 text-slate-400">{item.evidence}</p></li>)}
                    </ul>
                  ) : <p className="mt-3 text-sm text-slate-400">No skills could be inferred from the public metadata.</p>}
                </div>
              </div>

              <div className="space-y-8">
                <section>
                  <h2 className="text-lg font-semibold text-white">Profile assessment</h2>
                  <p className="mt-3 leading-7 text-slate-300">{result.analysis.summary || 'There is not enough public repository metadata for a detailed assessment.'}</p>
                  {result.analysis.strengths.length > 0 && <ul className="mt-4 space-y-2 text-sm text-slate-300">{result.analysis.strengths.map((strength) => <li key={strength}>• {strength}</li>)}</ul>}
                </section>

                <section>
                  <h2 className="text-lg font-semibold text-white">Projects to consider next</h2>
                  {result.analysis.projectIdeas.length ? (
                    <div className="mt-4 space-y-4">
                      {result.analysis.projectIdeas.map((idea) => <article key={idea.title} className="border-t border-slate-800 pt-4"><h3 className="font-medium text-white">{idea.title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{idea.description}</p>{idea.skills.length > 0 && <p className="mt-2 text-xs text-cyan-300">{idea.skills.join(' · ')}</p>}</article>)}
                    </div>
                  ) : <p className="mt-3 text-sm text-slate-400">No project suggestions yet.</p>}
                </section>

                {result.analysis.nextSteps.length > 0 && <section><h2 className="text-lg font-semibold text-white">Recommended next steps</h2><ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-slate-300">{result.analysis.nextSteps.map((step) => <li key={step}>{step}</li>)}</ol></section>}
              </div>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-white">Repository evidence</h2>
              {result.repositories.length ? (
                <div className="mt-4 divide-y divide-slate-800 border-y border-slate-800">
                  {result.repositories.map((repository) => (
                    <article key={repository.name} className="flex flex-wrap items-start justify-between gap-4 py-4">
                      <div className="min-w-0">
                        <a href={repository.url} target="_blank" rel="noreferrer" className="font-medium text-blue-300 hover:text-blue-200">{repository.name} <ExternalLink className="inline" size={13} /></a>
                        <p className="mt-1 text-sm text-slate-400">{repository.description || 'No public description'}</p>
                        {repository.topics.length > 0 && <p className="mt-2 text-xs text-slate-500">{repository.topics.slice(0, 5).join(' · ')}</p>}
                      </div>
                      <div className="flex shrink-0 items-center gap-4 text-xs text-slate-400"><span>{repository.language || 'No language tag'}</span><span className="inline-flex items-center gap-1"><Star size={13} /> {repository.stars}</span></div>
                    </article>
                  ))}
                </div>
              ) : <p className="mt-3 text-sm text-slate-400">No public repositories were available to analyze.</p>}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}