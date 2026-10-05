import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { API_URL } from '../utils/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ArrowRight, Award, Building2, CheckCircle2,
  HardHat, Layers, MapPin, Phone, Shield, Star,
  TrendingUp, Wrench,
} from 'lucide-react';
import { CLIENT_LOGOS, SERVICE_AREAS, SITE, STATS } from '../utils/siteConfig';
import useProjectStats from '../hooks/useProjectStats';

/* ─────────────────────────────────────────────────────────
   EDITABLE CONSTANTS
   ───────────────────────────────────────────────────────── */

const SERVICES = [
  { key: 'beam',   icon: Wrench,    label: 'Beam Reinforcement Cutting & Binding',   desc: 'Rebar cutting, stirrup bending, and cage binding for RCC beams — sized to your bar bending schedule.' },
  { key: 'slab',   icon: Layers,    label: 'Slab Reinforcement Cutting & Binding',   desc: 'Mesh cutting, bending, and tying for RCC floor and roof slabs, top and bottom layers.' },
  { key: 'column', icon: Building2, label: 'Column Reinforcement Cutting & Binding', desc: 'Main bar cutting, lateral tie making, and full column cage binding for RCC columns.' },
  { key: 'roof',   icon: HardHat,   label: 'Roof Reinforcement Cutting & Binding',   desc: 'Iron cutting and reinforcement binding for chhat slabs, sunshades, and RCC roof members.' },
];

/* Edit pillar labels and descriptions here — layout code below stays untouched */
/* NOTE: 'expertise' text is built dynamically from the DB — see PillarSection below */
const PILLARS = [
  { key: 'quality',   icon: Award,       title: 'Quality Work',     text: 'Every bar is cut to size, bent to the right angle, and tied tightly before any pour.' },
  { key: 'safety',    icon: Shield,      title: 'Safety On Site',   text: 'PPE, disciplined site practices, and coordination with the civil team on every project.' },
  { key: 'delivery',  icon: TrendingUp,  title: 'On-Time Binding',  text: 'Clear schedules keep the iron work ready before the concrete pour — no delays.' },
  { key: 'expertise', icon: CheckCircle2,title: 'Proven Expertise',  text: null }, // text built from DB below
];

const BUILDING_TYPES = [
  { value: 'residential', label: 'Residential', factor: 0.045 },
  { value: 'commercial',  label: 'Commercial',  factor: 0.055 },
  { value: 'industrial',  label: 'Industrial',  factor: 0.065 },
];

const WORK_TYPES = ['Beam Reinforcement', 'Slab Reinforcement', 'Column Reinforcement', 'Roof Reinforcement', 'Other'];

/* Stat config — icons and labels for the achievements band */
const STAT_CONFIG = [
  { key: 'stats.years',    icon: Award,     label: 'Years of Experience' },
  { key: 'stats.projects', icon: Building2, label: 'Projects Completed' },
  { key: 'stats.tons',     icon: TrendingUp,label: 'Tonnes of Steel' },
  { key: 'stats.cities',   icon: MapPin,    label: 'Cities Covered' },
];

/* ─────────────────────────────────────────────────────────
   HERO SECTION
   ───────────────────────────────────────────────────────── */
function HomeHero() {
  return (
    <section
      className="relative min-h-[92vh] flex items-center bg-navy overflow-hidden"
      style={{ backgroundImage: 'url(/images/Rooftop-image.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/80 to-navy/40" />

      <div className="container-x relative z-10 py-32 lg:py-40">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl"
        >
          <span className="label-cat label-cat-light mb-5">
            Gujarat's Trusted Iron Cutting, Binding &amp; Reinforcement Contractor
          </span>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] text-white tracking-tight">
            Precision Iron Work<br />
            for <span className="text-steel-light">RCC</span> Structures
          </h1>
          <p className="mt-6 text-lg leading-8 text-white/70 max-w-xl">
            Rebar cutting, bending, and reinforcement binding for beams, slabs, columns, and roofs —
            on time, on site, done right across Gujarat.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/contact" className="btn-steel px-7 py-3.5 text-sm font-bold">
              Get a Free Quote <ArrowRight size={17} />
            </Link>
            <Link to="/projects" className="btn-outline-white px-7 py-3.5 text-sm font-bold">
              View Our Work
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-navy/60 to-transparent pointer-events-none" />
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   ACHIEVEMENTS BAND  (photo background + stat-cards)
   ───────────────────────────────────────────────────────── */
function AchievementsBand({ liveStats }) {
  /* Map live values onto the 4 stat slots */
  const values = {
    'stats.years':    { value: STATS[0]?.value ?? 15,              loading: false },
    'stats.projects': { value: liveStats.totalProjects,             loading: liveStats.loading },
    'stats.tons':     { value: liveStats.totalTonnage,              loading: liveStats.loading },
    'stats.cities':   { value: liveStats.citiesCovered,             loading: liveStats.loading },
  };

  return (
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
          {STAT_CONFIG.map(({ key, icon: Icon, label }) => {
            const { value, loading } = values[key];
            return (
              <div key={key} className="stat-card">
                <div className="stat-card-icon">
                  <Icon size={36} />
                </div>
                {loading || value === null ? (
                  <div className="mx-auto h-10 w-24 animate-pulse rounded-lg bg-white/15 mt-1" />
                ) : (
                  <p className="stat-card-value">{Number(value).toLocaleString('en-IN')}+</p>
                )}
                <p className="stat-card-label">{label}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   SERVICES SECTION
   ───────────────────────────────────────────────────────── */
function ServicesSection() {
  return (
    <section className="section-light py-20 sm:py-24">
      <div className="container-x">
        <div className="max-w-2xl mb-12">
          <span className="label-cat">What We Do</span>
          <h2 className="heading-underline mt-3 text-3xl sm:text-4xl font-extrabold text-navy">
            Steel work with a clear plan
          </h2>
          <p className="mt-5 leading-7 text-mist-500">
            Iron cutting, binding, and reinforcement work for every RCC member — beams, slabs, columns, and roofs — across Gujarat.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map(({ key, icon: Icon, label, desc }) => (
            <article key={key}
              className="group flex flex-col gap-4 rounded-card border border-mist-200 bg-white p-6
                         transition-all hover:border-steel/40 hover:shadow-card hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-steel/8 text-steel
                              group-hover:bg-steel group-hover:text-white transition-colors">
                <Icon size={22} aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-base font-bold text-navy">{label}</h3>
                <p className="mt-2 text-sm leading-6 text-mist-500">{desc}</p>
              </div>
              <Link to="/services"
                className="mt-auto inline-flex items-center gap-1.5 text-xs font-bold text-steel
                           opacity-0 group-hover:opacity-100 transition-opacity">
                Learn more <ArrowRight size={13} />
              </Link>
            </article>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/services" className="btn-outline-steel px-8">View All Services</Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   FOUR-PILLAR SECTION  (dark photo background)
   ───────────────────────────────────────────────────────── */
function PillarSection({ liveStats }) {
  // Build live expertise text — shows skeleton while loading
  const projectCount = liveStats.loading ? null : liveStats.totalProjects;
  const years        = STATS[0]?.value || 15;

  return (
    <section
      className="section-dark-photo"
      style={{ backgroundImage: 'url(/images/NP-Steel_fabricon.jpg)' }}
    >
      <div className="container-x">
        <div className="text-center py-14 pb-0 mb-2">
          <span className="label-cat label-cat-light">Why Choose NP Construction</span>
          <h2 className="heading-underline mt-3 text-3xl sm:text-4xl font-extrabold text-white">
            Our commitment to every project
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
          {PILLARS.map(({ key, icon: Icon, title, text }) => {
            // Build dynamic text for the expertise pillar
            let displayText = text;
            if (key === 'expertise') {
              if (projectCount === null) {
                displayText = `${years}+ years across residential, commercial & industrial.`;
              } else {
                displayText = `${years}+ years and ${Number(projectCount).toLocaleString('en-IN')}+ projects across residential, commercial & industrial.`;
              }
            }
            return (
              <div key={key} className="pillar-card">
                <div className="pillar-icon">
                  {key === 'expertise' && projectCount === null ? (
                    <>
                      <Icon size={48} strokeWidth={1.5} />
                    </>
                  ) : (
                    <Icon size={48} strokeWidth={1.5} />
                  )}
                </div>
                <p className="pillar-title">{title}</p>
                <p className="pillar-text">{displayText}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   FEATURED PROJECTS
   ───────────────────────────────────────────────────────── */
function ProjectsSection() {
  const [projects, setProjects] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    axios.get(`${API_URL}/api/portfolio`)
      .then(({ data }) => setProjects((data.data || []).slice(0, 3)))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  }, []);

  if (!loading && projects.length === 0) return null;

  return (
    <section className="section-mist py-20 sm:py-24">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-5 mb-12">
          <div>
            <span className="label-cat">Featured Work</span>
            <h2 className="heading-underline mt-3 text-3xl sm:text-4xl font-extrabold text-navy">
              Work that carries weight
            </h2>
          </div>
          <Link to="/projects" className="btn-navy text-sm">
            View All Projects <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-5 lg:grid-cols-3">
            {[1, 2, 3].map(n => (
              <div key={n} className="animate-pulse rounded-card overflow-hidden border border-mist-200 bg-white">
                <div className="aspect-[3/2] bg-mist-200" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-3/4 rounded bg-mist-200" />
                  <div className="h-3 w-1/2 rounded bg-mist-200" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-3">
            {projects.map(item => {
              const imgUrl = item.mediaType === 'video'
                ? (item.thumbnailUrl || item.cloudinaryUrl)
                : item.cloudinaryUrl;
              return (
                <article key={item._id}
                  className="group overflow-hidden rounded-card border border-mist-200 bg-white
                             shadow-card hover:shadow-soft hover:-translate-y-1 transition-all">
                  <div className="relative aspect-[3/2] overflow-hidden bg-mist-200">
                    {imgUrl ? (
                      <img src={imgUrl} alt={item.title} loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        onError={e => { e.currentTarget.style.display = 'none'; }} />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-navy/5">
                        <Building2 size={36} className="text-mist-300" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/60 to-transparent
                                    opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-steel/10 px-3 py-1 text-xs font-bold text-steel">
                        {item.city || item.category}
                      </span>
                      {item.tonnage > 0 && (
                        <span className="text-xs font-semibold text-mist-500">{item.tonnage} MT</span>
                      )}
                    </div>
                    <h3 className="mt-4 text-base font-bold text-navy">{item.title}</h3>
                    {item.description && (
                      <p className="mt-1.5 text-sm text-mist-500 line-clamp-2">{item.description}</p>
                    )}
                    <Link to="/projects"
                      className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-steel">
                      View project <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   PROCESS SECTION
   ───────────────────────────────────────────────────────── */
function ProcessSection() {
  const steps = [
    { num: '01', label: 'Enquiry',              desc: 'Share your drawings or site location and we confirm scope and schedule.' },
    { num: '02', label: 'Bar Schedule Review',   desc: 'We review the bar bending schedule and confirm bar sizes, lengths, and quantities.' },
    { num: '03', label: 'Cutting & Bending',     desc: 'Bars are cut to exact lengths and bent to the angles specified in drawings.' },
    { num: '04', label: 'On-Site Binding',       desc: 'Our team binds and ties the reinforcement on site, ready for the concrete pour.' },
  ];
  return (
    <section className="section-light py-20 sm:py-24">
      <div className="container-x">
        <div className="max-w-2xl mb-14">
          <span className="label-cat">How We Work</span>
          <h2 className="heading-underline mt-3 text-3xl sm:text-4xl font-extrabold text-navy">
            A straightforward process
          </h2>
        </div>
        <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.num} className="relative flex gap-5 lg:flex-col lg:gap-0">
              {/* Step number */}
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl
                              bg-navy text-white text-lg font-black lg:mb-6 lg:w-14 lg:h-14">
                {step.num}
              </div>
              {/* Connector (desktop) */}
              {i < steps.length - 1 && (
                <div className="absolute top-7 left-14 right-0 hidden h-px bg-mist-200 lg:block -z-0
                                before:absolute before:right-0 before:top-1/2 before:-translate-y-1/2
                                before:w-1.5 before:h-1.5 before:rounded-full before:bg-steel" />
              )}
              <div>
                <h3 className="text-base font-bold text-navy">{step.label}</h3>
                <p className="mt-2 text-sm leading-6 text-mist-500">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   ESTIMATOR TEASER  (CTA band style)
   ───────────────────────────────────────────────────────── */
function EstimatorSection() {
  const [type, setType] = useState(BUILDING_TYPES[0].value);
  const [area, setArea] = useState('');
  const selected = BUILDING_TYPES.find(b => b.value === type) || BUILDING_TYPES[0];
  const tonnes   = area ? (Number(area) * selected.factor / 1000).toFixed(1) : '—';
  const quoteUrl = `/contact?buildingType=${encodeURIComponent(type)}&area=${encodeURIComponent(area)}`;

  return (
    <section className="cta-band py-20">
      {/* Subtle background SVG */}
      <svg className="cta-band-bg" viewBox="0 0 400 400" fill="none" aria-hidden="true">
        <circle cx="200" cy="200" r="190" stroke="white" strokeWidth="1.5" />
        <circle cx="200" cy="200" r="140" stroke="white" strokeWidth="1" />
        <circle cx="200" cy="200" r="90"  stroke="white" strokeWidth="0.5" />
        <line x1="0" y1="200" x2="400" y2="200" stroke="white" strokeWidth="0.5" />
        <line x1="200" y1="0" x2="200" y2="400" stroke="white" strokeWidth="0.5" />
      </svg>

      <div className="container-x relative z-10 grid gap-10 lg:grid-cols-[1fr_380px] lg:items-center">
        <div>
          <span className="label-cat label-cat-light">Quick Estimator</span>
          <h2 className="heading-underline mt-3 text-3xl sm:text-4xl font-extrabold text-white">
            Get an early sense of your steel requirement
          </h2>
          <p className="mt-5 max-w-lg leading-7 text-white/65">
            Use this indicative estimate to start the conversation.
            Final tonnage is confirmed from structural drawings.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-stat text-navy">
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-mist-500">
              Building Type
              <select value={type} onChange={e => setType(e.target.value)}
                className="mt-1.5 min-h-11 w-full rounded-xl border-2 border-mist-200 px-3 text-sm
                           font-normal outline-none focus:border-steel transition-colors">
                {BUILDING_TYPES.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </select>
            </label>
            <label className="block text-xs font-bold uppercase tracking-wider text-mist-500">
              Area (sq ft)
              <input type="number" min="0" value={area} onChange={e => setArea(e.target.value)}
                placeholder="Enter project area"
                className="mt-1.5 min-h-11 w-full rounded-xl border-2 border-mist-200 px-3 text-sm
                           font-normal outline-none focus:border-steel transition-colors" />
            </label>
          </div>
          <div className="mt-5 rounded-xl bg-mist p-4">
            <p className="text-xs font-semibold text-mist-500 uppercase tracking-wider">Estimated Steel</p>
            <p className="mt-1 text-4xl font-black text-navy">
              {tonnes} <span className="text-base font-semibold text-mist-500">tonnes</span>
            </p>
          </div>
          <Link to={quoteUrl} className="btn-steel mt-5 w-full text-sm">
            Get Exact Quote <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   REVIEWS STRIP
   ───────────────────────────────────────────────────────── */
function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    axios.get(`${API_URL}/api/reviews`)
      .then(({ data }) => setReviews((data.data || []).slice(0, 3)))
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, []);
  if (!loading && !reviews.length) return null;
  return (
    <section className="section-mist py-20 sm:py-24">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-5 mb-12">
          <div>
            <span className="label-cat">Client Reviews</span>
            <h2 className="heading-underline mt-3 text-3xl sm:text-4xl font-extrabold text-navy">
              What our clients say
            </h2>
          </div>
          <Link to="/reviews" className="btn-outline-steel text-sm px-6">All Reviews</Link>
        </div>
        {loading ? (
          <div className="grid gap-5 md:grid-cols-3">
            {[1, 2, 3].map(n => <div key={n} className="h-52 animate-pulse rounded-card bg-white border border-mist-200" />)}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {reviews.map(r => (
              <article key={r._id || r.submittedAt}
                className="rounded-card border border-mist-200 bg-white p-6 shadow-card hover:shadow-soft transition-shadow">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} size={14} fill={i < r.rating ? 'currentColor' : 'none'}
                      className={i < r.rating ? 'text-amber' : 'text-mist-200'} />
                  ))}
                </div>
                <p className="text-sm leading-6 text-mist-500 line-clamp-4">{r.reviewText}</p>
                <div className="mt-5 pt-4 border-t border-mist-200">
                  <p className="text-sm font-bold text-navy">{r.name}</p>
                  <p className="mt-0.5 text-xs text-mist-500">{r.projectName || 'Structural steel project'}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   SERVICE AREAS
   ───────────────────────────────────────────────────────── */
function ServiceAreasSection({ liveStats }) {
  return (
    <section className="section-light py-16 border-t border-mist-200">
      <div className="container-x">
        <div className="mb-8">
          <span className="label-cat">Service Areas</span>
          <h2 className="heading-underline mt-3 text-2xl sm:text-3xl font-extrabold text-navy">
            Iron work across Gujarat
          </h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {SERVICE_AREAS.map(area => {
            const count = liveStats.getCityProjects(area.city);
            return (
              <Link key={area.slug} to={`/services/${area.slug}`}
                className="group inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-mist-200
                           px-5 py-2 text-sm font-semibold text-navy transition-all
                           hover:border-steel hover:bg-steel hover:text-white">
                <MapPin size={13} className="group-hover:text-white" />
                {area.city}
                <span className="text-xs font-normal opacity-60">
                  {count === null
                    ? <span className="inline-block h-3 w-5 animate-pulse rounded bg-mist-200 align-middle" />
                    : `(${count})`}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   FINAL CTA  (all logic preserved, new layout)
   ───────────────────────────────────────────────────────── */
function FinalCta() {
  const [form,    setForm]    = useState({ name: '', phone: '', workType: WORK_TYPES[0] });
  const [loading, setLoading] = useState(false);

  const submit = async e => {
    e.preventDefault();
    if (!form.name.trim() || !/^[6-9]\d{9}$/.test(form.phone)) {
      toast.error('Please enter a valid name and 10-digit phone number.'); return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/callback`, {
        name: form.name.trim(), phone: form.phone,
        workType: form.workType, preferredTime: 'Morning (9am–12pm)',
      });
      toast.success('Thanks. We will call you soon.');
      setForm({ name: '', phone: '', workType: WORK_TYPES[0] });
    } catch {
      toast.error('We could not submit your request. Please call us directly.');
    } finally { setLoading(false); }
  };

  return (
    <section className="cta-band py-20">
      {/* Background SVG */}
      <svg className="cta-band-bg" viewBox="0 0 500 300" fill="none" aria-hidden="true">
        <rect x="60"  y="60"  width="380" height="180" rx="12" stroke="white" strokeWidth="1" />
        <rect x="100" y="90"  width="300" height="120" rx="8"  stroke="white" strokeWidth="0.6" />
        <line x1="60"  y1="150" x2="440" y2="150" stroke="white" strokeWidth="0.5" />
        <circle cx="250" cy="150" r="50" stroke="white" strokeWidth="0.5" />
      </svg>

      <div className="container-x relative z-10 grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <span className="label-cat label-cat-light">Start a Conversation</span>
          <h2 className="heading-underline mt-3 text-3xl sm:text-4xl font-extrabold text-white">
            Need iron cutting, binding & reinforcement work?
          </h2>
          <p className="mt-5 max-w-md leading-7 text-white/65">
            Share your RCC drawings or bar bending schedule and our team will confirm scope and start date — no obligation.
          </p>
          <a href={`tel:${SITE.phoneRaw}`}
            className="mt-6 inline-flex min-h-11 items-center gap-3 text-sm font-bold text-white
                       hover:text-amber transition-colors">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-steel/20">
              <Phone size={16} />
            </span>
            {SITE.phone}
          </a>
        </div>

        <form onSubmit={submit}
          className="rounded-2xl border border-white/12 bg-white/6 p-6 sm:p-8 backdrop-blur-sm">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-white/60 sm:col-span-1">
              Name
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required
                className="mt-1.5 min-h-11 w-full rounded-xl border border-white/15 bg-white/8
                           px-3 text-sm font-normal text-white placeholder:text-white/30
                           outline-none focus:border-steel transition-colors" />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
              Phone
              <input value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g,'').slice(0,10) })}
                required inputMode="numeric"
                className="mt-1.5 min-h-11 w-full rounded-xl border border-white/15 bg-white/8
                           px-3 text-sm font-normal text-white placeholder:text-white/30
                           outline-none focus:border-steel transition-colors" />
            </label>
            <label className="block text-xs font-bold uppercase tracking-wider text-white/60 sm:col-span-2">
              Work Type
              <select value={form.workType} onChange={e => setForm({ ...form, workType: e.target.value })}
                className="mt-1.5 min-h-11 w-full rounded-xl border border-white/15 bg-navy/80
                           px-3 text-sm font-normal text-white outline-none focus:border-steel transition-colors">
                {WORK_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </label>
          </div>
          <button disabled={loading}
            className="btn-amber mt-5 w-full disabled:opacity-60 font-bold">
            {loading ? 'Sending…' : 'Request a Callback'}
            <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────
   PAGE SHELL
   ───────────────────────────────────────────────────────── */
export default function Home() {
  const liveStats = useProjectStats();
  const schema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'GeneralContractor',
    name: SITE.name,
    description: 'Iron cutting and binding (RCC reinforcement) contractor for beams, slabs, columns, and roofs in Gujarat, India.',
    url: 'https://REPLACE_WITH_RENDER_URL.onrender.com',
    telephone: SITE.phone,
    email: SITE.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'HIGH-TECH, GMDC Ground, Thaltej',
      addressLocality: 'Ahmedabad',
      addressRegion: 'Gujarat',
      postalCode: '380061',
      addressCountry: 'IN',
    },
    openingHours: 'Mo-Sa 09:00-19:00',
    areaServed: [
      { '@type': 'City', name: 'Ahmedabad' },
      { '@type': 'City', name: 'Surat' },
      { '@type': 'City', name: 'Vadodara' },
      { '@type': 'City', name: 'Rajkot' },
      { '@type': 'City', name: 'Gandhinagar' },
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Iron Cutting & Binding Services',
      itemListElement: [
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Beam Reinforcement Cutting & Binding' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Slab Reinforcement Cutting & Binding' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Column Reinforcement Cutting & Binding' } },
        { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Roof Reinforcement Cutting & Binding' } },
      ],
    },
    sameAs: [],
  }), []);

  return <>
    <Helmet>
      <title>NP Construction | RCC Reinforcement &amp; Iron Binding</title>
      <meta name="description" content="Iron cutting, binding & RCC reinforcement for beams, slabs, columns & roofs in Gujarat. 15+ yrs, 350+ projects. Get a free quote today." />
      <meta property="og:title"       content="NP Construction | RCC Reinforcement & Iron Binding" />
      <meta property="og:description" content="Iron cutting & reinforcement binding for RCC beams, slabs, columns and roofs across Gujarat. 15+ years experience." />
      <meta property="og:type"        content="website" />
      <meta property="og:site_name"   content="NP Construction" />
      <meta name="twitter:card"       content="summary_large_image" />
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>

    <main>
      <HomeHero />
      <AchievementsBand liveStats={liveStats} />
      <ServicesSection />
      <PillarSection liveStats={liveStats} />
      <ProjectsSection />
      <ProcessSection />
      <EstimatorSection />
      <ReviewsSection />
      <ServiceAreasSection liveStats={liveStats} />
      <FinalCta />
    </main>
  </>;
}
