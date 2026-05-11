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

export default function PdfPreview({ fileURL, coverImage, subject, title, className = 'w-full h-full' }) {
  const imageUrl = coverImage ? fileUrl(coverImage) : null;
  const [src, setSrc] = useState(() => blobCache.get(imageUrl) || '');
  const containerRef = useRef(null);

  useEffect(() => {
    if (!imageUrl) return;
    if (blobCache.has(imageUrl)) { setSrc(blobCache.get(imageUrl)); return; }

    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;
      observer.disconnect();
      fetch(imageUrl)
        .then(r => r.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob);
          blobCache.set(imageUrl, url);
          setSrc(url);
        })
        .catch(() => {});
    }, { rootMargin: '200px' });

    observer.observe(el);
    return () => observer.disconnect();
  }, [imageUrl]);

  if (imageUrl) {
    return (
      <div ref={containerRef} className={`${className} bg-parchment-100 overflow-hidden`}>
        {src
          ? <img src={src} alt="preview" className="w-full h-full object-cover object-top" />
          : <div className="w-full h-full animate-pulse bg-parchment-200" />}
      </div>
    );
  }

  const theme = SUBJECT_COLORS[subject] || { bg: '#f1f5f9', accent: '#6b7c3a', emoji: '📄' };
  return (
    <div className={`${className} flex flex-col items-center justify-center gap-2`}
      style={{ background: theme.bg }}>
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
        style={{ background: theme.accent }}>
        <span className="text-2xl">{theme.emoji}</span>
      </div>
      {title && <p className="text-xs font-semibold text-center px-3 line-clamp-2" style={{ color: theme.accent }}>{title}</p>}
    </div>
  );
}
