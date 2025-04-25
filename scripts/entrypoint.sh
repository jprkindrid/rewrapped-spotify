#!/bin/sh
set -e

# Wait a moment for the volume to be mounted
sleep 1

# Ensure data directory exists
mkdir -p /data

# Initialize empty database if it doesn't exist
if [ ! -f /data/userdata.sqlite ]; then
    echo "Initializing empty database..."
    touch /data/userdata.sqlite
    chmod 666 /data/userdata.sqlite
fi

# Run database migrations
echo "Running database migrations..."
cd /app
goose -dir sql/schema sqlite3 /data/userdata.sqlite up

# Start the application
exec "$@"
