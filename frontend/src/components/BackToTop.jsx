import React, { useState, useEffect } from 'react';

export default function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = () => setShow(window.scrollY > 400);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  if (!show) return null;
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-24 right-7 z-40 w-11 h-11 bg-[#0A1628] hover:bg-orange-500
                 text-white rounded-full shadow-lg flex items-center justify-center
                 transition-all hover:-translate-y-1"
      aria-label="Back to top">
      <i className="fas fa-chevron-up text-sm" />
    </button>
  );
}
