import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../utils/api';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#E07B39','#0A1628','#F59547','#122040','#FBBF24','#6B7280'];

export default function AdminAnalytics() {
  const [stats, setStats] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [range, setRange] = useState({ from: '', to: '' });

  useEffect(() => {
    const params = {};
    if (range.from) params.from = range.from;
    if (range.to) params.to = range.to;
    setStats(null);
    axios.get(`${API_URL}/api/admin/leads/stats`, { params }).then(r => {
      setStats(r.data.data);
    }).catch(() => {});
    axios.get(`${API_URL}/api/admin/leads/monthly`, { params }).then(r => {
      setMonthlyData(r.data.data || []);
    }).catch(() => {});
  }, [range]);

  if (!stats) return (
    <div className="p-6 flex items-center justify-center min-h-[400px]">
      <div className="text-center text-gray-400">
        <i className="fas fa-spinner fa-spin text-3xl mb-3 block" />Loading analytics…
      </div>
    </div>
  );

  const pieData = (stats.byWorkType || []).map((d, i) => ({ name: d._id, value: d.count, fill: COLORS[i % COLORS.length] }));
  const barData = (stats.byStatus || []).map(d => ({ name: d._id, count: d.count }));
  const lineData = stats.last7Days || [];

  const thisWeek = stats.last7Days?.reduce((s,d) => s + d.count, 0) || 0;
  const total = stats.total || 0;
  const newLeads = stats.byStatus?.find(s => s._id === 'New')?.count || 0;
  const closedLeads = stats.byStatus?.find(s => s._id === 'Closed')?.count || 0;
  const convRate = total ? Math.round((closedLeads / total) * 100) : 0;

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4"><h1 className="text-xl font-black text-[#0A1628]">Analytics Dashboard</h1><div className="flex flex-wrap items-end gap-2"><label className="text-xs font-bold uppercase tracking-wider text-gray-400">From<input type="date" value={range.from} onChange={e => setRange(current => ({ ...current, from: e.target.value }))} className="ml-2 rounded-lg border border-gray-200 px-2 py-2 text-xs font-normal text-[#0A1628]" /></label><label className="text-xs font-bold uppercase tracking-wider text-gray-400">To<input type="date" value={range.to} onChange={e => setRange(current => ({ ...current, to: e.target.value }))} className="ml-2 rounded-lg border border-gray-200 px-2 py-2 text-xs font-normal text-[#0A1628]" /></label></div></div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon:'fas fa-users',        color:'text-orange-500 bg-orange-100', num:total,      lbl:'Total Leads' },
          { icon:'fas fa-calendar-week',color:'text-blue-500  bg-blue-100',    num:thisWeek,   lbl:'This Week' },
          { icon:'fas fa-calendar-day', color:'text-green-500 bg-green-100',   num:stats.todayCount||0, lbl:'Today' },
          { icon:'fas fa-percent',      color:'text-purple-500 bg-purple-100', num:`${convRate}%`, lbl:'Conversion Rate' },
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

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Leads by work type — Pie */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-bold text-[#0A1628] mb-4">Inquiries by Service Type</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} (${(percent*100).toFixed(0)}%)`} labelLine>
                {pieData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Leads by status — Bar */}
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-bold text-[#0A1628] mb-4">Leads by Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize:12 }} />
              <YAxis tick={{ fontSize:12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#E07B39" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Last 7 days trend */}
      <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
        <h3 className="font-bold text-[#0A1628] mb-4">Last 7 Days Trend</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={lineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="_id" tick={{ fontSize:11 }} />
            <YAxis tick={{ fontSize:11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#E07B39" strokeWidth={2} dot={{ fill:'#E07B39', r:4 }} activeDot={{ r:6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly trend */}
      {monthlyData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h3 className="font-bold text-[#0A1628] mb-4">Last 6 Months</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="_id" tick={{ fontSize:11 }} />
              <YAxis tick={{ fontSize:11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#0A1628" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
