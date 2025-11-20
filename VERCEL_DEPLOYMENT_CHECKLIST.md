# Vercel Deployment Checklist

Complete this checklist to deploy the AOT Asset Management application to Vercel with embedded environment variables.

## Pre-Deployment ✅

### Prerequisites
- [ ] Node.js 18+ installed locally
- [ ] Vercel account created (https://vercel.com)
- [ ] Git repository connected to Vercel
- [ ] Vercel CLI installed: `npm install -g vercel`
- [ ] Logged into Vercel CLI: `vercel login`

### Required Secrets Prepared
- [ ] `SUPABASE_SERVICE_ROLE_KEY` copied and ready
- [ ] `GEMINI_API_KEY` (Google AI) copied and ready
- [ ] `GOOGLE_API_KEY` (optional) copied and ready

### Code Review
- [ ] All changes committed to `deploy-vercel-embed-env-backend-frontend` branch
- [ ] No `.env` files committed (should be in `.gitignore`)
- [ ] `vercel.json` files configured correctly
- [ ] `vite.config.ts` uses environment variables properly
- [ ] Backend server.ts uses environment variables for configuration

## Configuration Files ✅

### Root Directory
- [ ] `/vercel.json` exists and configured for frontend
- [ ] `/.env.example` exists with documentation
- [ ] `/vite.config.ts` updated with Vercel URLs
- [ ] `/package.json` has `install:all` script with `--legacy-peer-deps`

### Backend Directory
- [ ] `/backend/vercel.json` exists and configured
- [ ] `/backend/.env.example` updated with deployment notes
- [ ] `/backend/package.json` has build scripts
- [ ] `/backend/src/server.ts` reads environment variables

### Scripts
- [ ] `/scripts/vercel-deploy.sh` created and executable
- [ ] VERCEL_DEPLOYMENT_GUIDE.md exists
- [ ] VERCEL_SETUP.md exists
- [ ] VERCEL_DEPLOYMENT_CHECKLIST.md (this file) exists

## Frontend Deployment ✅

### Initial Setup
- [ ] Navigate to project root: `cd /home/engine/project`
- [ ] Build locally to verify: `npm run build`
- [ ] Verify `dist/` directory created
- [ ] Preview built site: `npm run preview`

### Deploy Frontend
- [ ] Run: `vercel deploy --prod`
- [ ] Note the deployment URL (e.g., `https://aot-frontend-xyz.vercel.app`)
- [ ] Verify deployment: `curl https://aot-frontend-xyz.vercel.app/`

### Update Frontend Environment
- [ ] If URL is NOT `https://aot-frontend.vercel.app`, update in `vercel.json`:
  ```json
  {
    "env": {
      "VITE_API_URL": { "value": "https://aot-backend-xyz.vercel.app/api" },
      "VITE_WS_URL": { "value": "wss://aot-backend-xyz.vercel.app" }
    }
  }
  ```
- [ ] Redeploy frontend if URLs changed: `vercel deploy --prod`

## Backend Deployment ✅

### Initial Setup
- [ ] Navigate to backend: `cd /home/engine/project/backend`
- [ ] Build locally to verify: `npm run build`
- [ ] Verify `dist/` directory created

### Deploy Backend
- [ ] Run: `vercel deploy --prod`
- [ ] Note the deployment URL (e.g., `https://aot-backend-xyz.vercel.app`)
- [ ] Verify deployment: `curl https://aot-backend-xyz.vercel.app/api/health`

### Add Backend Environment Secrets
- [ ] Add SUPABASE_SERVICE_ROLE_KEY:
  ```bash
  cd /home/engine/project/backend
  vercel env add SUPABASE_SERVICE_ROLE_KEY
  # Paste the key when prompted
  ```
- [ ] Add GEMINI_API_KEY:
  ```bash
  vercel env add GEMINI_API_KEY
  # Paste the key when prompted
  ```
- [ ] Add GOOGLE_API_KEY (optional):
  ```bash
  vercel env add GOOGLE_API_KEY
  # Paste the key when prompted
  ```

### Update Backend Environment
- [ ] If frontend URL is NOT `https://aot-frontend.vercel.app`, update CORS:
  ```bash
  vercel env add CORS_ORIGIN
  # Paste: https://aot-frontend-xyz.vercel.app
  ```
- [ ] Redeploy backend if CORS changed: `vercel deploy --prod`

### Add Frontend Environment Secrets (Optional)
- [ ] Add GEMINI_API_KEY to frontend:
  ```bash
  cd /home/engine/project
  vercel env add GEMINI_API_KEY
  # Paste the key when prompted
  ```

## Verification ✅

### Health Checks
- [ ] Frontend loads: `curl https://aot-frontend-xyz.vercel.app/ | head -20`
- [ ] Backend health endpoint: `curl https://aot-backend-xyz.vercel.app/api/health`
- [ ] Expected health response:
  ```json
  {"status":"ok","timestamp":"2024-01-15T10:30:00.000Z"}
  ```

### Environment Variables
- [ ] List frontend env vars: `vercel env ls`
- [ ] List backend env vars: `cd backend && vercel env ls`
- [ ] Verify sensitive secrets are set (not showing values)
- [ ] Verify public values match config

### API Connectivity
- [ ] Frontend can reach backend: Browser DevTools → Network → API requests
- [ ] WebSocket connects: Browser DevTools → Console should show connection message
- [ ] No CORS errors in browser console

### Functionality Tests
- [ ] Open frontend URL in browser
- [ ] Navigate through pages
- [ ] Check browser console for errors
- [ ] Verify API calls succeed (Network tab)
- [ ] Check real-time sync works (open in two browser tabs)

## Post-Deployment ✅

### Documentation
- [ ] Push all configuration files to git:
  ```bash
  git add vercel.json backend/vercel.json .env.example
  git add VERCEL_DEPLOYMENT_GUIDE.md VERCEL_SETUP.md VERCEL_DEPLOYMENT_CHECKLIST.md
  git add scripts/vercel-deploy.sh
  git commit -m "chore: add Vercel deployment configuration"
  git push origin deploy-vercel-embed-env-backend-frontend
  ```

### Monitoring Setup
- [ ] Visit https://vercel.com/dashboard
- [ ] Enable deployment notifications if desired
- [ ] Set up error tracking (optional)
- [ ] Configure domain (if using custom domain)

### Team Communication
- [ ] Document final URLs: Frontend: `___`, Backend: `___`
- [ ] Share deployment guide with team
- [ ] Document any custom URLs or changes
- [ ] Update team wiki/documentation

## Rollback Plan ✅

### If Issues Occur
- [ ] Check logs: `vercel logs` (frontend), `cd backend && vercel logs` (backend)
- [ ] Rollback frontend: `vercel rollback`
- [ ] Rollback backend: `cd backend && vercel rollback`
- [ ] Check environment variables: `vercel env ls`
- [ ] Review git history: `git log --oneline`

### Common Issues Resolution
- [ ] **Build fails**: Check Node version, npm dependencies
- [ ] **API unreachable**: Verify CORS_ORIGIN in backend env
- [ ] **WebSocket fails**: Check WS URL points to backend, verify CORS
- [ ] **Database fails**: Verify SUPABASE_SERVICE_ROLE_KEY is set
- [ ] **CORS errors**: Update CORS_ORIGIN to match frontend URL exactly

## Maintenance ✅

### Regular Tasks
- [ ] Monitor Vercel dashboard weekly
- [ ] Review logs monthly
- [ ] Update dependencies quarterly
- [ ] Test critical features monthly

### Updating Configuration
- [ ] To change environment variable:
  ```bash
  vercel env update VARIABLE_NAME
  # or
  vercel env remove VARIABLE_NAME
  vercel env add VARIABLE_NAME
  ```
- [ ] Changes take effect on next deployment
- [ ] Redeploy after changing env vars:
  ```bash
  vercel deploy --prod
  ```

### Scaling/Performance
- [ ] Monitor backend cold start times
- [ ] Check frontend CDN cache hit rates
- [ ] Review Supabase connection pool usage
- [ ] Consider upgrading serverless function memory if needed

## Optional Enhancements ✅

- [ ] Set up custom domain for frontend
- [ ] Set up custom domain for backend (if using separate projects)
- [ ] Configure automatic deploys from GitHub
- [ ] Set up staging environment
- [ ] Add error tracking (Sentry)
- [ ] Add analytics (Vercel Analytics)
- [ ] Set up automated backups for Supabase
- [ ] Configure email notifications

## Success Criteria ✅

Your deployment is successful when:

✅ Frontend loads at `https://aot-frontend-xyz.vercel.app/`
✅ Backend health endpoint returns 200: `https://aot-backend-xyz.vercel.app/api/health`
✅ No CORS errors in browser console
✅ WebSocket successfully connects
✅ API requests complete successfully
✅ Environment variables are properly embedded in `vercel.json`
✅ Sensitive secrets are NOT in version control
✅ Deployment logs show no errors
✅ Real-time sync works between browser tabs
✅ All pages and features work as expected

## Quick Reference Commands

```bash
# Deploy frontend
vercel deploy --prod

# Deploy backend
cd backend && vercel deploy --prod

# List environment variables
vercel env ls

# Add environment variable
vercel env add VARIABLE_NAME

# View deployment logs
vercel logs

# Switch between projects
vercel switch

# Rollback deployment
vercel rollback

# Pull env vars locally
vercel env pull .env.local

# Help
vercel help
```

## Support Contacts

- **Vercel Support**: https://vercel.com/support
- **Supabase Support**: https://supabase.com/support
- **Documentation**: See VERCEL_DEPLOYMENT_GUIDE.md and VERCEL_SETUP.md

## Completion

**Date Completed**: _______________
**Frontend URL**: _______________
**Backend URL**: _______________
**Deployed By**: _______________
**Notes**: _______________________________________________________________
