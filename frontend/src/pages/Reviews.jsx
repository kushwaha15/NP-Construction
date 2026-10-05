import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../utils/api';
import { ArrowRight, CheckCircle2, ChevronDown, MessageCircle, PenLine, Star, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const FEATURED_TESTIMONIALS = [
  { quote: "NP Construction completed our 8-storey residential building's complete steel framework in record time. Professional team, zero compromise on safety. Highly recommended to all builders!", name: 'Rajesh Kumar', role: 'Builder, Mumbai', project: 'Residential steel framework' },
  { quote: 'Excellent fabrication and erection work for our residential complex. Precise joints, great weld quality, and the team was on-site every day without fail.', name: 'Amit Sharma', role: 'Developer, Pune', project: 'Residential complex' },
];

const PAGE_SIZE = 12;

function Stars({ rating, size = 16 }) {
  return <span className="flex gap-1" aria-label={`${rating} out of 5 stars`}>{[1, 2, 3, 4, 5].map((value) => <Star key={value} size={size} fill={value <= rating ? 'currentColor' : 'none'} className={value <= rating ? 'text-amber' : 'text-mist-300'} aria-hidden="true" />)}</span>;
}

function ReviewCard({ review }) {
  const [expanded, setExpanded] = useState(false);
  const initials = review.name.split(' ').map((word) => word[0]).join('').slice(0, 2).toUpperCase();
  const date = new Date(review.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  return <article className="border border-mist-200 bg-white p-6 shadow-sm"><Stars rating={review.rating} /><p className={`mt-5 text-sm italic leading-7 text-mist-500 ${expanded ? '' : 'line-clamp-5'}`}>{review.reviewText}</p>{review.reviewText.length > 260 && <button type="button" onClick={() => setExpanded((value) => !value)} className="mt-2 text-xs font-bold text-steel">{expanded ? 'Show less' : 'Read more'}</button>}{review.projectName && <p className="mt-5 text-xs font-bold text-steel">{review.projectName}</p>}<div className="mt-6 flex items-center justify-between gap-3 border-t border-mist-200 pt-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy text-xs font-bold text-white">{initials}</span><span className="text-sm font-bold text-navy">{review.name}</span></div><time dateTime={review.submittedAt} className="text-xs text-mist-500">{date}</time></div></article>;
}

function StarSelector({ value, onChange, error }) {
  return <fieldset><legend className="text-xs font-bold uppercase tracking-wider text-mist-500">Rating <span className="text-steel">*</span></legend><div className="mt-2 flex gap-2" role="radiogroup" aria-label="Review rating">{[1, 2, 3, 4, 5].map((rating) => <label key={rating} className="cursor-pointer"><input type="radio" name="rating" value={rating} checked={value === rating} onChange={() => onChange(rating)} className="sr-only peer" /><span className="block rounded p-1 text-mist-300 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-steel peer-checked:text-amber hover:text-amber"><Star size={25} fill="currentColor" aria-hidden="true" /></span><span className="sr-only">{rating} star{rating === 1 ? '' : 's'}</span></label>)}</div>{error && <p className="mt-1 text-xs text-red-600">{error}</p>}</fieldset>;
}

function ReviewForm({ onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', rating: 0, projectName: '', reviewText: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const update = (key, value) => { setForm((current) => ({ ...current, [key]: value })); setErrors((current) => { const next = { ...current, [key]: '' }; delete next.submit; return next; }); };
  const submit = async (event) => { event.preventDefault(); const nextErrors = {}; if (!form.name.trim()) nextErrors.name = 'Name is required'; if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Enter a valid email'; if (!form.rating) nextErrors.rating = 'Select a rating'; if (!form.reviewText.trim()) nextErrors.reviewText = 'Write a review'; if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; } setLoading(true); try { await axios.post(`${API_URL}/api/reviews`, { ...form, rating: Number(form.rating) }); onSuccess(); } catch (error) { const data = error.response?.data; const msg = data?.message || (Array.isArray(data?.errors) && data.errors[0]?.msg) || (error.message === 'Network Error' ? 'Cannot reach server. Please try again.' : 'Unable to submit review'); setErrors({ submit: msg }); } finally { setLoading(false); } };
  const input = (field) => `mt-2 w-full rounded-lg border bg-white px-3 py-3 text-sm outline-none focus:border-steel ${errors[field] ? 'border-red-400' : 'border-mist-200'}`;
  return <form onSubmit={submit} noValidate className="bg-white p-6 shadow-soft sm:p-8"><div className="grid gap-5 sm:grid-cols-2"><label className="text-xs font-bold uppercase tracking-wider text-mist-500">Name <span className="text-steel">*</span><input value={form.name} onChange={(event) => update('name', event.target.value)} className={input('name')} autoComplete="name" />{errors.name && <span className="mt-1 block text-xs text-red-600">{errors.name}</span>}</label><label className="text-xs font-bold uppercase tracking-wider text-mist-500">Email <span className="text-steel">*</span><span className="ml-1 normal-case font-normal">(not shown publicly)</span><input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} className={input('email')} autoComplete="email" />{errors.email && <span className="mt-1 block text-xs text-red-600">{errors.email}</span>}</label><StarSelector value={form.rating} onChange={(value) => update('rating', value)} error={errors.rating} /><label className="text-xs font-bold uppercase tracking-wider text-mist-500">Project name <span className="normal-case font-normal">(optional)</span><input value={form.projectName} onChange={(event) => update('projectName', event.target.value)} className={input('projectName')} /></label></div><label className="mt-5 block text-xs font-bold uppercase tracking-wider text-mist-500">Review <span className="text-steel">*</span><textarea value={form.reviewText} maxLength={500} rows={5} onChange={(event) => update('reviewText', event.target.value)} className={`${input('reviewText')} resize-none`} /> <span className="mt-1 block text-right text-xs font-normal text-mist-500">{form.reviewText.length}/500</span>{errors.reviewText && <span className="mt-1 block text-xs text-red-600">{errors.reviewText}</span>}</label>{errors.submit && <p className="mt-4 border border-red-200 bg-red-50 p-3 text-sm text-red-700">{errors.submit}</p>}<button disabled={loading} className="btn-steel mt-5 w-full disabled:opacity-60">{loading ? 'Submitting...' : 'Submit review'} <ArrowRight size={17} /></button></form>;
}

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState('All');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => { axios.get(`${API_URL}/api/reviews`).then(({ data }) => setReviews(data.data || [])).catch(() => {}).finally(() => setLoading(false)); }, []);
  const average = reviews.length ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : '0.0';
  const distribution = useMemo(() => [5, 4, 3, 2, 1].map((rating) => ({ rating, count: reviews.filter((review) => review.rating === rating).length })), [reviews]);
  const filtered = ratingFilter === 'All' ? reviews : reviews.filter((review) => review.rating === Number(ratingFilter));
  const visible = filtered.slice(0, visibleCount);
  const handleSuccess = () => { setSubmitted(true); setShowForm(true); };

  // Build structured data string directly (no component inside Helmet)
  const schemaJson = reviews.length >= 3
    ? JSON.stringify({ '@context': 'https://schema.org', '@type': 'AggregateRating', itemReviewed: { '@type': 'LocalBusiness', name: 'NP Construction' }, ratingValue: average, bestRating: '5', worstRating: '1', reviewCount: reviews.length })
    : null;

  return <><Helmet>
    <title>Client Reviews | NP Construction Reinforcement Work</title>
    <meta name="description" content="Read verified reviews from builders who hired NP Construction for iron cutting & binding reinforcement work across Gujarat." />
    <meta property="og:title"       content="Client Reviews | NP Construction Reinforcement Work" />
    <meta property="og:description" content="Verified client reviews for NP Construction — RCC reinforcement contractor in Gujarat." />
    <meta property="og:type"        content="website" />
    <meta property="og:site_name"   content="NP Construction" />
    {schemaJson && <script type="application/ld+json">{schemaJson}</script>}
  </Helmet><main>
    <section className="section-mist border-b border-mist-200 py-12 sm:py-16"><PageHeader title="Reviews from the worksite" subtitle="Honest feedback from builders, developers, engineers, and factory teams who have worked with NP Construction." breadcrumb={[{ label: 'Reviews' }]} /><div className="container-x"><div className="grid gap-6 bg-white p-6 shadow-soft sm:grid-cols-[.7fr_1.3fr] sm:p-8"><div className="border-r border-mist-200 text-center"><p className="text-5xl font-extrabold text-navy">{average}</p><Stars rating={Math.round(Number(average))} size={18} /><p className="mt-2 text-sm text-mist-500">Average rating</p><p className="mt-4 text-2xl font-extrabold text-navy">{reviews.length}</p><p className="text-sm text-mist-500">Approved reviews</p></div><div className="space-y-3">{distribution.map(({ rating, count }) => <div key={rating} className="flex items-center gap-3 text-xs font-bold text-navy"><span className="flex w-12 items-center gap-1">{rating} <Star size={12} fill="currentColor" className="text-amber" /></span><div className="h-2 flex-1 bg-mist-200"><div className="h-full bg-amber" style={{ width: `${reviews.length ? (count / reviews.length) * 100 : 0}%` }} /></div><span className="w-5 text-right text-mist-500">{count}</span></div>)}</div></div></div></section>

    <section className="section-light py-20"><div className="container-x"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-sm font-bold text-steel">Approved feedback</p><h2 className="mt-3 text-3xl font-extrabold text-navy">What clients say</h2></div><div className="flex flex-wrap gap-2" aria-label="Filter reviews by rating">{['All', 5, 4, 3, 2, 1].map((value) => <button type="button" key={value} onClick={() => { setRatingFilter(String(value)); setVisibleCount(PAGE_SIZE); }} className={`rounded-full border px-3 py-2 text-xs font-bold ${String(value) === ratingFilter ? 'border-steel bg-steel text-white' : 'border-mist-200 text-navy'}`}>{value === 'All' ? 'All ratings' : `${value} stars`}</button>)}</div></div>{loading ? <div className="py-20 text-center text-mist-500">Loading reviews...</div> : filtered.length === 0 ? <div className="py-20 text-center text-mist-500">No approved reviews match this rating.</div> : <><div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visible.map((review) => <ReviewCard key={review._id} review={review} />)}</div>{visible.length < filtered.length && <div className="mt-10 text-center"><button type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)} className="btn-navy">Load more <ChevronDown size={17} /></button></div>}</>}</div></section>

    <section className="section-dark py-20"><div className="container-x"><p className="text-sm font-bold text-amber">Featured testimonials</p><h2 className="mt-3 text-3xl font-extrabold text-white">Trust built project by project</h2><div className="mt-10 grid gap-6 lg:grid-cols-2">{FEATURED_TESTIMONIALS.map((testimonial) => <blockquote key={testimonial.name} className="border border-white/15 bg-white/5 p-7 sm:p-9"><MessageCircle className="text-amber" size={28} /><p className="mt-6 text-xl font-semibold leading-9 text-white">“{testimonial.quote}”</p><footer className="mt-7 border-t border-white/15 pt-5"><p className="font-bold text-white">{testimonial.name}</p><p className="mt-1 text-sm text-white/60">{testimonial.role} · {testimonial.project}</p></footer></blockquote>)}</div></div></section>

    <section className="section-mist py-20"><div className="container-x grid gap-10 lg:grid-cols-[.7fr_1.3fr] lg:items-start"><div><p className="text-sm font-bold text-steel">Share your experience</p><h2 className="mt-3 text-3xl font-extrabold text-navy">Submit a review</h2><p className="mt-4 leading-7 text-mist-500">Your review is sent to our team and appears publicly only after approval.</p><button type="button" onClick={() => { setShowForm((value) => !value); setSubmitted(false); }} className="btn-navy mt-6">{showForm ? <X size={17} /> : <PenLine size={17} />}{showForm ? 'Close form' : 'Write a review'}</button></div>{showForm ? submitted ? <div className="bg-white p-8 text-center shadow-soft"><CheckCircle2 className="mx-auto text-green-600" size={42} /><h3 className="mt-4 text-xl font-extrabold text-navy">Thank you for your review</h3><p className="mt-3 leading-7 text-mist-500">It has been submitted successfully and will appear after approval.</p></div> : <ReviewForm onSuccess={handleSuccess} /> : <div className="flex min-h-48 items-center justify-center border border-dashed border-mist-300 bg-white/60 p-8 text-center text-mist-500">Your feedback helps future clients understand how we work.</div>}</div></section>

    <section className="section-dark border-t border-white/10 py-16"><div className="container-x flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center"><div><p className="text-sm font-bold text-amber">Planning a build?</p><h2 className="mt-2 text-3xl font-extrabold text-white">Work with a team clients recommend.</h2></div><Link to="/contact" className="btn-amber">Request a quote <ArrowRight size={17} /></Link></div></section>
  </main></>;
}
