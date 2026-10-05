import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function PageHeader({ title, subtitle, breadcrumb = [], action }) {
  return (
    <header className="section-mist border-b border-mist-200 py-24 sm:py-28">
      <div className="container-x flex flex-col items-start justify-between gap-7 lg:flex-row lg:items-end">
        <div>
          {breadcrumb.length > 0 && <nav aria-label="Breadcrumb" className="mb-7 flex flex-wrap items-center gap-2 text-sm text-mist-500"><Link to="/" className="hover:text-steel">Home</Link>{breadcrumb.map((item, index) => <React.Fragment key={`${item.label}-${index}`}><ChevronRight size={14} aria-hidden="true" /><span className={index === breadcrumb.length - 1 ? 'font-semibold text-navy' : ''}>{item.to ? <Link to={item.to} className="hover:text-steel">{item.label}</Link> : item.label}</span></React.Fragment>)}</nav>}
          <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-navy sm:text-6xl">{title}</h1>
          {subtitle && <p className="mt-5 max-w-2xl text-lg leading-8 text-mist-500">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}
