#!/bin/bash
set -e

cd /app

if [ "$PRODUCTION_BUILD" = "TRUE" ]; then
    echo "Production mode detected — using Turso remote database."

    if [ -z "$TURSO_DATABASE_URL" ] || [ -z "$TURSO_AUTH_TOKEN" ]; then
        echo "Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in production."
        exit 1
    fi

    echo "Authenticating with Turso..."
    turso auth login --token "$TURSO_AUTH_TOKEN"

    echo "Running goose migrations on Turso..."
    turso db push --url "$TURSO_DATABASE_URL" --dir sql/schema "$TURSO_DATABASE_NAME"
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