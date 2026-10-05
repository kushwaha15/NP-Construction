# 🏗️ NP Construction — Complete Website Details

---

## 📌 About the Website

**NP Construction** is a full-featured professional business website for a **Structural Steel & Iron Contractor** based in Ahmedabad, Gujarat, India.

The website serves two main purposes:
1. **Public-facing** — marketing, lead generation, showcasing projects
2. **Internal tool** — admin panel for managing leads, callbacks, analytics

---

## 👤 Owner / Business Info

| Field        | Details                                                   |
|--------------|-----------------------------------------------------------|
| Owner        | Ajeet                                                     |
| Business     | NP Construction                                           |
| Tagline      | Steel \| Strength \| Solutions                            |
| Phone        | +91 70165 93309                                           |
| WhatsApp     | +91 70165 93309                                           |
| Email        | ajeetsanu177@gmail.com                                    |
| Address      | HIGH-TECH, GMDC Ground, Thaltej, Ahmedabad, Gujarat 380061|
| Working Hours| Mon – Sat: 9:00 AM – 7:00 PM                              |
| Admin Password | NP@Admin2025 (stored in server/.env)                    |

---

## 📊 Business Stats

| Stat         | Value   |
|--------------|---------|
| Experience   | 15+ Years |
| Projects     | 350+ Completed |
| Steel Handled| 12,000+ Tons |
| Cities Served| 25+     |

---

## 🧱 Tech Stack

### Frontend
| Technology         | Purpose                              |
|--------------------|--------------------------------------|
| React 18           | UI framework                         |
| Vite               | Build tool / Dev server              |
| Tailwind CSS       | Styling                              |
| Framer Motion      | Animations                           |
| react-i18next      | Multi-language (EN / GU / HI)        |
| react-router-dom   | Client-side routing                  |
| react-compare-slider | Before/After project photos        |
| react-dropzone     | File uploads on contact form         |
| react-google-recaptcha | Spam protection on contact form  |
| recharts           | Admin analytics charts               |
| react-markdown     | Blog post rendering                  |
| react-hot-toast    | Toast notifications                  |
| react-helmet-async | SEO meta tags per page               |
| axios              | HTTP requests to backend             |

### Backend
| Technology       | Purpose                              |
|------------------|--------------------------------------|
| Node.js          | Runtime                              |
| Express.js       | Web framework                        |
| MongoDB Atlas    | Database (cloud)                     |
| Mongoose         | ODM for MongoDB                      |
| Nodemailer       | Email notifications (Gmail)          |
| Multer           | File upload handling                 |
| express-validator| Input validation                     |
| express-rate-limit | Rate limiting / spam protection    |
| bcryptjs         | Password hashing                     |
| dotenv           | Environment variable management      |

---

## 📁 Project Structure

```
np-construction/
│
├── frontend/                     ← React App (Vite + Tailwind)
│   ├── public/
│   │   └── images/               ← Logo, project photos, team photos
│   └── src/
│       ├── App.jsx               ← Main router
│       ├── main.jsx              ← Entry point
│       ├── index.css             ← Global styles
│       ├── i18n.js               ← i18n configuration
│       ├── components/           ← Shared UI components
│       │   ├── Navbar.jsx
│       │   ├── Footer.jsx
│       │   ├── WhatsAppWidget.jsx
│       │   ├── CallbackButton.jsx
│       │   ├── BrochurePopup.jsx
│       │   ├── BackToTop.jsx
│       │   ├── SectionHeading.jsx
│       │   └── ClientLogoWall.jsx
│       ├── pages/                ← All pages
│       │   ├── Home.jsx
│       │   ├── About.jsx
│       │   ├── Services.jsx
│       │   ├── Projects.jsx
│       │   ├── Testimonials.jsx
│       │   ├── Contact.jsx
│       │   ├── Estimator.jsx
│       │   ├── Blog.jsx
│       │   ├── BlogPost.jsx
│       │   ├── FAQ.jsx
│       │   ├── Referral.jsx
│       │   ├── services/
│       │   │   └── ServiceArea.jsx   ← City SEO pages
│       │   └── admin/
│       │       ├── AdminApp.jsx
│       │       ├── AdminLeads.jsx
│       │       ├── AdminAnalytics.jsx
│       │       ├── AdminCallbacks.jsx
│       │       └── AdminBlog.jsx
│       ├── locales/              ← Translations
│       │   ├── en/translation.json
│       │   ├── gu/translation.json
│       │   └── hi/translation.json
│       ├── data/blogs/           ← Blog post data (3 sample posts)
│       ├── hooks/
│       │   └── useScrollReveal.js
│       └── utils/
│           ├── siteConfig.js     ← Master config file
│           └── api.js            ← API helper functions
│
├── server/                       ← Node.js + Express Backend
│   ├── server.js                 ← Main entry point
│   ├── .env                      ← Secrets (MongoDB URI, email, password)
│   ├── models/
│   │   ├── Lead.js
│   │   ├── CallbackRequest.js
│   │   └── Referral.js
│   ├── routes/
│   │   ├── contact.js            ← POST /api/contact
│   │   └── admin.js              ← All /api/admin/* routes
│   └── uploads/                  ← Uploaded files (PDFs, blueprints)
│
├── client/                       ← OLD plain HTML backup (not used)
│
├── package.json
├── README.md
├── REACT_MIGRATION.md
└── WEBSITE_DETAILS.md            ← This file
```

---

## 🌐 All Pages & URLs

### Public Pages

| URL                        | Page              | Description                                      |
|----------------------------|-------------------|--------------------------------------------------|
| `/`                        | Home              | Hero, stats counter, services, about, testimonials, client logos |
| `/about`                   | About Us          | Company story, team members, values              |
| `/services`                | Services          | All services + project cost calculator           |
| `/services/ahmedabad`      | Ahmedabad SEO     | City-specific landing page (80 projects)         |
| `/services/surat`          | Surat SEO         | City-specific landing page (45 projects)         |
| `/services/vadodara`       | Vadodara SEO      | City-specific landing page (35 projects)         |
| `/services/rajkot`         | Rajkot SEO        | City-specific landing page (28 projects)         |
| `/services/gandhinagar`    | Gandhinagar SEO   | City-specific landing page (20 projects)         |
| `/projects`                | Projects          | Portfolio, before/after slider, videos, timeline |
| `/testimonials`            | Testimonials      | Client reviews and ratings                       |
| `/contact`                 | Contact           | Contact form with file upload + reCAPTCHA        |
| `/estimator`               | Estimator         | Steel quantity estimator tool                    |
| `/blog`                    | Blog              | Blog post listing                                |
| `/blog/:slug`              | Blog Post         | Individual blog post (markdown)                  |
| `/faq`                     | FAQ               | Frequently asked questions accordion             |
| `/refer`                   | Referral          | Refer a builder program                          |

### Admin Pages (Password Protected)

| URL                   | Page              | Description                                    |
|-----------------------|-------------------|------------------------------------------------|
| `/admin/leads`        | Leads             | All leads — search, filter, status, score      |
| `/admin/analytics`    | Analytics         | Pie, bar, line charts using Recharts           |
| `/admin/callbacks`    | Callbacks         | Callback request management                    |
| `/admin/blog`         | Blog Manager      | Create and manage blog posts                   |

---

## ⚙️ Features — Complete List (25 Features)

### Customer-Facing Features

| # | Feature                  | Location                                      |
|---|--------------------------|-----------------------------------------------|
| 1 | Hero section             | `pages/Home.jsx`                              |
| 2 | Animated stats counter   | `pages/Home.jsx` — StatCounter component      |
| 3 | Services listing         | `pages/Services.jsx`                          |
| 4 | Project cost calculator  | `pages/Services.jsx`                          |
| 5 | Steel quantity estimator | `pages/Estimator.jsx`                         |
| 6 | Project portfolio        | `pages/Projects.jsx`                          |
| 7 | Before/After photo slider| `pages/Projects.jsx` — react-compare-slider   |
| 8 | Project timeline view    | `pages/Projects.jsx`                          |
| 9 | Video gallery            | `pages/Projects.jsx` — YouTube + local MP4    |
| 10| Project location map     | `siteConfig.js` → PROJECT_LOCATIONS           |
| 11| Client logo wall         | `components/ClientLogoWall.jsx` — marquee     |
| 12| Testimonials             | `pages/Testimonials.jsx`                      |
| 13| Contact form + file upload| `pages/Contact.jsx` + Multer backend         |
| 14| reCAPTCHA on contact form| `pages/Contact.jsx`                           |
| 15| WhatsApp floating widget | `components/WhatsAppWidget.jsx`               |
| 16| Callback request button  | `components/CallbackButton.jsx`               |
| 17| Brochure download popup  | `components/BrochurePopup.jsx` (30s delay)    |
| 18| Multi-language switcher  | Navbar — EN / ગુજ / हिं (`locales/` folder)   |
| 19| City SEO landing pages   | `pages/services/ServiceArea.jsx` (5 cities)   |
| 20| Blog with markdown       | `pages/Blog.jsx` + `pages/BlogPost.jsx`       |
| 21| FAQ accordion            | `pages/FAQ.jsx`                               |
| 22| Referral program         | `pages/Referral.jsx`                          |
| 23| Back to top button       | `components/BackToTop.jsx`                    |
| 24| SEO meta tags            | react-helmet-async on every page              |
| 25| Scroll reveal animations | `hooks/useScrollReveal.js` + Framer Motion    |

### Admin Features

| # | Feature                       | Location                     |
|---|-------------------------------|------------------------------|
| 1 | Admin login (password)        | `pages/admin/AdminApp.jsx`   |
| 2 | Lead table (search/filter)    | `pages/admin/AdminLeads.jsx` |
| 3 | Lead status pipeline          | New → Contacted → In Progress → Closed |
| 4 | Lead scoring                  | 🔥 Hot / 🌤 Warm / ❄️ Cold   |
| 5 | Follow-up notes on leads      | Admin → click any lead       |
| 6 | Email reply from admin panel  | Admin → click any lead       |
| 7 | CSV export                    | Admin → Leads → Export CSV   |
| 8 | Analytics charts              | `pages/admin/AdminAnalytics.jsx` |
| 9 | Callback requests tab         | `pages/admin/AdminCallbacks.jsx` |
| 10| Blog manager                  | `pages/admin/AdminBlog.jsx`  |

---

## 🗄️ Database Models

### Lead Model (`server/models/Lead.js`)

| Field       | Type     | Values / Validation                                |
|-------------|----------|----------------------------------------------------|
| name        | String   | Required, 2–100 chars                              |
| phone       | String   | Required, Indian 10-digit (starts 6-9)             |
| email       | String   | Required, valid email, lowercase                   |
| city        | String   | Required, max 100 chars                            |
| workType    | String   | TMT Work / Fabrication / Full Steel Contract / Steel Framework / Other |
| tonnage     | String   | Optional, default "Not specified"                  |
| message     | String   | Optional, max 1000 chars                           |
| status      | String   | New / Contacted / In Progress / Closed             |
| leadScore   | String   | 🔥 Hot / 🌤 Warm / ❄️ Cold / ""                    |
| ipAddress   | String   | Captured automatically                             |
| files       | [String] | Uploaded file names                                |
| notes       | [Object] | { text, createdAt }                                |
| replies     | [Object] | { message, sentAt }                                |
| submittedAt | Date     | Auto timestamp                                     |

### CallbackRequest Model

| Field         | Type   | Details                                    |
|---------------|--------|--------------------------------------------|
| name          | String | Required                                   |
| phone         | String | Required, Indian mobile                    |
| preferredTime | String | Morning / Afternoon / Evening              |
| status        | String | Pending / Called / Done                    |

### Referral Model

| Field          | Type   | Details            |
|----------------|--------|--------------------|
| referrerName   | String | Person referring   |
| referrerPhone  | String | Their phone        |
| referredName   | String | Person referred    |
| referredPhone  | String | Their phone        |
| projectType    | String | Type of project    |

---

## 🔌 API Endpoints

| Method | Endpoint                        | Description                      | Rate Limit       |
|--------|---------------------------------|----------------------------------|------------------|
| GET    | `/api/test`                     | Health check + MongoDB status    | None             |
| POST   | `/api/contact`                  | Submit contact form + file upload| 10/hr per IP     |
| POST   | `/api/callback`                 | Request a callback               | 10/hr per IP     |
| POST   | `/api/referral`                 | Submit a referral                | 10/hr per IP     |
| POST   | `/api/brochure-lead`            | Brochure download lead capture   | 10/hr per IP     |
| POST   | `/api/admin/login`              | Admin login                      | 100/15min        |
| GET    | `/api/admin/leads`              | Get all leads (paginated)        | 100/15min        |
| GET    | `/api/admin/leads/stats`        | Lead statistics summary          | 100/15min        |
| GET    | `/api/admin/leads/monthly`      | Monthly lead trend (6 months)    | 100/15min        |
| GET    | `/api/admin/leads/export`       | Export leads as CSV              | 100/15min        |
| PATCH  | `/api/admin/leads/:id/status`   | Update lead status               | 100/15min        |
| PATCH  | `/api/admin/leads/:id/score`    | Update lead score                | 100/15min        |
| POST   | `/api/admin/leads/:id/notes`    | Add follow-up note               | 100/15min        |
| POST   | `/api/admin/leads/:id/reply`    | Send email reply to client       | 100/15min        |
| GET    | `/api/admin/callbacks`          | Get all callback requests        | 100/15min        |
| PATCH  | `/api/admin/callbacks/:id`      | Update callback status           | 100/15min        |

---

## 🔐 Security

- **Rate limiting** — forms: 10 requests/hr | API: 100 requests/15min
- **Input validation** — express-validator on all POST routes
- **File upload restrictions** — PDF, JPEG, PNG only; max 10MB; max 3 files
- **reCAPTCHA** — Google reCAPTCHA v2 on contact form
- **CORS** — restricted to `CLIENT_URL` in production
- **Password hashing** — bcryptjs for admin password
- **Body size limit** — 10KB max JSON/form body

---

## 🌍 Service Areas & Projects

| City        | Projects | Coordinates              |
|-------------|----------|--------------------------|
| Ahmedabad   | 80       | 23.0225° N, 72.5714° E   |
| Surat       | 45       | 21.1702° N, 72.8311° E   |
| Vadodara    | 35       | 22.3072° N, 73.1812° E   |
| Rajkot      | 28       | 22.3039° N, 70.8022° E   |
| Gandhinagar | 20       | 23.2156° N, 72.6369° E   |

---

## 🔧 Services Offered

1. **TMT Work** — TMT/rebar bending, cutting, tying
2. **Fabrication** — Custom steel fabrication
3. **Steel Erection** — Structural steel erection
4. **Welding** — Industrial and structural welding
5. **Trusses** — Roof and floor trusses
6. **Industrial** — Factory and warehouse steel structures

---

## 🌐 Translations / Languages

The site supports 3 languages, switchable from the Navbar:

| Code | Language | File                             |
|------|----------|----------------------------------|
| en   | English  | `src/locales/en/translation.json`|
| gu   | Gujarati | `src/locales/gu/translation.json`|
| hi   | Hindi    | `src/locales/hi/translation.json`|

---

## 🚀 How to Run (Development)

### Prerequisites
- Node.js v18+
- MongoDB Atlas account

### Step 1 — Configure Environment
Create/edit `server/.env`:
```
MONGODB_URI=<your MongoDB Atlas URI>
PORT=5000
OWNER_EMAIL=ajeetsanu177@gmail.com
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
ADMIN_PASSWORD=NP@Admin2025
WHATSAPP_NUMBER=917016593309
CLIENT_URL=http://localhost:3000
```

### Step 2 — Install Dependencies
```bash
# Server
cd np-construction/server
npm install

# Frontend
cd np-construction/frontend
npm install
```

### Step 3 — Run (Two Terminals)
```bash
# Terminal 1 — Backend
cd np-construction/server
npm start
# → http://localhost:5000

# Terminal 2 — Frontend
cd np-construction/frontend
npm run dev
# → http://localhost:5173
```

### Step 4 — Production Build
```bash
cd np-construction/frontend
npm run build
# Outputs to: server/public/

cd ../server
npm start
# Everything served at http://localhost:5000
```

---

## 🔗 URLs Summary

| URL                            | What You Find                  |
|--------------------------------|--------------------------------|
| http://localhost:5173          | React dev server (frontend)    |
| http://localhost:5000          | Backend + served React build   |
| http://localhost:5000/api/test | API health check               |
| http://localhost:5000/admin/leads | Admin panel                 |

---

## 🚢 Deployment (Render.com)

1. Push code to GitHub
2. Create new Web Service on Render
3. Root Directory: `server`
4. Build Command: `npm install && cd ../frontend && npm install && npm run build`
5. Start Command: `node server.js`
6. Add all `.env` variables in Render dashboard
7. Update `CLIENT_URL` to your live domain
8. Update reCAPTCHA keys in `siteConfig.js`

---

## ✏️ Easy Customization

| What to Change           | Where                                           |
|--------------------------|-------------------------------------------------|
| Phone / Email / Address  | `frontend/src/utils/siteConfig.js` → SITE       |
| Hero background image    | `frontend/public/images/hero-bg.jpg`            |
| About photo              | `frontend/public/images/about-main.jpg`         |
| Team member photos       | `frontend/public/images/team-member-1..4.jpg`   |
| Project photos           | `frontend/public/images/project-1..12.jpg`      |
| Client logos             | `frontend/public/images/clients/client-1..6.png`|
| Before/after images      | `siteConfig.js` → PROJECT_BEFORE_AFTER          |
| YouTube videos           | `siteConfig.js` → VIDEOS                        |
| Blog posts               | `frontend/src/data/blogs/index.js`              |
| Translations             | `frontend/src/locales/en|gu|hi/translation.json`|
| Admin password           | `server/.env` → ADMIN_PASSWORD                  |
| Google Maps              | `siteConfig.js` → GOOGLE_MAPS_API_KEY           |
| reCAPTCHA key            | `siteConfig.js` → RECAPTCHA_SITE_KEY            |

---

## 📞 Support Contact

**Owner:** Ajeet
**Email:** ajeetsanu177@gmail.com
**WhatsApp:** +91 70165 93309
**Address:** HIGH-TECH, GMDC Ground, Thaltej, Ahmedabad, Gujarat – 380061

---

*© 2025 NP Construction. All Rights Reserved.*
