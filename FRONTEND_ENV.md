# HireHub Frontend — Environment Variables (Vercel)

## Required

| Variable | Example | Notes |
|----------|---------|-------|
| `VITE_API_URL` | `https://your-backend.onrender.com/api` | Backend API base URL |

## Optional — Email (EmailJS)

| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_EMAILJS_SERVICE_ID` | `service_xxxxx` | From EmailJS dashboard |
| `VITE_EMAILJS_TEMPLATE_ID` | `template_xxxxx` | For contact/transactional emails |
| `VITE_EMAILJS_PUBLIC_KEY` | `your_public_key` | EmailJS public key |

## Optional — Monitoring

| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_SENTRY_DSN` | `https://xxxxx@sentry.io/xxxxx` | Frontend error tracking |

## Notes

- Vercel auto-injects `VITE_*` vars at **build time** — set them in **Settings → Environment Variables**
- All `VITE_*` vars are **public** (embedded in the JS bundle) — never put secrets here
- After adding vars, trigger a **redeploy** for them to take effect
