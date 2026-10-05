import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/api';
import toast from 'react-hot-toast';
import { Check, Clock3, Star, ThumbsDown, Trash2 } from 'lucide-react';

const TABS = [
  { key: 'pending', label: 'Pending', icon: Clock3 },
  { key: 'approved', label: 'Approved', icon: Check },
  { key: 'rejected', label: 'Rejected', icon: ThumbsDown },
];

function Stars({ rating }) {
  return <span className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>{[1, 2, 3, 4, 5].map((number) => <Star key={number} size={15} fill={number <= rating ? 'currentColor' : 'none'} className={number <= rating ? 'text-amber' : 'text-mist-200'} aria-hidden="true" />)}</span>;
}

export default function AdminReviews() {
  const [tab, setTab] = useState('pending');
  const [reviews, setReviews] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/reviews/admin`, { params: { status: tab } });
      setReviews(data.data || []);
      setCounts(data.counts || {});
    } catch { toast.error('Failed to load reviews'); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const moderate = async (id, action) => {
    setActioning(id);
    try {
      await axios.patch(`${API_URL}/api/reviews/${id}/${action}`);
      toast.success(action === 'approve' ? 'Review approved' : 'Review rejected');
      load();
    } catch { toast.error('Could not update review'); }
    finally { setActioning(null); }
  };

  const remove = async (id) => {
    if (!window.confirm('Permanently delete this review?')) return;
    setActioning(id);
    try { await axios.delete(`${API_URL}/api/reviews/${id}`); toast.success('Review deleted'); load(); }
    catch { toast.error('Could not delete review'); }
    finally { setActioning(null); }
  };

  return <main className="p-4 sm:p-6 lg:p-8">
    <div className="mb-7"><p className="text-sm font-semibold text-steel">Customer feedback</p><h2 className="mt-1 text-2xl font-extrabold text-navy">Review moderation</h2></div>
    <div className="mb-6 flex gap-2 overflow-x-auto border-b border-mist-200">{TABS.map(({ key, label, icon: Icon }) => <button key={key} type="button" onClick={() => setTab(key)} className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold ${tab === key ? 'border-steel text-steel' : 'border-transparent text-mist-500 hover:text-navy'}`}><Icon size={16} aria-hidden="true" />{label}<span className="rounded-full bg-mist px-2 py-0.5 text-xs">{counts[key] ?? 0}</span></button>)}</div>
    {loading ? <div className="py-16 text-center text-sm text-mist-500">Loading reviews...</div> : reviews.length === 0 ? <div className="border border-mist-200 bg-white py-16 text-center text-sm text-mist-500">No reviews in this group.</div> : <div className="space-y-4">{reviews.map((review) => <article key={review._id} className="border border-mist-200 bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><h3 className="font-extrabold text-navy">{review.name}</h3><p className="mt-1 text-xs text-mist-500">{review.email}{review.projectName ? ` · ${review.projectName}` : ''}</p><div className="mt-3"><Stars rating={review.rating} /></div></div><div className="flex flex-wrap gap-2">{tab === 'pending' && <><button type="button" onClick={() => moderate(review._id, 'approve')} disabled={actioning === review._id} className="btn-steel"><Check size={16} aria-hidden="true" />Approve</button><button type="button" onClick={() => moderate(review._id, 'reject')} disabled={actioning === review._id} className="flex min-h-11 items-center gap-2 border border-red-200 px-4 text-sm font-bold text-red-700 hover:bg-red-50"><ThumbsDown size={16} aria-hidden="true" />Reject</button></>}{tab === 'approved' && <button type="button" onClick={() => moderate(review._id, 'reject')} disabled={actioning === review._id} className="flex min-h-11 items-center gap-2 border border-red-200 px-4 text-sm font-bold text-red-700 hover:bg-red-50"><ThumbsDown size={16} aria-hidden="true" />Reject</button>}{tab === 'rejected' && <button type="button" onClick={() => moderate(review._id, 'approve')} disabled={actioning === review._id} className="btn-steel"><Check size={16} aria-hidden="true" />Approve</button>}<button type="button" onClick={() => remove(review._id)} disabled={actioning === review._id} className="flex min-h-11 items-center gap-2 border border-mist-200 px-3 text-sm font-bold text-mist-500 hover:border-red-200 hover:text-red-700" aria-label={`Delete review from ${review.name}`}><Trash2 size={16} aria-hidden="true" /></button></div></div><p className="mt-5 max-w-3xl text-sm leading-7 text-mist-500">{review.reviewText}</p></article>)}</div>}
  </main>;
}
