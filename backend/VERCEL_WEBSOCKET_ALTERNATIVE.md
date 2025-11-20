# Vercel Serverless Migration - WebSocket Alternative

## WebSocket Limitation on Vercel

Vercel serverless functions **do not support long-lived WebSocket connections**. The original Express server in `src/server.ts` used WebSockets for real-time cross-tab synchronization, but this won't work on Vercel's serverless platform.

## Alternative Approaches

### Option 1: Disable Real-Time Sync (Simplest)

For production on Vercel, you can disable WebSocket sync and rely on periodic polling:

**Frontend Changes Required:**
```typescript
// In services/realtimeSync.ts or where WebSocket is initialized
// Comment out or skip WebSocket connection in production
if (import.meta.env.PROD) {
  console.log('Real-time sync disabled in production (Vercel limitation)');
  // Don't initialize WebSocket
} else {
  // Connect to WebSocket in development
  realtimeSync.connect();
}
```

### Option 2: Use Supabase Realtime (Recommended)

Supabase provides built-in real-time subscriptions that work on serverless platforms:

**Install Supabase Realtime:**
```bash
# Already included in @supabase/supabase-js
```

**Implementation Example:**
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Subscribe to changes
const channel = supabase
  .channel('db-changes')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'workflows' },
    (payload) => {
      console.log('Change received!', payload);
      // Update local state
    }
  )
  .subscribe();
```

**Benefits:**
- Works on serverless platforms
- No additional infrastructure needed
- Built-in to Supabase
- Lower latency than polling

### Option 3: Use a Separate WebSocket Service

Deploy the WebSocket server separately on a platform that supports long-lived connections:

**Platforms that support WebSockets:**
- Railway (easiest migration)
- Render
- Heroku
- AWS EC2
- DigitalOcean

**Deployment Strategy:**
1. Deploy serverless API functions to Vercel (fast, scalable)
2. Deploy WebSocket server separately (Railway, Render, etc.)
3. Frontend connects to both:
   - Vercel for API calls
   - Railway for WebSocket sync

### Option 4: Polling Fallback

Implement periodic polling when WebSocket is unavailable:

```typescript
// services/realtimeSync.ts
class RealtimeSyncService {
  private pollingInterval: number = 5000; // 5 seconds
  private polling: boolean = false;

  startPolling() {
    if (this.polling) return;
    this.polling = true;

    setInterval(() => {
      // Fetch latest data from API
      this.checkForUpdates();
    }, this.pollingInterval);
  }

  async checkForUpdates() {
    // Call API to get latest versions
    // Compare with local versions
    // Update if necessary
  }
}
```

## Current Status

The backend has been **converted to Vercel serverless functions**:
- ✅ All API routes converted to serverless functions
- ✅ CRUD operations work without WebSocket
- ⚠️ Real-time sync will NOT work on Vercel
- ⚠️ WebSocket code in `src/server.ts` is not used in serverless deployment

## Recommended Path Forward

**For immediate deployment:**
1. Deploy to Vercel without WebSocket (API functions only)
2. Disable WebSocket connection in frontend for production
3. Users can still use all features, just need to refresh for cross-tab updates

**For production-ready real-time sync:**
1. Implement Supabase Realtime (Option 2) - most robust solution
2. Or deploy WebSocket server to Railway alongside Vercel API

## Development vs Production

**Development (local):**
- Express server with WebSocket runs normally
- Full real-time sync works

**Production (Vercel):**
- Serverless API functions only
- No WebSocket support
- Use Supabase Realtime or disable sync

## Migration Checklist

- [x] Convert API routes to serverless functions
- [x] Update vercel.json configuration
- [x] Document WebSocket limitation
- [ ] Choose real-time sync strategy
- [ ] Update frontend to handle production mode
- [ ] Test deployment
- [ ] Update CLAUDE.md with deployment info
