import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/api';
import toast from 'react-hot-toast';
import { BROCHURE, SITE } from '../utils/siteConfig';
import { useLocation } from 'react-router-dom';

export default function BrochurePopup() {
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [form, setForm] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!BROCHURE.enabled) return;
    if (dismissed) return;
    if (location.pathname !== '/') return;
    if (sessionStorage.getItem('brochure_shown')) return;

    const timer = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem('brochure_shown', '1');
    }, BROCHURE.delaySeconds * 1000);
    return () => clearTimeout(timer);
  }, [location.pathname, dismissed]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
      toast.error('Please enter a valid name and email'); return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/brochure-lead`, form);
      toast.success('Brochure link sent to your email!');
      // Trigger download
      const a = document.createElement('a');
      a.href = `/downloads/${BROCHURE.fileName}`;
      a.download = BROCHURE.fileName;
      a.click();
      setOpen(false);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && setDismissed(true) && setOpen(false)}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="bg-gradient-to-r from-[#0A1628] to-[#1a2d50] p-5 text-center">
          <img src={SITE.logo} alt="NP Construction" className="w-14 h-14 object-contain rounded-xl mx-auto mb-3"
               onError={e => e.target.style.display='none'} />
          <h3 className="text-white font-black text-xl">Free Company Brochure</h3>
          <p className="text-white/70 text-sm mt-1">Download our complete steel work portfolio & pricing guide</p>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <input type="text" placeholder="Your Name" value={form.name}
            onChange={e => setForm(f => ({...f, name: e.target.value}))}
            className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
            required />
          <input type="email" placeholder="Your Email Address" value={form.email}
            onChange={e => setForm(f => ({...f, email: e.target.value}))}
            className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
            required />
          <button type="submit" disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white
                       font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
            {loading ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-download" />}
            {loading ? 'Processing…' : 'Download Free Brochure'}
          </button>
          <button type="button" onClick={() => { setOpen(false); setDismissed(true); }}
            className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors py-1">
            No thanks, maybe later
          </button>
        </form>
      </div>
    </div>
  );
}
