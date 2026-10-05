import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { ArrowRight, Award, Building2, Clock3, HardHat, MapPin, Phone, Shield, TrendingUp } from 'lucide-react';
import { STATS } from '../utils/siteConfig';
import PageHeader from '../components/PageHeader';
import useProjectStats from '../hooks/useProjectStats';

const TEAM = [
  { key: 'nathuni', name: 'MR. Nathuni Prasad',  role: 'Founder & Managing Director', img: '/images/team-member1.jpg' },
  { key: 'ajeet',   name: 'MR. Ajeet Kushwaha',  role: 'Chief Engineer',               img: '/images/ajeet.png' },
  { key: 'kishan',  name: 'Mr. Kishan Dev Mahto', role: 'Operations Manager',           img: '/images/team-member-3.png' },
  { key: 'sanjay',  name: 'Mr. Sanjay Ray',           role: 'Head Iron Worker',             img: '/images/team-member-4.jpg' },
];

const VALUES = [
  { key: 'quality',  icon: Award,   title: 'Accurate Cutting',       text: 'Every bar is measured, cut to exact length, and bent to the correct angle before reinforcement binding.' },
  { key: 'delivery', icon: Clock3,  title: 'Ready Before the Pour',  text: 'We work to the site programme so all reinforcement work is complete before concrete is placed.' },
  { key: 'safety',   icon: HardHat, title: 'Safe Site Practice',     text: 'PPE, disciplined handling of bars, and coordination with the civil team on every project.' },
];

const CERTIFICATIONS = [
  { key: 'gst',    title: 'TODO: GST Registration Record',   detail: 'Add the verified GST certificate or registration details here.' },
  { key: 'is',     title: 'TODO: IS Code Compliance Record', detail: 'Add the applicable steel design and fabrication standard here.' },
  { key: 'safety', title: 'TODO: Safety Training Record',    detail: 'Add the verified site safety certification or training record here.' },
];

/* Stat config — labels for the achievements band */
const STAT_CONFIG = [
  { key: 'projects', icon: Building2,  label: 'Projects Completed' },
  { key: 'tons',     icon: TrendingUp, label: 'Tonnes of Steel' },
  { key: 'cities',   icon: MapPin,     label: 'Cities Covered' },
  { key: 'years',    icon: Award,      label: 'Years in Business' },
];

/* ── CountUp helper ─────────────────────────────────────── */
function CountUp({ value, label, icon: Icon }) {
  const [count, setCount] = useState(0);
  const ref    = useRef(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (value === null || value === undefined) return;
    hasRun.current = false;
    setCount(0);
    const el = ref.current;
    if (!el) return;
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const show = () => {
      if (hasRun.current) return;
      hasRun.current = true;
      if (rm) { setCount(value); return; }
      const start = performance.now();
      const dur   = 1200;
      const tick  = now => {
        const p = Math.min((now - start) / dur, 1);
        setCount(Math.round(value * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting) { show(); ob.disconnect(); } }, { threshold: 0.4 });
    ob.observe(el);
    return () => ob.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="stat-card">
      <div className="stat-card-icon"><Icon size={36} /></div>
      {value === null
        ? <div className="mx-auto h-10 w-24 animate-pulse rounded-lg bg-white/15 mt-1" />
        : <p className="stat-card-value">{count.toLocaleString('en-IN')}+</p>
      }
      <p className="stat-card-label">{label}</p>
    </div>
  );
}

export default function About() {
  const liveStats = useProjectStats();

  const figures = [
    { key: 'projects', value: liveStats.loading ? null : liveStats.totalProjects, icon: Building2,  label: 'Projects Completed' },
    { key: 'tons',     value: liveStats.loading ? null : liveStats.totalTonnage,  icon: TrendingUp, label: 'Tonnes of Steel' },
    { key: 'cities',   value: liveStats.loading ? null : liveStats.citiesCovered, icon: MapPin,     label: 'Cities Covered' },
    { key: 'years',    value: STATS[0]?.value || 0,                               icon: Award,      label: 'Years in Business' },
  ];

  return <>
    <Helmet>
      <title>About NP Construction | RCC Reinforcement Contractor</title>
      <meta name="description" content="15+ years of iron cutting & binding work for RCC structures in Ahmedabad, Gujarat. Meet the team behind NP Construction." />
      <meta property="og:title"       content="About NP Construction | RCC Reinforcement Contractor" />
      <meta property="og:description" content="Iron cutting & reinforcement binding specialists in Ahmedabad, Gujarat. 15+ years, 350+ RCC projects." />
      <meta property="og:type"        content="website" />
      <meta property="og:site_name"   content="NP Construction" />
    </Helmet>

    <motion.main initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <PageHeader
        title="About NP Construction"
        subtitle="RCC reinforcement and iron cutting & binding — done accurately, on schedule, and coordinated around your site."
        breadcrumb={[{ label: 'About' }]}
      />

      {/* ── Our Story ────────────────────────────────────── */}
      <section className="section-light py-20 sm:py-24">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <div>
            <span className="label-cat">Our Story</span>
            <h2 className="heading-underline mt-3 text-3xl sm:text-4xl font-extrabold text-navy">
              Reinforcement work that starts with the details
            </h2>
            <div className="mt-7 space-y-4 text-sm leading-7 text-mist-500 sm:text-base">
              <p>NP Construction is an iron cutting and binding contractor based in Ahmedabad, Gujarat. We specialise in RCC reinforcement work — cutting, bending, and tying reinforcement bars (rebar) for beams, slabs, columns, and roofs on residential and commercial construction sites.</p>
              <p>Our work covers reading bar bending schedules, cutting bars to exact lengths, bending stirrups and main bars, and tying all reinforcement members ready for the concrete pour.</p>
              <p>The team works closely with the civil contractor and site supervisor so the iron and reinforcement work is always ready before the pour — no delays to the project programme.</p>
            </div>
            <div className="mt-8">
              <Link to="/contact" className="btn-steel text-sm">Start a Conversation <ArrowRight size={15} /></Link>
            </div>
          </div>
          <div className="relative">
            <img
              src="/images/NP-Steel_fabricon.jpg"
              alt="Steel fabrication and erection work by NP Construction"
              width="800" height="600" loading="lazy"
              className="rounded-2xl w-full object-cover aspect-[4/3] shadow-soft"
            />
            {/* Floating accent card */}
            <div className="absolute -bottom-6 -left-4 hidden sm:block bg-navy text-white rounded-2xl px-6 py-4 shadow-stat">
              <p className="text-3xl font-black text-amber">{STATS[0]?.value || 15}+</p>
              <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mt-1">Years Experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Achievements band ────────────────────────────── */}
      <section
        className="section-dark-photo py-20"
        style={{ backgroundImage: 'url(/images/NP-Steel_fabricon.jpg)' }}
      >
        <div className="container-x">
          <div className="text-center mb-12">
            <span className="label-cat label-cat-light">Our Track Record</span>
            <h2 className="heading-underline mt-3 text-3xl sm:text-4xl font-extrabold text-white">
              Numbers that speak for themselves
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {figures.map(f => (
              <CountUp key={f.key} value={f.value} label={f.label} icon={f.icon} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────── */}
      <section className="section-light py-20 sm:py-24">
        <div className="container-x">
          <div className="max-w-2xl mb-12">
            <span className="label-cat">What Guides Our Work</span>
            <h2 className="heading-underline mt-3 text-3xl sm:text-4xl font-extrabold text-navy">
              Practical standards on every project
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {VALUES.map(({ key, icon: Icon, title, text }) => (
              <article key={key}
                className="group rounded-card border border-mist-200 bg-white p-7 hover:border-steel/40 hover:shadow-card transition-all">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-steel/8 text-steel
                                group-hover:bg-steel group-hover:text-white transition-colors">
                  <Icon size={22} />
                </div>
                <h3 className="mt-5 text-base font-bold text-navy">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-mist-500">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────── */}
      <section className="section-mist py-20 sm:py-24">
        <div className="container-x">
          <div className="max-w-2xl mb-12">
            <span className="label-cat">Our Team</span>
            <h2 className="heading-underline mt-3 text-3xl sm:text-4xl font-extrabold text-navy">
              People who know steel work
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {TEAM.map(member => (
              <article key={member.key}
                className="overflow-hidden rounded-card border border-mist-200 bg-white shadow-card
                           hover:shadow-soft transition-shadow">
                <div className="relative overflow-hidden bg-navy/5">
                  <img
                    src={member.img}
                    alt={`${member.name}, ${member.role}`}
                    width="420" height="420" loading="lazy"
                    className="aspect-square w-full object-cover object-top"
                    onError={e => { e.currentTarget.src = '/images/NP-Contruction-logo.png'; e.currentTarget.className = 'aspect-square w-full object-contain bg-navy p-12'; }}
                  />
                </div>
                <div className="p-5 border-t border-mist-200">
                  <h3 className="font-bold text-navy text-sm">{member.name}</h3>
                  <p className="mt-1 text-xs font-semibold text-steel">{member.role}</p>
                  {member.phone && (
                    <a href={`tel:${member.phone}`}
                      className="mt-3 inline-flex items-center gap-2 text-xs font-bold text-navy hover:text-steel transition-colors">
                      <Phone size={13} />{member.phone}
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Certifications ───────────────────────────────── */}
      <section className="section-light py-20 sm:py-24">
        <div className="container-x grid gap-12 lg:grid-cols-[.8fr_1.2fr] lg:items-start">
          <div>
            <span className="label-cat">Certifications & Safety</span>
            <h2 className="heading-underline mt-3 text-3xl font-extrabold text-navy">
              Records that should be easy to check
            </h2>
            <p className="mt-5 leading-7 text-mist-500">
              We keep project, material, and site safety records close to the work.
              Verified certificates can be added here as they are provided.
            </p>
          </div>
          <div className="space-y-3">
            {CERTIFICATIONS.map(cert => (
              <div key={cert.key}
                className="flex items-center gap-4 rounded-card border border-mist-200 bg-white p-5
                           hover:border-steel/30 hover:shadow-card transition-all">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy">
                  <Shield size={20} className="text-amber" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-navy">{cert.title}</h3>
                  <p className="mt-1 text-xs leading-5 text-mist-500">{cert.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA band ─────────────────────────────────────── */}
      <section className="cta-band py-16">
        <svg className="cta-band-bg" viewBox="0 0 400 400" fill="none" aria-hidden="true">
          <circle cx="200" cy="200" r="190" stroke="white" strokeWidth="1" />
          <circle cx="200" cy="200" r="130" stroke="white" strokeWidth="0.6" />
          <circle cx="200" cy="200" r="70"  stroke="white" strokeWidth="0.4" />
        </svg>
        <div className="container-x relative z-10 flex flex-col items-start justify-between gap-7 sm:flex-row sm:items-center">
          <div>
            <span className="label-cat label-cat-light">Start with the Scope</span>
            <h2 className="heading-underline mt-3 text-3xl font-extrabold text-white">
              Have an RCC reinforcement project to discuss?
            </h2>
            <p className="mt-3 max-w-lg leading-7 text-white/60">
              Share your bar bending schedule or structural drawings and we will confirm scope and start date.
            </p>
          </div>
          <Link to="/contact" className="btn-amber shrink-0 text-sm px-8">
            Get a Quote <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </motion.main>
  </>;
}
