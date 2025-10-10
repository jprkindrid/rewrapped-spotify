#!/bin/bash
set -e

echo "Building Go Binary..."
go build -o out ./cmd

echo "Running built Go binary..."
./out