# Deployment

## Backend on Render

Use the root `render.yaml` Blueprint, or create a Render Web Service manually with:

- Root Directory: `BACKEND`
- Runtime: `Node`
- Build Command: `npm install`
- Start Command: `npm start`
- Health Check Path: `/health`

Set these Render environment variables:

```env
NODE_ENV=production
HOST=0.0.0.0
MONGODB_URI=your-mongodb-atlas-uri
ACCESS_TOKEN_SECRET=long-random-secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=different-long-random-secret
REFRESH_TOKEN_EXPIRY=10d
CORS_ORIGIN=https://nexus-customer-relationship-managem.vercel.app
CORS_ALLOW_VERCEL_PREVIEWS=false
```

If you want multiple frontend origins, separate them with commas:

```env
CORS_ORIGIN=http://localhost:3000,https://your-frontend.vercel.app
```

After Render deploys, your API base URL will look like:

```env
https://mini-crm-backend-tt6f.onrender.com/api/v1
```

## Frontend on Vercel

Create/import the Vercel project with:

- Root Directory: `FRONTEND`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

Set this Vercel environment variable:

```env
VITE_API_URL=https://mini-crm-backend-tt6f.onrender.com/api/v1
```

Enable Web Analytics and Speed Insights in the Vercel dashboard. The app already includes:

- `@vercel/analytics/react` for page views
- custom Vercel events for login, registration, and logout
- `@vercel/speed-insights/react` for Core Web Vitals

The `FRONTEND/vercel.json` rewrite keeps React Router routes working on page refresh.
