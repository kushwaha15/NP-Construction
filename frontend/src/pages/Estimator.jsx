import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Building2, ChevronDown, Download,
  HardHat, Layers, MessageCircle, RefreshCw, Scale, Wrench,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';

/*
 * ─── REBAR ESTIMATOR ────────────────────────────────────────
 *
 * Estimator for iron cutting & binding work (RCC reinforcement).
 * Estimates approximate rebar weight (kg) per RCC member type.
 *
 * RATES used (indicative, based on common site practice):
 *   Slab     : 4 kg / sq ft  (two-way slab, typical residential)
 *   Beam     : 10 kg / linear ft  (approx for medium-span beam ~300×450mm)
 *   Column   : 15 kg / linear ft  (approx for 300×300mm column)
 *   Roof     : 4 kg / sq ft  (similar to slab, slightly lighter)
 *
 * These are early-planning figures only.
 * Final quantity requires structural drawings and bar bending schedule.
 *
 * LABOUR RATES (₹ per kg, cutting + binding):
 *   Beam     : ₹5.5 – ₹7.0
 *   Slab     : ₹4.5 – ₹6.0
 *   Column   : ₹6.0 – ₹7.5
 *   Roof     : ₹5.0 – ₹6.5
 */

// ── Bar diameter distribution by member type ─────────────────
const BAR_DISTRIBUTION = {
  Beam:   { 8: 0.20, 10: 0.10, 12: 0.30, 16: 0.25, 20: 0.15, 25: 0.00, 32: 0.00 },
  Slab:   { 8: 0.30, 10: 0.35, 12: 0.25, 16: 0.10, 20: 0.00, 25: 0.00, 32: 0.00 },
  Column: { 8: 0.15, 10: 0.05, 12: 0.20, 16: 0.30, 20: 0.20, 25: 0.10, 32: 0.00 },
  Roof:   { 8: 0.35, 10: 0.35, 12: 0.20, 16: 0.10, 20: 0.00, 25: 0.00, 32: 0.00 },
};
const DIAMETERS = [8, 10, 12, 16, 20, 25, 32];

// Weight per metre of rebar (kg/m) = D² / 162
function weightPerMeter(dia) { return (dia * dia) / 162; }

// ── Calculation logic ─────────────────────────────────────────
function calculateRebar({ memberType, quantity, unit }) {
  const qty = parseFloat(quantity);
  if (!qty || qty <= 0) return null;

  // kg of rebar per unit
  const ratePerUnit = {
    Beam:   { sqft: 0,   lft: 10 },
    Slab:   { sqft: 4,   lft: 0  },
    Column: { sqft: 0,   lft: 15 },
    Roof:   { sqft: 4,   lft: 0  },
  };

  const rate = ratePerUnit[memberType]?.[unit] ?? 4;
  const totalKg = Math.round(qty * rate);

  // Labour cost band
  const labourRates = {
    Beam:   [5.5, 7.0],
    Slab:   [4.5, 6.0],
    Column: [6.0, 7.5],
    Roof:   [5.0, 6.5],
  };
  const [minRate, maxRate] = labourRates[memberType] || [5, 7];
  const labourMin = Math.round(totalKg * minRate);
  const labourMax = Math.round(totalKg * maxRate);

  // Bar breakdown by diameter
  const dist = BAR_DISTRIBUTION[memberType] || BAR_DISTRIBUTION.Slab;
  const barBreakdown = DIAMETERS.map(dia => {
    const kg   = Math.round(totalKg * (dist[dia] || 0));
    const bars = kg > 0 ? Math.ceil(kg / (weightPerMeter(dia) * 12)) : 0; // 12m standard bar
    return { dia, kg, bars };
  });

  return { totalKg, labourMin, labourMax, barBreakdown };
}

function fmt(n) { return `₹${n.toLocaleString('en-IN')}`; }

// ── Member type selector ──────────────────────────────────────
const MEMBER_TYPES = [
  { value: 'Slab',   label: 'Slab',   icon: Layers,    unit: 'sqft', unitLabel: 'Area (sq ft)',     text: 'Floor slab or roof slab' },
  { value: 'Beam',   label: 'Beam',   icon: Wrench,    unit: 'lft',  unitLabel: 'Length (linear ft)',text: 'RCC beam reinforcement' },
  { value: 'Column', label: 'Column', icon: Building2, unit: 'lft',  unitLabel: 'Height (linear ft)',text: 'Column cage reinforcement' },
  { value: 'Roof',   label: 'Roof',   icon: HardHat,   unit: 'sqft', unitLabel: 'Area (sq ft)',     text: 'Chhat (roof) reinforcement' },
];

const FAQS = [
  ['Is this a final structural quantity?',   'No. These are early-planning figures. Final quantities require structural drawings and a bar bending schedule (BBS) from your engineer.'],
  ['What does the labour cost band include?', 'The band covers cutting, bending, and tying (binding) labour only. It does not include rebar material cost.'],
  ['Can I send drawings for an exact quote?', 'Yes. Use the "Get exact quote" button below to send these assumptions to our team, then attach drawings on the contact page.'],
];

function Field({ label, unit, children, hint }) {
  return (
    <label className="block text-sm font-bold text-white">
      <span>{label}</span>
      {unit && <span className="ml-1 text-xs font-normal text-white/50">({unit})</span>}
      {children}
      {hint && <span className="mt-1 block text-xs font-normal text-white/55">{hint}</span>}
    </label>
  );
}

function BarBreakdown({ result }) {
  const [open, setOpen] = useState(false);
  const active = result.barBreakdown.filter(b => b.kg > 0);
  return (
    <div className="mt-5 border border-white/10">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between p-4 text-left text-sm font-bold text-white">
        <span>Bar-size breakdown</span>
        <span className="flex items-center gap-2 text-xs text-white/55">
          {active.length} sizes <ChevronDown size={16} className={open ? 'rotate-180' : ''} />
        </span>
      </button>
      {open && (
        <div className="border-t border-white/10 px-4 pb-4">
          <div className="grid grid-cols-3 gap-2 pt-3 text-xs text-white/65">
            <span>Diameter</span><span>Weight</span><span>No. of bars (12m)</span>
            {active.map(b => (
              <React.Fragment key={b.dia}>
                <span className="font-bold text-white">{b.dia} mm</span>
                <span>{b.kg.toLocaleString('en-IN')} kg</span>
                <span>{b.bars.toLocaleString('en-IN')}</span>
              </React.Fragment>
            ))}
          </div>
          <p className="mt-3 text-xs text-white/40">Bar counts assume 12m standard length. Actual bar schedule from engineer may vary.</p>
        </div>
      )}
    </div>
  );
}

export default function Estimator() {
  const [form, setForm] = useState({
    memberType: 'Slab',
    quantity:   '500',
    timeline:   '',
  });
  const [result,     setResult]     = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const set = (key, value) => setForm(cur => ({ ...cur, [key]: value }));

  const selectedType = MEMBER_TYPES.find(t => t.value === form.memberType) || MEMBER_TYPES[0];

  const calculate = () => {
    setResult(calculateRebar({
      memberType: form.memberType,
      quantity:   form.quantity,
      unit:       selectedType.unit,
    }));
  };

  const reset = () => {
    setForm({ memberType: 'Slab', quantity: '500', timeline: '' });
    setResult(null);
  };

  // projectQuery still routes to /contact with relevant params (logic preserved)
  const projectQuery = result
    ? `?ref=estimator&workType=${encodeURIComponent(form.memberType + ' Reinforcement')}&tonnage=${encodeURIComponent(result.totalKg + ' kg')}&message=${encodeURIComponent(`Estimator: ${form.memberType}, ${form.quantity} ${selectedType.unit}.`)}`
    : '?ref=estimator';

  const whatsapp = `https://wa.me/917016593309?text=${encodeURIComponent(
    result
      ? `I need an iron cutting & binding quote. Estimate: ${result.totalKg} kg for ${form.memberType} (${form.quantity} ${selectedType.unit}).`
      : 'I need an iron cutting and binding estimate.'
  )}`;

  const handleDownloadPDF = async () => {
    if (!result) return;
    setPdfLoading(true);
    try {
      const { generatePDF } = await import('../utils/generateEstimatePDF');
      await generatePDF(
        { plotArea: Number(form.quantity), floors: 1, constructionType: form.memberType },
        {
          structKg:   result.totalKg,
          structTon:  (result.totalKg / 1000).toFixed(3),
          strMinCost: result.labourMin,
          strMaxCost: result.labourMax,
          grade:      'Fe500 / Fe550 (IS 1786)',
          barBreakdown: result.barBreakdown,
        }
      );
    } finally { setPdfLoading(false); }
  };

  return <>
    <Helmet>
      <title>Rebar Estimator | RCC Reinforcement Labour Cost</title>
      <meta name="description" content="Estimate rebar quantity and cutting & binding labour cost for RCC beams, slabs, columns and roofs. Free tool by NP Construction." />
      <meta property="og:title"       content="Rebar Estimator | RCC Reinforcement Labour Cost" />
      <meta property="og:description" content="Free rebar estimator for RCC reinforcement work — beams, slabs, columns, roofs. Fe500/Fe550 bar breakdown." />
      <meta property="og:type"        content="website" />
      <meta property="og:site_name"   content="NP Construction" />
    </Helmet>
    <main>
      <PageHeader
        title="Estimate your RCC reinforcement quantity"
        subtitle="Select member type and enter area or length to get an indicative rebar weight, bar breakdown, and reinforcement binding labour range."
        breadcrumb={[{ label: 'Estimator' }]}
      />

      {/* ── Main estimator panel ────────────────────────── */}
      <section className="section-mist py-12 sm:py-16">
        <div className="container-x">
          <div className="grid overflow-hidden rounded-card bg-navy shadow-soft lg:grid-cols-[.9fr_1.1fr]">

            {/* Input panel */}
            <div className="p-6 sm:p-9">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-amber">Estimator inputs</p>
                  <h2 className="mt-2 text-2xl font-extrabold text-white">Select member type</h2>
                </div>
                <button type="button" onClick={reset}
                  className="flex items-center gap-1 text-xs font-bold text-white/60 hover:text-white">
                  <RefreshCw size={14} /> Reset
                </button>
              </div>

              {/* Member type selector */}
              <div className="mt-7">
                <p className="text-sm font-bold text-white mb-3">RCC member type</p>
                <div className="grid gap-2">
                  {MEMBER_TYPES.map(({ value, label, icon: Icon, text }) => (
                    <label key={value}
                      className={`flex cursor-pointer items-center gap-3 border p-3 transition
                        ${form.memberType === value ? 'border-amber bg-amber/10' : 'border-white/10 hover:border-white/35'}`}>
                      <input type="radio" name="memberType" checked={form.memberType === value}
                        onChange={() => set('memberType', value)} className="sr-only" />
                      <Icon size={19} className={form.memberType === value ? 'text-amber' : 'text-white/55'} />
                      <span>
                        <span className="block text-sm font-bold text-white">{label}</span>
                        <span className="block text-xs text-white/55">{text}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Quantity input */}
              <div className="mt-7">
                <Field label={selectedType.unitLabel}>
                  <input
                    type="number" min="1"
                    value={form.quantity}
                    onChange={e => set('quantity', e.target.value)}
                    className="mt-2 w-full rounded-lg border border-white/15 bg-white/10 px-3 py-3 text-white outline-none focus:border-amber"
                  />
                </Field>
              </div>

              <button type="button" onClick={calculate}
                disabled={!form.quantity}
                className="btn-amber mt-7 w-full disabled:opacity-50">
                Calculate estimate <ArrowRight size={17} />
              </button>
            </div>

            {/* Results panel */}
            <div className="bg-navy/70 p-6 sm:p-9 lg:border-l lg:border-white/10">
              {result ? (
                <div>
                  <p className="text-sm font-bold text-amber">Result</p>
                  <p className="mt-3 text-6xl font-extrabold tracking-tight text-white">
                    {result.totalKg.toLocaleString('en-IN')}
                    <span className="text-2xl text-white/55"> kg</span>
                  </p>
                  <p className="mt-2 text-sm text-white/60">Estimated rebar weight</p>
                  <p className="mt-1 text-xs text-white/40">Grade: Fe500 / Fe550 (IS 1786)</p>

                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    <div className="border border-white/10 p-4">
                      <p className="text-xs text-white/55">Rebar range (±10%)</p>
                      <p className="mt-1 font-bold text-white">
                        {Math.round(result.totalKg * 0.9).toLocaleString('en-IN')} –{' '}
                        {Math.round(result.totalKg * 1.1).toLocaleString('en-IN')} kg
                      </p>
                    </div>
                    <div className="border border-white/10 p-4">
                      <p className="text-xs text-white/55">Labour cost band</p>
                      <p className="mt-1 font-bold text-white">
                        {fmt(result.labourMin)} – {fmt(result.labourMax)}
                      </p>
                    </div>
                  </div>

                  <BarBreakdown result={result} />

                  <div className="mt-7 grid gap-2 sm:grid-cols-3">
                    <Link to={`/contact${projectQuery}`} className="btn-amber text-sm">
                      Get exact quote <ArrowRight size={16} />
                    </Link>
                    <button type="button" onClick={handleDownloadPDF} disabled={pdfLoading}
                      className="btn-ghost disabled:opacity-50 text-sm">
                      {pdfLoading ? 'Preparing...' : <><Download size={16} /> Download PDF</>}
                    </button>
                    <a href={whatsapp} target="_blank" rel="noreferrer" className="btn-ghost text-sm">
                      <MessageCircle size={16} /> WhatsApp
                    </a>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[540px] flex-col items-center justify-center text-center">
                  <Scale className="text-amber" size={42} />
                  <h2 className="mt-5 text-2xl font-extrabold text-white">Your reinforcement estimate will appear here</h2>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-white/55">
                    Select a member type, enter the quantity, then calculate an indicative reinforcement quantity and binding labour cost.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section className="section-light py-20">
        <div className="container-x">
          <p className="text-sm font-bold text-steel">Simple planning</p>
          <h2 className="mt-3 text-3xl font-extrabold text-navy">How the reinforcement estimator works</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              ['01', 'Select member type', 'Choose beam, slab, column, or roof.'],
              ['02', 'Enter area or length', 'Add sq ft for slabs/roofs, or linear ft for beams/columns.'],
              ['03', 'Review and enquire', 'See indicative rebar weight, bar breakdown, and labour range. Then send to our team.'],
            ].map(([num, title, text]) => (
              <article key={num} className="border border-mist-200 p-6">
                <span className="text-3xl font-extrabold text-steel">{num}</span>
                <h3 className="mt-5 text-lg font-extrabold text-navy">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-mist-500">{text}</p>
              </article>
            ))}
          </div>
          <p className="mt-8 border-l-2 border-amber pl-4 text-sm leading-6 text-mist-500">
            This is an early-planning estimate only. Final rebar quantities must be confirmed from structural drawings and a bar bending schedule (BBS) prepared by your structural engineer. Bar diameters, spacing, cover, and lap lengths are all project-specific.
          </p>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section className="section-mist py-20">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-sm font-bold text-steel">Questions</p>
              <h2 className="mt-3 text-3xl font-extrabold text-navy">Estimator FAQ</h2>
            </div>
            <Link to="/faq" className="font-bold text-steel">View all FAQs <ArrowRight size={16} className="ml-1 inline" /></Link>
          </div>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {FAQS.map(([q, a]) => (
              <details key={q} className="border border-mist-200 bg-white p-5">
                <summary className="cursor-pointer font-bold text-navy">{q}</summary>
                <p className="mt-3 text-sm leading-6 text-mist-500">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ───────────────────────────────────── */}
      <section className="section-dark py-16">
        <div className="container-x flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-bold text-amber">Ready for a precise number?</p>
            <h2 className="mt-2 text-3xl font-extrabold text-white">Send your bar bending schedule or reinforcement drawings.</h2>
            <p className="mt-3 text-white/70">We will review and confirm exact reinforcement quantities and a cutting & binding labour quote.</p>
          </div>
          <Link to={`/contact${projectQuery}`} className="btn-amber">Get exact quote <ArrowRight size={17} /></Link>
        </div>
      </section>
    </main>
  </>;
}
