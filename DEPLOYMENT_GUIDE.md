# AOT Asset Management - Vercel Deployment Guide

## Overview
This guide covers deploying both the frontend and backend services to Vercel.

## Prerequisites
- Vercel account (https://vercel.com/signup)
- Vercel CLI installed: `npm i -g vercel`
- GitHub/GitLab repository (recommended)
- Supabase account with configured database

---

## Part 1: Backend Deployment

### Step 1: Prepare Backend for Vercel

The backend is already configured with `backend/vercel.json`. Review it:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "src/server.ts"
    }
  ]
}
```

### Step 2: Create Vercel Project for Backend

```bash
cd backend
vercel login
vercel
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Your account
- **Link to existing project?** No
- **Project name?** aot-backend (or your preferred name)
- **Directory?** ./
- **Override settings?** No

### Step 3: Configure Backend Environment Variables

In Vercel Dashboard:
1. Go to your backend project
2. Navigate to Settings → Environment Variables
3. Add the following variables:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `NODE_ENV` | `production` | Production |
| `PORT` | `3001` | All |
| `SUPABASE_URL` | `https://wvbyapxobvpiozdhyxjj.supabase.co` | All |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key | All |
| `SUPABASE_KEY` | Your public key | All |
| `CORS_ORIGIN` | Your frontend URL | Production |

Or via CLI:
```bash
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add SUPABASE_KEY
vercel env add CORS_ORIGIN
```

### Step 4: Deploy Backend

```bash
vercel --prod
```

Your backend will be available at: `https://aot-backend.vercel.app` (or similar)

### Step 5: Test Backend Deployment

```bash
curl https://your-backend-url.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Part 2: Frontend Deployment

### Step 1: Update Frontend Environment Variables

Create/update `.env.production`:

```env
VITE_API_URL=https://your-backend-url.vercel.app/api
VITE_WS_URL=wss://your-backend-url.vercel.app
```

### Step 2: Build Frontend Locally (Test)

```bash
cd /home/engine/project  # Root directory
npm run build
```

Verify `dist/` folder is created with:
- index.html
- assets/
- Leaflet CSS/images

### Step 3: Create Vercel Project for Frontend

```bash
vercel login
vercel
```

Follow the prompts:
- **Set up and deploy?** Yes
- **Which scope?** Your account
- **Link to existing project?** No
- **Project name?** aot-asset-management (or your preferred name)
- **Directory?** ./
- **Build command?** `npm run build`
- **Output directory?** `dist`
- **Override settings?** No

### Step 4: Configure Frontend Environment Variables

In Vercel Dashboard:
1. Go to your frontend project
2. Navigate to Settings → Environment Variables
3. Add the following:

| Variable Name | Value | Environment |
|--------------|-------|-------------|
| `VITE_API_URL` | `https://your-backend-url.vercel.app/api` | Production |
| `VITE_WS_URL` | `wss://your-backend-url.vercel.app` | Production |

Or via CLI:
```bash
vercel env add VITE_API_URL production
vercel env add VITE_WS_URL production
```

### Step 5: Deploy Frontend

```bash
vercel --prod
```

Your frontend will be available at: `https://aot-asset-management.vercel.app` (or similar)

---

## Part 3: Post-Deployment Configuration

### Update CORS on Backend

1. Go to backend Vercel project
2. Update `CORS_ORIGIN` environment variable to your frontend URL:
   ```
   https://aot-asset-management.vercel.app
   ```
3. Redeploy backend: `vercel --prod`

### Update Supabase Settings

If using Supabase Row Level Security:
1. Go to Supabase Dashboard
2. Navigate to Authentication → URL Configuration
3. Add your frontend URL to allowed origins

### Test Complete Integration

1. Open frontend URL
2. Open browser DevTools → Console
3. Navigate through the application
4. Check for:
   - ✅ No CORS errors
   - ✅ API calls successful
   - ✅ WebSocket connection established
   - ✅ Map loads correctly

---

## Part 4: Continuous Deployment (CI/CD)

### Option 1: GitHub Integration (Recommended)

1. Push code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial deployment"
   git remote add origin https://github.com/yourusername/aot-project.git
   git push -u origin main
   ```

2. Connect to Vercel:
   - Go to Vercel Dashboard
   - Click "Import Project"
   - Select your GitHub repository
   - Configure:
     - **Framework**: Vite (for frontend) / Other (for backend)
     - **Root Directory**: `./ ` (frontend) or `backend/` (backend)
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist` (frontend only)

3. Auto-deploy on push:
   - Every push to `main` → Production deployment
   - Every PR → Preview deployment

### Option 2: Manual Deployment

```bash
# Deploy backend
cd backend
vercel --prod

# Deploy frontend
cd ..
vercel --prod
```

---

## Part 5: Monitoring and Maintenance

### Vercel Analytics

Enable in Vercel Dashboard:
- Settings → Analytics → Enable

Provides:
- Page views
- Performance metrics
- Core Web Vitals

### Vercel Logs

View real-time logs:
```bash
vercel logs https://your-app-url.vercel.app
```

Or in Dashboard:
- Deployments → Select deployment → View Logs

### Health Monitoring

Set up monitoring with:
- **Uptime Robot** (https://uptimerobot.com)
- **Pingdom** (https://www.pingdom.com)
- **Better Uptime** (https://betteruptime.com)

Monitor endpoints:
- Frontend: `https://your-frontend.vercel.app`
- Backend: `https://your-backend.vercel.app/api/health`

---

## Part 6: Troubleshooting

### Issue: CORS Errors

**Solution**:
1. Verify `CORS_ORIGIN` in backend matches frontend URL exactly
2. Include protocol (`https://`)
3. No trailing slash
4. Redeploy backend after changes

### Issue: Environment Variables Not Working

**Solution**:
1. Verify variables are set for correct environment (Production)
2. Check variable names match exactly (case-sensitive)
3. Redeploy after adding/changing variables
4. Clear build cache: `vercel --force`

### Issue: Build Failures

**Solution**:
1. Check build logs in Vercel Dashboard
2. Test build locally: `npm run build`
3. Verify all dependencies in package.json
4. Check Node.js version compatibility

### Issue: WebSocket Connection Fails

**Note**: Vercel has limitations with WebSockets on serverless functions.

**Solutions**:
1. Use Vercel Edge Functions (if available)
2. Deploy backend to alternative platform:
   - Railway (https://railway.app)
   - Render (https://render.com)
   - Heroku (https://heroku.com)
3. Use Supabase Realtime instead of WebSocket

### Issue: API Timeout (504)

Vercel serverless functions have 10-60 second timeout (depending on plan).

**Solutions**:
1. Optimize database queries
2. Add indexes to Supabase tables
3. Implement request caching
4. Use Vercel Pro plan for longer timeouts

### Issue: Map Tiles Not Loading

**Solution**:
1. Verify Leaflet CSS is in `index.html`
2. Check CSP headers don't block tile domains
3. Verify OpenStreetMap/CartoDB are accessible

---

## Part 7: Performance Optimization

### Frontend Optimization

1. **Code Splitting**:
   ```typescript
   // Use dynamic imports
   const PropertyMap = lazy(() => import('./components/LeafletMap'));
   ```

2. **Asset Optimization**:
   - Images: Use WebP format
   - Icons: Use SVG sprites
   - Fonts: Subset fonts, use font-display: swap

3. **Caching**:
   - Vercel automatically caches static assets
   - Use SWR or React Query for API caching

### Backend Optimization

1. **Database Connection Pooling**:
   Supabase handles this automatically

2. **Response Caching**:
   ```typescript
   res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
   ```

3. **Compression**:
   ```typescript
   import compression from 'compression';
   app.use(compression());
   ```

---

## Part 8: Security Checklist

- [ ] Environment variables stored securely in Vercel
- [ ] No secrets in code or Git history
- [ ] CORS configured correctly
- [ ] Supabase Row Level Security enabled
- [ ] API rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] CSP headers configured
- [ ] Dependency security audit: `npm audit`

---

## Part 9: Rollback Procedure

If deployment has issues:

1. **Via Dashboard**:
   - Go to Deployments
   - Find previous working deployment
   - Click "..." menu → Promote to Production

2. **Via CLI**:
   ```bash
   vercel rollback
   ```

3. **Via Git** (if using CI/CD):
   ```bash
   git revert HEAD
   git push
   ```

---

## Part 10: Custom Domain Setup

### Add Custom Domain

1. Go to Vercel Dashboard → Settings → Domains
2. Click "Add"
3. Enter your domain: `app.yourdomain.com`
4. Follow DNS configuration instructions

### DNS Configuration

Add CNAME record:
```
Type: CNAME
Name: app
Value: cname.vercel-dns.com
```

Or A record:
```
Type: A
Name: @
Value: 76.76.21.21
```

### SSL Certificate

- Automatically provisioned by Vercel
- Uses Let's Encrypt
- Auto-renewal enabled

---

## Quick Deployment Checklist

### Pre-Deployment
- [ ] All tests passing locally
- [ ] Build succeeds locally (`npm run build`)
- [ ] Environment variables documented
- [ ] Database migrations completed
- [ ] .gitignore configured correctly

### Backend Deployment
- [ ] Backend deployed to Vercel
- [ ] Environment variables set
- [ ] Health endpoint working
- [ ] Database connection verified
- [ ] CORS configured

### Frontend Deployment
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set
- [ ] API integration working
- [ ] Map renders correctly
- [ ] No console errors

### Post-Deployment
- [ ] Update backend CORS_ORIGIN
- [ ] Test all critical user flows
- [ ] Verify real-time sync working
- [ ] Check performance metrics
- [ ] Set up monitoring alerts

---

## Support Resources

- **Vercel Documentation**: https://vercel.com/docs
- **Vercel Community**: https://github.com/vercel/vercel/discussions
- **Supabase Docs**: https://supabase.com/docs
- **Project Issues**: [Your GitHub repo]/issues

## Deployment URLs (Update after deployment)

- **Frontend Production**: `https://___________________`
- **Backend Production**: `https://___________________`
- **Frontend Staging**: `https://___________________`
- **Backend Staging**: `https://___________________`

---

**Last Updated**: 2024-01-01  
**Maintained By**: QA Engineering Team
