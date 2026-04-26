@echo off
echo ============================================
echo   ANKAN Garments AI — React Edition
echo   Backend: FastAPI  |  Frontend: React
echo ============================================
echo.

echo [1/3] Installing backend dependencies...
cd backend
pip install -r requirements.txt --quiet
echo.

echo [2/3] Starting FastAPI backend on port 8000...
start "ANKAN Backend" cmd /k "uvicorn main:app --reload --port 8000"
cd ..

echo [3/3] Installing and starting React frontend...
cd frontend
call npm install --silent
echo.
echo  Backend:  http://localhost:8000
echo  Frontend: http://localhost:5173
echo  Press Ctrl+C in each window to stop
echo.
call npm run dev

pause
