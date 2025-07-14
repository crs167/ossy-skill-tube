#!/bin/bash

echo "🎨 Starting Ossy Skill Tube Frontend..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "❌ Python is not installed. Please install Python first."
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

# Check if backend is running
echo "🔍 Checking if backend is running..."
if curl -s http://localhost:3000/api/vault/videos > /dev/null 2>&1; then
    echo "✅ Backend is running on http://localhost:3000"
else
    echo "⚠️  Backend is not running on http://localhost:3000"
    echo "   Please start the backend first: cd backend && ./start.sh"
    echo ""
    echo "   Or start it manually:"
    echo "   cd backend"
    echo "   npm install"
    echo "   npm run dev"
    echo ""
fi

echo ""
echo "🌐 Starting frontend server on http://localhost:8080"
echo "📱 Open your browser and navigate to: http://localhost:8080"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start Python HTTP server
$PYTHON_CMD -m http.server 8080