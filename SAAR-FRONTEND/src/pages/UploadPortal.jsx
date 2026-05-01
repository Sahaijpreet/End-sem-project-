import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, File, X, Info, ImagePlus, FileText, BookOpen, BookMarked } from 'lucide-react';
import { apiFetch } from '../lib/api';

const TABS = [
  { id: 'note', label: 'Notes', icon: FileText },
  { id: 'pyq',  label: 'PYQ',   icon: BookMarked },
  { id: 'book', label: 'Book',  icon: BookOpen },
];

const SEMESTERS = [1,2,3,4,5,6,7,8];
const EXAM_TYPES = ['End Semester', 'Mid Semester', 'Quiz', 'Other'];

function FilePreview({ file }) {
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!previewUrl) return null;

  const isImage = file.type.startsWith('image/');
  const isPdf = file.type === 'application/pdf';

  if (isImage) return (
    <div className="w-full h-64 rounded-xl overflow-hidden border border-parchment-200 bg-parchment-50">
      <img src={previewUrl} alt="preview" className="w-full h-full object-contain" />
    </div>
  );

  if (isPdf) return (
    <div className="w-full h-64 rounded-xl overflow-hidden border border-parchment-200">
      <iframe src={`${previewUrl}#page=1&toolbar=0&navpanes=0&scrollbar=0`} className="w-full h-full" title="PDF preview" />
    </div>
  );

  return (
    <div className="w-full h-32 rounded-xl border border-parchment-200 bg-parchment-50 flex flex-col items-center justify-center gap-2">
      <File className="h-10 w-10 text-slate-400" />
      <p className="text-sm text-ink-800 truncate max-w-xs px-4">{file.name}</p>
      <p className="text-xs text-slate-400">Preview not available for this file type</p>
    </div>
  );
}

function FileDrop({ file, onFile, onClear, accept = '*/*', hint = 'PDF, Word, Image, PPT (max 25MB)' }) {
  const [drag, setDrag] = useState(false);

  function onDrag(e) {
    e.preventDefault(); e.stopPropagation();
    setDrag(e.type === 'dragenter' || e.type === 'dragover');
  }
  function onDrop(e) {
    e.preventDefault(); e.stopPropagation();
    setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) onFile(f);
  }
  function onChange(e) {
    const f = e.target.files?.[0];
    if (f) onFile(f);
  }

  if (file) return (
    <div className="space-y-3">
      <FilePreview file={file} />
      <div className="bg-white border border-emerald-200 rounded-xl p-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
            <File className="h-4 w-4" />
          </div>
          <div>
            <p className="font-medium text-ink-900 text-sm truncate max-w-xs">{file.name}</p>
            <p className="text-xs text-emerald-600 font-medium">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
          </div>
        </div>
        <button type="button" onClick={onClear} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={`relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-colors ${drag ? 'border-indigo-500 bg-indigo-50' : 'border-parchment-300 hover:border-indigo-400 bg-parchment-50 hover:bg-parchment-100'}`}
      onDragEnter={onDrag} onDragLeave={onDrag} onDragOver={onDrag} onDrop={onDrop}
    >
      <input type="file" accept={accept} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={onChange} />
      <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
        <UploadCloud className="h-8 w-8 text-accent-primary" />
      </div>
      <p className="text-lg font-medium text-ink-900 mb-1">Click to upload, or drag and drop</p>
      <p className="text-sm text-ink-800">{hint}</p>
    </div>
  );
}

function CoverPicker({ preview, onChange, onClear }) {
  if (preview) return (
    <div className="relative w-24 h-32 rounded-lg overflow-hidden border border-parchment-200 shadow-sm">
      <img src={preview} alt="cover" className="w-full h-full object-cover" />
      <button type="button" onClick={onClear} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5">
        <X className="h-3 w-3" />
      </button>
    </div>
  );
  return (
    <label className="w-24 h-32 rounded-lg border-2 border-dashed border-parchment-300 hover:border-indigo-400 flex flex-col items-center justify-center cursor-pointer bg-parchment-50 hover:bg-parchment-100 transition-colors">
      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onChange} />
      <ImagePlus className="h-6 w-6 text-slate-400 mb-1" />
      <span className="text-xs text-slate-400">Add cover</span>
    </label>
  );
}

const inputCls = 'w-full px-4 py-3 rounded-lg border border-parchment-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow text-ink-900 shadow-sm bg-white appearance-none';

export default function UploadPortal() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('note');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Note state
  const [noteFile, setNoteFile] = useState(null);
  const [noteCover, setNoteCover] = useState(null);
  const [noteCoverPreview, setNoteCoverPreview] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteSubject, setNoteSubject] = useState('');
  const [noteSemester, setNoteSemester] = useState('');

  // PYQ state
  const [pyqFile, setPyqFile] = useState(null);
  const [pyqSubject, setPyqSubject] = useState('');
  const [pyqDegree, setPyqDegree] = useState('');
  const [pyqSemester, setPyqSemester] = useState('');
  const [pyqYear, setPyqYear] = useState('');
  const [pyqExamType, setPyqExamType] = useState('End Semester');

  // Book state
  const [bookCover, setBookCover] = useState(null);
  const [bookCoverPreview, setBookCoverPreview] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [bookSubject, setBookSubject] = useState('');

  function handleCover(file, setFile, setPreview) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Cover must be JPG, PNG or WEBP.'); return;
    }
    setFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function validateFile(file) {
    if (file.size > 25 * 1024 * 1024) { setError('File must be under 25MB.'); return false; }
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (tab === 'note') {
        if (!noteFile || !noteTitle.trim() || !noteSubject.trim() || !noteSemester)
          throw new Error('Please fill all fields and choose a PDF.');
        const fd = new FormData();
        fd.append('document', noteFile);
        if (noteCover) fd.append('cover', noteCover);
        fd.append('Title', noteTitle.trim());
        fd.append('Subject', noteSubject.trim());
        fd.append('Semester', noteSemester);
        await apiFetch('/api/notes', { method: 'POST', body: fd });
        navigate('/notes');

      } else if (tab === 'pyq') {
        if (!pyqFile || !pyqSubject.trim() || !pyqSemester || !pyqYear)
          throw new Error('Please fill all fields and choose a file.');
        const fd = new FormData();
        fd.append('document', pyqFile);
        fd.append('Title', pyqSubject.trim());
        fd.append('Subject', pyqSubject.trim());
        fd.append('Degree', pyqDegree.trim());
        fd.append('Semester', pyqSemester);
        fd.append('Year', pyqYear);
        fd.append('ExamType', pyqExamType);
        await apiFetch('/api/pyqs', { method: 'POST', body: fd });
        navigate('/pyqs');

      } else {
        if (!bookTitle.trim() || !bookAuthor.trim() || !bookSubject.trim())
          throw new Error('Please fill Title, Author and Subject.');
        const fd = new FormData();
        fd.append('Title', bookTitle.trim());
        fd.append('Author', bookAuthor.trim());
        fd.append('Subject', bookSubject.trim());
        if (bookCover) fd.append('cover', bookCover);
        await apiFetch('/api/books', { method: 'POST', body: fd });
        navigate('/book-exchange');
      }
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  const submitLabel = { note: 'Publish Notes', pyq: 'Publish PYQ', book: 'List Book' };
  const canSubmit = tab === 'note' ? !!noteFile : tab === 'pyq' ? !!pyqFile : true;

  return (
    <div className="flex-1 bg-parchment-50 py-12 min-h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-ink-900">Contribute to the Community</h1>
          <p className="mt-3 text-lg text-ink-800 max-w-2xl mx-auto">
            Upload notes, past year questions, or list a book for exchange.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" onClick={() => { setTab(id); setError(''); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${tab === id ? 'bg-accent-primary text-white shadow-sm' : 'bg-white border border-parchment-200 text-ink-800 hover:bg-parchment-50'}`}>
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-parchment-200 overflow-hidden">
          <div className="bg-indigo-50 border-b border-indigo-100 p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-accent-primary shrink-0 mt-0.5" />
            <div className="text-sm text-accent-primary">
              <strong className="block mb-1">Upload Guidelines</strong>
              {tab === 'book'
                ? 'List a physical book you own and are willing to exchange with other students.'
                : 'Any file up to 25MB. Tag clearly by subject and semester. Avoid copyrighted material without permission.'}
            </div>
          </div>

          {error && (
            <div className="mx-8 mt-6 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm">{error}</div>
          )}

          <div className="p-8">
            <form className="space-y-8" onSubmit={handleSubmit}>

              {/* ── NOTES ── */}
              {tab === 'note' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-ink-900 mb-3">Upload File (PDF)</label>
                    <FileDrop file={noteFile}
                      onFile={(f) => { if (validateFile(f)) { setNoteFile(f); setError(''); } }}
                      onClear={() => setNoteFile(null)} />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-ink-900 mb-3">Cover Image <span className="text-slate-400 font-normal">(optional)</span></label>
                    <div className="flex items-center gap-4">
                      <CoverPicker preview={noteCoverPreview}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCover(f, setNoteCover, setNoteCoverPreview); }}
                        onClear={() => { setNoteCover(null); setNoteCoverPreview(''); }} />
                      <p className="text-xs text-ink-800">JPG, PNG or WEBP</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-parchment-200">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-ink-900 mb-2">Title</label>
                      <input className={inputCls} value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} placeholder="e.g. Linear Algebra Formula Sheet" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-ink-900 mb-2">Subject</label>
                      <input className={inputCls} value={noteSubject} onChange={(e) => setNoteSubject(e.target.value)} placeholder="e.g. Data Structures, Thermodynamics…" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-ink-900 mb-2">Semester</label>
                      <select className={inputCls} value={noteSemester} onChange={(e) => setNoteSemester(e.target.value)} required>
                        <option value="">Select a semester</option>
                        {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* ── PYQ ── */}
              {tab === 'pyq' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-ink-900 mb-3">Upload File</label>
                    <FileDrop file={pyqFile}
                      onFile={(f) => { if (validateFile(f)) { setPyqFile(f); setError(''); } }}
                      onClear={() => setPyqFile(null)} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-parchment-200">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-ink-900 mb-2">Subject</label>
                      <input className={inputCls} value={pyqSubject} onChange={(e) => setPyqSubject(e.target.value)} placeholder="e.g. Operating Systems, Data Structures…" required />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-ink-900 mb-2">Degree <span className="text-slate-400 font-normal">(optional)</span></label>
                      <input className={inputCls} value={pyqDegree} onChange={(e) => setPyqDegree(e.target.value)} placeholder="e.g. B.Tech, BCA, MCA, MBA…" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-ink-900 mb-2">Exam Year</label>
                      <input className={inputCls} type="number" min="2000" max={new Date().getFullYear()} value={pyqYear} onChange={(e) => setPyqYear(e.target.value)} placeholder="e.g. 2023" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-ink-900 mb-2">Semester</label>
                      <select className={inputCls} value={pyqSemester} onChange={(e) => setPyqSemester(e.target.value)} required>
                        <option value="">Select a semester</option>
                        {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-ink-900 mb-2">Exam Type</label>
                      <select className={inputCls} value={pyqExamType} onChange={(e) => setPyqExamType(e.target.value)}>
                        {EXAM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* ── BOOK ── */}
              {tab === 'book' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-ink-900 mb-3">Cover Image <span className="text-slate-400 font-normal">(optional)</span></label>
                    <div className="flex items-center gap-4">
                      <CoverPicker preview={bookCoverPreview}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCover(f, setBookCover, setBookCoverPreview); }}
                        onClear={() => { setBookCover(null); setBookCoverPreview(''); }} />
                      <p className="text-xs text-ink-800">JPG, PNG or WEBP</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-parchment-200">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-ink-900 mb-2">Book Title</label>
                      <input className={inputCls} value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} placeholder="e.g. Introduction to Algorithms" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-ink-900 mb-2">Author</label>
                      <input className={inputCls} value={bookAuthor} onChange={(e) => setBookAuthor(e.target.value)} placeholder="e.g. Cormen, Leiserson" required />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-ink-900 mb-2">Subject</label>
                      <input className={inputCls} value={bookSubject} onChange={(e) => setBookSubject(e.target.value)} placeholder="e.g. Algorithms, Physics" required />
                    </div>
                  </div>
                </>
              )}

              <div className="pt-6 flex items-center justify-end gap-4 border-t border-parchment-200">
                <button type="button" onClick={() => navigate(-1)}
                  className="px-6 py-3 border border-parchment-300 rounded-lg text-ink-800 font-medium hover:bg-parchment-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={!canSubmit || loading}
                  className={`px-8 py-3 rounded-lg text-white font-semibold transition-all shadow-sm ${canSubmit && !loading ? 'bg-accent-primary hover:bg-accent-hover shadow-md' : 'bg-indigo-300 cursor-not-allowed'}`}>
                  {loading ? 'Publishing…' : submitLabel[tab]}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
