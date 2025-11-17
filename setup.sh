#!/bin/bash

# Setup Script for Appwrite Finance Backend
# This script helps you set up the development environment

echo "🚀 Appwrite Finance Backend Setup"
echo "=================================="
echo ""

# Check Node.js
echo "✓ Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v14 or higher."
    exit 1
fi

NODE_VERSION=$(node -v)
echo "  Found Node.js $NODE_VERSION"
echo ""

# Check npm
echo "✓ Checking npm installation..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

NPM_VERSION=$(npm -v)
echo "  Found npm $NPM_VERSION"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "  Dependencies installed successfully"
echo ""

# Check for .env file
echo "🔧 Checking environment configuration..."
if [ ! -f .env ]; then
    echo "  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "  ⚠️  Please edit .env file and add your Appwrite credentials"
    echo ""
    echo "  Required variables:"
    echo "    - APPWRITE_PROJECT"
    echo "    - APPWRITE_API_KEY"
    echo "    - APPWRITE_DATABASE_ID"
    echo "    - APPWRITE_COLLECTION_INVOICES_ID"
    echo ""
else
    echo "  .env file found ✓"
fi
echo ""

# Run tests
echo "🧪 Running tests..."
npm test
if [ $? -ne 0 ]; then
    echo "⚠️  Some tests failed. Please review and fix them."
else
    echo "  All tests passed ✓"
fi
echo ""

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Edit .env file with your Appwrite credentials"
echo "  2. Run 'npm run dev' to start the development server"
echo "  3. Test the API at http://localhost:4000/health"
echo ""
echo "Happy coding! 🎉"
