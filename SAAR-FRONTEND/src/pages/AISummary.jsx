import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FileText, Download, Sparkles, Search } from 'lucide-react';
import { apiFetch, fileUrl } from '../lib/api';

export default function AISummary() {
  const location = useLocation();
  const preselect = location.state?.noteId;

  const [notes, setNotes] = useState([]);
  const [selectedId, setSelectedId] = useState(preselect || '');
  const [loadingList, setLoadingList] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    apiFetch('/api/notes', { skipAuth: true })
      .then((res) => {
        if (cancelled) return;
        if (res.success && Array.isArray(res.data)) {
          setNotes(res.data);
          if (preselect && res.data.some((n) => n._id === preselect)) {
            setSelectedId(preselect);
          } else if (res.data.length) {
            setSelectedId((prev) => (prev && res.data.some((n) => n._id === prev) ? prev : res.data[0]._id));
          }
        }
      })
      .catch(() => {
        if (!cancelled) setNotes([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingList(false);
      });
    return () => { cancelled = true; };
  }, [preselect]);

  const selected = notes.find((n) => n._id === selectedId);

  useEffect(() => {
    if (selected) {
      setNoteTitle(selected.Title || '');
    }
  }, [selected]);

  async function handleGenerate() {
    if (!selectedId) {
      setError('Select a note first.');
      return;
    }
    setError('');
    setIsGenerating(true);
    setSummaryText('');
    try {
      const res = await apiFetch(`/api/ai/summarize/${selectedId}`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      if (res.success && res.data?.summaryText) {
        setSummaryText(res.data.summaryText);
        setNoteTitle(res.data.noteTitle || noteTitle);
      } else {
        setError(res.message || 'Could not generate summary');
      }
    } catch (e) {
      setError(e.message || 'AI summary failed. Ensure GEMINI_API_KEY is set on the server.');
    } finally {
      setIsGenerating(false);
    }
  }

  const pdfSrc = selected ? fileUrl(selected.FileURL) : '';

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] overflow-hidden bg-parchment-100">

      <div className="w-full md:w-1/2 lg:w-3/5 border-r border-parchment-300 flex flex-col bg-parchment-200 min-h-[50vh] md:min-h-0">

        <div className="h-14 bg-slate-800 text-slate-300 flex items-center justify-between px-4 text-sm font-medium shadow-sm z-10 flex-wrap gap-2">
          <div className="flex items-center gap-4 min-w-0">
            <FileText className="h-5 w-5 text-accent-primary shrink-0" />
            <span className="truncate max-w-[200px] text-white">{selected?.Title || 'Select a note'}</span>
          </div>
          {pdfSrc && (
            <a href={pdfSrc} target="_blank" rel="noreferrer" className="text-accent-primary hover:text-white text-xs">
              Open in new tab
            </a>
          )}
        </div>

        <div className="flex-1 min-h-[400px] bg-parchment-200">
          {pdfSrc ? (
            <iframe title="PDF" src={pdfSrc} className="w-full h-full min-h-[400px] border-0 bg-white" />
          ) : (
            <div className="flex items-center justify-center h-full text-ink-800 p-8 text-center">
              {loadingList ? 'Loading notes…' : 'Choose a note from the list to preview the PDF.'}
            </div>
          )}
        </div>
      </div>

      <div className="w-full md:w-1/2 lg:w-2/5 bg-white flex flex-col min-h-0 shadow-lg z-20">

        <div className="h-auto px-6 py-4 border-b border-parchment-200 bg-indigo-50/50 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent-primary" />
            <h2 className="text-lg font-bold text-ink-900">SAAR AI Summary</h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-parchment-300 rounded-lg text-sm bg-white"
              disabled={loadingList || notes.length === 0}
            >
              <option value="">Select a note…</option>
              {notes.map((n) => (
                <option key={n._id} value={n._id}>{n.Title}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-sm">{error}</div>
          )}
          {isGenerating ? (
            <div className="h-full flex flex-col items-center justify-center text-ink-800 space-y-4 py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
              <p className="text-lg font-medium animate-pulse">Analyzing your PDF…</p>
            </div>
          ) : summaryText ? (
            <div className="space-y-4">
              <h3 className="text-accent-primary font-bold">{noteTitle}</h3>
              <div className="prose prose-sm max-w-none text-ink-900 whitespace-pre-wrap">{summaryText}</div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                <Sparkles className="h-10 w-10 text-accent-primary" />
              </div>
              <h3 className="text-xl font-bold text-ink-900">Summarize a lecture PDF</h3>
              <p className="text-ink-800 text-sm max-w-sm">
                Pick a note from the repository, then generate a summary. Requires a configured Gemini API key on the server.
              </p>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-parchment-200">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !selectedId}
            className="w-full flex justify-center items-center py-3 px-4 rounded-lg shadow-sm text-sm font-bold text-white bg-accent-primary hover:bg-accent-hover disabled:opacity-50 gap-2"
          >
            <Sparkles className="h-5 w-5" />
            {summaryText ? 'Regenerate summary' : 'Generate AI summary'}
          </button>
          {summaryText && (
            <button
              type="button"
              onClick={() => {
                const blob = new Blob([summaryText], { type: 'text/plain' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `${noteTitle || 'summary'}.txt`;
                a.click();
              }}
              className="mt-3 w-full flex justify-center items-center gap-2 py-2 text-sm text-accent-primary border border-indigo-200 rounded-lg"
            >
              <Download className="h-4 w-4" /> Download as text
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
