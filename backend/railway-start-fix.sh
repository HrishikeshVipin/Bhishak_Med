#!/bin/bash
# Railway start command with migration fix

echo "🔧 Checking for failed migrations..."

# Mark any failed migrations as rolled back
npx prisma migrate resolve --rolled-back 20251225011135_add_appointment_system 2>/dev/null || true

# Deploy all migrations
echo "📦 Deploying migrations..."
npx prisma migrate deploy

# Start the server
echo "🚀 Starting server..."
node dist/server.js
