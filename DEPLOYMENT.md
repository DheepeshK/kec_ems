# KEC EMS Deployment Guide

## Project Structure

This is a monorepo with the following structure:

```
kec-ems/
├── client/              # React + Vite frontend (SPA)
│   ├── src/
│   ├── dist/           # Vite build output (deployed to Vercel)
│   ├── vite.config.ts
│   └── package.json
├── server/             # Express backend (separate service)
│   ├── src/
│   └── package.json
├── vercel.json         # Vercel deployment config
├── package.json        # Root workspace config
└── DEPLOYMENT.md       # This file
```

## Build System

### Local Development

```bash
# Install all dependencies
npm install

# Run both frontend and backend in development mode
npm run dev

# Or run individually
npm run dev:server  # Backend on :5000
npm run dev:client  # Frontend on :5173 with HMR
```

### Production Build

```bash
# Build only the frontend (outputs to client/dist/)
npm run build
```

**Build Output:**
- Frontend builds to: `/client/dist/`
- Contains: HTML, CSS, JavaScript bundles, and assets
- Size: ~270KB gzipped
- Build command: `tsc -b && vite build`

## Deployment Configuration

### Vercel Deployment (Frontend Only)

The `vercel.json` configuration:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "client/dist",
  "env": {
    "NODE_ENV": "production"
  },
  "routes": [
    {
      "src": "^/api(/.*)?$",
      "dest": "$1",
      "status": 404
    },
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

**Key Points:**

- **buildCommand**: Runs `npm run build` to generate the client bundle
- **outputDirectory**: Points to `client/dist/` where Vite outputs the build
- **routes**: Configures SPA routing (all routes without static files go to `/index.html`)

### API Communication

The frontend communicates with the backend via API calls to `/api`:

- All requests use relative paths: `/api/...`
- Vite proxy (dev): Routes `/api/*` to `http://localhost:5000`
- Production: Backend must be deployed separately and accessible at the API domain

## Deployment Steps

### 1. Push to Git

```bash
git push origin main
```

### 2. Vercel Auto-Deploy (if connected)

Vercel automatically:
1. Detects changes in the repository
2. Runs `npm run build` (which builds to `client/dist/`)
3. Deploys the `client/dist/` directory
4. SPA routing is configured via `vercel.json`

### 3. Manual Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel deploy --prod
```

### 4. Backend Deployment (Separate)

The backend needs to be deployed separately to:
- Render.com
- Railway.app
- AWS EC2
- Or any Node.js hosting

Update the frontend API URL in environment variables if needed:
- Development: `http://localhost:5000/api` (Vite proxy)
- Production: Configure in backend deployment

## Environment Variables

### Frontend

No special Vite environment variables needed. The frontend uses:
- Relative API paths: `/api`
- Configurable in `client/src/services/api.ts`

### Backend

Create `.env` file in the `server/` directory:
```
PORT=5000
DATABASE_URL=mysql://...
JWT_SECRET=...
```

## Troubleshooting

### "No Output Directory named dist found"

**Cause:** Vercel is looking for `dist/` but the output is in `client/dist/`

**Solution:** Ensure `vercel.json` has `"outputDirectory": "client/dist"`

### Frontend returning 404

**Cause:** SPA routing not configured properly

**Solution:** Verify `vercel.json` rewrites all non-file routes to `/index.html`

### API calls failing

**Cause:** Backend not accessible from production domain

**Solution:** 
1. Deploy backend to accessible URL
2. Update frontend API client if using different domain
3. Ensure CORS is enabled on backend

### Large bundle warning

The build shows a chunk >500KB warning. To optimize:

```typescript
// client/vite.config.ts - add:
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // Split large chunks
          'vendor': ['framer-motion', 'react-router-dom'],
        }
      }
    }
  }
})
```

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│           Vercel (Frontend)             │
├─────────────────────────────────────────┤
│  SPA: React + Vite (client/dist/)       │
│  - HTML, CSS, JS, Assets                │
│  - Client-side routing                  │
│  - API calls to /api                    │
└──────────────┬──────────────────────────┘
               │ API calls (/api/...)
               │ (HTTPS)
               ▼
┌─────────────────────────────────────────┐
│      External Backend Service           │
├─────────────────────────────────────────┤
│  Express.js (server/src/)               │
│  - Database connections                 │
│  - Business logic                       │
│  - Authentication                       │
│  - File uploads                         │
└─────────────────────────────────────────┘
```

## Key Files

| File | Purpose |
|------|---------|
| `vercel.json` | Vercel deployment configuration |
| `client/vite.config.ts` | Vite build configuration |
| `client/package.json` | Frontend dependencies and build scripts |
| `package.json` | Root workspace configuration |
| `server/package.json` | Backend dependencies |

## Next Steps

1. Deploy backend to a hosting platform (Render, Railway, etc.)
2. Connect this repo to Vercel
3. Vercel will auto-deploy on each push to main branch
4. Update backend API URL in production if needed
5. Monitor deployment in Vercel dashboard

## Support

For deployment issues:
- Check Vercel dashboard: https://vercel.com/dashboard
- Review build logs in Vercel project settings
- Verify `vercel.json` configuration
- Ensure backend is running and accessible
