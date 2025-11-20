# QA Testing Checklist - AOT Asset Management

## Pre-Testing Setup

### Environment Verification
- [ ] Node.js version: v18+ or v20+
- [ ] npm version: 9+
- [ ] All dependencies installed (`npm run install:all`)
- [ ] Backend .env file configured
- [ ] Frontend .env file configured
- [ ] Supabase connection verified
- [ ] Database migrations completed (`npm run backend:migrate`)
- [ ] Database seeded with test data (`npm run backend:seed`)

### Service Status
- [ ] Backend running on port 3001
- [ ] Frontend running on port 5173
- [ ] No startup errors in console
- [ ] Health endpoint responding: http://localhost:3001/api/health

---

## Backend API Testing

### Health Check
- [ ] `GET /api/health` returns 200
- [ ] Response includes `status: "ok"`
- [ ] Response includes `timestamp`

### Workflows API
- [ ] **POST** `/api/workflows` - Create workflow with valid data
- [ ] **POST** `/api/workflows` - Reject invalid data (missing name)
- [ ] **POST** `/api/workflows` - Reject invalid status
- [ ] **GET** `/api/workflows` - Get all workflows (empty database)
- [ ] **GET** `/api/workflows` - Get all workflows (with data)
- [ ] **GET** `/api/workflows?status=active` - Filter by status
- [ ] **GET** `/api/workflows/:id` - Get single workflow (valid ID)
- [ ] **GET** `/api/workflows/:id` - Return 404 (invalid ID)
- [ ] **PUT** `/api/workflows/:id` - Update workflow successfully
- [ ] **PUT** `/api/workflows/:id` - Handle version conflict (409)
- [ ] **DELETE** `/api/workflows/:id` - Soft delete workflow
- [ ] **GET** `/api/workflows/:id/audit` - Get audit trail
- [ ] Verify audit trail records all changes

### Leases API
- [ ] **POST** `/api/leases` - Create lease
- [ ] **POST** `/api/leases` - Validate date range (end > start)
- [ ] **POST** `/api/leases` - Validate required fields
- [ ] **GET** `/api/leases` - Get all leases
- [ ] **GET** `/api/leases?status=active` - Filter by status
- [ ] **GET** `/api/leases/:id` - Get single lease
- [ ] **PUT** `/api/leases/:id` - Update lease
- [ ] **PUT** `/api/leases/:id` - Status transition (draft→active)
- [ ] **DELETE** `/api/leases/:id` - Soft delete lease
- [ ] **GET** `/api/leases/:id/audit` - Get audit trail

### Tasks API
- [ ] **POST** `/api/tasks` - Create task
- [ ] **POST** `/api/tasks` - Validate priority values
- [ ] **POST** `/api/tasks` - Validate due date (future)
- [ ] **GET** `/api/tasks` - Get all tasks
- [ ] **GET** `/api/tasks?status=todo` - Filter by status
- [ ] **GET** `/api/tasks?priority=high` - Filter by priority
- [ ] **GET** `/api/tasks?assignedTo=user@aot.com` - Filter by assignee
- [ ] **GET** `/api/tasks/:id` - Get single task
- [ ] **PUT** `/api/tasks/:id` - Update task
- [ ] **PUT** `/api/tasks/:id` - Status transition (todo→in_progress)
- [ ] **PUT** `/api/tasks/:id` - Status transition (in_progress→completed)
- [ ] **DELETE** `/api/tasks/:id` - Soft delete task
- [ ] **GET** `/api/tasks/:id/audit` - Get audit trail

### Maintenance Requests API
- [ ] **POST** `/api/maintenance` - Create maintenance request
- [ ] **POST** `/api/maintenance` - Validate priority
- [ ] **POST** `/api/maintenance` - Validate required fields
- [ ] **GET** `/api/maintenance` - Get all requests
- [ ] **GET** `/api/maintenance?priority=high` - Filter by priority
- [ ] **GET** `/api/maintenance/:id` - Get single request
- [ ] **PUT** `/api/maintenance/:id` - Update request
- [ ] **PUT** `/api/maintenance/:id` - Assign technician
- [ ] **PUT** `/api/maintenance/:id` - Status workflow
- [ ] **DELETE** `/api/maintenance/:id` - Soft delete request
- [ ] **GET** `/api/maintenance/:id/audit` - Get audit trail

### WebSocket Testing
- [ ] Client can connect to WebSocket
- [ ] Connection acknowledged
- [ ] Messages broadcast to all clients
- [ ] Messages exclude sender
- [ ] Reconnection on disconnect
- [ ] Error handling for invalid messages

---

## Frontend Testing

### Application Loading
- [ ] Home page loads within 2 seconds
- [ ] No console errors
- [ ] Navigation menu displays
- [ ] Default view renders correctly

### Navigation
- [ ] Dashboard link works
- [ ] Properties link works
- [ ] Leases link works
- [ ] Workflows link works
- [ ] Tasks link works
- [ ] Maintenance link works
- [ ] AI Chat link works
- [ ] Active page highlighted in menu
- [ ] URL updates correctly

### Property Listing - List View
- [ ] Properties display in grid/list
- [ ] Property cards show all information
- [ ] Status badges colored correctly
  - [ ] Active = Green
  - [ ] Pending = Amber
  - [ ] Maintenance = Red
- [ ] Currency formatted correctly
- [ ] Percentages displayed correctly
- [ ] Click property opens details

### Property Listing - Map View
- [ ] "Map View" button switches to map
- [ ] Map renders within 1 second
- [ ] All property markers visible
- [ ] Markers colored by status
- [ ] Click marker shows popup
- [ ] Popup contains all property details
- [ ] Hover shows tooltip with property name
- [ ] Can pan map with mouse
- [ ] Can zoom with controls
- [ ] Can zoom with mouse wheel
- [ ] Double-click to zoom works
- [ ] "List View" button switches back

### Leaflet Map - Theme Switching
- [ ] Light theme shows standard tiles
- [ ] Dark theme shows dark tiles
- [ ] Markers visible in both themes
- [ ] Popups readable in both themes
- [ ] Theme persists across page navigation

### Workflows Management
- [ ] Workflows list displays
- [ ] "Create Workflow" button opens form
- [ ] Form validation works (required fields)
- [ ] Can create workflow
- [ ] New workflow appears in list immediately
- [ ] Success message displays
- [ ] Can click workflow to view details
- [ ] Can edit workflow
- [ ] Changes save successfully
- [ ] Can change status
- [ ] Can delete workflow
- [ ] Delete confirmation dialog appears
- [ ] Workflow removed from list after delete
- [ ] Audit trail shows all changes

### Leases Management
- [ ] Leases list displays
- [ ] Can create new lease
- [ ] Property dropdown populated
- [ ] Date picker works correctly
- [ ] Cannot select end date before start date
- [ ] Rent amount formatted as currency
- [ ] Can update lease
- [ ] Status transitions work correctly
- [ ] Can view lease details
- [ ] Can delete lease
- [ ] Audit trail accessible

### Tasks Management
- [ ] Tasks list displays
- [ ] Can create new task
- [ ] Priority badges colored correctly
  - [ ] High = Red
  - [ ] Medium = Yellow
  - [ ] Low = Blue
- [ ] Can assign task to user
- [ ] Due date picker works
- [ ] Cannot set past due date
- [ ] Can update task status
- [ ] Status workflow enforced
- [ ] Can filter tasks by status
- [ ] Can filter tasks by priority
- [ ] Can filter tasks by assignee
- [ ] Can complete task
- [ ] Completion date recorded
- [ ] Can delete task

### Maintenance Requests
- [ ] Maintenance requests list displays
- [ ] Can create new request
- [ ] Property selection works
- [ ] Priority selection works
- [ ] Description textarea allows multiple lines
- [ ] Can submit request
- [ ] Can assign technician
- [ ] Status workflow works
  - [ ] submitted → assigned
  - [ ] assigned → in_progress
  - [ ] in_progress → completed
- [ ] Can cancel request
- [ ] Can view request history
- [ ] Can delete request

### Real-Time Synchronization
- [ ] Open app in two browser tabs
- [ ] Create entity in Tab 1
- [ ] Entity appears in Tab 2 within 1 second
- [ ] Update entity in Tab 1
- [ ] Update reflects in Tab 2
- [ ] Delete entity in Tab 1
- [ ] Entity removed from Tab 2
- [ ] WebSocket status indicator shows "Connected"
- [ ] Disconnect backend, status shows "Disconnected"
- [ ] Reconnect backend, status shows "Connected"

### Real-Time Conflict Resolution
- [ ] Open same entity in two tabs
- [ ] Edit in Tab 1, save
- [ ] Edit in Tab 2, save
- [ ] Conflict detected
- [ ] User notified of conflict
- [ ] Can choose local or server version
- [ ] Chosen version persists

### AI Chat
- [ ] Chat interface displays
- [ ] Can send message
- [ ] AI responds
- [ ] Message history displays
- [ ] Can request visualization
- [ ] Map visualization renders in chat
- [ ] Chart visualizations render
- [ ] Visualizations are interactive

### Form Validation
- [ ] Required fields show error if empty
- [ ] Email fields validate format
- [ ] Date fields validate format
- [ ] Number fields only accept numbers
- [ ] Cannot submit form with errors
- [ ] Error messages are clear
- [ ] Fields highlighted when invalid

### Error Handling
- [ ] Stop backend server
- [ ] Try to create entity
- [ ] User-friendly error message displays
- [ ] No raw error stack traces
- [ ] Retry mechanism activates
- [ ] Operations queued
- [ ] Start backend server
- [ ] Queued operations execute
- [ ] User notified of success

### Performance
- [ ] Initial page load < 2 seconds
- [ ] Map renders < 1 second (for 50 properties)
- [ ] API calls respond < 500ms
- [ ] No lag when scrolling
- [ ] No lag when filtering
- [ ] Smooth animations (60fps)
- [ ] No memory leaks (monitor DevTools)

---

## Cross-Browser Testing

### Chrome
- [ ] All features work
- [ ] No console errors
- [ ] Map renders correctly
- [ ] Performance is good

### Firefox
- [ ] All features work
- [ ] No console errors
- [ ] Map renders correctly
- [ ] Performance is good

### Safari
- [ ] All features work
- [ ] No console errors
- [ ] Map renders correctly
- [ ] Performance is good

### Edge
- [ ] All features work
- [ ] No console errors
- [ ] Map renders correctly
- [ ] Performance is good

---

## Responsive Design Testing

### Desktop (1920x1080)
- [ ] Layout uses full width appropriately
- [ ] No horizontal scroll
- [ ] All elements visible
- [ ] Map fills available space

### Laptop (1366x768)
- [ ] Layout adapts correctly
- [ ] No element overlap
- [ ] All features accessible
- [ ] Map remains usable

### Tablet (768x1024)
- [ ] Navigation collapses or adapts
- [ ] Property cards stack appropriately
- [ ] Map remains interactive
- [ ] Touch gestures work

### Mobile (375x667)
- [ ] Navigation becomes hamburger menu
- [ ] Content stacks vertically
- [ ] Buttons are tappable (44x44px minimum)
- [ ] Text is readable (14px minimum)
- [ ] Map is usable with touch gestures
- [ ] Forms are usable
- [ ] No elements off-screen

---

## Accessibility Testing

### Keyboard Navigation
- [ ] Can tab through all interactive elements
- [ ] Focus order is logical
- [ ] Focus indicators clearly visible
- [ ] Can activate buttons with Enter/Space
- [ ] Can navigate dropdowns with arrow keys
- [ ] No keyboard traps
- [ ] Skip links available

### Screen Reader
- [ ] All images have alt text
- [ ] Form labels associated with inputs
- [ ] Error messages announced
- [ ] Status changes announced
- [ ] Headings in logical order (h1, h2, h3)
- [ ] Landmarks used (nav, main, aside)

### Color and Contrast
- [ ] Color contrast ratio ≥ 4.5:1 (normal text)
- [ ] Color contrast ratio ≥ 3:1 (large text)
- [ ] Information not conveyed by color alone
- [ ] Links distinguishable from text

---

## Security Testing

### Input Validation
- [ ] SQL injection attempts rejected
- [ ] XSS attempts sanitized
- [ ] Long strings handled gracefully
- [ ] Special characters handled correctly
- [ ] File upload validation (if applicable)

### Authentication & Authorization
- [ ] Cannot access protected routes without auth
- [ ] Cannot modify other users' data
- [ ] Session expires after timeout
- [ ] Logout clears session

### Network Security
- [ ] HTTPS enforced in production
- [ ] CORS configured correctly
- [ ] No sensitive data in URLs
- [ ] No secrets in client-side code
- [ ] CSP headers configured

---

## Database Testing

### Data Integrity
- [ ] Created entities have all required fields
- [ ] Timestamps auto-generated correctly
- [ ] UUIDs generated for new records
- [ ] Version numbers increment on update
- [ ] Soft delete sets deleted_at field

### Audit Trail
- [ ] All creates logged
- [ ] All updates logged
- [ ] All deletes logged
- [ ] Audit includes user ID
- [ ] Audit includes timestamp
- [ ] Audit includes changed fields

### Data Consistency
- [ ] Concurrent updates handled correctly
- [ ] Version conflicts detected
- [ ] Rollback on errors
- [ ] Foreign key constraints enforced

---

## Run Automated Tests

### Backend Tests
```bash
cd backend
npm test
```
- [ ] All backend tests pass
- [ ] No failing tests
- [ ] Test coverage > 80%

### E2E Tests
```bash
npm run test:e2e
```
- [ ] All E2E scenarios documented
- [ ] Critical flows tested
- [ ] Happy paths verified
- [ ] Error paths verified

---

## Production Readiness

### Documentation
- [ ] README.md complete
- [ ] SETUP.md instructions verified
- [ ] API documentation complete
- [ ] Deployment guide reviewed
- [ ] Test plan documented

### Code Quality
- [ ] No console.log in production code
- [ ] No commented-out code blocks
- [ ] No TODO comments unresolved
- [ ] TypeScript types complete
- [ ] No `any` types (or justified)

### Configuration
- [ ] .env.example provided
- [ ] .gitignore configured
- [ ] vercel.json configured (both services)
- [ ] package.json scripts correct
- [ ] Dependencies up to date

### Performance
- [ ] Bundle size optimized
- [ ] Images optimized
- [ ] Code splitting implemented
- [ ] Lazy loading used where appropriate
- [ ] Caching headers configured

---

## Sign-Off

**QA Engineer**: _______________  
**Date**: _______________  
**Test Environment**: _______________  
**Build Version**: _______________  

**Test Results**:
- Total Tests: _____
- Passed: _____
- Failed: _____
- Blocked: _____
- Success Rate: _____%

**Critical Issues**: _____  
**High Priority Issues**: _____  
**Medium Priority Issues**: _____  
**Low Priority Issues**: _____  

**Deployment Recommendation**: 
- [ ] ✅ **APPROVED** - Ready for production
- [ ] ⚠️ **APPROVED WITH CONDITIONS** - Minor issues to be fixed post-deployment
- [ ] ❌ **NOT APPROVED** - Critical issues must be resolved

**Notes**:
_______________________________________________________
_______________________________________________________
_______________________________________________________

**Signature**: _______________
