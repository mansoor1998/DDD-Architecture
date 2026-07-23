# Start Backend in a new window
Write-Host "Starting Backend..." -ForegroundColor Green
$backendCommand = "uvicorn app.main:app --reload"
if (Test-Path "env\Scripts\Activate.ps1") {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\env\Scripts\Activate.ps1; $backendCommand"
} else {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; $backendCommand"
}

# Start Frontend in a new window
Write-Host "Starting Frontend..." -ForegroundColor Cyan
if (Test-Path "frontend\vite-project") {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend\vite-project'; if (-not (Test-Path 'node_modules')) { npm install }; npm run dev"
} else {
    Write-Host "Error: frontend\vite-project directory not found." -ForegroundColor Red
}
