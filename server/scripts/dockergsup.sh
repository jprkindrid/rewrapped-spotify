#!/bin/bash
set -e

# Accept DB path as first argument, default to /data/userdata.sqlite
DB_PATH="${1:-/data/userdata.sqlite}"
MIGRATIONS_DIR="/app/sql/schema"

echo "Running Goose migrations on $DB_PATH..."
goose -dir "$MIGRATIONS_DIR" sqlite3 "$DB_PATH" up
echo "Migrations complete."
