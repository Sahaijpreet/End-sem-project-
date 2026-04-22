import { useEffect, useMemo, useState } from 'react';
import { UserCircle, FileText, BookOpen, Mail, IdCard, Edit2, Check, X, ArrowLeftRight } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Profile() {
  const { user, token } = useAuth();
  const toast = useToast();
  const [notes, setNotes] = useState([]);
  const [books, setBooks] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.Name || '');
  const [collegeId, setCollegeId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiFetch('/api/notes', { skipAuth: true }),
      apiFetch('/api/books', { skipAuth: true }),
      apiFetch('/api/chat/conversations'),
    ]).then(([nRes, bRes, cRes]) => {
      if (cancelled) return;
      setNotes(nRes.success && Array.isArray(nRes.data) ? nRes.data : []);
      setBooks(bRes.success && Array.isArray(bRes.data) ? bRes.data : []);
      setExchanges(cRes.success ? cRes.data.filter((c) => c.ExchangeCompleted) : []);
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const myNotes = useMemo(() => {
    const uid = user?._id;
    if (!uid) return [];
    return notes.filter((n) => {
      const up = n.UploaderID;
      return (typeof up === 'object' ? String(up._id) : String(up)) === String(uid);
    });
  }, [notes, user]);

  const myBooks = useMemo(() => {
    const uid = user?._id;
    if (!uid) return [];
    return books.filter((b) => {
      const o = b.OwnerID;
      return (typeof o === 'object' ? String(o._id) : String(o)) === String(uid);
    });
  }, [books, user]);

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify({ Name: name.trim(), CollegeID: collegeId.trim() }),
      });
      toast('Profile updated!');
      setEditing(false);
    } catch (err) {
      toast(err.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex-1 bg-parchment-50 py-10 min-h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow-sm border border-parchment-200 p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <UserCircle className="h-12 w-12 text-accent-primary" />
            </div>
            <div className="flex-1 min-w-0">
              {editing ? (
                <form onSubmit={saveProfile} className="space-y-3">
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-parchment-300 rounded-lg px-3 py-2 text-ink-900 text-lg font-semibold"
                    placeholder="Your name"
                    required
                  />
                  <input
                    value={collegeId}
                    onChange={(e) => setCollegeId(e.target.value)}
                    className="w-full border border-parchment-300 rounded-lg px-3 py-2 text-ink-800 text-sm"
                    placeholder="College ID (optional)"
                  />
                  <div className="flex gap-2">
                    <button type="submit" disabled={saving} className="flex items-center gap-1 px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-medium disabled:opacity-50">
                      <Check className="h-4 w-4" /> {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button type="button" onClick={() => setEditing(false)} className="flex items-center gap-1 px-4 py-2 border border-parchment-300 rounded-lg text-sm text-ink-800">
                      <X className="h-4 w-4" /> Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-ink-900 truncate">{user?.Name}</h1>
                    <button type="button" onClick={() => setEditing(true)} className="text-slate-400 hover:text-accent-primary">
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 mt-2 text-sm text-ink-800">
                    <span className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-slate-400" />{user?.Email}</span>
                    <span className="flex items-center gap-1.5"><IdCard className="h-4 w-4 text-slate-400" />{user?.CollegeID || 'No college ID set'}</span>
                  </div>
                  <span className={`inline-block mt-3 px-2.5 py-0.5 text-xs font-semibold rounded-full ${user?.Role === 'Admin' ? 'bg-indigo-100 text-accent-primary' : 'bg-parchment-100 text-ink-900'}`}>
                    {user?.Role}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-parchment-200 p-6 flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-lg"><FileText className="h-6 w-6 text-accent-primary" /></div>
            <div>
              <div className="text-2xl font-bold text-ink-900">{loading ? '…' : myNotes.length}</div>
              <div className="text-sm text-ink-800">Notes uploaded</div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-parchment-200 p-6 flex items-center gap-4">
            <div className="bg-amber-100 p-3 rounded-lg"><BookOpen className="h-6 w-6 text-amber-600" /></div>
            <div>
              <div className="text-2xl font-bold text-ink-900">{loading ? '…' : myBooks.length}</div>
              <div className="text-sm text-ink-800">Books listed</div>
            </div>
          </div>
        </div>

        {/* My notes */}
        <div className="bg-white rounded-xl border border-parchment-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-parchment-200">
            <h2 className="font-bold text-ink-900 flex items-center gap-2"><FileText className="h-5 w-5 text-accent-primary" /> My Notes</h2>
          </div>
          <div className="divide-y divide-parchment-100">
            {loading ? <p className="p-6 text-sm text-ink-800">Loading…</p> : myNotes.length === 0 ? (
              <p className="p-6 text-sm text-ink-800">No notes uploaded yet.</p>
            ) : myNotes.map((n) => (
              <div key={n._id} className="px-6 py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-ink-900">{n.Title}</p>
                  <p className="text-sm text-ink-800">{n.Subject} · Sem {n.Semester}</p>
                </div>
                <span className="text-xs text-ink-800 bg-parchment-100 px-2 py-1 rounded-full">{n.Likes?.length ?? 0} likes</span>
              </div>
            ))}
          </div>
        </div>

        {/* My books */}
        <div className="bg-white rounded-xl border border-parchment-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-parchment-200">
            <h2 className="font-bold text-ink-900 flex items-center gap-2"><BookOpen className="h-5 w-5 text-amber-500" /> My Book Listings</h2>
          </div>
          <div className="divide-y divide-parchment-100">
            {loading ? <p className="p-6 text-sm text-ink-800">Loading…</p> : myBooks.length === 0 ? (
              <p className="p-6 text-sm text-ink-800">No books listed yet.</p>
            ) : myBooks.map((b) => (
              <div key={b._id} className="px-6 py-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-ink-900">{b.Title}</p>
                  <p className="text-sm text-ink-800">{b.Author} · {b.Subject}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  b.Status === 'Available' ? 'bg-emerald-100 text-emerald-700' :
                  b.Status === 'Requested' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                }`}>{b.Status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Exchange history */}
        <div className="bg-white rounded-xl border border-parchment-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-parchment-200">
            <h2 className="font-bold text-ink-900 flex items-center gap-2"><ArrowLeftRight className="h-5 w-5 text-emerald-500" /> Exchange History</h2>
          </div>
          <div className="divide-y divide-parchment-100">
            {loading ? <p className="p-6 text-sm text-ink-800">Loading…</p> : exchanges.length === 0 ? (
              <p className="p-6 text-sm text-ink-800">No completed exchanges yet.</p>
            ) : exchanges.map((e) => {
              const uid = user?._id;
              const isOwner = e.OwnerID?._id === uid || e.OwnerID === uid;
              const other = isOwner ? e.RequesterID : e.OwnerID;
              const book = e.BookSnapshot || e.BookID;
              return (
                <div key={e._id} className="px-6 py-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-ink-900">{book?.Title || 'Unknown book'}</p>
                    <p className="text-sm text-ink-800">{book?.Author} · {book?.Subject}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isOwner ? 'Given to' : 'Received from'} <span className="font-medium text-ink-800">{other?.Name || 'User'}</span>
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">Exchanged</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
