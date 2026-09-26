import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Flame, Plus, Sparkles, Target, GraduationCap, Briefcase, ChevronRight, BrainCircuit } from 'lucide-react';
import { useProfileData } from '../lib/profileData';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

const oneDayMs = 24 * 60 * 60 * 1000;

function getActiveStreak(taskState, now = Date.now()) {
  const lastTaskAt = Date.parse(taskState?.lastTaskAt || '');
  if (!Number.isFinite(lastTaskAt) || now - lastTaskAt >= oneDayMs) return 0;
  return Math.max(0, Number(taskState.streak) || 0);
}

export default function DashboardPage() {
  const { profile, analysis, loading, generating, error } = useProfileData(true);
  const [dailyTaskState, setDailyTaskState] = useState({ tasks: [], streak: 0, lastTaskAt: null });
  const [taskInput, setTaskInput] = useState('');
  const [savingTask, setSavingTask] = useState(false);
  const [taskError, setTaskError] = useState('');
  const [taskStorageError, setTaskStorageError] = useState('');

  useEffect(() => {
    let active = true;
    setDailyTaskState({ tasks: [], streak: 0, lastTaskAt: null });
    setTaskStorageError('');

    if (!profile?.id || profile.id === 'demo-user' || !supabase) {
      return () => { active = false; };
    }

    const loadDailyTasks = async () => {
      const { data, error: loadError } = await supabase.from('profiles')
        .select('daily_task_state')
        .eq('id', profile.id)
        .maybeSingle();
      if (!active) return;
      if (loadError) {
        setTaskStorageError(loadError.code === '42703' || loadError.message?.includes('daily_task_state')
          ? 'Apply the daily_task_state column migration in Supabase to enable saved tasks and streaks.'
          : loadError.message);
        return;
      }

      const savedState = data?.daily_task_state || {};
      setDailyTaskState({
        tasks: Array.isArray(savedState.tasks) ? savedState.tasks : [],
        streak: getActiveStreak(savedState),
        lastTaskAt: savedState.lastTaskAt || null,
      });
    };

    loadDailyTasks();
    return () => { active = false; };
  }, [profile?.id]);

  useEffect(() => {
    const lastTaskAt = Date.parse(dailyTaskState.lastTaskAt || '');
    if (!Number.isFinite(lastTaskAt)) return undefined;

    const timeout = setTimeout(() => {
      setDailyTaskState((current) => ({ ...current, streak: 0 }));
    }, Math.max(0, lastTaskAt + oneDayMs - Date.now()));
    return () => clearTimeout(timeout);
  }, [dailyTaskState.lastTaskAt]);

  const saveDailyTaskState = async (nextState) => {
    if (taskStorageError) throw new Error(taskStorageError);
    if (!supabase) throw new Error('Supabase is not configured.');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) throw new Error('Sign in to save daily tasks.');

    const { error: saveError } = await supabase.from('profiles')
      .update({ daily_task_state: nextState, updated_at: new Date().toISOString() })
      .eq('id', session.user.id);
    if (saveError) {
      if (saveError.code === '42703' || saveError.message?.includes('daily_task_state')) {
        const migrationMessage = 'Apply the daily_task_state column migration in Supabase to enable saved tasks and streaks.';
        setTaskStorageError(migrationMessage);
        throw new Error(migrationMessage);
      }
      throw saveError;
    }
    setDailyTaskState(nextState);
  };

  const addDailyTask = async (event) => {
    event.preventDefault();
    const title = taskInput.trim();
    if (!title || savingTask) return;

    setSavingTask(true);
    setTaskError('');
    try {
      const now = new Date();
      const nowMs = now.getTime();
      const lastTaskMs = Date.parse(dailyTaskState.lastTaskAt || '');
      const previousStreak = getActiveStreak(dailyTaskState, nowMs);
      const isExpired = !Number.isFinite(lastTaskMs) || nowMs - lastTaskMs >= oneDayMs;
      const sameLocalDay = Number.isFinite(lastTaskMs)
        && new Date(lastTaskMs).toLocaleDateString() === now.toLocaleDateString();
      const streak = isExpired ? 1 : sameLocalDay ? previousStreak : previousStreak + 1;
      const nextState = {
        tasks: [{
          id: globalThis.crypto?.randomUUID?.() || `${nowMs}-${Math.random().toString(36).slice(2)}`,
          title: title.slice(0, 180),
          completed: false,
          createdAt: now.toISOString(),
        }, ...(dailyTaskState.tasks || [])].slice(0, 100),
        streak,
        lastTaskAt: now.toISOString(),
      };
      await saveDailyTaskState(nextState);
      setTaskInput('');
    } catch (saveError) {
      setTaskError(saveError.message || 'Could not save this task.');
    } finally {
      setSavingTask(false);
    }
  };

  const toggleTask = async (taskId) => {
    if (savingTask) return;
    setSavingTask(true);
    setTaskError('');
    try {
      await saveDailyTaskState({
        ...dailyTaskState,
        tasks: dailyTaskState.tasks.map((task) => task.id === taskId ? { ...task, completed: !task.completed } : task),
      });
    } catch (saveError) {
      setTaskError(saveError.message || 'Could not update this task.');
    } finally {
      setSavingTask(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="w-full">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm uppercase tracking-[0.25em] text-blue-400 font-bold mb-2">Overview</motion.p>
            {loading ? (
              <h1 className="text-4xl font-display font-bold text-white animate-pulse">Loading...</h1>
            ) : profile ? (
              <h1 className="text-4xl font-display font-bold text-white tracking-tight">
                Welcome back, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">{profile.full_name?.split(' ')[0] || 'there'}</span>
              </h1>
            ) : (
              <h1 className="text-4xl font-display font-bold text-white tracking-tight">Setup your profile</h1>
            )}
          </div>
          {profile && (
            <div className="flex flex-wrap gap-3">
              <Link to="/resume" className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 border border-blue-500/30 px-5 py-2.5 text-sm font-semibold text-blue-400 hover:bg-blue-600/20 transition-all">
                <Sparkles size={16} /> Analyze Resume
              </Link>
            </div>
          )}
        </header>

        {loading ? (
           <div className="flex justify-center items-center h-64">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
           </div>
        ) : !profile ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl border border-slate-700/50 bg-slate-900/40 backdrop-blur-xl p-10 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute -inset-1 bg-gradient-to-tr from-blue-600/20 to-purple-600/20 blur-2xl z-0"></div>
            <div className="relative z-10">
              <div className="inline-flex rounded-full bg-blue-500/10 p-4 text-blue-400 mb-6">
                <Sparkles size={32} />
              </div>
              <h2 className="font-display text-3xl font-bold text-white mb-4">Unlock Your Career Potential</h2>
              <p className="text-slate-400 max-w-xl mx-auto mb-8 text-lg">Your profile is the key to personalized roadmaps and AI guidance. Add your details to get started.</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/onboarding" className="rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-3.5 font-bold text-white shadow-lg hover:shadow-blue-500/25 transition-all hover:-translate-y-0.5">Set up profile</Link>
                <Link to="/resume-builder" className="rounded-full border border-slate-700 bg-slate-800/50 px-8 py-3.5 font-bold text-white hover:bg-slate-700 transition-all hover:-translate-y-0.5">Resume builder</Link>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
            
            {/* Quick Stats Grid */}
            <div className="grid gap-6 md:grid-cols-3">
              <motion.div variants={itemVariants} className="group rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm transition-all hover:border-blue-500/30 hover:bg-slate-800/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Target size={64} className="text-blue-500" /></div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-1">Target Career</p>
                <p className="font-display text-2xl font-bold text-white truncate">{profile.target_career || 'Not set'}</p>
              </motion.div>
              
              <motion.div variants={itemVariants} className="group rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm transition-all hover:border-purple-500/30 hover:bg-slate-800/50 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><GraduationCap size={64} className="text-purple-500" /></div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-1">Education</p>
                <p className="font-display text-2xl font-bold text-white truncate">{profile.education || 'Not provided'}</p>
              </motion.div>

              <motion.div variants={itemVariants} className="group rounded-3xl border border-slate-800 bg-slate-900/40 p-6 backdrop-blur-sm transition-all hover:border-cyan-500/30 hover:bg-slate-800/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Briefcase size={64} className="text-cyan-500" /></div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-1">Experience Level</p>
                <p className="font-display text-2xl font-bold text-white truncate">{profile.experience_level || 'Not provided'}</p>
              </motion.div>
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
              
              {/* Daily Focus Section */}
              <motion.section variants={itemVariants} className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-8 backdrop-blur-sm shadow-xl flex flex-col h-full">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Daily Focus</p>
                    </div>
                    <h2 className="font-display text-2xl font-bold text-white">Tasks for today</h2>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-2 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.15)]">
                    <Flame size={18} className="animate-bounce" style={{animationDuration: '2s'}} />
                    <span className="font-bold">{getActiveStreak(dailyTaskState)} day streak</span>
                  </div>
                </div>
                
                <form onSubmit={addDailyTask} className="flex gap-3 mb-8 relative z-10">
                  <input value={taskInput} onChange={(event) => setTaskInput(event.target.value)} maxLength={180} placeholder="What will you conquer today?" className="w-full rounded-xl border border-slate-700 bg-slate-950/50 px-5 py-3.5 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-blue-500 focus:bg-slate-900 focus:ring-2 focus:ring-blue-500/20" />
                  <button type="submit" disabled={savingTask || !taskInput.trim()} className="shrink-0 inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 active:scale-95 disabled:opacity-50 disabled:active:scale-100">
                    <Plus size={20} />
                  </button>
                </form>

                {taskStorageError && <p role="alert" className="mb-4 text-sm font-medium text-amber-400">{taskStorageError}</p>}
                {taskError && <p role="alert" className="mb-4 text-sm font-medium text-rose-400">{taskError}</p>}
                
                <div className="flex-1 min-h-[200px]">
                  {dailyTaskState.tasks.length > 0 ? (
                    <ul className="space-y-3">
                      {dailyTaskState.tasks.map((task) => (
                        <motion.li layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={task.id} className={`group flex items-center gap-4 rounded-2xl border p-4 transition-all ${task.completed ? 'border-slate-800 bg-slate-900/30' : 'border-slate-700/50 bg-slate-800/40 hover:border-slate-600'}`}>
                          <button type="button" onClick={() => toggleTask(task.id)} disabled={savingTask} className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all ${task.completed ? 'border-emerald-500 bg-emerald-500 text-slate-950' : 'border-slate-500 text-transparent group-hover:border-blue-400'}`}>
                            <Check size={14} className={task.completed ? 'scale-100' : 'scale-0'} />
                          </button>
                          <span className={`text-sm font-medium transition-all ${task.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{task.title}</span>
                        </motion.li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8 border-2 border-dashed border-slate-800 rounded-2xl">
                      <Target size={32} className="text-slate-600 mb-3" />
                      <p className="text-slate-400 font-medium">No tasks added yet.</p>
                      <p className="text-xs text-slate-500 mt-1">Add a task to maintain your streak!</p>
                    </div>
                  )}
                </div>
              </motion.section>

              <div className="space-y-8">
                {/* Skills Section */}
                <motion.section variants={itemVariants} className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-8 backdrop-blur-sm shadow-xl">
                  <h2 className="font-display text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <BrainCircuit size={20} className="text-purple-400" /> Your Skills
                  </h2>
                  {profile.skills?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.skills.map((skill) => (
                        <span key={skill} className="rounded-lg border border-slate-700 bg-slate-800/50 px-3.5 py-1.5 text-sm font-medium text-slate-200 transition-colors hover:border-purple-500/50 hover:text-white cursor-default">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm italic">No skills have been added yet.</p>
                  )}
                </motion.section>

                {/* AI Analysis Section */}
                <motion.section variants={itemVariants} className="rounded-3xl border border-slate-800/80 bg-slate-900/60 p-8 backdrop-blur-sm shadow-xl relative overflow-hidden group">
                  <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-3 mb-6">
                      <h2 className="font-display text-xl font-bold text-white">AI Analysis</h2>
                      {generating && <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400"><div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div> Analyzing</span>}
                    </div>
                    {error && <p role="alert" className="mb-4 text-sm text-rose-400">{error}</p>}
                    {analysis ? (
                      <div className="space-y-6">
                        <p className="text-slate-300 text-sm leading-relaxed">{analysis.summary}</p>
                        {analysis.actions?.length > 0 && (
                          <div>
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Recommended Actions</h3>
                            <ul className="space-y-2">
                              {analysis.actions.map((action, i) => (
                                <li key={i} className="flex gap-3 text-sm text-slate-300">
                                  <ChevronRight size={16} className="text-blue-500 shrink-0 mt-0.5" />
                                  <span>{action}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <Link to="/mentor" className="inline-flex w-full justify-center items-center gap-2 rounded-xl bg-slate-800 py-3 text-sm font-bold text-white transition-all hover:bg-slate-700">
                           Open AI Mentor <ChevronRight size={16} />
                        </Link>
                      </div>
                    ) : !generating && !error && (
                      <div className="text-center py-6">
                        <Sparkles size={24} className="text-slate-600 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">AI analysis will appear here when available.</p>
                      </div>
                    )}
                  </div>
                </motion.section>
              </div>

            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
