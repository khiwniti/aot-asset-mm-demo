# AOT Asset Management - Backend Integration

This document describes the enhanced backend system with Supabase integration and the Enhanced Agent Framework (ADK) for the Interactive Domain Entity Management System.

## 🚀 Features Implemented

### Backend Services
- **Supabase Integration**: Real-time database with PostgreSQL
- **Enhanced Agent Service**: Natural language processing with Gemini 1.5 Pro
- **Entity Management**: CRUD operations for Workflows, Leases, Tasks, and Maintenance Requests
- **Real-time Synchronization**: Cross-tab state sync with optimistic updates
- **Conflict Resolution**: Handle concurrent editing scenarios
- **Audit Trail**: Complete audit logging for compliance
- **Offline Support**: Queue operations for network interruptions

### Frontend Components
- **WorkflowStatusManager**: Kanban board for workflow lifecycle management
- **LeaseManager**: Interactive lease management with expiration tracking
- **TaskBoard**: Kanban task board with drag-and-drop status updates
- **MaintenanceTracker**: Maintenance request tracking with cost management

## 📋 Prerequisites

1. **Node.js** 18+ and npm
2. **Supabase** account and project
3. **Gemini API** key for agent functionality

## 🛠️ Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the project root:

```env
# Supabase Configuration
SUPABASE_URL=https://wvbyapxobvpiozdhyxjj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind2YnlhcHhvYnZwaW96ZGh5eGpqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIxNTEyNSwiZXhwIjoyMDc2NzkxMTI1fQ.uvJwKkJfsvoLhWwZ9HbkOUZK-gEZbJ_L0xlXxUXAuvs
SUPABASE_KEY=sb_publishable_7tX3ttUeWOk2jANWdC08dg_H7yxt9h5

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Agent Framework Configuration
GEMINI_API_KEY=your-gemini-api-key
AGENT_MAX_RETRIES=3
AGENT_TIMEOUT=30000
```

### 2. Database Setup

Run the Supabase schema:

```bash
# Apply the schema to your Supabase project
# Copy the contents of supabase/schema.sql and run it in the Supabase SQL editor
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
# Start both frontend and backend concurrently
npm start

# Or start them separately:
npm run server:dev  # Backend server on port 3001
npm run dev         # Frontend on port 5173
```

## 🏗️ Architecture Overview

### Backend Services

#### SupabaseService (`services/supabaseService.ts`)
- Database operations and real-time subscriptions
- Optimistic concurrency control
- Audit trail management
- Conflict detection and resolution

#### EnhancedAgentService (`services/enhancedAgentService.ts`)
- Natural language command processing
- Status transition validation
- Context-aware suggestions
- UI component generation

#### REST API (`server/index.ts`)
- Express.js server with comprehensive endpoints
- Entity CRUD operations
- Status management
- Bulk operations
- Notification system

### Frontend State Management

#### EntityStore (`stores/entityStore.ts`)
- Zustand-based state management
- Real-time synchronization
- Optimistic updates with rollback
- Offline operation queue
- Conflict resolution UI

### Interactive Components

All components support:
- **Drag-and-drop** status transitions
- **Real-time updates** across browser tabs
- **Bulk operations** with progress indication
- **Inline editing** capabilities
- **Conflict resolution** for concurrent edits
- **Offline support** with operation queuing

## 📊 API Endpoints

### Health Check
```
GET /health
```

### Agent Commands
```
POST /api/agent/command
```

### Entity Management
```
GET    /api/entities/:type
GET    /api/entities/:type/:id
POST   /api/entities/:type
PUT    /api/entities/:type/:id
DELETE /api/entities/:type/:id
```

### Status Management
```
PUT /api/entities/:type/:id/status
```

### Specialized Endpoints
```
GET /api/leases/expiring/:days
GET /api/tasks/workflow/:workflowId
GET /api/maintenance/priority/:priority
GET /api/audit/:entityType/:entityId
GET /api/notifications/:userId
```

## 🔄 Real-time Features

### Cross-Tab Synchronization
- Entity changes sync across all open browser tabs within 1 second
- Optimistic updates show immediately with loading indicators
- Automatic rollback on sync failures

### Conflict Resolution
- Detects concurrent editing using version tracking
- Presents conflict resolution UI with both versions
- Options: keep local, accept remote, or manual merge

### Offline Support
- Operations queue when network is unavailable
- Automatic retry with exponential backoff
- Visual indicators for sync status

## 🤖 Agent Integration

### Natural Language Commands

**Create Commands:**
- "Create workflow for Q1 budget review due March 31st, assign to Sarah"
- "Create task: Review tenant applications for Airport Plaza, assign to me, due Friday"
- "Create urgent maintenance request for broken HVAC at Terminal Building, estimate $5000"

**Query Commands:**
- "Show me all leases expiring in next 60 days"
- "List all active workflows assigned to Sarah"
- "Show high priority maintenance requests"

**Status Updates:**
- "Mark workflow as completed"
- "Move task to in progress"
- "Cancel maintenance request WO-123"

**Bulk Operations:**
- "Assign all urgent maintenance to John"
- "Mark all expired leases as archived"
- "Complete all tasks in workflow Q1 Budget Review"

### Status Transition Validation

The system enforces business rules for status changes:

**Workflows:** draft → active → paused → completed → archived
**Leases:** draft → active → expiring → expired/renewed
**Tasks:** todo → in_progress → blocked → completed
**Maintenance:** submitted → assigned → in_progress → completed/cancelled

## 📈 Performance Metrics

### Target Performance
- **Entity CRUD operations**: < 500ms
- **Optimistic UI updates**: < 200ms
- **Cross-tab sync**: < 1 second (95% of cases)
- **Bulk operations (50 entities)**: < 5 seconds
- **Concurrent users**: 100+ without degradation

### Reliability
- **99.9%** operation success rate
- **Zero data loss** during conflicts
- **Automatic retries** for failed operations
- **Complete audit trail** for compliance

## 🔧 Configuration

### Environment Variables
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key for admin access
- `GEMINI_API_KEY`: Google Gemini API key for agent functionality
- `JWT_SECRET`: Secret for JWT token signing
- `PORT`: Backend server port (default: 3001)

### Agent Configuration
- `AGENT_MAX_RETRIES`: Maximum retry attempts for failed operations (default: 3)
- `AGENT_TIMEOUT`: Timeout for agent operations in milliseconds (default: 30000)

## 🧪 Testing

### Manual Testing Scenarios

1. **Workflow Lifecycle Management**
   - Create workflow via natural language
   - Drag between status columns
   - Verify cross-tab synchronization
   - Test conflict resolution

2. **Lease Status Management**
   - Create leases with various end dates
   - Verify automatic status transitions
   - Test renewal workflows
   - Check expiration alerts

3. **Task Board Management**
   - Create tasks with dependencies
   - Test drag-and-drop status updates
   - Verify blocker validation
   - Test bulk operations

4. **Maintenance Request Tracking**
   - Create maintenance requests
   - Test cost overrun alerts
   - Verify priority-based sorting
   - Test vendor assignment

## 🚨 Error Handling

### Network Failures
- Automatic retry with exponential backoff
- Operation queuing for offline mode
- User-friendly error messages
- Manual retry options

### Conflict Resolution
- Visual conflict indicators
- Detailed comparison UI
- Multiple resolution options
- Audit trail logging

### Validation Errors
- Real-time field validation
- Clear error messages
- Contextual help text
- Suggested corrections

## 📝 Development Notes

### Code Organization
- `services/`: Backend service implementations
- `stores/`: Frontend state management
- `components/`: Interactive UI components
- `types/entities.ts`: TypeScript type definitions
- `server/`: Express.js API server

### Best Practices
- Use optimistic updates for better UX
- Implement proper error boundaries
- Follow TypeScript strict mode
- Maintain audit trails for compliance
- Test conflict resolution scenarios

## 🔄 Future Enhancements

### Planned Features
- Advanced analytics and reporting
- Mobile app integration
- Advanced notification preferences
- Workflow automation rules
- Integration with external systems

### Scalability Improvements
- Database query optimization
- Caching layer implementation
- Load balancing for high traffic
- Microservices architecture migration

## 📞 Support

For technical support or questions:
1. Check the health endpoint: `GET /health`
2. Review browser console for errors
3. Verify environment configuration
4. Check Supabase connection status
5. Validate Gemini API key configuration

---

**Note**: This backend system is designed to work with the existing frontend while providing enhanced real-time capabilities and agent integration. The current frontend mock data will be gradually replaced with real database connections.
