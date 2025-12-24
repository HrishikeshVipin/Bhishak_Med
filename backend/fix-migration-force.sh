#!/bin/bash
# One-time force fix for Railway - mark old failed migrations as applied then deploy clean

echo "🔧 Marking old failed migrations as applied in database..."

# These migrations no longer exist in code, but might be stuck in DB
# Mark them as applied so Prisma skips them
npx prisma migrate resolve --applied 20251225011135_add_appointment_system 2>/dev/null || echo "Migration already resolved or not found"
npx prisma migrate resolve --applied 20251225020000_fix_appointment_table 2>/dev/null || echo "Migration already resolved or not found"

echo "📦 Deploying clean migration..."
npx prisma migrate deploy

echo "✅ Migration fixed! Starting server..."
node dist/server.js
