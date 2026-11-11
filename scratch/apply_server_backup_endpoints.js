const fs = require('fs');
const path = require('path');

const serverFile = path.join(__dirname, '..', 'server.js');
let code = fs.readFileSync(serverFile, 'utf8');

const anchor = `        // Restaurar base de datos desde un respaldo .db`;

const newEndpoints = `        // -------------------------------------------------------------
        // ENDPOINTS DE RESPALDO UNIFICADO (2 VERSIONES + REESTABLECER)
        // -------------------------------------------------------------
        // 1. Descargar Versión 1: Base de Datos (.db) para guardar y reestablecer
        if (pathname === '/api/backups/descargar-version/db' && method === 'GET') {
            if (fs.existsSync(DB_PATH)) {
                const stat = fs.statSync(DB_PATH);
                res.writeHead(200, {
                    'Content-Type': 'application/octet-stream',
                    'Content-Length': stat.size,
                    'Content-Disposition': 'attachment; filename="Respaldo_CETPRO_SanMiguel_BD.db"'
                });
                fs.createReadStream(DB_PATH).pipe(res);
                return;
            } else {
                sendJSON(res, { error: "Base de datos no encontrada" }, 404);
                return;
            }
        }

        // 2. Descargar Versión 2: Libro Excel (.xlsx) oficial actualizado
        if (pathname === '/api/backups/descargar-version/excel' && method === 'GET') {
            const wb = generarLibroExcelActualizado();
            if (wb && XLSX) {
                const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
                res.writeHead(200, {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Length': buf.length,
                    'Content-Disposition': 'attachment; filename="Respaldo_CETPRO_SanMiguel_Excel.xlsx"'
                });
                res.end(buf);
                return;
            } else {
                sendJSON(res, { error: "No se pudo generar el archivo Excel de respaldo." }, 500);
                return;
            }
        }

        // 3. Descargar Paquete 2 en 1 (.zip) con ambas versiones
        if (pathname === '/api/backups/descargar-version/zip' && method === 'GET') {
            try {
                if (!AdmZip) AdmZip = require('adm-zip');
                const zip = new AdmZip();
                
                if (fs.existsSync(DB_PATH)) {
                    zip.addLocalFile(DB_PATH, '', 'Respaldo_CETPRO_SanMiguel_BD.db');
                }

                const wb = generarLibroExcelActualizado();
                if (wb && XLSX) {
                    const excelBuf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
                    zip.addFile('Respaldo_CETPRO_SanMiguel_Excel.xlsx', excelBuf);
                }

                const txtInfo = \`CETPRO SAN MIGUEL - MICAELA BASTIDAS PUYUCAMA
COPIA DE SEGURIDAD OFICIAL DEL SISTEMA
Generado: \${new Date().toLocaleString('es-PE')}

CONTENIDO DEL PAQUETE (2 VERSIONES):
1. Respaldo_CETPRO_SanMiguel_BD.db
   -> Archivo maestro de Base de Datos SQLite.
   -> Utilice este archivo para REESTABLECER todo el sistema en caso de cualquier contingencia.
   
2. Respaldo_CETPRO_SanMiguel_Excel.xlsx
   -> Libro de Calculo Oficial con las 12 hojas institucionales para Microsoft Excel.

INSTRUCCIONES DE RESTABLECIMIENTO:
1. Ingrese al sistema Educaja Pro (http://127.0.0.1:5000).
2. Vaya a la seccion BACKUP BD en la barra lateral izquierda.
3. En la seccion "Reestablecer Sistema", seleccione el archivo Respaldo_CETPRO_SanMiguel_BD.db (o este .zip).
4. Haga clic en "Reestablecer Sistema Ahora".\`;
                zip.addFile('INSTRUCCIONES_DE_RESPALDO.txt', Buffer.from(txtInfo, 'utf8'));

                const zipBuf = zip.toBuffer();
                res.writeHead(200, {
                    'Content-Type': 'application/zip',
                    'Content-Length': zipBuf.length,
                    'Content-Disposition': 'attachment; filename="Respaldo_CETPRO_SanMiguel_Completo.zip"'
                });
                res.end(zipBuf);
                return;
            } catch (zipErr) {
                console.error("Error generando paquete zip:", zipErr);
                sendJSON(res, { error: "Error al empaquetar respaldo zip: " + zipErr.message }, 500);
                return;
            }
        }

        // 4. Estado y métricas del respaldo oficial en tiempo real
        if (pathname === '/api/backups/estado-actual' && method === 'GET') {
            try {
                const dbStat = fs.existsSync(DB_PATH) ? fs.statSync(DB_PATH) : null;
                const dbSizeKB = dbStat ? Math.round((dbStat.size / 1024) * 10) / 10 : 0;
                const dbSha = dbStat ? calcSHA256(DB_PATH) : null;

                const countEst = db.prepare("SELECT count(*) as c FROM estudiantes").get().c;
                const countMov = db.prepare("SELECT count(*) as c FROM movimientos").get().c;
                const sumIng = db.prepare("SELECT coalesce(sum(monto), 0) as s FROM movimientos WHERE tipo = 'Ingreso' AND estado = 'Pagado'").get().s;
                const countDoc = db.prepare("SELECT count(*) as c FROM docentes").get().c;

                // Ultimo backup en la carpeta
                const files = fs.readdirSync(BACKUPS_DIR).filter(f => f.endsWith('.db'));
                let ultimoBackup = null;
                if (files.length > 0) {
                    files.sort((a, b) => {
                        return fs.statSync(path.join(BACKUPS_DIR, b)).mtimeMs - fs.statSync(path.join(BACKUPS_DIR, a)).mtimeMs;
                    });
                    const ultStat = fs.statSync(path.join(BACKUPS_DIR, files[0]));
                    ultimoBackup = {
                        nombre: files[0],
                        fecha: ultStat.mtime.toLocaleString('es-PE'),
                        tamano: (Math.round((ultStat.size / 1024) * 10) / 10) + ' KB'
                    };
                }

                sendJSON(res, {
                    db: {
                        nombre: 'Respaldo_CETPRO_SanMiguel_BD.db',
                        tamano: dbSizeKB > 1024 ? \`\${(dbSizeKB / 1024).toFixed(2)} MB\` : \`\${dbSizeKB} KB\`,
                        bytes: dbStat ? dbStat.size : 0,
                        fecha_modificacion: dbStat ? dbStat.mtime.toLocaleString('es-PE') : '--',
                        sha256: dbSha
                    },
                    excel: {
                        nombre: 'Respaldo_CETPRO_SanMiguel_Excel.xlsx',
                        hojas: 12
                    },
                    stats: {
                        estudiantes: countEst,
                        movimientos: countMov,
                        docentes: countDoc,
                        total_ingresos: sumIng
                    },
                    ultimo_respaldo_seguridad: ultimoBackup
                });
                return;
            } catch (err) {
                console.error("Error al obtener estado actual:", err);
                sendJSON(res, { error: err.message }, 500);
                return;
            }
        }

        // 5. Reestablecer sistema desde archivo subido (.db o .zip) por el usuario
        if (pathname === '/api/backups/restablecer-archivo' && method === 'POST') {
            let tempPath = null;
            try {
                const rawBuffer = await readRawBody(req);
                if (!rawBuffer || rawBuffer.length === 0) {
                    sendJSON(res, { error: "No se recibieron datos de archivo." }, 400);
                    return;
                }

                let fileBuffer = null;
                let fileName = 'respaldo_subido.db';

                const contentType = req.headers['content-type'] || '';
                if (contentType.includes('application/json')) {
                    const parsed = JSON.parse(rawBuffer.toString('utf8'));
                    if (!parsed.fileBase64) {
                        sendJSON(res, { error: "Datos de archivo base64 no proporcionados." }, 400);
                        return;
                    }
                    fileBuffer = Buffer.from(parsed.fileBase64, 'base64');
                    if (parsed.fileName) fileName = parsed.fileName;
                } else {
                    fileBuffer = rawBuffer;
                    if (req.headers['x-file-name']) {
                        fileName = decodeURIComponent(req.headers['x-file-name']);
                    }
                }

                // Si es un archivo ZIP, extraer el archivo .db
                if (fileName.toLowerCase().endsWith('.zip') || (fileBuffer.length > 4 && fileBuffer[0] === 0x50 && fileBuffer[1] === 0x4B)) {
                    if (!AdmZip) AdmZip = require('adm-zip');
                    const zip = new AdmZip(fileBuffer);
                    const dbEntry = zip.getEntries().find(e => e.entryName.toLowerCase().endsWith('.db'));
                    if (!dbEntry) {
                        sendJSON(res, { error: "El archivo ZIP cargado no contiene ningún archivo de base de datos (.db)." }, 400);
                        return;
                    }
                    fileBuffer = dbEntry.getData();
                    fileName = dbEntry.entryName;
                }

                // Guardar en archivo temporal para verificar antes de sobreescribir la BD activa
                tempPath = path.join(BACKUPS_DIR, \`temp_verify_\${Date.now()}.db\`);
                fs.writeFileSync(tempPath, fileBuffer);

                // Verificación de integridad SQLite
                const testDb = new DatabaseSync(tempPath);
                const integrity = testDb.prepare("PRAGMA integrity_check").get();
                if (!integrity || integrity.integrity_check !== 'ok') {
                    testDb.close();
                    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
                    sendJSON(res, { error: "El archivo seleccionado no es una base de datos SQLite válida o está dañado." }, 400);
                    return;
                }

                // Verificar que tenga las tablas institucionales requeridas
                const tables = testDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(r => r.name);
                if (!tables.includes('estudiantes') || !tables.includes('movimientos')) {
                    testDb.close();
                    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
                    sendJSON(res, { error: "El archivo no corresponde al sistema Educaja Pro CETPRO (faltan tablas 'estudiantes' o 'movimientos')." }, 400);
                    return;
                }

                const countEst = testDb.prepare("SELECT count(*) as c FROM estudiantes").get().c;
                const countMov = testDb.prepare("SELECT count(*) as c FROM movimientos").get().c;
                const sumIng = testDb.prepare("SELECT coalesce(sum(monto), 0) as s FROM movimientos WHERE tipo = 'Ingreso' AND estado = 'Pagado'").get().s;
                const countDoc = tables.includes('docentes') ? testDb.prepare("SELECT count(*) as c FROM docentes").get().c : 0;
                testDb.close();

                // 1. Resguardo de seguridad preventivo antes de sobrescribir
                generarRespaldoCompleto("Pre_Restablecimiento");

                // 2. Cerrar base de datos activa
                db.close();

                // 3. Sobrescribir archivo de base de datos
                fs.copyFileSync(tempPath, DB_PATH);
                if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);

                // 4. Reabrir base de datos
                db = new DatabaseSync(DB_PATH);

                // 5. Actualizar libro Excel en disco
                guardarLibroExcelEnDisco();

                console.log(\`[RESTABLECIMIENTO EXITOSO] Desde: \${fileName} | Estudiantes: \${countEst} | Movimientos: \${countMov} | Ingresos: S/. \${sumIng}\`);

                sendJSON(res, {
                    success: true,
                    message: \`¡Sistema reestablecido exitosamente desde el archivo "\${fileName}"!\`,
                    stats: {
                        estudiantes: countEst,
                        movimientos: countMov,
                        docentes: countDoc,
                        total_ingresos: sumIng
                    }
                });
                return;
            } catch (restErr) {
                if (tempPath && fs.existsSync(tempPath)) {
                    try { fs.unlinkSync(tempPath); } catch(e) {}
                }
                try { db = new DatabaseSync(DB_PATH); } catch(e) {}
                console.error("Error al reestablecer archivo:", restErr);
                sendJSON(res, { error: "Error durante el reestablecimiento: " + restErr.message }, 500);
                return;
            }
        }

`;

if (!code.includes('/api/backups/descargar-version/db')) {
    code = code.replace(anchor, newEndpoints + anchor);
    fs.writeFileSync(serverFile, code, 'utf8');
    console.log('✅ Endpoints agregados a server.js exitosamente!');
} else {
    console.log('Los endpoints ya existían en server.js');
}
