import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/api';
import toast from 'react-hot-toast';
import { Check, Clock3, Phone, RefreshCw } from 'lucide-react';

const formatDate = (date) => new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

export default function AdminCallbacks() {
  const [callbacks, setCallbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/api/admin/callbacks`);
      setCallbacks(data.data || []);
    } catch { toast.error('Failed to load callbacks'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const sortedCallbacks = useMemo(() => [...callbacks].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'Pending' ? -1 : 1;
    return String(a.preferredTime || '').localeCompare(String(b.preferredTime || ''));
  }), [callbacks]);

  const markCalled = async (id) => {
    setUpdating(id);
    try {
      await axios.patch(`${API_URL}/api/admin/callbacks/${id}`, { status: 'Called' });
      setCallbacks((current) => current.map((callback) => callback._id === id ? { ...callback, status: 'Called' } : callback));
      toast.success('Callback marked as called');
    } catch { toast.error('Failed to update callback'); }
    finally { setUpdating(null); }
  };

  return <main className="p-4 sm:p-6 lg:p-8">
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-steel">Follow-up queue</p><h2 className="mt-1 text-2xl font-extrabold text-navy">Callback requests</h2></div><button type="button" onClick={load} className="flex items-center gap-2 text-sm font-bold text-mist-500 hover:text-steel"><RefreshCw size={16} aria-hidden="true" />Refresh</button></div>
    {loading ? <div className="py-16 text-center text-sm text-mist-500">Loading callbacks...</div> : sortedCallbacks.length === 0 ? <div className="border border-mist-200 bg-white py-16 text-center text-sm text-mist-500">No callback requests.</div> : <div className="grid gap-4 lg:grid-cols-2">{sortedCallbacks.map((callback) => <article key={callback._id} className="border border-mist-200 bg-white p-5"><div className="flex items-start justify-between gap-4"><div><h3 className="font-extrabold text-navy">{callback.name}</h3><p className="mt-1 text-xs text-mist-500">Requested {formatDate(callback.createdAt)}</p></div><span className={`px-2.5 py-1 text-xs font-bold ${callback.status === 'Pending' ? 'bg-amber/15 text-amber' : 'bg-green-100 text-green-700'}`}>{callback.status}</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><a href={`tel:+91${callback.phone}`} className="flex items-center gap-3 border border-mist-200 p-3 text-sm font-bold text-navy hover:border-steel"><Phone size={17} className="text-steel" aria-hidden="true" />+91 {callback.phone}</a><div className="flex items-center gap-3 border border-mist-200 p-3 text-sm font-semibold text-navy"><Clock3 size={17} className="text-amber" aria-hidden="true" />{callback.preferredTime || 'Any time'}</div></div>{callback.status === 'Pending' && <button type="button" onClick={() => markCalled(callback._id)} disabled={updating === callback._id} className="btn-steel mt-5 w-full sm:w-auto">{updating === callback._id ? 'Updating...' : <><Check size={17} aria-hidden="true" />Mark called</>}</button>}</article>)}</div>}
  </main>;
}
