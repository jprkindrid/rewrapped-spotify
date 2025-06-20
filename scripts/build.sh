#!/bin/bash
set -e

echo "Compiling TypeScript..."
npx tsc

echo "Building Go Binary..."
go build -o out ./cmd

echo "Running built Go binary..."
./out