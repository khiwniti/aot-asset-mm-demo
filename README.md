<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AOT Asset Management System

Professional full-stack application for managing properties, leases, tasks, and maintenance requests with real-time synchronization.

**[View App in AI Studio](https://ai.studio/apps/drive/1DSgYfDF6n7G4YmutX_4sI4SQbCEoONnf)**

## Features

- 🗺️ **Interactive Maps** - Leaflet.js integration with property markers and clustering
- 🔄 **Real-Time Sync** - WebSocket-based synchronization across browser tabs
- 📊 **Entity Management** - Workflows, Leases, Tasks, and Maintenance Requests
- 💾 **Database** - Supabase PostgreSQL with audit trails
- 🤖 **AI Integration** - Google Gemini API support
- 📱 **Responsive Design** - Works on desktop and mobile
- ⚡ **Production Ready** - Fully typed TypeScript, error handling, logging

## Quick Start - Local Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Install dependencies** (includes `--legacy-peer-deps` for React 19):
   ```bash
   npm run install:all -- --legacy-peer-deps
   ```

2. **Configure environment variables**:
   ```bash
   # Create .env file from example
   cp .env.example .env
   # Edit with your values
   ```

3. **Start development servers**:
   ```bash
   # Run both frontend and backend
   npm run dev:full
   
   # Or run separately:
   npm run dev              # Frontend at http://localhost:5173
   npm run backend:dev      # Backend at http://localhost:3001
   ```

4. **Initialize database** (first time only):
   ```bash
   npm run backend:migrate
   npm run backend:seed
   ```

## Deployment

### Deploy to Vercel

For production deployment to Vercel with embedded environment variables:

1. **Read the deployment guide**:
   - [VERCEL_SETUP.md](./VERCEL_SETUP.md) - Setup instructions
   - [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) - Complete guide
   - [VERCEL_DEPLOYMENT_CHECKLIST.md](./VERCEL_DEPLOYMENT_CHECKLIST.md) - Step-by-step checklist
   - [ENV_VARIABLES_REFERENCE.md](./ENV_VARIABLES_REFERENCE.md) - Environment variable details

2. **Deploy using CLI**:
   ```bash
   # Deploy both frontend and backend
   ./scripts/vercel-deploy.sh both
   
   # Or use Vercel dashboard at https://vercel.com/dashboard
   ```

3. **Set environment secrets** in Vercel UI (never in git):
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `GEMINI_API_KEY`
   - `GOOGLE_API_KEY` (optional)

## Project Structure

```
/
├── pages/              # React pages/routes
├── components/         # Reusable React components
├── services/           # API clients, sync services
├── context/            # React context providers
├── types.ts            # TypeScript interfaces
├── vite.config.ts      # Vite build configuration
├── vercel.json         # Vercel frontend config
├── .env.example        # Example environment variables
├── backend/
│   ├── src/
│   │   ├── server.ts         # Express + WebSocket
│   │   ├── routes/           # API route handlers
│   │   ├── services/         # Business logic
│   │   ├── database/         # Database migrations
│   │   ├── types/            # TypeScript interfaces
│   │   └── utils/            # Utilities
│   ├── vercel.json           # Vercel backend config
│   ├── .env.example          # Backend environment
│   └── package.json          # Backend dependencies
└── scripts/
    └── vercel-deploy.sh      # Deployment helper script
```

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend dev server |
| `npm run backend:dev` | Start backend dev server |
| `npm run dev:full` | Start both frontend + backend |
| `npm run build` | Build frontend for production |
| `npm run backend:build` | Build backend for production |
| `npm run preview` | Preview production build |
| `npm run backend:migrate` | Initialize database |
| `npm run backend:seed` | Populate sample data |

## Environment Variables

### Frontend
- `VITE_API_URL` - Backend API URL (default: http://localhost:3001/api)
- `VITE_WS_URL` - WebSocket URL (default: ws://localhost:3001)
- `GEMINI_API_KEY` - Google Gemini API key

### Backend
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)
- `SUPABASE_URL` - Database URL
- `SUPABASE_SERVICE_ROLE_KEY` - Database service role key (secret)
- `SUPABASE_KEY` - Database public key
- `CORS_ORIGIN` - Frontend URL for CORS
- `GOOGLE_API_KEY` - Google API key (optional)

See [ENV_VARIABLES_REFERENCE.md](./ENV_VARIABLES_REFERENCE.md) for complete details.

## Technology Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: Express.js + TypeScript + Node.js
- **Database**: Supabase (PostgreSQL)
- **Real-Time**: WebSocket (ws)
- **Maps**: Leaflet.js + react-leaflet
- **UI**: Lucide icons, custom components
- **Charts**: Recharts, ECharts

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Documentation

- [SETUP.md](./SETUP.md) - Detailed setup guide
- [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) - Backend integration examples
- [LEAFLET_MAP_INTEGRATION.md](./LEAFLET_MAP_INTEGRATION.md) - Map component guide
- [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) - Deployment guide

## License

ISC

## Support

For issues, questions, or contributions, please refer to the documentation files or check the [Vercel Documentation](https://vercel.com/docs).
