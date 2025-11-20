# Testing Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Node.js v18+ installed
- Supabase account credentials

---

## Step 1: Install Dependencies (2 min)

```bash
# Install all dependencies
npm run install:all
```

---

## Step 2: Configure Environment (1 min)

```bash
# Copy backend environment file
cp backend/.env.example backend/.env

# backend/.env is already configured with Supabase credentials
# No changes needed unless you have custom credentials
```

---

## Step 3: Setup Database (1 min)

```bash
# Run database migrations
npm run backend:migrate

# Optional: Seed with test data
npm run backend:seed
```

---

## Step 4: Start Services (30 sec)

### Option A: Both Services Together
```bash
npm run dev:full
```

### Option B: Separate Terminals
```bash
# Terminal 1: Backend
npm run backend:dev

# Terminal 2: Frontend
npm run dev
```

Services will start at:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

---

## Step 5: Run Tests (1 min)

### Backend API Tests
```bash
# Make sure backend is running
npm run backend:test
```

**Expected Output**:
```
╔════════════════════════════════════════════════╗
║  AOT Backend API - Manual Test Suite          ║
╚════════════════════════════════════════════════╝

✅ PASS: Health check endpoint
✅ PASS: Create workflow
✅ PASS: Get all workflows
... (12 tests total)

📊 TEST SUMMARY
Total Tests: 12
✅ Passed: 12
Success Rate: 100.00%
```

### Frontend Manual Testing
1. Open http://localhost:5173
2. Open `__tests__/frontend-manual-tests.md`
3. Execute test cases

### E2E Scenarios
```bash
npm run test:e2e
```

---

## Quick Verification Checklist

After starting services, verify:

✅ **Backend Running**
```bash
curl http://localhost:3001/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

✅ **Frontend Running**
- Open http://localhost:5173
- Page loads without errors
- Navigation menu visible

✅ **Database Connected**
```bash
# Test workflow creation
curl -X POST http://localhost:3001/api/workflows \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","status":"draft"}'
# Should return success with workflow ID
```

---

## Testing Workflow

### 1. Backend Testing
```bash
# Start backend
npm run backend:dev

# In another terminal, run tests
npm run backend:test
```

### 2. Frontend Testing
```bash
# Services running, open browser
# Navigate to http://localhost:5173

# Test these key features:
- View Properties (list and map)
- Create a Workflow
- Create a Task
- View Leaflet map with markers
- Test real-time sync (open 2 tabs)
```

### 3. Full Integration Testing
```bash
# Both services running
npm run test:e2e
```

---

## Common Issues & Fixes

### Issue: Port 3001 already in use
```bash
# Kill the process
pkill -f "tsx watch src/server.ts"
# Or manually find and kill
lsof -ti:3001 | xargs kill -9
```

### Issue: Dependencies not installed
```bash
npm run install:all
```

### Issue: Database connection error
```bash
# Check backend/.env has correct Supabase credentials
cat backend/.env

# Re-run migrations
npm run backend:migrate
```

### Issue: Frontend can't connect to backend
```bash
# Check backend is running
curl http://localhost:3001/api/health

# Check CORS settings in backend/.env
# CORS_ORIGIN=http://localhost:5173
```

---

## Testing Tools & Documentation

### Test Files Location
```
project/
├── backend/src/__tests__/
│   ├── api.test.ts           # Jest-compatible tests
│   └── manual-test.ts        # Standalone test runner
├── __tests__/
│   ├── frontend-manual-tests.md  # 24 manual test cases
│   └── e2e-test-script.ts        # E2E scenarios
├── TEST_PLAN.md              # Complete testing strategy
├── QA_CHECKLIST.md           # Comprehensive QA checklist
└── TEST_EXECUTION_REPORT.md  # Test execution report
```

### Available Test Commands
```bash
npm run backend:test     # Backend API tests
npm run test:e2e        # E2E scenario verification
npm run backend:dev     # Start backend for testing
npm run dev             # Start frontend for testing
npm run dev:full        # Start both services
```

---

## Next Steps

### Ready to Deploy?
See `DEPLOYMENT_GUIDE.md` for complete Vercel deployment instructions.

### Need More Testing?
- Review `QA_CHECKLIST.md` - Complete checklist
- Review `TEST_PLAN.md` - Full testing strategy
- Review `TEST_EXECUTION_REPORT.md` - Detailed report

### Found Bugs?
- Document in `TEST_EXECUTION_REPORT.md` Appendix B
- Create GitHub issues
- Update test cases

---

## Quick Test Script

Copy and run this complete test sequence:

```bash
#!/bin/bash

echo "🧪 AOT Asset Management - Quick Test"
echo "===================================="

echo "📦 Step 1: Installing dependencies..."
npm run install:all

echo "🗄️ Step 2: Setting up database..."
npm run backend:migrate

echo "🚀 Step 3: Starting backend..."
npm run backend:dev > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
sleep 5

echo "✅ Step 4: Running backend tests..."
npm run backend:test

echo "🌐 Step 5: Testing health endpoint..."
curl http://localhost:3001/api/health

echo "🧹 Cleanup..."
kill $BACKEND_PID

echo "✨ Testing complete!"
```

---

## Support

- **Documentation**: See `README.md` and `SETUP.md`
- **API Docs**: See `backend/README.md`
- **Issues**: Create GitHub issue
- **Questions**: Check existing documentation first

---

**Happy Testing! 🎉**
