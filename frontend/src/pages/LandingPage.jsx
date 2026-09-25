import { ArrowRight, BrainCircuit, Briefcase, Github, GraduationCap, Sparkles, Target, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

const features = [
  {
    icon: Target,
    title: 'AI Career Guidance',
    text: 'Align your current experiences with the strongest next career move with personalized, explainable recommendations.',
  },
  {
    icon: BrainCircuit,
    title: 'Skill Gap Analysis',
    text: 'See exactly what separates your profile from the target role and focus on high-impact priorities.',
  },
  {
    icon: Github,
    title: 'GitHub Intelligence',
    text: 'Transform your repositories into evidence of real-world technical growth and role readiness.',
  },
  {
    icon: GraduationCap,
    title: 'Roadmap Builder',
    text: 'Move from learning plans to execution with a roadmap that adapts as your profile evolves.',
  },
];

const roleCards = ['Software Engineer', 'AI Engineer', 'Data Scientist', 'DevOps Engineer', 'Full Stack Developer'];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-20">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-blue-500/15 p-2 text-blue-300">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-lg font-bold">SkillPilot AI</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="rounded-full border border-slate-700 px-4 py-2 text-sm text-slate-200">Login</Link>
            <Link to="/register" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-soft">Get Started</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-28">
          <div className="flex flex-col justify-center">
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-200">
              <Zap size={14} />
              AI-powered career intelligence
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white md:text-6xl">
              Navigate Your Skills. <span className="text-blue-400">Build Your Career.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-300">
              AI-powered career guidance that transforms your current skills into a personalized roadmap toward your target career.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 font-medium text-white shadow-soft hover:bg-blue-500">
                Get Started <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-7 shadow-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-300">Profile-driven guidance</p>
              <h2 className="mt-3 text-2xl font-bold text-white">Start with your own experience</h2>
              <div className="mt-7 space-y-4">
                {[
                  ['01', 'Your background', 'Resume and profile details'],
                  ['02', 'AI analysis', 'Skills, gaps, and next steps'],
                  ['03', 'A personal plan', 'Roadmap and project ideas'],
                ].map(([number, title, description]) => (
                  <div key={number} className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
                    <span className="font-mono text-sm text-cyan-300">{number}</span>
                    <div>
                      <p className="font-semibold text-white">{title}</p>
                      <p className="mt-1 text-sm text-slate-400">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">Features</p>
            <h2 className="mt-3 text-3xl font-bold text-white">Career intelligence built around real evidence</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-soft">
                <div className="mb-4 inline-flex rounded-xl bg-blue-500/10 p-3 text-blue-300">
                  <Icon size={24} />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-white">{title}</h3>
                <p className="text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="mx-auto max-w-4xl">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-blue-300">How it works</p>
              <h2 className="mt-3 text-3xl font-bold text-white">From skill snapshot to career roadmap</h2>
              <div className="mt-8 space-y-6">
                {[
                  'Upload your resume and let AI identify education, skills, and project signals.',
                  'Choose a target role and compare your profile against required skills and gaps.',
                  'Receive a personalized roadmap, project suggestions, and preparation guidance.',
                  'Track your progress, GitHub evidence, and readiness over time.',
                ].map((step, idx) => (
                  <div key={step} className="flex gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white">{idx + 1}</div>
                    <p className="pt-2 text-slate-200">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-16">
          <div className="mb-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-300">Career paths</p>
            <h2 className="mt-3 text-3xl font-bold text-white">Explore your next move</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            {roleCards.map((role) => (
              <div key={role} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <Briefcase className="mb-4 text-blue-300" size={24} />
                <h3 className="text-xl font-semibold text-white">{role}</h3>
                <p className="mt-3 text-sm text-slate-300">Role fit analysis and skill roadmap based on your profile.</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      <footer className="border-t border-slate-800 bg-slate-950/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>© 2026 SkillPilot AI</p>
        </div>
      </footer>
    </div>
  );
}
