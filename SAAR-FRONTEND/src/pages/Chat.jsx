import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Send, ArrowLeft, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Chat() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const [convo, setConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const bottomRef = useRef(null);

  async function loadConvo() {
    try {
      const res = await apiFetch('/api/chat/conversations');
      if (res.success) {
        const found = res.data.find((c) => c._id === id);
        if (found) setConvo(found);
      }
    } catch (err) {
      console.error('Failed to load conversation:', err.message);
    }
  }

  async function loadMessages() {
    try {
      const res = await apiFetch(`/api/chat/conversations/${id}/messages`);
      if (res.success) setMessages(res.data);
    } catch (err) {
      console.error('Failed to load messages:', err.message);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        await Promise.all([loadConvo(), loadMessages()]);
      } catch (err) {
        console.error('Chat init error:', err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    init();
    const interval = setInterval(async () => {
      await Promise.all([loadMessages(), loadConvo()]);
    }, 5000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      const res = await apiFetch(`/api/chat/conversations/${id}/messages`, {
        method: 'POST',
        body: JSON.stringify({ text: text.trim() }),
      });
      if (res.success) { setMessages((prev) => [...prev, res.data]); setText(''); }
    } catch (err) {
      console.error('Send message failed:', err.message);
    } finally {
      setSending(false);
    }
  }

  async function handleConfirm() {
    setConfirming(true);
    try {
      const res = await apiFetch(`/api/chat/conversations/${id}/confirm`, { method: 'POST', body: JSON.stringify({}) });
      if (res.success) {
        setConvo(res.data);
        if (res.data.ExchangeCompleted) {
          toast('Exchange completed! Book has been removed from the marketplace.');
        } else {
          toast('Your confirmation recorded. Waiting for the other user.');
        }
      }
    } catch (e) { toast(e.message || 'Failed to confirm', 'error'); }
    finally { setConfirming(false); }
  }

  const uid = user?._id;
  const isOwner = convo?.OwnerID?._id === uid || convo?.OwnerID === uid;
  const isRequester = convo?.RequesterID?._id === uid || convo?.RequesterID === uid;
  const iConfirmed = (isOwner && convo?.OwnerConfirmed) || (isRequester && convo?.RequesterConfirmed);
  const otherConfirmed = (isOwner && convo?.RequesterConfirmed) || (isRequester && convo?.OwnerConfirmed);
  const otherUser = convo ? (isOwner ? convo.RequesterID : convo.OwnerID) : null;
  const bookTitle = convo?.BookSnapshot?.Title || convo?.BookID?.Title || 'this book';

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-4rem)] bg-parchment-50">

      {/* Header */}
      <div className="bg-white border-b border-parchment-200 px-4 py-3 flex items-center gap-4 shadow-sm">
        <Link to="/inbox" className="text-ink-800 hover:text-accent-primary">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-ink-900 truncate">{otherUser?.Name || 'Chat'}</p>
          <p className="text-xs text-ink-800 flex items-center gap-1 truncate">
            <BookOpen className="h-3 w-3" /> {bookTitle}
          </p>
        </div>
        {convo?.ExchangeCompleted && (
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
            <CheckCircle className="h-3 w-3" /> Exchanged
          </span>
        )}
      </div>

      {/* Confirmation banner */}
      {!convo?.ExchangeCompleted && convo && (
        <div className="bg-indigo-50 border-b border-indigo-100 px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-sm text-ink-900">
            <p className="font-semibold">Confirm book exchange</p>
            <p className="text-ink-800 text-xs mt-0.5">
              Both users must confirm once the physical book has been handed over.
            </p>
            <div className="flex gap-3 mt-1.5 text-xs">
              <span className={`flex items-center gap-1 ${convo.OwnerConfirmed ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                {convo.OwnerConfirmed ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                Owner {convo.OwnerConfirmed ? 'confirmed' : 'pending'}
              </span>
              <span className={`flex items-center gap-1 ${convo.RequesterConfirmed ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                {convo.RequesterConfirmed ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                Requester {convo.RequesterConfirmed ? 'confirmed' : 'pending'}
              </span>
            </div>
          </div>
          {!iConfirmed ? (
            <button
              type="button"
              disabled={confirming}
              onClick={handleConfirm}
              className="shrink-0 flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              {confirming ? 'Confirming…' : 'I confirm exchange'}
            </button>
          ) : (
            <span className="shrink-0 flex items-center gap-1 text-sm text-emerald-700 font-semibold">
              <CheckCircle className="h-4 w-4" /> You confirmed
              {!otherConfirmed && <span className="text-slate-400 font-normal ml-1">· waiting for other user</span>}
            </span>
          )}
        </div>
      )}

      {/* Completed banner */}
      {convo?.ExchangeCompleted && (
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-3 flex items-center gap-2 text-emerald-800 text-sm font-medium">
          <CheckCircle className="h-4 w-4" />
          Exchange completed! "{bookTitle}" has been successfully exchanged and removed from the marketplace.
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-3">
        {loading ? (
          <p className="text-center text-ink-800 text-sm">Loading messages…</p>
        ) : messages.length === 0 ? (
          <p className="text-center text-ink-800 text-sm">No messages yet. Say hello!</p>
        ) : messages.map((msg) => {
          const isMe = msg.SenderID?._id === uid || msg.SenderID === uid;
          return (
            <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                isMe ? 'bg-accent-primary text-white rounded-br-sm' : 'bg-white text-ink-900 border border-parchment-200 rounded-bl-sm'
              }`}>
                {!isMe && <p className="text-xs font-semibold mb-1 text-accent-primary">{msg.SenderID?.Name}</p>}
                <p>{msg.Text}</p>
                <p className={`text-xs mt-1 ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="bg-white border-t border-parchment-200 px-4 py-3 flex gap-3 items-center">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 border border-parchment-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={sending || !text.trim()}
          className="bg-accent-primary text-white p-2.5 rounded-full hover:bg-accent-hover disabled:opacity-50 transition-colors"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
