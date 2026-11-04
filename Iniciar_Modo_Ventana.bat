@echo off
set "APP_PATH=%~dp0ABRIR_PROGRAMA.html"
set "APP_URL=file:///%APP_PATH:\=/%"

:: 1. Intentar abrir en modo ventana de escritorio nativa con Microsoft Edge (incluido en Windows)
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app="%APP_URL%" --window-size=1360,860
    exit /b
)
if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --app="%APP_URL%" --window-size=1360,860
    exit /b
)

:: 2. Intentar con Google Chrome en modo ventana de escritorio
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app="%APP_URL%" --window-size=1360,860
    exit /b
)
if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --app="%APP_URL%" --window-size=1360,860
    exit /b
)

:: 3. Respaldo universal: abrir en el navegador predeterminado del sistema
start "" "%APP_PATH%"
