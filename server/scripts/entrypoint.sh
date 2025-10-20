#!/bin/bash
set -e

cd /app

if [ "$PRODUCTION" = "true" ]; then
    echo "Production mode detected — using Turso remote database."

    if [ -z "$DATABASE_URL" ] || [ -z "$DATABASE_AUTH_TOKEN" ]; then
        echo "Error: DATABASE_URL and DATABASE_AUTH_TOKEN must be set in production."
        exit 1
    fi

    echo "Running goose migrations on Turso..."
    goose -dir sql/schema sqlite3 "${DATABASE_URL}?authToken=${DATABASE_AUTH_TOKEN}" up
else
    echo "Local mode detected — using SQLite database file."

    mkdir -p /data

    if [ ! -f /data/userdata.sqlite ]; then
        echo "Initializing empty database..."
        touch /data/userdata.sqlite
        chmod 666 /data/userdata.sqlite
    fi

    echo "Running goose migrations locally..."
    goose -dir sql/schema sqlite3 /data/userdata.sqlite up
fi

echo "Starting application..."
exec "$@"