import { useEffect, useState } from 'react';
import { Shield, Users, Flag, Activity, Trash2, RefreshCw } from 'lucide-react';
import { apiFetch } from '../lib/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(null);

  async function loadStats() {
    setError('');
    const res = await apiFetch('/api/admin/stats');
    if (res.success && res.data) setStats(res.data);
    else setError(res.message || 'Failed to load stats');
  }

  async function loadUsers() {
    const res = await apiFetch('/api/admin/users');
    if (res.success && Array.isArray(res.data)) setUsers(res.data);
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([loadStats(), loadUsers()])
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Failed to load');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  async function deleteNote(id) {
    if (!window.confirm('Delete this note from the platform?')) return;
    setDeleting(id);
    setError('');
    try {
      await apiFetch(`/api/admin/notes/${id}`, { method: 'DELETE' });
      await loadStats();
    } catch (e) {
      setError(e.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  }

  const overviewStats = [
    { label: 'Total Users', value: stats?.totalUsers ?? '—', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Notes', value: stats?.totalNotes ?? '—', icon: Flag, color: 'text-rose-600', bg: 'bg-rose-100' },
    { label: 'Total Books', value: stats?.totalBooks ?? '—', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Exchange requests', value: stats?.totalExchangeRequests ?? '—', icon: Users, color: 'text-amber-600', bg: 'bg-amber-100' },
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
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-accent-primary text-white' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <Activity className="h-5 w-5" /> Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('notes')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'notes' ? 'bg-accent-primary text-white' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <Flag className="h-5 w-5" /> Notes moderation
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'users' ? 'bg-accent-primary text-white' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <Users className="h-5 w-5" /> Users
            </button>
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
            onClick={() => { loadStats(); loadUsers(); }}
            className="inline-flex items-center gap-2 px-4 py-2 border border-parchment-300 rounded-lg text-sm bg-white hover:bg-parchment-50"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm">{error}</div>
        )}

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
                  <li key={n._id} className="py-3 flex justify-between gap-4">
                    <div>
                      <p className="font-medium text-ink-900">{n.Title}</p>
                      <p className="text-sm text-ink-800">{n.Subject} · {n.UploaderID?.Name || 'Unknown'}</p>
                    </div>
                  </li>
                ))}
                {!loading && (!stats?.latestNotes || stats.latestNotes.length === 0) && (
                  <li className="py-4 text-ink-800 text-sm">No notes yet.</li>
                )}
              </ul>
            </div>
          </>
        )}

        {activeTab === 'notes' && (
          <div className="bg-white rounded-xl shadow-sm border border-parchment-200 overflow-hidden">
            <div className="p-5 border-b border-parchment-200 bg-parchment-50">
              <h2 className="font-bold text-ink-900">Remove notes</h2>
              <p className="text-sm text-ink-800 mt-1">Deleting a note removes its database record. Uploaded files may remain on disk until a future cleanup.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-parchment-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ink-800 uppercase">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-ink-800 uppercase">Subject</th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-ink-800 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(stats?.latestNotes || []).map((n) => (
                    <tr key={n._id}>
                      <td className="px-6 py-4 text-sm text-ink-900">{n.Title}</td>
                      <td className="px-6 py-4 text-sm text-ink-800">{n.Subject}</td>
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
                </tbody>
              </table>
            </div>
          </div>
        )}

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
