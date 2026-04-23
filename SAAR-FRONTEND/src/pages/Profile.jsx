import { useEffect, useMemo, useRef, useState } from 'react';
import { UserCircle, FileText, BookOpen, Mail, IdCard, Edit2, Check, X, ArrowLeftRight, Bookmark, Camera, Download, ExternalLink } from 'lucide-react';
import { apiFetch, fileUrl } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useReveal } from '../hooks/useReveal';

const TABS = ['Overview', 'Bookmarks', 'Exchange History'];
const BRANCHES = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Chemical', 'Electrical', 'Other'];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();
  const avatarRef = useRef(null);
  const [notes, setNotes] = useState([]);
  const [books, setBooks] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [bookmarks, setBookmarks] = useState({ notes: [], pyqs: [] });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('Overview');
  const [form, setForm] = useState({ Name: '', CollegeID: '', Bio: '', Branch: '', Year: '' });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    if (user) setForm({ Name: user.Name || '', CollegeID: user.CollegeID || '', Bio: user.Bio || '', Branch: user.Branch || '', Year: user.Year || '' });
  }, [user]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      apiFetch('/api/notes', { skipAuth: true }),
      apiFetch('/api/books', { skipAuth: true }),
      apiFetch('/api/chat/conversations'),
      apiFetch('/api/auth/bookmarks'),
    ]).then(([nRes, bRes, cRes, bmRes]) => {
      if (cancelled) return;
      setNotes(nRes.success && Array.isArray(nRes.data) ? nRes.data : []);
      setBooks(bRes.success && Array.isArray(bRes.data) ? bRes.data : []);
      setExchanges(cRes.success ? cRes.data.filter((c) => c.ExchangeCompleted) : []);
      setBookmarks(bmRes.success ? bmRes.data : { notes: [], pyqs: [] });
    }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const myNotes = useMemo(() => {
    const uid = user?._id;
    if (!uid) return [];
    return notes.filter((n) => (typeof n.UploaderID === 'object' ? String(n.UploaderID._id) : String(n.UploaderID)) === String(uid));
  }, [notes, user]);

  const myBooks = useMemo(() => {
    const uid = user?._id;
    if (!uid) return [];
    return books.filter((b) => (typeof b.OwnerID === 'object' ? String(b.OwnerID._id) : String(b.OwnerID)) === String(uid));
  }, [books, user]);

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v !== undefined && fd.append(k, v));
      if (avatarFile) fd.append('avatar', avatarFile);
      const res = await apiFetch('/api/auth/profile', { method: 'PATCH', body: fd });
      if (res.success) updateUser(res.data);
      toast('Profile updated!');
      setEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      toast(err.message || 'Update failed', 'error');
    } finally {
      setSaving(false);
    }
  }

  useReveal();

  const avatarSrc = avatarPreview || (user?.Avatar ? fileUrl(user.Avatar) : null);

  return (
    <div className="flex-1 min-h-[calc(100vh-4rem)] relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #fbf8f1 0%, #f4ebd8 40%, #fbf8f1 100%)' }}>

      {/* animated bg orbs */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-indigo-200/20 rounded-full blur-3xl animate-float-slow pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-72 h-72 bg-accent-primary/10 rounded-full blur-3xl animate-float pointer-events-none" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/3 right-0 w-56 h-56 bg-amber-100/30 rounded-full blur-3xl animate-float-slow pointer-events-none" style={{ animationDelay: '1s' }} />

      {/* spinning rings */}
      <div className="absolute top-16 right-16 w-32 h-32 border-4 border-dashed border-accent-primary/10 rounded-full animate-spin-slow pointer-events-none" />
      <div className="absolute bottom-24 left-8 w-20 h-20 border-2 border-dashed border-indigo-300/20 rounded-full animate-spin-slow pointer-events-none" style={{ animationDirection: 'reverse' }} />

      <div className="relative z-10 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow-sm border border-parchment-200 p-8 animate-fade-up">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                {avatarSrc ? (
                  <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle className="h-12 w-12 text-accent-primary" />
                )}
              </div>
              {editing && (
                <>
                  <button type="button" onClick={() => avatarRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-accent-primary text-white rounded-full p-1 shadow">
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                  <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </>
              )}
            </div>

            <div className="flex-1 min-w-0">
              {editing ? (
                <form onSubmit={saveProfile} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input value={form.Name} onChange={(e) => setForm((f) => ({ ...f, Name: e.target.value }))}
                      className="border border-parchment-300 rounded-lg px-3 py-2 text-ink-900 text-sm" placeholder="Name" required />
                    <input value={form.CollegeID} onChange={(e) => setForm((f) => ({ ...f, CollegeID: e.target.value }))}
                      className="border border-parchment-300 rounded-lg px-3 py-2 text-ink-800 text-sm" placeholder="College ID" />
                    <select value={form.Branch} onChange={(e) => setForm((f) => ({ ...f, Branch: e.target.value }))}
                      className="border border-parchment-300 rounded-lg px-3 py-2 text-ink-800 text-sm">
                      <option value="">Select branch</option>
                      {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                    <select value={form.Year} onChange={(e) => setForm((f) => ({ ...f, Year: e.target.value }))}
                      className="border border-parchment-300 rounded-lg px-3 py-2 text-ink-800 text-sm">
                      <option value="">Select year</option>
                      {[1, 2, 3, 4, 5, 6].map((y) => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                  </div>
                  <textarea value={form.Bio} onChange={(e) => setForm((f) => ({ ...f, Bio: e.target.value }))}
                    className="w-full border border-parchment-300 rounded-lg px-3 py-2 text-ink-800 text-sm resize-none"
                    placeholder="Short bio (optional)" rows={2} maxLength={300} />
                  <div className="flex gap-2">
                    <button type="submit" disabled={saving} className="flex items-center gap-1 px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-medium disabled:opacity-50">
                      <Check className="h-4 w-4" /> {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button type="button" onClick={() => { setEditing(false); setAvatarPreview(null); setAvatarFile(null); }}
                      className="flex items-center gap-1 px-4 py-2 border border-parchment-300 rounded-lg text-sm text-ink-800">
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
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-ink-800">
                    <span className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-slate-400" />{user?.Email}</span>
                    {user?.CollegeID && <span className="flex items-center gap-1.5"><IdCard className="h-4 w-4 text-slate-400" />{user.CollegeID}</span>}
                    {user?.Branch && <span className="text-xs bg-parchment-100 px-2 py-0.5 rounded-full">{user.Branch}</span>}
                    {user?.Year && <span className="text-xs bg-parchment-100 px-2 py-0.5 rounded-full">Year {user.Year}</span>}
                  </div>
                  {user?.Bio && <p className="text-sm text-ink-800 mt-2 italic">"{user.Bio}"</p>}
                  <span className={`inline-block mt-3 px-2.5 py-0.5 text-xs font-semibold rounded-full ${user?.Role === 'Admin' ? 'bg-indigo-100 text-accent-primary' : 'bg-parchment-100 text-ink-900'}`}>
                    {user?.Role}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 reveal">
          {[
            { icon: <FileText className="h-6 w-6 text-accent-primary" />, bg: 'bg-indigo-100', val: myNotes.length, label: 'Notes uploaded' },
            { icon: <BookOpen className="h-6 w-6 text-amber-600" />, bg: 'bg-amber-100', val: myBooks.length, label: 'Books listed' },
            { icon: <Bookmark className="h-6 w-6 text-violet-500" />, bg: 'bg-violet-100', val: (bookmarks.notes?.length || 0) + (bookmarks.pyqs?.length || 0), label: 'Bookmarks' },
            { icon: <Download className="h-6 w-6 text-emerald-600" />, bg: 'bg-emerald-100', val: myNotes.reduce((s, n) => s + (n.Downloads || 0), 0), label: 'Total downloads' },
          ].map(({ icon, bg, val, label }) => (
            <div key={label} className="card-hover bg-white rounded-xl border border-parchment-200 p-5 flex items-center gap-3">
              <div className={`${bg} p-3 rounded-lg`}>{icon}</div>
              <div>
                <div className="text-2xl font-bold text-ink-900">{loading ? '…' : val}</div>
                <div className="text-xs text-ink-800">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-parchment-200">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === t ? 'border-accent-primary text-accent-primary' : 'border-transparent text-ink-800 hover:text-ink-900'}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === 'Overview' && (
          <div className="space-y-6">
            <ResourceList title="My Notes" icon={<FileText className="h-5 w-5 text-accent-primary" />} loading={loading}
              items={myNotes} empty="No notes uploaded yet."
              renderItem={(n) => (
                <div key={n._id} className="px-6 py-4 flex justify-between items-center gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-ink-900 truncate">{n.Title}</p>
                    <p className="text-sm text-ink-800">{n.Subject} · Sem {n.Semester}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-ink-800 hidden sm:block">{n.Downloads ?? 0} downloads</span>
                    <a href={fileUrl(n.FileURL)} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-primary text-white rounded-lg text-xs font-medium hover:bg-accent-hover transition-colors">
                      <ExternalLink className="h-3.5 w-3.5" /> Open
                    </a>
                  </div>
                </div>
              )} />
            <ResourceList title="My Book Listings" icon={<BookOpen className="h-5 w-5 text-amber-500" />} loading={loading}
              items={myBooks} empty="No books listed yet."
              renderItem={(b) => (
                <div key={b._id} className="px-6 py-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-ink-900">{b.Title}</p>
                    <p className="text-sm text-ink-800">{b.Author} · {b.Subject}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${b.Status === 'Available' ? 'bg-emerald-100 text-emerald-700' : b.Status === 'Requested' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                    {b.Status}
                  </span>
                </div>
              )} />
          </div>
        )}

        {tab === 'Bookmarks' && (
          <div className="space-y-6">
            <ResourceList title="Bookmarked Notes" icon={<Bookmark className="h-5 w-5 text-violet-500" />} loading={loading}
              items={bookmarks.notes || []} empty="No bookmarked notes."
              renderItem={(n) => (
                <div key={n._id} className="px-6 py-4 flex justify-between items-center gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-ink-900 truncate">{n.Title}</p>
                    <p className="text-sm text-ink-800">{n.Subject} · Sem {n.Semester}</p>
                  </div>
                  <a
                    href={fileUrl(n.FileURL)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => apiFetch(`/api/notes/${n._id}/download`, { method: 'POST', body: JSON.stringify({}) }).catch(() => {})}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-accent-primary text-white rounded-lg text-xs font-medium hover:bg-accent-hover transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Open
                  </a>
                </div>
              )} />
            <ResourceList title="Bookmarked PYQs" icon={<Bookmark className="h-5 w-5 text-violet-500" />} loading={loading}
              items={bookmarks.pyqs || []} empty="No bookmarked PYQs."
              renderItem={(p) => (
                <div key={p._id} className="px-6 py-4 flex justify-between items-center gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-ink-900 truncate">{p.Title}</p>
                    <p className="text-sm text-ink-800">{p.Subject} · {p.Year} · {p.ExamType}</p>
                  </div>
                  <a
                    href={fileUrl(p.FileURL)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => apiFetch(`/api/pyqs/${p._id}/download`, { method: 'POST', body: JSON.stringify({}) }).catch(() => {})}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-accent-primary text-white rounded-lg text-xs font-medium hover:bg-accent-hover transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Open
                  </a>
                </div>
              )} />
          </div>
        )}

        {tab === 'Exchange History' && (
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
        )}
      </div>
      </div>
    </div>
  );
}

function ResourceList({ title, icon, loading, items, empty, renderItem }) {
  return (
    <div className="bg-white rounded-xl border border-parchment-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-parchment-200">
        <h2 className="font-bold text-ink-900 flex items-center gap-2">{icon} {title}</h2>
      </div>
      <div className="divide-y divide-parchment-100">
        {loading ? <p className="p-6 text-sm text-ink-800">Loading…</p> : items.length === 0 ? (
          <p className="p-6 text-sm text-ink-800">{empty}</p>
        ) : items.map(renderItem)}
      </div>
    </div>
  );
}
