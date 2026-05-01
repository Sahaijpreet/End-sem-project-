import { useEffect, useRef, useState } from 'react';
import { Users, Plus, Send, ArrowLeft, X, MessageSquare } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useReveal } from '../hooks/useReveal';
import { getSocket } from '../hooks/useSocket';

const SUBJECT_ICONS = {
  'Computer Science': '💻',
  'Physics': '⚛️',
  'Chemistry': '⚗️',
  'Mathematics': '📐',
  'Economics': '📊',
  'History': '📜',
  'Biology': '🧬',
  'Other': '📚',
};



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
    <div className="flex-1 bg-parchment-50 min-h-[calc(100vh-4rem)]">

      {/* Hero banner — horizontal split */}
      <div className="relative bg-gradient-to-r from-accent-primary to-accent-hover overflow-hidden">

        {/* Right-side illustration panel */}
        <div className="absolute right-0 top-0 h-full w-[45%] hidden md:block pointer-events-none overflow-hidden">

          {/* Dot pattern bg */}
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="white"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>

          {/* Diagonal divider */}
          <svg className="absolute left-0 top-0 h-full" viewBox="0 0 56 200" preserveAspectRatio="none" style={{width:'56px'}}>
            <polygon points="56,0 56,200 0,200" fill="rgba(255,255,255,0.07)" />
          </svg>

          {/* Floating subject pills */}
          <div className="absolute top-4 left-16 animate-[float_5s_ease-in-out_infinite]">
            <span className="bg-white/15 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1.5 rounded-full border border-white/20 shadow">📐 Mathematics</span>
          </div>
          <div className="absolute top-5 right-6 animate-[float_6s_ease-in-out_infinite_1s]">
            <span className="bg-white/15 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1.5 rounded-full border border-white/20 shadow">💻 Computer Science</span>
          </div>
          <div className="absolute bottom-6 left-10 animate-[float_7s_ease-in-out_infinite_0.5s]">
            <span className="bg-white/15 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1.5 rounded-full border border-white/20 shadow">⚗️ Chemistry</span>
          </div>
          <div className="absolute bottom-7 right-8 animate-[float_5.5s_ease-in-out_infinite_1.5s]">
            <span className="bg-white/15 backdrop-blur-sm text-white text-[11px] font-semibold px-3 py-1.5 rounded-full border border-white/20 shadow">🔭 Physics</span>
          </div>

          {/* Center card mockup */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 w-52 shadow-xl animate-[fadeSlideUp_0.6s_ease_0.2s_both]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <span className="text-lg">💻</span>
                </div>
                <div>
                  <p className="text-white text-xs font-bold leading-tight">DSA Prep Squad</p>
                  <p className="text-white/60 text-[10px]">Sem 4 · CS</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="bg-white/20 rounded-xl rounded-tl-sm px-2.5 py-1.5 text-[10px] text-white w-fit max-w-[140px]">
                  Anyone solved Q3? 🤔
                </div>
                <div className="bg-white/30 rounded-xl rounded-tr-sm px-2.5 py-1.5 text-[10px] text-white w-fit max-w-[130px] ml-auto text-right">
                  Yes! Check notes 📝
                </div>
                <div className="bg-white/20 rounded-xl rounded-tl-sm px-2.5 py-1.5 text-[10px] text-white w-fit max-w-[140px]">
                  Study at 8pm? 🙋
                </div>
              </div>
              <div className="flex items-center gap-1 mt-2 px-1">
                <div className="flex gap-0.5">
                  <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{animationDelay:'0s'}} />
                  <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{animationDelay:'0.15s'}} />
                  <span className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" style={{animationDelay:'0.3s'}} />
                </div>
                <span className="text-white/40 text-[10px]">Rahul is typing…</span>
              </div>
            </div>
          </div>

          {/* Floating online badge */}
          <div className="absolute top-1/2 left-8 -translate-y-8 animate-[float_6s_ease-in-out_infinite_2s]">
            <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2 text-center shadow">
              <p className="text-white font-bold text-lg leading-none">24</p>
              <p className="text-white/60 text-[10px] mt-0.5">online now</p>
            </div>
          </div>

        </div>

        {/* Left side content */}
        <div className="relative px-6 sm:px-10 py-10 md:w-[55%]">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Study Groups</h1>
          </div>
          <p className="text-white/75 text-sm mb-6">Join or create groups by subject and semester. Collaborate in real-time.</p>
          <div className="flex items-center gap-5 flex-wrap">
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{groups.length}</p>
              <p className="text-white/70 text-xs">Groups</p>
            </div>
            <div className="w-px h-8 bg-white/30" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{myGroups.length}</p>
              <p className="text-white/70 text-xs">Joined</p>
            </div>
            <div className="w-px h-8 bg-white/30" />
            <div className="text-center">
              <p className="text-2xl font-bold text-white">{groups.reduce((a, g) => a + (g.Members?.length || 0), 0)}</p>
              <p className="text-white/70 text-xs">Members</p>
            </div>
            {isAuthenticated && (
              <>
                <div className="w-px h-8 bg-white/30 hidden sm:block" />
                <button onClick={() => setShowCreate(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-accent-primary rounded-xl text-sm font-bold hover:bg-parchment-50 transition-colors shadow-lg">
                  <Plus className="h-4 w-4" /> Create Group
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        {loading ? <p className="text-ink-800">Loading…</p> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {groups.map((g, i) => {
              const hue = 80; // olive/green theme hue
              const lightness = 88 + (i % 3) * 3; // slight variation per card
              return (
              <div key={g._id}
                style={{ animationDelay: `${i * 60}ms`, background: `hsl(${hue}, 35%, ${lightness}%)` }}
                className="animate-[fadeSlideUp_0.4s_ease_both] card-hover rounded-2xl border border-parchment-200 shadow-sm flex flex-col overflow-hidden">
                {/* Colored top band */}
                <div className="relative h-20 flex items-center justify-center"
                  style={{ background: `hsl(${hue}, 40%, ${lightness - 10}%)` }}>
                  <div className="absolute inset-0 opacity-20"
                    style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm bg-accent-primary">
                    <span className="text-2xl">{SUBJECT_ICONS[g.Subject] || '📚'}</span>
                  </div>
                  {isMember(g) && (
                    <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 text-accent-primary">Joined</span>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[11px] font-semibold bg-white/60 text-accent-primary px-2 py-0.5 rounded-full border border-accent-primary/20">{g.Subject}</span>
                    <span className="text-[11px] text-ink-800 font-medium">Sem {g.Semester}</span>
                  </div>
                  <h3 className="font-bold text-ink-900 mt-1 mb-1 leading-snug">{g.Name}</h3>
                  {g.Description && <p className="text-xs text-ink-800 line-clamp-2 mb-2">{g.Description}</p>}
                  <div className="flex items-center gap-1.5 text-xs text-ink-800 mt-auto mb-3">
                    <Users className="h-3 w-3" />
                    <span>{g.Members?.length || 0} members</span>
                  </div>
                  <div className="flex gap-2">
                    {isMember(g) ? (
                      <>
                        <button onClick={() => setActiveGroup(g)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-accent-primary text-white rounded-xl text-xs font-semibold hover:bg-accent-hover transition-colors">
                          <MessageSquare className="h-3.5 w-3.5" /> Open Chat
                        </button>
                        <button onClick={() => handleLeave(g)}
                          className="py-2 px-3 border border-parchment-300 rounded-xl text-xs text-ink-800 hover:bg-parchment-100 bg-white/50">
                          Leave
                        </button>
                      </>
                    ) : (
                      <button onClick={() => handleJoin(g)}
                        className="flex-1 py-2 border-2 border-accent-primary/30 text-accent-primary rounded-xl text-xs font-semibold hover:bg-accent-primary/10 transition-colors">
                        + Join Group
                      </button>
                    )}
                  </div>
                </div>
              </div>
              );
            })}
            {groups.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-parchment-100 flex items-center justify-center mb-4">
                  <Users className="h-10 w-10 text-accent-primary" />
                </div>
                <p className="text-ink-900 font-semibold">No groups yet</p>
                <p className="text-ink-800 text-sm mt-1">Be the first to create a study group!</p>
              </div>
            )}
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
