import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { UserCircle, FileText, Users, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { apiFetch, fileUrl } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useReveal } from '../hooks/useReveal';

export default function UserProfile() {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [activeTab, setActiveTab] = useState('notes');
  const [followers, setFollowers] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  useReveal('.reveal, .reveal-left, .reveal-scale', [data]);

  useEffect(() => {
    apiFetch(`/api/users/${id}`, { skipAuth: !isAuthenticated })
      .then((r) => {
        if (r.success) { setData(r.data); setFollowing(r.data.isFollowing); }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id, isAuthenticated]);

  async function loadFollowers() {
    if (loadingFollowers || followers.length > 0) return;
    setLoadingFollowers(true);
    try {
      const r = await apiFetch(`/api/users/${id}/followers`, { skipAuth: !isAuthenticated });
      if (r.success) setFollowers(r.data);
    } catch (e) {
      console.error('Failed to load followers:', e.message);
    } finally {
      setLoadingFollowers(false);
    }
  }

  async function loadFollowing() {
    if (loadingFollowing || followingList.length > 0) return;
    setLoadingFollowing(true);
    try {
      const r = await apiFetch(`/api/users/${id}/following`, { skipAuth: !isAuthenticated });
      if (r.success) setFollowingList(r.data);
    } catch (e) {
      console.error('Failed to load following:', e.message);
    } finally {
      setLoadingFollowing(false);
    }
  }

  async function toggleFollow() {
    if (!isAuthenticated) { toast('Log in to follow', 'error'); return; }
    setToggling(true);
    try {
      const r = await apiFetch(`/api/users/${id}/follow`, { method: 'POST', body: JSON.stringify({}) });
      setFollowing(r.data.following);
      setData((d) => ({ ...d, followersCount: d.followersCount + (r.data.following ? 1 : -1) }));
      toast(r.data.following ? 'Following!' : 'Unfollowed.');
    } catch (err) { toast(err.message, 'error'); }
    finally { setToggling(false); }
  }

  if (loading) return <div className="flex-1 flex items-center justify-center"><p className="text-ink-800">Loading…</p></div>;
  if (!data) return <div className="flex-1 flex items-center justify-center"><p className="text-ink-800">User not found.</p></div>;

  const { user: u, notes, followersCount, followingCount } = data;
  const isOwnProfile = user?._id === id;

  return (
    <div className="flex-1 bg-parchment-50 py-8 min-h-[calc(100vh-4rem)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">

        <div className="animate-fade-up bg-white rounded-2xl border border-parchment-200 shadow-sm p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
              {u.Avatar ? <img src={fileUrl(u.Avatar)} alt={u.Name} className="w-full h-full object-cover" /> : <UserCircle className="h-12 w-12 text-accent-primary" />}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-ink-900">{u.Name}</h1>
              <div className="flex flex-wrap gap-2 mt-1">
                {u.Branch && <span className="text-xs bg-parchment-100 text-ink-800 px-2 py-0.5 rounded-full">{u.Branch}</span>}
                {u.Year && <span className="text-xs bg-parchment-100 text-ink-800 px-2 py-0.5 rounded-full">Year {u.Year}</span>}
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${u.Role === 'Admin' ? 'bg-indigo-100 text-accent-primary' : 'bg-parchment-100 text-ink-900'}`}>{u.Role}</span>
              </div>
              {u.Bio && <p className="text-sm text-ink-800 mt-2 italic">"{u.Bio}"</p>}
              <div className="flex gap-4 mt-3 text-sm text-ink-800">
                <button 
                  onClick={() => { setActiveTab('followers'); loadFollowers(); }}
                  className={`hover:text-accent-primary transition-colors ${activeTab === 'followers' ? 'text-accent-primary font-semibold' : ''}`}
                >
                  <strong className="text-ink-900">{followersCount}</strong> followers
                </button>
                <button 
                  onClick={() => { setActiveTab('following'); loadFollowing(); }}
                  className={`hover:text-accent-primary transition-colors ${activeTab === 'following' ? 'text-accent-primary font-semibold' : ''}`}
                >
                  <strong className="text-ink-900">{followingCount}</strong> following
                </button>
                <button 
                  onClick={() => setActiveTab('notes')}
                  className={`hover:text-accent-primary transition-colors ${activeTab === 'notes' ? 'text-accent-primary font-semibold' : ''}`}
                >
                  <strong className="text-ink-900">{notes.length}</strong> notes
                </button>
              </div>
            </div>
            {!isOwnProfile && (
              <button onClick={toggleFollow} disabled={toggling}
                className={`shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all btn-glow ${following ? 'border border-parchment-300 text-ink-800 bg-white hover:bg-parchment-50' : 'bg-accent-primary text-white hover:bg-accent-hover'}`}>
                {toggling ? '…' : following ? 'Unfollow' : 'Follow'}
              </button>
            )}
            {isOwnProfile && (
              <Link to="/profile" className="shrink-0 px-5 py-2 rounded-full text-sm font-semibold border border-parchment-300 text-ink-800 bg-white hover:bg-parchment-50">
                Edit Profile
              </Link>
            )}
          </div>
        </div>

        {/* Content Tabs */}
        {activeTab === 'notes' && (
          <div className="reveal bg-white rounded-xl border border-parchment-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-parchment-200 flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent-primary" />
              <h2 className="font-bold text-ink-900">Uploaded Notes ({notes.length})</h2>
            </div>
            <div className="divide-y divide-parchment-100">
              {notes.length === 0 ? (
                <p className="p-6 text-sm text-ink-800">No notes uploaded yet.</p>
              ) : notes.map((n) => (
                <div key={n._id} className="px-6 py-4 flex justify-between items-center gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-ink-900 truncate">{n.Title}</p>
                    <p className="text-sm text-ink-800">{n.Subject} · Sem {n.Semester}</p>
                  </div>
                  <Link to={`/notes/${n._id}`} className="shrink-0 flex items-center gap-1 text-xs text-accent-primary hover:underline">
                    <ExternalLink className="h-3.5 w-3.5" /> View
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'followers' && (
          <div className="reveal bg-white rounded-xl border border-parchment-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-parchment-200 flex items-center gap-2">
              <Users className="h-5 w-5 text-accent-primary" />
              <h2 className="font-bold text-ink-900">Followers ({followersCount})</h2>
            </div>
            <div className="divide-y divide-parchment-100">
              {loadingFollowers ? (
                <p className="p-6 text-sm text-ink-800">Loading followers...</p>
              ) : followers.length === 0 ? (
                <p className="p-6 text-sm text-ink-800">No followers yet.</p>
              ) : followers.map((follower) => (
                <div key={follower._id} className="px-6 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                    {follower.Avatar ? (
                      <img src={fileUrl(follower.Avatar)} alt={follower.Name} className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle className="h-7 w-7 text-accent-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/user/${follower._id}`} className="font-medium text-ink-900 hover:text-accent-primary hover:underline block truncate">
                      {follower.Name}
                    </Link>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {follower.Branch && <span className="text-xs bg-parchment-100 text-ink-800 px-2 py-0.5 rounded-full">{follower.Branch}</span>}
                      {follower.Year && <span className="text-xs bg-parchment-100 text-ink-800 px-2 py-0.5 rounded-full">Year {follower.Year}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'following' && (
          <div className="reveal bg-white rounded-xl border border-parchment-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-parchment-200 flex items-center gap-2">
              <Users className="h-5 w-5 text-accent-primary" />
              <h2 className="font-bold text-ink-900">Following ({followingCount})</h2>
            </div>
            <div className="divide-y divide-parchment-100">
              {loadingFollowing ? (
                <p className="p-6 text-sm text-ink-800">Loading following...</p>
              ) : followingList.length === 0 ? (
                <p className="p-6 text-sm text-ink-800">Not following anyone yet.</p>
              ) : followingList.map((followedUser) => (
                <div key={followedUser._id} className="px-6 py-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                    {followedUser.Avatar ? (
                      <img src={fileUrl(followedUser.Avatar)} alt={followedUser.Name} className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle className="h-7 w-7 text-accent-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/user/${followedUser._id}`} className="font-medium text-ink-900 hover:text-accent-primary hover:underline block truncate">
                      {followedUser.Name}
                    </Link>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {followedUser.Branch && <span className="text-xs bg-parchment-100 text-ink-800 px-2 py-0.5 rounded-full">{followedUser.Branch}</span>}
                      {followedUser.Year && <span className="text-xs bg-parchment-100 text-ink-800 px-2 py-0.5 rounded-full">Year {followedUser.Year}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
