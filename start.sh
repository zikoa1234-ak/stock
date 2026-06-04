#!/bin/sh

# Set error handling
set -e

echo "🚀 Starting Stock Management System..."
echo "======================================"

# Run database migrations
echo "📊 Running database migrations..."
cd /app/backend
npx prisma migrate deploy

# Seed database if needed (only in development)
if [ "$NODE_ENV" = "development" ]; then
    echo "🌱 Seeding database..."
    npx tsx prisma/seed.ts
fi

# Start backend API
echo "🔄 Starting backend API on port 3001..."
cd /app/backend
node dist/app.js &

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
sleep 10

# Start frontend
echo "🌐 Starting frontend on port 3000..."
cd /app
serve -s frontend/dist -l 3000 &

echo "✅ Application started successfully!"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:3001"
echo "   Health check: http://localhost:3001/api/health"
echo "======================================"

# Keep container running
wait