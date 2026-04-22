import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, File, X, Info, ImagePlus } from 'lucide-react';
import { apiFetch } from '../lib/api';

export default function UploadPortal() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [semester, setSemester] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleCoverChange(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      setError('Cover must be JPG, PNG or WEBP.'); return;
    }
    setCoverImage(f);
    setCoverPreview(URL.createObjectURL(f));
  }

  const handleDrag = function (e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = function (e) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      if (f.type !== 'application/pdf') {
        setError('Only PDF files are allowed.');
        return;
      }
      setUploadedFile(f);
      setError('');
    }
  };

  const handleChange = function (e) {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      if (f.type !== 'application/pdf') {
        setError('Only PDF files are allowed.');
        return;
      }
      setUploadedFile(f);
      setError('');
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!uploadedFile || !title.trim() || !subject || !semester) {
      setError('Please fill title, subject, semester, and choose a PDF.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('document', uploadedFile);
      if (coverImage) fd.append('cover', coverImage);
      fd.append('Title', title.trim());
      fd.append('Subject', subject);
      fd.append('Semester', semester);
      await apiFetch('/api/notes', { method: 'POST', body: fd });
      navigate('/notes');
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 bg-parchment-50 py-12 min-h-[calc(100vh-4rem)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-ink-900">Contribute to the Community</h1>
          <p className="mt-3 text-lg text-ink-800 max-w-2xl mx-auto">
            Upload your class notes as a PDF. They will appear in the repository for other students.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-parchment-200 overflow-hidden">

          <div className="bg-indigo-50 border-b border-indigo-100 p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-accent-primary shrink-0 mt-0.5" />
            <div className="text-sm text-accent-primary">
              <strong className="block mb-1">Upload Guidelines</strong>
              PDF only (max 10MB on server). Tag clearly by subject and semester. Avoid copyrighted material without permission.
            </div>
          </div>

          {error && (
            <div className="mx-8 mt-6 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm">{error}</div>
          )}

          <div className="p-8">
            <form className="space-y-8" onSubmit={handleSubmit}>

              <div>
                <label className="block text-sm font-semibold text-ink-900 mb-3">Upload File (PDF)</label>
                {!uploadedFile ? (
                  <div
                    className={`relative border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-colors ${
                      dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-parchment-300 hover:border-indigo-400 bg-parchment-50 hover:bg-parchment-100'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleChange}
                      accept=".pdf,application/pdf"
                    />
                    <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                      <UploadCloud className="h-8 w-8 text-accent-primary" />
                    </div>
                    <p className="text-lg font-medium text-ink-900 mb-1">Click to upload, or drag and drop</p>
                    <p className="text-sm text-ink-800">PDF (max 10MB)</p>
                  </div>
                ) : (
                  <div className="bg-white border text-ink-900 rounded-xl p-4 flex items-center justify-between border-emerald-200 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                        <File className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium text-ink-900 truncate max-w-xs">{uploadedFile.name}</p>
                        <p className="text-sm text-ink-800 text-emerald-600/80 font-medium">
                          {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadedFile(null)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove file"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Cover image */}
              <div>
                <label className="block text-sm font-semibold text-ink-900 mb-3">Cover Image <span className="text-slate-400 font-normal">(optional)</span></label>
                <div className="flex items-center gap-4">
                  {coverPreview ? (
                    <div className="relative w-24 h-32 rounded-lg overflow-hidden border border-parchment-200 shadow-sm">
                      <img src={coverPreview} alt="cover" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => { setCoverImage(null); setCoverPreview(''); }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="w-24 h-32 rounded-lg border-2 border-dashed border-parchment-300 hover:border-indigo-400 flex flex-col items-center justify-center cursor-pointer bg-parchment-50 hover:bg-parchment-100 transition-colors">
                      <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleCoverChange} />
                      <ImagePlus className="h-6 w-6 text-slate-400 mb-1" />
                      <span className="text-xs text-slate-400">Add cover</span>
                    </label>
                  )}
                  <p className="text-xs text-ink-800">JPG, PNG or WEBP · max 5MB<br />Recommended: portrait ratio (3:4)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-parchment-200">
                <div className="md:col-span-2">
                  <label htmlFor="title" className="block text-sm font-semibold text-ink-900 mb-2">Title</label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-parchment-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow text-ink-900 shadow-sm"
                    placeholder="e.g. Linear Algebra Midterm Formula Sheet"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-ink-900 mb-2">Subject</label>
                  <select
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-parchment-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow text-ink-900 bg-white shadow-sm appearance-none"
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Economics">Economics</option>
                    <option value="History">History</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="semester" className="block text-sm font-semibold text-ink-900 mb-2">Semester</label>
                  <select
                    id="semester"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-parchment-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow text-ink-900 bg-white shadow-sm appearance-none"
                    required
                  >
                    <option value="">Select a semester</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={String(s)}>Semester {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-6 flex items-center justify-end gap-4 border-t border-parchment-200">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 border border-parchment-300 rounded-lg text-ink-800 font-medium hover:bg-parchment-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!uploadedFile || loading}
                  className={`px-8 py-3 rounded-lg text-white font-semibold transition-all shadow-sm ${
                    uploadedFile && !loading
                      ? 'bg-accent-primary hover:bg-accent-hover shadow-md hover:shadow-lg'
                      : 'bg-indigo-300 cursor-not-allowed'
                  }`}
                >
                  {loading ? 'Publishing…' : 'Publish Notes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
