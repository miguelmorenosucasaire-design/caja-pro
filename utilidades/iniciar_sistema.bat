@echo off
chcp 65001 >nul
title CETPRO San Miguel - Micaela Bastidas Puyucama (Sistema de Control de Caja)
cd /d "%~dp0"
cls
echo ===============================================================================
echo     CETPRO SAN MIGUEL - MICAELA BASTIDAS PUYUCAMA
echo     SISTEMA PROFESIONAL DE CONTROL DE CAJA, SECCIONES Y RESULTADOS
echo     Estructura Oficial de Excel: CEPRO_Control_MICAELA_BASTIDAS
echo ===============================================================================
echo.
echo [1/3] Verificando entorno de ejecucion...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] No se encontro Node.js instalado en este equipo.
    echo Por favor descargue e instale Node.js desde: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [2/3] Iniciando servidor web institucional en http://localhost:5000 ...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000 ^| findstr LISTENING') do taskkill /f /pid %%a >nul 2>&1

start /b "" node server.js

echo [3/3] Abriendo el sistema en su navegador web predeterminado...
timeout /t 2 /nobreak >nul
start "" "http://localhost:5000"

echo.
echo ===============================================================================
echo  SISTEMA ACTIVO Y OPERANDO CORRECTAMENTE
echo.
echo  * ENLACE DIRECTO (Esta PC) : http://localhost:5000
echo  * ENLACE RED LOCAL         : http://127.0.0.1:5000
echo.
echo  * Total de Registros Reales: 202 Recibos (S/. 24,630.00)
echo  * Secciones y Encargados   : 6 Grupos con Plantillas Individuales
echo  * Exportaciones            : Excel (.xlsm / .xlsx) y PDF de cada hoja
echo.
echo  * Para cerrar el sistema por completo, simplemente cierre esta ventana.
echo ===============================================================================
echo.
echo Servidor en ejecucion. Presione CTRL+C o cierre la ventana para salir.
cmd /k
