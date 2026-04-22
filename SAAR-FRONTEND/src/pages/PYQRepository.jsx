import { useEffect, useMemo, useState } from 'react';
import { Search, Filter, ThumbsUp, ChevronDown, BookMarked, UploadCloud, X, File, Download, Bookmark, BookmarkCheck, MessageSquare } from 'lucide-react';
import { apiFetch, fileUrl } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useReveal } from '../hooks/useReveal';
import StarRating from '../components/StarRating';
import Comments from '../components/Comments';

const SUBJECTS = ['Computer Science', 'Physics', 'Chemistry', 'Mathematics', 'Economics', 'History', 'Biology', 'Other'];
const EXAM_TYPES = ['Mid Semester', 'End Semester', 'Quiz', 'Other'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);

export default function PYQRepository() {
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [pyqs, setPyqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubjects, setFilterSubjects] = useState(new Set());
  const [filterSemesters, setFilterSemesters] = useState(new Set());
  const [filterExamTypes, setFilterExamTypes] = useState(new Set());
  const [likingId, setLikingId] = useState(null);
  const [bookmarks, setBookmarks] = useState(new Set());
  const [activeComment, setActiveComment] = useState(null);

  // Upload modal state
  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [semester, setSemester] = useState('');
  const [year, setYear] = useState('');
  const [examType, setExamType] = useState('End Semester');
  const [uploading, setUploading] = useState(false);

  useReveal('.reveal, .reveal-left, .reveal-scale', [pyqs]);

  async function loadPYQs() {
    setLoading(true);
    try {
      const fetches = [apiFetch('/api/pyqs', { skipAuth: true })];
      if (isAuthenticated) fetches.push(apiFetch('/api/auth/bookmarks'));
      const [res, bmRes] = await Promise.all(fetches);
      setPyqs(res.success && Array.isArray(res.data) ? res.data : []);
      if (bmRes?.success) setBookmarks(new Set(bmRes.data.pyqs?.map((p) => p._id) || []));
    } catch { setPyqs([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadPYQs(); }, [isAuthenticated]);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return pyqs.filter((p) => {
      const matchQ = !q || p.Title.toLowerCase().includes(q) || p.Subject.toLowerCase().includes(q);
      const matchSub = filterSubjects.size === 0 || filterSubjects.has(p.Subject);
      const matchSem = filterSemesters.size === 0 || filterSemesters.has(String(p.Semester));
      const matchExam = filterExamTypes.size === 0 || filterExamTypes.has(p.ExamType);
      return matchQ && matchSub && matchSem && matchExam;
    });
  }, [pyqs, searchTerm, filterSubjects, filterSemesters, filterExamTypes]);

  function toggle(setter, val) {
    setter((prev) => {
      const next = new Set(prev);
      next.has(val) ? next.delete(val) : next.add(val);
      return next;
    });
  }

  async function handleLike(id) {
    if (!isAuthenticated) { toast('Log in to like PYQs.', 'error'); return; }
    setLikingId(id);
    try {
      const res = await apiFetch(`/api/pyqs/${id}/like`, { method: 'POST', body: JSON.stringify({}) });
      setPyqs((prev) => prev.map((p) => p._id === id ? { ...p, Likes: Array(res.data.likes).fill(null), _liked: res.data.liked } : p));
    } catch (e) { toast(e.message, 'error'); }
    finally { setLikingId(null); }
  }

  async function handleBookmark(id) {
    if (!isAuthenticated) { toast('Log in to bookmark.', 'error'); return; }
    try {
      const res = await apiFetch(`/api/auth/bookmarks/PYQ/${id}`, { method: 'POST', body: JSON.stringify({}) });
      setBookmarks((prev) => { const n = new Set(prev); res.data.bookmarked ? n.add(id) : n.delete(id); return n; });
      toast(res.data.bookmarked ? 'Bookmarked!' : 'Bookmark removed.');
    } catch (e) { toast(e.message, 'error'); }
  }

  function handleDownload(id, href) {
    apiFetch(`/api/pyqs/${id}/download`, { method: 'POST', body: JSON.stringify({}) }).catch(() => {});
    window.open(href, '_blank');
  }

  function handleDrag(e) {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  }

  function handleDrop(e) {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f?.type !== 'application/pdf') { toast('Only PDF files allowed.', 'error'); return; }
    setFile(f);
  }

  function handleFileChange(e) {
    const f = e.target.files?.[0];
    if (f?.type !== 'application/pdf') { toast('Only PDF files allowed.', 'error'); return; }
    setFile(f);
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file || !title.trim() || !subject || !semester || !year) {
      toast('Please fill all fields and choose a PDF.', 'error'); return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('document', file);
      fd.append('Title', title.trim());
      fd.append('Subject', subject);
      fd.append('Semester', semester);
      fd.append('Year', year);
      fd.append('ExamType', examType);
      await apiFetch('/api/pyqs', { method: 'POST', body: fd });
      toast('PYQ uploaded successfully!');
      setUploadOpen(false);
      setFile(null); setTitle(''); setSubject(''); setSemester(''); setYear(''); setExamType('End Semester');
      await loadPYQs();
    } catch (err) { toast(err.message || 'Upload failed', 'error'); }
    finally { setUploading(false); }
  }

  return (
    <div className="flex-1 bg-parchment-50 min-h-[calc(100vh-4rem)] flex flex-col md:flex-row">

      {/* Sidebar filters */}
      <aside className="w-full md:w-64 lg:w-72 bg-white border-r border-parchment-200 flex-shrink-0">
        <div className="p-6 sticky top-0 max-h-screen overflow-y-auto">
          <div className="flex items-center gap-2 mb-6 text-ink-900">
            <Filter className="h-5 w-5" />
            <h2 className="text-lg font-bold">Filters</h2>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-ink-900 mb-3 flex justify-between items-center">
              Subject <ChevronDown className="h-4 w-4 text-slate-400" />
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {SUBJECTS.map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={filterSubjects.has(s)} onChange={() => toggle(setFilterSubjects, s)}
                    className="rounded border-parchment-300 text-accent-primary focus:ring-indigo-500" />
                  <span className="text-sm text-ink-800">{s}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-ink-900 mb-3 flex justify-between items-center">
              Semester <ChevronDown className="h-4 w-4 text-slate-400" />
            </h3>
            <div className="space-y-2">
              {['1','2','3','4','5','6','7','8'].map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={filterSemesters.has(s)} onChange={() => toggle(setFilterSemesters, s)}
                    className="rounded border-parchment-300 text-accent-primary focus:ring-indigo-500" />
                  <span className="text-sm text-ink-800">Semester {s}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-semibold text-ink-900 mb-3 flex justify-between items-center">
              Exam Type <ChevronDown className="h-4 w-4 text-slate-400" />
            </h3>
            <div className="space-y-2">
              {EXAM_TYPES.map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={filterExamTypes.has(t)} onChange={() => toggle(setFilterExamTypes, t)}
                    className="rounded border-parchment-300 text-accent-primary focus:ring-indigo-500" />
                  <span className="text-sm text-ink-800">{t}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-ink-900 flex items-center gap-2">
              <BookMarked className="h-6 w-6 text-accent-primary" /> PYQ Repository
            </h1>
            <p className="text-ink-800 text-sm mt-1">Browse previous year question papers shared by peers.</p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-parchment-300 rounded-lg text-sm bg-white focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => isAuthenticated ? setUploadOpen(true) : toast('Log in to upload PYQs.', 'error')}
              className="flex items-center gap-2 bg-accent-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-accent-hover transition-all shadow-sm whitespace-nowrap"
            >
              <UploadCloud className="h-4 w-4" /> Upload PYQ
            </button>
          </div>
        </div>

        <p className="text-sm text-ink-800 mb-6">{loading ? 'Loading…' : `Showing ${filtered.length} results`}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {!loading && filtered.length === 0 && (
            <p className="text-ink-800 col-span-full">No PYQs found. Be the first to upload one!</p>
          )}
          {filtered.map((pyq, idx) => {
            const pdfHref = fileUrl(pyq.FileURL);
            return (
              <div key={pyq._id} className={`reveal delay-${Math.min(idx * 100, 500)} card-hover bg-white rounded-xl shadow-sm border border-parchment-200 overflow-hidden flex flex-col`}>
                <div className="p-5 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-accent-primary">
                      {pyq.Subject}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                      pyq.ExamType === 'End Semester' ? 'bg-rose-100 text-rose-700' :
                      pyq.ExamType === 'Mid Semester' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>{pyq.ExamType}</span>
                  </div>
                  <h3 className="text-lg font-bold text-ink-900 mb-2 line-clamp-2">{pyq.Title}</h3>
                  <div className="flex items-center gap-3 text-sm text-ink-800">
                    <span>Sem {pyq.Semester}</span>
                    <span>·</span>
                    <span>{pyq.Year}</span>
                  </div>
                  <p className="text-xs text-ink-800 mt-3">By {uploader}</p>
                </div>
                <div className="px-5 py-3">
                  <StarRating resourceType="PYQ" resourceId={pyq._id} />
                  <div className="flex gap-3 mt-1 text-xs text-ink-800">
                    <span>{pyq.Downloads ?? 0} downloads</span>
                    <span>{pyq.Likes?.length ?? 0} likes</span>
                  </div>
                </div>
                <div className="bg-parchment-50 px-5 py-3 border-t border-parchment-200 flex gap-1.5 flex-wrap">
                  <button onClick={() => handleDownload(pyq._id, fileUrl(pyq.FileURL))}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium rounded-lg text-white bg-accent-primary hover:bg-accent-hover transition-colors">
                    <Download className="h-4 w-4" /> Open
                  </button>
                  <button type="button" disabled={likingId === pyq._id} onClick={() => handleLike(pyq._id)}
                    className={`flex items-center justify-center gap-1 py-2 px-3 border rounded-lg text-sm font-medium transition-colors ${
                      pyq._liked ? 'bg-indigo-100 border-indigo-300 text-accent-primary' : 'border-parchment-300 text-ink-800 bg-white hover:bg-parchment-50'
                    }`}>
                    <ThumbsUp className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => handleBookmark(pyq._id)}
                    className={`flex items-center justify-center py-2 px-3 border rounded-lg text-sm transition-colors ${
                      bookmarks.has(pyq._id) ? 'bg-violet-100 border-violet-300 text-violet-600' : 'border-parchment-300 text-ink-800 bg-white hover:bg-parchment-50'
                    }`}>
                    {bookmarks.has(pyq._id) ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                  </button>
                  <button type="button" onClick={() => setActiveComment(activeComment === pyq._id ? null : pyq._id)}
                    className="flex items-center justify-center py-2 px-3 border border-parchment-300 rounded-lg text-sm text-ink-800 bg-white hover:bg-parchment-50">
                    <MessageSquare className="h-4 w-4" />
                  </button>
                </div>
                {activeComment === pyq._id && (
                  <div className="px-4 pb-4 border-t border-parchment-100">
                    <div className="flex justify-end pt-2">
                      <button onClick={() => setActiveComment(null)} className="text-slate-400 hover:text-ink-900"><X className="h-4 w-4" /></button>
                    </div>
                    <Comments resourceType="PYQ" resourceId={pyq._id} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Upload modal */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-ink-900">Upload PYQ</h2>
              <button type="button" onClick={() => setUploadOpen(false)} className="text-slate-400 hover:text-ink-900"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleUpload} className="space-y-4">
              {/* File drop zone */}
              {!file ? (
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-colors ${
                    dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-parchment-300 hover:border-indigo-400 bg-parchment-50'
                  }`}
                  onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                >
                  <input type="file" accept=".pdf,application/pdf" onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                  <UploadCloud className="h-8 w-8 text-accent-primary mb-2" />
                  <p className="text-sm font-medium text-ink-900">Click or drag & drop PDF</p>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <div className="flex items-center gap-3">
                    <File className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-medium text-ink-900 truncate max-w-xs">{file.name}</span>
                  </div>
                  <button type="button" onClick={() => setFile(null)} className="text-slate-400 hover:text-red-500"><X className="h-4 w-4" /></button>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-ink-900 mb-1">Title</label>
                <input required value={title} onChange={(e) => setTitle(e.target.value)}
                  className="w-full border border-parchment-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Data Structures End Sem 2023" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-ink-900 mb-1">Subject</label>
                  <select required value={subject} onChange={(e) => setSubject(e.target.value)}
                    className="w-full border border-parchment-300 rounded-lg px-3 py-2 text-sm bg-white">
                    <option value="">Select</option>
                    {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-900 mb-1">Semester</label>
                  <select required value={semester} onChange={(e) => setSemester(e.target.value)}
                    className="w-full border border-parchment-300 rounded-lg px-3 py-2 text-sm bg-white">
                    <option value="">Select</option>
                    {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={s}>Sem {s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-900 mb-1">Year</label>
                  <select required value={year} onChange={(e) => setYear(e.target.value)}
                    className="w-full border border-parchment-300 rounded-lg px-3 py-2 text-sm bg-white">
                    <option value="">Select</option>
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-900 mb-1">Exam Type</label>
                  <select value={examType} onChange={(e) => setExamType(e.target.value)}
                    className="w-full border border-parchment-300 rounded-lg px-3 py-2 text-sm bg-white">
                    {EXAM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setUploadOpen(false)}
                  className="px-4 py-2 border border-parchment-300 rounded-lg text-sm text-ink-800">Cancel</button>
                <button type="submit" disabled={uploading}
                  className="px-4 py-2 bg-accent-primary text-white rounded-lg text-sm font-semibold disabled:opacity-50">
                  {uploading ? 'Uploading…' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
