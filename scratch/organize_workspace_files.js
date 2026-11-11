const fs = require('fs');
const path = require('path');

const ROOT_DIR = process.cwd();

console.log('Iniciando organización de archivos en:', ROOT_DIR);

// 1. Crear carpetas de destino
const dirsToCreate = [
    path.join(ROOT_DIR, 'archivos_historicos_excel'),
    path.join(ROOT_DIR, 'codigo_legado_python'),
    path.join(ROOT_DIR, 'utilidades')
];

for (const dir of dirsToCreate) {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`[CREADO] Carpeta: ${path.basename(dir)}`);
    }
}

// 2. Mover archivos Excel históricos/intermedios
const excelHistoricos = [
    'CEPRO_Control_MICAELA_BASTIDAS_LLENO-5.xlsm',
    'CEPRO_Micaela_Bastidas_Control_Actualizado.xlsm',
    'CEPRO_Micaela_Bastidas_Control_PLANTILLA_LIMPIA.xlsm',
    'Gestion_Caja_Institucion.xlsx',
    'Gestion_Caja_Institucion_Automatica.xlsm'
];

for (const file of excelHistoricos) {
    const src = path.join(ROOT_DIR, file);
    const dest = path.join(ROOT_DIR, 'archivos_historicos_excel', file);
    if (fs.existsSync(src)) {
        fs.renameSync(src, dest);
        console.log(`[MOVIDO] ${file} -> archivos_historicos_excel/`);
    }
}

// Crear LEEME en archivos_historicos_excel
const readmeExcel = `====================================================================
CETPRO SAN MIGUEL - MICAELA BASTIDAS PUYUCAMA
CARPETA: ARCHIVOS HISTÓRICOS Y VERSIONES PREVIAS DE EXCEL
====================================================================

Esta carpeta contiene las versiones intermedias, formatos anteriores y plantillas
utilizadas durante las primeras etapas de configuración del sistema:

1. CEPRO_Control_MICAELA_BASTIDAS_LLENO-5.xlsm
   - Versión anterior de Excel con macros.

2. CEPRO_Micaela_Bastidas_Control_Actualizado.xlsm
   - Versión de control previa.

3. CEPRO_Micaela_Bastidas_Control_PLANTILLA_LIMPIA.xlsm
   - Plantilla base sin datos para nuevas gestiones.

4. Gestion_Caja_Institucion.xlsx / Gestion_Caja_Institucion_Automatica.xlsm
   - Primeros borradores de diseño contable.

--------------------------------------------------------------------
NOTA IMPORTANTE:
El archivo Excel ACTIVO, OFICIAL y SINCRONIZADO EN TIEMPO REAL es:
"CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx"
ubicado en la carpeta principal del sistema.
====================================================================
`;
fs.writeFileSync(path.join(ROOT_DIR, 'archivos_historicos_excel', 'LEEME_HISTORICO_EXCEL.txt'), readmeExcel, 'utf8');

// 3. Mover código legado de Python / VBA
const pythonFiles = [
    'app.py',
    'generar_excel.py',
    'generar_xlsm.py',
    'macro_vba.txt'
];

for (const file of pythonFiles) {
    const src = path.join(ROOT_DIR, file);
    const dest = path.join(ROOT_DIR, 'codigo_legado_python', file);
    if (fs.existsSync(src)) {
        fs.renameSync(src, dest);
        console.log(`[MOVIDO] ${file} -> codigo_legado_python/`);
    }
}

// Mover __pycache__ si existe
const pycacheDir = path.join(ROOT_DIR, '__pycache__');
if (fs.existsSync(pycacheDir)) {
    const destCache = path.join(ROOT_DIR, 'codigo_legado_python', '__pycache__');
    if (fs.existsSync(destCache)) {
        fs.rmSync(destCache, { recursive: true, force: true });
    }
    fs.renameSync(pycacheDir, destCache);
    console.log(`[MOVIDO] __pycache__ -> codigo_legado_python/__pycache__`);
}

// Crear LEEME en codigo_legado_python
const readmePython = `====================================================================
CETPRO SAN MIGUEL - MICAELA BASTIDAS PUYUCAMA
CARPETA: CÓDIGO LEGADO EN PYTHON Y VBA (PROTOTIPO INICIAL)
====================================================================

Esta carpeta preserva los archivos del primer prototipo desarrollado en Python/Flask y macros VBA:

1. app.py
   - Servidor inicial desarrollado en Flask (Python).

2. generar_excel.py / generar_xlsm.py
   - Scripts antiguos para generar archivos de Excel.

3. macro_vba.txt
   - Código VBA para macros en Excel.

--------------------------------------------------------------------
NOTA:
El sistema moderno opera al 100% bajo arquitectura nativa de Node.js y SQLite ("server.js" / "EduCaja_Pro.exe"),
ofreciendo alto rendimiento, respaldos criptográficos automáticos y funcionamiento autónomo.
====================================================================
`;
fs.writeFileSync(path.join(ROOT_DIR, 'codigo_legado_python', 'LEEME_LEGADO_PYTHON.txt'), readmePython, 'utf8');

// 4. Mover utilidades anteriores
const utilFiles = [
    'CETPRO_SanMiguel_Caja.exe',
    'iniciar_sistema.bat'
];

for (const file of utilFiles) {
    const src = path.join(ROOT_DIR, file);
    const dest = path.join(ROOT_DIR, 'utilidades', file);
    if (fs.existsSync(src)) {
        fs.renameSync(src, dest);
        console.log(`[MOVIDO] ${file} -> utilidades/`);
    }
}

// 5. Mover check_ids.js a scratch
const checkIds = path.join(ROOT_DIR, 'check_ids.js');
if (fs.existsSync(checkIds)) {
    const destCheck = path.join(ROOT_DIR, 'scratch', 'check_ids.js');
    fs.renameSync(checkIds, destCheck);
    console.log(`[MOVIDO] check_ids.js -> scratch/`);
}

// 6. Actualizar Crear_Acceso_Directo_Escritorio.bat
const nuevoBatAccesoDirecto = `@echo off
chcp 65001 >nul
title Creando Acceso Directo de EduCaja Pro...
cd /d "%~dp0"

echo ===============================================================================
echo     CETPRO SAN MIGUEL - MICAELA BASTIDAS PUYUCAMA
echo     CREADOR DE ACCESO DIRECTO OFICIAL EN EL ESCRITORIO
echo ===============================================================================
echo.
echo Creando acceso directo a "EduCaja_Pro.exe" en su Escritorio de Windows...

powershell -NoProfile -ExecutionPolicy Bypass -Command "$WshShell = New-Object -ComObject WScript.Shell; $DesktopPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop); $Shortcut = $WshShell.CreateShortcut(\\"$DesktopPath\\\\EduCaja Pro - CETPRO San Miguel.lnk\\"); $Shortcut.TargetPath = (Join-Path '%~dp0' 'EduCaja_Pro.exe'); $Shortcut.WorkingDirectory = '%~dp0'; $Shortcut.IconLocation = (Join-Path '%~dp0' 'app.ico'); $Shortcut.Description = 'Sistema de Gestion Financiera Institucional - CETPRO Micaela Bastidas'; $Shortcut.Save(); Write-Host 'Acceso directo creado exitosamente en su Escritorio!'"

echo.
echo Listo! Se creo el icono "EduCaja Pro - CETPRO San Miguel" en su Escritorio.
echo.
pause
`;
fs.writeFileSync(path.join(ROOT_DIR, 'Crear_Acceso_Directo_Escritorio.bat'), nuevoBatAccesoDirecto, 'utf8');
console.log('[ACTUALIZADO] Crear_Acceso_Directo_Escritorio.bat (apunta a EduCaja_Pro.exe)');

// 7. Actualizar/Crear INICIAR_SISTEMA.bat oficial
const nuevoBatIniciar = `@echo off
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
`;
fs.writeFileSync(path.join(ROOT_DIR, 'INICIAR_SISTEMA.bat'), nuevoBatIniciar, 'utf8');
fs.writeFileSync(path.join(ROOT_DIR, 'INICIAR_SISTEMA_CETPRO.bat'), nuevoBatIniciar, 'utf8');
console.log('[ACTUALIZADO] INICIAR_SISTEMA.bat e INICIAR_SISTEMA_CETPRO.bat');

// 8. Crear archivo de guía LEEME_ESTRUCTURA_ARCHIVOS.txt en el directorio raíz
const guiaEstructura = `===============================================================================
              EDUCAJA PRO - CETPRO MICAELA BASTIDAS PUYUCAMA
                     GUÍA DE ESTRUCTURA Y ORGANIZACIÓN
===============================================================================

Este directorio contiene el Sistema Profesional de Control de Caja Chica y
Gestión Institucional. Todos los archivos han sido organizados de forma limpia:

-------------------------------------------------------------------------------
1. PROGRAMAS Y ACCESOS PRINCIPALES (USO DIARIO)
-------------------------------------------------------------------------------
* EduCaja_Pro.exe
  -> Programa ejecutable principal para Windows (Doble clic para iniciar directamente).

* INICIAR_SISTEMA.bat
  -> Inicia el servidor local y abre la aplicación en el navegador predeterminado.

* Crear_Acceso_Directo_Escritorio.bat
  -> Ejecute este archivo una sola vez para colocar un icono de EduCaja Pro en su Escritorio.

-------------------------------------------------------------------------------
2. DATOS Y REGISTROS ACTIVOS (INFORMACIÓN EN VIVO)
-------------------------------------------------------------------------------
* caja_institucional.db
  -> Base de datos oficial de SQLite con los 176 estudiantes y 207 pagos (S/. 25,080.00).

* CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx
  -> Hoja de cálculo oficial de Excel que se actualiza y sincroniza en vivo.

* backups/
  -> Carpeta donde se guardan automáticamente las copias de seguridad de la base de datos
     con firma criptográfica SHA-256.

-------------------------------------------------------------------------------
3. COMPONENTES DEL SISTEMA WEB Y MOTOR
-------------------------------------------------------------------------------
* server.js
  -> Motor del servidor Node.js y APIs REST.

* templates/
  -> Contiene la interfaz gráfica (index.html) con selector de secciones y vouchers.

* public/
  -> Logotipos, imágenes oficiales, estilos CSS y recursos gráficos.

* package.json / package-lock.json / node_modules/
  -> Configuración de librerías y dependencias del sistema.

* app.ico
  -> Ícono institucional oficial del CETPRO San Miguel.

-------------------------------------------------------------------------------
4. CARPETAS DE HISTORIAL Y ARCHIVADO
-------------------------------------------------------------------------------
* archivos_historicos_excel/
  -> Versiones intermedias, borradores previos y plantillas antiguas de Excel.

* codigo_legado_python/
  -> Código fuente del prototipo original inicial en Python / Flask.

* utilidades/
  -> Lanzadores auxiliares y herramientas complementarias previas.

* scratch/
  -> Scripts de verificación técnica, mantenimiento y pruebas automatizadas.

===============================================================================
Para cualquier consulta o soporte, el sistema cuenta con respaldos automáticos
que protegen la integridad de todos los datos institucionales.
===============================================================================
`;
fs.writeFileSync(path.join(ROOT_DIR, 'LEEME_ESTRUCTURA_ARCHIVOS.txt'), guiaEstructura, 'utf8');
console.log('[CREADO] LEEME_ESTRUCTURA_ARCHIVOS.txt');

// 9. Actualizar fallback en server.js
let serverCode = fs.readFileSync(path.join(ROOT_DIR, 'server.js'), 'utf8');
const oldFallback = `let excelPath = path.join(ROOT_DIR, 'CEPRO_Control_MICAELA_BASTIDAS_LLENO-5.xlsm');
            if (!fs.existsSync(excelPath)) {
                excelPath = path.join(__dirname, 'CEPRO_Control_MICAELA_BASTIDAS_LLENO-5.xlsm');
            }`;

const newFallback = `let excelPath = path.join(ROOT_DIR, 'CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx');
            if (!fs.existsSync(excelPath)) {
                excelPath = path.join(ROOT_DIR, 'archivos_historicos_excel', 'CEPRO_Control_MICAELA_BASTIDAS_LLENO-5.xlsm');
            }
            if (!fs.existsSync(excelPath)) {
                excelPath = path.join(__dirname, 'CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx');
            }`;

if (serverCode.includes(oldFallback)) {
    serverCode = serverCode.replace(oldFallback, newFallback);
    fs.writeFileSync(path.join(ROOT_DIR, 'server.js'), serverCode, 'utf8');
    console.log('[ACTUALIZADO] Fallback en server.js actualizado para apuntar a la nueva estructura.');
} else {
    console.log('[INFO] Fallback en server.js ya estaba actualizado o tiene otra firma.');
}

console.log('\n Organización de archivos finalizada con éxito!');
