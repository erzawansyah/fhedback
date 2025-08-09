#!/bin/bash

# Build script for production
echo "Building FhedBack for production..."

# Clean build directory
rm -rf dist

# Type check
echo "Running type check..."
npm run build

echo "Build completed successfully!"
