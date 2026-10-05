import React, { useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../utils/api';
import ReCAPTCHA from 'react-google-recaptcha';
import { useDropzone } from 'react-dropzone';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Clock3, FileText,
  Mail, MapPin, MessageCircle, Phone, Trash2, UploadCloud,
} from 'lucide-react';
import { SITE, RECAPTCHA_SITE_KEY } from '../utils/siteConfig';
import PageHeader from '../components/PageHeader';

/* ── All data / logic constants — DO NOT CHANGE ──────────── */
const MAX_FILES  = 3;
const MAX_SIZE   = 10 * 1024 * 1024;
const WORK_TYPES = [
  { value: 'Beam Reinforcement',   title: 'Beam reinforcement cutting & binding',   text: 'Rebar cutting, stirrup bending, and reinforcement cage binding for RCC beams.' },
  { value: 'Slab Reinforcement',   title: 'Slab reinforcement cutting & binding',   text: 'Mesh cutting and binding for RCC floor and roof slab reinforcement.' },
  { value: 'Column Reinforcement', title: 'Column reinforcement cutting & binding', text: 'Main bar cutting, lateral ties, and reinforcement cage binding for RCC columns.' },
  { value: 'Roof Reinforcement',   title: 'Roof reinforcement cutting & binding',   text: 'Iron cutting and reinforcement binding for chhat and RCC roof members.' },
  { value: 'Other',                title: 'Something else',                         text: 'Tell us about your reinforcement or iron work requirement.' },
];
const STEPS = ['Work type', 'Size & timeline', 'Project details', 'Your details'];

function trackContact(eventName, metadata = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: eventName, ...metadata });
  window.dispatchEvent(new CustomEvent('np-contact-event', { detail: { eventName, ...metadata } }));
}

/* ── Pure styling helpers ────────────────────────────────── */
function FieldError({ children }) {
  return children
    ? <p className="mt-1.5 text-xs font-semibold text-crimson" role="alert">{children}</p>
    : null;
}

const inputCls = (err) =>
  `mt-2 w-full rounded-xl border-2 bg-white px-4 py-3 text-sm text-navy outline-none
   transition focus:border-steel ${err ? 'border-crimson/60 bg-crimson/4' : 'border-mist-200'}`;

/* ── Contact sidebar — all logic identical ───────────────── */
function ContactSidebar() {
  const whatsapp = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('Hello, I need an iron cutting and binding quote.')}`;
  const items = [
    { icon: Phone,          href: `tel:${SITE.phoneRaw}`, label: 'Call Us',        value: SITE.phone,        color: 'bg-steel/10 text-steel', onClick: () => trackContact('contact_phone_click') },
    { icon: MessageCircle,  href: whatsapp,               label: 'WhatsApp',       value: 'Chat with our team', color: 'bg-green-100 text-green-700', target: '_blank', onClick: () => trackContact('contact_whatsapp_click') },
    { icon: Mail,           href: `mailto:${SITE.email}`, label: 'Email',          value: SITE.email,        color: 'bg-steel/10 text-steel' },
    { icon: MapPin,         href: null,                   label: 'Office',         value: SITE.address,      color: 'bg-steel/10 text-steel' },
    { icon: Clock3,         href: null,                   label: 'Working Hours',  value: SITE.hours,        color: 'bg-steel/10 text-steel' },
  ];

  return (
    <aside className="lg:sticky lg:top-28 space-y-6">
      <div className="rounded-2xl border border-mist-200 bg-white p-6 shadow-card sm:p-8">
        <span className="label-cat">Talk to Our Team</span>
        <h2 className="heading-underline mt-3 text-xl font-extrabold text-navy">
          Clear answers, practical next steps.
        </h2>
        <div className="mt-8 space-y-5">
          {items.map(({ icon: Icon, href, label, value, color, target, onClick }) => {
            const inner = (
              <>
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
                  <Icon size={18} />
                </span>
                <span>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-mist-500">{label}</span>
                  <span className="mt-0.5 block text-sm font-semibold text-navy break-all">{value}</span>
                </span>
              </>
            );
            return href
              ? <a key={label} href={href} target={target} rel={target ? 'noreferrer' : undefined}
                  onClick={onClick} className="flex items-start gap-4 group hover:text-steel transition-colors">
                  {inner}
                </a>
              : <div key={label} className="flex items-start gap-4">{inner}</div>;
          })}
        </div>
      </div>

      {/* Map */}
      <div className="overflow-hidden rounded-2xl border border-mist-200 shadow-card">
        <iframe src={SITE.mapEmbed} title="NP Construction office location"
          loading="lazy" referrerPolicy="no-referrer-when-downgrade"
          className="h-56 w-full border-0" />
        <div className="p-4 bg-white">
          <a href="https://www.google.com/maps/dir/?api=1&destination=Thaltej%2C%20Ahmedabad%2C%20Gujarat"
            target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-steel hover:text-steel/80 transition-colors">
            Get directions <ArrowRight size={14} />
          </a>
        </div>
      </div>
    </aside>
  );
}

/* ── Main page — all form logic identical ─────────────────── */
export default function Contact() {
  const captchaRef = useRef(null);
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(() => ({
    workType:  searchParams.get('workType') || '',
    tonnage:   searchParams.get('tonnage')  || '',
    timeline:  '',
    city:      searchParams.get('city')    || '',
    message:   searchParams.get('message') || '',
    name:      '',
    phone:     '',
    email:     '',
  }));
  const [files,          setFiles]          = useState([]);
  const [errors,         setErrors]         = useState({});
  const [loading,        setLoading]        = useState(false);
  const [success,        setSuccess]        = useState(false);
  const [captchaVisible, setCaptchaVisible] = useState(false);

  const update = (field, value) => {
    setForm(cur  => ({ ...cur,  [field]: value }));
    setErrors(cur => ({ ...cur, [field]: '' }));
  };

  const validateStep = cur => {
    const next = {};
    if (cur === 1 && !form.workType) next.workType = 'Choose the type of work you need.';
    if (cur === 2) {
      if (!form.tonnage.trim()) next.tonnage  = 'Add an approximate tonnage or size.';
      if (!form.timeline.trim()) next.timeline = 'Tell us when you would like to start.';
    }
    if (cur === 3) {
      if (!form.city.trim())    next.city    = 'Project city is required.';
      if (!form.message.trim()) next.message = 'Add a short description of the project.';
    }
    if (cur === 4) {
      if (form.name.trim().length < 2) next.name  = 'Enter your full name.';
      if (!/^[6-9]\d{9}$/.test(form.phone))       next.phone = 'Enter a valid 10-digit Indian mobile number.';
      if (!/^\S+@\S+\.\S+$/.test(form.email))     next.email = 'Enter a valid email address.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const nextStep     = () => { if (validateStep(step)) setStep(s => Math.min(4, s + 1)); };
  const previousStep = () => { setErrors({}); setStep(s => Math.max(1, s - 1)); };

  const onDrop = (accepted, rejected) => {
    if (rejected.length) setErrors(c => ({ ...c, files: 'Only PDF, JPG, and PNG files up to 10MB each are allowed.' }));
    else setErrors(c => ({ ...c, files: '' }));
    setFiles(c => [...c, ...accepted].slice(0, MAX_FILES));
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'application/pdf': [], 'image/jpeg': [], 'image/png': [] },
    maxSize: MAX_SIZE, maxFiles: MAX_FILES, onDrop,
  });

  const submit = async e => {
    e.preventDefault();
    if (!validateStep(4)) return;
    setLoading(true);
    try {
      let captchaToken = '';
      if (captchaRef.current?.executeAsync) {
        captchaToken = await captchaRef.current.executeAsync();
        captchaRef.current.reset();
      } else if (RECAPTCHA_SITE_KEY) {
        setCaptchaVisible(true);
        setErrors({ submit: 'Please complete the verification before sending.' });
        setLoading(false); return;
      }
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) =>
        fd.append(k, k === 'message' ? `${v}\n\nPreferred timeline: ${form.timeline}` : v)
      );
      fd.append('captchaToken', captchaToken);
      files.forEach(f => fd.append('files', f));
      await axios.post(`${API_URL}/api/contact`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      trackContact('contact_form_submit', { workType: form.workType, city: form.city });
      setSuccess(true);
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Something went wrong. Please try again.' });
    } finally { setLoading(false); }
  };

  const whatsapp = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('Hello, I need an iron cutting and binding quote.')}`;

  return <>
    <Helmet>
      <title>Get a Free Quote | NP Construction Gujarat</title>
      <meta name="description" content="Request a free reinforcement iron cutting & binding quote in Gujarat. We reply within 24 hours. Beam, slab, column, roof reinforcement." />
      <meta property="og:title"       content="Get a Free Quote | NP Construction Gujarat" />
      <meta property="og:description" content="Get a free iron cutting & binding quote from NP Construction. Reply within 24 hours." />
      <meta property="og:type"        content="website" />
      <meta property="og:site_name"   content="NP Construction" />
    </Helmet>
    <main>
      <PageHeader
        title="Get your free reinforcement & iron work quote"
        subtitle="Tell us what RCC member you are working on. We reply within 24 hours with a practical next step."
        breadcrumb={[{ label: 'Contact' }]}
      />

      <section className="section-light py-16 sm:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[1.2fr_.8fr] lg:items-start">

          {/* Form column */}
          <div>
            {/* Step progress */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <span className="label-cat">Quote Request</span>
                <h2 className="mt-2 text-2xl font-extrabold text-navy">A few details to get started</h2>
              </div>
              <span className="text-sm font-bold text-mist-500">Step {step} of 4</span>
            </div>

            <div className="mb-10 flex gap-2" aria-label="Quote form progress">
              {STEPS.map((label, i) => (
                <div key={label} className="flex flex-1 items-center gap-2">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold
                    ${i + 1 <= step ? 'bg-steel text-white' : 'bg-mist-200 text-mist-500'}`}>
                    {i + 1}
                  </span>
                  <span className={`hidden text-xs font-bold sm:block ${i + 1 <= step ? 'text-navy' : 'text-mist-500'}`}>
                    {label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <span className={`h-0.5 flex-1 ${i + 1 < step ? 'bg-steel' : 'bg-mist-200'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Success state */}
            {success ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-10 text-center">
                <CheckCircle2 className="mx-auto text-green-600" size={52} />
                <h2 className="mt-5 text-2xl font-extrabold text-navy">Your request is on its way</h2>
                <p className="mx-auto mt-3 max-w-lg leading-7 text-mist-500">
                  Thank you. Your quote request has been received. Our team will reply within 24 hours.
                </p>
                <a href={whatsapp} target="_blank" rel="noreferrer"
                  onClick={() => trackContact('contact_success_whatsapp_click')}
                  className="btn-steel mt-7">
                  <MessageCircle size={17} /> Continue on WhatsApp
                </a>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="rounded-2xl border border-mist-200 bg-white p-6 sm:p-8 shadow-card">

                {/* Step 1 */}
                {step === 1 && (
                  <fieldset>
                    <legend className="text-lg font-extrabold text-navy mb-6">
                      What kind of iron work do you need?
                    </legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {WORK_TYPES.map(type => (
                        <label key={type.value}
                          className={`cursor-pointer rounded-xl border-2 p-5 transition
                            ${form.workType === type.value
                              ? 'border-steel bg-steel/5 ring-2 ring-steel/20'
                              : 'border-mist-200 hover:border-steel/50'}`}>
                          <input type="radio" name="workType" value={type.value}
                            checked={form.workType === type.value}
                            onChange={() => update('workType', type.value)}
                            className="sr-only" />
                          <span className="block font-bold text-navy">{type.title}</span>
                          <span className="mt-2 block text-sm leading-6 text-mist-500">{type.text}</span>
                        </label>
                      ))}
                    </div>
                    <FieldError>{errors.workType}</FieldError>
                  </fieldset>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <fieldset>
                    <legend className="text-lg font-extrabold text-navy mb-6">
                      How large is the project?
                    </legend>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-mist-500">
                        Approximate rebar quantity or area
                        <input value={form.tonnage} onChange={e => update('tonnage', e.target.value)}
                          className={inputCls(errors.tonnage)} />
                        <FieldError>{errors.tonnage}</FieldError>
                      </label>
                      <label className="text-xs font-bold uppercase tracking-wider text-mist-500">
                        Preferred start or timeline
                        <input value={form.timeline} onChange={e => update('timeline', e.target.value)}
                          className={inputCls(errors.timeline)} />
                        <FieldError>{errors.timeline}</FieldError>
                      </label>
                    </div>
                  </fieldset>
                )}

                {/* Step 3 */}
                {step === 3 && (
                  <fieldset>
                    <legend className="text-lg font-extrabold text-navy mb-6">
                      Where is the project?
                    </legend>
                    <div className="space-y-5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-mist-500">
                        City / project location
                        <input value={form.city} onChange={e => update('city', e.target.value)}
                          className={inputCls(errors.city)} />
                        <FieldError>{errors.city}</FieldError>
                      </label>
                      <label className="block text-xs font-bold uppercase tracking-wider text-mist-500">
                        Tell us about the scope
                        <textarea value={form.message} onChange={e => update('message', e.target.value)}
                          rows={6} className={`${inputCls(errors.message)} resize-y`} />
                        <FieldError>{errors.message}</FieldError>
                      </label>
                    </div>
                  </fieldset>
                )}

                {/* Step 4 */}
                {step === 4 && (
                  <fieldset>
                    <legend className="text-lg font-extrabold text-navy mb-6">
                      How can we reach you?
                    </legend>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-mist-500">
                        Full name
                        <input value={form.name} onChange={e => update('name', e.target.value)}
                          autoComplete="name" className={inputCls(errors.name)} />
                        <FieldError>{errors.name}</FieldError>
                      </label>
                      <label className="text-xs font-bold uppercase tracking-wider text-mist-500">
                        Phone number
                        <input value={form.phone}
                          onChange={e => update('phone', e.target.value.replace(/\D/g,'').slice(0,10))}
                          inputMode="numeric" autoComplete="tel" className={inputCls(errors.phone)} />
                        <FieldError>{errors.phone}</FieldError>
                      </label>
                      <label className="text-xs font-bold uppercase tracking-wider text-mist-500 sm:col-span-2">
                        Email address
                        <input type="email" value={form.email} onChange={e => update('email', e.target.value)}
                          autoComplete="email" className={inputCls(errors.email)} />
                        <FieldError>{errors.email}</FieldError>
                      </label>
                    </div>

                    {/* File drop zone */}
                    <div className="mt-6">
                      <p className="text-xs font-bold uppercase tracking-wider text-mist-500 mb-2">
                        Optional drawings or references
                      </p>
                      <div {...getRootProps()}
                        className={`cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition
                          ${isDragActive ? 'border-steel bg-steel/5' : 'border-mist-200 hover:border-steel/50'}`}>
                        <input {...getInputProps()} />
                        <UploadCloud className="mx-auto text-steel mb-3" size={28} />
                        <p className="text-sm font-semibold text-navy">
                          {isDragActive ? 'Drop files here' : 'Drag files here or click to browse'}
                        </p>
                        <p className="mt-1 text-xs text-mist-500">PDF, JPG, or PNG · Up to 3 files · 10MB each</p>
                      </div>
                      {files.length > 0 && (
                        <ul className="mt-3 space-y-2">
                          {files.map((file, i) => (
                            <li key={`${file.name}-${i}`}
                              className="flex items-center justify-between rounded-xl border border-mist-200 px-4 py-2.5 text-sm">
                              <span className="flex min-w-0 items-center gap-2 text-navy">
                                <FileText size={15} className="shrink-0 text-steel" />
                                <span className="truncate">{file.name}</span>
                              </span>
                              <button type="button"
                                onClick={() => setFiles(c => c.filter((_, fi) => fi !== i))}
                                aria-label={`Remove ${file.name}`}
                                className="ml-3 text-mist-500 hover:text-crimson transition-colors">
                                <Trash2 size={15} />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                      <FieldError>{errors.files}</FieldError>
                    </div>

                    {captchaVisible && (
                      <div className="mt-5">
                        <ReCAPTCHA ref={captchaRef} sitekey={RECAPTCHA_SITE_KEY} />
                      </div>
                    )}
                    {errors.submit && <FieldError>{errors.submit}</FieldError>}
                  </fieldset>
                )}

                {/* Navigation */}
                <div className="mt-8 flex flex-wrap justify-between gap-3 border-t border-mist-200 pt-6">
                  {step > 1
                    ? <button type="button" onClick={previousStep} className="btn-navy text-sm">
                        <ArrowLeft size={16} /> Back
                      </button>
                    : <span />
                  }
                  {step < 4
                    ? <button type="button" onClick={nextStep} className="btn-steel text-sm">
                        Next step <ArrowRight size={16} />
                      </button>
                    : <button type="submit" disabled={loading} className="btn-steel text-sm disabled:opacity-60">
                        {loading ? 'Sending…' : 'Send my quote request'} <ArrowRight size={16} />
                      </button>
                  }
                </div>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <ContactSidebar />
        </div>
      </section>

      {/* Trust strip */}
      <section className="section-mist border-t border-mist-200 py-12">
        <div className="container-x grid gap-6 sm:grid-cols-3">
          {[
            { icon: Clock3,        title: 'Reply within 24 hours', text: 'A real response from our team.' },
            { icon: CheckCircle2,  title: 'Free estimate',         text: 'Clear scope before you commit.' },
            { icon: ArrowRight,    title: 'No obligation',         text: 'Explore the right next step for your build.' },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-4 items-start">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-steel/8 text-steel">
                <Icon size={18} />
              </div>
              <div>
                <h3 className="font-bold text-navy text-sm">{title}</h3>
                <p className="mt-1 text-sm text-mist-500">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
    <ReCAPTCHA ref={captchaRef} sitekey={RECAPTCHA_SITE_KEY} size="invisible" />
  </>;
}
