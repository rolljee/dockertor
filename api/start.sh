#!/bin/bash

cd /app/

# Check if the node_modules folder exists
if [ ! -d "node_modules" ]; then
  echo "node_modules directory not found. Installing dependencies..."
  bun install
fi

# Run the npm run dev command
bun --hot run index.ts