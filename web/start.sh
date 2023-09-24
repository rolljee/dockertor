#!/bin/bash

cd /app/

if [ ! -d "node_modules" ]; then
  echo "node_modules directory not found. Installing dependencies..."
  npm install
fi

# Run the npm run dev command
npm run dev