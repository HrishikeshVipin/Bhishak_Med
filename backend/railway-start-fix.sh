#!/bin/bash
# Railway start command with migration fix

echo "🔧 Fixing failed migrations..."

# Mark the original failed migration as rolled back
npx prisma migrate resolve --rolled-back 20251225011135_add_appointment_system 2>/dev/null || true

# Mark the first fix attempt as rolled back too
npx prisma migrate resolve --rolled-back 20251225020000_fix_appointment_table 2>/dev/null || true

# Deploy all migrations (will run the recreate migration)
echo "📦 Deploying all migrations..."
npx prisma migrate deploy

# Start the server
echo "🚀 Starting server..."
node dist/server.js
