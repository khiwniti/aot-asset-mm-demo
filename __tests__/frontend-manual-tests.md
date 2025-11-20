# Frontend Manual Test Cases

## Test Environment
- Browser: Chrome, Firefox, Safari, Edge
- Device: Desktop, Tablet, Mobile
- URL: http://localhost:5173

## Pre-Test Setup
1. Ensure backend is running on http://localhost:3001
2. Clear browser cache and cookies
3. Open browser DevTools console for error monitoring
4. Test with both light and dark theme

---

## TC-F001: Application Loading
**Priority**: Critical  
**Steps**:
1. Navigate to http://localhost:5173
2. Observe page load

**Expected**:
- Page loads within 2 seconds
- No console errors
- All navigation menu items visible
- Default page displays correctly

**Status**: [ ] Pass [ ] Fail

---

## TC-F002: Navigation Menu
**Priority**: High  
**Steps**:
1. Click on each menu item:
   - Dashboard
   - Properties
   - Leases
   - Workflows
   - Tasks
   - Maintenance
   - AI Chat

**Expected**:
- Each page loads without errors
- URL changes correctly
- Active menu item highlighted
- Content displays for each page

**Status**: [ ] Pass [ ] Fail

---

## TC-F003: Property Listing - List View
**Priority**: High  
**Steps**:
1. Navigate to Properties page
2. Verify list view displays
3. Check property cards show:
   - Property name
   - Address
   - Monthly rent
   - Occupancy rate
   - Status badge

**Expected**:
- All properties display correctly
- Status colors are correct (green=Active, amber=Pending, red=Maintenance)
- Data is readable and formatted

**Status**: [ ] Pass [ ] Fail

---

## TC-F004: Property Listing - Map View
**Priority**: High  
**Steps**:
1. Navigate to Properties page
2. Click "Map View" button
3. Verify map loads with markers
4. Click on a marker
5. Hover over markers

**Expected**:
- Map renders within 1 second
- All property markers visible
- Markers colored by status
- Popup shows property details on click
- Tooltip shows property name on hover
- No console errors

**Status**: [ ] Pass [ ] Fail

---

## TC-F005: Leaflet Map - Theme Switching
**Priority**: Medium  
**Steps**:
1. Navigate to Properties map view
2. Toggle theme (light/dark) using system theme or app theme switcher
3. Observe map appearance

**Expected**:
- Light theme: Shows standard OpenStreetMap tiles
- Dark theme: Shows dark CartoDB tiles
- Markers remain visible in both themes
- Transition is smooth

**Status**: [ ] Pass [ ] Fail

---

## TC-F006: Leaflet Map - Marker Interaction
**Priority**: High  
**Steps**:
1. Navigate to Properties map view
2. Click on different property markers
3. Verify popup content
4. Click on property link in popup

**Expected**:
- Popup displays:
  - Property name and address
  - Monthly rent
  - Occupancy rate
  - Number of tenants
  - Property type
  - Status badge
- Clicking property navigates to details page

**Status**: [ ] Pass [ ] Fail

---

## TC-F007: Leaflet Map - Pan and Zoom
**Priority**: Medium  
**Steps**:
1. Navigate to Properties map view
2. Drag map to pan
3. Use zoom controls (+/-) 
4. Use mouse wheel to zoom
5. Double-click to zoom in

**Expected**:
- Map pans smoothly
- Zoom controls work
- Mouse wheel zooming enabled
- Double-click zoom works
- Performance remains smooth

**Status**: [ ] Pass [ ] Fail

---

## TC-F008: Workflows CRUD - Create
**Priority**: Critical  
**Steps**:
1. Navigate to Workflows page
2. Click "Create Workflow" button
3. Fill in workflow details:
   - Name: "Test Workflow QA"
   - Description: "Testing workflow creation"
   - Status: "draft"
   - Assigned To: "tester@aot.com"
4. Click "Save"

**Expected**:
- Form validation works
- Workflow created successfully
- Success message displays
- New workflow appears in list
- Page updates without full reload

**Status**: [ ] Pass [ ] Fail

---

## TC-F009: Workflows CRUD - Read/View
**Priority**: High  
**Steps**:
1. Navigate to Workflows page
2. View list of workflows
3. Click on a workflow to view details

**Expected**:
- All workflows display in list
- Workflow details page shows complete information
- Status is correctly displayed
- Dates are formatted correctly

**Status**: [ ] Pass [ ] Fail

---

## TC-F010: Workflows CRUD - Update
**Priority**: Critical  
**Steps**:
1. Navigate to Workflows page
2. Click on a workflow
3. Click "Edit" button
4. Change status from "draft" to "active"
5. Update description
6. Click "Save"

**Expected**:
- Edit form pre-fills with current data
- Changes save successfully
- Updated data displays immediately
- Audit trail records the change

**Status**: [ ] Pass [ ] Fail

---

## TC-F011: Workflows CRUD - Delete
**Priority**: High  
**Steps**:
1. Navigate to Workflows page
2. Click on a workflow
3. Click "Delete" button
4. Confirm deletion

**Expected**:
- Confirmation dialog appears
- Workflow is soft-deleted (not permanently removed)
- Workflow removed from list
- Success message displays

**Status**: [ ] Pass [ ] Fail

---

## TC-F012: Leases Management
**Priority**: High  
**Steps**:
1. Navigate to Leases page
2. Create a new lease with:
   - Tenant name
   - Property selection
   - Start/End dates
   - Monthly rent
3. Verify lease appears in list
4. Update lease status
5. View lease details

**Expected**:
- Lease creation successful
- Date picker works correctly
- Property dropdown populated
- Status transitions work (draft → active → expiring → expired)
- Rent amount formatted as currency

**Status**: [ ] Pass [ ] Fail

---

## TC-F013: Tasks Management
**Priority**: High  
**Steps**:
1. Navigate to Tasks page
2. Create a new task:
   - Title: "QA Test Task"
   - Description: "Testing task functionality"
   - Priority: "high"
   - Due Date: Future date
   - Assigned To: "tester@aot.com"
3. Update task status: todo → in_progress → completed
4. Delete task

**Expected**:
- Task creation successful
- Priority badges colored correctly (red=high, yellow=medium, blue=low)
- Status progression works
- Due date validation works (no past dates)
- Task filters work (by status, priority, assignee)

**Status**: [ ] Pass [ ] Fail

---

## TC-F014: Maintenance Requests
**Priority**: High  
**Steps**:
1. Navigate to Maintenance page
2. Create maintenance request:
   - Property: Select from dropdown
   - Title: "Fix Plumbing"
   - Description: "Leaking pipe"
   - Priority: "high"
3. Verify request created
4. Update status: submitted → assigned → in_progress → completed

**Expected**:
- Request created successfully
- Status workflow enforced
- Priority affects visual display
- Can assign technician
- Completion date recorded

**Status**: [ ] Pass [ ] Fail

---

## TC-F015: Real-Time Sync - Multiple Tabs
**Priority**: High  
**Steps**:
1. Open application in two browser tabs
2. In Tab 1: Create a new workflow
3. Observe Tab 2

**Expected**:
- Tab 2 automatically shows new workflow (within 1 second)
- No page refresh needed
- WebSocket connection indicator shows "Connected"
- Sync status updates

**Status**: [ ] Pass [ ] Fail

---

## TC-F016: Real-Time Sync - Conflict Handling
**Priority**: Medium  
**Steps**:
1. Open application in two tabs
2. In both tabs: Open same workflow
3. Tab 1: Update description to "Version 1"
4. Tab 2: Update description to "Version 2" (before Tab 1 saves)
5. Observe conflict handling

**Expected**:
- Conflict detected
- User notified of conflict
- Options to resolve (keep local, use server version)
- No data loss

**Status**: [ ] Pass [ ] Fail

---

## TC-F017: AI Chat Visualization
**Priority**: Medium  
**Steps**:
1. Navigate to AI Chat page
2. Send message: "Show me properties on a map"
3. Observe visualization

**Expected**:
- AI responds with MapVisual component
- Leaflet map renders in chat
- Properties displayed on map
- Map interactive (can zoom/pan)
- Theme matches application theme

**Status**: [ ] Pass [ ] Fail

---

## TC-F018: API Error Handling
**Priority**: High  
**Steps**:
1. Stop backend server
2. Try to create a workflow
3. Observe error handling

**Expected**:
- User-friendly error message displays
- No raw error stack traces shown
- Retry mechanism activates
- Pending operations queued
- Connection status shows "Disconnected"

**Status**: [ ] Pass [ ] Fail

---

## TC-F019: Form Validation
**Priority**: High  
**Steps**:
1. Try to create workflow without name
2. Try to create lease with end date before start date
3. Try to create task without title
4. Try to submit form with invalid email

**Expected**:
- Field-level validation errors show
- Form cannot be submitted with errors
- Error messages are clear and helpful
- Required fields marked with *
- Invalid fields highlighted in red

**Status**: [ ] Pass [ ] Fail

---

## TC-F020: Responsive Design - Mobile
**Priority**: Medium  
**Steps**:
1. Open application on mobile device or resize to 375px width
2. Test navigation menu
3. Test property list and map
4. Test form inputs

**Expected**:
- Navigation collapses to hamburger menu
- Property cards stack vertically
- Map remains interactive
- Forms are usable
- Text is readable (minimum 14px)
- Touch targets at least 44x44px

**Status**: [ ] Pass [ ] Fail

---

## TC-F021: Performance - Large Dataset
**Priority**: Medium  
**Steps**:
1. Load page with 100+ properties
2. Observe map rendering time
3. Test scrolling performance
4. Test filter/search performance

**Expected**:
- Map loads within 2 seconds
- All 100+ markers render
- Scrolling is smooth (60fps)
- Filters apply within 500ms
- No browser lag or freezing

**Status**: [ ] Pass [ ] Fail

---

## TC-F022: Browser Compatibility
**Priority**: High  
**Steps**:
1. Test application on:
   - Chrome (latest)
   - Firefox (latest)
   - Safari (latest)
   - Edge (latest)

**Expected**:
- All features work across browsers
- No browser-specific errors
- UI looks consistent
- Map renders correctly in all browsers

**Status**:
- Chrome: [ ] Pass [ ] Fail
- Firefox: [ ] Pass [ ] Fail
- Safari: [ ] Pass [ ] Fail
- Edge: [ ] Pass [ ] Fail

---

## TC-F023: Accessibility - Keyboard Navigation
**Priority**: Medium  
**Steps**:
1. Use Tab key to navigate through all interactive elements
2. Use Enter/Space to activate buttons
3. Use arrow keys in dropdowns
4. Test focus indicators

**Expected**:
- All interactive elements reachable via keyboard
- Focus order is logical
- Focus indicators clearly visible
- No keyboard traps
- Skip links available

**Status**: [ ] Pass [ ] Fail

---

## TC-F024: Console Errors
**Priority**: Critical  
**Steps**:
1. Open DevTools console
2. Navigate through all pages
3. Perform all major actions
4. Monitor for errors/warnings

**Expected**:
- No error messages in console
- No warning messages (or only acceptable ones)
- No React key warnings
- No memory leaks
- No 404 requests for assets

**Status**: [ ] Pass [ ] Fail

---

## Test Summary

**Date**: _______________  
**Tester**: _______________  
**Environment**: _______________  

**Results**:
- Total Tests: 24
- Passed: _____
- Failed: _____
- Blocked: _____
- Success Rate: _____%

**Critical Bugs Found**: _____  
**High Bugs Found**: _____  
**Medium Bugs Found**: _____  
**Low Bugs Found**: _____  

**Overall Status**: [ ] Ready for Deployment [ ] Needs Fixes

**Notes**:
_______________________________________________________
_______________________________________________________
_______________________________________________________
