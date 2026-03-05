#!/bin/bash

# Function to kill all background processes on exit
cleanup() {
    echo ""
    echo "Stopping both backend and frontend..."
    # Kill all background jobs started by this script
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Trap SIGINT (Ctrl+C) and EXIT signals to run cleanup
trap cleanup SIGINT EXIT

echo "--- Starting Todo App ---"

# 1. Start Backend
echo "Starting backend with uvicorn..."
# Check if virtual environment exists and activate it
if [ -d "env" ]; then
    if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
        source env/Scripts/activate
    else
        source env/bin/activate
    fi
fi

# Run uvicorn in the background
uvicorn app.main:app --reload &
BACKEND_PID=$!

# Give the backend a moment to start
sleep 2

# 2. Start Frontend
echo "Starting frontend with vite..."
if [ -d "frontend/vite-project" ]; then
    cd frontend/vite-project
    # Install dependencies if node_modules is missing
    if [ ! -d "node_modules" ]; then
        echo "node_modules not found, installing..."
        npm install
    fi
    npm run dev
else
    echo "Error: frontend/vite-project directory not found."
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi
