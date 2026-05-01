import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, ArrowLeft, User, Calendar, BookOpen, Sparkles, ExternalLink } from 'lucide-react';
import { apiFetch, fileUrl } from '../lib/api';
import { useReveal } from '../hooks/useReveal';
import StarRating from '../components/StarRating';
import Comments from '../components/Comments';

export default function NoteDetail() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  useReveal();

  useEffect(() => {
    apiFetch(`/api/notes/${id}`, { skipAuth: true })
      .then((r) => r.success && setNote(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  function handleDownload() {
    apiFetch(`/api/notes/${id}/download`, { method: 'POST', body: JSON.stringify({}) }).catch(() => {});
    window.open(fileUrl(note.FileURL), '_blank');
  }

  if (loading) return <div className="flex-1 flex items-center justify-center"><p className="text-ink-800">Loading…</p></div>;
  if (!note) return <div className="flex-1 flex items-center justify-center"><p className="text-ink-800">Note not found.</p></div>;

  return (
    <div className="flex-1 bg-parchment-50 py-8 min-h-[calc(100vh-4rem)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">

        <Link to="/notes" className="inline-flex items-center gap-2 text-sm text-ink-800 hover:text-accent-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Notes
        </Link>

        <div className="animate-fade-up bg-white rounded-2xl border border-parchment-200 shadow-sm overflow-hidden">
          {(() => {
            const href = fileUrl(note.FileURL);
            const isImage = note.FileURL && /\.(jpg|jpeg|png|webp|gif)$/i.test(note.FileURL);
            const isPdf = note.FileURL && note.FileURL.toLowerCase().endsWith('.pdf');
            if (note.CoverImage) return (
              <div className="h-52 w-full overflow-hidden">
                <img src={fileUrl(note.CoverImage)} alt="cover" className="w-full h-full object-cover" />
              </div>
            );
            if (isImage) return (
              <div className="h-52 w-full overflow-hidden bg-parchment-100">
                <img src={href} alt="preview" className="w-full h-full object-contain" />
              </div>
            );
            if (isPdf) return (
              <div className="h-72 w-full overflow-hidden border-b border-parchment-200">
                <iframe src={`${href}#page=1&toolbar=0&navpanes=0&scrollbar=0`} className="w-full h-full" title="PDF preview" />
              </div>
            );
            return null;
          })()}
          <div className="p-6">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-2.5 py-0.5 bg-indigo-100 text-accent-primary text-xs font-semibold rounded-full">{note.Subject}</span>
              <span className="px-2.5 py-0.5 bg-parchment-100 text-ink-800 text-xs font-semibold rounded-full">Semester {note.Semester}</span>
            </div>
            <h1 className="text-2xl font-bold text-ink-900 mb-4">{note.Title}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-ink-800 mb-4">
              <span className="flex items-center gap-1.5"><User className="h-4 w-4 text-slate-400" />{note.UploaderID?.Name || 'Student'}</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-slate-400" />{new Date(note.UploadDate).toLocaleDateString()}</span>
            </div>
            <StarRating resourceType="Note" resourceId={id} />
            <div className="flex flex-wrap gap-3 mt-6">
              <button onClick={handleDownload}
                className="flex items-center gap-2 px-5 py-2.5 bg-accent-primary text-white rounded-lg font-medium hover:bg-accent-hover transition-colors btn-glow">
                <ExternalLink className="h-4 w-4" /> Open PDF
              </button>
              <Link to="/ai-summary" state={{ noteId: id }}
                className="flex items-center gap-2 px-5 py-2.5 border border-parchment-300 rounded-lg text-sm font-medium text-ink-900 bg-white hover:bg-parchment-50 transition-colors">
                <Sparkles className="h-4 w-4 text-accent-primary" /> AI Summary
              </Link>
            </div>
          </div>
        </div>

        <div className="reveal bg-white rounded-2xl border border-parchment-200 shadow-sm p-6">
          <Comments resourceType="Note" resourceId={id} />
        </div>

      </div>
    </div>
  );
}
