#!/bin/sh

echo "Waiting for postgres..."

while ! nc -z postgres 5432; do
  sleep 0.1
done

echo "PostgreSQL started"

echo "Running migrations..."
# Force a fresh database setup
pnpm prisma migrate reset --force
pnpm prisma migrate deploy

echo "Starting application..."
exec pnpm start:prod 