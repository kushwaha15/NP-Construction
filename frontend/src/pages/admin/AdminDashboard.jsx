import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/api';
import { AlertCircle, ArrowRight, CalendarClock, CheckCircle2, CircleUserRound, Clock3, MessageSquareQuote, PhoneCall, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';

const days = Array.from({ length: 30 }, (_, index) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - index));
  return date.toISOString().slice(0, 10);
});

function MetricCard({ label, value, icon: Icon, tone }) {
  return <div className="border border-mist-200 bg-white p-5"><div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-mist-500">{label}</p><p className="mt-3 text-3xl font-extrabold text-navy">{value}</p></div><span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone}`}><Icon size={19} aria-hidden="true" /></span></div></div>;
}

function LeadsChart({ data }) {
  const points = data.map((item) => item.count);
  const max = Math.max(...points, 1);
  return <div className="flex h-40 items-end gap-1" aria-label="Leads received over the last 30 days" role="img">{data.map((item) => <div key={item.date} className="group flex h-full flex-1 items-end" title={`${item.date}: ${item.count} leads`}><div className="w-full bg-steel/70 transition-colors group-hover:bg-steel" style={{ height: `${Math.max((item.count / max) * 100, item.count ? 8 : 2)}%` }} /></div>)}</div>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [callbacks, setCallbacks] = useState([]);
  const [reviews, setReviews] = useState({ pending: 0 });
  const [leads, setLeads] = useState([]);

  useEffect(() => {
    Promise.allSettled([
      axios.get(`${API_URL}/api/admin/leads/stats`),
      axios.get(`${API_URL}/api/admin/callbacks`),
      axios.get(`${API_URL}/api/reviews/admin`, { params: { status: 'pending' } }),
      axios.get(`${API_URL}/api/admin/leads`, { params: { status: 'New', limit: 5, page: 1 } }),
    ]).then(([statsResult, callbacksResult, reviewsResult, leadsResult]) => {
      if (statsResult.status === 'fulfilled') setStats(statsResult.value.data.data || {});
      if (callbacksResult.status === 'fulfilled') setCallbacks(callbacksResult.value.data.data || []);
      if (reviewsResult.status === 'fulfilled') setReviews(reviewsResult.value.data.counts || {});
      if (leadsResult.status === 'fulfilled') setLeads(leadsResult.value.data.data || []);
    });
  }, []);

  const chartData = useMemo(() => {
    const source = stats?.last30Days || stats?.last7Days || [];
    const byDate = Object.fromEntries(source.map((item) => [item._id, item.count]));
    return days.map((date) => ({ date, count: byDate[date] || 0 }));
  }, [stats]);

  const followUps = leads.slice(0, 5);
  const pendingCallbacks = callbacks.filter((callback) => callback.status === 'Pending');

  return <main className="p-4 sm:p-6 lg:p-8">
    <div className="mb-7"><p className="text-sm font-semibold text-steel">Today at a glance</p><h2 className="mt-1 text-2xl font-extrabold text-navy">Good morning</h2></div>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="New leads today" value={stats?.todayCount ?? '—'} icon={CircleUserRound} tone="bg-steel/10 text-steel" />
      <MetricCard label="Pending callbacks" value={pendingCallbacks.length} icon={PhoneCall} tone="bg-amber/15 text-amber" />
      <MetricCard label="Pending reviews" value={reviews.pending ?? '—'} icon={MessageSquareQuote} tone="bg-red-100 text-red-700" />
      <MetricCard label="Total leads" value={stats?.total ?? '—'} icon={TrendingUp} tone="bg-navy/10 text-navy" />
    </div>

    <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
      <section className="border border-mist-200 bg-white p-5 sm:p-6"><div className="flex items-start justify-between"><div><h3 className="font-extrabold text-navy">Lead volume</h3><p className="mt-1 text-sm text-mist-500">Last 30 days</p></div><CalendarClock size={19} className="text-steel" aria-hidden="true" /></div><div className="mt-7"><LeadsChart data={chartData} /></div><div className="mt-3 flex justify-between text-xs text-mist-500"><span>{chartData[0].date}</span><span>{chartData.at(-1).date}</span></div></section>
      <section className="border border-mist-200 bg-white p-5 sm:p-6"><div className="flex items-start justify-between"><div><h3 className="font-extrabold text-navy">Needs follow-up</h3><p className="mt-1 text-sm text-mist-500">New enquiries to contact</p></div><AlertCircle size={19} className="text-amber" aria-hidden="true" /></div><div className="mt-5 space-y-3">{followUps.length ? followUps.map((lead) => <Link key={lead._id} to="/admin/leads" className="flex items-center justify-between gap-3 border-b border-mist-200 pb-3 last:border-0 last:pb-0"><span className="min-w-0"><strong className="block truncate text-sm text-navy">{lead.name}</strong><span className="mt-1 block truncate text-xs text-mist-500">{lead.workType || 'Project enquiry'} · {lead.city || 'City not given'}</span></span><ArrowRight size={16} className="shrink-0 text-steel" aria-hidden="true" /></Link>) : <p className="py-5 text-sm text-mist-500">No new enquiries need attention.</p>}</div></section>
    </div>

    <div className="mt-6 grid gap-4 sm:grid-cols-3"><Link to="/admin/callbacks" className="flex items-center gap-3 border border-mist-200 bg-white p-4 text-sm font-bold text-navy hover:border-steel"><Clock3 size={18} className="text-amber" aria-hidden="true" />Review callbacks<ArrowRight size={16} className="ml-auto text-steel" aria-hidden="true" /></Link><Link to="/admin/reviews" className="flex items-center gap-3 border border-mist-200 bg-white p-4 text-sm font-bold text-navy hover:border-steel"><CheckCircle2 size={18} className="text-steel" aria-hidden="true" />Moderate reviews<ArrowRight size={16} className="ml-auto text-steel" aria-hidden="true" /></Link><Link to="/admin/leads" className="flex items-center gap-3 border border-mist-200 bg-white p-4 text-sm font-bold text-navy hover:border-steel"><CircleUserRound size={18} className="text-steel" aria-hidden="true" />Open lead inbox<ArrowRight size={16} className="ml-auto text-steel" aria-hidden="true" /></Link></div>
  </main>;
}
