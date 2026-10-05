import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { SITE } from '../utils/siteConfig';
import { ArrowUpRight, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { to: '/',          label: 'Home' },
  { to: '/about',     label: 'About' },
  { to: '/services',  label: 'Services' },
  { to: '/projects',  label: 'Projects' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/reviews',   label: 'Reviews' },
  { to: '/estimator', label: 'Estimator' },
  { to: '/blog',      label: 'Blog' },
  { to: '/faq',       label: 'FAQ' },
  { to: '/contact',   label: 'Contact' },
];

export default function Navbar() {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${scrolled || menuOpen
          ? 'bg-navy shadow-[0_2px_20px_rgba(11,31,58,0.35)] border-b border-white/5'
          : 'bg-navy/90 backdrop-blur-sm'}`}
    >
      <div className="container-x">
        <div className="flex items-center justify-between h-[68px]">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0" aria-label="NP Construction home">
            <img
              src={SITE.logo}
              alt="NP Construction logo"
              className="h-10 w-10 rounded-lg object-contain bg-white/5 p-0.5"
              onError={e => { e.target.style.display = 'none'; }}
            />
            <span className="hidden sm:block">
              <span className="block text-[15px] font-black leading-none text-white tracking-tight">
                {SITE.name}
              </span>
              <span className="block text-[9px] font-semibold uppercase tracking-[0.2em] text-white/40 mt-0.5">
                {SITE.tagline}
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
            {NAV_LINKS.map(l => (
              <NavLink
                key={l.to} to={l.to} end={l.to === '/'}
                className={({ isActive }) =>
                  `relative text-[13px] font-semibold px-3 py-2.5 rounded-md transition-colors
                   ${isActive ? 'text-white' : 'text-white/65 hover:text-white hover:bg-white/5'}
                   after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2
                   after:h-[2px] after:rounded-full after:bg-steel after:transition-all
                   ${isActive ? 'after:w-1/2' : 'after:w-0 hover:after:w-1/2'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to="/contact"
              className="btn-steel text-[13px] px-5 py-2.5 font-bold tracking-wide"
            >
              Get Free Quote
              <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg
                       text-white hover:bg-white/10 transition-colors"
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="lg:hidden bg-navy border-t border-white/8 px-4 pt-2 pb-5">
          <nav className="space-y-0.5" aria-label="Mobile navigation">
            {NAV_LINKS.map(l => (
              <NavLink
                key={l.to} to={l.to} end={l.to === '/'}
                className={({ isActive }) =>
                  `block py-3 px-4 text-sm font-semibold rounded-lg transition-colors
                   ${isActive
                     ? 'text-white bg-steel/15 border-l-2 border-steel'
                     : 'text-white/70 hover:text-white hover:bg-white/5'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-4 pt-4 border-t border-white/10">
            <Link to="/contact" className="btn-steel w-full text-sm">
              Get Free Quote <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
