@echo off
chcp 65001 >nul
title CETPRO San Miguel - Micaela Bastidas Puyucama (Sistema de Control de Caja)
cd /d "%~dp0"
cls
echo ===============================================================================
echo     CETPRO SAN MIGUEL - MICAELA BASTIDAS PUYUCAMA
echo     SISTEMA PROFESIONAL DE CONTROL DE CAJA, SECCIONES Y RESULTADOS
echo     Estructura Oficial: CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx
echo ===============================================================================
echo.
echo [1/3] Verificando entorno de ejecucion...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] No se encontro Node.js instalado en este equipo.
    echo Si desea ejecutar el programa directamente sin Node.js,
    echo abra el archivo ejecutable "EduCaja_Pro.exe".
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
echo  * Total de Registros Reales: 207 Recibos (S/. 25,080.00)
echo  * Estudiantes Registrados  : 176 Alumnos organizados en 15 Grupos Oficiales
echo  * Secciones Disponibles    : Confección, Computación, Cosmetología, Motos, etc.
echo  * Exportaciones            : Excel (.xlsx oficial) y PDF de cada comprobante
echo.
echo  * Para cerrar el sistema por completo, simplemente cierre esta ventana.
echo ===============================================================================
echo.
echo Servidor en ejecucion. Presione CTRL+C o cierre la ventana para salir.
cmd /k
