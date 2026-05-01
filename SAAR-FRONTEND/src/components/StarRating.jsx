import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { apiFetch } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function StarRating({ resourceType, resourceId, initialData }) {
  const { isAuthenticated } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(initialData || { avg: 0, count: 0, userRating: null });
  const [hover, setHover] = useState(0);

  useEffect(() => {
    if (!resourceId || initialData) return;
    apiFetch(`/api/ratings/${resourceType}/${resourceId}`, { skipAuth: true })
      .then((r) => r.success && setData(r.data))
      .catch(() => {});
  }, [resourceType, resourceId]);

  async function rate(stars) {
    if (!isAuthenticated) { toast('Log in to rate', 'error'); return; }
    try {
      const r = await apiFetch(`/api/ratings/${resourceType}/${resourceId}`, {
        method: 'POST',
        body: JSON.stringify({ stars }),
      });
      if (r.success) setData(r.data);
    } catch (err) {
      toast(err.message || 'Failed to rate', 'error');
    }
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            onClick={() => rate(s)}
            className="p-0.5"
          >
            <Star
              className={`h-4 w-4 transition-colors ${
                s <= (hover || data.userRating || 0)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
      <span className="text-xs text-ink-800">
        {data.avg > 0 ? `${data.avg} (${data.count})` : 'No ratings'}
      </span>
    </div>
  );
}
