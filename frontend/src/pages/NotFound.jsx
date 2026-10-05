import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, Home, Wrench } from 'lucide-react';

export default function NotFound() {
  return <><Helmet><title>Page Not Found | NP Construction</title><meta name="robots" content="noindex" /></Helmet><main className="section-mist flex min-h-[70vh] items-center py-24"><div className="container-x max-w-2xl text-center"><p className="text-sm font-bold uppercase tracking-[0.2em] text-steel">404</p><h1 className="mt-4 text-4xl font-extrabold tracking-tight text-navy sm:text-6xl">That page could not be found.</h1><p className="mx-auto mt-5 max-w-lg text-lg leading-8 text-mist-500">The page may have moved, but we can still help you find the right next step for your project.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link to="/" className="btn-navy"><Home size={17} aria-hidden="true" />Home</Link><Link to="/services" className="btn-steel"><Wrench size={17} aria-hidden="true" />Services</Link><Link to="/contact" className="btn-amber">Contact <ArrowRight size={17} aria-hidden="true" /></Link></div></div></main></>;
}
