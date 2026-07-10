@echo off
cd /d "%~dp0"

echo Starting Nada English Academy...

where py >nul 2>nul
if %errorlevel%==0 (
    start "Nada Server" /min cmd /k "py -m http.server 8000"
    timeout /t 2 /nobreak >nul
    start "" "http://localhost:8000/index.html"
    exit /b
)

where python >nul 2>nul
if %errorlevel%==0 (
    start "Nada Server" /min cmd /k "python -m http.server 8000"
    timeout /t 2 /nobreak >nul
    start "" "http://localhost:8000/index.html"
    exit /b
)

echo Python is not installed.
echo Install Python, then run this file again.
pause
