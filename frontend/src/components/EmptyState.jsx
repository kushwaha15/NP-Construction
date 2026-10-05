import React from 'react';

export default function EmptyState({ title, message, action }) {
  return <div className="border border-dashed border-mist-300 bg-white px-6 py-16 text-center"><h2 className="text-xl font-extrabold text-navy">{title}</h2>{message && <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-mist-500">{message}</p>}{action && <div className="mt-6">{action}</div>}</div>;
}
