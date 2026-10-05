import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown, Mail, MessageCircle, Search } from 'lucide-react';
import { SITE } from '../utils/siteConfig';
import PageHeader from '../components/PageHeader';

export const FAQS = [
  { category: 'Materials', q: 'What type of iron work do you handle?', a: 'We do iron cutting and binding — also called reinforcement work or rebar work — for RCC construction. This covers cutting reinforcement bars (rebar) to size, bending them to shape, and tying/binding them for beams, slabs, columns, and roof members on residential and commercial sites.' },
  { category: 'Materials', q: 'Do you provide rebar material or only labour?', a: 'We typically provide a labour-only contract — the main contractor or client supplies the rebar and we do the cutting, bending, and binding. We can discuss material supply separately if needed.' },
  { category: 'Pricing', q: 'What is your minimum project size?', a: 'We work on projects of any size, from a single floor slab to a complete multi-storey residential building. Pricing is based on estimated rebar weight (kg) or area (sq ft) of the work involved.' },
  { category: 'Process', q: 'Which areas in Gujarat do you cover?', a: 'We are primarily based in Ahmedabad and actively serve all of Gujarat including Surat, Vadodara, Rajkot, and Gandhinagar. We also take on projects in other states for larger contracts.' },
  { category: 'Pricing', q: 'How do I get a quote?', a: 'You can fill our contact form on this website, WhatsApp us at +91 70165 93309, or call us directly. We typically respond within 2–4 hours during working hours. For detailed quotes, we need a bar bending schedule (BBS) or structural drawings.' },
  { category: 'Timelines', q: 'What is the typical project timeline?', a: 'Timeline depends on the scope. Iron work for a typical residential floor takes 3–7 days depending on slab area and number of beams/columns. We confirm a schedule when we receive the bar bending schedule from the site engineer.' },
  { category: 'Safety', q: 'Are you licensed and insured?', a: 'Yes. We are a registered firm with valid GST registration and all required labour licenses. We maintain workmen\'s compensation insurance for all our site workers.' },
  { category: 'Process', q: 'Do you handle both residential and commercial projects?', a: 'Yes. We regularly work on both. Our residential projects include apartments, bungalow complexes, and housing societies. Commercial projects include offices, retail buildings, and mixed-use developments.' },
  { category: 'Safety', q: 'What quality standards do you follow?', a: 'Our reinforcement work follows IS 456 (Plain and Reinforced Concrete Code of Practice) and IS 1786 (Fe500/Fe550 TMT rebar specification). We ensure correct bar diameter, spacing, lap length, and cover blocks as specified in the structural drawings for all cutting and binding work.' },
  { category: 'Timelines', q: 'How do you handle project delays?', a: 'We commit to a work schedule in writing. In case of delays due to unforeseen site conditions, we communicate immediately and mobilise additional workers to recover the programme.' },
  { category: 'Process', q: 'Can I share my structural drawings to get a quote?', a: 'Yes. Use our contact form to attach structural drawings (PDF, JPG, or PNG up to 10MB). Our team will review them and prepare a detailed estimate within 24–48 hours.' },
  { category: 'Materials', q: 'Which rebar grades do you work with?', a: 'We work with Fe500 and Fe550 TMT bars as per IS 1786 — the most common grades used in residential and commercial RCC reinforcement work in Gujarat. We cut and bind to the bar diameters and spacing specified in your structural drawings or bar bending schedule.' },
];

const CATEGORIES = ['Pricing', 'Process', 'Materials', 'Timelines', 'Safety'];

function AccordionItem({ faq, index, isOpen, toggle, reducedMotion }) {
  const answerId = `faq-answer-${index}`;
  const buttonId = `faq-question-${index}`;

  return (
    <div className={`overflow-hidden border bg-white transition-colors ${isOpen ? 'border-steel' : 'border-mist-200'}`}>
      <button id={buttonId} type="button" onClick={toggle} aria-expanded={isOpen} aria-controls={answerId}
        className="flex min-h-16 w-full items-center justify-between gap-5 px-5 py-4 text-left hover:bg-mist focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-steel sm:px-6">
        <span className="font-bold text-navy">{faq.q}</span>
        <ChevronDown size={20} aria-hidden="true" className={`shrink-0 text-steel transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.25, ease: 'easeOut' }} className="overflow-hidden">
            <div id={answerId} role="region" aria-labelledby={buttonId} className="border-t border-mist-200 px-5 pb-5 pt-4 text-sm leading-7 text-mist-500 sm:px-6">
              {faq.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQ() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Pricing');
  const [open, setOpen] = useState(() => new Set([2]));
  const [reducedMotion, setReducedMotion] = useState(false);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = () => setReducedMotion(mediaQuery.matches);
    updateMotionPreference();
    mediaQuery.addEventListener('change', updateMotionPreference);
    return () => mediaQuery.removeEventListener('change', updateMotionPreference);
  }, []);

  const filteredFaqs = useMemo(() => {
    const search = query.trim().toLowerCase();
    return FAQS.map((faq, index) => ({ ...faq, index })).filter((faq) =>
      faq.category === category && (!search || `${faq.q} ${faq.a}`.toLowerCase().includes(search))
    );
  }, [category, query]);

  const toggleFaq = (index) => setOpen((current) => {
    const next = new Set(current);
    if (next.has(index)) next.delete(index); else next.add(index);
    return next;
  });

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(({ q, a }) => ({
      '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
  const whatsapp = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('Hello, I have a question about your iron cutting and binding services.')}`;

  return (
    <>
      <Helmet>
        <title>FAQ | RCC Reinforcement &amp; Iron Binding Work</title>
        <meta name="description" content="Common questions about iron cutting & binding for RCC beams, slabs, columns and roofs. Pricing, timelines, rebar grades answered." />
        <meta property="og:title"       content="FAQ | RCC Reinforcement & Iron Binding Work" />
        <meta property="og:description" content="FAQs about NP Construction's reinforcement cutting & binding services, pricing, rebar grades and project timelines." />
        <meta property="og:type"        content="website" />
        <meta property="og:site_name"   content="NP Construction" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <PageHeader
        title="Frequently asked questions"
        subtitle="Clear answers about steel work, pricing, process, timelines, and safety."
        breadcrumb={[{ label: 'FAQ' }]}
        action={<label className="relative block w-full sm:w-72"><span className="sr-only">Search questions</span><Search size={18} aria-hidden="true" className="absolute left-3 top-3.5 text-mist-500" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search questions..." className="min-h-11 w-full rounded-lg border border-mist-200 bg-white pl-10 pr-3 text-sm text-navy outline-none focus:border-steel focus:ring-2 focus:ring-steel/20" /></label>}
      />

      <main className="section-mist py-16 sm:py-20">
        <div className="container-x max-w-4xl">
          <div role="tablist" aria-label="FAQ categories" className="flex gap-2 overflow-x-auto border-b border-mist-200 pb-px">
            {CATEGORIES.map((item) => (
              <button key={item} id={`faq-tab-${item.toLowerCase()}`} type="button" role="tab" aria-selected={category === item}
                aria-controls="faq-results" tabIndex={category === item ? 0 : -1} onClick={() => setCategory(item)}
                className={`min-h-11 shrink-0 border-b-2 px-4 text-sm font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-steel ${category === item ? 'border-steel text-steel' : 'border-transparent text-mist-500 hover:text-navy'}`}>
                {item}
              </button>
            ))}
          </div>

          <div id="faq-results" className="mt-8 space-y-3" role="tabpanel" aria-labelledby={`faq-tab-${category.toLowerCase()}`} aria-live="polite">
            {filteredFaqs.length ? filteredFaqs.map((faq) => (
              <AccordionItem key={faq.index} faq={faq} index={faq.index} isOpen={open.has(faq.index)} toggle={() => toggleFaq(faq.index)} reducedMotion={reducedMotion} />
            )) : <p className="border border-mist-200 bg-white p-8 text-center text-mist-500" role="status">No questions match your search in this category.</p>}
          </div>

          <section className="mt-16 bg-navy p-8 text-center sm:p-12">
            <h2 className="text-2xl font-extrabold text-white">Still have a question?</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/65">Our team can help with your project, drawings, pricing, and next steps.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link to="/contact" className="btn-amber"><Mail size={17} /> Contact our team</Link>
              <a href={whatsapp} target="_blank" rel="noreferrer" className="btn-ghost"><MessageCircle size={17} /> WhatsApp</a>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
