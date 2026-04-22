import { useEffect } from 'react';

export function useReveal(selector = '.reveal, .reveal-left, .reveal-scale', deps = []) {
  useEffect(() => {
    const observe = () => {
      const els = document.querySelectorAll(selector);
      if (!els.length) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('revealed');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08 }
      );
      els.forEach((el) => {
        if (!el.classList.contains('revealed')) observer.observe(el);
      });
      return observer;
    };

    // Run immediately
    const obs = observe();
    // Also run after short delays to catch async-rendered cards
    const t1 = setTimeout(() => observe(), 150);
    const t2 = setTimeout(() => observe(), 600);

    return () => {
      obs?.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
