import { useEffect, useState } from 'react';
import { Shield, Users, Flag, Activity, Trash2, RefreshCw, BookOpen, ArrowLeftRight } from 'lucide-react';
import { apiFetch } from '../lib/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [notes, setNotes] = useState([]);
  const [books, setBooks] = useState([]);
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);

  async function loadAll() {
    setError('');
    try {
      const [sRes, uRes, nRes, bRes, eRes] = await Promise.all([
        apiFetch('/api/admin/stats'),
        apiFetch('/api/admin/users'),
        apiFetch('/api/admin/notes'),
        apiFetch('/api/admin/books'),
        apiFetch('/api/chat/completed-exchanges'),
      ]);
      if (sRes.success) setStats(sRes.data);
      if (uRes.success) setUsers(uRes.data);
      if (nRes.success) setNotes(nRes.data);
      if (bRes.success) setBooks(bRes.data);
      if (eRes.success) setExchanges(eRes.data);
    } catch (e) {
      setError(e.message || 'Failed to load');
    }
  }

  useEffect(() => {
    setLoading(true);
    loadAll().finally(() => setLoading(false));
  }, []);

  async function deleteNote(id) {
    if (!window.confirm('Delete this note?')) return;
    setDeleting(id);
    try {
      await apiFetch(`/api/admin/notes/${id}`, { method: 'DELETE' });
      setNotes((prev) => prev.filter((n) => n._id !== id));
    } catch (e) { setError(e.message); }
    finally { setDeleting(null); }
  }

  async function deleteBook(id) {
    if (!window.confirm('Delete this book listing?')) return;
    setDeleting(id);
    try {
      await apiFetch(`/api/admin/books/${id}`, { method: 'DELETE' });
      setBooks((prev) => prev.filter((b) => b._id !== id));
    } catch (e) { setError(e.message); }
    finally { setDeleting(null); }
  }

  const overviewStats = [
    { label: 'Total Users', value: stats?.totalUsers ?? '—', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Notes', value: stats?.totalNotes ?? '—', icon: Flag, color: 'text-rose-600', bg: 'bg-rose-100' },
    { label: 'Total Books', value: stats?.totalBooks ?? '—', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Exchange Requests', value: stats?.totalExchangeRequests ?? '—', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  const navItems = [
    { key: 'overview', label: 'Overview', icon: Activity },
    { key: 'notes', label: 'Notes moderation', icon: Flag },
    { key: 'books', label: 'Books moderation', icon: BookOpen },
    { key: 'exchanges', label: 'Completed Exchanges', icon: ArrowLeftRight },
    { key: 'users', label: 'Users', icon: Users },
  ];

  return (
    <div className="flex-1 bg-parchment-50 min-h-[calc(100vh-4rem)] flex flex-col md:flex-row">

      <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-2 text-white mb-8 border-b border-slate-700 pb-6">
            <Shield className="h-6 w-6 text-accent-primary" />
            <h2 className="text-xl font-bold tracking-wide">SAAR Admin</h2>
          </div>
          <nav className="space-y-2">
            {navItems.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveTab(key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === key ? 'bg-accent-primary text-white' : 'hover:bg-slate-800 hover:text-white'}`}
              >
                <Icon className="h-5 w-5" /> {label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-10 overflow-x-hidden">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-ink-900">Administration</h1>
            <p className="text-ink-800 mt-1">Platform metrics and moderation tools.</p>
          </div>
          <button
            type="button"
            onClick={() => { setLoading(true); loadAll().finally(() => setLoading(false)); }}
            className="inline-flex items-center gap-2 px-4 py-2 border border-parchment-300 rounded-lg text-sm bg-white hover:bg-parchment-50"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {error && <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm">{error}</div>}

        {/* Overview */}
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
              {overviewStats.map((stat, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-parchment-200 p-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-ink-800 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-ink-900">{loading ? '…' : stat.value}</p>
                  </div>
                  <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-xl border border-parchment-200 p-6">
              <h2 className="text-lg font-bold text-ink-900 mb-4">Latest notes</h2>
              <ul className="divide-y divide-parchment-200">
                {(stats?.latestNotes || []).map((n) => (
                  <li key={n._id} className="py-3">
                    <p className="font-medium text-ink-900">{n.Title}</p>
                    <p className="text-sm text-ink-800">{n.Subject} · {n.UploaderID?.Name || 'Unknown'}</p>
                  </li>
                ))}
                {!loading && (!stats?.latestNotes?.length) && <li className="py-4 text-ink-800 text-sm">No notes yet.</li>}
              </ul>
            </div>
          </>
        )}

        {/* Notes moderation */}
        {activeTab === 'notes' && (
          <div className="bg-white rounded-xl shadow-sm border border-parchment-200 overflow-hidden">
            <div className="p-5 border-b border-parchment-200 bg-parchment-50">
              <h2 className="font-bold text-ink-900">Notes moderation</h2>
              <p className="text-sm text-ink-800 mt-1">{notes.length} notes total</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-parchment-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ink-800 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ink-800 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ink-800 uppercase">Sem</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ink-800 uppercase">Uploaded by</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-ink-800 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {notes.map((n) => (
                    <tr key={n._id}>
                      <td className="px-6 py-4 text-sm text-ink-900 font-medium">{n.Title}</td>
                      <td className="px-6 py-4 text-sm text-ink-800">{n.Subject}</td>
                      <td className="px-6 py-4 text-sm text-ink-800">{n.Semester}</td>
                      <td className="px-6 py-4 text-sm text-ink-800">{n.UploaderID?.Name || '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          disabled={deleting === n._id}
                          onClick={() => deleteNote(n._id)}
                          className="inline-flex items-center gap-1 text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" /> {deleting === n._id ? '…' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && notes.length === 0 && (
                    <tr><td colSpan={5} className="px-6 py-6 text-sm text-ink-800 text-center">No notes yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Books moderation */}
        {activeTab === 'books' && (
          <div className="bg-white rounded-xl shadow-sm border border-parchment-200 overflow-hidden">
            <div className="p-5 border-b border-parchment-200 bg-parchment-50">
              <h2 className="font-bold text-ink-900">Books moderation</h2>
              <p className="text-sm text-ink-800 mt-1">{books.length} books total</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-parchment-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ink-800 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ink-800 uppercase">Author</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ink-800 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ink-800 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ink-800 uppercase">Owner</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-ink-800 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {books.map((b) => (
                    <tr key={b._id}>
                      <td className="px-6 py-4 text-sm text-ink-900 font-medium">{b.Title}</td>
                      <td className="px-6 py-4 text-sm text-ink-800">{b.Author}</td>
                      <td className="px-6 py-4 text-sm text-ink-800">{b.Subject}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                          b.Status === 'Available' ? 'bg-emerald-100 text-emerald-700' :
                          b.Status === 'Requested' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>{b.Status}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-ink-800">{b.OwnerID?.Name || '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          disabled={deleting === b._id}
                          onClick={() => deleteBook(b._id)}
                          className="inline-flex items-center gap-1 text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg text-sm disabled:opacity-50"
                        >
                          <Trash2 className="h-4 w-4" /> {deleting === b._id ? '…' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && books.length === 0 && (
                    <tr><td colSpan={6} className="px-6 py-6 text-sm text-ink-800 text-center">No books listed yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Completed Exchanges */}
        {activeTab === 'exchanges' && (
          <div className="bg-white rounded-xl shadow-sm border border-parchment-200 overflow-hidden">
            <div className="p-5 border-b border-parchment-200 bg-parchment-50">
              <h2 className="font-bold text-ink-900">Completed Exchanges</h2>
              <p className="text-sm text-ink-800 mt-1">{exchanges.length} exchanges completed</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-parchment-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ink-800 uppercase">Book</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ink-800 uppercase">Given by</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ink-800 uppercase">Received by</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ink-800 uppercase">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {exchanges.map((e) => {
                    const book = e.BookSnapshot || e.BookID;
                    return (
                      <tr key={e._id}>
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-ink-900">{book?.Title || '—'}</p>
                          <p className="text-xs text-ink-800">{book?.Author} · {book?.Subject}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-ink-800">{e.OwnerID?.Name || '—'}</td>
                        <td className="px-6 py-4 text-sm text-ink-800">{e.RequesterID?.Name || '—'}</td>
                        <td className="px-6 py-4 text-sm text-ink-800">{new Date(e.updatedAt).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                  {!loading && exchanges.length === 0 && (
                    <tr><td colSpan={4} className="px-6 py-6 text-sm text-ink-800 text-center">No completed exchanges yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm border border-parchment-200 overflow-hidden">
            <div className="p-5 border-b border-parchment-200">
              <h2 className="font-bold text-ink-900">Registered users</h2>
              <p className="text-sm text-ink-800 mt-1">{users.length} users (most recent first)</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-parchment-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ink-800 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ink-800 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ink-800 uppercase">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td className="px-6 py-4 text-sm font-medium text-ink-900">{u.Name}</td>
                      <td className="px-6 py-4 text-sm text-ink-800">{u.Email}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${u.Role === 'Admin' ? 'bg-indigo-100 text-accent-primary' : 'bg-parchment-100 text-ink-900'}`}>
                          {u.Role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
