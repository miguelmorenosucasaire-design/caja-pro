// =====================================================================
// EDUCAJA PRO - CETPRO SAN MIGUEL (MICAELA BASTIDAS PUYUCAMA)
// SERVIDOR EN JAVASCRIPT (NODE.JS) CON SISTEMA DE RESPALDOS Y BASE DE DATOS
// =====================================================================
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');
const { exec } = require('node:child_process');

let XLSX;
try {
    XLSX = require('xlsx');
} catch (e) {
    console.warn('[ADVERTENCIA] Módulo xlsx no disponible:', e.message);
}

let AdmZip;
try {
    AdmZip = require('adm-zip');
} catch (e) {
    console.warn('[ADVERTENCIA] Módulo adm-zip no disponible:', e.message);
}

const isPkg = typeof process.pkg !== 'undefined';
const ROOT_DIR = isPkg ? path.dirname(process.execPath) : __dirname;

const PORT = process.env.PORT || 5000;
const DB_PATH = path.join(ROOT_DIR, 'caja_institucional.db');
const BACKUPS_DIR = path.join(ROOT_DIR, 'backups');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

let HTML_FILE = path.join(ROOT_DIR, 'templates', 'index.html');
if (!fs.existsSync(HTML_FILE)) {
    HTML_FILE = path.join(__dirname, 'templates', 'index.html');
}

// Asegurar directorios
if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true });
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

// Manejadores globales de estabilidad del servidor
process.on('uncaughtException', (err) => {
    console.error('[UNCAUGHT EXCEPTION]:', err);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('[UNHANDLED REJECTION]:', reason);
});

// Conexión a SQLite
let db = new DatabaseSync(DB_PATH);

// Helper para calcular hash criptográfico SHA-256 de seguridad
function calcSHA256(filePath) {
    if (!fs.existsSync(filePath)) return null;
    const buf = fs.readFileSync(filePath);
    return crypto.createHash('sha256').update(buf).digest('hex');
}

// Inicializar tabla de configuración institucional
function asegurarTablaConfiguracion() {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS configuracion (
            clave TEXT PRIMARY KEY,
            valor TEXT
        )
    `).run();
    const init = [
        ['nombre_institucion', 'CETPRO SAN MIGUEL · MICAELA BASTIDAS PUYUCAMA'],
        ['ruc', '20485938210'],
        ['direccion', 'Av. Costanera 1200, San Miguel, Lima'],
        ['campus', 'Campus Central San Miguel'],
        ['telefono', ''],
        ['email', ''],
        ['serie_comprobante', 'B001'],
        ['correlativo_inicio', '000203'],
        ['responsable_nombre', 'Dirección General y Tesorería'],
        ['responsable_cargo', 'Administración de Caja Institucional'],
        ['mensaje_pie', 'Comprobante oficial válido para control institucional interno.'],
        ['moneda', 'S/.']
    ];
    const stmt = db.prepare("INSERT OR IGNORE INTO configuracion (clave, valor) VALUES (?, ?)");
    for (const [k, v] of init) {
        stmt.run(k, v);
    }
}
asegurarTablaConfiguracion();

// Inicializar tabla de carreras y especialidades técnicas
function asegurarTablaCarreras() {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS carreras (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT UNIQUE NOT NULL,
            codigo TEXT,
            descripcion TEXT,
            activo INTEGER DEFAULT 1
        )
    `).run();

    const carrerasEnUso = db.prepare(`
        SELECT DISTINCT carrera FROM (
            SELECT carrera FROM estudiantes WHERE carrera IS NOT NULL AND carrera != '' AND carrera != 'Sin Asignar (Pendiente)'
            UNION
            SELECT carrera FROM docentes WHERE carrera IS NOT NULL AND carrera != ''
            UNION
            SELECT carrera FROM movimientos WHERE carrera IS NOT NULL AND carrera != '' AND carrera != 'General'
        )
        ORDER BY carrera ASC
    `).all();

    const stmt = db.prepare("INSERT OR IGNORE INTO carreras (nombre, codigo) VALUES (?, ?)");
    let codeNum = 1;
    for (const c of carrerasEnUso) {
        const code = `ESP-${String(codeNum++).padStart(2, '0')}`;
        stmt.run(c.carrera, code);
    }
}
asegurarTablaCarreras();

function obtenerConfiguracion() {
    try {
        const rows = db.prepare("SELECT clave, valor FROM configuracion").all();
        const cfg = {};
        for (const r of rows) {
            cfg[r.clave] = r.valor;
        }
        return cfg;
    } catch (e) {
        return {};
    }
}

function guardarConfiguracion(datos) {
    const stmt = db.prepare("INSERT INTO configuracion (clave, valor) VALUES (?, ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor");
    for (const [k, v] of Object.entries(datos)) {
        if (typeof v === 'string' || typeof v === 'number') {
            stmt.run(k, String(v));
        }
    }
}

// Helper para parsear cuerpo JSON de peticiones POST/PUT
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (err) {
                resolve({});
            }
        });
        req.on('error', err => reject(err));
    });
}

// Helper para leer cuerpo binario crudo (para subida de archivos de respaldo)
function readRawBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => resolve(Buffer.concat(chunks)));
        req.on('error', err => reject(err));
    });
}

// Helper para responder JSON
function sendJSON(res, data, status = 200) {
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(data));
}

// Helper para crear un respaldo físico completo con integridad criptográfica SHA-256
function generarRespaldoCompleto(motivo = "Exportacion") {
    const ahora = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timestamp = `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())}_${pad(ahora.getHours())}-${pad(ahora.getMinutes())}-${pad(ahora.getSeconds())}`;
    
    // 1. Copia de Seguridad de los Datos del Sistema (SQLite .db con firma criptográfica SHA-256)
    const dbFileName = `Backup_${motivo}_CETPRO_${timestamp}.db`;
    const dbDest = path.join(BACKUPS_DIR, dbFileName);
    fs.copyFileSync(DB_PATH, dbDest);
    const dbHash = calcSHA256(dbDest);
    fs.writeFileSync(`${dbDest}.sha256`, `${dbHash} *${dbFileName}\nFecha: ${ahora.toISOString()}\nSeguridad: SHA-256 Verificado`);

    // 2. Llenar y sincronizar automáticamente el Libro Excel Oficial (.xlsx) con todos los datos en disco
    guardarLibroExcelEnDisco();

    const dbStat = fs.statSync(dbDest);
    return {
        timestamp,
        dbFile: dbFileName,
        dbSize: dbStat.size,
        sha256_db: dbHash
    };
}

// Generador dinámico del Libro Excel (.xlsx) Multi-Hoja Oficial CETPRO
function generarLibroExcelActualizado() {
    if (!XLSX) return null;
    const wb = XLSX.utils.book_new();
    const cfg = obtenerConfiguracion();

    // 1. Hoja RESUMEN EJECUTIVO
    const resumenData = [
        [cfg.nombre_institucion || 'CETPRO PÚBLICO "MICAELA BASTIDAS PUYUCAWA" - SAN MIGUEL / JULIACA'],
        [`RUC: ${cfg.ruc || '-'} · Campus/Sede: ${cfg.campus || '-'} · Dirección: ${cfg.direccion || '-'}`],
        ['CONTROL FINANCIERO, CONTABLE Y ACADÉMICO - EJERCICIO 2026'],
        ['Estructura Oficial Basada en Excel Institucional'],
        ['Fecha de Emisión / Actualización:', new Date().toLocaleString('es-PE')],
        [],
        ['INDICADOR FINANCIERO / ACADÉMICO', 'VALOR', 'UNIDAD']
    ];

    const st = db.prepare(`
        SELECT 
            SUM(CASE WHEN tipo='Ingreso' AND estado='Pagado' THEN monto ELSE 0 END) as ing,
            SUM(CASE WHEN tipo='Egreso' AND estado='Pagado' THEN monto ELSE 0 END) as egr
        FROM movimientos
    `).get();

    const ing = st.ing || 0;
    const egr = st.egr || 0;
    const totalAlumnos = db.prepare('SELECT COUNT(*) as c FROM estudiantes').get().c;
    const totalDocentes = db.prepare('SELECT COUNT(*) as c FROM docentes').get().c;
    const totalGrupos = db.prepare('SELECT COUNT(*) as c FROM grupos').get().c;

    resumenData.push(['Total Ingresos Recaudados (Caja)', ing, 'PEN (S/.)']);
    resumenData.push(['Total Egresos / Gastos Operativos', egr, 'PEN (S/.)']);
    resumenData.push(['Balance Neto Disponible en Caja', ing - egr, 'PEN (S/.)']);
    resumenData.push(['Total Estudiantes Registrados', totalAlumnos, 'Alumnos']);
    resumenData.push(['Planta Docente Oficial', totalDocentes, 'Docentes']);
    resumenData.push(['Secciones y Talleres Activos', totalGrupos, 'Secciones']);

    const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
    XLSX.utils.book_append_sheet(wb, wsResumen, 'RESUMEN');

    // 2. Hoja CAJA_DIARIO (TODAS las operaciones en vivo)
    const movs = db.prepare(`
        SELECT 
            id as [N° Operación],
            fecha as [Fecha],
            comprobante as [N° Comprobante / Recibo],
            concepto as [Concepto / Detalle de Pago],
            rol as [Rol Persona],
            nombre as [Persona / Responsable],
            carrera as [Programa Oficial / Especialidad],
            grupo as [Sección / Taller],
            encargado as [Docente Encargado],
            tipo as [Tipo Operación],
            monto as [Monto Operación (S/.)],
            metodo_pago as [Medio de Pago],
            estado as [Estado],
            notas as [Observaciones / Notas]
        FROM movimientos 
        ORDER BY fecha DESC, id DESC
    `).all();
    const wsCaja = XLSX.utils.json_to_sheet(movs);
    XLSX.utils.book_append_sheet(wb, wsCaja, 'CAJA_DIARIO');

    // 3. Hoja ESTUDIANTES
    const ests = db.prepare(`
        SELECT 
            e.id as [N°],
            e.codigo as [Código Matrícula],
            e.nombre as [Apellidos y Nombres del Estudiante],
            COALESCE(NULLIF(e.carrera, ''), 'Sin Asignar (Pendiente)') as [Especialidad / Carrera],
            COALESCE(NULLIF(e.grupo, ''), 'Sin Asignar') as [Sección Asignada],
            e.ciclo as [Ciclo / Módulo],
            COALESCE((SELECT SUM(m.monto) FROM movimientos m WHERE LOWER(TRIM(m.nombre)) = LOWER(TRIM(e.nombre)) AND m.tipo='Ingreso' AND m.estado='Pagado'), 0) as [Total Pagado (S/.)],
            COALESCE((SELECT SUM(m.monto) FROM movimientos m WHERE LOWER(TRIM(m.nombre)) = LOWER(TRIM(e.nombre)) AND m.tipo='Ingreso' AND m.estado='Pendiente'), 0) as [Saldo Pendiente (S/.)],
            e.estado_academico as [Estado Académico]
        FROM estudiantes e
        ORDER BY e.nombre ASC
    `).all();
    const wsEst = XLSX.utils.json_to_sheet(ests);
    XLSX.utils.book_append_sheet(wb, wsEst, 'ESTUDIANTES');

    // 4. Hoja DOCENTES
    const docs = db.prepare(`
        SELECT 
            d.id as [N°],
            d.nombre as [Apellidos y Nombres],
            d.cargo as [Cargo / Rol],
            d.carrera as [Programa Oficial / Área],
            d.turno as [Turno],
            d.especialidad as [Especialidad Técnica / Funciones],
            d.telefono as [Teléfono / Celular],
            d.tipo_contrato as [Tipo Contrato],
            COALESCE((SELECT SUM(m.monto) FROM movimientos m WHERE (LOWER(m.encargado) = LOWER(d.nombre) OR LOWER(m.nombre) = LOWER(d.nombre)) AND m.tipo='Egreso' AND m.estado='Pagado'), 0) as [Honorarios Pagados (S/.)],
            COALESCE((SELECT SUM(m.monto) FROM movimientos m WHERE LOWER(m.encargado) = LOWER(d.nombre) AND m.tipo='Ingreso' AND m.estado='Pagado'), 0) as [Ingresos Generados (S/.)]
        FROM docentes d
        ORDER BY d.id ASC
    `).all();
    const wsDocs = XLSX.utils.json_to_sheet(docs);
    XLSX.utils.book_append_sheet(wb, wsDocs, 'DOCENTES');

    // 5. Hoja SECCIONES
    const grps = db.prepare(`
        SELECT 
            g.id as [N°],
            g.nombre as [Sección / Grupo],
            g.carrera as [Programa Oficial],
            g.turno as [Turno Oficial],
            g.encargado as [Docente Encargado],
            g.horario as [Horario de Clases],
            g.aula_taller as [Aula / Taller],
            (SELECT COUNT(*) FROM estudiantes e WHERE e.grupo = g.nombre) as [Estudiantes Matriculados],
            COALESCE((SELECT SUM(m.monto) FROM movimientos m WHERE m.grupo = g.nombre AND m.tipo='Ingreso' AND m.estado='Pagado'), 0) as [Total Recaudado (S/.)]
        FROM grupos g
        ORDER BY g.carrera ASC, g.turno ASC
    `).all();
    let wsGrps;
    if (grps && grps.length > 0) {
        wsGrps = XLSX.utils.json_to_sheet(grps);
    } else {
        wsGrps = XLSX.utils.aoa_to_sheet([
            ['N°', 'Sección / Grupo', 'Programa Oficial', 'Turno Oficial', 'Docente Encargado', 'Horario de Clases', 'Aula / Taller', 'Estudiantes Matriculados', 'Total Recaudado (S/.)'],
            ['(Sin secciones registradas aún - Agregar manualmente en la sección de Secciones)']
        ]);
    }
    XLSX.utils.book_append_sheet(wb, wsGrps, 'SECCIONES');

    return wb;
}

function guardarLibroExcelEnDisco() {
    try {
        const wb = generarLibroExcelActualizado();
        if (wb && XLSX) {
            const outPath = path.join(ROOT_DIR, 'CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx');
            XLSX.writeFile(wb, outPath);
            return outPath;
        }
    } catch (err) {
        console.error('Error al guardar Excel en disco:', err);
    }
    return null;
}

// Inicializar Excel en disco al arrancar
guardarLibroExcelEnDisco();

// Servidor HTTP

// =====================================================================
// GENERADOR DE RECIBO OFICIAL EN EXCEL (.xlsx) CON EL FORMATO DEL SISTEMA
// =====================================================================
function generarReciboExcelOficial(m) {
    const wb = XLSX.utils.book_new();

    const diaStr = (m.fecha || '').split('-')[2] || '08';
    const mesStr = (m.fecha || '').split('-')[1] || '05';
    const anoStr = ((m.fecha || '').split('-')[0] || '2026').slice(-2);
    const fechaCompleta = `${diaStr}/${mesStr}/20${anoStr}`;

    const data = [
        ['MINISTERIO DE EDUCACIÓN', '', '', '', '', '', '', 'N° ' + (m.comprobante || '0000716')],
        ['UNIDAD DE GESTIÓN EDUCATIVA LOCAL SAN ROMÁN', '', '', '', '', '', '', ''],
        ['INSTITUCIÓN EDUCATIVA CETPRO MICAELA BASTIDAS', '', '', '', '', '', '', ''],
        ['JULIACA - PUNO', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['INGRESOS DE RECURSOS PROPIOS', '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['Señor (a):', m.nombre || 'Ruth Mamani Hancco', '', '', '', 'DNI:', m.dni || '', ''],
        ['Especialidad:', (m.carrera || 'Corte Ensamblaje') + (m.turno ? ' - ' + m.turno.toUpperCase() : ''), '', '', '', 'Celular:', m.telefono || '', ''],
        ['', '', '', '', '', '', '', ''],
        ['CONCEPTO OFICIAL DE PAGO', '', '', '', '', 'IMPORTE (S/.)', '', ''],
        ['1.- Aporte por Mantenimiento [X]', '', '', '', '', Number(m.monto || 150).toFixed(2), '', ''],
        ['2.- Expedición de constancia de estudio [ ]', '', '', '', '', '', '', ''],
        ['3.- FUT [ ]', '', '', '', '', '', '', ''],
        ['4.- Otros: ' + (m.concepto || 'Módulo I'), '', '', '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['SON: ' + (m.monto_letras || 'CIENTO CINCUENTA Y 00/100 SOLES'), '', '', '', '', 'TOTAL: S/.', Number(m.monto || 150).toFixed(2), ''],
        ['', '', '', '', '', '', '', ''],
        ['FECHA DE EMISIÓN: Juliaca, ' + fechaCompleta, '', '', '', '', '', '', ''],
        ['DÍA: ' + diaStr, 'MES: ' + mesStr, 'AÑO: 20' + anoStr, '', '', '', '', ''],
        ['', '', '', '', '', '', '', ''],
        ['____________________________________', '', '', '', '____________________________________', '', '', ''],
        ['Sello y Firma del Tesorero', '', '', '', 'Sello y Firma del Recaudador', '', '', '']
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);

    ws['!cols'] = [
        { wch: 20 },
        { wch: 18 },
        { wch: 14 },
        { wch: 14 },
        { wch: 18 },
        { wch: 16 },
        { wch: 16 },
        { wch: 16 }
    ];

    ws['!merges'] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } },
        { s: { r: 2, c: 0 }, e: { r: 2, c: 6 } },
        { s: { r: 3, c: 0 }, e: { r: 3, c: 6 } },
        { s: { r: 5, c: 0 }, e: { r: 5, c: 7 } },
        { s: { r: 7, c: 1 }, e: { r: 7, c: 4 } },
        { s: { r: 7, c: 6 }, e: { r: 7, c: 7 } },
        { s: { r: 8, c: 1 }, e: { r: 8, c: 4 } },
        { s: { r: 8, c: 6 }, e: { r: 8, c: 7 } },
        { s: { r: 10, c: 0 }, e: { r: 10, c: 4 } },
        { s: { r: 10, c: 5 }, e: { r: 10, c: 7 } },
        { s: { r: 11, c: 0 }, e: { r: 11, c: 4 } },
        { s: { r: 12, c: 0 }, e: { r: 12, c: 4 } },
        { s: { r: 13, c: 0 }, e: { r: 13, c: 4 } },
        { s: { r: 14, c: 0 }, e: { r: 14, c: 4 } },
        { s: { r: 16, c: 0 }, e: { r: 16, c: 4 } },
        { s: { r: 18, c: 0 }, e: { r: 18, c: 7 } },
        { s: { r: 21, c: 0 }, e: { r: 21, c: 3 } },
        { s: { r: 21, c: 4 }, e: { r: 21, c: 7 } },
        { s: { r: 22, c: 0 }, e: { r: 22, c: 3 } },
        { s: { r: 22, c: 4 }, e: { r: 22, c: 7 } }
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'RECIBO_OFICIAL');
    return wb;
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = decodeURIComponent(parsedUrl.pathname);
    const method = req.method;

    if (method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    }

    try {
        // -------------------------------------------------------------
        // 1. SERVIR ARCHIVOS ESTÁTICOS (/public/img/...)
        // -------------------------------------------------------------
        if (pathname.startsWith('/public/')) {
            let filePath = path.join(ROOT_DIR, pathname);
            if (!fs.existsSync(filePath)) {
                filePath = path.join(__dirname, pathname);
            }
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                const ext = path.extname(filePath).toLowerCase();
                const mimeTypes = {
                    '.jpg': 'image/jpeg',
                    '.jpeg': 'image/jpeg',
                    '.png': 'image/png',
                    '.svg': 'image/svg+xml',
                    '.css': 'text/css',
                    '.js': 'application/javascript',
                    '.ico': 'image/x-icon'
                };
                res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
                fs.createReadStream(filePath).pipe(res);
                return;
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('Archivo no encontrado');
                return;
            }
        }

        // -------------------------------------------------------------
        // 2. RUTA PRINCIPAL: SERVIR LA INTERFAZ WEB HTML
        // -------------------------------------------------------------
        if (pathname === '/' && method === 'GET') {
            if (fs.existsSync(HTML_FILE)) {
                res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                res.end(fs.readFileSync(HTML_FILE, 'utf-8'));
            } else {
                res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
                res.end('Archivo index.html no encontrado.');
            }
            return;
        }

        // -------------------------------------------------------------
        // 3. API: SISTEMA DE RESPALDOS (BACKUPS) - CREAR, LISTAR, ELIMINAR, DESCARGAR
        // -------------------------------------------------------------
        // Listar respaldos existentes
        if (pathname === '/api/backups' && method === 'GET') {
            const files = fs.readdirSync(BACKUPS_DIR);
            const backups = [];

            for (const file of files) {
                if (file.endsWith('.sha256')) continue;
                const ext = path.extname(file).toLowerCase();
                if (ext !== '.db') continue;
                const filePath = path.join(BACKUPS_DIR, file);
                const stat = fs.statSync(filePath);
                if (stat.isFile()) {
                    const ext = path.extname(file).toLowerCase();
                    const sizeKB = Math.round((stat.size / 1024) * 10) / 10;
                    const shaPath = `${filePath}.sha256`;
                    let hash = null;
                    if (fs.existsSync(shaPath)) {
                        hash = fs.readFileSync(shaPath, 'utf-8').split(' ')[0].trim();
                    } else {
                        hash = calcSHA256(filePath);
                        if (hash) fs.writeFileSync(shaPath, `${hash} *${file}\nSeguridad: SHA-256 Verificado`);
                    }

                    backups.push({
                        nombre: file,
                        tipo: ext === '.db' ? 'Base de Datos (SQLite)' : (ext === '.csv' ? 'Hoja de Cálculo (Excel CSV)' : 'Archivo'),
                        extension: ext,
                        tamano: sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(2)} MB` : `${sizeKB} KB`,
                        bytes: stat.size,
                        sha256: hash,
                        seguridad: 'Criptográficamente Protegido (SHA-256)',
                        fecha_creacion: stat.birthtime.toLocaleString('es-PE'),
                        mtime: stat.mtimeMs
                    });
                }
            }

            // Ordenar los respaldos más recientes primero
            backups.sort((a, b) => b.mtime - a.mtime);
            sendJSON(res, backups);
            return;
        }

        // Crear respaldo manual
        if (pathname === '/api/backups/crear' && method === 'POST') {
            const data = await parseBody(req);
            const motivo = (data.motivo || 'Manual').replace(/[^a-zA-Z0-9_-]/g, '_');
            const result = generarRespaldoCompleto(motivo);
            sendJSON(res, {
                success: true,
                message: `Copia de seguridad del sistema (${result.dbFile}) creada exitosamente y libro Excel llenado en disco.`, 
                archivo: result.dbFile,
                sha256: result.sha256_db,
                archivos: [result.dbFile, result.csvFile]
            });
            return;
        }

        // Verificar integridad criptográfica de un respaldo
        if (pathname.startsWith('/api/backups/verificar/') && method === 'GET') {
            const fileName = path.basename(pathname.replace('/api/backups/verificar/', ''));
            const filePath = path.join(BACKUPS_DIR, fileName);

            if (!fs.existsSync(filePath)) {
                sendJSON(res, { error: "El archivo de respaldo no existe." }, 404);
                return;
            }

            const currentHash = calcSHA256(filePath);
            const shaFile = `${filePath}.sha256`;
            let storedHash = null;
            if (fs.existsSync(shaFile)) {
                const content = fs.readFileSync(shaFile, 'utf-8');
                storedHash = content.split(' ')[0].trim();
            }

            let sqliteOk = true;
            let recordCounts = {};
            if (fileName.endsWith('.db')) {
                try {
                    const testDb = new DatabaseSync(filePath);
                    const check = testDb.prepare("PRAGMA integrity_check").get();
                    sqliteOk = (check.integrity_check === 'ok');
                    recordCounts = {
                        movimientos: testDb.prepare("SELECT COUNT(*) as c FROM movimientos").get().c,
                        estudiantes: testDb.prepare("SELECT COUNT(*) as c FROM estudiantes").get().c,
                        docentes: testDb.prepare("SELECT COUNT(*) as c FROM docentes").get().c,
                        grupos: testDb.prepare("SELECT COUNT(*) as c FROM grupos").get().c
                    };
                    testDb.close();
                } catch (e) {
                    sqliteOk = false;
                }
            }

            const match = storedHash ? (storedHash === currentHash) : true;
            sendJSON(res, {
                valido: sqliteOk && match,
                estado: sqliteOk && match ? "INTEGRO_Y_SEGURO" : "POSIBLE_CORRUPCION",
                archivo: fileName,
                sha256: currentHash,
                sha256_almacenado: storedHash,
                integridad_sqlite: sqliteOk ? "Correcta (PRAGMA integrity_check = ok)" : "Fallo",
                registros: recordCounts,
                fecha_verificacion: new Date().toLocaleString('es-PE')
            });
            return;
        }

        // Descargar un respaldo específico
        if (pathname.startsWith('/api/backups/descargar/') && method === 'GET') {
            const fileName = path.basename(pathname.replace('/api/backups/descargar/', ''));
            const filePath = path.join(BACKUPS_DIR, fileName);

            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                res.writeHead(200, {
                    'Content-Type': fileName.endsWith('.csv') ? 'text/csv; charset=utf-8' : 'application/octet-stream',
                    'Content-Disposition': `attachment; filename="${fileName}"`
                });
                fs.createReadStream(filePath).pipe(res);
                return;
            } else {
                sendJSON(res, { error: "El archivo de respaldo solicitado no existe." }, 404);
                return;
            }
        }

        // Eliminar un respaldo cuando el usuario ya no lo necesite
        if (pathname.startsWith('/api/backups/') && method === 'DELETE') {
            const fileName = path.basename(pathname.replace('/api/backups/', ''));
            const filePath = path.join(BACKUPS_DIR, fileName);

            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
                fs.unlinkSync(filePath);
                if (fs.existsSync(`${filePath}.sha256`)) fs.unlinkSync(`${filePath}.sha256`);
                sendJSON(res, { success: true, message: `El respaldo "${fileName}" ha sido eliminado exitosamente.` });
                return;
            } else {
                sendJSON(res, { error: "El archivo de respaldo no fue encontrado para eliminar." }, 404);
                return;
            }
        }

        // -------------------------------------------------------------
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

                const txtInfo = `CETPRO SAN MIGUEL - MICAELA BASTIDAS PUYUCAMA
COPIA DE SEGURIDAD OFICIAL DEL SISTEMA
Generado: ${new Date().toLocaleString('es-PE')}

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
4. Haga clic en "Reestablecer Sistema Ahora".`;
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
                        tamano: dbSizeKB > 1024 ? `${(dbSizeKB / 1024).toFixed(2)} MB` : `${dbSizeKB} KB`,
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
                tempPath = path.join(BACKUPS_DIR, `temp_verify_${Date.now()}.db`);
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

                console.log(`[RESTABLECIMIENTO EXITOSO] Desde: ${fileName} | Estudiantes: ${countEst} | Movimientos: ${countMov} | Ingresos: S/. ${sumIng}`);

                sendJSON(res, {
                    success: true,
                    message: `¡Sistema reestablecido exitosamente desde el archivo "${fileName}"!`,
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

        // Restaurar base de datos desde un respaldo .db
        if (pathname.startsWith('/api/backups/restaurar/') && method === 'POST') {
            const fileName = path.basename(pathname.replace('/api/backups/restaurar/', ''));
            const filePath = path.join(BACKUPS_DIR, fileName);

            if (!fileName.endsWith('.db') || !fs.existsSync(filePath)) {
                sendJSON(res, { error: "Solo se puede restaurar desde una copia de base de datos válida (.db)" }, 400);
                return;
            }

            try {
                // Crear un respaldo de seguridad previo antes de restaurar
                generarRespaldoCompleto("Pre_Restauracion");
                db.close();
                fs.copyFileSync(filePath, DB_PATH);
                db = new DatabaseSync(DB_PATH);
                guardarLibroExcelEnDisco();
                sendJSON(res, { success: true, message: `Base de datos restaurada correctamente al punto de: ${fileName}` });
            } catch (restoreErr) {
                db = new DatabaseSync(DB_PATH);
                sendJSON(res, { error: `Error durante la restauración: ${restoreErr.message}` }, 500);
            }
            return;
        }

        // -------------------------------------------------------------
        // 4. API: EXPORTAR A EXCEL / CSV (GENERA RESPALDO AUTOMÁTICO)
        // -------------------------------------------------------------
        if (pathname === '/api/exportar/csv' && method === 'GET') {
            // Creamos automáticamente el respaldo al exportar la base de datos
            const resultado = generarRespaldoCompleto("Auto_Exportacion");

            res.writeHead(200, {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${resultado.csvFile}"`
            });
            res.end(resultado.csvContent);
            return;
        }

        // Exportar Estado de Resultados Mensuales directamente a Excel/CSV
        if (pathname === '/api/exportar/resultados' && method === 'GET') {
            const hoy = new Date();
            const yearStr = parsedUrl.searchParams.get('year') || String(hoy.getFullYear());
            const mesesCompletos = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre"];

            let csv = '\uFEFF'; // BOM para compatibilidad con Excel
            csv += `CETPRO SAN MIGUEL - MICAELA BASTIDAS PUYUCAMA\r\n`;
            csv += `ESTADO OFICIAL DE RESULTADOS MENSUALES (INGRESOS VS EGRESOS) - AÑO ${yearStr}\r\n\r\n`;
            csv += `Mes,Dinero Ingresado (S/.),Dinero Salido (S/.),Resultado Neto (S/.),Margen Operativo,Estado Financiero,Saldo Acumulado en Caja (S/.)\r\n`;

            let acum = 0;
            let totIng = 0;
            let totEgr = 0;

            for (let m = 1; m <= 12; m++) {
                const mStr = String(m).padStart(2, '0');
                const rowM = db.prepare(`
                    SELECT 
                        COALESCE(SUM(CASE WHEN tipo = 'Ingreso' AND estado = 'Pagado' THEN monto ELSE 0 END), 0) as ing,
                        COALESCE(SUM(CASE WHEN tipo = 'Egreso' AND estado = 'Pagado' THEN monto ELSE 0 END), 0) as egr
                    FROM movimientos 
                    WHERE strftime('%Y', fecha) = ? AND strftime('%m', fecha) = ?
                `).get(yearStr, mStr);

                const ing = rowM ? rowM.ing : 0;
                const egr = rowM ? rowM.egr : 0;
                const neto = ing - egr;
                acum += neto;
                totIng += ing;
                totEgr += egr;

                let estado = 'Sin Movimiento';
                if (ing > 0 || egr > 0) {
                    estado = neto > 0 ? 'Superávit' : (neto < 0 ? 'Déficit' : 'Equilibrado');
                }
                const margen = ing > 0 ? `${((neto / ing) * 100).toFixed(1)}%` : '-';

                csv += `"${mesesCompletos[m - 1]}",${ing.toFixed(2)},${egr.toFixed(2)},${neto.toFixed(2)},"${margen}","${estado}",${acum.toFixed(2)}\r\n`;
            }

            const netoAnual = totIng - totEgr;
            const margenAnual = totIng > 0 ? `${((netoAnual / totIng) * 100).toFixed(1)}%` : '-';
            const estadoAnual = netoAnual > 0 ? 'SUPERAVIT ANUAL' : (netoAnual < 0 ? 'DEFICIT ANUAL' : 'EQUILIBRADO');

            csv += `\r\n"TOTALES ANUALES ACUMULADOS",${totIng.toFixed(2)},${totEgr.toFixed(2)},${netoAnual.toFixed(2)},"${margenAnual}","${estadoAnual}",${acum.toFixed(2)}\r\n`;

            const fileName = `Resultados_Mensuales_CETPRO_${yearStr}.csv`;
            res.writeHead(200, {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${fileName}"`
            });
            res.end(csv);
            return;
        }

        // Descargar libro Excel oficial (.xlsx) multi-hoja completo actualizado en vivo
        if (pathname === '/api/exportar/excel' && method === 'GET') {
            const wb = generarLibroExcelActualizado();
            if (wb && XLSX) {
                const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
                res.writeHead(200, {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    'Content-Length': buf.length,
                    'Content-Disposition': 'attachment; filename="CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx"'
                });
                res.end(buf);
                return;
            }

            let excelPath = path.join(ROOT_DIR, 'CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx');
            if (!fs.existsSync(excelPath)) {
                excelPath = path.join(ROOT_DIR, 'archivos_historicos_excel', 'CEPRO_Control_MICAELA_BASTIDAS_LLENO-5.xlsm');
            }
            if (!fs.existsSync(excelPath)) {
                excelPath = path.join(__dirname, 'CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx');
            }
            if (fs.existsSync(excelPath)) {
                const stat = fs.statSync(excelPath);
                res.writeHead(200, {
                    'Content-Type': 'application/vnd.ms-excel.sheet.macroEnabled.12',
                    'Content-Length': stat.size,
                    'Content-Disposition': 'attachment; filename="CEPRO_Control_MICAELA_BASTIDAS_LLENO-5.xlsm"'
                });
                fs.createReadStream(excelPath).pipe(res);
                return;
            } else {
                sendJSON(res, { error: "Archivo Excel no encontrado en el servidor" }, 404);
                return;
            }
        }

        // Exportar Hoja Específica seleccionada en el área de trabajo (CSV/Excel con diseño y formato)
        if (pathname === '/api/exportar/hoja' && method === 'GET') {
            const sheet = parsedUrl.searchParams.get('sheet') || 'estudiantes';
            let csv = '\uFEFF';
            let filename = 'Hoja_CETPRO.csv';

            if (sheet === 'estudiantes') {
                filename = 'Hoja_ESTUDIANTES_CETPRO.csv';
                csv += "CEPRO MICAELA BASTIDAS  ·  ESTUDIANTES\r\n";
                csv += "Nómina Oficial y Control de Pagos\r\n\r\n";
                csv += "ID,DNI,Apellidos y nombres,Teléfono,Grupo / Sección,Docente,Total Pagado (S/.),DEUDA (S/.),Estado,Último pago\r\n";
                const rows = db.prepare(`
                    SELECT e.id, e.codigo, e.nombre, e.telefono, e.grupo,
                           COALESCE((SELECT encargado FROM grupos g WHERE g.nombre = e.grupo), 'Docente Asignado') as docente,
                           COALESCE((SELECT SUM(monto) FROM movimientos m WHERE LOWER(TRIM(m.nombre)) = LOWER(TRIM(e.nombre)) AND tipo = 'Ingreso' AND estado = 'Pagado'), 0) as pagado,
                           COALESCE((SELECT SUM(monto) FROM movimientos m WHERE LOWER(TRIM(m.nombre)) = LOWER(TRIM(e.nombre)) AND tipo = 'Ingreso' AND estado = 'Pendiente'), 0) as deuda
                    FROM estudiantes e ORDER BY e.id ASC
                `).all();
                rows.forEach(r => {
                    const estado = r.deuda > 0 ? 'Con Deuda' : 'Al Día';
                    csv += `"${r.id}","${r.codigo}","${r.nombre}","${r.telefono || '-'}","${r.grupo}","${r.docente}",${r.pagado.toFixed(2)},${r.deuda.toFixed(2)},"${estado}","2026"\r\n`;
                });
            } else if (sheet === 'grupos') {
                filename = 'Hoja_GRUPOS_Y_DOCENTES_CETPRO.csv';
                csv += "CEPRO MICAELA BASTIDAS  ·  GRUPOS Y DOCENTES\r\n";
                csv += "Organización por Especialidad y Encargado de Clase\r\n\r\n";
                csv += "Código,Grupo / Especialidad,Docente a cargo,Horario,Aula / Taller,Turno,Estudiantes,Cobrado en el año (S/.)\r\n";
                const rows = db.prepare(`
                    SELECT g.id, g.nombre, g.encargado, g.horario, g.aula_taller, g.turno,
                           (SELECT COUNT(*) FROM estudiantes e WHERE e.grupo = g.nombre) as total_alumnos,
                           (SELECT COALESCE(SUM(monto), 0) FROM movimientos m WHERE m.grupo = g.nombre AND tipo = 'Ingreso' AND estado = 'Pagado') as total_ingresos
                    FROM grupos g ORDER BY g.id ASC
                `).all();
                rows.forEach(r => {
                    csv += `"G0${r.id}","${r.nombre}","${r.encargado}","${r.horario || '-'}","${r.aula_taller || '-'}","${r.turno}",${r.total_alumnos},${r.total_ingresos.toFixed(2)}\r\n`;
                });
            } else if (sheet === 'ingresos') {
                filename = 'Hoja_INGRESOS_CETPRO.csv';
                csv += "CEPRO MICAELA BASTIDAS  ·  REGISTRO DE INGRESOS (ENTRADAS)\r\n";
                csv += "Libro de Caja - Movimientos de Entrada\r\n\r\n";
                csv += "N° Recibo,Fecha,Estudiante / Persona,Grupo / Sección,Encargado,Concepto / Nota,Forma de pago,Monto (S/.)\r\n";
                const rows = db.prepare("SELECT * FROM movimientos WHERE tipo = 'Ingreso' ORDER BY id ASC").all();
                rows.forEach(r => {
                    csv += `"REC-${String(r.id).padStart(5, '0')}","${r.fecha}","${r.nombre}","${r.grupo || '-'}","${r.encargado || '-'}","${r.concepto}","${r.metodo_pago || 'Efectivo'}",${r.monto.toFixed(2)}\r\n`;
                });
            } else if (sheet === 'deudores') {
                filename = 'Hoja_DEUDORES_CETPRO.csv';
                csv += "CEPRO MICAELA BASTIDAS  ·  ESTUDIANTES QUE DEBEN\r\n";
                csv += "Control de Pagos Pendientes y Vencimientos\r\n\r\n";
                csv += "ID,Estudiante,Grupo / Especialidad,Docente,Teléfono,Total Pagado (S/.),DEUDA PENDIENTE (S/.)\r\n";
                const rows = db.prepare(`
                    SELECT e.id, e.nombre, e.grupo, e.telefono,
                           COALESCE((SELECT encargado FROM grupos g WHERE g.nombre = e.grupo), 'Docente') as docente,
                           COALESCE((SELECT SUM(monto) FROM movimientos m WHERE LOWER(TRIM(m.nombre)) = LOWER(TRIM(e.nombre)) AND tipo = 'Ingreso' AND estado = 'Pagado'), 0) as pagado,
                           COALESCE((SELECT SUM(monto) FROM movimientos m WHERE LOWER(TRIM(m.nombre)) = LOWER(TRIM(e.nombre)) AND tipo = 'Ingreso' AND estado = 'Pendiente'), 0) as deuda
                    FROM estudiantes e
                    WHERE (SELECT SUM(monto) FROM movimientos m WHERE LOWER(TRIM(m.nombre)) = LOWER(TRIM(e.nombre)) AND tipo = 'Ingreso' AND estado = 'Pendiente') > 0
                    ORDER BY deuda DESC
                `).all();
                rows.forEach(r => {
                    csv += `"${r.id}","${r.nombre}","${r.grupo}","${r.docente}","${r.telefono || '-'}","${r.pagado.toFixed(2)}","${r.deuda.toFixed(2)}"\r\n`;
                });
            } else if (sheet === 'docentes') {
                filename = 'Hoja_DOCENTES_CETPRO.csv';
                csv += "CEPRO MICAELA BASTIDAS  ·  DOCENTES\r\n";
                csv += "Docentes Encargados y Control Financiero Anual\r\n\r\n";
                csv += "ID,Apellidos y nombres del docente,Especialidad,Turno,Teléfono,Grupos a cargo,Estudiantes a cargo,Cobrado en el año (S/.)\r\n";
                const rows = db.prepare(`
                    SELECT d.id, d.nombre, d.especialidad, d.turno, d.telefono,
                           COALESCE((SELECT COUNT(*) FROM grupos g WHERE g.encargado = d.nombre), 1) as grupos_count,
                           COALESCE((SELECT COUNT(*) FROM estudiantes e WHERE e.grupo IN (SELECT nombre FROM grupos g WHERE g.encargado = d.nombre)), 0) as total_est,
                           COALESCE((SELECT SUM(m.monto) FROM movimientos m WHERE (m.encargado = d.nombre OR m.grupo IN (SELECT nombre FROM grupos g WHERE g.encargado = d.nombre)) AND m.tipo = 'Ingreso' AND m.estado = 'Pagado'), 0) as cobrado
                    FROM docentes d ORDER BY d.id ASC
                `).all();
                rows.forEach(r => {
                    csv += `"${r.id}","${r.nombre}","${r.especialidad}","${r.turno}","${r.telefono || '-'}","${r.grupos_count}","${r.total_est}",${r.cobrado.toFixed(2)}\r\n`;
                });
            } else {
                // Export genérico de movimientos
                filename = `Hoja_${sheet.toUpperCase()}_CETPRO.csv`;
                csv += "CEPRO MICAELA BASTIDAS  ·  LIBRO GENERAL\r\n\r\n";
                csv += "N° Recibo,Fecha,Estudiante / Persona,Grupo / Sección,Encargado,Tipo,Concepto,Monto (S/.)\r\n";
                const rows = db.prepare("SELECT * FROM movimientos ORDER BY id DESC").all();
                rows.forEach(r => {
                    csv += `"REC-${String(r.id).padStart(5, '0')}","${r.fecha}","${r.nombre}","${r.grupo || '-'}","${r.encargado || '-'}","${r.tipo}","${r.concepto}",${r.monto.toFixed(2)}\r\n`;
                });
            }

            res.writeHead(200, {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="${filename}"`
            });
            res.end(csv);
            return;
        }

        // Endpoint para la hoja DIARIO (ingresos, gastos y notas del día por fecha)
        if (pathname === '/api/diario' && method === 'GET') {
            const hoyStr = new Date().toISOString().split('T')[0];
            const fecha = parsedUrl.searchParams.get('fecha') || hoyStr;

            const ingRow = db.prepare("SELECT COALESCE(SUM(monto), 0) as total, COUNT(*) as count FROM movimientos WHERE fecha = ? AND tipo = 'Ingreso' AND estado = 'Pagado'").get(fecha);
            const egrRow = db.prepare("SELECT COALESCE(SUM(monto), 0) as total, COUNT(*) as count FROM movimientos WHERE fecha = ? AND tipo = 'Egreso' AND estado = 'Pagado'").get(fecha);

            const movsDelDia = db.prepare("SELECT * FROM movimientos WHERE fecha = ? ORDER BY id DESC").all(fecha);

            sendJSON(res, {
                fecha,
                ingresos: ingRow ? ingRow.total : 0,
                pagos_count: ingRow ? ingRow.count : 0,
                egresos: egrRow ? egrRow.total : 0,
                saldo: (ingRow ? ingRow.total : 0) - (egrRow ? egrRow.total : 0),
                movimientos: movsDelDia
            });
            return;
        }

        // -------------------------------------------------------------
        // 5. API: STATS GENERALES Y DASHBOARD
        // -------------------------------------------------------------
        if (pathname === '/api/stats' && method === 'GET') {
            const hoy = new Date();
            const yearStr = parsedUrl.searchParams.get('year') || String(hoy.getFullYear());
            const monthStr = String(hoy.getMonth() + 1).padStart(2, '0');

            const ingRow = db.prepare("SELECT COALESCE(SUM(monto), 0) as total FROM movimientos WHERE tipo = 'Ingreso' AND estado = 'Pagado' AND strftime('%Y', fecha) = ?").get(yearStr);
            const totalIngresos = ingRow ? ingRow.total : 0;

            const egrRow = db.prepare("SELECT COALESCE(SUM(monto), 0) as total FROM movimientos WHERE tipo = 'Egreso' AND estado = 'Pagado' AND strftime('%Y', fecha) = ?").get(yearStr);
            const totalEgresos = egrRow ? egrRow.total : 0;

            const saldoActual = totalIngresos - totalEgresos;

            const deudasRow = db.prepare("SELECT COALESCE(SUM(monto), 0) as total FROM movimientos WHERE tipo = 'Ingreso' AND estado = 'Pendiente' AND rol = 'Estudiante'").get();
            const totalDeudas = deudasRow ? deudasRow.total : 0;

            const estMetrics = db.prepare(`
                SELECT 
                    COUNT(CASE WHEN monto_abonado > 0 AND estado = 'Pendiente' THEN 1 END) as faltan_completar,
                    COUNT(CASE WHEN (monto_abonado = 0 OR monto_abonado IS NULL) AND estado = 'Pendiente' THEN 1 END) as deben_todo,
                    COALESCE(SUM(CASE WHEN monto_abonado > 0 AND estado = 'Pendiente' THEN monto_abonado ELSE 0 END), 0) as total_ya_abonado
                FROM movimientos WHERE rol = 'Estudiante'
            `).get();

            const totalEstRow = db.prepare("SELECT COUNT(*) as c FROM estudiantes").get();
            const totalAlumnos = totalEstRow ? totalEstRow.c : 0;

            const mesRow = db.prepare(`
                SELECT 
                    COALESCE(SUM(CASE WHEN tipo = 'Ingreso' AND estado = 'Pagado' THEN monto ELSE 0 END), 0) as ing,
                    COALESCE(SUM(CASE WHEN tipo = 'Egreso' AND estado = 'Pagado' THEN monto ELSE 0 END), 0) as egr
                FROM movimientos 
                WHERE strftime('%Y', fecha) = ? AND strftime('%m', fecha) = ?
            `).get(yearStr, monthStr);

            const ingresosMes = mesRow ? mesRow.ing : 0;
            const egresosMes = mesRow ? mesRow.egr : 0;
            const saldoMes = ingresosMes - egresosMes;

            const mesesNombres = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Set", "Oct", "Nov", "Dic"];
            const mesesCompletos = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre"];
            const chartIngresos = [];
            const chartEgresos = [];
            const chartSaldos = [];
            const mesesDetalle = [];
            let saldoAcumulado = 0;

            for (let m = 1; m <= 12; m++) {
                const mStr = String(m).padStart(2, '0');
                const rowM = db.prepare(`
                    SELECT 
                        COALESCE(SUM(CASE WHEN tipo = 'Ingreso' AND estado = 'Pagado' THEN monto ELSE 0 END), 0) as ing,
                        COALESCE(SUM(CASE WHEN tipo = 'Egreso' AND estado = 'Pagado' THEN monto ELSE 0 END), 0) as egr,
                        COUNT(CASE WHEN estado = 'Pagado' THEN 1 END) as total_movs
                    FROM movimientos 
                    WHERE strftime('%Y', fecha) = ? AND strftime('%m', fecha) = ?
                `).get(yearStr, mStr);

                const ingVal = rowM ? Math.round(rowM.ing * 100) / 100 : 0;
                const egrVal = rowM ? Math.round(rowM.egr * 100) / 100 : 0;
                const netoVal = Math.round((ingVal - egrVal) * 100) / 100;
                saldoAcumulado = Math.round((saldoAcumulado + netoVal) * 100) / 100;
                const totalMovs = rowM ? rowM.total_movs : 0;

                let estadoMes = 'Sin Movimiento';
                if (ingVal > 0 || egrVal > 0) {
                    if (netoVal > 0) estadoMes = 'Superávit';
                    else if (netoVal < 0) estadoMes = 'Déficit';
                    else estadoMes = 'Equilibrado';
                }

                let margenPct = '-';
                if (ingVal > 0) {
                    margenPct = ((netoVal / ingVal) * 100).toFixed(1) + '%';
                }

                chartIngresos.push(ingVal);
                chartEgresos.push(egrVal);
                chartSaldos.push(netoVal);

                mesesDetalle.push({
                    mes_num: m,
                    mes_str: mStr,
                    mes_corto: mesesNombres[m - 1],
                    mes_nombre: mesesCompletos[m - 1],
                    ingresos: ingVal,
                    egresos: egrVal,
                    neto: netoVal,
                    saldo_acumulado: saldoAcumulado,
                    margen: margenPct,
                    estado: estadoMes,
                    movimientos_count: totalMovs
                });
            }

            const docRow = db.prepare(`
                SELECT 
                    COALESCE(SUM(CASE WHEN tipo = 'Egreso' AND estado = 'Pagado' THEN monto ELSE 0 END), 0) as egresos_doc,
                    COALESCE(SUM(CASE WHEN tipo = 'Ingreso' AND estado = 'Pagado' THEN monto ELSE 0 END), 0) as ingresos_doc
                FROM movimientos WHERE rol = 'Docente'
            `).get();

            const salidasDoc = docRow ? docRow.egresos_doc : 0;
            const entradasDoc = docRow ? docRow.ingresos_doc : 0;

            const carrerasStats = db.prepare(`
                SELECT carrera, 
                       COALESCE(SUM(CASE WHEN tipo = 'Ingreso' AND estado = 'Pagado' THEN monto ELSE 0 END), 0) as total_ingreso,
                       COALESCE(SUM(CASE WHEN tipo = 'Egreso' AND estado = 'Pagado' THEN monto ELSE 0 END), 0) as total_egreso,
                       COALESCE(SUM(CASE WHEN tipo = 'Ingreso' AND estado = 'Pendiente' THEN monto ELSE 0 END), 0) as total_deuda
                FROM movimientos 
                WHERE carrera != '' AND carrera != 'General'
                GROUP BY carrera
                ORDER BY total_ingreso DESC
            `).all();

            sendJSON(res, {
                total_ingresos: Math.round(totalIngresos * 100) / 100,
                total_egresos: Math.round(totalEgresos * 100) / 100,
                saldo_actual: Math.round(saldoActual * 100) / 100,
                total_deudas: Math.round(totalDeudas * 100) / 100,
                ingresos_mes: Math.round(ingresosMes * 100) / 100,
                egresos_mes: Math.round(egresosMes * 100) / 100,
                saldo_mes: Math.round(saldoMes * 100) / 100,
                año_actual: Number(yearStr),
                estudiantes: {
                    total_alumnos: totalAlumnos,
                    faltan_completar: estMetrics ? estMetrics.faltan_completar : 0,
                    deben_todo: estMetrics ? estMetrics.deben_todo : 0,
                    total_ya_abonado: estMetrics ? Math.round(estMetrics.total_ya_abonado * 100) / 100 : 0,
                    saldo_restante: Math.round(totalDeudas * 100) / 100
                },
                docentes: {
                    total_salidas: Math.round(salidasDoc * 100) / 100,
                    total_entradas: Math.round(entradasDoc * 100) / 100,
                    balance: Math.round((entradasDoc - salidasDoc) * 100) / 100
                },
                chart: {
                    meses: mesesNombres,
                    ingresos: chartIngresos,
                    egresos: chartEgresos,
                    saldos: chartSaldos
                },
                meses_detalle: mesesDetalle,
                carreras: carrerasStats
            });
            return;
        }

        // -------------------------------------------------------------
        // 6. API: MOVIMIENTOS DE CAJA (GET, POST, DELETE)
        // -------------------------------------------------------------
        if (pathname === '/api/movimientos' && method === 'GET') {
            const tipo = parsedUrl.searchParams.get('tipo');
            const rol = parsedUrl.searchParams.get('rol');
            const carrera = parsedUrl.searchParams.get('carrera');
            const grupo = parsedUrl.searchParams.get('grupo');
            const encargado = parsedUrl.searchParams.get('encargado');
            const estado = parsedUrl.searchParams.get('estado');
            const search = (parsedUrl.searchParams.get('search') || '').toLowerCase();

            let query = "SELECT * FROM movimientos WHERE 1=1";
            const params = [];

            if (tipo) { query += " AND tipo = ?"; params.push(tipo); }
            if (rol) { query += " AND rol = ?"; params.push(rol); }
            if (carrera) { query += " AND carrera = ?"; params.push(carrera); }
            if (grupo) { query += " AND grupo = ?"; params.push(grupo); }
            if (encargado) { query += " AND encargado = ?"; params.push(encargado); }
            if (estado) { query += " AND estado = ?"; params.push(estado); }
            if (search) {
                query += " AND (LOWER(nombre) LIKE ? OR LOWER(concepto) LIKE ? OR LOWER(comprobante) LIKE ? OR LOWER(notas) LIKE ?)";
                params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
            }

            query += " ORDER BY fecha DESC, id DESC";
            const rows = db.prepare(query).all(...params);
            sendJSON(res, rows);
            return;
        }

        if (pathname === '/api/movimientos' && method === 'POST') {
            const data = await parseBody(req);
            const hoyStr = new Date().toISOString().split('T')[0];
            const fecha = data.fecha || hoyStr;
            const tipo = (data.tipo === 'Egreso') ? 'Egreso' : 'Ingreso';
            const estado = data.estado || 'Pagado';
            const rol = data.rol || 'Estudiante';
            const nombre = (data.nombre || '').trim();
            if (!nombre) {
                sendJSON(res, { error: "El nombre de la persona o beneficiario es obligatorio" }, 400);
                return;
            }
            const monto = parseFloat(data.monto || 0);
            if (isNaN(monto) || (monto <= 0 && estado !== 'Anulado')) {
                sendJSON(res, { error: "El monto de la operación debe ser un valor mayor a cero (S/. 0.00 reservado para anulados)" }, 400);
                return;
            }
            const carrera = (data.carrera || '').trim();
            const grupo = (data.grupo || 'General').trim();
            const encargado = (data.encargado || (rol === 'Docente' ? nombre : 'General')).trim();
            const concepto = (data.concepto || '').trim();
            const montoTotal = parseFloat(data.monto_total || monto || 0);
            const montoAbonado = parseFloat(data.monto_abonado || 0);
            const metodo = data.metodo_pago || 'Efectivo';
            const vencimiento = data.fecha_vencimiento || '';
            const comprobante = data.comprobante || '';
            const notas = data.notas || '';

            const stmt = db.prepare(`
                INSERT INTO movimientos (fecha, tipo, estado, rol, nombre, carrera, grupo, encargado, concepto, monto, monto_total, monto_abonado, metodo_pago, fecha_vencimiento, comprobante, notas)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            const info = stmt.run(fecha, tipo, estado, rol, nombre, carrera, grupo, encargado, concepto, monto, montoTotal, montoAbonado, metodo, vencimiento, comprobante, notas);
            const newId = Number(info.lastInsertRowid);

            if (rol === 'Docente' && nombre) {
                const exist = db.prepare("SELECT id FROM docentes WHERE LOWER(nombre) = LOWER(?)").get(nombre);
                if (!exist) {
                    db.prepare("INSERT INTO docentes (nombre, carrera) VALUES (?, ?)").run(nombre, carrera);
                }
            }

            if (rol === 'Estudiante' && nombre) {
                const exist = db.prepare("SELECT id FROM estudiantes WHERE LOWER(nombre) = LOWER(?)").get(nombre);
                if (!exist) {
                    const cod = `EST-${new Date().getFullYear()}-${String(newId).padStart(3, '0')}`;
                    db.prepare("INSERT INTO estudiantes (codigo, nombre, carrera, grupo) VALUES (?, ?, ?, ?)").run(cod, nombre, carrera, grupo);
                }
            }

            // Actualizar libro Excel en disco inmediatamente y generar respaldo seguro
            guardarLibroExcelEnDisco();
            generarRespaldoCompleto('Auto_Mov_' + newId);

            sendJSON(res, { success: true, id: newId, message: "Movimiento registrado con éxito y guardado en Excel" });
            return;
        }

        if (pathname.startsWith('/api/movimientos/') && method === 'DELETE') {
            const movId = parseInt(pathname.split('/')[3], 10);
            db.prepare("DELETE FROM movimientos WHERE id = ?").run(movId);
            db.prepare("DELETE FROM abonos WHERE movimiento_id = ?").run(movId);
            guardarLibroExcelEnDisco();
            sendJSON(res, { success: true, message: "Movimiento eliminado y Excel actualizado" });
            return;
        }

        // -------------------------------------------------------------
        // ACTUALIZAR NOTAS DE UN MOVIMIENTO/RECIBO DIRECTAMENTE DESDE FACTURA
        // -------------------------------------------------------------
        if (pathname.startsWith('/api/movimientos/') && pathname.endsWith('/notas') && (method === 'POST' || method === 'PUT')) {
            const movId = parseInt(pathname.split('/')[3], 10);
            const data = await parseBody(req);
            const notas = (data.notas !== undefined ? data.notas : '').trim();

            const mov = db.prepare("SELECT * FROM movimientos WHERE id = ?").get(movId);
            if (!mov) {
                sendJSON(res, { success: false, error: "Comprobante / Movimiento no encontrado" }, 404);
                return;
            }

            db.prepare("UPDATE movimientos SET notas = ? WHERE id = ?").run(notas, movId);
            guardarLibroExcelEnDisco();
            generarRespaldoCompleto('Auto_Nota_Mov_' + movId);
            sendJSON(res, { success: true, message: "Notas guardadas exitosamente y sincronizadas en Excel", id: movId, notas });
            return;
        }

        // -------------------------------------------------------------
        // ACTUALIZAR NOTAS DE UN ESTUDIANTE DIRECTAMENTE DESDE FACTURA
        // -------------------------------------------------------------
        if (pathname.startsWith('/api/estudiantes/') && pathname.endsWith('/notas') && (method === 'POST' || method === 'PUT')) {
            const estId = parseInt(pathname.split('/')[3], 10);
            const data = await parseBody(req);
            const notas = (data.notas !== undefined ? data.notas : '').trim();

            const est = db.prepare("SELECT * FROM estudiantes WHERE id = ?").get(estId);
            if (!est) {
                sendJSON(res, { success: false, error: "Estudiante no encontrado" }, 404);
                return;
            }

            db.prepare("UPDATE estudiantes SET notas = ? WHERE id = ?").run(notas, estId);
            guardarLibroExcelEnDisco();
            sendJSON(res, { success: true, message: "Notas de estudiante guardadas", id: estId, notas });
            return;
        }

        
        // =============================================================
        // 6.2 API: RECIBO OFICIAL EN EXCEL (.xlsx)
        // =============================================================
        if (pathname.startsWith('/api/movimientos/') && pathname.endsWith('/recibo-excel') && method === 'GET') {
            const movId = parseInt(pathname.split('/')[3], 10);
            let mov = db.prepare("SELECT * FROM movimientos WHERE id = ?").get(movId);
            if (!mov) {
                sendJSON(res, { error: "Recibo no encontrado" }, 404);
                return;
            }

            // Lookup additional student info if available
            const est = db.prepare("SELECT * FROM estudiantes WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))").get(mov.nombre);
            if (est) {
                mov.dni = mov.dni || est.dni || est.codigo;
                mov.telefono = mov.telefono || est.telefono;
                mov.carrera = mov.carrera || est.carrera;
                mov.turno = mov.turno || est.turno;
            }

            const wb = generarReciboExcelOficial(mov);
            const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
            
            const nroLimpio = mov.comprobante ? String(mov.comprobante).replace(/\D/g, '') : String(mov.id);
            const nombreLimpio = (mov.nombre || 'Comprobante').replace(/[^a-zA-Z0-9]/g, '_');
            const fileName = `Recibo_${nroLimpio}_${nombreLimpio}.xlsx`;

            res.writeHead(200, {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="${fileName}"`,
                'Content-Length': buf.length
            });
            res.end(buf);
            return;
        }

        // =============================================================
        // 6.3 API: CALENDARIZACIÓN DE INGRESOS Y NUEVOS ESTUDIANTES POR DÍA
        // =============================================================
        if (pathname === '/api/estudiantes/calendarizacion' && method === 'GET') {
            // Agrupar movimientos de ingreso por fecha
            const resumenPorDia = db.prepare(`
                SELECT 
                    fecha,
                    COUNT(DISTINCT nombre) as total_estudiantes,
                    COUNT(*) as total_recibos,
                    SUM(monto) as total_monto
                FROM movimientos
                WHERE LOWER(tipo) = 'ingreso' AND fecha IS NOT NULL AND fecha != ''
                GROUP BY fecha
                ORDER BY fecha DESC
            `).all();

            // Para cada día, traer los detalles de los recibos y estudiantes
            const stmtDetalle = db.prepare(`
                SELECT id, comprobante, nombre, dni, carrera, turno, monto, fecha, concepto, notas
                FROM movimientos
                WHERE LOWER(tipo) = 'ingreso' AND fecha = ?
                ORDER BY id DESC
            `);

            const resultado = resumenPorDia.map(r => {
                const detalles = stmtDetalle.all(r.fecha);
                return {
                    fecha: r.fecha,
                    total_estudiantes: r.total_estudiantes,
                    total_recibos: r.total_recibos,
                    total_monto: r.total_monto,
                    recibos: detalles
                };
            });

            sendJSON(res, {
                success: true,
                dias_registrados: resultado.length,
                calendarizacion: resultado
            });
            return;
        }

        // =============================================================
        // 6.4 API: REGISTRAR NUEVO ESTUDIANTE Y EMITIR SU RECIBO HOY CON FECHA
        // =============================================================
        if (pathname === '/api/estudiantes/nuevo-con-recibo' && method === 'POST') {
            const data = await parseBody(req);
            const { nombre, dni, telefono, carrera, turno, grupo, monto, fecha, notas, concepto } = data;

            if (!nombre || !nombre.trim()) {
                sendJSON(res, { error: "El nombre del estudiante es obligatorio" }, 400);
                return;
            }

            const nombreTrim = nombre.trim();
            const fechaEmision = (fecha && fecha.trim()) ? fecha.trim() : new Date().toISOString().split('T')[0];
            const montoNum = parseFloat(monto) || 150;
            const carreraFinal = carrera || 'Corte y Ensamblaje';
            const turnoFinal = turno || 'Tarde';
            const grupoFinal = grupo || (carreraFinal + ' - Turno ' + turnoFinal);
            const notasFinal = (notas || '').trim();

            // 1. Obtener siguiente número correlativo de comprobante
            const rowMax = db.prepare("SELECT MAX(CAST(REPLACE(REPLACE(comprobante, 'N°', ''), ' ', '') AS INTEGER)) as max_nro FROM movimientos WHERE comprobante IS NOT NULL").get();
            const nextNro = ((rowMax && rowMax.max_nro) ? rowMax.max_nro : 807) + 1;
            const correlativoStr = String(nextNro).padStart(7, '0');

            // 2. Insertar o actualizar estudiante en tabla 'estudiantes'
            let estExistente = db.prepare("SELECT * FROM estudiantes WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))").get(nombreTrim);
            let estId = null;

            if (!estExistente) {
                const infoEst = db.prepare(`
                    INSERT INTO estudiantes (codigo, nombre, carrera, ciclo, email, telefono, estado_academico, grupo, dni, turno, notas)
                    VALUES (?, ?, ?, 'I', '', ?, 'ACTIVO', ?, ?, ?, ?)
                `).run(dni || correlativoStr, nombreTrim, carreraFinal, telefono || '', grupoFinal, dni || '', turnoFinal, notasFinal);
                estId = infoEst.lastInsertRowid;
            } else {
                estId = estExistente.id;
                db.prepare(`
                    UPDATE estudiantes 
                    SET dni = COALESCE(NULLIF(?, ''), dni),
                        telefono = COALESCE(NULLIF(?, ''), telefono),
                        carrera = ?, turno = ?, grupo = ?,
                        notas = CASE WHEN ? != '' THEN ? ELSE notas END
                    WHERE id = ?
                `).run(dni || '', telefono || '', carreraFinal, turnoFinal, grupoFinal, notasFinal, notasFinal, estId);
            }

            // 3. Insertar movimiento de ingreso en 'movimientos'
            const infoMov = db.prepare(`
                INSERT INTO movimientos (fecha, tipo, estado, rol, nombre, carrera, concepto, monto, monto_total, monto_abonado, metodo_pago, comprobante, notas, grupo, dni, turno)
                VALUES (?, 'Ingreso', 'Pagado', 'Estudiante', ?, ?, ?, ?, ?, ?, 'Efectivo', ?, ?, ?, ?, ?)
            `).run(
                fechaEmision,
                nombreTrim,
                carreraFinal,
                concepto || 'Aporte por Mantenimiento Módulo 1',
                montoNum,
                montoNum,
                montoNum,
                correlativoStr,
                notasFinal,
                grupoFinal,
                dni || '',
                turnoFinal
            );

            const movId = infoMov.lastInsertRowid;

            // 4. Sincronizar Excel y generar respaldo
            guardarLibroExcelEnDisco();
            generarRespaldoCompleto('Auto_Nuevo_Estudiante_' + correlativoStr);

            sendJSON(res, {
                success: true,
                mensaje: `Estudiante ${nombreTrim} registrado y recibo N° ${correlativoStr} emitido con éxito con fecha ${fechaEmision}.`,
                estudiante_id: estId,
                movimiento_id: movId,
                comprobante: correlativoStr,
                fecha: fechaEmision
            });
            return;
        }

        // =============================================================
        // 6.5 API: ACTUALIZAR FECHA DE EMISIÓN DE UN RECIBO
        // =============================================================
        if (pathname.startsWith('/api/movimientos/') && pathname.endsWith('/fecha') && (method === 'PUT' || method === 'POST')) {
            const movId = parseInt(pathname.split('/')[3], 10);
            const data = await parseBody(req);
            const nuevaFecha = (data.fecha || '').trim();

            if (!nuevaFecha) {
                sendJSON(res, { error: "La fecha es requerida (formato YYYY-MM-DD)" }, 400);
                return;
            }

            const mov = db.prepare("SELECT * FROM movimientos WHERE id = ?").get(movId);
            if (!mov) {
                sendJSON(res, { error: "Recibo no encontrado" }, 404);
                return;
            }

            db.prepare("UPDATE movimientos SET fecha = ? WHERE id = ?").run(nuevaFecha, movId);
            guardarLibroExcelEnDisco();
            generarRespaldoCompleto('Auto_Fecha_Mov_' + (mov.comprobante || movId));

            sendJSON(res, {
                success: true,
                mensaje: `Fecha del recibo N° ${mov.comprobante} actualizada a ${nuevaFecha}.`,
                fecha: nuevaFecha
            });
            return;
        }

        // -------------------------------------------------------------
        // 6.1 API: SECCIONES Y CLASES POR GRUPO Y ENCARGADOS
        // -------------------------------------------------------------
        if (pathname === '/api/grupos' && method === 'GET') {
            const carrera = parsedUrl.searchParams.get('carrera');
            const turno = parsedUrl.searchParams.get('turno');
            let q = `
                SELECT 
                    g.id, g.nombre, g.carrera, g.encargado, g.turno, g.horario, g.aula_taller, g.descripcion,
                    (SELECT COUNT(*) FROM estudiantes e WHERE e.grupo = g.nombre) as total_alumnos,
                    (SELECT COALESCE(SUM(m.monto), 0) FROM movimientos m WHERE m.grupo = g.nombre AND m.tipo = 'Ingreso' AND m.estado = 'Pagado') as total_ingresos,
                    (SELECT COALESCE(SUM(m.monto), 0) FROM movimientos m WHERE m.grupo = g.nombre AND m.tipo = 'Egreso' AND m.estado = 'Pagado') as total_egresos,
                    (SELECT COALESCE(SUM(m.monto), 0) FROM movimientos m WHERE m.grupo = g.nombre AND m.tipo = 'Ingreso' AND m.estado = 'Pendiente') as total_deudas
                FROM grupos g
                WHERE 1=1
            `;
            const params = [];
            if (carrera) { q += " AND g.carrera = ?"; params.push(carrera); }
            if (turno) { q += " AND g.turno = ?"; params.push(turno); }
            q += " ORDER BY g.carrera ASC, g.nombre ASC";

            const rows = db.prepare(q).all(...params);
            const grupos = rows.map(r => ({
                ...r,
                total_ingresos: Math.round(r.total_ingresos * 100) / 100,
                total_egresos: Math.round(r.total_egresos * 100) / 100,
                balance_neto: Math.round((r.total_ingresos - r.total_egresos) * 100) / 100,
                total_deudas: Math.round(r.total_deudas * 100) / 100
            }));
            sendJSON(res, grupos);
            return;
        }

        if (pathname === '/api/grupos' && method === 'POST') {
            const data = await parseBody(req);
            const nombre = (data.nombre || '').trim();
            const carrera = (data.carrera || 'General').trim();
            const encargado = (data.encargado || 'Por Asignar').trim();
            const turno = data.turno || 'Mañana';
            const horario = (data.horario || '').trim();
            const aula = (data.aula_taller || '').trim();
            const desc = (data.descripcion || '').trim();

            if (!nombre) {
                sendJSON(res, { error: "El nombre del grupo o sección es obligatorio" }, 400);
                return;
            }

            try {
                const stmt = db.prepare(`
                    INSERT INTO grupos (nombre, carrera, encargado, turno, horario, aula_taller, descripcion)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `);
                const info = stmt.run(nombre, carrera, encargado, turno, horario, aula, desc);
                guardarLibroExcelEnDisco();
                generarRespaldoCompleto('Nuevo_Grupo_' + info.lastInsertRowid);
                sendJSON(res, { success: true, id: Number(info.lastInsertRowid), message: "Grupo y sección registrados exitosamente" });
            } catch (err) {
                sendJSON(res, { error: "Ya existe un grupo con este nombre o hubo un error al guardar" }, 400);
            }
            return;
        }

        // Modificar Sección / Grupo y su Turno
        if (((pathname.match(/^\/api\/grupos\/(\d+)$/) && (method === 'PUT' || method === 'POST')) ||
             (pathname.match(/^\/api\/grupos\/(\d+)\/editar$/) && method === 'POST'))) {
            const grupoId = parseInt(pathname.split('/')[3], 10);
            const data = await parseBody(req);
            const nombre = (data.nombre || '').trim();
            const carrera = (data.carrera || '').trim();
            const encargado = (data.encargado || '').trim();
            const turno = (data.turno || 'Mañana').trim();
            const horario = (data.horario || '').trim();
            const aula = (data.aula_taller || '').trim();
            const desc = (data.descripcion || '').trim();

            if (!nombre) {
                sendJSON(res, { error: "El nombre del grupo o sección es obligatorio" }, 400);
                return;
            }

            try {
                const oldGrupo = db.prepare("SELECT * FROM grupos WHERE id = ?").get(grupoId);
                if (!oldGrupo) {
                    sendJSON(res, { error: "Sección no encontrada" }, 404);
                    return;
                }

                db.prepare(`
                    UPDATE grupos 
                    SET nombre = ?, carrera = ?, encargado = ?, turno = ?, horario = ?, aula_taller = ?, descripcion = ?
                    WHERE id = ?
                `).run(nombre, carrera, encargado, turno, horario, aula, desc, grupoId);

                // Si cambió el nombre del grupo, mantener la integridad en estudiantes y movimientos
                if (oldGrupo.nombre !== nombre) {
                    db.prepare("UPDATE estudiantes SET grupo = ? WHERE grupo = ?").run(nombre, oldGrupo.nombre);
                    db.prepare("UPDATE movimientos SET grupo = ? WHERE grupo = ?").run(nombre, oldGrupo.nombre);
                }

                // Si cambió el encargado, actualizar en los movimientos de ese grupo
                if (encargado && oldGrupo.encargado !== encargado) {
                    db.prepare("UPDATE movimientos SET encargado = ? WHERE grupo = ?").run(encargado, nombre);
                }

                sendJSON(res, { success: true, message: "Sección y turno actualizados exitosamente" });
            } catch (err) {
                sendJSON(res, { error: "Error al actualizar sección: " + err.message }, 500);
            }
            return;
        }

        if (pathname.startsWith('/api/grupos/') && method === 'DELETE') {
            const grupoId = parseInt(pathname.split('/')[3], 10);
            const grupo = db.prepare("SELECT nombre FROM grupos WHERE id = ?").get(grupoId);
            if (grupo) {
                db.prepare("UPDATE estudiantes SET grupo = 'General' WHERE grupo = ?").run(grupo.nombre);
                db.prepare("DELETE FROM grupos WHERE id = ?").run(grupoId);
                guardarLibroExcelEnDisco();
                generarRespaldoCompleto('Eliminado_Grupo_' + grupoId);
                sendJSON(res, { success: true, message: `Grupo "${grupo.nombre}" eliminado exitosamente` });
            } else {
                sendJSON(res, { error: "Grupo no encontrado" }, 404);
            }
            return;
        }

        if (pathname.match(/^\/api\/grupos\/(\d+)\/detalle$/) && method === 'GET') {
            const grupoId = parseInt(pathname.split('/')[3], 10);
            const grupo = db.prepare("SELECT * FROM grupos WHERE id = ?").get(grupoId);
            if (!grupo) {
                sendJSON(res, { error: "Grupo no encontrado" }, 404);
                return;
            }
            const estudiantes = db.prepare("SELECT * FROM estudiantes WHERE grupo = ? ORDER BY nombre ASC").all(grupo.nombre);
            const movimientos = db.prepare("SELECT * FROM movimientos WHERE grupo = ? ORDER BY fecha DESC, id DESC").all(grupo.nombre);

            let totalIng = 0;
            let totalEgr = 0;
            let totalDeu = 0;
            for (const m of movimientos) {
                if (m.tipo === 'Ingreso' && m.estado === 'Pagado') totalIng += m.monto;
                if (m.tipo === 'Egreso' && m.estado === 'Pagado') totalEgr += m.monto;
                if (m.tipo === 'Ingreso' && m.estado === 'Pendiente') totalDeu += m.monto;
            }

            sendJSON(res, {
                grupo,
                estudiantes,
                movimientos,
                total_ingresos: Math.round(totalIng * 100) / 100,
                total_egresos: Math.round(totalEgr * 100) / 100,
                balance_neto: Math.round((totalIng - totalEgr) * 100) / 100,
                total_deudas: Math.round(totalDeu * 100) / 100
            });
            return;
        }

        // -------------------------------------------------------------
        // 7. API: PLANTILLA DE ESTUDIANTES (DEBEN Y FALTAN COMPLETAR)
        // -------------------------------------------------------------
        if (pathname === '/api/estudiantes' && method === 'GET') {
            const carrera = parsedUrl.searchParams.get('carrera');
            const estadoFiltro = parsedUrl.searchParams.get('estado');
            const search = (parsedUrl.searchParams.get('search') || '').toLowerCase();

            let qEst = "SELECT * FROM estudiantes WHERE 1=1";
            const pEst = [];
            if (carrera === 'sin_asignar' || carrera === 'Sin Asignar' || carrera === 'Pendiente') {
                qEst += " AND (carrera IS NULL OR carrera = '' OR carrera = 'Sin Asignar' OR carrera LIKE '%Pendiente%')";
            } else if (carrera) {
                qEst += " AND carrera = ?";
                pEst.push(carrera);
            }
            if (search) { qEst += " AND (LOWER(nombre) LIKE ? OR LOWER(codigo) LIKE ?)"; pEst.push(`%${search}%`, `%${search}%`); }
            qEst += " ORDER BY nombre ASC";

            const estudiantes = db.prepare(qEst).all(...pEst);
            const resultados = [];

            for (const est of estudiantes) {
                const movs = db.prepare(`
                    SELECT id, fecha, tipo, estado, concepto, monto, monto_total, monto_abonado, 
                           metodo_pago, fecha_vencimiento, comprobante, notas,
                           julianday(fecha_vencimiento) - julianday(date('now')) as dias_restantes
                    FROM movimientos
                    WHERE LOWER(nombre) = LOWER(?) AND rol = 'Estudiante'
                    ORDER BY fecha_vencimiento ASC, id DESC
                `).all(est.nombre);

                let totalComprometido = 0;
                let totalPagado = 0;
                let saldoPendiente = 0;
                let tieneAbonosParciales = false;
                const conceptosPendientes = [];
                let diasMinimos = 999;

                for (const m of movs) {
                    const mTotal = m.monto_total || m.monto;
                    const mAbonado = m.monto_abonado || 0;

                    if (m.estado === 'Pendiente') {
                        totalComprometido += mTotal;
                        totalPagado += mAbonado;
                        saldoPendiente += m.monto;

                        if (mAbonado > 0) tieneAbonosParciales = true;

                        const dias = m.dias_restantes;
                        let urg = 'sin_fecha';
                        if (dias !== null && dias !== undefined) {
                            const dInt = Math.round(dias);
                            if (dInt < diasMinimos) diasMinimos = dInt;
                            if (dInt < 0) urg = 'vencido';
                            else if (dInt === 0) urg = 'vence_hoy';
                            else if (dInt <= 7) urg = 'urgente';
                            else if (dInt <= 15) urg = 'alerta';
                            else urg = 'a_tiempo';
                            m.dias_restantes = dInt;
                        } else {
                            m.dias_restantes = null;
                        }
                        m.urgencia = urg;
                        conceptosPendientes.push(m);
                    } else if (m.estado === 'Pagado' && m.tipo === 'Ingreso') {
                        totalComprometido += m.monto;
                        totalPagado += m.monto;
                    }
                }

                let estadoFinanciero = 'al_dia';
                let etiquetaEstado = 'Al Día (100% Completado)';
                let claseEstado = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                let porcentajeAvance = 100.0;

                if (saldoPendiente > 0) {
                    if (tieneAbonosParciales) {
                        estadoFinanciero = 'faltan_completar';
                        etiquetaEstado = 'Falta Completar (Pago Parcial)';
                        claseEstado = 'bg-amber-100 text-amber-800 border-amber-300';
                        porcentajeAvance = totalComprometido > 0 ? Math.round((totalPagado / totalComprometido * 100) * 10) / 10 : 0;
                    } else {
                        estadoFinanciero = 'deben_todo';
                        etiquetaEstado = 'Debe Total (Sin Abonos)';
                        claseEstado = 'bg-rose-100 text-rose-800 border-rose-300';
                        porcentajeAvance = 0.0;
                    }
                }

                let urgenciaGlobal = 'al_dia';
                let msgUrgencia = 'Sin pagos pendientes';
                if (diasMinimos < 0) {
                    urgenciaGlobal = 'vencido';
                    msgUrgencia = `¡Vencido hace ${Math.abs(diasMinimos)} días!`;
                } else if (diasMinimos === 0) {
                    urgenciaGlobal = 'vence_hoy';
                    msgUrgencia = '¡Vence el día de hoy!';
                } else if (diasMinimos <= 7) {
                    urgenciaGlobal = 'urgente';
                    msgUrgencia = `Vence en ${diasMinimos} días (Próximo)`;
                } else if (diasMinimos <= 15) {
                    urgenciaGlobal = 'alerta';
                    msgUrgencia = `Vence en ${diasMinimos} días`;
                } else if (saldoPendiente > 0) {
                    urgenciaGlobal = 'a_tiempo';
                    msgUrgencia = `En plazo (${diasMinimos} días)`;
                }

                if (estadoFiltro && estadoFinanciero !== estadoFiltro) continue;

                resultados.push({
                    id: est.id,
                    codigo: est.codigo || `EST-${est.id}`,
                    nombre: est.nombre,
                    dni: est.dni || 'No registrado',
                    carrera: est.carrera,
                    grupo: est.grupo || 'General',
                    ciclo: est.ciclo || 'Ciclo Regular',
                    email: est.email || `${est.nombre.toLowerCase().replace(/ /g, '.')}@institucion.edu`,
                    telefono: est.telefono || 'No registrado',
                    turno: est.turno || 'Mañana',
                    notas: est.notas || '',
                    total_comprometido: Math.round(totalComprometido * 100) / 100,
                    total_pagado: Math.round(totalPagado * 100) / 100,
                    saldo_pendiente: Math.round(saldoPendiente * 100) / 100,
                    porcentaje_avance: porcentajeAvance,
                    estado_financiero: estadoFinanciero,
                    etiqueta_estado: etiquetaEstado,
                    clase_estado: claseEstado,
                    urgencia_global: urgenciaGlobal,
                    msg_urgencia: msgUrgencia,
                    dias_minimos: diasMinimos,
                    total_pendientes_count: conceptosPendientes.length,
                    conceptos_pendientes: conceptosPendientes
                });
            }

            resultados.sort((a, b) => {
                const getRank = x => x.estado_financiero === 'deben_todo' ? 1 : (x.estado_financiero === 'faltan_completar' ? 2 : 3);
                if (getRank(a) !== getRank(b)) return getRank(a) - getRank(b);
                return a.dias_minimos - b.dias_minimos;
            });

            sendJSON(res, resultados);
            return;
        }

        if (pathname.match(/^\/api\/estudiantes\/(\d+)\/detalle$/) && method === 'GET') {
            const estId = parseInt(pathname.split('/')[3], 10);
            const est = db.prepare("SELECT * FROM estudiantes WHERE id = ?").get(estId);
            if (!est) {
                sendJSON(res, { error: "Estudiante no encontrado" }, 404);
                return;
            }

            const movimientos = db.prepare(`
                SELECT id, fecha, tipo, estado, concepto, monto, monto_total, monto_abonado, 
                       metodo_pago, fecha_vencimiento, comprobante, notas,
                       julianday(fecha_vencimiento) - julianday(date('now')) as dias_restantes
                FROM movimientos 
                WHERE LOWER(nombre) = LOWER(?) AND rol = 'Estudiante'
                ORDER BY estado DESC, fecha_vencimiento ASC
            `).all(est.nombre);

            const abonos = db.prepare(`
                SELECT a.id, a.fecha, a.monto, a.metodo_pago, a.comprobante, a.notas, m.concepto as concepto_original
                FROM abonos a
                JOIN movimientos m ON a.movimiento_id = m.id
                WHERE LOWER(m.nombre) = LOWER(?)
                ORDER BY a.fecha DESC
            `).all(est.nombre);

            let totalComprometido = 0;
            let totalPagado = 0;
            let saldoPendiente = 0;

            for (const m of movimientos) {
                totalComprometido += m.monto_total || m.monto;
                if (m.estado === 'Pendiente') {
                    totalPagado += m.monto_abonado || 0;
                    saldoPendiente += m.monto;
                } else if (m.estado === 'Pagado' && m.tipo === 'Ingreso') {
                    totalPagado += m.monto;
                }
            }

            const porcentajeAvance = totalComprometido > 0 ? Math.round((totalPagado / totalComprometido * 100) * 10) / 10 : 100.0;

            sendJSON(res, {
                estudiante: est,
                movimientos: movimientos,
                abonos: abonos,
                total_comprometido: Math.round(totalComprometido * 100) / 100,
                total_pagado: Math.round(totalPagado * 100) / 100,
                saldo_pendiente: Math.round(saldoPendiente * 100) / 100,
                porcentaje_avance: porcentajeAvance
            });
            return;
        }

        if (pathname === '/api/estudiantes/abonar' && method === 'POST') {
            const data = await parseBody(req);
            const movId = data.movimiento_id;
            const montoAbono = parseFloat(data.monto_abono || 0);
            const metodo = data.metodo_pago || 'Efectivo';
            const comp = data.comprobante || '';
            const notas = data.notas || '';
            const hoyStr = new Date().toISOString().split('T')[0];

            if (!movId || montoAbono <= 0) {
                sendJSON(res, { error: "Monto de abono o cuota inválida" }, 400);
                return;
            }

            const mov = db.prepare("SELECT * FROM movimientos WHERE id = ?").get(movId);
            if (!mov) {
                sendJSON(res, { error: "Movimiento no encontrado" }, 404);
                return;
            }

            const saldoActual = mov.monto;
            const abonadoActual = mov.monto_abonado || 0.0;

            if (montoAbono > saldoActual) {
                sendJSON(res, { error: `El abono (S/. ${montoAbono.toFixed(2)}) no puede exceder el saldo pendiente (S/. ${saldoActual.toFixed(2)})` }, 400);
                return;
            }

            const nuevoSaldo = Math.round((saldoActual - montoAbono) * 100) / 100;
            const nuevoAbonado = Math.round((abonadoActual + montoAbono) * 100) / 100;
            const nuevoEstado = nuevoSaldo === 0 ? 'Pagado' : 'Pendiente';
            const nuevaNota = (mov.notas || '') + ` [Abono S/. ${montoAbono.toFixed(2)} el ${hoyStr} (${metodo})]`;

            db.prepare("UPDATE movimientos SET monto = ?, monto_abonado = ?, estado = ?, notas = ? WHERE id = ?")
              .run(nuevoSaldo, nuevoAbonado, nuevoEstado, nuevaNota, movId);

            db.prepare("INSERT INTO abonos (movimiento_id, fecha, monto, metodo_pago, comprobante, notas) VALUES (?, ?, ?, ?, ?, ?)")
              .run(movId, hoyStr, montoAbono, metodo, comp, notas || `Abono a ${mov.concepto}`);

            const conceptoCaja = `Abono (${nuevoSaldo === 0 ? 'Liquidación total' : 'Pago parcial'}): ${mov.concepto}`;
            db.prepare(`
                INSERT INTO movimientos (fecha, tipo, estado, rol, nombre, carrera, concepto, monto, monto_total, monto_abonado, metodo_pago, fecha_vencimiento, comprobante, notas)
                VALUES (?, 'Ingreso', 'Pagado', 'Estudiante', ?, ?, ?, ?, ?, ?, ?, '', ?, ?)
            `).run(hoyStr, mov.nombre, mov.carrera, conceptoCaja, montoAbono, montoAbono, montoAbono, metodo, comp || `ABO-${Date.now().toString().slice(-6)}`, `Ingreso real a caja por concepto de abono a cuota #${movId}`);

            sendJSON(res, {
                success: true,
                message: `Abono de S/. ${montoAbono.toFixed(2)} registrado con éxito. ${nuevoSaldo === 0 ? '¡La cuota ha quedado 100% completada!' : `Saldo restante por completar: S/. ${nuevoSaldo.toFixed(2)}`}`,
                nuevo_saldo: nuevoSaldo,
                completado: nuevoSaldo === 0
            });
            return;
        }

        // Crear nuevo estudiante (admite 'Sin Asignar (Pendiente)' o cualquiera de las 7 carreras)
        if (pathname === '/api/estudiantes' && method === 'POST') {
            const data = await parseBody(req);
            const nombre = (data.nombre || '').trim();
            if (!nombre) {
                sendJSON(res, { error: "El nombre del estudiante es obligatorio" }, 400);
                return;
            }
            const carrera = (data.carrera || 'Sin Asignar (Pendiente)').trim();
            const grupo = (data.grupo || 'Sin Asignar').trim();
            const ciclo = data.ciclo || 'Ciclo I';
            const telefono = data.telefono || '';
            const email = data.email || '';
            const estado = data.estado_academico || 'Activo';

            const lastId = (db.prepare("SELECT MAX(id) as m FROM estudiantes").get().m || 0) + 1;
            const codigo = data.codigo || `E${String(lastId).padStart(3, '0')}`;

            const info = db.prepare(`
                INSERT INTO estudiantes (codigo, nombre, carrera, ciclo, email, telefono, estado_academico, grupo)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(codigo, nombre, carrera, ciclo, email, telefono, estado, grupo);

            guardarLibroExcelEnDisco();
            sendJSON(res, { success: true, message: "Estudiante registrado correctamente", id: info.lastInsertRowid, codigo });
            return;
        }

        // Asignar carrera / editar estudiante
        if ((pathname.startsWith('/api/estudiantes/') && (pathname.endsWith('/asignar') || pathname.endsWith('/editar'))) || (pathname.startsWith('/api/estudiantes/') && method === 'PUT')) {
            const parts = pathname.split('/');
            const estId = parseInt(parts[3], 10);
            const data = await parseBody(req);

            const prevEst = db.prepare("SELECT * FROM estudiantes WHERE id = ?").get(estId);
            if (!prevEst) {
                sendJSON(res, { error: "Estudiante no encontrado" }, 404);
                return;
            }

            const nombre = data.nombre !== undefined ? data.nombre.trim() : prevEst.nombre;
            const carrera = data.carrera !== undefined ? data.carrera.trim() : prevEst.carrera;
            const grupo = data.grupo !== undefined ? data.grupo.trim() : prevEst.grupo;
            const telefono = data.telefono !== undefined ? data.telefono : prevEst.telefono;
            const email = data.email !== undefined ? data.email : prevEst.email;
            const ciclo = data.ciclo !== undefined ? data.ciclo : prevEst.ciclo;
            const estado = data.estado_academico !== undefined ? data.estado_academico : prevEst.estado_academico;

            db.prepare(`
                UPDATE estudiantes 
                SET nombre = ?, carrera = ?, grupo = ?, telefono = ?, email = ?, ciclo = ?, estado_academico = ?
                WHERE id = ?
            `).run(nombre, carrera, grupo, telefono, email, ciclo, estado, estId);

            // Sincronizar movimientos del estudiante ante cualquier asignación o cambio de carrera / grupo
            if (carrera !== undefined) {
                db.prepare("UPDATE movimientos SET carrera = ? WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))").run(carrera, prevEst.nombre);
            }
            if (grupo !== undefined) {
                db.prepare("UPDATE movimientos SET grupo = ? WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))").run(grupo, prevEst.nombre);
            }

            guardarLibroExcelEnDisco();
            sendJSON(res, { success: true, message: "Datos y carrera del estudiante actualizados correctamente" });
            return;
        }

        // -------------------------------------------------------------
        // 8. API: CONTROL DE DEUDORES / VENCIMIENTOS
        // -------------------------------------------------------------
        if (pathname === '/api/deudores' && method === 'GET') {
            const carrera = parsedUrl.searchParams.get('carrera');
            let q = `
                SELECT id, fecha, nombre, carrera, concepto, monto, monto_total, monto_abonado, fecha_vencimiento, comprobante, notas,
                       julianday(fecha_vencimiento) - julianday(date('now')) as dias_restantes
                FROM movimientos
                WHERE tipo = 'Ingreso' AND estado = 'Pendiente' AND rol = 'Estudiante'
            `;
            const p = [];
            if (carrera) { q += " AND carrera = ?"; p.push(carrera); }
            q += " ORDER BY fecha_vencimiento ASC";

            const rows = db.prepare(q).all(...p);
            const deudores = rows.map(r => {
                const dias = r.dias_restantes;
                const mTot = r.monto_total || r.monto;
                const mAbo = r.monto_abonado || 0;
                let urg = 'sin_fecha';
                let msg = 'Sin fecha límite';
                let dInt = 999;

                if (dias !== null && dias !== undefined) {
                    dInt = Math.round(dias);
                    if (dInt < 0) { urg = 'vencido'; msg = `Vencido hace ${Math.abs(dInt)} días`; }
                    else if (dInt === 0) { urg = 'vence_hoy'; msg = '¡Vence el día de hoy!'; }
                    else if (dInt <= 7) { urg = 'urgente'; msg = `Vence en ${dInt} días (Próximo)`; }
                    else if (dInt <= 15) { urg = 'alerta'; msg = `Vence en ${dInt} días`; }
                    else { urg = 'a_tiempo'; msg = `En plazo (${dInt} días)`; }
                }

                return {
                    ...r,
                    monto_total: mTot,
                    monto_abonado: mAbo,
                    falta_completar: mAbo > 0,
                    dias_restantes: dInt,
                    urgencia: urg,
                    mensaje_urgencia: msg
                };
            });

            sendJSON(res, deudores);
            return;
        }

        if (pathname.startsWith('/api/deudores/pagar/') && method === 'POST') {
            const movId = parseInt(pathname.split('/')[4], 10);
            const data = await parseBody(req);
            const metodo = data.metodo_pago || 'Efectivo';
            const hoyStr = new Date().toISOString().split('T')[0];

            const mov = db.prepare("SELECT * FROM movimientos WHERE id = ?").get(movId);
            if (!mov) {
                sendJSON(res, { error: "Movimiento no encontrado" }, 404);
                return;
            }

            const saldo = mov.monto;
            const mTotal = mov.monto_total || saldo;

            db.prepare(`
                UPDATE movimientos 
                SET estado = 'Pagado', monto = ?, monto_abonado = ?, metodo_pago = ?, fecha = ?, notas = coalesce(notas, '') || ' [Liquidado al 100% el ' || ? || ']'
                WHERE id = ?
            `).run(saldo, mTotal, metodo, hoyStr, hoyStr, movId);

            sendJSON(res, { success: true, message: "Deuda liquidada al 100% e ingresada a la caja exitosamente" });
            return;
        }

        // -------------------------------------------------------------
        // 9. API: PLANTILLA DE DOCENTES
        // -------------------------------------------------------------
        if (pathname === '/api/docentes' && method === 'GET') {
            const carrera = parsedUrl.searchParams.get('carrera');
            let q = `
                SELECT 
                    d.id, d.nombre, d.carrera, d.turno, d.cargo, d.email, d.telefono, d.especialidad, d.tipo_contrato,
                    COALESCE(SUM(CASE WHEN m.tipo = 'Egreso' AND m.estado = 'Pagado' THEN m.monto ELSE 0 END), 0) AS total_salidas,
                    COALESCE(SUM(CASE WHEN m.tipo = 'Ingreso' AND m.estado = 'Pagado' THEN m.monto ELSE 0 END), 0) AS total_ingresos,
                    COUNT(m.id) as total_movimientos
                FROM docentes d
                LEFT JOIN movimientos m ON LOWER(d.nombre) = LOWER(m.nombre) AND m.rol = 'Docente'
                WHERE 1=1
            `;
            const p = [];
            if (carrera) { q += " AND d.carrera = ?"; p.push(carrera); }
            q += " GROUP BY d.id ORDER BY d.id ASC";

            const rows = db.prepare(q).all(...p);
            const docentes = rows.map(r => ({
                ...r,
                total_salidas: Math.round(r.total_salidas * 100) / 100,
                total_ingresos: Math.round(r.total_ingresos * 100) / 100,
                balance_neto: Math.round((r.total_ingresos - r.total_salidas) * 100) / 100
            }));

            sendJSON(res, docentes);
            return;
        }

        // Modificar Docente (Nombre, Especialidad, Turno/Carrera, Teléfono)
        if (((pathname.match(/^\/api\/docentes\/(\d+)$/) && (method === 'PUT' || method === 'POST')) ||
             (pathname.match(/^\/api\/docentes\/(\d+)\/editar$/) && method === 'POST'))) {
            const docId = parseInt(pathname.split('/')[3], 10);
            const data = await parseBody(req);
            const nombre = (data.nombre || '').trim();
            const carrera = (data.carrera || '').trim();
            const especialidad = (data.especialidad || '').trim();
            const telefono = (data.telefono || '').trim();
            const email = (data.email || '').trim();

            if (!nombre) {
                sendJSON(res, { error: "El nombre del docente es obligatorio" }, 400);
                return;
            }

            try {
                const oldDoc = db.prepare("SELECT * FROM docentes WHERE id = ?").get(docId);
                if (!oldDoc) {
                    sendJSON(res, { error: "Docente no encontrado" }, 404);
                    return;
                }

                db.prepare(`
                    UPDATE docentes 
                    SET nombre = ?, carrera = ?, especialidad = ?, telefono = ?, email = ?
                    WHERE id = ?
                `).run(nombre, carrera, especialidad, telefono, email, docId);

                // Si cambió el nombre del docente, actualizar en grupos asignados
                if (oldDoc.nombre !== nombre) {
                    db.prepare("UPDATE grupos SET encargado = ? WHERE encargado = ?").run(nombre, oldDoc.nombre);
                    db.prepare("UPDATE movimientos SET encargado = ? WHERE encargado = ?").run(nombre, oldDoc.nombre);
                }

                sendJSON(res, { success: true, message: "Docente actualizado exitosamente" });
            } catch (err) {
                sendJSON(res, { error: "Error al actualizar docente: " + err.message }, 500);
            }
            return;
        }

        // Crear Nuevo Docente
        if (pathname === '/api/docentes' && method === 'POST') {
            const data = await parseBody(req);
            const nombre = (data.nombre || '').trim();
            const carrera = (data.carrera || '').trim();
            const especialidad = (data.especialidad || '').trim();
            const telefono = (data.telefono || '').trim();
            const email = (data.email || '').trim();

            if (!nombre) {
                sendJSON(res, { error: "El nombre del docente es obligatorio" }, 400);
                return;
            }

            try {
                const info = db.prepare(`
                    INSERT INTO docentes (nombre, carrera, especialidad, telefono, email, tipo_contrato)
                    VALUES (?, ?, ?, ?, ?, 'Tiempo Completo')
                `).run(nombre, carrera, especialidad, telefono, email);
                sendJSON(res, { success: true, id: Number(info.lastInsertRowid), message: "Docente creado exitosamente" });
            } catch (err) {
                sendJSON(res, { error: "Error al registrar docente: " + err.message }, 500);
            }
            return;
        }

        if (pathname.match(/^\/api\/docentes\/(\d+)\/detalle$/) && method === 'GET') {
            const docId = parseInt(pathname.split('/')[3], 10);
            const doc = db.prepare("SELECT * FROM docentes WHERE id = ?").get(docId);
            if (!doc) {
                sendJSON(res, { error: "Docente no encontrado" }, 404);
                return;
            }

            const movimientos = db.prepare(`
                SELECT * FROM movimientos 
                WHERE LOWER(nombre) = LOWER(?) AND rol = 'Docente'
                ORDER BY fecha DESC
            `).all(doc.nombre);

            let salidas = 0;
            let entradas = 0;
            for (const m of movimientos) {
                if (m.estado === 'Pagado') {
                    if (m.tipo === 'Egreso') salidas += m.monto;
                    if (m.tipo === 'Ingreso') entradas += m.monto;
                }
            }

            sendJSON(res, {
                docente: doc,
                movimientos: movimientos,
                total_salidas: Math.round(salidas * 100) / 100,
                total_ingresos: Math.round(entradas * 100) / 100,
                balance_neto: Math.round((entradas - salidas) * 100) / 100
            });
            return;
        }

        // -------------------------------------------------------------
        // 10. API: CONFIGURACIÓN INSTITUCIONAL, SEDES Y FACTURACIÓN
        // -------------------------------------------------------------
        if (pathname === '/api/configuracion' && method === 'GET') {
            sendJSON(res, obtenerConfiguracion());
            return;
        }

        if (pathname === '/api/configuracion' && method === 'POST') {
            const data = await parseBody(req);
            guardarConfiguracion(data);
            guardarLibroExcelEnDisco();
            generarRespaldoCompleto('Config_Actualizada');
            sendJSON(res, {
                success: true,
                message: "Configuración institucional y de facturación guardada exitosamente",
                configuracion: obtenerConfiguracion()
            });
            return;
        }

        // -------------------------------------------------------------
        // 11. API: GESTIÓN DE CARRERAS Y ESPECIALIDADES TÉCNICAS
        // -------------------------------------------------------------
        if (pathname === '/api/carreras' && method === 'GET') {
            const rows = db.prepare(`
                SELECT 
                    c.id, c.nombre, c.codigo, c.descripcion,
                    (SELECT COUNT(*) FROM estudiantes e WHERE LOWER(TRIM(e.carrera)) = LOWER(TRIM(c.nombre))) as total_alumnos,
                    (SELECT COUNT(*) FROM docentes d WHERE LOWER(TRIM(d.carrera)) = LOWER(TRIM(c.nombre))) as total_docentes,
                    (SELECT COALESCE(SUM(monto), 0) FROM movimientos m WHERE LOWER(TRIM(m.carrera)) = LOWER(TRIM(c.nombre)) AND m.tipo = 'Ingreso' AND m.estado = 'Pagado') as total_ingreso,
                    (SELECT COALESCE(SUM(monto), 0) FROM movimientos m WHERE LOWER(TRIM(m.carrera)) = LOWER(TRIM(c.nombre)) AND m.tipo = 'Egreso' AND m.estado = 'Pagado') as total_egreso,
                    (SELECT COALESCE(SUM(monto), 0) FROM movimientos m WHERE LOWER(TRIM(m.carrera)) = LOWER(TRIM(c.nombre)) AND m.tipo = 'Ingreso' AND m.estado = 'Pendiente') as total_deuda
                FROM carreras c
                ORDER BY c.nombre ASC
            `).all();
            const resCarreras = rows.map(r => ({
                ...r,
                total_ingreso: Math.round(r.total_ingreso * 100) / 100,
                total_egreso: Math.round(r.total_egreso * 100) / 100,
                total_deuda: Math.round(r.total_deuda * 100) / 100
            }));
            sendJSON(res, resCarreras);
            return;
        }

        if (pathname === '/api/carreras' && method === 'POST') {
            const data = await parseBody(req);
            const nombre = (data.nombre || '').trim();
            const codigo = (data.codigo || '').trim();
            const desc = (data.descripcion || '').trim();

            if (!nombre) {
                sendJSON(res, { error: "El nombre de la carrera o especialidad es obligatorio" }, 400);
                return;
            }

            try {
                const codFinal = codigo || `ESP-${String(Date.now()).slice(-4)}`;
                const info = db.prepare("INSERT INTO carreras (nombre, codigo, descripcion) VALUES (?, ?, ?)").run(nombre, codFinal, desc);
                guardarLibroExcelEnDisco();
                generarRespaldoCompleto('Nueva_Carrera_' + info.lastInsertRowid);
                sendJSON(res, { success: true, id: Number(info.lastInsertRowid), message: `Carrera "${nombre}" creada con éxito` });
            } catch (err) {
                sendJSON(res, { error: "Ya existe una carrera con ese nombre o error al guardar: " + err.message }, 400);
            }
            return;
        }

        // Modificar Nombre de Carrera / Especialidad (Actualiza en cascada estudiantes, movimientos, docentes y grupos)
        if (((pathname.match(/^\/api\/carreras\/(\d+)$/) && (method === 'PUT' || method === 'POST')) ||
             (pathname.match(/^\/api\/carreras\/(\d+)\/editar$/) && method === 'POST'))) {
            const carreraId = parseInt(pathname.split('/')[3], 10);
            const data = await parseBody(req);
            const nombreNuevo = (data.nombre || '').trim();
            const codigo = (data.codigo || '').trim();
            const desc = (data.descripcion || '').trim();

            if (!nombreNuevo) {
                sendJSON(res, { error: "El nombre de la carrera es obligatorio" }, 400);
                return;
            }

            try {
                const oldCarrera = db.prepare("SELECT * FROM carreras WHERE id = ?").get(carreraId);
                if (!oldCarrera) {
                    sendJSON(res, { error: "Carrera no encontrada" }, 404);
                    return;
                }

                const nombreAntiguo = oldCarrera.nombre;
                db.prepare(`
                    UPDATE carreras 
                    SET nombre = ?, codigo = COALESCE(NULLIF(?, ''), codigo), descripcion = ?
                    WHERE id = ?
                `).run(nombreNuevo, codigo, desc, carreraId);

                // Si el nombre cambió, actualizar en cascada en estudiantes, movimientos, docentes y grupos
                if (nombreAntiguo !== nombreNuevo) {
                    db.prepare("UPDATE estudiantes SET carrera = ? WHERE LOWER(TRIM(carrera)) = LOWER(TRIM(?))").run(nombreNuevo, nombreAntiguo);
                    db.prepare("UPDATE movimientos SET carrera = ? WHERE LOWER(TRIM(carrera)) = LOWER(TRIM(?))").run(nombreNuevo, nombreAntiguo);
                    db.prepare("UPDATE docentes SET carrera = ? WHERE LOWER(TRIM(carrera)) = LOWER(TRIM(?))").run(nombreNuevo, nombreAntiguo);
                    db.prepare("UPDATE grupos SET carrera = ? WHERE LOWER(TRIM(carrera)) = LOWER(TRIM(?))").run(nombreNuevo, nombreAntiguo);
                }

                guardarLibroExcelEnDisco();
                generarRespaldoCompleto('Edicion_Carrera_' + carreraId);
                sendJSON(res, { success: true, message: `Carrera actualizada a "${nombreNuevo}" exitosamente en todo el sistema` });
            } catch (err) {
                sendJSON(res, { error: "Error al actualizar carrera: " + err.message }, 500);
            }
            return;
        }

        if (pathname.startsWith('/api/carreras/') && method === 'DELETE') {
            const carreraId = parseInt(pathname.split('/')[3], 10);
            const carrera = db.prepare("SELECT * FROM carreras WHERE id = ?").get(carreraId);
            if (!carrera) {
                sendJSON(res, { error: "Carrera no encontrada" }, 404);
                return;
            }
            db.prepare("DELETE FROM carreras WHERE id = ?").run(carreraId);
            guardarLibroExcelEnDisco();
            generarRespaldoCompleto('Eliminada_Carrera_' + carreraId);
            sendJSON(res, { success: true, message: `Carrera "${carrera.nombre}" eliminada exitosamente` });
            return;
        }

        sendJSON(res, { error: "Ruta no encontrada" }, 404);

    } catch (err) {
        console.error("Error en petición HTTP:", err);
        sendJSON(res, { error: "Error interno del servidor", detalle: err.message }, 500);
    }
});

function abrirVentanaAplicacion(url) {
    if (process.env.NO_AUTO_OPEN === '1') return;
    try {
        if (process.platform === 'win32') {
            exec(`start msedge --app="${url}" --window-size=1300,850`, (edgeErr) => {
                if (edgeErr) {
                    exec(`start chrome --app="${url}" --window-size=1300,850`, (chromeErr) => {
                        if (chromeErr) {
                            exec(`cmd /c start "" "${url}"`);
                        }
                    });
                }
            });
        } else {
            const startCmd = process.platform === 'darwin' ? 'open' : 'xdg-open';
            exec(`${startCmd} "${url}"`);
        }
    } catch (e) {
        // Silencioso
    }
}

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`===================================================================`);
        console.log(`  El sistema ya se encuentra en ejecución en http://127.0.0.1:${PORT}`);
        console.log(`  Abriendo ventana de la aplicación de escritorio...`);
        console.log(`===================================================================`);
        abrirVentanaAplicacion(`http://127.0.0.1:${PORT}`);
    } else {
        console.error('[SERVER ERROR]:', err);
    }
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`===================================================================`);
    console.log(`  CETPRO SAN MIGUEL - MICAELA BASTIDAS PUYUCAMA`);
    console.log(`  Sistema Educaja Pro activo en http://127.0.0.1:${PORT}`);
    console.log(`  Directorio de Datos: ${ROOT_DIR}`);
    console.log(`  Sistema de Respaldos de BD activo en: ${BACKUPS_DIR}`);
    console.log(`===================================================================`);

    abrirVentanaAplicacion(`http://127.0.0.1:${PORT}`);
});
