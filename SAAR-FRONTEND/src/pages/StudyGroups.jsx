import { useEffect, useRef, useState } from 'react';
import { Users, Plus, Send, ArrowLeft, X, MessageSquare } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useReveal } from '../hooks/useReveal';
import { getSocket } from '../hooks/useSocket';

const SUBJECTS = ['Computer Science','Physics','Chemistry','Mathematics','Economics','History','Biology','Other'];

export default function StudyGroups() {
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ Name: '', Subject: '', Semester: '', Description: '' });
  const bottomRef = useRef(null);
  const socketRef = useRef(null);
  useReveal('.reveal, .reveal-left, .reveal-scale', [groups]);

  useEffect(() => {
    Promise.all([
      apiFetch('/api/groups', { skipAuth: true }),
      isAuthenticated ? apiFetch('/api/groups/mine') : Promise.resolve({ data: [] }),
    ]).then(([gRes, mRes]) => {
      setGroups(gRes.success ? gRes.data : []);
      setMyGroups(mRes.success ? mRes.data : []);
    }).finally(() => setLoading(false));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!activeGroup) return;
    apiFetch(`/api/groups/${activeGroup._id}/messages`)
      .then((r) => r.success && setMessages(r.data))
      .catch(() => {});

    if (isAuthenticated) {
      const socket = getSocket();
      socketRef.current = socket;
      socket.connect();
      socket.emit('join_group', activeGroup._id);
      socket.on('new_group_message', (msg) => setMessages((prev) => [...prev, msg]));
      return () => {
        socket.emit('leave_group', activeGroup._id);
        socket.off('new_group_message');
      };
    }
  }, [activeGroup, isAuthenticated]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  async function handleJoin(group) {
    if (!isAuthenticated) { toast('Log in to join groups', 'error'); return; }
    try {
      await apiFetch(`/api/groups/${group._id}/join`, { method: 'POST', body: JSON.stringify({}) });
      setMyGroups((prev) => [...prev, group]);
      toast('Joined group!');
    } catch (e) { toast(e.message, 'error'); }
  }

  async function handleLeave(group) {
    try {
      await apiFetch(`/api/groups/${group._id}/leave`, { method: 'POST', body: JSON.stringify({}) });
      setMyGroups((prev) => prev.filter((g) => g._id !== group._id));
      if (activeGroup?._id === group._id) setActiveGroup(null);
      toast('Left group.');
    } catch (e) { toast(e.message, 'error'); }
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      const r = await apiFetch('/api/groups', { method: 'POST', body: JSON.stringify(form) });
      setGroups((prev) => [r.data, ...prev]);
      setMyGroups((prev) => [r.data, ...prev]);
      setShowCreate(false);
      setForm({ Name: '', Subject: '', Semester: '', Description: '' });
      toast('Group created!');
    } catch (e) { toast(e.message, 'error'); }
  }

  async function sendMessage(e) {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const r = await apiFetch(`/api/groups/${activeGroup._id}/messages`, {
        method: 'POST', body: JSON.stringify({ text }),
      });
      setMessages((prev) => [...prev, r.data]);
      socketRef.current?.emit('send_group_message', { groupId: activeGroup._id, message: r.data });
      setText('');
    } catch (e) { toast(e.message, 'error'); }
  }

  const isMember = (g) => myGroups.some((m) => m._id === g._id);

  if (activeGroup) return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-4rem)] bg-parchment-50">
      <div className="bg-white border-b border-parchment-200 px-4 py-3 flex items-center gap-3 shadow-sm">
        <button onClick={() => setActiveGroup(null)} className="text-ink-800 hover:text-accent-primary"><ArrowLeft className="h-5 w-5" /></button>
        <div>
          <p className="font-bold text-ink-900">{activeGroup.Name}</p>
          <p className="text-xs text-ink-800">{activeGroup.Subject} · Sem {activeGroup.Semester} · {activeGroup.Members?.length} members</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.SenderID?._id === user?._id || msg.SenderID === user?._id;
          return (
            <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-accent-primary text-white rounded-br-sm' : 'bg-white text-ink-900 border border-parchment-200 rounded-bl-sm'}`}>
                {!isMe && <p className="text-xs font-semibold mb-1 text-accent-primary">{msg.SenderID?.Name}</p>}
                <p>{msg.Text}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendMessage} className="bg-white border-t border-parchment-200 px-4 py-3 flex gap-3">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…"
          className="flex-1 border border-parchment-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        <button type="submit" disabled={!text.trim()} className="bg-accent-primary text-white p-2.5 rounded-full hover:bg-accent-hover disabled:opacity-50 transition-colors">
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );

  return (
    <div className="flex-1 bg-parchment-50 py-8 min-h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8 animate-fade-up">
          <div className="flex items-center gap-3">
            <Users className="h-7 w-7 text-accent-primary" />
            <div>
              <h1 className="text-2xl font-bold text-ink-900">Study Groups</h1>
              <p className="text-ink-800 text-sm">Join or create groups by subject and semester.</p>
            </div>
          </div>
          {isAuthenticated && (
            <button onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-semibold hover:bg-accent-hover transition-colors btn-glow">
              <Plus className="h-4 w-4" /> Create Group
            </button>
          )}
        </div>

        {loading ? <p className="text-ink-800">Loading…</p> : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((g, i) => (
              <div key={g._id} className={`reveal delay-${Math.min(i * 100, 500)} card-hover bg-white rounded-xl border border-parchment-200 p-5 shadow-sm`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold bg-indigo-100 text-accent-primary px-2 py-0.5 rounded-full">{g.Subject}</span>
                  <span className="text-xs text-slate-400">Sem {g.Semester}</span>
                </div>
                <h3 className="font-bold text-ink-900 mb-1">{g.Name}</h3>
                {g.Description && <p className="text-xs text-ink-800 mb-3 line-clamp-2">{g.Description}</p>}
                <p className="text-xs text-slate-400 mb-3">{g.Members?.length || 0} members</p>
                <div className="flex gap-2">
                  {isMember(g) ? (
                    <>
                      <button onClick={() => setActiveGroup(g)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 bg-accent-primary text-white rounded-lg text-xs font-semibold hover:bg-accent-hover transition-colors">
                        <MessageSquare className="h-3.5 w-3.5" /> Open Chat
                      </button>
                      <button onClick={() => handleLeave(g)}
                        className="py-2 px-3 border border-parchment-300 rounded-lg text-xs text-ink-800 hover:bg-parchment-50">
                        Leave
                      </button>
                    </>
                  ) : (
                    <button onClick={() => handleJoin(g)}
                      className="flex-1 py-2 bg-parchment-100 text-ink-900 rounded-lg text-xs font-semibold hover:bg-parchment-200 transition-colors">
                      Join Group
                    </button>
                  )}
                </div>
              </div>
            ))}
            {groups.length === 0 && <p className="text-ink-800 col-span-full">No groups yet. Create one!</p>}
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-ink-900">Create Study Group</h2>
              <button onClick={() => setShowCreate(false)} className="text-slate-400 hover:text-ink-900"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <input required value={form.Name} onChange={(e) => setForm((f) => ({ ...f, Name: e.target.value }))}
                placeholder="Group name" className="w-full border border-parchment-300 rounded-lg px-3 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <select required value={form.Subject} onChange={(e) => setForm((f) => ({ ...f, Subject: e.target.value }))}
                  className="border border-parchment-300 rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="">Subject</option>
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select required value={form.Semester} onChange={(e) => setForm((f) => ({ ...f, Semester: e.target.value }))}
                  className="border border-parchment-300 rounded-lg px-3 py-2 text-sm bg-white">
                  <option value="">Semester</option>
                  {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={s}>Sem {s}</option>)}
                </select>
              </div>
              <textarea value={form.Description} onChange={(e) => setForm((f) => ({ ...f, Description: e.target.value }))}
                placeholder="Description (optional)" rows={2}
                className="w-full border border-parchment-300 rounded-lg px-3 py-2 text-sm resize-none" />
              <div className="flex justify-end gap-2 pt-1">
                <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 border border-parchment-300 rounded-lg text-sm text-ink-800">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-semibold hover:bg-accent-hover">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
