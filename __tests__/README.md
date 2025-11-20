# AOT Asset Management - Test Suite

## Overview

This directory contains test cases and testing documentation for the AOT Asset Management platform.

## Test Structure

```
__tests__/
├── README.md                     # This file
├── frontend-manual-tests.md      # 24 manual test cases for frontend
└── e2e-test-script.ts           # E2E test scenarios
```

## Test Categories

### 1. Backend API Tests
**Location**: `/backend/src/__tests__/`
- `api.test.ts` - Jest-compatible test suite
- `manual-test.ts` - Standalone test runner

**Coverage**:
- Health check endpoint
- Workflows CRUD + Audit Trail
- Leases CRUD + Audit Trail
- Tasks CRUD + Audit Trail
- Maintenance Requests CRUD + Audit Trail
- Error handling (404, 500)

**Run tests**:
```bash
npm run backend:test
```

### 2. Frontend Manual Tests
**Location**: `__tests__/frontend-manual-tests.md`

**Test Cases**: 24 total
- Application loading & navigation
- Property listing (list + map views)
- Leaflet map interactions
- CRUD operations (Workflows, Leases, Tasks, Maintenance)
- Real-time synchronization
- Conflict resolution
- AI chat visualizations
- Error handling
- Form validation
- Responsive design
- Performance
- Browser compatibility
- Accessibility

**How to execute**:
1. Start services: `npm run dev:full`
2. Open test document: `__tests__/frontend-manual-tests.md`
3. Execute each test case manually
4. Mark pass/fail checkboxes
5. Document any issues

### 3. E2E Test Scenarios
**Location**: `__tests__/e2e-test-script.ts`

**Scenarios**: 9 complete user journeys
1. Create and manage workflow
2. Property visualization
3. Lease management
4. Task assignment and completion
5. Maintenance request flow
6. Real-time collaboration
7. AI-assisted property search
8. Error handling (network failure)
9. Performance with large datasets

**Run scenarios**:
```bash
npm run test:e2e
```

## Testing Tools

### Test Documentation
- `TEST_PLAN.md` - Comprehensive testing strategy
- `TEST_EXECUTION_REPORT.md` - Test execution report template
- `QA_CHECKLIST.md` - Complete QA checklist (200+ items)
- `TESTING_QUICKSTART.md` - Quick start guide

### Deployment Testing
- `DEPLOYMENT_GUIDE.md` - Vercel deployment with testing steps
- `vercel.json` - Frontend Vercel configuration
- `backend/vercel.json` - Backend Vercel configuration

## Quick Start

### 1. Setup
```bash
# Install dependencies
npm run install:all

# Setup database
npm run backend:migrate
```

### 2. Run Backend Tests
```bash
# Start backend
npm run backend:dev

# In another terminal
npm run backend:test
```

### 3. Run Frontend Tests
```bash
# Start services
npm run dev:full

# Open browser to http://localhost:5173
# Follow test cases in frontend-manual-tests.md
```

### 4. Run E2E Tests
```bash
# Services running
npm run test:e2e
```

## Test Commands

```bash
npm run backend:test     # Backend API test suite
npm run test:e2e        # E2E scenario verification
npm run dev:full        # Start both services for testing
```

## Test Data

### Sample Data
Use `npm run backend:seed` to populate database with:
- 3 sample workflows
- 3 sample leases
- 5 sample tasks
- 2 sample maintenance requests

### Mock Data
Frontend includes mock data in `services/mockData.ts`:
- 6 properties with Thai coordinates
- Status variations (Active, Pending, Maintenance)
- Realistic property details

## Testing Checklist

### Pre-Testing
- [ ] Dependencies installed
- [ ] Environment configured
- [ ] Database migrated
- [ ] Services running

### Backend Testing
- [ ] All API endpoints tested
- [ ] Error handling verified
- [ ] Audit trails working
- [ ] WebSocket connections tested

### Frontend Testing
- [ ] All pages load correctly
- [ ] Navigation works
- [ ] Forms validate properly
- [ ] Map renders correctly
- [ ] Real-time sync working
- [ ] No console errors

### Cross-Browser Testing
- [ ] Chrome - Latest
- [ ] Firefox - Latest
- [ ] Safari - Latest
- [ ] Edge - Latest

### Performance Testing
- [ ] Page load < 2s
- [ ] API response < 500ms
- [ ] Map render < 1s
- [ ] No memory leaks

## Test Results

### Backend API Tests
```
Expected Results:
✅ 12/12 tests passing
✅ 100% success rate
✅ All endpoints responding
✅ Audit trails recording
```

### Frontend Manual Tests
```
Expected Results:
✅ 24/24 test cases passing
✅ All features working
✅ No critical bugs
✅ Cross-browser compatible
```

## Continuous Testing

### On Every Commit
- Run backend tests: `npm run backend:test`
- Check for TypeScript errors
- Verify build succeeds

### Before Every PR
- Run full test suite
- Execute manual frontend tests
- Check browser compatibility
- Verify performance

### Before Deployment
- Complete QA checklist
- Run E2E scenarios
- Performance testing
- Security audit
- Documentation review

## Known Limitations

### WebSocket Testing
WebSocket real-time sync requires manual testing with multiple browser tabs. Automated testing requires Playwright or Cypress.

### Map Testing
Leaflet map interactions require manual verification. Automated visual regression testing recommended for production.

### Integration Tests
Full integration tests require proper mocking of Supabase. Consider adding Supabase test project for CI/CD.

## Contributing Tests

### Adding Backend Tests
1. Add test function to `backend/src/__tests__/manual-test.ts`
2. Follow existing pattern with `runTest()` and `assert()`
3. Update test count in summary

### Adding Frontend Tests
1. Add test case to `frontend-manual-tests.md`
2. Follow format: Priority, Steps, Expected, Status
3. Update test summary at bottom

### Adding E2E Scenarios
1. Add scenario to `e2e-test-script.ts`
2. Include all user steps
3. Add API verification if applicable

## Test Metrics

Track these metrics:
- **Test Coverage**: % of features with tests
- **Pass Rate**: % of tests passing
- **Defect Density**: Bugs per test case
- **Test Execution Time**: Time to run all tests
- **Automation Rate**: % of automated vs manual tests

## Reporting Issues

When a test fails:
1. Document in `TEST_EXECUTION_REPORT.md` Appendix B
2. Include:
   - Test case ID
   - Steps to reproduce
   - Expected vs actual result
   - Screenshots/logs
   - Environment details
3. Create GitHub issue
4. Tag with severity level

## Next Steps

### Recommended Improvements
- [ ] Add Playwright for E2E automation
- [ ] Add Jest for frontend unit tests
- [ ] Add Cypress for visual regression
- [ ] Implement CI/CD pipeline
- [ ] Add performance benchmarking
- [ ] Set up Sentry for error tracking

### Test Automation Priority
1. **High**: Backend API tests (already done)
2. **High**: CRUD operation tests
3. **Medium**: E2E critical paths
4. **Medium**: Visual regression tests
5. **Low**: Accessibility automated tests

## Resources

- **Test Plan**: `../TEST_PLAN.md`
- **QA Checklist**: `../QA_CHECKLIST.md`
- **Deployment Guide**: `../DEPLOYMENT_GUIDE.md`
- **Quick Start**: `../TESTING_QUICKSTART.md`

## Support

For testing questions or issues:
1. Check this README
2. Review test documentation
3. Check existing test cases
4. Create GitHub issue if needed

---

**Last Updated**: November 20, 2024  
**Test Suite Version**: 1.0.0
