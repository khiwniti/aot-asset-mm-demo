#!/bin/bash

# Vercel Deployment Helper Script
# This script helps deploy frontend and backend to Vercel with embedded environment variables

set -e

echo "╔════════════════════════════════════════════╗"
echo "║  AOT Asset Management - Vercel Deployment  ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Parse command line arguments
DEPLOY_TYPE="${1:-both}"
PROD_FLAG="${2:---prod}"

case "$DEPLOY_TYPE" in
    frontend)
        echo "📦 Deploying Frontend to Vercel..."
        echo ""
        vercel $PROD_FLAG
        ;;
    backend)
        echo "📦 Deploying Backend to Vercel..."
        echo ""
        cd backend
        vercel $PROD_FLAG
        cd ..
        ;;
    both)
        echo "📦 Deploying both Frontend and Backend..."
        echo ""
        
        echo "1️⃣  Deploying Frontend..."
        vercel $PROD_FLAG
        
        echo ""
        echo "2️⃣  Deploying Backend..."
        cd backend
        vercel $PROD_FLAG
        cd ..
        
        echo ""
        echo "✅ Both deployments completed!"
        echo ""
        echo "Next steps:"
        echo "1. Add SUPABASE_SERVICE_ROLE_KEY to backend environment"
        echo "2. Add GEMINI_API_KEY to frontend environment"
        echo "3. Verify frontend at https://aot-frontend.vercel.app"
        echo "4. Verify backend at https://aot-backend.vercel.app/api/health"
        ;;
    env-list)
        echo "📋 Listing Environment Variables..."
        echo ""
        echo "Frontend:"
        vercel env ls
        echo ""
        echo "Backend:"
        cd backend
        vercel env ls
        cd ..
        ;;
    env-add)
        if [ -z "$3" ]; then
            echo "❌ Usage: ./vercel-deploy.sh env-add VARIABLE_NAME"
            exit 1
        fi
        
        PROJECT="${3:-frontend}"
        VAR_NAME="$2"
        
        echo "Adding environment variable '$VAR_NAME' to $PROJECT..."
        
        if [ "$PROJECT" = "backend" ]; then
            cd backend
        fi
        
        vercel env add $VAR_NAME
        
        if [ "$PROJECT" = "backend" ]; then
            cd ..
        fi
        ;;
    rollback)
        PROJECT="${2:-frontend}"
        echo "🔄 Rolling back $PROJECT..."
        
        if [ "$PROJECT" = "backend" ]; then
            cd backend
        fi
        
        vercel rollback
        
        if [ "$PROJECT" = "backend" ]; then
            cd ..
        fi
        ;;
    logs)
        PROJECT="${2:-frontend}"
        echo "📋 Showing logs for $PROJECT..."
        
        if [ "$PROJECT" = "backend" ]; then
            cd backend
        fi
        
        vercel logs
        
        if [ "$PROJECT" = "backend" ]; then
            cd ..
        fi
        ;;
    preview)
        echo "🔍 Preview Deployment (non-prod)..."
        echo ""
        vercel
        ;;
    help|--help|-h)
        echo "Usage: ./vercel-deploy.sh [command] [options]"
        echo ""
        echo "Commands:"
        echo "  frontend          Deploy only frontend to production"
        echo "  backend           Deploy only backend to production"
        echo "  both              Deploy both frontend and backend (default)"
        echo "  preview           Deploy preview (non-production)"
        echo "  env-list          List environment variables"
        echo "  env-add VAR       Add environment variable"
        echo "  rollback [proj]   Rollback deployment (frontend|backend)"
        echo "  logs [proj]       Show deployment logs (frontend|backend)"
        echo "  help              Show this help message"
        echo ""
        echo "Examples:"
        echo "  ./vercel-deploy.sh frontend --prod"
        echo "  ./vercel-deploy.sh backend"
        echo "  ./vercel-deploy.sh env-add SUPABASE_SERVICE_ROLE_KEY backend"
        echo "  ./vercel-deploy.sh rollback backend"
        echo "  ./vercel-deploy.sh logs frontend"
        ;;
    *)
        echo "❌ Unknown command: $DEPLOY_TYPE"
        echo "Use './vercel-deploy.sh help' for available commands"
        exit 1
        ;;
esac
