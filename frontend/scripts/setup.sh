#!/bin/bash

# Development setup script
echo "Setting up FhedBack development environment..."

# Install dependencies
echo "Installing dependencies..."
npm install

# Copy environment file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "Creating .env.local from example..."
    cp .env.example .env.local
    echo "Please update .env.local with your configuration values"
fi

echo "Development environment setup completed!"
echo "Run 'npm run dev' to start the development server"
