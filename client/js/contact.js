/* ============================================================
   NP Construction — contact.js
   Handles: form validation, API submission, UI feedback
============================================================ */

// ─── Config ──────────────────────────────────────────────────
// REPLACE: Update API_BASE if deploying to a different domain
const API_BASE = window.location.origin;

// ─── DOM References ──────────────────────────────────────────
const form         = document.getElementById('contactForm');
const submitBtn    = document.getElementById('submitBtn');
const submitText   = document.getElementById('submitText');
const submitSpinner = document.getElementById('submitSpinner');
const formSuccess  = document.getElementById('formSuccess');
const formError    = document.getElementById('formError');
const formErrorMsg = document.getElementById('formErrorMsg');

if (!form) return; // Guard: only run on contact page

// ─── Field Validation Rules ───────────────────────────────────
const validators = {
  name: {
    el: () => document.getElementById('name'),
    errEl: () => document.getElementById('nameError'),
    validate(val) {
      if (!val.trim()) return 'Full name is required';
      if (val.trim().length < 2) return 'Name must be at least 2 characters';
      if (val.trim().length > 100) return 'Name too long (max 100 characters)';
      return null;
    }
  },
  phone: {
    el: () => document.getElementById('phone'),
    errEl: () => document.getElementById('phoneError'),
    validate(val) {
      if (!val.trim()) return 'Phone number is required';
      if (!/^[6-9]\d{9}$/.test(val.trim())) return 'Enter a valid 10-digit Indian mobile number';
      return null;
    }
  },
  email: {
    el: () => document.getElementById('email'),
    errEl: () => document.getElementById('emailError'),
    validate(val) {
      if (!val.trim()) return 'Email address is required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) return 'Enter a valid email address';
      return null;
    }
  },
  city: {
    el: () => document.getElementById('city'),
    errEl: () => document.getElementById('cityError'),
    validate(val) {
      if (!val.trim()) return 'City / Project Location is required';
      return null;
    }
  },
  workType: {
    el: () => document.getElementById('workType'),
    errEl: () => document.getElementById('workTypeError'),
    validate(val) {
      if (!val) return 'Please select a type of work';
      return null;
    }
  }
};

// ─── Show / Clear field error ────────────────────────────────
const showFieldError = (errEl, msg) => {
  errEl.textContent = msg;
  errEl.classList.add('show');
};
const clearFieldError = (field) => {
  field.el().classList.remove('error');
  field.errEl().classList.remove('show');
  field.errEl().textContent = '';
};

// ─── Live validation on blur ──────────────────────────────────
Object.values(validators).forEach(field => {
  const el = field.el();
  if (!el) return;
  el.addEventListener('blur', () => {
    const err = field.validate(el.value);
    if (err) {
      el.classList.add('error');
      showFieldError(field.errEl(), err);
    } else {
      clearFieldError(field);
    }
  });
  el.addEventListener('input', () => {
    if (el.classList.contains('error')) {
      const err = field.validate(el.value);
      if (!err) clearFieldError(field);
    }
  });
});

// Phone: only allow digits
document.getElementById('phone')?.addEventListener('input', function() {
  this.value = this.value.replace(/\D/g, '').slice(0, 10);
});

// ─── Validate All Fields ─────────────────────────────────────
const validateAll = () => {
  let isValid = true;
  Object.values(validators).forEach(field => {
    const el = field.el();
    if (!el) return;
    const err = field.validate(el.value);
    if (err) {
      el.classList.add('error');
      showFieldError(field.errEl(), err);
      isValid = false;
    } else {
      clearFieldError(field);
    }
  });
  return isValid;
};

// ─── Set Loading State ────────────────────────────────────────
const setLoading = (loading) => {
  submitBtn.disabled = loading;
  submitText.style.display  = loading ? 'none' : 'flex';
  submitSpinner.style.display = loading ? 'block' : 'none';
};

// ─── Show Alerts ──────────────────────────────────────────────
const showAlert = (type, msg) => {
  formSuccess.classList.remove('show');
  formError.classList.remove('show');
  if (type === 'success') {
    formSuccess.classList.add('show');
    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    if (msg) formErrorMsg.textContent = msg;
    formError.classList.add('show');
    formError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
};

// ─── Form Submit ──────────────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  formSuccess.classList.remove('show');
  formError.classList.remove('show');

  if (!validateAll()) {
    // Scroll to first error
    const firstError = form.querySelector('.error');
    if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  setLoading(true);

  const payload = {
    name:     document.getElementById('name').value.trim(),
    phone:    document.getElementById('phone').value.trim(),
    email:    document.getElementById('email').value.trim(),
    city:     document.getElementById('city').value.trim(),
    workType: document.getElementById('workType').value,
    tonnage:  document.getElementById('tonnage').value.trim(),
    message:  document.getElementById('message').value.trim()
  };

  try {
    const res = await fetch(`${API_BASE}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.ok && data.success) {
      showAlert('success');
      form.reset();
      // Re-hide spinner properly
    } else {
      // Handle server validation errors
      if (data.errors && Array.isArray(data.errors)) {
        data.errors.forEach(err => {
          const field = validators[err.field];
          if (field) {
            field.el().classList.add('error');
            showFieldError(field.errEl(), err.message);
          }
        });
        showAlert('error', 'Please fix the errors above.');
      } else {
        showAlert('error', data.message || 'Something went wrong. Please try again.');
      }
    }
  } catch (err) {
    console.error('Form submit error:', err);
    showAlert('error', 'Network error. Please check your connection and try again.');
  } finally {
    setLoading(false);
  }
});
