# 🚀 AOT Asset Management - Running Services

## Current Status: ✅ ALL SYSTEMS OPERATIONAL

### Backend Service
- **Status:** ✅ Running
- **Port:** 8080
- **URL:** http://localhost:8080
- **API Endpoints:** http://localhost:8080/api
- **Process:** Node.js Express Server

### Frontend Service
- **Status:** ✅ Running
- **Port:** 12000
- **URL:** https://work-1-nvjkruptxhrwgfhq.prod-runtime.all-hands.dev
- **Build:** Vite + React + TypeScript
- **Process:** Vite Dev Server

### AI Services
- **Provider:** Gemini (via unified aiService.ts)
- **Fallback:** GitHub Models
- **Status:** ✅ Working with graceful fallbacks
- **Configuration:** VITE_AI_PROVIDER=gemini

---

## Quick Commands

### Check Services
```bash
# Check backend
curl http://localhost:8080/api/properties

# Check frontend
curl http://localhost:12000

# Check running processes
ps aux | grep -E "node.*8080|vite.*12000"
```

### Restart Services
```bash
# Restart backend
cd backend && npm run dev

# Restart frontend
npm run dev -- --host 0.0.0.0 --port 12000
```

### Build for Production
```bash
# Build frontend
npm run build

# Test production build
npm run preview
```

---

## Access URLs

### Development URLs
- **Frontend:** https://work-1-nvjkruptxhrwgfhq.prod-runtime.all-hands.dev
- **Backend API:** http://localhost:8080/api

### Available Pages
- Dashboard: `/#/`
- Portfolio: `/#/properties`
- Financial: `/#/financial`
- Leasing: `/#/leasing`
- Maintenance: `/#/maintenance`
- Reports: `/#/reports`
- Ask AOT AI: `/#/ask-aot`
- Property Detail: `/#/properties/1` (or any property ID)
- Settings: `/#/settings`

---

## Health Check

### Backend Health
```bash
curl http://localhost:8080/api/properties | jq '.[] | .name'
```

### Frontend Health
- Visit: https://work-1-nvjkruptxhrwgfhq.prod-runtime.all-hands.dev
- Should see Dashboard with metrics and charts

### AI Service Health
- Open any page with "Generate Insight" button
- Click to test AI response
- Should see either AI-generated insight or graceful fallback

---

## Environment Configuration

### Current Settings (.env)
```env
VITE_API_URL=http://localhost:8080/api
VITE_WS_URL=ws://localhost:8080
VITE_AI_PROVIDER=gemini
VITE_GITHUB_TOKEN=<configured>
VITE_GEMINI_API_KEY=<configured>
```

### To Switch to GitHub Models
```bash
# Edit .env
VITE_AI_PROVIDER=github

# Restart frontend
npm run dev -- --host 0.0.0.0 --port 12000
```

---

## Monitoring

### Logs
```bash
# Backend logs
cd backend && npm run dev

# Frontend logs
npm run dev

# Watch for errors
tail -f logs/*.log
```

### Performance
- Build size: ~1.8MB (gzipped ~547KB)
- Startup time: ~2-3 seconds
- API response: <100ms

---

## Troubleshooting

### Frontend not loading?
```bash
# Check if running
ps aux | grep vite

# Restart
npm run dev -- --host 0.0.0.0 --port 12000
```

### Backend not responding?
```bash
# Check if running
ps aux | grep "node.*8080"

# Restart
cd backend && npm run dev
```

### AI not working?
```bash
# Check environment variables
grep AI .env

# Test Gemini API
curl "https://generativelanguage.googleapis.com/v1/models?key=YOUR_API_KEY"
```

---

*Last Updated: 2025-11-20*
*Status: All systems operational ✅*
