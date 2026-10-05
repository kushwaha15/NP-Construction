import React from 'react';

export default function SectionHeading({ label, heading, highlight, after, sub, center = true }) {
  return (
    <div className={center ? 'text-center' : ''}>
      {label && (
        <span className="inline-block bg-orange-500/10 text-orange-500 text-xs font-bold
                         uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
          {label}
        </span>
      )}
      <h2 className="text-3xl sm:text-4xl font-black text-[#0A1628] leading-tight">
        {heading}{' '}
        {highlight && <span className="text-orange-500">{highlight}</span>}
        {after && <>{' '}{after}</>}
      </h2>
      <div className={`w-14 h-1 bg-orange-500 rounded-full mt-3 ${center ? 'mx-auto' : ''}`} />
      {sub && <p className="text-gray-500 mt-3 max-w-2xl mx-auto text-base">{sub}</p>}
    </div>
  );
}
