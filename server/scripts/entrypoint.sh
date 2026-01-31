#!/bin/sh
set -e

cd /app

# if [ "$PRODUCTION_BUILD" = "FALSE" ]; then
    echo "Local mode detected — using SQLite database file."
    mkdir -p /data

    if [ ! -f /data/userdata.sqlite ]; then
        echo "Initializing empty database..."
        touch /data/userdata.sqlite
        chmod 666 /data/userdata.sqlite
    fi

    echo "Running goose migrations locally..."
    goose -dir sql/schema sqlite3 /data/userdata.sqlite up
# fi

echo "Starting application..."
exec "$@"