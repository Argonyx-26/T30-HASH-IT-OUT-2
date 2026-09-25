import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function MentorPage() {
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (event) => {
    event.preventDefault();
    const message = prompt.trim();
    if (!message || loading) return;
    setError('');

    if (!supabase) {
      setError('Supabase is not configured. Set the VITE_SUPABASE values in frontend/.env.');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError('Sign in to use the AI mentor.');
      return;
    }

    const nextMessages = [...messages, { role: 'user', content: message }];
    setMessages(nextMessages);
    setPrompt('');
    setLoading(true);
    try {
      const response = await fetch('/api/mentor/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ message, history: messages }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'The AI mentor could not respond.');
      setMessages([...nextMessages, { role: 'assistant', content: result.reply }]);
    } catch (sendError) {
      setError(sendError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.25em] text-blue-300">AI Career Mentor</p>
        <h1 className="mt-2 text-3xl font-bold">Ask about your next move</h1>

        <div className="mt-8 space-y-5">
          {messages.map((item, index) => (
            <div key={`${item.role}-${index}`} className={`rounded-2xl border p-5 ${item.role === 'user' ? 'border-slate-700 bg-slate-900' : 'border-blue-500/20 bg-blue-500/5'}`}>
              <p className="text-sm text-slate-400">{item.role === 'user' ? 'You' : 'AI Mentor'}</p>
              <p className="mt-2 whitespace-pre-wrap text-slate-100">{item.content}</p>
            </div>
          ))}
          {loading && <p role="status" className="text-sm text-slate-400">Your mentor is thinking...</p>}
          {error && <p role="alert" className="text-sm text-rose-300">{error}</p>}
          <form onSubmit={sendMessage} className="flex flex-col gap-3 sm:flex-row">
            <input value={prompt} onChange={(event) => setPrompt(event.target.value)} maxLength={4000} placeholder="Ask about your career, skills, or next steps" className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100" />
            <button disabled={loading || !prompt.trim()} className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-500 disabled:opacity-60">Send</button>
          </form>
        </div>
      </div>
    </div>
  );
}
