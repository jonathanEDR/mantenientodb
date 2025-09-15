Deploying the frontend to Vercel

Quick steps

1. Push your repo to GitHub.
2. In Vercel dashboard, create a new project and import the repo.
3. Set the root directory to `frontend` when prompted.
4. Build command: `npm ci && npm run build`
5. Output directory: `dist`
6. Add environment variables in Vercel (set via Project Settings -> Environment Variables):
   - VITE_CLERK_PUBLISHABLE_KEY (public)
   - CLERK_ISSUER (public)
   - VITE_API_BASE_URL (public) - point to your backend URL
7. Deploy.

Notes
- Vite will produce a static build in `dist` which Vercel will serve.
- If you use server-side routes, convert them to serverless functions under `/api`.
- Keep secrets in Vercel environment variables and don't commit `.env`.
