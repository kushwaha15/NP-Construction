import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../utils/api';
import toast from 'react-hot-toast';
import {
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  ChevronRight,
  CircleUserRound,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareQuote,
  PhoneCall,
  X,
} from 'lucide-react';

const TOKEN_KEY = 'np_admin_token';
const AdminDashboard = lazy(() => import('./AdminDashboard'));
const AdminLeads = lazy(() => import('./AdminLeads'));
const AdminCallbacks = lazy(() => import('./AdminCallbacks'));
const AdminPortfolio = lazy(() => import('./AdminPortfolio'));
const AdminReviews = lazy(() => import('./AdminReviews'));
const AdminBlog = lazy(() => import('./AdminBlog'));
const AdminAnalytics = lazy(() => import('./AdminAnalytics'));

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/leads', label: 'Leads', icon: CircleUserRound },
  { to: '/admin/callbacks', label: 'Callbacks', icon: PhoneCall },
  { to: '/admin/portfolio', label: 'Portfolio', icon: BriefcaseBusiness },
  { to: '/admin/reviews', label: 'Reviews', icon: MessageSquareQuote },
  { to: '/admin/blog', label: 'Blog', icon: BookOpen },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
];

const PAGE_TITLES = Object.fromEntries(NAV_ITEMS.map((item) => [item.to, item.label]));

function Login({ onLogin }) {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`${API_URL}/api/admin/login`, { password });
      if (!data.success) throw new Error(data.message || 'Invalid password');
      localStorage.setItem(TOKEN_KEY, data.token);
      onLogin(data.token);
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || 'Connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="section-dark flex min-h-screen items-center justify-center p-4">
      <Helmet><title>Admin Login | NP Construction</title></Helmet>
      <div className="w-full max-w-sm bg-white p-8 shadow-soft">
        <div className="mb-8 text-center">
          <img src="/images/NP-Contruction-logo.png" alt="NP Construction" className="mx-auto mb-4 h-14 w-14 object-contain" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
          <h1 className="text-xl font-extrabold text-navy">Admin workspace</h1>
          <p className="mt-1 text-sm text-mist-500">Sign in to manage enquiries and content.</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <label className="block"><span className="text-sm font-bold text-navy">Admin password</span><input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" className="mt-2 min-h-12 w-full border border-mist-200 px-4 text-sm outline-none focus:border-steel focus:ring-2 focus:ring-steel/20" /></label>
          {error && <p className="text-sm font-semibold text-red-600" role="alert">{error}</p>}
          <button type="submit" disabled={loading} className="btn-amber w-full">{loading ? 'Signing in...' : 'Sign in'}</button>
        </form>
      </div>
    </main>
  );
}

function Sidebar({ onLogout, open, onClose }) {
  return (
    <>
      {open && <button type="button" aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-40 bg-navy/50 lg:hidden" />}
      <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-navy text-white transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
          <NavLink to="/admin/dashboard" onClick={onClose} className="flex items-center gap-3">
            <img src="/images/NP-Contruction-logo.png" alt="NP Construction" className="h-10 w-10 object-contain" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
            <span><strong className="block text-sm">NP Construction</strong><span className="text-xs text-white/45">Admin workspace</span></span>
          </NavLink>
          <button type="button" onClick={onClose} className="p-2 text-white/60 hover:text-white lg:hidden" aria-label="Close navigation"><X size={20} /></button>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5" aria-label="Admin navigation">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={onClose} className={({ isActive }) => `flex items-center gap-3 border-l-2 px-3 py-3 text-sm font-semibold transition-colors ${isActive ? 'border-amber bg-white/10 text-white' : 'border-transparent text-white/60 hover:bg-white/5 hover:text-white'}`}><Icon size={18} aria-hidden="true" />{label}<ChevronRight size={15} className="ml-auto opacity-50" aria-hidden="true" /></NavLink>)}
        </nav>
        <div className="border-t border-white/10 p-4"><button type="button" onClick={onLogout} className="flex w-full items-center gap-3 px-3 py-3 text-sm font-semibold text-white/60 hover:text-white"><LogOut size={18} aria-hidden="true" />Log out</button></div>
      </aside>
    </>
  );
}

function LoadingPage() {
  return <div className="flex min-h-[50vh] items-center justify-center text-sm font-semibold text-mist-500" aria-busy="true">Loading workspace...</div>;
}

function AdminLayout({ token, setToken }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const title = useMemo(() => PAGE_TITLES[location.pathname] || 'Dashboard', [location.pathname]);

  useEffect(() => {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    const interceptor = axios.interceptors.response.use((response) => response, (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        setToken('');
      }
      return Promise.reject(error);
    });
    return () => axios.interceptors.response.eject(interceptor);
  }, [setToken, token]);

  const logout = async () => {
    try { await axios.post(`${API_URL}/api/admin/logout`); } catch {}
    delete axios.defaults.headers.common.Authorization;
    localStorage.removeItem(TOKEN_KEY);
    setToken('');
    toast.success('Logged out');
  };

  return (
    <div className="min-h-screen bg-mist">
      <Sidebar open={drawerOpen} onClose={() => setDrawerOpen(false)} onLogout={logout} />
      <div className="min-h-screen lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-mist-200 bg-white px-4 sm:px-6">
          <div className="flex items-center gap-3"><button type="button" onClick={() => setDrawerOpen(true)} className="p-2 text-navy lg:hidden" aria-label="Open navigation"><Menu size={21} /></button><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-steel">NP Construction</p><h1 className="text-lg font-extrabold text-navy">{title}</h1></div></div>
          <button type="button" onClick={logout} className="hidden items-center gap-2 text-sm font-semibold text-mist-500 hover:text-navy sm:flex"><LogOut size={17} aria-hidden="true" />Log out</button>
        </header>
        <Suspense fallback={<LoadingPage />}><Routes><Route index element={<Navigate to="dashboard" replace />} /><Route path="dashboard" element={<AdminDashboard />} /><Route path="leads" element={<AdminLeads />} /><Route path="callbacks" element={<AdminCallbacks />} /><Route path="portfolio" element={<AdminPortfolio />} /><Route path="reviews" element={<AdminReviews />} /><Route path="blog" element={<AdminBlog />} /><Route path="analytics" element={<AdminAnalytics />} /><Route path="*" element={<Navigate to="dashboard" replace />} /></Routes></Suspense>
      </div>
    </div>
  );
}

export default function AdminApp() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const navigate = useNavigate();

  useEffect(() => {
    if (token) axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    else delete axios.defaults.headers.common.Authorization;
  }, [token]);

  const login = (nextToken) => {
    setToken(nextToken);
    navigate('/admin/dashboard');
  };

  if (!token) return <Login onLogin={login} />;
  return <AdminLayout token={token} setToken={setToken} />;
}
