@echo off
title NP Construction - Server
color 0A
:start
echo.
echo  ==========================================
echo   NP Construction Server
echo   http://localhost:5000
echo   Press Ctrl+C to stop
echo  ==========================================
echo.
cd /d "%~dp0server"
node server.js
echo.
echo  Server stopped. Restarting in 3 seconds...
timeout /t 3 /nobreak >nul
goto start
