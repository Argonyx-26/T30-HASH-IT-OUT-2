export default function GithubPage() {
  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-6xl">
        <p className="text-sm uppercase tracking-[0.25em] text-blue-300">GitHub Analyzer</p>
        <h1 className="mt-2 text-3xl font-bold">GitHub Profile</h1>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold text-white">No GitHub account connected</h2>
          <p className="mt-3 text-slate-400">Repository metrics and analysis will appear here after a GitHub integration is configured.</p>
        </div>
      </div>
    </div>
  );
}
