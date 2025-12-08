@echo off
title CRYPTO PROJECT SERVER
color 0A

:menu
cls
echo.
echo ========================================
echo        CRYPTO PROJECT SERVER
echo ========================================
echo.
echo   [1] Server Baslat
echo   [2] Server Durdur
echo   [3] Paketleri Guncelle
echo   [4] Cikis
echo.
set /p choice="Seciminiz (1-4): "

if "%choice%"=="1" goto start_server
if "%choice%"=="2" goto stop_server
if "%choice%"=="3" goto update_packages
if "%choice%"=="4" exit

echo Gecersiz secim! Tekrar deneyin.
timeout /t 2 >nul
goto menu

:start_server
echo.
echo Server baslatiliyor...
echo Browser'da acmak icin: http://127.0.0.1:5000
echo.
cd /d "%~dp0"
.\venv\Scripts\python.exe routes\server.py
pause
goto menu

:stop_server
echo.
echo Server durduruluyor...
taskkill /F /IM python.exe 2>nul
echo Server durduruldu.
pause
goto menu

:update_packages
echo.
echo Paketler guncelleniyor...
.\venv\Scripts\python.exe -m pip install --upgrade pip
.\venv\Scripts\python.exe -m pip install -r requirements.txt
echo.
echo Guncelleme tamamlandi!
pause
goto menu