const fs = require('fs');
const path = require('path');

// 1. Limpiar archivos .csv y .csv.sha256 de la carpeta backups
const backupsDir = path.join(__dirname, '..', 'backups');
const filesInBackups = fs.readdirSync(backupsDir);
let deletedCount = 0;

for (const f of filesInBackups) {
    if (f.endsWith('.csv') || f.endsWith('.csv.sha256')) {
        fs.unlinkSync(path.join(backupsDir, f));
        deletedCount++;
    }
}
console.log(`[1] Limpieza de backups: ${deletedCount} archivos .csv eliminados de backups/. Solo quedan copias de seguridad de datos (.db).`);

// 2. Actualizar server.js
const serverPath = path.join(__dirname, '..', 'server.js');
let serverCode = fs.readFileSync(serverPath, 'utf-8');

// Reemplazar generarRespaldoCompleto
const startFuncMarker = 'function generarRespaldoCompleto(motivo = "Exportacion") {';
const endFuncMarker = '// Generador dinámico del Libro Excel (.xlsx) Multi-Hoja Oficial CETPRO';

const idxStart = serverCode.indexOf(startFuncMarker);
const idxEnd = serverCode.indexOf(endFuncMarker);

if (idxStart !== -1 && idxEnd !== -1) {
    const nuevaFunc = `function generarRespaldoCompleto(motivo = "Exportacion") {
    const ahora = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timestamp = \`\${ahora.getFullYear()}-\${pad(ahora.getMonth() + 1)}-\${pad(ahora.getDate())}_\${pad(ahora.getHours())}-\${pad(ahora.getMinutes())}-\${pad(ahora.getSeconds())}\`;
    
    // 1. Copia de Seguridad de los Datos del Sistema (SQLite .db con firma criptográfica SHA-256)
    const dbFileName = \`Respaldo_\${motivo}_CETPRO_\${timestamp}.db\`;
    const dbDest = path.join(BACKUPS_DIR, dbFileName);
    fs.copyFileSync(DB_PATH, dbDest);
    const dbHash = calcSHA256(dbDest);
    fs.writeFileSync(\`\${dbDest}.sha256\`, \`\${dbHash} *\${dbFileName}\\nFecha: \${ahora.toISOString()}\\nSeguridad: SHA-256 Verificado\`);

    // 2. Llenar y sincronizar automáticamente el Libro Excel Oficial (.xlsx) con todos los datos en disco
    guardarLibroExcelEnDisco();

    const dbStat = fs.statSync(dbDest);
    return {
        timestamp,
        dbFile: dbFileName,
        dbSize: dbStat.size,
        sha256_db: dbHash
    };
}\n\n`;

    serverCode = serverCode.substring(0, idxStart) + nuevaFunc + serverCode.substring(idxEnd);
    console.log('[2] generarRespaldoCompleto actualizado en server.js.');
}

// Filtrar en GET /api/backups para que solo devuelva archivos .db
const oldBackupLoop = "if (file.endsWith('.sha256')) continue;";
const newBackupLoop = "if (file.endsWith('.sha256')) continue;\n                const ext = path.extname(file).toLowerCase();\n                if (ext !== '.db') continue;";

if (serverCode.includes(oldBackupLoop) && !serverCode.includes("if (ext !== '.db') continue;")) {
    serverCode = serverCode.replace(oldBackupLoop, newBackupLoop);
    console.log('[3] GET /api/backups actualizado para listar solo .db.');
}

// Actualizar POST /api/backups/crear mensaje
serverCode = serverCode.replace(
    'message: `Respaldo seguro creado exitosamente: ${result.dbFile} y ${result.csvFile}`,',
    'message: `Copia de seguridad del sistema (${result.dbFile}) creada exitosamente y libro Excel llenado en disco.`, \n                archivo: result.dbFile,'
);

fs.writeFileSync(serverPath, serverCode, 'utf-8');
console.log('[4] server.js guardado exitosamente.');

// 3. Actualizar templates/index.html
const htmlPath = path.join(__dirname, '..', 'templates', 'index.html');
let htmlCode = fs.readFileSync(htmlPath, 'utf-8');

// Actualizar textos de banner y KPI en section-respaldos
htmlCode = htmlCode.replace(
    '<span>Crear Respaldo Ahora (.db y .csv)</span>',
    '<span>🛡️ Crear Copia de Seguridad (.db)</span>'
);

htmlCode = htmlCode.replace(
    '<p class="text-[11px] text-sky-600 font-semibold mt-0.5">Archivos .db y .csv protegidos</p>',
    '<p class="text-[11px] text-emerald-600 font-semibold mt-0.5">Base de Datos (.db) con firma SHA-256</p>'
);

htmlCode = htmlCode.replace(
    'Se genera un respaldo automático protegido cada vez que exportas la BD. Puedes descargarlos o eliminarlos cuando ya no los necesites.',
    'Copia de seguridad física de los datos del sistema (.db) y sincronización del libro Excel institucional (.xlsx) con todos los registros llenos.'
);

// Añadir botón de descargar Excel Lleno en el banner de respaldos si no está
const oldBannerButtons = `<div class="flex items-center space-x-3">
                        <button onclick="crearRespaldoManual()" class="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-teal-500/30 transition">
                            <i class="fa-solid fa-plus-circle"></i>
                            <span>🛡️ Crear Copia de Seguridad (.db)</span>
                        </button>
                    </div>`;

const newBannerButtons = `<div class="flex items-center space-x-3">
                        <button onclick="crearRespaldoManual()" class="bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-teal-500/30 transition">
                            <i class="fa-solid fa-shield-halved"></i>
                            <span>🛡️ Crear Copia de Seguridad (.db)</span>
                        </button>
                        <a href="/api/exportar/excel" download="CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx" class="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-emerald-600/30 transition" title="Descargar libro Excel multi-hoja con todos los datos llenos">
                            <i class="fa-solid fa-file-excel"></i>
                            <span>📊 Descargar Excel Lleno (.xlsx)</span>
                        </a>
                    </div>`;

if (htmlCode.includes(oldBannerButtons)) {
    htmlCode = htmlCode.replace(oldBannerButtons, newBannerButtons);
    console.log('[5] Botón de Descargar Excel Lleno añadido al banner de respaldos.');
}

// Actualizar texto de alerta al crear respaldo manual
htmlCode = htmlCode.replace(
    'alert(`✅ Respaldo creado exitosamente en la carpeta /backups.\\nArchivos guardados en el servidor: .db y .csv`);',
    'alert(`✅ Copia de seguridad del sistema (.db) creada exitosamente en /backups con firma SHA-256.\\n\\nEl libro Excel oficial también se ha sincronizado y llenado en disco (.xlsx).`);'
);

fs.writeFileSync(htmlPath, htmlCode, 'utf-8');
console.log('[6] templates/index.html actualizado exitosamente.');
