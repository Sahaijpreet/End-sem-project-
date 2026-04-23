import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ChevronUp, Send, Eye, Trash2 } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ForumPost() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiFetch(`/api/forum/${id}`, { skipAuth: true })
      .then((r) => r.success && setPost(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  async function submitAnswer(e) {
    e.preventDefault();
    if (!answerText.trim()) return;
    setSubmitting(true);
    try {
      const r = await apiFetch(`/api/forum/${id}/answers`, { method: 'POST', body: JSON.stringify({ text: answerText }) });
      setPost((p) => ({ ...p, Answers: [...p.Answers, r.data] }));
      setAnswerText('');
      toast('Answer posted!');
    } catch (e) { toast(e.message, 'error'); }
    finally { setSubmitting(false); }
  }

  async function upvote(answerId) {
    if (!isAuthenticated) { toast('Log in to upvote', 'error'); return; }
    try {
      const r = await apiFetch(`/api/forum/${id}/answers/${answerId}/upvote`, { method: 'POST', body: JSON.stringify({}) });
      setPost((p) => ({ ...p, Answers: p.Answers.map((a) => a._id === answerId ? { ...a, Upvotes: Array(r.data.upvotes).fill(null), _upvoted: r.data.upvoted } : a) }));
    } catch (e) { toast(e.message, 'error'); }
  }

  async function accept(answerId) {
    try {
      await apiFetch(`/api/forum/${id}/answers/${answerId}/accept`, { method: 'POST', body: JSON.stringify({}) });
      setPost((p) => ({ ...p, Solved: true, Answers: p.Answers.map((a) => ({ ...a, IsAccepted: a._id === answerId })) }));
      toast('Answer accepted!');
    } catch (e) { toast(e.message, 'error'); }
  }

  async function deletePost() {
    if (!window.confirm('Delete this doubt?')) return;
    try {
      await apiFetch(`/api/forum/${id}`, { method: 'DELETE' });
      window.history.back();
    } catch (e) { toast(e.message, 'error'); }
  }

  if (loading) return <div className="flex-1 flex items-center justify-center"><p className="text-ink-800">Loading…</p></div>;
  if (!post) return <div className="flex-1 flex items-center justify-center"><p className="text-ink-800">Post not found.</p></div>;

  const isAuthor = post.AuthorID?._id === user?._id || post.AuthorID === user?._id;

  return (
    <div className="flex-1 bg-parchment-50 py-8 min-h-[calc(100vh-4rem)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        <Link to="/forum" className="inline-flex items-center gap-2 text-sm text-ink-800 hover:text-accent-primary"><ArrowLeft className="h-4 w-4" /> Back to Forum</Link>

        {/* Question */}
        <div className="bg-white rounded-2xl border border-parchment-200 shadow-sm p-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex flex-wrap gap-2">
              {post.Solved && <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full"><CheckCircle className="h-3 w-3" /> Solved</span>}
              <span className="text-xs bg-indigo-100 text-accent-primary px-2 py-0.5 rounded-full font-semibold">{post.Subject}</span>
              {post.Semester && <span className="text-xs bg-parchment-100 text-ink-800 px-2 py-0.5 rounded-full">Sem {post.Semester}</span>}
            </div>
            {isAuthor && (
              <button onClick={deletePost} className="text-slate-400 hover:text-rose-500 shrink-0"><Trash2 className="h-4 w-4" /></button>
            )}
          </div>
          <h1 className="text-xl font-bold text-ink-900 mb-3">{post.Title}</h1>
          <p className="text-ink-800 whitespace-pre-wrap mb-4">{post.Body}</p>
          {post.Tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {post.Tags.map((t) => <span key={t} className="text-xs bg-parchment-100 text-ink-800 px-2 py-0.5 rounded-full">{t}</span>)}
            </div>
          )}
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span>By {post.AuthorID?.Name || 'Student'}</span>
            <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{post.Views} views</span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Answers */}
        <div>
          <h2 className="font-bold text-ink-900 mb-3">{post.Answers?.length || 0} Answer{post.Answers?.length !== 1 ? 's' : ''}</h2>
          <div className="space-y-4">
            {post.Answers?.sort((a, b) => (b.IsAccepted ? 1 : 0) - (a.IsAccepted ? 1 : 0)).map((a) => (
              <div key={a._id} className={`bg-white rounded-xl border p-5 shadow-sm ${a.IsAccepted ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-parchment-200'}`}>
                <div className="flex gap-4">
                  <div className="flex flex-col items-center gap-1">
                    <button onClick={() => upvote(a._id)} className={`p-1.5 rounded-lg transition-colors ${a._upvoted ? 'bg-indigo-100 text-accent-primary' : 'text-slate-400 hover:bg-parchment-100'}`}>
                      <ChevronUp className="h-5 w-5" />
                    </button>
                    <span className="text-sm font-bold text-ink-900">{a.Upvotes?.length ?? 0}</span>
                  </div>
                  <div className="flex-1">
                    {a.IsAccepted && (
                      <div className="flex items-center gap-1 text-emerald-700 text-xs font-semibold mb-2"><CheckCircle className="h-4 w-4" /> Accepted Answer</div>
                    )}
                    <p className="text-ink-800 whitespace-pre-wrap">{a.Text}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-slate-400">By {a.AuthorID?.Name || 'Student'} · {new Date(a.createdAt).toLocaleDateString()}</span>
                      {isAuthor && !post.Solved && (
                        <button onClick={() => accept(a._id)} className="text-xs text-emerald-700 font-semibold hover:underline flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" /> Accept
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Answer form */}
        {isAuthenticated && (
          <div className="bg-white rounded-xl border border-parchment-200 p-5 shadow-sm">
            <h3 className="font-bold text-ink-900 mb-3">Your Answer</h3>
            <form onSubmit={submitAnswer} className="space-y-3">
              <textarea value={answerText} onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Write your answer…" rows={4}
                className="w-full border border-parchment-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-accent-primary" />
              <button type="submit" disabled={submitting || !answerText.trim()}
                className="flex items-center gap-2 px-5 py-2 bg-accent-primary text-white rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-accent-hover">
                <Send className="h-4 w-4" /> {submitting ? 'Posting…' : 'Post Answer'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
