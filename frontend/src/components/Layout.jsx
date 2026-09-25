import { Link, useLocation } from 'react-router-dom';
import { BriefcaseBusiness, BrainCircuit, Compass, Gauge, Github, LayoutDashboard, LogOut, Map, NotebookPen, Projector, Rocket, Settings, UserRound } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'My Skills', path: '/skills', icon: BrainCircuit },
  { name: 'Career Explorer', path: '/careers', icon: Compass },
  { name: 'Skill Gap', path: '/skill-gap', icon: Gauge },
  { name: 'Roadmap', path: '/roadmap', icon: Map },
  { name: 'Projects', path: '/projects', icon: Projector },
  { name: 'GitHub', path: '/github', icon: Github },
  { name: 'Resources', path: '/roadmap', icon: NotebookPen },
  { name: 'Interview', path: '/mentor', icon: Rocket },
  { name: 'AI Mentor', path: '/mentor', icon: UserRound },
  { name: 'Progress', path: '/progress', icon: BriefcaseBusiness },
  { name: 'Resume', path: '/resume', icon: NotebookPen },
  { name: 'Settings', path: '/login', icon: Settings },
];

export default function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="w-full border-b border-slate-800 bg-slate-950 p-4 lg:w-72 lg:border-b-0 lg:border-r">
          <div className="mb-8 flex items-center gap-3 px-2">
            <div className="rounded-xl bg-blue-500/15 p-2 text-blue-300">
              <BrainCircuit size={18} />
            </div>
            <div>
              <p className="text-lg font-bold">SkillPilot AI</p>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map(({ name, path, icon: Icon }) => {
              const active = location.pathname === path;
              return (
                <Link key={name} to={path} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-900 hover:text-white'}`}>
                  <Icon size={16} />
                  {name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-400">Current plan</p>
            <p className="mt-2 text-lg font-semibold text-white">AI Engineer</p>
            <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-800 p-2 text-sm text-slate-200">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </aside>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
