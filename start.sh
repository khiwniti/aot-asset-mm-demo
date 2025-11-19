#!/bin/bash

# AOT Asset Management - Backend Integration Startup Script
echo "🚀 Starting AOT Asset Management with Backend Integration..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create a .env file with your Supabase and Gemini API credentials."
    echo "See README_BACKEND.md for configuration details."
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🔧 Starting services..."
echo ""

# Start both frontend and backend concurrently
echo "Frontend will be available at: http://localhost:5173"
echo "Backend API will be available at: http://localhost:3001"
echo "Health check: http://localhost:3001/health"
echo ""
echo "📊 Demo page: http://localhost:5173/#/entity-management"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

npm start
