#!/bin/bash
echo "============================================"
echo "  ANKAN Garments AI — React Edition"
echo "  Backend: FastAPI  |  Frontend: React"
echo "============================================"
echo ""

echo "[1/3] Installing backend dependencies..."
cd backend
pip install -r requirements.txt -q
cd ..

echo "[2/3] Starting FastAPI backend on :8000..."
cd backend
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

sleep 2

echo "[3/3] Starting React frontend..."
cd frontend
npm install --silent
echo ""
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:5173"
echo "  Press Ctrl+C to stop both"
echo ""
npm run dev

# Cleanup
kill $BACKEND_PID 2>/dev/null
