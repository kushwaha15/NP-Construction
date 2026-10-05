import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, Building2, CheckCircle2, ChevronRight, HardHat, ImageIcon, MapPin, MessageCircle, ShieldCheck, Wrench } from 'lucide-react';
import { CITIES, CITY_LIST } from '../../data/cities';
import { SITE } from '../../utils/siteConfig';
import useProjectStats from '../../hooks/useProjectStats';
import { API_URL } from '../../utils/api';

const SERVICES = [
  { key: 'beam',   label: 'Beam reinforcement',   icon: Wrench },
  { key: 'slab',   label: 'Slab reinforcement',   icon: ShieldCheck },
  { key: 'column', label: 'Column reinforcement', icon: Building2 },
  { key: 'roof',   label: 'Roof reinforcement',   icon: HardHat },
];

const WHY_CHOOSE_US = [
  { title: 'Accurate cutting every time', text: 'Bars are cut to the exact length specified in your bar bending schedule — no waste, no guesswork.' },
  { title: 'Ready before the pour',       text: 'We coordinate with your site programme so binding is always complete before the concrete team arrives.' },
  { title: 'Experienced iron workers',    text: 'Our team has worked on hundreds of residential and commercial RCC structures across Gujarat.' },
];

function JsonLd({ value }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(value) }} />;
}

export default function ServiceArea() {
  const { city: slug } = useParams();
  const city = CITIES[slug];
  const liveStats = useProjectStats();

  // Fetch real portfolio items for this city
  const [cityProjects, setCityProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  useEffect(() => {
    if (!city) return;
    axios.get(`${API_URL}/api/portfolio`, { params: { city: city.name } })
      .then(({ data }) => setCityProjects((data.data || []).slice(0, 3)))
      .catch(() => setCityProjects([]))
      .finally(() => setProjectsLoading(false));
  }, [city]);

  if (!city) return <div className="container-x flex min-h-[60vh] items-center justify-center py-24 text-center"><div><MapPin className="mx-auto text-steel" size={42} /><h1 className="mt-4 text-2xl font-extrabold text-navy">City not found</h1><Link to="/services" className="mt-4 inline-flex font-bold text-steel">Back to services <ArrowRight size={16} className="ml-2" /></Link></div></div>;

  // Live project count for this city; null while loading
  const liveCount = liveStats.getCityProjects(city.name);
  // Display value: skeleton while null, live count when loaded
  const countDisplay = liveCount === null
    ? <span className="inline-block h-10 w-20 animate-pulse rounded bg-steel/20 align-middle" />
    : <>{liveCount}+</>;
  const countPlain = liveCount === null ? '…' : `${liveCount}+`;

  const canonical = `https://npconstruction.in/services/${slug}`;
  const whatsappUrl = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(`I need an iron cutting and binding quote in ${city.name}.`)}`;
  const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: city.faq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };
  const businessSchema = {
    '@context': 'https://schema.org',
    '@type': 'GeneralContractor',
    name: SITE.name,
    description: `RCC reinforcement and iron cutting & binding contractor serving ${city.name}, Gujarat.`,
    url: canonical,
    telephone: SITE.phone,
    email: SITE.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.address,
      addressLocality: city.name,
      addressRegion: 'Gujarat',
      addressCountry: 'IN',
    },
    openingHours: 'Mo-Sa 09:00-19:00',
    areaServed: [city.name, ...city.localAreas].map((name) => ({ '@type': 'Place', name })),
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
  };

  return <>
    <Helmet>
      <title>RCC Reinforcement &amp; Iron Binding in {city.name} | NP Construction</title>
      <meta name="description" content={`Iron cutting & reinforcement binding for RCC beams, slabs, columns & roofs in ${city.name}, Gujarat. ${countPlain} projects. Free quote.`} />
      <meta property="og:title"       content={`RCC Reinforcement & Iron Binding in ${city.name} | NP Construction`} />
      <meta property="og:description" content={`Reliable iron cutting & binding for RCC structures in ${city.name}. ${countPlain} completed projects. Call for a free quote.`} />
      <meta property="og:type"        content="website" />
      <meta property="og:site_name"   content="NP Construction" />
      <link rel="canonical"           href={canonical} />
      <JsonLd value={faqSchema} />
      <JsonLd value={businessSchema} />
    </Helmet>

    <main>
      <section className="section-mist border-b border-mist-200 py-24 sm:py-32"><div className="container-x grid items-end gap-10 lg:grid-cols-[1.2fr_.8fr]"><div><p className="flex items-center gap-2 text-sm font-bold text-steel"><MapPin size={17} /> Serving {city.name}, Gujarat</p><h1 className="mt-4 max-w-3xl text-4xl font-extrabold tracking-tight text-navy sm:text-6xl">RCC reinforcement & iron binding in {city.name}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-mist-500">{countDisplay} projects completed in and around {city.name}. Iron cutting and reinforcement binding for RCC beams, slabs, columns, and roofs.</p><div className="mt-8 flex flex-wrap gap-3"><Link to={`/contact?city=${slug}`} className="btn-steel">Get a quote <ArrowRight size={17} /></Link><a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-navy"><MessageCircle size={17} /> WhatsApp us</a></div></div><div className="border-l-4 border-steel bg-white p-7 shadow-soft"><p className="text-sm font-bold uppercase tracking-wider text-mist-500">Local project experience</p><p className="mt-2 text-5xl font-extrabold text-navy">{countDisplay}</p><p className="mt-2 leading-7 text-mist-500">Reinforcement projects completed across {city.name} and nearby areas.</p></div></div></section>

      <section className="section-light py-20 sm:py-24"><div className="container-x"><p className="text-sm font-bold text-steel">Why NP Construction</p><h2 className="mt-3 text-3xl font-extrabold text-navy sm:text-4xl">Why choose us in {city.name}?</h2><p className="mt-5 max-w-3xl leading-7 text-mist-500">{city.intro}</p><div className="mt-12 grid gap-5 md:grid-cols-3">{WHY_CHOOSE_US.map(({ title, text }) => <article key={title} className="border border-mist-200 p-6"><CheckCircle2 className="text-steel" size={24} /><h3 className="mt-5 font-extrabold text-navy">{title}</h3><p className="mt-3 text-sm leading-6 text-mist-500">{text}</p></article>)}</div></div></section>

      <section className="section-light border-y border-mist-200 py-20"><div className="container-x"><p className="text-sm font-bold text-steel">Local capability</p><h2 className="mt-3 text-3xl font-extrabold text-navy">Reinforcement services in {city.name}</h2><div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-2">{SERVICES.map(({ key, label, icon: Icon }) => <Link key={key} to={`/contact?service=${key}&city=${slug}`} className="group flex min-h-28 flex-col justify-between border border-mist-200 p-5 transition hover:border-steel hover:shadow-soft"><Icon className="text-steel" size={22} /><span className="flex items-center justify-between gap-2 text-sm font-bold text-navy">{label}<ChevronRight size={16} className="transition group-hover:translate-x-1" /></span></Link>)}</div></div></section>

      {/* Selected work — only shown when real projects exist for this city */}
      {(projectsLoading || cityProjects.length > 0) && (
        <section className="section-mist py-20">
          <div className="container-x">
            <p className="text-sm font-bold text-steel">Selected work</p>
            <h2 className="mt-3 text-3xl font-extrabold text-navy">Recent projects in {city.name}</h2>
            {projectsLoading ? (
              <div className="mt-10 grid gap-5 md:grid-cols-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="animate-pulse bg-white p-6 shadow-sm">
                    <div className="h-4 w-2/3 rounded bg-mist-200" />
                    <div className="mt-3 h-3 w-1/2 rounded bg-mist-200" />
                    <div className="mt-2 h-3 w-3/4 rounded bg-mist-200" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-10 grid gap-5 md:grid-cols-3">
                {cityProjects.map((item) => {
                  const imgUrl = item.mediaType === 'video'
                    ? (item.thumbnailUrl || item.cloudinaryUrl)
                    : item.cloudinaryUrl;
                  return (
                    <article key={item._id} className="bg-white shadow-sm overflow-hidden">
                      <img
                        src={imgUrl}
                        alt={item.title}
                        loading="lazy"
                        className="aspect-[4/3] w-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      <div className="p-6">
                        <p className="text-xs font-bold uppercase tracking-wider text-steel">{item.category}</p>
                        <h3 className="mt-4 text-xl font-extrabold text-navy">{item.title}</h3>
                        {item.description && <p className="mt-3 text-sm leading-6 text-mist-500">{item.description}</p>}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      <section className="section-light py-16"><div className="container-x grid gap-8 lg:grid-cols-[.7fr_1.3fr]"><div><p className="text-sm font-bold text-steel">Coverage</p><h2 className="mt-3 text-3xl font-extrabold text-navy">Areas we cover</h2><p className="mt-4 leading-7 text-mist-500">Our teams serve {city.name}, with regular access to nearby construction and industrial locations.</p></div><div className="flex flex-wrap content-start gap-3">{city.localAreas.map((area) => <span key={area} className="border border-mist-200 px-4 py-2 text-sm font-semibold text-navy">{area}</span>)}</div></div></section>

      <section className="section-light border-t border-mist-200 py-20"><div className="container-x max-w-4xl"><p className="text-sm font-bold text-steel">Local questions</p><h2 className="mt-3 text-3xl font-extrabold text-navy">FAQ about steel work in {city.name}</h2><div className="mt-10 space-y-3">{city.faq.map(({ q, a }) => <details key={q} className="border border-mist-200 p-5"><summary className="cursor-pointer font-bold text-navy">{q}</summary><p className="mt-3 max-w-3xl leading-7 text-mist-500">{a}</p></details>)}</div></div></section>

      <section className="section-mist py-16"><div className="container-x grid gap-8 lg:grid-cols-[1.1fr_.9fr]"><iframe title={`${city.name} service area map`} src={city.mapEmbedUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-80 w-full border-0 bg-mist-200" /><div className="flex flex-col justify-center"><p className="text-sm font-bold text-steel">Find us</p><h2 className="mt-3 text-2xl font-extrabold text-navy">Serving {city.name} and Gujarat</h2><p className="mt-4 leading-7 text-mist-500">{SITE.address}</p><p className="mt-3 text-sm font-semibold text-navy">Nearby reference points: {city.landmarks.join(' · ')}</p><a href={`tel:${SITE.phoneRaw}`} className="mt-6 font-bold text-steel">{SITE.phone}</a></div></div></section>

      <section className="section-mist border-t border-mist-200 py-16"><div className="container-x"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-sm font-bold text-steel">More service areas</p><h2 className="mt-3 text-3xl font-extrabold text-navy">Other cities we serve</h2></div><Link to="/services" className="font-bold text-steel">All services <ArrowRight size={16} className="ml-1 inline" /></Link></div><div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{CITY_LIST.filter(({ slug: otherSlug }) => otherSlug !== slug).map(({ slug: otherSlug, name }) => {
        const otherCount = liveStats.getCityProjects(name);
        return (
          <Link key={otherSlug} to={`/services/${otherSlug}`} className="flex items-center justify-between border border-mist-200 bg-white p-4 font-bold text-navy hover:border-steel">
            <span>{name}</span>
            <span className="text-sm font-medium text-mist-500">
              {otherCount === null
                ? <span className="inline-block h-3 w-8 animate-pulse rounded bg-mist-200" />
                : <>{otherCount}+ <ChevronRight size={15} className="inline" /></>
              }
            </span>
          </Link>
        );
      })}</div></div></section>

      <section className="section-dark py-16"><div className="container-x flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center"><div><p className="text-sm font-bold text-amber">Ready to plan?</p><h2 className="mt-2 text-3xl font-extrabold text-white">Need reinforcement & iron binding work in {city.name}?</h2><p className="mt-3 text-white/70">Share your bar bending schedule or drawings and we will confirm scope and start date.</p></div><Link to={`/contact?city=${slug}`} className="btn-amber">Start your enquiry <ArrowRight size={17} /></Link></div></section>
    </main>
  </>;
}
