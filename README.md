# NP Construction

NP Construction is split into two applications:

- `frontend/`: React, Vite, and Tailwind CSS; designed to be deployed to Vercel.
- `server/`: Express API and MongoDB integration; designed to be deployed to Render.

The selected repository root is this `np-construction/` directory. Use `frontend` as Vercel's Root Directory and `server` as Render's Root Directory.

## Requirements

- Node.js 20.19 or newer (Node.js 22 recommended).
- MongoDB Atlas or another reachable MongoDB instance.
- Cloudinary credentials for portfolio uploads.

The backend package declares Mongoose `^8.0.3`, resolved as `8.24.4` in its lockfile. It does not use Mongoose 9.x. The outer workspace package separately lists Mongoose `^9.9.4`.

## Run Locally

Install dependencies in each application:

```powershell
cd server
npm install
```

```powershell
cd frontend
npm install
```

Copy `server/.env.example` to `server/.env` and fill in the values in your local environment. Never commit `.env` files. The frontend's development API URL is configured in `frontend/.env.development`.

For local CORS, set `CLIENT_URL` to exactly `http://localhost:3000` (no trailing slash). Vite runs on port `3000`; the API defaults to port `5000` when `PORT` is not set. Run the backend and frontend in separate terminals:

```powershell
cd server
npm start
```

```powershell
cd frontend
npm run dev
```

## Environment Variables

The following names are read by the server through `process.env`. The example file contains empty values; enter actual configuration only in your local ignored `.env` file or the Render dashboard.

| Name | Purpose | Required |
| --- | --- | --- |
| `MONGODB_URI` | MongoDB connection string; required to connect to the production database. | Yes in production |
| `PORT` | HTTP listener port; Render supplies this, and the server defaults to `5000` locally. | No |
| `CLIENT_URL` | One allowed browser origin for CORS. Set to the exact frontend origin in production. | Yes in production |
| `ADMIN_PASSWORD` | Password checked by the admin login endpoint. Set explicitly for production. | Yes in production |
| `OWNER_EMAIL` | Recipient of contact-form notification emails. | When email notifications are enabled |
| `EMAIL_USER` | Gmail account used to send notifications and admin replies. | With `EMAIL_PASS` when email is enabled |
| `EMAIL_PASS` | Gmail App Password used by the mail transport. | With `EMAIL_USER` when email is enabled |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account used for portfolio media. | For portfolio uploads |
| `CLOUDINARY_API_KEY` | Cloudinary API credential. | For portfolio uploads |
| `CLOUDINARY_API_SECRET` | Cloudinary API credential. | For portfolio uploads |

`CLIENT_URL` is compared as a single CORS origin. The current server code does not parse comma-separated origins. For local development use `http://localhost:3000`; on Render use the exact Vercel site URL with no trailing slash.

## Deploy the Backend to Render

Create a Render Web Service connected to the repository:

| Setting | Value |
| --- | --- |
| Root Directory | `server` |
| Build Command | `npm install` |
| Start Command | `npm start` |

Add the required backend environment variables in Render's dashboard. Set `NODE_VERSION` to `22`. Set `CLIENT_URL` to the exact deployed Vercel URL, such as `https://your-site.vercel.app`, with no trailing slash. The server accepts one origin string, not a comma-separated list.

## Deploy the Frontend to Vercel

Create a Vercel project connected to the repository:

| Setting | Value |
| --- | --- |
| Root Directory | `frontend` |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Set this environment variable in Vercel for each deployment environment:

```text
VITE_API_URL=https://your-render-service.onrender.com
```

Use the actual Render service URL with no trailing slash. Vite embeds this value at build time, so redeploy after changing it. `vercel.json` rewrites application paths to `index.html` for client-side routing. The build output is `frontend/dist`.

## Before You Deploy

- In Atlas Network Access, allow connections from Render using `0.0.0.0/0` or Render's supported outbound IP addresses.
- Add the deployed Vercel domain to the Google reCAPTCHA admin console.
- Set `NODE_VERSION=22` in Render.
- Never commit `.env` files or secret values.
- Render's free plan sleeps after 15 minutes of inactivity; the first request after sleep can take about a minute. Use a free uptime monitor to ping `/api/test` every 5 minutes, or choose a paid always-on plan.

## File Upload Storage

- Contact-form files are written by Multer to `server/uploads/` on the server's local disk. Render's disk is temporary by default; these files can be lost on a restart or redeploy. Use persistent or object storage if these files must survive.
- Portfolio images and videos are uploaded to Cloudinary in the `np-construction/portfolio` folder. Their Cloudinary URLs and metadata are stored in MongoDB.

## Authentication

The admin login response returns a bearer token. The frontend stores it in `localStorage` and sends it in the `Authorization` header; authentication does not use cookies. The login screen is reached at `/admin`, and a successful login opens `/admin/dashboard`.

## Routes

| Path | Behavior |
| --- | --- |
| `/` | Home |
| `/about` | About |
| `/services` | Services |
| `/services/:city` | Service area |
| `/projects` | Projects and portfolio |
| `/reviews` | Reviews |
| `/testimonials` | Redirects to `/reviews` |
| `/portfolio` | Redirects to `/projects` |
| `/contact` | Contact and quote form |
| `/estimator` | Estimator |
| `/blog` | Blog listing |
| `/blog/:slug` | Blog post |
| `/faq` | Frequently asked questions |
| `/refer` | Referral form |
| `/admin` | Admin login or dashboard |
| `/admin/dashboard` | Admin dashboard |
| `/admin/leads` | Lead management |
| `/admin/callbacks` | Callback management |
| `/admin/portfolio` | Portfolio management |
| `/admin/reviews` | Review management |
| `/admin/blog` | Blog management |
| `/admin/analytics` | Analytics |

## Troubleshooting

- **CORS error:** Set Render's `CLIENT_URL` to the exact Vercel origin with no trailing slash. The server accepts one origin, not a comma-separated list.
- **Requests go to the placeholder host:** Set Vercel's `VITE_API_URL` to the real Render URL and redeploy; the value is embedded during the build.
- **First request is slow:** Render's free plan may be waking from sleep. Allow about a minute, use a monitor pinging `/api/test` every 5 minutes, or use an always-on plan.
- **Email reports “Invalid login”:** Use a Gmail App Password, entered without spaces, rather than the account password.
- **Atlas connection timeout:** Check the MongoDB URI and Atlas Network Access rules; make sure Render is allowed to connect.

## Local Build

```powershell
cd frontend
npm run build
npm run preview
```

The production build is created in `frontend/dist`; preview it locally with `npm run preview`.
