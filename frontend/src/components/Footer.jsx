import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ChevronRight, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { SITE } from '../utils/siteConfig';
import { CITY_LIST } from '../data/cities';

const QUICK_LINKS = [
  { to: '/',          label: 'Home' },
  { to: '/about',     label: 'About Us' },
  { to: '/services',  label: 'Services' },
  { to: '/projects',  label: 'Projects' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/reviews',   label: 'Reviews' },
  { to: '/faq',       label: 'FAQ' },
  { to: '/contact',   label: 'Contact' },
];

const SERVICES = [
  'Structural Steel Fabrication',
  'Steel Framework Erection',
  'Welding Services',
  'Roof Trusses & Purlins',
  'Industrial Steel Structures',
  'Mezzanine Floors & Stairs',
];

const SOCIALS = [
  { label: 'Facebook',  href: '#',                              icon: 'f'  },
  { label: 'Instagram', href: '#',                              icon: 'ig' },
  { label: 'WhatsApp',  href: `https://wa.me/${SITE.whatsapp}`, icon: <MessageCircle size={16} /> },
  { label: 'YouTube',   href: '#',                              icon: 'yt' },
];

const linkCls = 'group flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-amber leading-relaxed';

export default function Footer() {
  return (
    <footer className="bg-navy text-white border-t border-white/8 pb-20 sm:pb-0">

      {/* Top band */}
      <div className="border-b border-white/8">
        <div className="container-x py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <Link to="/" className="flex items-center gap-3" aria-label="NP Construction home">
            <img
              src={SITE.logo}
              alt="NP Construction logo"
              className="h-12 w-12 rounded-xl object-contain bg-white/5 p-1"
              onError={e => { e.currentTarget.style.display = 'none'; }}
            />
            <span>
              <span className="block text-lg font-black leading-none text-white">{SITE.name}</span>
              <span className="mt-1 block text-[9px] uppercase tracking-[0.2em] text-white/40">{SITE.tagline}</span>
            </span>
          </Link>

          <div className="flex flex-col sm:items-end gap-2">
            <p className="text-sm text-white/50 max-w-sm sm:text-right">
              Structural steel fabrication &amp; erection across Gujarat — from drawings to handover.
            </p>
            <Link to="/contact" className="btn-amber self-start sm:self-auto text-sm">
              Get a Quote <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      {/* Link columns */}
      <div className="container-x py-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-5">

        <div>
          <span className="footer-col-title">Quick Links</span>
          <div className="space-y-2.5">
            {QUICK_LINKS.map(l => (
              <Link key={l.to} to={l.to} className={linkCls}>
                <ChevronRight size={13} className="text-crimson/70 transition-transform group-hover:translate-x-0.5 shrink-0" />
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <span className="footer-col-title">Our Services</span>
          <div className="space-y-2.5">
            {SERVICES.map(s => (
              <Link key={s} to="/services" className={linkCls}>
                <ChevronRight size={13} className="text-crimson/70 transition-transform group-hover:translate-x-0.5 shrink-0" />
                {s}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <span className="footer-col-title">Cities We Serve</span>
          <div className="space-y-2.5">
            {CITY_LIST.map(city => (
              <Link key={city.slug} to={`/services/${city.slug}`} className={linkCls}>
                <ChevronRight size={13} className="text-crimson/70 transition-transform group-hover:translate-x-0.5 shrink-0" />
                {city.name}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <span className="footer-col-title">Contact Us</span>
          <div className="space-y-3">
            <a href={`tel:${SITE.phoneRaw}`}
              className="flex items-start gap-3 text-sm text-white/55 hover:text-amber transition-colors">
              <Phone size={15} className="mt-0.5 shrink-0 text-amber" />{SITE.phone}
            </a>
            <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noreferrer"
              className="flex items-start gap-3 text-sm text-white/55 hover:text-amber transition-colors">
              <MessageCircle size={15} className="mt-0.5 shrink-0 text-amber" />WhatsApp Us
            </a>
            <a href={`mailto:${SITE.email}`}
              className="flex items-start gap-3 text-sm text-white/55 hover:text-amber transition-colors break-all">
              <Mail size={15} className="mt-0.5 shrink-0 text-amber" />{SITE.email}
            </a>
            <div className="flex items-start gap-3 text-sm text-white/55">
              <MapPin size={15} className="mt-0.5 shrink-0 text-amber" />{SITE.address}
            </div>
          </div>
        </div>

        <div>
          <span className="footer-col-title">Connect</span>
          <div className="flex flex-wrap gap-2 mb-6">
            {SOCIALS.map(s => (
              <a
                key={s.label} href={s.href} aria-label={s.label}
                target={s.href !== '#' ? '_blank' : undefined}
                rel={s.href !== '#' ? 'noreferrer' : undefined}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/12
                           text-xs font-bold text-white/55 transition-all
                           hover:border-amber hover:bg-amber hover:text-navy"
              >
                {s.icon}
              </a>
            ))}
          </div>

          {/* Working hours */}
          <div className="rounded-xl border border-white/10 bg-white/4 p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/35 mb-2">Working Hours</p>
            <p className="text-sm font-semibold text-white">{SITE.hours}</p>
          </div>
        </div>

      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8">
        <div className="container-x flex flex-col gap-2 py-5 text-xs text-white/35
                        sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} {SITE.name}. All Rights Reserved.</span>
          <div className="flex gap-4">
            <span>Made for Indian Builders</span>
            <span className="text-crimson">●</span>
            <span>Gujarat, India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
