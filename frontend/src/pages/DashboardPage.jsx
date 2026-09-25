import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, Flame, Plus } from 'lucide-react';
import { useProfileData } from '../lib/profileData';
import { supabase } from '../lib/supabase';

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

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-7xl">
        <p className="text-sm uppercase tracking-[0.25em] text-blue-300">Dashboard</p>
        {loading ? (
          <p role="status" className="mt-6 text-slate-400">Loading your profile...</p>
        ) : !profile ? (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h1 className="text-2xl font-semibold text-white">Your profile is not set up yet</h1>
            <p className="mt-2 text-slate-300">Add profile details manually or start with your resume.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/onboarding" className="inline-flex rounded-xl border border-slate-700 px-4 py-3 font-medium text-slate-200">Set up profile</Link>
              <Link to="/resume" className="inline-flex rounded-xl bg-blue-600 px-4 py-3 font-medium text-white">Resume analysis</Link>
              <Link to="/resume-builder" className="inline-flex rounded-xl border border-slate-700 px-4 py-3 font-medium text-slate-200">Resume builder</Link>
            </div>
          </div>
        ) : (
          <>
            <h1 className="mt-2 text-3xl font-bold">Welcome back, {profile.full_name || 'there'}</h1>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/resume" className="inline-flex rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">Resume analysis</Link>
              <Link to="/resume-builder" className="inline-flex rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-900">Build or improve resume</Link>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">Target career</p>
                <p className="mt-2 text-xl font-semibold text-white">{profile.target_career || 'Not set'}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">Education</p>
                <p className="mt-2 text-xl font-semibold text-white">{profile.education || 'Not provided'}</p>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
                <p className="text-sm text-slate-400">Experience</p>
                <p className="mt-2 text-xl font-semibold text-white">{profile.experience_level || 'Not provided'}</p>
              </div>
            </div>

            <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.15em] text-blue-300">Daily focus</p>
                  <h2 className="mt-1 text-xl font-semibold text-white">Tasks for today</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-orange-200">
                  <Flame size={17} />
                  <span className="font-semibold">{getActiveStreak(dailyTaskState)} day streak</span>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-400">Add at least one task each day to keep your streak. It resets after 24 hours without a new task.</p>
              <form onSubmit={addDailyTask} className="mt-5 flex flex-col gap-3 sm:flex-row">
                <input value={taskInput} onChange={(event) => setTaskInput(event.target.value)} maxLength={180} placeholder="Add a task for today" className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none focus:border-blue-400" />
                <button type="submit" disabled={savingTask || !taskInput.trim()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-50">
                  <Plus size={16} /> Add task
                </button>
              </form>
              {taskStorageError && <p role="alert" className="mt-3 text-sm text-amber-300">{taskStorageError}</p>}
              {taskError && <p role="alert" className="mt-3 text-sm text-rose-300">{taskError}</p>}
              {dailyTaskState.tasks.length > 0 ? (
                <ul className="mt-5 divide-y divide-slate-800">
                  {dailyTaskState.tasks.map((task) => (
                    <li key={task.id} className="flex items-start gap-3 py-3">
                      <button type="button" onClick={() => toggleTask(task.id)} disabled={savingTask} aria-label={task.completed ? `Mark ${task.title} incomplete` : `Complete ${task.title}`} className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${task.completed ? 'border-emerald-500 bg-emerald-500 text-slate-950' : 'border-slate-600 text-transparent hover:border-blue-400'}`}>
                        <Check size={13} />
                      </button>
                      <span className={`text-sm ${task.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{task.title}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="mt-5 text-sm text-slate-500">No tasks added yet.</p>}
            </section>

            <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="text-xl font-semibold text-white">Your skills</h2>
              {profile.skills?.length ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.skills.map((skill) => <span key={skill} className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-sm text-slate-200">{skill}</span>)}
                </div>
              ) : <p className="mt-3 text-slate-400">No skills have been added yet.</p>}
            </section>

            <section className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold text-white">AI career analysis</h2>
                {generating && <span role="status" className="text-sm text-blue-300">Analyzing your profile...</span>}
              </div>
              {error && <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}
              {analysis ? (
                <>
                  <p className="mt-4 text-slate-300">{analysis.summary}</p>
                  {analysis.actions?.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-medium text-white">Recommended next actions</h3>
                      <ul className="mt-3 space-y-2 text-slate-300">
                        {analysis.actions.map((action) => <li key={action}>{action}</li>)}
                      </ul>
                    </div>
                  )}
                </>
              ) : !generating && !error && <p className="mt-3 text-slate-400">AI analysis will appear here when available.</p>}
              <Link to="/mentor" className="mt-6 inline-flex rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800">Open AI mentor</Link>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
