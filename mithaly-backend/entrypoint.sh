#!/bin/sh
set -e

# Create uploads directory if it doesn't exist
mkdir -p /app/uploads

# Push schema to database
npx prisma db push --accept-data-loss || true

exec "$@"
