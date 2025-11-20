# Pre-Deployment Checklist

## 📋 Complete this checklist before deploying to Vercel

**Date**: _______________  
**Deployed By**: _______________  
**Target Environment**: [ ] Staging [ ] Production

---

## 1. Code Quality

### Repository
- [ ] All changes committed to Git
- [ ] Branch is up to date with main
- [ ] No merge conflicts
- [ ] Git history is clean
- [ ] .gitignore configured correctly

### Code Review
- [ ] Code reviewed by another developer
- [ ] No TODO comments unresolved
- [ ] No console.log in production code
- [ ] No commented-out code blocks
- [ ] TypeScript types complete (no `any`)

### Dependencies
- [ ] All dependencies installed
- [ ] No unnecessary dependencies
- [ ] Security audit passed: `npm audit`
- [ ] Dependencies up to date (or known vulnerabilities documented)

---

## 2. Configuration

### Environment Variables

#### Frontend
- [ ] `.env.production` created
- [ ] `VITE_API_URL` set to production backend URL
- [ ] `VITE_WS_URL` set to production WebSocket URL
- [ ] No sensitive data in environment variables
- [ ] All required variables documented

#### Backend
- [ ] `.env` reviewed and secure
- [ ] `SUPABASE_URL` correct
- [ ] `SUPABASE_SERVICE_ROLE_KEY` correct
- [ ] `SUPABASE_KEY` correct
- [ ] `CORS_ORIGIN` set to production frontend URL
- [ ] `NODE_ENV` set to production
- [ ] No secrets committed to Git

### Configuration Files
- [ ] `vercel.json` (frontend) configured
- [ ] `backend/vercel.json` configured
- [ ] `vite.config.ts` correct
- [ ] `tsconfig.json` production-ready
- [ ] Build scripts tested locally

---

## 3. Database

### Supabase Setup
- [ ] Production database created (or using same instance)
- [ ] Database migrations completed
- [ ] Seed data loaded (if needed)
- [ ] Backups configured
- [ ] Connection pooling configured

### Data Integrity
- [ ] Tables created successfully
- [ ] Indexes applied
- [ ] Foreign key constraints working
- [ ] Audit trail tables created
- [ ] Soft delete implemented

### Database Security
- [ ] Row Level Security (RLS) reviewed
- [ ] Service role key secured
- [ ] Database connection encrypted (Supabase default)
- [ ] Backup strategy in place

---

## 4. Testing

### Backend Tests
- [ ] Backend tests passing: `npm run backend:test`
- [ ] All API endpoints tested
- [ ] Health check working
- [ ] Error handling tested
- [ ] Audit trails verified

### Frontend Tests
- [ ] Frontend manual tests completed
- [ ] All pages load without errors
- [ ] Forms validate correctly
- [ ] Navigation working
- [ ] No console errors

### Integration Tests
- [ ] Frontend-backend integration tested
- [ ] API calls successful
- [ ] CORS working locally
- [ ] Real-time sync tested (if applicable)
- [ ] Map rendering correctly

### E2E Tests
- [ ] Critical user flows tested
- [ ] E2E scenarios verified: `npm run test:e2e`
- [ ] No blocking issues found

### Performance Tests
- [ ] Page load time < 2 seconds
- [ ] API response time < 500ms
- [ ] Map rendering < 1 second
- [ ] Bundle size acceptable

### Browser Compatibility
- [ ] Tested on Chrome (latest)
- [ ] Tested on Firefox (latest)
- [ ] Tested on Safari (latest)
- [ ] Tested on Edge (latest)
- [ ] Mobile responsive verified

---

## 5. Build Verification

### Frontend Build
- [ ] `npm run build` succeeds
- [ ] No build errors
- [ ] No build warnings (critical ones)
- [ ] `dist/` folder created
- [ ] Assets in `dist/assets/`
- [ ] `index.html` includes all scripts
- [ ] Leaflet CSS included
- [ ] Bundle size optimized

### Backend Build
- [ ] `npm run backend:build` succeeds
- [ ] TypeScript compiles without errors
- [ ] `dist/` folder created
- [ ] Server entry point exists
- [ ] All imports resolve correctly

### Local Production Build Test
```bash
# Test frontend production build
npm run build
npm run preview
# Verify at http://localhost:4173

# Test backend build
npm run backend:build
npm run backend:start
# Verify at http://localhost:3001
```

- [ ] Production builds work locally
- [ ] No errors in production mode
- [ ] API connections work

---

## 6. Security

### Code Security
- [ ] No API keys in code
- [ ] No passwords in code
- [ ] No sensitive data in Git
- [ ] Environment variables used correctly
- [ ] Input validation on all endpoints

### API Security
- [ ] CORS configured correctly
- [ ] Rate limiting considered
- [ ] SQL injection prevention (Supabase handles)
- [ ] XSS prevention
- [ ] HTTPS enforced (Vercel default)

### Authentication (if implemented)
- [ ] Auth flow tested
- [ ] Session management secure
- [ ] Password hashing (if applicable)
- [ ] Token expiration configured
- [ ] Logout functionality works

### Dependencies Security
```bash
npm audit
```
- [ ] No critical vulnerabilities
- [ ] No high vulnerabilities (or documented)
- [ ] Moderate vulnerabilities acceptable
- [ ] Security updates applied

---

## 7. Documentation

### Required Documentation
- [ ] README.md complete and accurate
- [ ] SETUP.md with installation instructions
- [ ] DEPLOYMENT_GUIDE.md reviewed
- [ ] API documentation up to date
- [ ] Environment variables documented
- [ ] Known issues documented

### Testing Documentation
- [ ] TEST_PLAN.md reviewed
- [ ] QA_CHECKLIST.md completed
- [ ] TEST_EXECUTION_REPORT.md filled out
- [ ] Test results documented

### Code Comments
- [ ] Complex logic commented
- [ ] API endpoints documented
- [ ] Function parameters documented
- [ ] Return types documented

---

## 8. Vercel Configuration

### Vercel Account
- [ ] Vercel account created
- [ ] Vercel CLI installed: `npm i -g vercel`
- [ ] Logged in: `vercel login`
- [ ] Team/organization selected (if applicable)

### Frontend Deployment Config
- [ ] Project name decided
- [ ] Framework preset: Vite
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Install command: `npm install --legacy-peer-deps`
- [ ] Environment variables ready to add

### Backend Deployment Config
- [ ] Project name decided
- [ ] Framework preset: Other (Node.js)
- [ ] Entry point: `src/server.ts`
- [ ] Build command: `npm run build`
- [ ] Start command: `node dist/server.js`
- [ ] Environment variables ready to add

### Domain Setup (if applicable)
- [ ] Domain purchased/ready
- [ ] DNS access available
- [ ] SSL certificate plan (Vercel auto-provisions)

---

## 9. Monitoring & Alerts

### Monitoring Setup
- [ ] Vercel Analytics enabled
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Uptime monitoring setup (UptimeRobot, etc.)
- [ ] Performance monitoring enabled

### Alerting
- [ ] Error alerts configured
- [ ] Downtime alerts configured
- [ ] Performance degradation alerts
- [ ] Alert recipients configured

### Logging
- [ ] Backend logging configured
- [ ] Frontend error logging configured
- [ ] Log aggregation setup (if needed)
- [ ] Log retention policy defined

---

## 10. Rollback Plan

### Backup Strategy
- [ ] Current production version documented
- [ ] Database backup taken
- [ ] Rollback procedure documented
- [ ] Team aware of rollback process

### Rollback Procedure
```bash
# Via Vercel Dashboard
1. Go to Deployments
2. Find previous working deployment
3. Click ... menu → Promote to Production

# Via CLI
vercel rollback
```

- [ ] Rollback procedure tested (if possible)
- [ ] Rollback time estimate known
- [ ] Team trained on rollback

---

## 11. Post-Deployment Plan

### Immediate Verification (First 5 minutes)
- [ ] Health check responds
- [ ] Frontend loads
- [ ] No CORS errors
- [ ] Map renders
- [ ] Can create entity
- [ ] Data persists

### Short-term Monitoring (First hour)
- [ ] Check error logs every 15 minutes
- [ ] Monitor performance metrics
- [ ] Verify real-time sync (if applicable)
- [ ] Test critical user flows
- [ ] Monitor uptime

### Communication Plan
- [ ] Team notified of deployment
- [ ] Stakeholders informed
- [ ] Users notified (if needed)
- [ ] Support team briefed

---

## 12. Known Issues & Limitations

### WebSocket Limitations
- [ ] Team aware WebSocket may not work on Vercel
- [ ] Fallback plan in place (polling, Supabase Realtime, etc.)
- [ ] Alternative hosting considered (Railway, Render, Heroku)
- [ ] Users notified of real-time limitations (if applicable)

### Serverless Function Timeouts
- [ ] Team aware of 10-60 second timeout limits
- [ ] Long-running operations optimized or moved
- [ ] Upgrade to Vercel Pro considered (if needed)

### Cold Starts
- [ ] Team aware of cold start delays
- [ ] Warm-up strategy in place (if needed)
- [ ] User experience acceptable with cold starts

### Other Limitations
- [ ] _________________________
- [ ] _________________________
- [ ] _________________________

---

## 13. Final Checks

### Pre-Deployment Commands
```bash
# Run all checks
npm run install:all          # Install dependencies
npm run backend:migrate      # Ensure DB is up to date
npm run backend:test        # Backend tests
npm run build               # Frontend build
npm run backend:build       # Backend build

# Optional: Seed production data
# npm run backend:seed
```

### Deployment Commands
```bash
# Backend deployment
cd backend
vercel --prod

# Frontend deployment  
cd ..
vercel --prod

# Update CORS on backend (use frontend URL)
# Redeploy backend if needed
```

### Post-Deployment Smoke Tests
```bash
# Health check
curl https://your-backend.vercel.app/api/health

# Frontend load
open https://your-frontend.vercel.app

# Create test entity (verify API)
curl -X POST https://your-backend.vercel.app/api/workflows \
  -H "Content-Type: application/json" \
  -d '{"name":"Deployment Test","status":"draft"}'
```

---

## 14. Sign-Off

### Technical Lead Approval
- [ ] Code quality approved
- [ ] Tests passed
- [ ] Security reviewed
- [ ] Documentation complete

**Name**: _________________________  
**Signature**: ____________________  
**Date**: _________________________

### QA Approval
- [ ] All tests passed
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Ready for deployment

**Name**: _________________________  
**Signature**: ____________________  
**Date**: _________________________

### Deployment Approval
- [ ] All checks complete
- [ ] Team notified
- [ ] Rollback plan ready
- [ ] Monitoring configured

**Name**: _________________________  
**Signature**: ____________________  
**Date**: _________________________

---

## 15. Deployment Execution

### Deployment Time
**Started**: _______________  
**Completed**: _______________  
**Duration**: _______________

### Deployment URLs
**Frontend Production**: https://___________________________  
**Backend Production**: https://___________________________  
**Health Check**: https://___________________________/api/health

### Deployment Status
- [ ] ✅ Backend deployed successfully
- [ ] ✅ Frontend deployed successfully
- [ ] ✅ CORS configured correctly
- [ ] ✅ Health check passing
- [ ] ✅ Frontend loads correctly
- [ ] ✅ API integration working
- [ ] ✅ Map rendering correctly
- [ ] ✅ No errors in logs

### Post-Deployment Verification
- [ ] All smoke tests passed
- [ ] Critical user flows tested
- [ ] Performance acceptable
- [ ] Monitoring active
- [ ] Team notified of success

---

## 16. Issues Found During Deployment

| Issue | Severity | Status | Resolution |
|-------|----------|--------|------------|
| | | | |
| | | | |
| | | | |

---

## Notes

_______________________________________________________
_______________________________________________________
_______________________________________________________
_______________________________________________________

---

**Deployment Result**: [ ] ✅ Success [ ] ⚠️ Partial [ ] ❌ Failed

**Next Actions**:
_______________________________________________________
_______________________________________________________
_______________________________________________________

---

**Checklist Version**: 1.0  
**Last Updated**: November 20, 2024
