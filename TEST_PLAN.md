# AOT Asset Management - QA Test Plan

## Executive Summary
This document outlines the comprehensive testing strategy for the AOT Asset Management platform, covering both frontend and backend services.

## Test Environments
- **Local Development**: localhost:5173 (frontend), localhost:3001 (backend)
- **Staging**: Vercel preview deployments
- **Production**: Vercel production deployment

## Testing Scope

### 1. Backend API Testing
#### 1.1 Health Check Endpoint
- **Endpoint**: `GET /api/health`
- **Expected**: 200 status, JSON with status and timestamp
- **Priority**: Critical

#### 1.2 Workflows API
- **Create Workflow**: `POST /api/workflows`
  - Valid data → 201 Created
  - Missing required fields → 400 Bad Request
  - Invalid status → 400 Bad Request
- **Get All Workflows**: `GET /api/workflows`
  - Empty database → 200 with empty array
  - Multiple workflows → 200 with array
  - Filter by status → Filtered results
- **Get One Workflow**: `GET /api/workflows/:id`
  - Valid ID → 200 with workflow
  - Invalid ID → 404 Not Found
- **Update Workflow**: `PUT /api/workflows/:id`
  - Valid update → 200 with updated workflow
  - Invalid ID → 404 Not Found
  - Version conflict → 409 Conflict
- **Delete Workflow**: `DELETE /api/workflows/:id`
  - Valid ID → 200 Success (soft delete)
  - Invalid ID → 404 Not Found
- **Get Audit Trail**: `GET /api/workflows/:id/audit`
  - Valid ID → 200 with audit history
  - Invalid ID → 404 Not Found

#### 1.3 Leases API (Same CRUD pattern as Workflows)
- Create, Read, Update, Delete, Audit Trail
- Status transitions: draft → active → expiring → expired → renewed

#### 1.4 Tasks API (Same CRUD pattern as Workflows)
- Create, Read, Update, Delete, Audit Trail
- Status transitions: todo → in_progress → blocked → completed

#### 1.5 Maintenance Requests API (Same CRUD pattern as Workflows)
- Create, Read, Update, Delete, Audit Trail
- Status transitions: submitted → assigned → in_progress → completed → cancelled

#### 1.6 WebSocket Real-Time Sync
- Connection establishment
- Message broadcasting
- Reconnection on disconnect
- Error handling

### 2. Frontend Testing
#### 2.1 Component Tests
- **LeafletMap Component**
  - Renders map with valid coordinates
  - Displays markers for properties
  - Shows popups on marker click
  - Handles theme switching (light/dark)
  - Handles empty property list gracefully
  
- **PropertyListing Component**
  - Displays list of properties
  - Switches between list and map view
  - Filters properties by status
  - Search functionality
  
- **Visuals Component**
  - Renders all chart types correctly
  - MapVisual shows Leaflet map
  - Handles data updates

#### 2.2 Integration Tests
- **API Client**
  - Successful API calls
  - Error handling (network errors, 404, 500)
  - Request/response format validation
  
- **Real-Time Sync**
  - WebSocket connection
  - Message handling
  - Conflict resolution
  - Retry mechanism

#### 2.3 E2E Tests
- User workflows from login to task completion
- Create workflow → view → update → delete
- Real-time updates across multiple tabs
- Map interactions and property visualization

### 3. Cross-Browser Testing
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### 4. Performance Testing
- Page load time < 2s
- API response time < 500ms
- Map rendering < 1s for 100 properties
- WebSocket message latency < 100ms

### 5. Security Testing
- CORS configuration
- API input validation
- SQL injection prevention (Supabase handles this)
- XSS prevention

### 6. Accessibility Testing
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader compatibility
- Color contrast ratios

## Test Data
### Sample Workflows
```json
{
  "name": "Property Inspection Workflow",
  "description": "Quarterly property inspection process",
  "status": "active",
  "assignedTo": "inspector@aot.com"
}
```

### Sample Properties (with coordinates)
- Bangkok Central: [13.7563, 100.5018]
- Phuket Beach: [7.8804, 98.3923]
- Chiang Mai: [18.7883, 98.9853]

## Bug Severity Levels
- **Critical**: System crash, data loss, security breach
- **High**: Major feature broken, blocking workflow
- **Medium**: Feature partially working, workaround available
- **Low**: Minor UI issues, cosmetic problems

## Test Execution Schedule
1. **Unit Tests**: Run on every commit (CI/CD)
2. **Integration Tests**: Run on every PR
3. **E2E Tests**: Run before deployment to staging
4. **Manual Testing**: Weekly regression testing
5. **Performance Testing**: Monthly benchmarks

## Exit Criteria
- 100% of critical test cases pass
- 95% of high priority test cases pass
- 90% of medium priority test cases pass
- No known critical or high severity bugs
- Performance benchmarks met
- Security scan completed with no high-risk vulnerabilities

## Test Deliverables
1. Test case documentation
2. Test execution reports
3. Bug reports
4. Performance test results
5. Deployment checklist
