#!/bin/sh

# Start backend
echo "Starting backend API..."
cd /app/backend
npx prisma migrate deploy
npm start &

# Wait for backend to start
sleep 5

# Start frontend
echo "Starting frontend..."
cd /app
serve -s frontend/dist -l 3000 &

# Keep container running
wait