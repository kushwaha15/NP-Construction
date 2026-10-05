import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/api';
import toast from 'react-hot-toast';

const STATUSES = ['New','Contacted','In Progress','Closed'];
const BADGE = { 'New':'bg-blue-100 text-blue-700', 'Contacted':'bg-yellow-100 text-yellow-700', 'In Progress':'bg-green-100 text-green-700', 'Closed':'bg-gray-100 text-gray-600' };
const STATUS_ICON = { New: '•', Contacted: '◷', 'In Progress': '↗', Closed: '✓' };
const SCORES = { '🔥 Hot':'🔥 Hot', '🌤 Warm':'🌤 Warm', '❄️ Cold':'❄️ Cold' };
const SCORE_COLOR = { '🔥 Hot':'bg-red-100 text-red-600', '🌤 Warm':'bg-yellow-100 text-yellow-600', '❄️ Cold':'bg-blue-100 text-blue-600' };

function escapeHtml(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

export default function AdminLeads() {
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ total:0, page:1, pages:1 });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({ search:'', workType:'All', status:'All', city:'', page:1 });
  const [selected, setSelected] = useState(null); // detail modal
  const [note, setNote] = useState('');
  const [replyText, setReplyText] = useState('');
  const [exportLoading, setExportLoading] = useState(false);

  const setF = (k,v) => setFilters(f => ({...f, [k]:v, page:1}));

  const loadLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page: filters.page, limit: 20, ...filters };
      if (params.workType === 'All') delete params.workType;
      if (params.status === 'All') delete params.status;
      if (!params.city) delete params.city;
      if (!params.search) delete params.search;
      const { data } = await axios.get(`${API_URL}/api/admin/leads`, { params });
      setLeads(data.data || []);
      setPagination(data.pagination || {});
    } catch { toast.error('Failed to load leads'); }
    finally { setLoading(false); }
  }, [filters]);

  const loadStats = useCallback(async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/admin/leads/stats`);
      setStats(data.data || {});
    } catch {}
  }, []);

  useEffect(() => { loadLeads(); }, [loadLeads]);
  useEffect(() => { loadStats(); }, [loadStats]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { if (filters.search !== undefined) loadLeads(); }, 400);
    return () => clearTimeout(t);
  }, [filters.search]);

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${API_URL}/api/admin/leads/${id}/status`, { status });
      setLeads(l => l.map(lead => lead._id === id ? {...lead, status} : lead));
      if (selected?._id === id) setSelected(s => ({...s, status}));
      toast.success(`Status → ${status}`);
      loadStats();
    } catch { toast.error('Failed to update status'); }
  };

  const updateScore = async (id, leadScore) => {
    try {
      await axios.patch(`${API_URL}/api/admin/leads/${id}/score`, { leadScore });
      setLeads(l => l.map(lead => lead._id === id ? {...lead, leadScore} : lead));
      if (selected?._id === id) setSelected(s => ({...s, leadScore}));
      toast.success('Lead score updated');
    } catch { toast.error('Failed to update score'); }
  };

  const addNote = async () => {
    if (!note.trim() || !selected) return;
    try {
      const { data } = await axios.post(`${API_URL}/api/admin/leads/${selected._id}/notes`, { note });
      setSelected(s => ({...s, notes: data.notes}));
      setNote('');
      toast.success('Note added');
    } catch { toast.error('Failed to add note'); }
  };

  const sendReply = async () => {
    if (!replyText.trim() || !selected) return;
    try {
      await axios.post(`${API_URL}/api/admin/leads/${selected._id}/reply`, { message: replyText });
      setReplyText('');
      toast.success('Reply sent via email');
    } catch { toast.error('Failed to send reply'); }
  };

  const exportCsv = async () => {
    setExportLoading(true);
    try {
      const params = {};
      if (filters.workType !== 'All') params.workType = filters.workType;
      if (filters.status !== 'All') params.status = filters.status;
      if (filters.city) params.city = filters.city;
      const res = await axios.get(`${API_URL}/api/admin/leads/export`, { params, responseType:'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a'); a.href = url;
      a.download = `NP_Leads_${new Date().toISOString().split('T')[0]}.csv`;
      a.click(); URL.revokeObjectURL(url);
      toast.success('CSV exported');
    } catch { toast.error('Export failed'); }
    finally { setExportLoading(false); }
  };

  // ── Date formatter ──────────────────────────────────────
  const fmt = (d) => new Date(d).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });

  return (
    <div className="p-6">
      {/* Topbar */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-black text-[#0A1628]">All Leads</h1>
        <span className="text-sm text-gray-400">{new Date().toLocaleDateString('en-IN',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon:'fas fa-users', color:'bg-orange-500/10 text-orange-500', num:stats.total||0, lbl:'Total Leads' },
          { icon:'fas fa-calendar-day', color:'bg-blue-500/10 text-blue-500', num:stats.todayCount||0, lbl:"Today's Leads" },
          { icon:'fas fa-star', color:'bg-green-500/10 text-green-500', num:stats.byStatus?.find(s=>s._id==='New')?.count||0, lbl:'New (Uncontacted)' },
          { icon:'fas fa-fire', color:'bg-red-500/10 text-red-500', num:stats.byWorkType?.[0]?._id||'—', lbl:'Top Work Type' },
        ].map(s => (
          <div key={s.lbl} className="bg-white rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg ${s.color}`}><i className={s.icon} /></div>
            <div>
              <div className="text-2xl font-black text-[#0A1628] leading-none">{s.num}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.lbl}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
        <input type="text" placeholder="🔍 Search name, phone, email…" value={filters.search}
          onChange={e => setF('search', e.target.value)}
          className="border-2 border-gray-200 focus:border-orange-400 rounded-lg px-3 py-2 text-sm outline-none min-w-[200px]" />
        <select value={filters.workType} onChange={e => setF('workType', e.target.value)}
          className="border-2 border-gray-200 focus:border-orange-400 rounded-lg px-3 py-2 text-sm outline-none cursor-pointer">
          <option>All</option><option>Fabrication</option><option>Full Steel Contract</option><option>Steel Framework</option><option>Other</option>
        </select>
        <select value={filters.status} onChange={e => setF('status', e.target.value)}
          className="border-2 border-gray-200 focus:border-orange-400 rounded-lg px-3 py-2 text-sm outline-none cursor-pointer">
          <option>All</option>{STATUSES.map(s=><option key={s}>{s}</option>)}
        </select>
        <input type="text" placeholder="Filter by city…" value={filters.city} onChange={e => setF('city', e.target.value)}
          className="border-2 border-gray-200 focus:border-orange-400 rounded-lg px-3 py-2 text-sm outline-none w-36" />
        <button onClick={exportCsv} disabled={exportLoading}
          className="ml-auto bg-[#0A1628] hover:bg-[#122040] disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
          {exportLoading ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-download" />} Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <h3 className="font-bold text-[#0A1628] text-sm">Leads</h3>
          <span className="text-xs text-gray-400">{pagination.total||0} leads found</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {['#','Name','Phone','Email','City','Work Type','Score','Status','Date'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400"><i className="fas fa-spinner fa-spin text-2xl mb-2 block" />Loading…</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-gray-400"><i className="fas fa-inbox text-3xl mb-2 block" />No leads found</td></tr>
              ) : leads.map((lead, i) => (
                <tr key={lead._id} className="border-t hover:bg-orange-50/50 cursor-pointer transition-colors" onClick={() => setSelected(lead)}>
                  <td className="px-4 py-3 text-xs text-gray-400">{(filters.page-1)*20+i+1}</td>
                  <td className="px-4 py-3 font-semibold text-[#0A1628] text-sm">{escapeHtml(lead.name)}</td>
                  <td className="px-4 py-3"><a href={`tel:+91${lead.phone}`} onClick={e=>e.stopPropagation()} className="text-orange-500 text-sm hover:underline">+91 {lead.phone}</a></td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[140px] truncate">{lead.email}</td>
                  <td className="px-4 py-3 text-sm">{lead.city}</td>
                  <td className="px-4 py-3"><span className="bg-orange-100 text-orange-600 text-xs font-semibold px-2.5 py-1 rounded-full">{lead.workType}</span></td>
                  <td className="px-4 py-3">
                    <select value={lead.leadScore||''} onClick={e=>e.stopPropagation()}
                      onChange={e=>updateScore(lead._id, e.target.value)}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1 outline-none cursor-pointer">
                      <option value="">—</option>
                      {Object.keys(SCORES).map(s=><option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3" onClick={e=>e.stopPropagation()}>
                    <span className={`mr-1 inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-black ${BADGE[lead.status]||'bg-gray-100 text-gray-600'}`} aria-hidden="true">{STATUS_ICON[lead.status] || '•'}</span><select value={lead.status} onChange={e=>updateStatus(lead._id, e.target.value)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 outline-none cursor-pointer ${BADGE[lead.status]||''}`}>
                      {STATUSES.map(s=><option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">{fmt(lead.submittedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t">
            <span className="text-xs text-gray-400">Showing {(filters.page-1)*20+1}–{Math.min(filters.page*20, pagination.total)} of {pagination.total}</span>
            <div className="flex gap-1">
              <button disabled={filters.page===1} onClick={()=>setF('page', filters.page-1)}
                className="w-8 h-8 rounded-lg border text-sm disabled:opacity-40 hover:bg-orange-500 hover:border-orange-500 hover:text-white transition-colors">‹</button>
              {[...Array(Math.min(pagination.pages,7))].map((_,i)=>{
                const p = i+1;
                return <button key={p} onClick={()=>setF('page',p)}
                  className={`w-8 h-8 rounded-lg border text-xs font-medium transition-colors
                    ${filters.page===p?'bg-orange-500 border-orange-500 text-white':'hover:bg-gray-100'}`}>{p}</button>;
              })}
              <button disabled={filters.page===pagination.pages} onClick={()=>setF('page', filters.page+1)}
                className="w-8 h-8 rounded-lg border text-sm disabled:opacity-40 hover:bg-orange-500 hover:border-orange-500 hover:text-white transition-colors">›</button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={e=>e.target===e.currentTarget&&setSelected(null)}>
          <div className="ml-auto h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between bg-[#0A1628] p-5">
              <div>
                <h3 className="text-white font-black text-lg">{selected.name}</h3>
                <p className="text-white/50 text-xs">{fmt(selected.submittedAt)}</p>
              </div>
              <button onClick={()=>setSelected(null)} className="text-white/60 hover:text-white text-2xl leading-none">×</button>
            </div>
            <div className="p-6 space-y-4">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  {l:'Phone',v:<a href={`tel:+91${selected.phone}`} className="text-orange-500 hover:underline">+91 {selected.phone}</a>},
                  {l:'Email',v:<a href={`mailto:${selected.email}`} className="text-orange-500 hover:underline">{selected.email}</a>},
                  {l:'City',v:selected.city},{l:'Work Type',v:selected.workType},
                  {l:'Tonnage',v:selected.tonnage||'—'},{l:'Status',v:selected.status},
                ].map(item=>(
                  <div key={item.l} className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">{item.l}</div>
                    <div className="text-sm font-semibold text-[#0A1628]">{item.v}</div>
                  </div>
                ))}
              </div>
              {selected.message && (
                <div className="bg-orange-50 rounded-xl p-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-orange-500 mb-1">Message</div>
                  <p className="text-sm text-gray-600">{selected.message}</p>
                </div>
              )}
              {/* Status + Score */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Update Status</label>
                  <select value={selected.status} onChange={e=>updateStatus(selected._id, e.target.value)}
                    className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-xl px-3 py-2.5 text-sm outline-none cursor-pointer">
                    {STATUSES.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Lead Score</label>
                  <select value={selected.leadScore||''} onChange={e=>updateScore(selected._id, e.target.value)}
                    className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-xl px-3 py-2.5 text-sm outline-none cursor-pointer">
                    <option value="">— Unscored —</option>
                    {Object.keys(SCORES).map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              {/* Notes */}
              <div>
                <h4 className="font-bold text-[#0A1628] text-sm mb-2">Follow-up Notes</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                  {(selected.notes||[]).length===0 && <p className="text-gray-400 text-xs">No notes yet</p>}
                  {(selected.notes||[]).map((n,i)=>(
                    <div key={i} className="bg-gray-50 rounded-lg p-3 text-xs">
                      <p className="text-gray-600">{n.text}</p>
                      <p className="text-gray-400 mt-1">{fmt(n.createdAt)}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" value={note} onChange={e=>setNote(e.target.value)} placeholder="Add a follow-up note…"
                    onKeyDown={e=>e.key==='Enter'&&addNote()}
                    className="flex-1 border-2 border-gray-200 focus:border-orange-400 rounded-lg px-3 py-2 text-sm outline-none" />
                  <button onClick={addNote} className="bg-orange-500 hover:bg-orange-400 text-white px-4 rounded-lg text-sm font-semibold transition-colors">Add</button>
                </div>
              </div>
              {/* Email Reply */}
              <div>
                <h4 className="font-bold text-[#0A1628] text-sm mb-2">Reply to Client</h4>
                <textarea value={replyText} onChange={e=>setReplyText(e.target.value)} rows={3}
                  placeholder={`Compose email to ${selected.email}…`}
                  className="w-full border-2 border-gray-200 focus:border-orange-400 rounded-xl px-3 py-2.5 text-sm outline-none resize-none" />
                <button onClick={sendReply} disabled={!replyText.trim()}
                  className="mt-2 bg-[#0A1628] hover:bg-[#122040] disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                  <i className="fas fa-paper-plane" /> Send Email Reply
                </button>
              </div>
              {/* Uploaded files */}
              {selected.files?.length > 0 && (
                <div>
                  <h4 className="font-bold text-[#0A1628] text-sm mb-2">Attached Files</h4>
                  <div className="space-y-1">
                    {selected.files.map((f,i)=>(
                      <a key={i} href={`${API_URL}/uploads/${f}`} target="_blank" rel="noopener"
                        className="flex items-center gap-2 text-sm text-orange-500 hover:underline">
                        <i className="fas fa-paperclip" /> {f}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
