# NP Construction — React Migration Guide

## New Project Structure

```
np-construction/
├── client/          ← OLD plain HTML (backup, not used anymore)
├── frontend/        ← NEW React + Vite + Tailwind frontend
│   ├── src/
│   │   ├── components/    Navbar, Footer, WhatsApp, Callback, etc.
│   │   ├── pages/         All 13 pages
│   │   │   ├── Home, About, Services, Projects, Testimonials
│   │   │   ├── Contact, Estimator, Blog, BlogPost, FAQ, Referral
│   │   │   ├── services/ServiceArea.jsx   (5 city SEO pages)
│   │   │   └── admin/     AdminApp, AdminLeads, AdminAnalytics,
│   │   │                   AdminCallbacks, AdminBlog
│   │   ├── locales/       en, gu, hi translations
│   │   ├── data/blogs/    3 sample blog posts
│   │   ├── hooks/         useScrollReveal
│   │   └── utils/siteConfig.js  ← Edit this to change contact info
│   └── package.json
└── server/          ← Node.js + Express backend (updated)
    ├── server.js    ← Now serves React build + all new API routes
    ├── models/      Lead, CallbackRequest, Referral
    ├── routes/      contact, admin
    └── uploads/     Uploaded files stored here
```

---

## How to Run

### Step 1 — Install server dependencies
```
cd np-construction/server
npm install
```

### Step 2 — Install frontend dependencies
```
cd np-construction/frontend
npm install
```

### Step 3 — Start development (two terminals)

**Terminal 1 — Backend:**
```
cd np-construction/server
npm start
```

**Terminal 2 — Frontend dev server:**
```
cd np-construction/frontend
npm run dev
```

Open http://localhost:3000 for the React app (with hot reload)
Open http://localhost:5000/api/test to verify the API

---

## Production Build

```
cd np-construction/frontend
npm run build
```

This outputs to `server/public/`. Then just run `npm start` in server/ — it serves everything from one process.

---

## All 20 Features — Where They Are

| Feature | Location |
|---|---|
| Steel Quantity Estimator | `/estimator` → `pages/Estimator.jsx` |
| Project Cost Calculator | `/services` → `pages/Services.jsx` |
| File Upload on Quote Form | `pages/Contact.jsx` + multer in server |
| Before & After Slider | `/projects` tab → `pages/Projects.jsx` |
| Project Timeline View | `/projects` tab → `pages/Projects.jsx` |
| Video Gallery | `/projects` tab → `pages/Projects.jsx` |
| Project Location Map | `siteConfig.js` → `PROJECT_LOCATIONS` |
| Multi-language (EN/GU/HI) | Navbar switcher, `locales/` folder |
| WhatsApp Chat Widget | `components/WhatsAppWidget.jsx` |
| Callback Request | `components/CallbackButton.jsx` |
| OTP (ready for SMS API) | Add to `Contact.jsx` when you get SMS key |
| reCAPTCHA | `pages/Contact.jsx` (update site key in siteConfig.js) |
| Brochure Download | `components/BrochurePopup.jsx` |
| Blog / News | `/blog` → `pages/Blog.jsx`, `data/blogs/` |
| Service Area Pages | `/services/ahmedabad` etc → `pages/services/ServiceArea.jsx` |
| Admin Export (CSV/Excel) | Admin → Leads → Export CSV button |
| Notes on Inquiries | Admin → click any lead → Notes section |
| Email Reply from Admin | Admin → click any lead → Reply section |
| Analytics Dashboard | Admin → Analytics tab (recharts) |
| Callback Requests Tab | Admin → Callbacks tab |
| Blog Manager | Admin → Blog Manager (react-quill) |
| Lead Scoring | Admin → each lead row has score dropdown |
| Referral Feature | `/refer` → `pages/Referral.jsx` |
| Client Logo Wall | Home + About page (configure in siteConfig.js) |
| FAQ Page | `/faq` → `pages/FAQ.jsx` |

---

## Update Contact Info

Edit `frontend/src/utils/siteConfig.js`:

```js
export const SITE = {
  phone:    '+91 70165 93309',
  whatsapp: '917016593309',
  email:    'ajeetsanu177@gmail.com',
  address:  'HIGH-TECH, GMDC Ground, Thaltej, Ahmedabad, Gujarat – 380061',
  ...
};
```

## Add Real Google Maps

1. Get API key from console.cloud.google.com
2. Update `GOOGLE_MAPS_API_KEY` in `siteConfig.js`

## Add OTP (MSG91 / Fast2SMS)

1. Sign up at fast2sms.com
2. Add `SMS_API_KEY` to `server/.env`
3. Uncomment OTP code in `Contact.jsx`
