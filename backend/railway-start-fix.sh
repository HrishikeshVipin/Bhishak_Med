#!/bin/bash
# Railway start command - clean migration deploy

echo "📦 Deploying migrations..."
npx prisma migrate deploy

echo "🚀 Starting server..."
node dist/server.js
