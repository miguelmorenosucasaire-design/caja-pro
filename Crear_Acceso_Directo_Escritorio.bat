@echo off
chcp 65001 >nul
title Creando Acceso Directo de EduCaja Pro...
cd /d "%~dp0"

echo ===============================================================================
echo     CETPRO SAN MIGUEL - MICAELA BASTIDAS PUYUCAMA
echo     CREADOR DE ACCESO DIRECTO OFICIAL EN EL ESCRITORIO
echo ===============================================================================
echo.
echo Creando acceso directo a "EduCaja_Pro.exe" en su Escritorio de Windows...

powershell -NoProfile -ExecutionPolicy Bypass -Command "$WshShell = New-Object -ComObject WScript.Shell; $DesktopPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop); $Shortcut = $WshShell.CreateShortcut(\"$DesktopPath\\EduCaja Pro - CETPRO San Miguel.lnk\"); $Shortcut.TargetPath = (Join-Path '%~dp0' 'EduCaja_Pro.exe'); $Shortcut.WorkingDirectory = '%~dp0'; $Shortcut.IconLocation = (Join-Path '%~dp0' 'app.ico'); $Shortcut.Description = 'Sistema de Gestion Financiera Institucional - CETPRO Micaela Bastidas'; $Shortcut.Save(); Write-Host 'Acceso directo creado exitosamente en su Escritorio!'"

echo.
echo Listo! Se creo el icono "EduCaja Pro - CETPRO San Miguel" en su Escritorio.
echo.
pause
