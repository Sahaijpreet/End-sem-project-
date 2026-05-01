import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useLocation } from 'react-router-dom';
import { FileText, Download, Sparkles, X, UploadCloud } from 'lucide-react';
import { apiFetch, fileUrl } from '../lib/api';
import { jsPDF } from 'jspdf';

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
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedPreviewUrl, setUploadedPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

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
    if (selected) setNoteTitle(selected.Title || '');
  }, [selected]);

  function handleFileUpload(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadedFile(f);
    setUploadedPreviewUrl(URL.createObjectURL(f));
    setSelectedId('');
    setSummaryText('');
    setError('');
    setNoteTitle(f.name);
  }

  function clearUpload() {
    setUploadedFile(null);
    setUploadedPreviewUrl('');
    setNoteTitle('');
    setSummaryText('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleGenerate() {
    if (!selectedId && !uploadedFile) { setError('Select a note or upload a file first.'); return; }
    setError('');
    setIsGenerating(true);
    setSummaryText('');
    try {
      let res;
      if (uploadedFile) {
        const fd = new FormData();
        fd.append('document', uploadedFile);
        res = await apiFetch('/api/ai/summarize-upload', { method: 'POST', body: fd });
      } else {
        res = await apiFetch(`/api/ai/summarize/${selectedId}`, { method: 'POST', body: JSON.stringify({}) });
      }
      if (res.success && res.data?.summaryText) {
        setSummaryText(res.data.summaryText);
        setNoteTitle(res.data.noteTitle || noteTitle);
      } else {
        setError(res.message || 'Could not generate summary');
      }
    } catch (e) {
      setError(e.message || 'AI summary failed.');
    } finally {
      setIsGenerating(false);
    }
  }

  const [blobUrl, setBlobUrl] = useState('');
  const [blobLoading, setBlobLoading] = useState(false);

  useEffect(() => {
    if (!selected?.FileURL) { setBlobUrl(''); return; }
    const ext = selected.FileURL.split('.').pop().toLowerCase();
    if (!['pdf','jpg','jpeg','png','webp','gif'].includes(ext)) { setBlobUrl(''); return; }
    setBlobLoading(true);
    setBlobUrl('');
    fetch(fileUrl(selected.FileURL))
      .then((r) => r.blob())
      .then((blob) => setBlobUrl(URL.createObjectURL(blob)))
      .catch(() => setBlobUrl(''))
      .finally(() => setBlobLoading(false));
    return () => setBlobUrl('');
  }, [selected]);

  const pdfSrc = uploadedPreviewUrl || blobUrl;
  const fileExt = uploadedFile ? uploadedFile.name.split('.').pop().toLowerCase()
    : selected?.FileURL?.split('.').pop().toLowerCase();
  const isImage = ['jpg','jpeg','png','webp','gif'].includes(fileExt);
  const isPdf = fileExt === 'pdf';

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-4rem)] overflow-hidden bg-parchment-100">

      <div className="w-full md:w-1/2 lg:w-3/5 border-r border-parchment-300 flex flex-col bg-parchment-200 min-h-[50vh] md:min-h-0">

        <div className="h-14 bg-slate-800 text-slate-300 flex items-center justify-between px-4 text-sm font-medium shadow-sm z-10 flex-wrap gap-2">
          <div className="flex items-center gap-4 min-w-0">
            <FileText className="h-5 w-5 text-accent-primary shrink-0" />
            <span className="truncate max-w-[200px] text-white">
              {uploadedFile ? uploadedFile.name : (selected?.Title || 'Select a note')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <label className="cursor-pointer flex items-center gap-1.5 text-xs text-accent-primary hover:text-white transition-colors">
              <UploadCloud className="h-4 w-4" />
              Upload file
              <input ref={fileInputRef} type="file" accept="application/pdf,image/*,.doc,.docx" className="hidden" onChange={handleFileUpload} />
            </label>
            {pdfSrc && (
              <a href={pdfSrc} target="_blank" rel="noreferrer" className="text-accent-primary hover:text-white text-xs">Open in new tab</a>
            )}
            {(selectedId || uploadedFile) && (
              <button type="button"
                onClick={() => { setSelectedId(''); setSummaryText(''); setError(''); clearUpload(); }}
                className="bg-red-500 hover:bg-red-600 text-white rounded-md p-1 transition-colors" title="Close">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-[400px] bg-parchment-200">
          {blobLoading ? (
            <div className="w-full h-full min-h-[400px] flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary" />
            </div>
          ) : pdfSrc ? (
            isPdf ? (
              <iframe title="preview" src={pdfSrc} className="w-full h-full min-h-[400px] border-0 bg-white" />
            ) : isImage ? (
              <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-parchment-100 p-4">
                <img src={pdfSrc} alt="preview" className="max-h-full max-w-full object-contain rounded-lg shadow" />
              </div>
            ) : (
              <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center gap-3 text-ink-800">
                <FileText className="h-12 w-12 text-slate-400" />
                <p className="text-sm font-medium">{uploadedFile?.name || selected?.Title}</p>
                <p className="text-xs text-slate-400">Preview not available for this file type</p>
                <a href={pdfSrc} target="_blank" rel="noreferrer"
                  className="text-xs text-accent-primary hover:underline">Open file ↗</a>
              </div>
            )
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 overflow-y-auto">
              {loadingList ? (
                <p className="text-ink-800">Loading notes…</p>
              ) : (
                <div className="w-full">
                  <p className="text-ink-900 font-semibold text-lg mb-4 text-center">Choose a note or upload a file</p>
                  {/* Upload drop zone */}
                  <label className="flex flex-col items-center justify-center w-full border-2 border-dashed border-parchment-300 hover:border-accent-primary rounded-xl p-6 mb-4 cursor-pointer bg-white transition-colors group">
                    <UploadCloud className="h-8 w-8 text-slate-400 group-hover:text-accent-primary mb-2 transition-colors" />
                    <p className="text-sm font-medium text-ink-900">Click to upload a PDF or image</p>
                    <p className="text-xs text-ink-800 mt-1">PDF, JPG, PNG, DOC supported</p>
                    <input ref={fileInputRef} type="file" accept="application/pdf,image/*,.doc,.docx" className="hidden" onChange={handleFileUpload} />
                  </label>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-parchment-200" />
                    <span className="text-xs text-slate-400">or pick from repository</span>
                    <div className="flex-1 h-px bg-parchment-200" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {notes.slice(0, 20).map((n) => (
                      <button key={n._id} type="button" onClick={() => { setSelectedId(n._id); clearUpload(); }}
                        className="text-left bg-white border border-parchment-200 rounded-xl px-3 py-3 hover:border-accent-primary hover:shadow-md transition-all group">
                        <p className="font-semibold text-ink-900 group-hover:text-accent-primary text-xs truncate">{n.Title}</p>
                        <p className="text-[11px] text-ink-800 mt-1 truncate">{n.Subject}</p>
                        <p className="text-[11px] text-slate-400">Sem {n.Semester}</p>
                      </button>
                    ))}
                    {notes.length === 0 && <p className="text-center text-ink-800 text-sm col-span-4">No notes available yet.</p>}
                  </div>
                </div>
              )}
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
              <div className="prose prose-sm max-w-none text-ink-900"><ReactMarkdown>{summaryText}</ReactMarkdown></div>
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

        <div className="p-4 bg-white border-t border-parchment-200 space-y-2">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || (!selectedId && !uploadedFile)}
            className="w-full flex justify-center items-center py-3 px-4 rounded-lg shadow-sm text-sm font-bold text-white bg-accent-primary hover:bg-accent-hover disabled:opacity-50 gap-2"
          >
            <Sparkles className="h-5 w-5" />
            {summaryText ? 'Regenerate summary' : 'Generate AI summary'}
          </button>
          {summaryText && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([summaryText], { type: 'text/plain' });
                  const a = document.createElement('a');
                  a.href = URL.createObjectURL(blob);
                  a.download = `${noteTitle || 'summary'}.txt`;
                  a.click();
                }}
                className="flex-1 flex justify-center items-center gap-2 py-2 text-sm text-accent-primary border border-indigo-200 rounded-lg hover:bg-indigo-50"
              >
                <Download className="h-4 w-4" /> Download TXT
              </button>
              <button
                type="button"
                onClick={() => {
                  const doc = new jsPDF();
                  const title = noteTitle || 'Summary';
                  doc.setFontSize(16);
                  doc.setFont('helvetica', 'bold');
                  doc.text(title, 15, 20);
                  doc.setFontSize(11);
                  doc.setFont('helvetica', 'normal');
                  const lines = doc.splitTextToSize(summaryText.replace(/[#*`]/g, ''), 180);
                  doc.text(lines, 15, 32);
                  doc.save(`${title}.pdf`);
                }}
                className="flex-1 flex justify-center items-center gap-2 py-2 text-sm text-accent-primary border border-indigo-200 rounded-lg hover:bg-indigo-50"
              >
                <FileText className="h-4 w-4" /> Download PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
