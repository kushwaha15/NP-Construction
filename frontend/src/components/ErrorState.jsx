import React from 'react';

export default function ErrorState({ title = 'Something went wrong', message = 'Please try again or return to the previous page.', onRetry }) {
  return <div className="border border-red-200 bg-red-50 px-6 py-16 text-center"><h2 className="text-xl font-extrabold text-navy">{title}</h2><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-red-700">{message}</p>{onRetry && <button type="button" onClick={onRetry} className="btn-navy mt-6">Try again</button>}</div>;
}
