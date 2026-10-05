import React, { useState } from 'react';
import { SITE } from '../utils/siteConfig';

const QUICK_MESSAGES = [
  'I need a steel work quote',
  'I want to know about your services',
  'I want to discuss a project',
];

export default function WhatsAppWidget() {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState('');

  const sendMessage = (msg) => {
    const text = encodeURIComponent(msg || custom || 'Hello, I need a quote for my steel project.');
    window.open(`https://wa.me/${SITE.whatsapp}?text=${text}`, '_blank');
    setOpen(false);
  };

  return (
    <div className="fixed bottom-7 right-7 z-50 flex flex-col items-end gap-3">
      {/* Chat popup */}
      {open && (
        <div className="bg-white rounded-2xl shadow-2xl w-72 overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="bg-[#25D366] px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center text-white font-black text-sm">NP</div>
            <div>
              <div className="text-white font-bold text-sm">NP Construction</div>
              <div className="text-green-100 text-xs flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-200 rounded-full inline-block"></span>
                Typically replies in minutes
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="ml-auto text-white/80 hover:text-white text-lg leading-none">×</button>
          </div>

          {/* Body */}
          <div className="p-4">
            <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm text-gray-700 leading-relaxed">
              <p className="font-semibold mb-1">👋 Hi! Welcome to NP Construction</p>
              <p>How can we help you today?</p>
            </div>

            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-2">Quick options</p>
            <div className="space-y-2 mb-3">
              {QUICK_MESSAGES.map(msg => (
                <button key={msg} onClick={() => sendMessage(msg)}
                  className="w-full text-left text-sm bg-orange-50 hover:bg-orange-100 text-orange-700
                             rounded-lg px-3 py-2 transition-colors border border-orange-100">
                  {msg}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={custom}
              onChange={e => setCustom(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-400 mb-3"
            />

            <button onClick={() => sendMessage()}
              className="w-full bg-[#25D366] hover:bg-green-500 text-white font-bold py-2.5 rounded-xl
                         flex items-center justify-center gap-2 transition-colors text-sm">
              <i className="fab fa-whatsapp text-base" />
              Start Chat on WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* FAB */}
      <button onClick={() => setOpen(o => !o)}
        className="w-14 h-14 bg-[#25D366] hover:bg-green-500 text-white rounded-full shadow-xl
                   flex items-center justify-center text-2xl transition-all hover:scale-110 relative"
        aria-label="WhatsApp Chat">
        <i className={`fab fa-whatsapp transition-transform ${open ? 'scale-0 absolute' : 'scale-100'}`} />
        <i className={`fas fa-times transition-transform ${open ? 'scale-100' : 'scale-0 absolute'}`} />
        {!open && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white" />}
      </button>
    </div>
  );
}
