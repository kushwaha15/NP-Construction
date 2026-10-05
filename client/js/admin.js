/* ============================================================
   NP Construction — admin.js
   Handles: login, leads table, filters, pagination, export,
            status update, stats view
============================================================ */

// ─── Config ──────────────────────────────────────────────────
const API_BASE = window.location.origin;
const TOKEN_KEY = 'np_admin_token';

// ─── State ───────────────────────────────────────────────────
let authToken    = localStorage.getItem(TOKEN_KEY) || '';
let currentPage  = 1;
const pageSize   = 20;
let debounceTimer = null;

// ─── DOM Refs ─────────────────────────────────────────────────
const loginPage   = document.getElementById('loginPage');
const dashboard   = document.getElementById('dashboard');
const loginForm   = document.getElementById('loginForm');
const loginBtn    = document.getElementById('loginBtn');
const loginText   = document.getElementById('loginText');
const loginSpinner = document.getElementById('loginSpinner');
const loginError  = document.getElementById('loginError');
const logoutBtn   = document.getElementById('logoutBtn');
const leadsView   = document.getElementById('leadsView');
const statsView   = document.getElementById('statsView');
const pageTitle   = document.getElementById('pageTitle');
const topbarDate  = document.getElementById('topbarDate');

// ─── Toast ────────────────────────────────────────────────────
const showToast = (msg, type = 'success') => {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (!toast) return;
  toast.className = `toast ${type}`;
  const icon = toast.querySelector('i');
  if (icon) icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
  toastMsg.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
};

// ─── API Helper ───────────────────────────────────────────────
const api = async (path, options = {}) => {
  const res = await fetch(`${API_BASE}/api/admin${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
      ...(options.headers || {})
    }
  });
  if (res.status === 401) {
    logout();
    return null;
  }
  // CSV export: return blob
  if (options.blob) return res.blob();
  return res.json();
};

// ─── Auth ─────────────────────────────────────────────────────
const showDashboard = () => {
  loginPage.style.display  = 'none';
  dashboard.style.display  = 'flex';
  topbarDate.textContent = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  loadLeads();
  loadStats();
};

const logout = () => {
  authToken = '';
  localStorage.removeItem(TOKEN_KEY);
  loginPage.style.display = 'flex';
  dashboard.style.display = 'none';
  loginError.classList.remove('show');
};

// Auto-login if token exists
if (authToken) showDashboard();

// Login form
loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const password = document.getElementById('adminPassword').value;
  if (!password) return;

  loginBtn.disabled = true;
  loginText.style.display  = 'none';
  loginSpinner.style.display = 'inline';
  loginError.classList.remove('show');

  try {
    const res = await fetch(`${API_BASE}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    const data = await res.json();

    if (data.success && data.token) {
      authToken = data.token;
      localStorage.setItem(TOKEN_KEY, authToken);
      showDashboard();
    } else {
      loginError.textContent = data.message || 'Invalid password';
      loginError.classList.add('show');
    }
  } catch {
    loginError.textContent = 'Connection error. Is the server running?';
    loginError.classList.add('show');
  } finally {
    loginBtn.disabled = false;
    loginText.style.display  = 'inline';
    loginSpinner.style.display = 'none';
  }
});

logoutBtn?.addEventListener('click', async () => {
  try { await api('/logout', { method: 'POST' }); } catch {}
  logout();
});

// ─── Navigation ───────────────────────────────────────────────
document.getElementById('sideLeads')?.addEventListener('click', (e) => {
  e.preventDefault();
  leadsView.style.display = 'block';
  statsView.style.display = 'none';
  pageTitle.textContent = 'All Leads';
  document.getElementById('sideLeads').classList.add('active');
  document.getElementById('sideStats').classList.remove('active');
});

document.getElementById('sideStats')?.addEventListener('click', async (e) => {
  e.preventDefault();
  leadsView.style.display = 'none';
  statsView.style.display = 'block';
  pageTitle.textContent = 'Statistics';
  document.getElementById('sideStats').classList.add('active');
  document.getElementById('sideLeads').classList.remove('active');
  loadStats();
});

// ─── Load Stats ───────────────────────────────────────────────
const loadStats = async () => {
  const data = await api('/leads/stats');
  if (!data || !data.success) return;

  const s = data.data;

  // Update mini-cards in leads view
  document.getElementById('statTotal').textContent  = s.total || 0;
  document.getElementById('statToday').textContent  = s.todayCount || 0;
  const newCount = s.byStatus.find(x => x._id === 'New')?.count || 0;
  document.getElementById('statNew').textContent    = newCount;
  const topWork = s.byWorkType[0]?._id || '—';
  document.getElementById('statTopWork').textContent = topWork.length > 10 ? topWork.slice(0,10) + '…' : topWork;

  // Stats page
  document.getElementById('statsTotalLeads').textContent = s.total || 0;
  document.getElementById('statsTodayLeads').textContent = s.todayCount || 0;

  const wt = document.getElementById('workTypeTable');
  if (wt) {
    wt.innerHTML = s.byWorkType.map(item => `
      <tr>
        <td><span class="badge badge-work">${item._id}</span></td>
        <td><strong>${item.count}</strong></td>
      </tr>
    `).join('') || '<tr><td colspan="2" style="text-align:center;color:#94A3B8;padding:20px;">No data</td></tr>';
  }

  const st = document.getElementById('statusTable');
  if (st) {
    const badgeMap = { 'New': 'badge-new', 'Contacted': 'badge-contacted', 'In Progress': 'badge-progress', 'Closed': 'badge-closed' };
    st.innerHTML = s.byStatus.map(item => `
      <tr>
        <td><span class="badge ${badgeMap[item._id] || ''}">${item._id}</span></td>
        <td><strong>${item.count}</strong></td>
      </tr>
    `).join('') || '<tr><td colspan="2" style="text-align:center;color:#94A3B8;padding:20px;">No data</td></tr>';
  }

  const l7 = document.getElementById('last7DaysTable');
  if (l7) {
    l7.innerHTML = s.last7Days.length ? s.last7Days.map(item => `
      <tr>
        <td>${new Date(item._id).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</td>
        <td><strong>${item.count}</strong></td>
      </tr>
    `).join('') : '<tr><td colspan="2" style="text-align:center;color:#94A3B8;padding:20px;">No leads in last 7 days</td></tr>';
  }
};

// ─── Load Leads ───────────────────────────────────────────────
const loadLeads = async (page = 1) => {
  currentPage = page;

  const search   = document.getElementById('searchInput')?.value.trim()    || '';
  const workType = document.getElementById('filterWorkType')?.value         || 'All';
  const status   = document.getElementById('filterStatus')?.value           || 'All';
  const city     = document.getElementById('filterCity')?.value.trim()      || '';

  const params = new URLSearchParams({ page, limit: pageSize });
  if (search)   params.set('search', search);
  if (workType !== 'All') params.set('workType', workType);
  if (status !== 'All')   params.set('status', status);
  if (city)     params.set('city', city);

  const tbody = document.getElementById('leadsTableBody');
  tbody.innerHTML = `<tr><td colspan="9" class="table-loading"><i class="fas fa-spinner"></i> Loading...</td></tr>`;

  const data = await api(`/leads?${params}`);
  if (!data || !data.success) {
    tbody.innerHTML = `<tr><td colspan="9" class="table-empty">Failed to load leads</td></tr>`;
    return;
  }

  const { data: leads, pagination } = data;

  if (!leads.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="table-empty"><i class="fas fa-inbox" style="font-size:2rem;display:block;margin-bottom:8px;"></i>No leads found</td></tr>`;
    document.getElementById('tableCount').textContent = '0 leads';
    document.getElementById('pagination').style.display = 'none';
    return;
  }

  const badgeMap = {
    'New':        'badge-new',
    'Contacted':  'badge-contacted',
    'In Progress':'badge-progress',
    'Closed':     'badge-closed'
  };

  tbody.innerHTML = leads.map((lead, i) => `
    <tr>
      <td style="color:#94A3B8;font-size:.8rem;">${(page - 1) * pageSize + i + 1}</td>
      <td class="td-name">${escapeHtml(lead.name)}</td>
      <td class="td-phone"><a href="tel:+91${lead.phone}">+91 ${lead.phone}</a></td>
      <td style="font-size:.82rem;">${escapeHtml(lead.email)}</td>
      <td>${escapeHtml(lead.city)}</td>
      <td><span class="badge badge-work">${escapeHtml(lead.workType)}</span></td>
      <td style="color:#6B7280;font-size:.82rem;">${escapeHtml(lead.tonnage || '—')}</td>
      <td>
        <select class="status-select" data-lead-id="${lead._id}">
          ${['New','Contacted','In Progress','Closed'].map(s =>
            `<option value="${s}" ${lead.status === s ? 'selected' : ''}>${s}</option>`
          ).join('')}
        </select>
      </td>
      <td style="color:#6B7280;font-size:.8rem;white-space:nowrap;">
        ${new Date(lead.submittedAt).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
      </td>
    </tr>
  `).join('');

  // Status update listeners
  tbody.querySelectorAll('.status-select').forEach(sel => {
    sel.addEventListener('change', async () => {
      const leadId = sel.getAttribute('data-lead-id');
      const res = await api(`/leads/${leadId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: sel.value })
      });
      if (res?.success) {
        showToast(`Status updated to "${sel.value}"`);
        loadStats(); // refresh mini-cards
      } else {
        showToast('Failed to update status', 'error');
      }
    });
  });

  // Update table count
  document.getElementById('tableCount').textContent =
    `${pagination.total} lead${pagination.total !== 1 ? 's' : ''} found`;

  // Pagination
  renderPagination(pagination);
};

// ─── Render Pagination ─────────────────────────────────────────
const renderPagination = ({ total, page, limit, pages }) => {
  const pagination = document.getElementById('pagination');
  const info       = document.getElementById('paginationInfo');
  const btns       = document.getElementById('paginationBtns');

  if (pages <= 1) {
    pagination.style.display = 'none';
    return;
  }

  pagination.style.display = 'flex';
  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);
  info.textContent = `Showing ${from}–${to} of ${total}`;

  let html = `<button ${page === 1 ? 'disabled' : ''} data-p="${page - 1}">‹</button>`;
  for (let p = 1; p <= pages; p++) {
    if (p === 1 || p === pages || Math.abs(p - page) <= 2) {
      html += `<button class="${p === page ? 'active' : ''}" data-p="${p}">${p}</button>`;
    } else if (Math.abs(p - page) === 3) {
      html += `<button disabled>…</button>`;
    }
  }
  html += `<button ${page === pages ? 'disabled' : ''} data-p="${page + 1}">›</button>`;

  btns.innerHTML = html;
  btns.querySelectorAll('button[data-p]').forEach(b => {
    b.addEventListener('click', () => loadLeads(parseInt(b.getAttribute('data-p'))));
  });
};

// ─── Filters with Debounce ────────────────────────────────────
['searchInput', 'filterWorkType', 'filterStatus', 'filterCity'].forEach(id => {
  document.getElementById(id)?.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => loadLeads(1), 400);
  });
});

// ─── Export CSV ───────────────────────────────────────────────
document.getElementById('exportBtn')?.addEventListener('click', async () => {
  const workType = document.getElementById('filterWorkType')?.value || 'All';
  const status   = document.getElementById('filterStatus')?.value   || 'All';
  const city     = document.getElementById('filterCity')?.value.trim() || '';

  const params = new URLSearchParams();
  if (workType !== 'All') params.set('workType', workType);
  if (status !== 'All')   params.set('status', status);
  if (city)     params.set('city', city);

  try {
    const blob = await api(`/leads/export?${params}`, {
      headers: { 'Authorization': `Bearer ${authToken}` },
      blob: true
    });
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a   = document.createElement('a');
    a.href    = url;
    a.download = `NP_Construction_Leads_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('CSV exported successfully');
  } catch {
    showToast('Export failed', 'error');
  }
});

// ─── Helper: Escape HTML ──────────────────────────────────────
const escapeHtml = (str) => {
  if (!str) return '—';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
