import { Link, useLocation } from 'react-router-dom';
import { BrainCircuit, Compass, Gauge, Github, LayoutDashboard, Map, NotebookPen, Projector, Rocket, Settings, UserRound, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../lib/theme';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Resume Builder', path: '/resume-builder', icon: NotebookPen },
  { name: 'My Skills', path: '/skills', icon: BrainCircuit },
  { name: 'Career Explorer', path: '/careers', icon: Compass },
  { name: 'Skill Gap', path: '/skill-gap', icon: Gauge },
  { name: 'Roadmap', path: '/roadmap', icon: Map },
  { name: 'Projects', path: '/projects', icon: Projector },
  { name: 'GitHub', path: '/github', icon: Github },
  { name: 'Interview', path: '/interview', icon: Rocket },
  { name: 'AI Mentor', path: '/mentor', icon: UserRound },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Layout({ children }) {
  const location = useLocation();
  useTheme();

  return (
    <div className="min-h-screen bg-[#0a0a0f] font-sans text-slate-100 selection:bg-blue-500/30">
      <div className="flex min-h-screen flex-col lg:flex-row">
        {/* Floating Sidebar Design */}
        <aside className="w-full lg:w-[280px] lg:h-screen lg:sticky lg:top-0 z-50 p-4 shrink-0">
          <div className="h-full rounded-3xl border border-slate-800/50 bg-slate-900/40 backdrop-blur-xl shadow-2xl shadow-slate-950/30 flex flex-col overflow-hidden">
            
            {/* Logo area */}
            <div className="p-6 pb-2">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-2 text-white shadow-[0_0_15px_rgba(56,189,248,0.5)] transition-transform group-hover:scale-110">
                  <Sparkles size={20} />
                </div>
                <div>
                  <p className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">SkillPilot AI</p>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 scrollbar-hide">
              {navItems.map(({ name, path, icon: Icon }) => {
                const active = location.pathname === path;
                return (
                  <Link key={name} to={path} className="relative block">
                    {active && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/20 to-cyan-400/20 border border-blue-500/30"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <div className={`relative flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${active ? 'text-blue-400' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
                      <Icon size={18} className={active ? 'text-blue-400' : 'text-slate-500'} />
                      {name}
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Bottom Profile/Logout area */}
            <div className="border-t border-slate-800/50 p-4">
               <div className="flex items-center gap-3 rounded-2xl bg-slate-950/50 p-3">
                 <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-[2px]">
                   <div className="h-full w-full rounded-full border-2 border-transparent bg-slate-900"></div>
                 </div>
                 <div className="flex-1 overflow-hidden">
                   <p className="truncate text-sm font-medium text-white">Guest User</p>
                   <p className="truncate text-xs text-slate-500">Explorer</p>
                 </div>
               </div>
            </div>

          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 lg:pl-2 lg:py-4 lg:pr-4">
          <div className="relative h-full overflow-hidden rounded-3xl border border-slate-800/50 bg-slate-900/20 backdrop-blur-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.15 }}
                className="h-full overflow-y-auto p-6 md:p-10"
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
