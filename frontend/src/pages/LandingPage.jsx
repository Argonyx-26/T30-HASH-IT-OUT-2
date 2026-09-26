import { ArrowRight, BrainCircuit, Briefcase, Github, GraduationCap, Sparkles, Target, Zap, Rocket, Code, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const features = [
  {
    icon: Target,
    title: 'AI Career Guidance',
    text: 'Align your experiences with your next career move with personalized, explainable recommendations.',
    color: 'from-blue-500 to-cyan-400'
  },
  {
    icon: BrainCircuit,
    title: 'Skill Gap Analysis',
    text: 'See exactly what separates your profile from the target role and focus on high-impact priorities.',
    color: 'from-purple-500 to-pink-500'
  },
  {
    icon: Github,
    title: 'GitHub Intelligence',
    text: 'Transform your repositories into evidence of real-world technical growth and role readiness.',
    color: 'from-emerald-500 to-teal-400'
  },
  {
    icon: GraduationCap,
    title: 'Roadmap Builder',
    text: 'Move from learning plans to execution with a roadmap that adapts as your profile evolves.',
    color: 'from-orange-500 to-amber-400'
  },
];

const roleCards = [
  { role: 'Software Engineer', icon: Code, desc: 'Master data structures, system design, and clean architecture.' },
  { role: 'AI Engineer', icon: BrainCircuit, desc: 'Dive into ML models, neural networks, and prompt engineering.' },
  { role: 'Data Scientist', icon: LayoutDashboard, desc: 'Analyze data, build pipelines, and extract deep insights.' },
  { role: 'DevOps Engineer', icon: Rocket, desc: 'Automate deployments, scale infrastructure, and manage CI/CD.' },
  { role: 'Full Stack Dev', icon: Zap, desc: 'Bridge the gap between beautiful UIs and robust backend APIs.' }
];

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"]
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.5, 1, 0.5]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] rounded-full bg-purple-600/10 blur-[120px]" />
      </div>

      <header className="border-b border-slate-800/50 bg-slate-950/60 backdrop-blur-2xl sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-2 text-white shadow-[0_0_15px_rgba(56,189,248,0.5)]">
              <Sparkles size={18} />
            </div>
            <div>
              <p className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">SkillPilot AI</p>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">Login</Link>
            <Link to="/register" className="relative group overflow-hidden rounded-full p-[1px]">
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-cyan-400 to-purple-600 rounded-full animate-spin-slow group-hover:opacity-100 transition-opacity" style={{ animationDuration: '3s' }} />
              <div className="relative rounded-full bg-slate-950 px-5 py-2 text-sm font-medium text-white transition-all group-hover:bg-slate-950/50">
                Get Started
              </div>
            </Link>
          </motion.div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-24 md:grid-cols-[1.1fr_0.9fr] lg:py-32 items-center">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-col justify-center"
          >
            <motion.div variants={fadeIn} className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-blue-300 backdrop-blur-md shadow-[0_0_20px_rgba(59,130,246,0.15)]">
              <Zap size={14} className="text-yellow-400" />
              AI-POWERED CAREER INTELLIGENCE
            </motion.div>
            <motion.h1 variants={fadeIn} className="font-display text-5xl font-black leading-[1.1] tracking-tight text-white md:text-7xl lg:text-[5rem]">
              Navigate Skills.<br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500">Build Your Career.</span>
            </motion.h1>
            <motion.p variants={fadeIn} className="mt-8 max-w-xl text-lg text-slate-400 font-light leading-relaxed">
              Transform your current skills into a hyper-personalized roadmap. SkillPilot AI uses advanced analytics to chart your course to your dream tech role.
            </motion.p>
            <motion.div variants={fadeIn} className="mt-10 flex flex-wrap gap-5">
              <Link to="/register" className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-blue-600 px-8 py-4 font-semibold text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all hover:bg-blue-500 hover:scale-105 active:scale-95">
                <span className="relative z-10">Start Your Journey</span>
                <ArrowRight size={18} className="relative z-10 transition-transform group-hover:translate-x-1" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 0.4, type: "spring" }}
            className="relative perspective-1000"
          >
            <div className="relative z-10 rounded-3xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-xl p-8 shadow-2xl transform-gpu transition-transform duration-200 hover:rotate-y-12 hover:rotate-x-12">
              <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-tr from-blue-500 to-purple-500 opacity-20 blur-xl"></div>
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">Profile-Driven Guidance</p>
              <h2 className="font-display text-3xl font-bold text-white">Your personalized engine</h2>
              <div className="mt-8 space-y-5">
                {[
                  ['01', 'Your background', 'Resume & current tech stack'],
                  ['02', 'AI analysis', 'Precision skill gap mapping'],
                  ['03', 'A personal plan', 'Actionable daily roadmap'],
                ].map(([number, title, description]) => (
                  <motion.div 
                    whileHover={{ scale: 1.02, x: 10 }}
                    key={number} 
                    className="flex items-center gap-5 rounded-2xl border border-slate-700/50 bg-slate-950/80 p-4 transition-all hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-lg font-bold text-cyan-400 border border-slate-800 shadow-inner">
                      {number}
                    </div>
                    <div>
                      <p className="font-display text-lg font-semibold text-white">{title}</p>
                      <p className="mt-1 text-sm text-slate-400">{description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Why SkillPilot Section */}
        <section className="mx-auto max-w-7xl px-6 py-24 relative" ref={targetRef}>
          <motion.div style={{ opacity, scale }} className="text-center mb-16">
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-6">Why Choose SkillPilot AI?</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">We don't just give you a generic list of tutorials. We analyze your actual code, your real experience, and provide a mathematically sound path to your next promotion.</p>
          </motion.div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, text, color }, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                key={title} 
                className="group relative rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm p-8 transition-all hover:bg-slate-800/50 overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-10 rounded-bl-[100px] transition-all group-hover:scale-150 group-hover:opacity-20`} />
                <div className={`mb-6 inline-flex rounded-2xl bg-gradient-to-br ${color} p-4 text-white shadow-lg`}>
                  <Icon size={28} />
                </div>
                <h3 className="mb-3 font-display text-xl font-bold text-white">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{text}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Role Cards Section with 3D Effect */}
        <section className="mx-auto max-w-7xl px-6 py-24 border-t border-slate-800/50">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-2">Explore Paths</p>
              <h2 className="font-display text-4xl font-bold text-white">Target your dream role</h2>
            </div>
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-2 group">
              View all paths <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 perspective-1000">
            {roleCards.map(({ role, icon: Icon, desc }, idx) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05, rotateY: 5, rotateX: 5 }}
                key={role} 
                className="group rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm transition-all hover:border-blue-500/50 hover:shadow-[0_10px_40px_rgba(59,130,246,0.15)] flex flex-col items-start cursor-pointer"
              >
                <div className="mb-6 p-3 rounded-xl bg-slate-800/80 text-blue-400 group-hover:bg-blue-500/20 group-hover:text-blue-300 transition-colors">
                  <Icon size={24} />
                </div>
                <h3 className="font-display text-lg font-bold text-white mb-2">{role}</h3>
                <p className="text-sm text-slate-400 line-clamp-3">{desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

      </main>

      <footer className="relative z-10 border-t border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-2 text-white">
                <Sparkles size={20} />
              </div>
              <p className="text-2xl font-display font-bold text-white">SkillPilot AI</p>
            </div>
            <div className="flex gap-8 text-sm font-medium text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-800/50 text-center text-slate-500 text-sm">
            <p>© {new Date().getFullYear()} SkillPilot AI. All rights reserved. Shaping the future of tech careers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
