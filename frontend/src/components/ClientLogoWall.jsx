import React from 'react';
import { CLIENT_LOGOS } from '../utils/siteConfig';

export default function ClientLogoWall() {
  if (!CLIENT_LOGOS.length) return null;
  const doubled = [...CLIENT_LOGOS, ...CLIENT_LOGOS]; // duplicate for seamless loop

  return (
    <section className="py-14 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 text-center mb-8">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Trusted by Leading Builders & Developers
        </span>
      </div>
      <div className="overflow-hidden">
        <div className="flex gap-12 marquee-track" style={{ width: 'max-content' }}>
          {doubled.map((cl, i) => (
            <div key={i} className="flex items-center justify-center w-36 h-16 grayscale hover:grayscale-0 transition-all">
              <img src={cl.logo} alt={cl.name}
                   className="max-h-12 max-w-full object-contain"
                   onError={e => {
                     e.currentTarget.style.display = 'none';
                     e.currentTarget.parentElement.innerHTML =
                       `<div class="text-gray-300 font-bold text-sm">${cl.name}</div>`;
                   }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
