import React from 'react';

export default function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded bg-mist-200 ${className}`} aria-hidden="true" />;
}

export function SkeletonBlock({ rows = 3 }) {
  return <div className="space-y-3" aria-busy="true">{Array.from({ length: rows }, (_, index) => <Skeleton key={index} className={`h-4 ${index === rows - 1 ? 'w-2/3' : 'w-full'}`} />)}</div>;
}
