import { useEffect, useRef, useState } from 'react';
import { fileUrl } from '../lib/api';

export default function PdfPreview({ fileURL, coverImage, className = 'w-full h-full' }) {
  const canvasRef = useRef(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    if (coverImage || !fileURL) return;
    const ext = fileURL.split('.').pop().toLowerCase();
    if (ext !== 'pdf') return;

    let cancelled = false;

    async function renderPdf() {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.min.mjs',
          import.meta.url
        ).toString();

        const res = await fetch(fileUrl(fileURL));
        const arrayBuffer = await res.arrayBuffer();
        if (cancelled) return;

        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        if (cancelled) return;

        const page = await pdf.getPage(1);
        if (cancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const viewport = page.getViewport({ scale: 1 });
        const containerWidth = canvas.parentElement?.clientWidth || 300;
        const scale = containerWidth / viewport.width;
        const scaled = page.getViewport({ scale });

        canvas.width = scaled.width;
        canvas.height = scaled.height;

        await page.render({ canvasContext: canvas.getContext('2d'), viewport: scaled }).promise;
        if (!cancelled) setRendered(true);
      } catch {}
    }

    renderPdf();
    return () => { cancelled = true; };
  }, [fileURL, coverImage]);

  if (coverImage) {
    return <img src={fileUrl(coverImage)} alt="cover" className={`${className} object-cover object-top`} />;
  }

  if (!fileURL) return null;

  const ext = fileURL.split('.').pop().toLowerCase();
  const isImage = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext);

  if (isImage) {
    return <BlobImage fileURL={fileURL} className={className} objectPosition="top" />;
  }

  if (ext === 'pdf') {
    return (
      <div className={`${className} relative bg-parchment-100 overflow-hidden flex items-start`}>
        {!rendered && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
          </div>
        )}
        <canvas ref={canvasRef} className="w-full" style={{ display: 'block', objectFit: 'cover', objectPosition: 'top' }} />
      </div>
    );
  }

  return (
    <div className={`${className} flex items-center justify-center bg-parchment-100`}>
      <div className="w-5 h-5 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
    </div>
  );
}

function BlobImage({ fileURL, className, objectPosition = 'top' }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    let url = '';
    fetch(fileUrl(fileURL))
      .then((r) => r.blob())
      .then((b) => { url = URL.createObjectURL(b); setSrc(url); })
      .catch(() => {});
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [fileURL]);
  return src ? <img src={src} alt="preview" className={`${className} object-cover`} style={{ objectPosition }} /> : null;
}
