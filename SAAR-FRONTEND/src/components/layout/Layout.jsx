import { useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { useReveal } from '../../hooks/useReveal';

export default function Layout() {
  const location = useLocation();
  const mainRef = useRef(null);
  useReveal();

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.style.opacity = '0';
      mainRef.current.style.transform = 'translateY(12px)';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (mainRef.current) {
            mainRef.current.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            mainRef.current.style.opacity = '1';
            mainRef.current.style.transform = 'translateY(0)';
          }
        });
      });
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main ref={mainRef} className="flex-grow flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
