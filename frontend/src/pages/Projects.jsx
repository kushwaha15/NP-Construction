import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../utils/api';
import { ArrowRight, CalendarDays, CheckCircle2, ChevronDown, ChevronRight, Clock3, ImageIcon, MapPin, Play, Scale, X } from 'lucide-react';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { PROJECT_BEFORE_AFTER, SITE } from '../utils/siteConfig';
import PageHeader from '../components/PageHeader';

const CATEGORIES = ['All', 'Residential', 'Commercial', 'Industrial'];
const MEDIA_TYPES = ['All', 'Photos', 'Videos'];
const INITIAL_COUNT = 12;

function cloudinaryImage(url, width = 900) {
  if (!url || !url.includes('/upload/')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
}

function cloudinarySrcSet(url) {
  if (!url || !url.includes('/upload/')) return undefined;
  return [480, 720, 1080].map((width) => `${cloudinaryImage(url, width)} ${width}w`).join(', ');
}

/** Shown when a portfolio item has no uploaded image */
function ProjectPlaceholder({ title, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 bg-navy/5 border border-mist-200 ${className}`}>
      <ImageIcon size={36} className="text-mist-300" aria-hidden="true" />
      <p className="max-w-[80%] text-center text-sm font-semibold text-mist-500 line-clamp-2">{title}</p>
    </div>
  );
}

function mediaToProject(item) {
  const hasMedia = !!item.cloudinaryUrl;
  return {
    id:        `media-${item._id}`,
    title:     item.title,
    city:      item.city || 'Gujarat',
    category:  item.category || 'Other',
    image:     hasMedia
                 ? (item.mediaType === 'video'
                     ? (item.thumbnailUrl || cloudinaryImage(item.cloudinaryUrl))
                     : item.cloudinaryUrl)
                 : '',          // empty string = no media
    mediaUrl:  item.cloudinaryUrl || '',
    mediaType: item.mediaType || '',
    tonnage:   item.tonnage > 0 ? `${item.tonnage} MT` : '—',
    duration:  'On programme',
    year:      new Date(item.uploadedAt || Date.now()).getFullYear(),
    problem:   item.description || 'A documented NP Construction steel work package.',
    scope:     item.description || 'Fabrication, erection, and project-specific steel coordination.',
  };
}

function SkeletonCards() {
  return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="animate-pulse bg-white"><div className="aspect-[4/3] bg-mist-200" /><div className="space-y-3 p-5"><div className="h-4 w-3/4 rounded bg-mist-200" /><div className="h-3 w-1/2 rounded bg-mist-200" /><div className="h-3 w-2/3 rounded bg-mist-200" /></div></div>)}</div>;
}

function ProjectModal({ project, onClose }) {
  const beforeAfter = PROJECT_BEFORE_AFTER.find((item) => item.title.toLowerCase().includes(project.title.toLowerCase().split(' ')[0].toLowerCase()));
  useEffect(() => { const close = (event) => event.key === 'Escape' && onClose(); window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close); }, [onClose]);

  const mediaEl = project.mediaType === 'video' && project.mediaUrl
    ? <video src={project.mediaUrl} poster={project.image || undefined} controls autoPlay className="aspect-[4/3] w-full bg-black object-contain" />
    : project.image
      ? <img src={cloudinaryImage(project.image)} srcSet={cloudinarySrcSet(project.image)} sizes="(min-width: 1024px) 60vw, 100vw" alt={project.title} className="aspect-[4/3] w-full object-cover" />
      : <ProjectPlaceholder title={project.title} className="aspect-[4/3] w-full" />;

  return <div className="fixed inset-0 z-[9999] overflow-y-auto bg-navy/90 p-4 sm:p-8" onClick={(event) => event.target === event.currentTarget && onClose()}><article className="mx-auto max-w-5xl bg-white shadow-soft"><div className="flex items-center justify-between border-b border-mist-200 p-5"><div><p className="text-xs font-bold uppercase tracking-wider text-steel">{project.category} · {project.city}</p><h2 className="mt-1 text-2xl font-extrabold text-navy">{project.title}</h2></div><button type="button" onClick={onClose} aria-label="Close project details" className="text-mist-500 hover:text-navy"><X size={24} /></button></div><div className="grid gap-8 p-5 sm:p-8 lg:grid-cols-[1.2fr_.8fr]"><div>{mediaEl}<div className="mt-5 grid grid-cols-3 gap-3"><div className="border border-mist-200 p-3"><Scale size={17} className="text-steel" /><p className="mt-2 text-xs text-mist-500">Tonnage</p><p className="font-bold text-navy">{project.tonnage}</p></div><div className="border border-mist-200 p-3"><Clock3 size={17} className="text-steel" /><p className="mt-2 text-xs text-mist-500">Duration</p><p className="font-bold text-navy">{project.duration}</p></div><div className="border border-mist-200 p-3"><MapPin size={17} className="text-steel" /><p className="mt-2 text-xs text-mist-500">City</p><p className="font-bold text-navy">{project.city}</p></div></div>{beforeAfter && <div className="mt-7"><h3 className="mb-3 font-bold text-navy">Before and after</h3><ReactCompareSlider itemOne={<ReactCompareSliderImage src={beforeAfter.before} alt="Before project" />} itemTwo={<ReactCompareSliderImage src={beforeAfter.after} alt="After project" />} /></div>}</div><div><h3 className="text-lg font-extrabold text-navy">The project brief</h3><p className="mt-3 leading-7 text-mist-500">{project.problem}</p><h3 className="mt-7 text-lg font-extrabold text-navy">Scope delivered</h3><p className="mt-3 leading-7 text-mist-500">{project.scope}</p><Link to={`/contact?city=${encodeURIComponent(project.city)}&project=${encodeURIComponent(project.title)}`} onClick={onClose} className="btn-steel mt-8 w-full">Request similar project <ArrowRight size={17} /></Link></div></div></article></div>;
}

export default function Projects() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category') || 'All';
  const city     = searchParams.get('city')     || 'All';
  const media    = searchParams.get('media')    || 'All';

  const [items, setItems]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [selected, setSelected]         = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/portfolio`)
      .then(({ data }) => setItems((data.data || []).map(mediaToProject)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { setVisibleCount(INITIAL_COUNT); }, [category, city, media]);

  // Only real DB items — no hardcoded fallback
  const cities = useMemo(
    () => ['All', ...new Set(items.map((p) => p.city).filter(Boolean))],
    [items]
  );

  const filtered = items.filter((project) =>
    (category === 'All' || project.category?.toLowerCase() === category.toLowerCase()) &&
    (city     === 'All' || project.city === city) &&
    (media    === 'All' || (media === 'Videos' ? project.mediaType === 'video' : project.mediaType !== 'video'))
  );

  const visible = filtered.slice(0, visibleCount);
  const updateFilter = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'All') next.delete(key); else next.set(key, value);
    setSearchParams(next);
  };
  const clearFilters = () => setSearchParams({});

  return <>
    <Helmet>
      <title>Projects | NP Construction RCC Reinforcement Work</title>
      <meta name="description" content="Browse NP Construction's completed reinforcement projects — beams, slabs, columns & roofs across Ahmedabad, Surat, Vadodara and Gujarat." />
      <meta property="og:title"       content="Projects | NP Construction RCC Reinforcement Work" />
      <meta property="og:description" content="Completed iron cutting & binding projects for RCC structures across Gujarat. Photos and details." />
      <meta property="og:type"        content="website" />
      <meta property="og:site_name"   content="NP Construction" />
    </Helmet>
    <main>
      <PageHeader title="Steel work you can inspect" subtitle="Browse completed structures, fabrication packages, site work, and uploaded project media from across Gujarat." breadcrumb={[{ label: 'Projects' }]} />

      {/* ── Sticky filter bar ──────────────────────────────── */}
      <section className="sticky top-[68px] z-30 border-b border-mist-200 bg-white/95 py-3.5 backdrop-blur">
        <div className="container-x flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-0.5">
            {CATEGORIES.map(value => (
              <button type="button" key={value} onClick={() => updateFilter('category', value)}
                className={`whitespace-nowrap rounded-full border-2 px-4 py-2 text-sm font-bold transition-all
                  ${category === value ? 'border-steel bg-steel text-white' : 'border-mist-200 text-navy hover:border-steel'}`}>
                {value}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <label className="sr-only" htmlFor="project-city">Filter by city</label>
            <select id="project-city" value={city} onChange={e => updateFilter('city', e.target.value)}
              className="min-h-10 rounded-xl border-2 border-mist-200 bg-white px-3 text-sm font-semibold text-navy
                         outline-none focus:border-steel transition-colors">
              <option value="All">All cities</option>
              {cities.filter(v => v !== 'All').map(v => <option key={v}>{v}</option>)}
            </select>
            <div className="flex rounded-xl border-2 border-mist-200 p-1">
              {MEDIA_TYPES.map(value => (
                <button type="button" key={value} onClick={() => updateFilter('media', value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors
                    ${media === value ? 'bg-navy text-white' : 'text-mist-500 hover:text-navy'}`}>
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Project grid ──────────────────────────────────── */}
      <section className="section-mist py-16">
        <div className="container-x">
          {loading ? (
            <SkeletonCards />
          ) : items.length === 0 ? (
            <div className="py-24 text-center">
              <ImageIcon className="mx-auto text-mist-300" size={52} aria-hidden="true" />
              <h2 className="mt-6 text-2xl font-extrabold text-navy">No projects yet — check back soon</h2>
              <p className="mt-3 max-w-md mx-auto leading-7 text-mist-500">
                Our project portfolio will appear here as work is added. In the meantime, get in touch.
              </p>
              <Link to="/contact" className="btn-steel mt-8 inline-flex text-sm">Get a quote <ArrowRight size={15} className="ml-1" /></Link>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <ImageIcon className="mx-auto text-mist-300" size={44} aria-hidden="true" />
              <h2 className="mt-5 text-2xl font-extrabold text-navy">No projects match these filters</h2>
              <button type="button" onClick={clearFilters} className="btn-steel mt-6 text-sm">Clear filters</button>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm font-semibold text-mist-500">
                  Showing {visible.length} of {filtered.length} projects
                </p>
                {(category !== 'All' || city !== 'All' || media !== 'All') && (
                  <button type="button" onClick={clearFilters} className="text-sm font-bold text-crimson">Clear filters</button>
                )}
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map(project => (
                  <button type="button" key={project.id} onClick={() => setSelected(project)}
                    className="group overflow-hidden rounded-card bg-white text-left shadow-card
                               transition-all hover:-translate-y-1 hover:shadow-soft">
                    <div className="relative aspect-[4/3] overflow-hidden bg-mist-200">
                      {project.image ? (
                        <>
                          <img
                            src={cloudinaryImage(project.image)}
                            srcSet={cloudinarySrcSet(project.image)}
                            sizes="(min-width: 1024px) 33vw, 100vw"
                            alt={project.title} loading="lazy"
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                            onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling?.style && (e.currentTarget.nextSibling.style.display = 'flex'); }}
                          />
                          <ProjectPlaceholder title={project.title} className="absolute inset-0 hidden" />
                        </>
                      ) : (
                        <ProjectPlaceholder title={project.title} className="absolute inset-0" />
                      )}
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent
                                      opacity-0 group-hover:opacity-100 transition-opacity" />
                      {project.mediaType === 'video' && project.image && (
                        <span className="absolute inset-0 flex items-center justify-center bg-navy/20">
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber text-navy">
                            <Play size={19} fill="currentColor" />
                          </span>
                        </span>
                      )}
                      <span className="absolute left-3 top-3 rounded-full bg-navy/80 px-3 py-1 text-xs font-bold text-white">
                        {project.category}
                      </span>
                    </div>
                    <div className="p-5">
                      <h2 className="font-extrabold text-navy">{project.title}</h2>
                      <p className="mt-2 flex items-center gap-1 text-xs text-mist-500">
                        <MapPin size={13} className="text-steel" />{project.city}
                      </p>
                      <div className="mt-3 flex gap-4 text-xs font-semibold text-mist-500">
                        <span className="flex items-center gap-1"><Scale size={13} className="text-steel" />{project.tonnage}</span>
                        <span className="flex items-center gap-1"><Clock3 size={13} className="text-steel" />{project.duration}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {visible.length < filtered.length && (
                <div className="mt-10 text-center">
                  <button type="button" onClick={() => setVisibleCount(c => c + INITIAL_COUNT)} className="btn-navy text-sm">
                    Load more <ChevronDown size={16} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Timeline ──────────────────────────────────────── */}
      <section className="section-light py-20">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-5 mb-12">
            <div>
              <span className="label-cat">Milestones</span>
              <h2 className="heading-underline mt-3 text-3xl font-extrabold text-navy">
                A project timeline built around progress
              </h2>
            </div>
            <CalendarDays className="text-steel" size={30} />
          </div>
          <div className="grid gap-4 md:grid-cols-5">
            {[2020, 2021, 2022, 2023, 2024].map((year, i) => (
              <div key={year} className="border-l-2 border-steel/40 pl-5 hover:border-steel transition-colors">
                <p className="text-2xl font-extrabold text-navy">{year}</p>
                <p className="mt-2 text-sm leading-6 text-mist-500">
                  {i === 4 ? 'Residential frames and active-site erection.'
                   : i === 3 ? 'Industrial structures and commercial packages.'
                   : i === 2 ? 'Phased work for planned developments.'
                   : 'Fabrication, connection, and delivery milestones.'}
                </p>
                <CheckCircle2 className="mt-4 text-steel" size={16} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────── */}
      <section className="cta-band py-16">
        <svg className="cta-band-bg" viewBox="0 0 400 200" fill="none" aria-hidden="true">
          <rect x="20" y="20" width="360" height="160" rx="12" stroke="white" strokeWidth="0.8" />
          <line x1="20" y1="100" x2="380" y2="100" stroke="white" strokeWidth="0.5" />
          <circle cx="200" cy="100" r="60" stroke="white" strokeWidth="0.5" />
        </svg>
        <div className="container-x relative z-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <span className="label-cat label-cat-light">Your Next Build</span>
            <h2 className="heading-underline mt-3 text-3xl font-extrabold text-white">
              Need a steel package like these?
            </h2>
            <p className="mt-3 text-white/60">Share the drawings, city, or approximate tonnage with our team.</p>
          </div>
          <Link to="/contact" className="btn-amber shrink-0 text-sm px-8">
            Request a Quote <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
    {selected && <ProjectModal project={selected} onClose={() => setSelected(null)} />}
  </>;
}
