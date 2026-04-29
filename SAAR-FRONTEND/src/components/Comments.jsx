import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Comments({ resourceType, resourceId }) {
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!resourceId) return;
    apiFetch(`/api/comments/${resourceType}/${resourceId}`, { skipAuth: true })
      .then((r) => setComments(r.success ? r.data : []))
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [resourceType, resourceId]);

  async function submit(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const r = await apiFetch(`/api/comments/${resourceType}/${resourceId}`, {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
      setComments((prev) => [...prev, r.data]);
      setText('');
    } catch (err) {
      toast(err.message || 'Failed to post comment', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(id) {
    try {
      await apiFetch(`/api/comments/${id}`, { method: 'DELETE' });
      setComments((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      toast(err.message || 'Failed to delete', 'error');
    }
  }

  return (
    <div className="mt-6">
      <h3 className="font-bold text-ink-900 flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5 text-accent-primary" />
        Comments ({comments.length})
      </h3>

      {isAuthenticated && (
        <form onSubmit={submit} className="flex gap-2 mb-4">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a comment…"
            className="flex-1 border border-parchment-300 rounded-lg px-3 py-2 text-sm text-ink-900 bg-white focus:outline-none focus:ring-1 focus:ring-accent-primary"
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={submitting || !text.trim()}
            className="flex items-center gap-1 px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-ink-800">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-ink-800">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c._id} className="bg-parchment-50 border border-parchment-200 rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div>
                  {c.AuthorID?._id ? (
                    <Link to={`/user/${c.AuthorID._id}`} className="text-sm font-semibold text-ink-900 hover:text-accent-primary hover:underline">
                      {c.AuthorID.Name || 'Student'}
                    </Link>
                  ) : (
                    <span className="text-sm font-semibold text-ink-900">Student</span>
                  )}
                  <span className="text-xs text-slate-400 ml-2">{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                {(user?._id === c.AuthorID?._id || user?.Role === 'Admin') && (
                  <button onClick={() => remove(c._id)} className="text-slate-400 hover:text-rose-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
              <p className="text-sm text-ink-800 mt-1">{c.Text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
