import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, HardHat, Layers, Building2, Wrench } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const SERVICES = [
  {
    key: 'beam', title: 'Beam Reinforcement Cutting & Binding', icon: Wrench,
    description: 'Rebar cutting to exact lengths, stirrup bending, and full reinforcement cage binding for RCC beams.',
    specs: ['Fe500/Fe550 rebar as per bar bending schedule', 'Stirrup spacing and cover maintained to IS 456'],
  },
  {
    key: 'slab', title: 'Slab Reinforcement Cutting & Binding', icon: Layers,
    description: 'Cutting and binding of two-way and one-way reinforcement meshes for RCC floor and roof slabs.',
    specs: ['Top and bottom layer bars placed to drawing', 'Accurate spacing and lap length throughout'],
  },
  {
    key: 'column', title: 'Column Reinforcement Cutting & Binding', icon: Building2,
    description: 'Main bar cutting, lateral tie making, and full reinforcement cage binding for RCC columns.',
    specs: ['Main bars, lateral ties, and spirals as specified', 'Correct cover blocks placed before pour'],
  },
  {
    key: 'roof', title: 'Roof Reinforcement Cutting & Binding', icon: HardHat,
    description: 'Iron cutting and reinforcement binding for chhat (roof slabs), sunshades, and RCC roof members.',
    specs: ['Roof slab mesh and cantilever bars as per drawing', 'Reinforcement checked and complete before concrete pour'],
  },
];

/* Rate table — ₹ per kg of rebar (labour rate for cutting + binding) */
/* All calculation logic preserved — updated for rebar labour rates */
const RATES = {
  'Beam Reinforcement':   [5.5, 7.0],
  'Slab Reinforcement':   [4.5, 6.0],
  'Column Reinforcement': [6.0, 7.5],
  'Roof Reinforcement':   [5.0, 6.5],
};

function Calculator() {
  const [form,   setForm]   = useState({ workType: 'Beam Reinforcement', weight: '' });
  const [result, setResult] = useState(null);

  const calculate = () => {
    const kg = Number(form.weight);
    if (!kg) return;
    const [min, max] = RATES[form.workType];
    setResult({
      min: Math.round(kg * min).toLocaleString('en-IN'),
      max: Math.round(kg * max).toLocaleString('en-IN'),
    });
  };

  return (
    <section className="cta-band py-20 sm:py-24">
      <svg className="cta-band-bg" viewBox="0 0 400 400" fill="none" aria-hidden="true">
        <rect x="40" y="40" width="320" height="320" rx="16" stroke="white" strokeWidth="1" />
        <rect x="80" y="80" width="240" height="240" rx="10" stroke="white" strokeWidth="0.5" />
        <line x1="200" y1="40" x2="200" y2="360" stroke="white" strokeWidth="0.4" />
        <line x1="40"  y1="200" x2="360" y2="200" stroke="white" strokeWidth="0.4" />
      </svg>
      <div className="container-x relative z-10">
        <div className="max-w-xl mb-10">
          <span className="label-cat label-cat-light">Labour Rate Estimator</span>
          <h2 className="heading-underline mt-3 text-3xl sm:text-4xl font-extrabold text-white">
            Get an indicative reinforcement labour cost
          </h2>
          <p className="mt-4 leading-7 text-white/65">
            Enter the approximate rebar weight to get an indicative cutting and binding labour range.
            Final rate depends on bar sizes, spacing, and site conditions.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 sm:p-8 shadow-stat max-w-3xl">
          <div className="grid gap-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <label className="text-xs font-bold uppercase tracking-wider text-mist-500">
              Work Type
              <select
                value={form.workType}
                onChange={e => setForm({ ...form, workType: e.target.value })}
                className="mt-1.5 min-h-11 w-full rounded-xl border-2 border-mist-200 px-3 text-sm
                           font-normal outline-none focus:border-steel transition-colors">
                {Object.keys(RATES).map(k => <option key={k}>{k}</option>)}
              </select>
            </label>
            <label className="text-xs font-bold uppercase tracking-wider text-mist-500">
              Approximate Rebar Weight (kg)
              <input
                type="number" min="1" value={form.weight}
                onChange={e => setForm({ ...form, weight: e.target.value })}
                placeholder="e.g. 500"
                className="mt-1.5 min-h-11 w-full rounded-xl border-2 border-mist-200 px-3 text-sm
                           font-normal outline-none focus:border-steel transition-colors" />
            </label>
            <button
              type="button" onClick={calculate} disabled={!form.weight}
              className="btn-steel disabled:opacity-50 text-sm">
              Calculate <ArrowRight size={15} />
            </button>
          </div>
          {result && (
            <div className="mt-5 rounded-xl bg-mist p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-mist-500">Indicative Labour Range</p>
              <p className="mt-1 text-2xl font-black text-navy">
                ₹{result.min} – ₹{result.max}
              </p>
              <p className="mt-1 text-xs text-mist-500">Labour only. Final rate confirmed after site visit and drawing review.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function Services() {
  return <>
    <Helmet>
      <title>Services | Beam, Slab, Column &amp; Roof Reinforcement</title>
      <meta name="description" content="Beam, slab, column & roof reinforcement cutting & binding in Gujarat. Fe500/Fe550 rebar, IS 456 compliant. Get a labour quote today." />
      <meta property="og:title"       content="Services | Beam, Slab, Column & Roof Reinforcement" />
      <meta property="og:description" content="Iron cutting & binding for RCC beams, slabs, columns and roofs in Gujarat. Fe500/Fe550 rebar to IS 456." />
      <meta property="og:type"        content="website" />
      <meta property="og:site_name"   content="NP Construction" />
    </Helmet>
    <main>
      <PageHeader
        title="RCC reinforcement cutting & binding for every member"
        subtitle="Iron cutting, bending, and reinforcement binding for beams, slabs, columns, and roofs — accurate work, ready before every pour."
        breadcrumb={[{ label: 'Services' }]}
        action={<Link to="/contact" className="btn-steel text-sm">Get a Quote <ArrowRight size={15} /></Link>}
      />

      {/* ── Service cards ─────────────────────────────────── */}
      <section className="section-light py-20 sm:py-24">
        <div className="container-x">
          <div className="max-w-2xl mb-12">
            <span className="label-cat">What We Do</span>
            <h2 className="heading-underline mt-3 text-3xl sm:text-4xl font-extrabold text-navy">
              Four core reinforcement services
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {SERVICES.map(({ key, title, icon: Icon, description, specs }) => (
              <article key={key}
                className="group flex flex-col border border-mist-200 bg-white p-6 rounded-card
                           hover:border-steel/40 hover:shadow-card hover:-translate-y-1 transition-all">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-steel/8 text-steel
                                group-hover:bg-steel group-hover:text-white transition-colors mb-5">
                  <Icon size={22} aria-hidden="true" />
                </div>
                <h2 className="text-base font-extrabold text-navy">{title}</h2>
                <p className="mt-3 text-sm leading-7 text-mist-500 flex-1">{description}</p>
                <ul className="mt-4 space-y-2">
                  {specs.map(spec => (
                    <li key={spec} className="flex items-start gap-2 text-sm font-semibold text-navy">
                      <Check size={15} className="mt-0.5 shrink-0 text-steel" aria-hidden="true" />
                      {spec}
                    </li>
                  ))}
                </ul>
                <Link to={`/contact?service=${encodeURIComponent(key)}`}
                  className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-steel
                             opacity-0 group-hover:opacity-100 transition-opacity">
                  Ask about this <ArrowRight size={14} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Calculator ────────────────────────────────────── */}
      <Calculator />

      {/* ── Bottom CTA ───────────────────────────────────── */}
      <section className="section-mist py-16">
        <div className="container-x flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <span className="label-cat">Ready to Plan?</span>
            <h2 className="heading-underline mt-3 text-2xl sm:text-3xl font-extrabold text-navy">
              Send your bar bending schedule or reinforcement drawings.
            </h2>
            <p className="mt-3 leading-7 text-mist-500">We will review the scope and confirm a start date.</p>
          </div>
          <Link to="/contact" className="btn-navy shrink-0 text-sm">
            Request a Quote <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  </>;
}
