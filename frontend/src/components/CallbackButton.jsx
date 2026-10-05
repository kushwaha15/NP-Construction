import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/api';
import toast from 'react-hot-toast';

export default function CallbackButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', preferredTime: 'Morning' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !/^[6-9]\d{9}$/.test(form.phone.trim())) {
      toast.error('Please enter a valid name and 10-digit phone number');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/callback`, form);
      toast.success('Callback request submitted! We will call you soon.');
      setOpen(false);
      setForm({ name: '', phone: '', preferredTime: 'Morning' });
    } catch {
      toast.error('Failed to submit. Please call us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* FAB — bottom left */}
      <button onClick={() => setOpen(true)}
        className="fixed bottom-7 left-7 z-50 bg-[#0A1628] hover:bg-[#122040] text-white
                   px-4 py-3 rounded-full shadow-xl flex items-center gap-2 text-sm font-semibold
                   transition-all hover:scale-105"
        aria-label="Request Callback">
        <i className="fas fa-phone-alt text-orange-400" />
        <span className="hidden sm:inline">Request Callback</span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 bg-black/60 z-[9998] flex items-end sm:items-center justify-center p-4"
          onClick={e => e.target === e.currentTarget && setOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
            <div className="bg-[#0A1628] rounded-t-2xl p-4 flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold">Request a Callback</h3>
                <p className="text-white/60 text-xs mt-0.5">We'll call you back within 30 minutes</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white text-xl leading-none">×</button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <input type="text" placeholder="Your name" value={form.name}
                  onChange={e => setForm(f => ({...f, name: e.target.value}))}
                  className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                  required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Phone Number *
                </label>
                <input type="tel" placeholder="10-digit number" value={form.phone} maxLength={10}
                  onChange={e => setForm(f => ({...f, phone: e.target.value.replace(/\D/g,'').slice(0,10)}))}
                  className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-lg px-3 py-2.5 text-sm outline-none transition-colors"
                  required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">
                  Preferred Time
                </label>
                <select value={form.preferredTime}
                  onChange={e => setForm(f => ({...f, preferredTime: e.target.value}))}
                  className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-lg px-3 py-2.5 text-sm outline-none transition-colors cursor-pointer">
                  <option>Morning (9am–12pm)</option>
                  <option>Afternoon (12pm–4pm)</option>
                  <option>Evening (4pm–7pm)</option>
                </select>
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white
                           font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                {loading ? <><i className="fas fa-spinner fa-spin" /> Submitting…</> : <><i className="fas fa-phone-alt" /> Request Callback</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
