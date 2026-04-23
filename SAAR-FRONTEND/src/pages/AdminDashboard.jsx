import { useEffect, useState } from 'react';
import { Shield, Users, Flag, Activity, Trash2, RefreshCw, BookOpen, ArrowLeftRight } from 'lucide-react';
import { apiFetch } from '../lib/api';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale,
  LinearScale, BarElement, Title
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Doughnut, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, ChartDataLabels);

const COLORS = [
  '#6366f1','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444',
  '#8b5cf6','#06b6d4','#84cc16','#f97316','#14b8a6','#e879f9'
];

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
    } catch (e) { setError(e.message || 'Failed to load'); }
  }

  useEffect(() => { setLoading(true); loadAll().finally(() => setLoading(false)); }, []);

  async function deleteNote(id) {
    if (!window.confirm('Delete this note?')) return;
    setDeleting(id);
    try { await apiFetch(`/api/admin/notes/${id}`, { method: 'DELETE' }); setNotes((p) => p.filter((n) => n._id !== id)); }
    catch (e) { setError(e.message); } finally { setDeleting(null); }
  }

  async function deleteBook(id) {
    if (!window.confirm('Delete this book listing?')) return;
    setDeleting(id);
    try { await apiFetch(`/api/admin/books/${id}`, { method: 'DELETE' }); setBooks((p) => p.filter((b) => b._id !== id)); }
    catch (e) { setError(e.message); } finally { setDeleting(null); }
  }

  // ── Chart data ──
  const notesBySubject = notes.reduce((acc, n) => { acc[n.Subject] = (acc[n.Subject] || 0) + 1; return acc; }, {});
  const notesDoughnut = {
    labels: Object.keys(notesBySubject),
    datasets: [{ data: Object.values(notesBySubject), backgroundColor: COLORS, borderWidth: 2, borderColor: '#fff' }],
  };

  const booksByStatus = books.reduce((acc, b) => { acc[b.Status] = (acc[b.Status] || 0) + 1; return acc; }, {});
  const booksPie = {
    labels: Object.keys(booksByStatus),
    datasets: [{ data: Object.values(booksByStatus), backgroundColor: ['#10b981','#f59e0b','#6b7280'], borderWidth: 2, borderColor: '#fff' }],
  };

  const uploaderCounts = notes.reduce((acc, n) => {
    const name = n.UploaderID?.Name || 'Unknown';
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});
  const topUploaders = Object.entries(uploaderCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const uploadersBar = {
    labels: topUploaders.map(([name]) => name),
    datasets: [{ label: 'Notes uploaded', data: topUploaders.map(([, count]) => count), backgroundColor: topUploaders.map((_, i) => COLORS[i % COLORS.length]), borderRadius: 6 }],
  };

  const branchCounts = users.reduce((acc, u) => { if (u.Branch) acc[u.Branch] = (acc[u.Branch] || 0) + 1; return acc; }, {});
  const branchBar = {
    labels: Object.keys(branchCounts),
    datasets: [{ label: 'Students', data: Object.values(branchCounts), backgroundColor: Object.keys(branchCounts).map((_, i) => COLORS[i % COLORS.length]), borderRadius: 6 }],
  };

  const chartOpts = (title) => ({
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { font: { size: 11 } } },
      title: { display: !!title, text: title, font: { size: 13, weight: 'bold' } },
      datalabels: {
        color: '#fff',
        font: { weight: 'bold', size: 12 },
        formatter: (value) => value > 0 ? value : '',
      },
    },
  });

  const barOpts = (title) => ({
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: !!title, text: title },
      datalabels: {
        anchor: 'end', align: 'end',
        color: '#374151',
        font: { weight: 'bold', size: 11 },
        formatter: (value) => value,
      },
    },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } }, x: { ticks: { font: { size: 11 } } } },
  });

  const overviewStats = [
    { label: 'Total Users',  value: stats?.totalUsers  ?? '—', icon: Users,    color: 'text-blue-600',    bg: 'bg-blue-100'    },
    { label: 'Total Notes',  value: stats?.totalNotes  ?? '—', icon: Flag,     color: 'text-rose-600',    bg: 'bg-rose-100'    },
    { label: 'Total Books',  value: stats?.totalBooks  ?? '—', icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Total PYQs',   value: stats?.totalPYQs   ?? '—', icon: Activity, color: 'text-amber-600',   bg: 'bg-amber-100'   },
  ];

  const navItems = [
    { key: 'overview',   label: 'Overview',            icon: Activity      },
    { key: 'notes',      label: 'Notes moderation',    icon: Flag          },
    { key: 'books',      label: 'Books moderation',    icon: BookOpen      },
    { key: 'exchanges',  label: 'Completed Exchanges', icon: ArrowLeftRight },
    { key: 'users',      label: 'Users',               icon: Users         },
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
              <button key={key} type="button" onClick={() => setActiveTab(key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === key ? 'bg-accent-primary text-white' : 'hover:bg-slate-800 hover:text-white'}`}>
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
          <button type="button" onClick={() => { setLoading(true); loadAll().finally(() => setLoading(false)); }}
            className="inline-flex items-center gap-2 px-4 py-2 border border-parchment-300 rounded-lg text-sm bg-white hover:bg-parchment-50">
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {error && <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm">{error}</div>}

        {/* Overview */}
        {activeTab === 'overview' && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
              {overviewStats.map((stat, i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm border border-parchment-200 p-5 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-ink-800 mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold text-ink-900">{loading ? '…' : stat.value}</p>
                  </div>
                  <div className={`${stat.bg} ${stat.color} p-3 rounded-lg`}><stat.icon className="h-6 w-6" /></div>
                </div>
              ))}
            </div>

            {/* Charts row 1 */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl border border-parchment-200 shadow-sm p-5">
                <h3 className="font-bold text-ink-900 mb-4">Notes by Subject</h3>
                <div style={{ height: 260 }}>
                  {notes.length > 0 ? <Doughnut data={notesDoughnut} options={chartOpts()} /> : <p className="text-sm text-ink-800 text-center pt-10">No data</p>}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-parchment-200 shadow-sm p-5">
                <h3 className="font-bold text-ink-900 mb-4">Books by Status</h3>
                <div style={{ height: 260 }}>
                  {books.length > 0 ? <Pie data={booksPie} options={chartOpts()} /> : <p className="text-sm text-ink-800 text-center pt-10">No data</p>}
                </div>
              </div>
            </div>

            {/* Charts row 2 */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl border border-parchment-200 shadow-sm p-5">
                <h3 className="font-bold text-ink-900 mb-4">Top Uploaders</h3>
                <div style={{ height: 240 }}>
                  {topUploaders.length > 0 ? <Bar data={uploadersBar} options={barOpts()} /> : <p className="text-sm text-ink-800 text-center pt-10">No data</p>}
                </div>
              </div>
              <div className="bg-white rounded-xl border border-parchment-200 shadow-sm p-5">
                <h3 className="font-bold text-ink-900 mb-4">Students by Branch</h3>
                <div style={{ height: 240 }}>
                  {Object.keys(branchCounts).length > 0 ? <Bar data={branchBar} options={barOpts()} /> : <p className="text-sm text-ink-800 text-center pt-10">No data</p>}
                </div>
              </div>
            </div>

            {/* Latest notes */}
            <div className="bg-white rounded-xl border border-parchment-200 p-6">
              <h2 className="text-lg font-bold text-ink-900 mb-4">Latest Notes</h2>
              <ul className="divide-y divide-parchment-200">
                {(stats?.latestNotes || []).map((n) => (
                  <li key={n._id} className="py-3">
                    <p className="font-medium text-ink-900">{n.Title}</p>
                    <p className="text-sm text-ink-800">{n.Subject} · {n.UploaderID?.Name || 'Unknown'}</p>
                  </li>
                ))}
                {!loading && !stats?.latestNotes?.length && <li className="py-4 text-ink-800 text-sm">No notes yet.</li>}
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
                    {['Title','Subject','Sem','Uploaded by','Action'].map((h) => (
                      <th key={h} className={`px-6 py-3 text-xs font-semibold text-ink-800 uppercase ${h === 'Action' ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
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
                        <button type="button" disabled={deleting === n._id} onClick={() => deleteNote(n._id)}
                          className="inline-flex items-center gap-1 text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg text-sm disabled:opacity-50">
                          <Trash2 className="h-4 w-4" /> {deleting === n._id ? '…' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && notes.length === 0 && <tr><td colSpan={5} className="px-6 py-6 text-sm text-ink-800 text-center">No notes yet.</td></tr>}
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
                    {['Title','Author','Subject','Status','Owner','Action'].map((h) => (
                      <th key={h} className={`px-6 py-3 text-xs font-semibold text-ink-800 uppercase ${h === 'Action' ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {books.map((b) => (
                    <tr key={b._id}>
                      <td className="px-6 py-4 text-sm text-ink-900 font-medium">{b.Title}</td>
                      <td className="px-6 py-4 text-sm text-ink-800">{b.Author}</td>
                      <td className="px-6 py-4 text-sm text-ink-800">{b.Subject}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${b.Status === 'Available' ? 'bg-emerald-100 text-emerald-700' : b.Status === 'Requested' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>{b.Status}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-ink-800">{b.OwnerID?.Name || '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <button type="button" disabled={deleting === b._id} onClick={() => deleteBook(b._id)}
                          className="inline-flex items-center gap-1 text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg text-sm disabled:opacity-50">
                          <Trash2 className="h-4 w-4" /> {deleting === b._id ? '…' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loading && books.length === 0 && <tr><td colSpan={6} className="px-6 py-6 text-sm text-ink-800 text-center">No books listed yet.</td></tr>}
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
                    {['Book','Given by','Received by','Date'].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-ink-800 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {exchanges.map((e) => {
                    const book = e.BookSnapshot || e.BookID;
                    return (
                      <tr key={e._id}>
                        <td className="px-6 py-4"><p className="text-sm font-medium text-ink-900">{book?.Title || '—'}</p><p className="text-xs text-ink-800">{book?.Author} · {book?.Subject}</p></td>
                        <td className="px-6 py-4 text-sm text-ink-800">{e.OwnerID?.Name || '—'}</td>
                        <td className="px-6 py-4 text-sm text-ink-800">{e.RequesterID?.Name || '—'}</td>
                        <td className="px-6 py-4 text-sm text-ink-800">{new Date(e.updatedAt).toLocaleDateString()}</td>
                      </tr>
                    );
                  })}
                  {!loading && exchanges.length === 0 && <tr><td colSpan={4} className="px-6 py-6 text-sm text-ink-800 text-center">No completed exchanges yet.</td></tr>}
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
              <p className="text-sm text-ink-800 mt-1">{users.length} users</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-parchment-50">
                  <tr>
                    {['Name','Email','Branch','Year','Role'].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-ink-800 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td className="px-6 py-4 text-sm font-medium text-ink-900">{u.Name}</td>
                      <td className="px-6 py-4 text-sm text-ink-800">{u.Email}</td>
                      <td className="px-6 py-4 text-sm text-ink-800">{u.Branch || '—'}</td>
                      <td className="px-6 py-4 text-sm text-ink-800">{u.Year ? `Year ${u.Year}` : '—'}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold ${u.Role === 'Admin' ? 'bg-indigo-100 text-accent-primary' : 'bg-parchment-100 text-ink-900'}`}>{u.Role}</span>
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
