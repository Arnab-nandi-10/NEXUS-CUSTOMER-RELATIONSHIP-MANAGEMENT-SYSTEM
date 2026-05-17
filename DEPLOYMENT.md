# Deployment

## Backend on Railway

Create a Railway Node service from the repo and set the service root/start settings to:

- Root Directory: `BACKEND`
- Build Command: `npm install`
- Start Command: `npm start`

Set these Railway environment variables:

```env
NODE_ENV=production
MONGODB_URI=your-mongodb-atlas-uri
ACCESS_TOKEN_SECRET=long-random-secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=different-long-random-secret
REFRESH_TOKEN_EXPIRY=10d
CORS_ORIGIN=https://nexus-customer-relationship-managem.vercel.app
FRONTEND_URL=https://nexus-customer-relationship-managem.vercel.app
BACKEND_URL=https://nexus-customer-relationship-management-system-production.up.railway.app
CORS_ALLOW_VERCEL_PREVIEWS=false
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

If you want multiple frontend origins, separate them with commas:

```env
CORS_ORIGIN=http://localhost:3000,https://your-frontend.vercel.app
```

After Railway deploys, your API base URL will look like:

```env
https://nexus-customer-relationship-management-system-production.up.railway.app/api
```

OAuth callback URLs to put in the provider dashboards:

```txt
Google: https://nexus-customer-relationship-management-system-production.up.railway.app/api/auth/google/callback
GitHub: https://nexus-customer-relationship-management-system-production.up.railway.app/api/auth/github/callback
```

## Frontend on Vercel

Create/import the Vercel project with:

- Root Directory: `FRONTEND`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

Set this Vercel environment variable:

```env
VITE_API_URL=https://nexus-customer-relationship-management-system-production.up.railway.app
```

Enable Web Analytics and Speed Insights in the Vercel dashboard. The app already includes:

- `@vercel/analytics/react` for page views
- custom Vercel events for login, registration, and logout
- `@vercel/speed-insights/react` for Core Web Vitals

The `FRONTEND/vercel.json` rewrite keeps React Router routes working on page refresh.
