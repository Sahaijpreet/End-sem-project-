import { useEffect, useRef, useState } from 'react';
import { fileUrl } from '../lib/api';

const SUBJECT_COLORS = {
  'Computer Science': { bg: '#e0e7ff', accent: '#4f46e5', emoji: '💻' },
  'Physics':          { bg: '#fef3c7', accent: '#d97706', emoji: '⚛️' },
  'Chemistry':        { bg: '#d1fae5', accent: '#059669', emoji: '⚗️' },
  'Mathematics':      { bg: '#ede9fe', accent: '#7c3aed', emoji: '📐' },
  'Economics':        { bg: '#fce7f3', accent: '#db2777', emoji: '📊' },
  'History':          { bg: '#fef9c3', accent: '#ca8a04', emoji: '📜' },
  'Biology':          { bg: '#dcfce7', accent: '#16a34a', emoji: '🧬' },
};

const blobCache = new Map();
const pdfThumbCache = new Map();

function getImageUrl(fileURL, coverImage) {
  if (coverImage) return fileUrl(coverImage);
  if (!fileURL) return null;
  const ext = fileURL.split('.').pop().toLowerCase();
  if (['jpg','jpeg','png','webp','gif'].includes(ext)) return fileUrl(fileURL);
  return null;
}

function isPdf(fileURL) {
  return fileURL?.split('.').pop().toLowerCase() === 'pdf';
}

export default function PdfPreview({ fileURL, coverImage, subject, title, className = 'w-full h-full' }) {
  const imageUrl = getImageUrl(fileURL, coverImage);
  const [imgSrc, setImgSrc] = useState(() => (imageUrl && blobCache.get(imageUrl)) || '');
  const [pdfThumb, setPdfThumb] = useState(() => (fileURL && pdfThumbCache.get(fileURL)) || '');
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);

  // Load cover/image
  useEffect(() => {
    if (!imageUrl) return;
    if (blobCache.has(imageUrl)) { setImgSrc(blobCache.get(imageUrl)); return; }
    let cancelled = false;
    const load = () => {
      fetch(imageUrl).then(r => r.blob()).then(blob => {
        if (cancelled) return;
        const url = URL.createObjectURL(blob);
        blobCache.set(imageUrl, url);
        setImgSrc(url);
      }).catch(() => {});
    };
    const el = containerRef.current;
    const rect = el?.getBoundingClientRect();
    if (!el || (rect && rect.top < window.innerHeight + 200)) { load(); return; }
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect(); load();
    }, { rootMargin: '200px' });
    observer.observe(el);
    return () => { cancelled = true; observer.disconnect(); };
  }, [imageUrl]);

  // Render PDF first page to canvas thumbnail
  useEffect(() => {
    if (imageUrl || !fileURL || !isPdf(fileURL)) return;
    if (pdfThumbCache.has(fileURL)) { setPdfThumb(pdfThumbCache.get(fileURL)); return; }

    let cancelled = false;
    const render = async () => {
      try {
        setLoading(true);
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url
        ).toString();

        const res = await fetch(fileUrl(fileURL));
        const buf = await res.arrayBuffer();
        if (cancelled) return;

        const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
        const page = await pdf.getPage(1);
        if (cancelled) return;

        const viewport = page.getViewport({ scale: 1 });
        const scale = 300 / viewport.width;
        const scaled = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = scaled.width;
        canvas.height = scaled.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport: scaled }).promise;
        if (cancelled) return;

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        pdfThumbCache.set(fileURL, dataUrl);
        setPdfThumb(dataUrl);
      } catch {
        // silently fail — placeholder will show
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    const el = containerRef.current;
    const rect = el?.getBoundingClientRect();
    if (!el || (rect && rect.top < window.innerHeight + 200)) { render(); return; }
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect(); render();
    }, { rootMargin: '200px' });
    observer.observe(el);
    return () => { cancelled = true; observer.disconnect(); };
  }, [fileURL, imageUrl]);

  // Show cover image or image file
  if (imageUrl) {
    return (
      <div ref={containerRef} className={`${className} bg-parchment-100 overflow-hidden`}>
        {imgSrc
          ? <img src={imgSrc} alt="preview" className="w-full h-full object-cover object-top" />
          : <div className="w-full h-full animate-pulse bg-parchment-200" />}
      </div>
    );
  }

  // Show PDF thumbnail
  if (isPdf(fileURL)) {
    return (
      <div ref={containerRef} className={`${className} bg-parchment-100 overflow-hidden`}>
        {pdfThumb
          ? <img src={pdfThumb} alt="preview" className="w-full h-full object-cover object-top" />
          : <div className="w-full h-full animate-pulse bg-parchment-200 flex items-center justify-center">
              {loading && <div className="w-4 h-4 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />}
            </div>}
      </div>
    );
  }

  // Fallback placeholder
  const theme = SUBJECT_COLORS[subject] || { bg: '#f1f5f9', accent: '#6b7c3a', emoji: '📄' };
  return (
    <div ref={containerRef} className={`${className} flex flex-col items-center justify-center gap-2`}
      style={{ background: theme.bg }}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
        style={{ background: theme.accent }}>
        <span className="text-2xl">{theme.emoji}</span>
      </div>
      {title && <p className="text-xs font-semibold text-center px-3 line-clamp-2" style={{ color: theme.accent }}>{title}</p>}
    </div>
  );
}
