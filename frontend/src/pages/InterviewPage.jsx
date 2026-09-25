import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, RotateCcw, Send } from 'lucide-react';
import { useProfileData } from '../lib/profileData';
import { supabase } from '../lib/supabase';

const interviewTypes = [
  { value: 'technical', label: 'Technical' },
  { value: 'behavioral', label: 'Behavioral' },
];

export default function InterviewPage() {
  const navigate = useNavigate();
  const { profile } = useProfileData();
  const [interviewType, setInterviewType] = useState('technical');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const sessionRequest = async (path, body) => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) {
      navigate('/login');
      throw new Error('Sign in to start interview practice.');
    }

    const response = await fetch(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Interview practice is unavailable.');
    return result;
  };

  const startInterview = async () => {
    if (!supabase) {
      setError('Supabase is not configured. Check the frontend environment settings.');
      return;
    }
    setBusy(true);
    setError('');
    setFeedback(null);
    setAnswer('');
    setQuestion('');
    setQuestionNumber(0);
    try {
      const result = await sessionRequest('/api/interview/start', {
        interviewType,
        targetRole: profile?.target_career || '',
      });
      setQuestion(result.question);
      setQuestionNumber(1);
    } catch (startError) {
      setError(startError.message || 'Unable to start interview practice.');
    } finally {
      setBusy(false);
    }
  };

  const submitAnswer = async (event) => {
    event.preventDefault();
    if (!answer.trim() || busy) return;
    setBusy(true);
    setError('');
    try {
      const result = await sessionRequest('/api/interview/answer', {
        interviewType,
        targetRole: profile?.target_career || '',
        question,
        answer: answer.trim(),
        questionNumber,
      });
      setFeedback(result.feedback);
      setQuestion(result.nextQuestion || 'Interview practice complete. Start another round when you are ready.');
      setQuestionNumber((current) => current + 1);
      setAnswer('');
    } catch (answerError) {
      setError(answerError.message || 'Unable to evaluate your answer.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-blue-300">Interview Practice</p>
            <h1 className="mt-2 text-3xl font-bold">Practice for {profile?.target_career || 'your next role'}</h1>
          </div>
          <Link to="/mentor" className="text-sm text-blue-300 hover:text-blue-200">Open AI Mentor</Link>
        </div>

        <section className="mt-8 border-b border-slate-800 pb-6">
          <p className="text-sm font-medium text-slate-300">Interview type</p>
          <div className="mt-3 inline-flex rounded-lg border border-slate-700 p-1" role="group" aria-label="Interview type">
            {interviewTypes.map((type) => (
              <button key={type.value} type="button" disabled={busy || Boolean(question)} onClick={() => setInterviewType(type.value)} className={`rounded-md px-4 py-2 text-sm font-medium ${interviewType === type.value ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'} disabled:cursor-not-allowed disabled:opacity-60`}>
                {type.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-slate-400">{questionNumber > 0 ? `Question ${Math.min(questionNumber, 5)} of 5` : `Questions are tailored to ${profile?.target_career || 'your selected role'}.`}</p>
        </section>

        {!question ? (
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button type="button" onClick={startInterview} disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60">
              {busy ? 'Preparing question...' : 'Start interview'} <ArrowRight size={16} />
            </button>
            {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
          </div>
        ) : (
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div>
              <section className="border-l-2 border-blue-500 pl-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">Question {Math.min(questionNumber, 5)}</p>
                <h2 className="mt-3 text-xl font-semibold leading-8 text-white">{question}</h2>
              </section>
              {questionNumber <= 5 && (
                <form onSubmit={submitAnswer} className="mt-7 space-y-3">
                  <label htmlFor="interview-answer" className="text-sm font-medium text-slate-300">Your answer</label>
                  <textarea id="interview-answer" value={answer} onChange={(event) => setAnswer(event.target.value)} maxLength={5000} rows={7} placeholder="Talk through your approach and use a specific example where you can..." className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 text-sm leading-6 text-slate-100 outline-none focus:border-blue-400" />
                  {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
                  <button type="submit" disabled={busy || !answer.trim()} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60">
                    {busy ? 'Reviewing...' : 'Submit answer'} <Send size={15} />
                  </button>
                </form>
              )}
              {feedback && (
                <section className="mt-8 border-t border-slate-800 pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-lg font-semibold text-white">Answer feedback</h3>
                    <span className="rounded-md bg-slate-900 px-3 py-1 text-sm font-semibold text-blue-300">{feedback.score}/10</span>
                  </div>
                  <p className="mt-3 text-slate-300">{feedback.feedback}</p>
                  {feedback.strengths?.length > 0 && <p className="mt-4 text-sm text-emerald-300">Strengths: {feedback.strengths.join(' · ')}</p>}
                  {feedback.improvements?.length > 0 && <p className="mt-3 text-sm text-amber-300">Try next: {feedback.improvements.join(' · ')}</p>}
                  {feedback.sampleAnswer && <div className="mt-5"><h4 className="text-sm font-medium text-white">A stronger answer could include</h4><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-400">{feedback.sampleAnswer}</p></div>}
                </section>
              )}
              {error && questionNumber > 5 && <p role="alert" className="mt-4 text-sm text-rose-300">{error}</p>}
            </div>

            <aside className="h-fit border-l border-slate-800 pl-6">
              <h3 className="text-sm font-semibold text-white">Practice notes</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">Answer in your own words. Feedback focuses on clarity, relevance, and evidence from your experience.</p>
              <button type="button" onClick={startInterview} disabled={busy} className="mt-6 inline-flex items-center gap-2 text-sm text-slate-300 hover:text-white disabled:opacity-50">
                <RotateCcw size={15} /> Restart practice
              </button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}