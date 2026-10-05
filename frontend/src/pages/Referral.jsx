import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { CheckCircle2, Gift, LoaderCircle, MessageCircle, UserPlus, Wrench } from 'lucide-react';
import api from '../utils/api';
import PageHeader from '../components/PageHeader';

const INITIAL_FORM = {
  referrerName: '',
  referrerPhone: '',
  referredName: '',
  referredPhone: '',
  projectType: '',
};

const STEPS = [
  { title: 'Refer', description: 'Share a builder who may need dependable steel work.', icon: UserPlus },
  { title: 'We build', description: 'Our team connects with them and understands the project.', icon: Wrench },
  { title: 'You get rewarded', description: 'You receive your referral reward when the project moves forward.', icon: Gift },
];

const PROJECT_TYPES = ['Residential', 'Commercial', 'Industrial', 'PEB structure', 'Not sure yet'];

function Field({ label, name, value, onChange, type = 'text', placeholder, maxLength }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-navy">{label}</span>
      <input
        required
        type={type}
        name={name}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={onChange}
        className="mt-2 min-h-12 w-full rounded-lg border border-mist-200 bg-white px-4 text-sm text-navy outline-none transition placeholder:text-mist-500 focus:border-steel focus:ring-2 focus:ring-steel/20"
      />
    </label>
  );
}

export default function Referral() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [error, setError] = useState('');

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError('');
  };

  const updatePhone = (field, value) => update(field, value.replace(/\D/g, '').slice(0, 10));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!/^[6-9]\d{9}$/.test(form.referrerPhone) || !/^[6-9]\d{9}$/.test(form.referredPhone)) {
      setError('Please enter valid 10-digit Indian mobile numbers.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.post('/api/referral', form);
      const message = `I referred ${form.referredName} to NP Construction for a ${form.projectType || 'steel'} project. Learn more: ${window.location.origin}/referral`;
      setShareUrl(`https://wa.me/?text=${encodeURIComponent(message)}`);
      setSubmitted(true);
      toast.success('Thank you for the referral!');
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'We could not submit your referral. Please try again.');
      toast.error('Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Refer a Builder | NP Construction Gujarat</title>
        <meta name="description" content="Know a builder who needs rebar cutting & binding work? Refer them to NP Construction and get rewarded when their project begins." />
        <meta property="og:title"       content="Refer a Builder | NP Construction Gujarat" />
        <meta property="og:description" content="Refer a builder to NP Construction for reinforcement work and earn a reward when their project starts." />
        <meta property="og:type"        content="website" />
        <meta property="og:site_name"   content="NP Construction" />
      </Helmet>

      <main>
        <PageHeader title="Refer a builder." subtitle={<>Refer a builder who needs steel work and get rewarded when their project begins. <span>(TODO: your reward.)</span></>} breadcrumb={[{ label: 'Referral' }]} />

        <section className="section-mist py-16 sm:py-20">
          <div className="container-x max-w-4xl">
            <div className="grid gap-4 md:grid-cols-3" aria-label="How referrals work">
              {STEPS.map(({ title, description, icon: Icon }, index) => (
                <div key={title} className="relative border border-mist-200 bg-white p-6">
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-steel/10 text-steel">
                      <Icon size={19} aria-hidden="true" />
                    </span>
                    <span className="text-xs font-bold tracking-widest text-mist-500">0{index + 1}</span>
                  </div>
                  <h2 className="mt-6 text-xl font-extrabold text-navy">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-mist-500">{description}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 bg-white p-6 shadow-soft sm:p-10">
              {submitted ? (
                <div className="py-8 text-center" role="status">
                  <CheckCircle2 className="mx-auto text-green-600" size={52} aria-hidden="true" />
                  <h2 className="mt-5 text-2xl font-extrabold text-navy">Referral submitted</h2>
                  <p className="mx-auto mt-3 max-w-md leading-7 text-mist-500">
                    Thanks for connecting us. We will contact the builder and keep your referral linked to the enquiry.
                  </p>
                  <a href={shareUrl} target="_blank" rel="noreferrer" className="btn-steel mt-7">
                    <MessageCircle size={17} aria-hidden="true" /> Share on WhatsApp
                  </a>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <p className="text-sm font-bold text-steel">Your details</p>
                    <h2 className="mt-2 text-2xl font-extrabold text-navy">Who is making the referral?</h2>
                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                      <Field label="Your name" name="referrerName" value={form.referrerName} placeholder="Full name" onChange={(event) => update('referrerName', event.target.value)} />
                      <Field label="Your phone" name="referrerPhone" type="tel" value={form.referrerPhone} placeholder="10-digit mobile number" maxLength={10} onChange={(event) => updatePhone('referrerPhone', event.target.value)} />
                    </div>
                  </div>

                  <div className="border-t border-mist-200 pt-8">
                    <p className="text-sm font-bold text-steel">Builder details</p>
                    <h2 className="mt-2 text-2xl font-extrabold text-navy">Who should we contact?</h2>
                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                      <Field label="Builder's name" name="referredName" value={form.referredName} placeholder="Builder or company name" onChange={(event) => update('referredName', event.target.value)} />
                      <Field label="Builder's phone" name="referredPhone" type="tel" value={form.referredPhone} placeholder="10-digit mobile number" maxLength={10} onChange={(event) => updatePhone('referredPhone', event.target.value)} />
                    </div>
                    <label className="mt-5 block">
                      <span className="text-sm font-bold text-navy">Project type</span>
                      <select required name="projectType" value={form.projectType} onChange={(event) => update('projectType', event.target.value)} className="mt-2 min-h-12 w-full rounded-lg border border-mist-200 bg-white px-4 text-sm text-navy outline-none transition focus:border-steel focus:ring-2 focus:ring-steel/20">
                        <option value="">Select a project type</option>
                        {PROJECT_TYPES.map((projectType) => <option key={projectType} value={projectType}>{projectType}</option>)}
                      </select>
                    </label>
                  </div>

                  {error && <p className="text-sm font-semibold text-red-600" role="alert">{error}</p>}
                  <button type="submit" disabled={loading} className="btn-steel w-full sm:w-auto">
                    {loading ? <LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> : <UserPlus size={17} aria-hidden="true" />}
                    {loading ? 'Submitting...' : 'Submit referral'}
                  </button>
                </form>
              )}
            </div>

            <p className="mx-auto mt-6 max-w-2xl text-center text-xs leading-5 text-mist-500">
              By submitting, you confirm that you have permission to share the builder's contact details. We will use them only to discuss their project with NP Construction. Reward eligibility is subject to project confirmation and our referral terms.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
