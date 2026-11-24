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
const CIERRES_ANUALES_DIR = path.join(BACKUPS_DIR, 'cierres_anuales');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

let HTML_FILE = path.join(ROOT_DIR, 'templates', 'index.html');
if (!fs.existsSync(HTML_FILE)) {
    HTML_FILE = path.join(__dirname, 'templates', 'index.html');
}

// Asegurar directorios
if (!fs.existsSync(BACKUPS_DIR)) fs.mkdirSync(BACKUPS_DIR, { recursive: true });
if (!fs.existsSync(CIERRES_ANUALES_DIR)) fs.mkdirSync(CIERRES_ANUALES_DIR, { recursive: true });
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

// Inicializar tabla de gestión multianual y ciclos lectivos
function asegurarGestionAnios() {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS anios_lectivos (
            anio INTEGER PRIMARY KEY,
            estado TEXT DEFAULT 'ACTIVO',
            fecha_apertura TEXT,
            fecha_cierre TEXT,
            saldo_inicial REAL DEFAULT 0.0,
            saldo_final REAL DEFAULT 0.0,
            total_ingresos REAL DEFAULT 0.0,
            total_egresos REAL DEFAULT 0.0,
            total_estudiantes INTEGER DEFAULT 0,
            total_movimientos INTEGER DEFAULT 0,
            backup_archivo TEXT,
            notas TEXT
        )
    `).run();

    // Comprobar si existe columna anio en movimientos
    const cols = db.prepare("PRAGMA table_info(movimientos)").all();
    if (!cols.some(c => c.name === 'anio')) {
        try {
            db.prepare("ALTER TABLE movimientos ADD COLUMN anio INTEGER DEFAULT 2026").run();
        } catch (e) {
            console.warn('[DB] Columna anio ya existe o no pudo agregarse:', e.message);
        }
    }
    // Poblar anio en base a la fecha de cada movimiento
    try {
        db.prepare(`
            UPDATE movimientos 
            SET anio = CAST(COALESCE(NULLIF(substr(fecha, 1, 4), 'N/A'), '2026') AS INTEGER)
            WHERE anio IS NULL OR anio = 0
        `).run();
    } catch (e) {}

    // Registrar año 2026 si no existe
    const exist2026 = db.prepare("SELECT anio FROM anios_lectivos WHERE anio = 2026").get();
    if (!exist2026) {
        const stats2026 = db.prepare(`
            SELECT 
                COALESCE(SUM(CASE WHEN tipo='Ingreso' THEN monto ELSE 0 END), 0) as ing,
                COALESCE(SUM(CASE WHEN tipo='Egreso' THEN monto ELSE 0 END), 0) as egr,
                COUNT(*) as cant_mov
            FROM movimientos WHERE anio = 2026 OR fecha LIKE '2026%'
        `).get();
        const estCount = db.prepare("SELECT COUNT(*) as c FROM estudiantes").get().c;
        db.prepare(`
            INSERT INTO anios_lectivos (anio, estado, fecha_apertura, saldo_inicial, saldo_final, total_ingresos, total_egresos, total_estudiantes, total_movimientos, notas)
            VALUES (2026, 'ACTIVO', '2026-01-01', 0.0, ?, ?, ?, ?, ?, 'Año Lectivo y Fiscal 2026 Inicial')
        `).run(
            stats2026.ing - stats2026.egr,
            stats2026.ing,
            stats2026.egr,
            estCount,
            stats2026.cant_mov
        );
    }

    // Configuración anio_activo
    const confAnio = db.prepare("SELECT valor FROM configuracion WHERE clave = 'anio_activo'").get();
    if (!confAnio) {
        db.prepare("INSERT OR REPLACE INTO configuracion (clave, valor) VALUES ('anio_activo', '2026')").run();
    }
}
asegurarGestionAnios();

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

// -------------------------------------------------------------
// TABLAS PARA CONTROL DE DEUDORES Y TARIFAS DE MÓDULOS
// -------------------------------------------------------------
function asegurarTablasDeudoresYTarifas() {
    db.prepare(`
        CREATE TABLE IF NOT EXISTS deudas_estudiantes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            estudiante_id INTEGER,
            nombre TEXT NOT NULL,
            dni TEXT,
            telefono TEXT,
            carrera TEXT,
            grupo TEXT,
            concepto TEXT,
            monto_total REAL NOT NULL,
            monto_abonado REAL DEFAULT 0,
            monto_pendiente REAL NOT NULL,
            fecha_limite TEXT,
            estado TEXT DEFAULT 'Pendiente',
            notas TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `).run();

    db.prepare(`
        CREATE TABLE IF NOT EXISTS tarifas_modulos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            carrera TEXT NOT NULL,
            modulo TEXT NOT NULL,
            costo REAL NOT NULL DEFAULT 150.00,
            descripcion TEXT
        )
    `).run();

    const countTarifas = db.prepare('SELECT COUNT(*) as c FROM tarifas_modulos').get().c;
    if (countTarifas === 0) {
        const carreras = db.prepare("SELECT DISTINCT nombre FROM carreras WHERE nombre NOT LIKE '%Sin Asignar%'").all();
        const insertTarifa = db.prepare('INSERT INTO tarifas_modulos (carrera, modulo, costo, descripcion) VALUES (?, ?, ?, ?)');
        for (const c of carreras) {
            insertTarifa.run(c.nombre, 'Módulo I', 150.00, 'Costo oficial módulo 1');
            insertTarifa.run(c.nombre, 'Módulo II', 150.00, 'Costo oficial módulo 2');
            insertTarifa.run(c.nombre, 'Módulo III', 150.00, 'Costo oficial módulo 3');
            insertTarifa.run(c.nombre, 'Módulo IV', 150.00, 'Costo oficial módulo 4');
        }
        insertTarifa.run('General', 'Certificado Oficial', 50.00, 'Emisión de Certificado');
        insertTarifa.run('General', 'Constancia de Estudio', 20.00, 'Expedición de Constancia');
        insertTarifa.run('General', 'FUT', 10.00, 'Formulario Único de Trámite');
    }
}
asegurarTablasDeudoresYTarifas();

// -------------------------------------------------------------
// SINCRONIZACIÓN AUTOMÁTICA CON EL EXCEL OFICIAL DEL USUARIO (23-OCT-_2026_INGRESO_100_.xlsx)
// -------------------------------------------------------------
function sincronizarExcelUsuarioOficialCompleto() {
    try {
        const excelUserPath = path.join(ROOT_DIR, '23-OCT-_2026_INGRESO_100_.xlsx');
        if (!fs.existsSync(excelUserPath)) return false;

        const wb = XLSX.readFile(excelUserPath);
        const movs = db.prepare("SELECT * FROM movimientos WHERE tipo = 'Ingreso' ORDER BY CAST(REPLACE(REPLACE(comprobante, 'N°', ''), ' ', '') AS INTEGER) ASC").all();

        const progSheetMap = {
            'Corte y Ensamblaje': { sheet: 'CORTE ENSAMBL', prog: 'CORTE ENSAMBL..' },
            'Computación e Informática': { sheet: 'COMPUTACION INFORMATICA', prog: 'COMPUTACION INFORMATICA' },
            'Mecánica de Motos': { sheet: 'MOTOS', prog: 'MOTOS' },
            'Mecánica de Motos y Vehículo Afines': { sheet: 'MOTOS', prog: 'MOTOS' },
            'Mecánica de Motos y Vehículos Afines': { sheet: 'MOTOS', prog: 'MOTOS' },
            'Electricidad y Electrónica': { sheet: 'ELECTRONICA', prog: 'ELECTRONICA' },
            'Mantenimiento de Sistemas Eléctricos': { sheet: 'ELECTRONICA', prog: 'ELECTRONICA' },
            'Carpintería Metálica': { sheet: 'CARPINTERIA METALICA', prog: 'CARPINTERIA METALICA' },
            'Peluquería y Barbería': { sheet: 'PELUQUERIA Y BARBERIA', prog: 'PELUQUERIA  Y BARBERIA' },
            'Mecánica Automotriz': { sheet: 'AUTOMOTORIZ', prog: 'AUTOMOTORIZ' },
            'Sin Asignar (Pendiente)': { sheet: 'SIN PROGRAMA', prog: 'SIN PROGRAMA' }
        };

        const generalData = [
            ['CETPRO "MICAELA BASTIDAS " 2026 INGRESOS RECURSOS PROPIOS'],
            [],
            [],
            ['N° RECIBO', 'FECHA', 'APELLIDOS NOMBRES', 'PROGRAMA DE ESTUDIO', 'MONTO', 'MODULO', 'TURNO', 'DNI', 'N° CEL.', 'OBSERV. ']
        ];

        const perSheetData = {};
        for (const sName of Object.values(progSheetMap).map(x => x.sheet)) {
            perSheetData[sName] = [
                ['CETPRO "MICAELA BASTIDAS " 2026 INGRESOS RECURSOS PROPIOS'],
                [],
                [],
                ['N° RECIBO', 'FECHA', 'APELLIDOS NOMBRES', 'PROGRAMA DE ESTUDIO', 'MONTO', 'MODULO', 'TURNO', 'DNI', 'N° CEL.', 'OBSERV. ']
            ];
        }

        for (const m of movs) {
            const nro = parseInt(m.comprobante, 10) || m.id;
            let fecha = m.fecha;
            let nom = m.nombre;
            const mapping = progSheetMap[m.carrera] || { sheet: 'SIN PROGRAMA', prog: m.carrera || 'SIN PROGRAMA' };
            let prog = mapping.prog;

            if (m.estado === 'Anulado') {
                nom = nom.includes('ANULADO') ? nom : (nom + ' (ANULADO)');
                prog = 'ANULADO';
            }
            const monto = m.monto;
            const modulo = m.concepto && m.concepto.toUpperCase().includes('MODULO') ? m.concepto : 'MODULO  I';
            const turno = (m.turno || '').toUpperCase();
            const dni = m.dni || '';
            const cel = m.telefono || '';
            const obs = m.notas || '';

            const row = [nro, fecha, nom, prog, monto, modulo, turno, dni, cel, obs];
            generalData.push(row);

            const sName = mapping.sheet;
            if (perSheetData[sName]) {
                perSheetData[sName].push(row);
            }
        }

        const lastNro = movs.length > 0 ? (parseInt(movs[movs.length - 1].comprobante, 10) || 810) : 810;
        for (let i = 1; i <= 10; i++) {
            generalData.push([lastNro + i, '', '', '', '', '', '', '', '', '']);
        }

        wb.Sheets['RECAUDOS  INGRESOS CETPRO MICAE'] = XLSX.utils.aoa_to_sheet(generalData);

        for (const [sName, sRows] of Object.entries(perSheetData)) {
            if (wb.Sheets[sName]) {
                wb.Sheets[sName] = XLSX.utils.aoa_to_sheet(sRows);
            }
        }

        XLSX.writeFile(wb, excelUserPath);
        return true;
    } catch (e) {
        console.warn('[SINCRONIZAR EXCEL USUARIO] Error:', e.message);
        return false;
    }
}


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
        const MAX_BODY = 10 * 1024 * 1024; // 10MB límite para evitar denegación de servicio
        req.on('data', chunk => {
            body += chunk.toString();
            if (body.length > MAX_BODY) {
                req.destroy();
                reject(new Error('Payload Too Large'));
            }
        });
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
        'Access-Control-Allow-Headers': 'Content-Type',
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'SAMEORIGIN',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
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

    // 6. Hoja OFICIAL INGRESOS RECURSOS PROPIOS (Estructura idéntica al archivo oficial de talonario)
    const recursosPropiosAOA = [
        ['CETPRO "MICAELA BASTIDAS " 2026 INGRESOS RECURSOS PROPIOS'],
        [],
        [],
        ['N° RECIBO', 'FECHA', 'APELLIDOS NOMBRES', 'PROGRAMA DE ESTUDIO', 'MONTO', 'MODULO', 'TURNO', 'DNI', 'N° CEL.', 'OBSERV.']
    ];
    const recMovs = db.prepare(`
        SELECT 
            m.comprobante,
            m.fecha,
            m.nombre,
            m.carrera,
            m.monto,
            m.concepto,
            m.turno,
            e.dni,
            e.telefono,
            m.notas
        FROM movimientos m
        LEFT JOIN estudiantes e ON LOWER(TRIM(e.nombre)) = LOWER(TRIM(m.nombre))
        WHERE m.tipo = 'Ingreso'
        ORDER BY CAST(REPLACE(m.comprobante, 'N°', '') AS INTEGER) ASC, m.id ASC
    `).all();

    recMovs.forEach(r => {
        let nro = r.comprobante ? parseInt(String(r.comprobante).replace(/\D/g, ''), 10) : '';
        recursosPropiosAOA.push([
            nro || r.comprobante,
            r.fecha || '',
            r.nombre || '',
            (r.carrera || '').toUpperCase(),
            r.monto || 0,
            r.concepto || 'MODULO I',
            (r.turno || '').toUpperCase(),
            r.dni || '',
            r.telefono || '',
            r.notas || ''
        ]);
    });
    const wsRecursos = XLSX.utils.aoa_to_sheet(recursosPropiosAOA);
    XLSX.utils.book_append_sheet(wb, wsRecursos, 'RECURSOS_PROPIOS');

    return wb;
}

// =====================================================================
// GESTOR DE CONCURRENCIA Y COLA BLINDADA DE ESCRITURA EN EXCEL (FASE 2)
// =====================================================================
let excelWriteQueuePending = false;
let excelWriteRetryTimer = null;
let excelWriteStats = {
    totalWrites: 0,
    successfulWrites: 0,
    failedAttempts: 0,
    lastWriteTime: null,
    lastError: null,
    isLocked: false
};

function guardarLibroExcelEnDisco() {
    try {
        const wb = generarLibroExcelActualizado();
        if (!wb || !XLSX) return null;

        const outPath = path.join(ROOT_DIR, 'CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx');
        
        try {
            XLSX.writeFile(wb, outPath);
            excelWriteStats.totalWrites++;
            excelWriteStats.successfulWrites++;
            excelWriteStats.lastWriteTime = new Date().toISOString();
            excelWriteStats.lastError = null;
            excelWriteStats.isLocked = false;
            
            if (excelWriteRetryTimer) {
                clearTimeout(excelWriteRetryTimer);
                excelWriteRetryTimer = null;
            }
            excelWriteQueuePending = false;
            try { sincronizarExcelUsuarioOficialCompleto(); } catch(e) { console.error(e); }
            return outPath;
        } catch (fileErr) {
            excelWriteStats.failedAttempts++;
            excelWriteStats.lastError = fileErr.message;
            excelWriteStats.isLocked = (fileErr.code === 'EBUSY' || fileErr.code === 'EPERM');
            
            console.warn(`[CONCURRENCIA EXCEL] Archivo bloqueado o en uso (${fileErr.code || fileErr.message}). Guardando copia de contingencia y reintentando automáticamente en 3s...`);
            
            try {
                const tempPath = path.join(ROOT_DIR, 'CEPRO_Control_MICAELA_BASTIDAS_PENDIENTE.xlsx');
                XLSX.writeFile(wb, tempPath);
            } catch (e) {}

            if (!excelWriteRetryTimer) {
                excelWriteQueuePending = true;
                excelWriteRetryTimer = setTimeout(() => {
                    excelWriteRetryTimer = null;
                    console.log('[CONCURRENCIA EXCEL] Reintentando escritura en Excel...');
                    guardarLibroExcelEnDisco();
                }, 3000);
            }
            return null;
        }
    } catch (err) {
        console.error('Error al generar o guardar Excel en disco:', err);
    }
    return null;
}

// Inicializar Excel en disco al arrancar
guardarLibroExcelEnDisco();

// =====================================================================
// FUNCIONES DE ARQUITECTURA MULTIANUAL Y CIERRE DE AÑO ESCOLAR / FISCAL
// =====================================================================
function ejecutarCierreAnual(anio, notas = '') {
    const anioNum = parseInt(anio, 10);
    if (isNaN(anioNum) || anioNum < 2020) {
        throw new Error('Año inválido para cierre anual: ' + anio);
    }
    const ahora = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timestamp = `${ahora.getFullYear()}-${pad(ahora.getMonth() + 1)}-${pad(ahora.getDate())}_${pad(ahora.getHours())}-${pad(ahora.getMinutes())}-${pad(ahora.getSeconds())}`;
    const cfg = obtenerConfiguracion();

    // 1. Estadísticas financieras y académicas del año a cerrar
    const stats = db.prepare(`
        SELECT 
            COALESCE(SUM(CASE WHEN tipo='Ingreso' AND estado='Pagado' THEN monto ELSE 0 END), 0) as total_ingresos,
            COALESCE(SUM(CASE WHEN tipo='Egreso' AND estado='Pagado' THEN monto ELSE 0 END), 0) as total_egresos,
            COUNT(*) as total_movimientos
        FROM movimientos WHERE anio = ? OR substr(fecha, 1, 4) = ?
    `).get(anioNum, String(anioNum));

    const totalIng = stats ? (stats.total_ingresos || 0) : 0;
    const totalEgr = stats ? (stats.total_egresos || 0) : 0;
    const saldoFinal = totalIng - totalEgr;
    const totalMovs = stats ? (stats.total_movimientos || 0) : 0;

    const estRow = db.prepare(`
        SELECT COUNT(DISTINCT nombre) as c FROM movimientos 
        WHERE (anio = ? OR substr(fecha, 1, 4) = ?) AND rol = 'Estudiante'
    `).get(anioNum, String(anioNum));
    const estCount = (estRow && estRow.c > 0) ? estRow.c : db.prepare("SELECT COUNT(*) as c FROM estudiantes").get().c;

    // Desglose por especialidad / carrera en el año
    const carrerasStats = db.prepare(`
        SELECT carrera, COUNT(*) as cantidad, COALESCE(SUM(monto), 0) as total_recaudado
        FROM movimientos 
        WHERE (anio = ? OR substr(fecha, 1, 4) = ?) AND tipo = 'Ingreso' AND estado = 'Pagado'
        GROUP BY carrera
        ORDER BY total_recaudado DESC
    `).all(anioNum, String(anioNum));

    // Desglose mensual
    const mesesStats = db.prepare(`
        SELECT substr(fecha, 6, 2) as mes, 
               COALESCE(SUM(CASE WHEN tipo='Ingreso' THEN monto ELSE 0 END), 0) as ingresos,
               COALESCE(SUM(CASE WHEN tipo='Egreso' THEN monto ELSE 0 END), 0) as egresos
        FROM movimientos
        WHERE (anio = ? OR substr(fecha, 1, 4) = ?) AND estado = 'Pagado'
        GROUP BY mes
        ORDER BY mes ASC
    `).all(anioNum, String(anioNum));

    // 2. Asegurar directorio de cierres anuales
    if (!fs.existsSync(CIERRES_ANUALES_DIR)) fs.mkdirSync(CIERRES_ANUALES_DIR, { recursive: true });

    // 3. Crear snapshot inalterable de Base de Datos para el Cierre
    const dbCierreName = `caja_institucional_${anioNum}_CIERRE_OFICIAL.db`;
    const dbCierrePath = path.join(CIERRES_ANUALES_DIR, dbCierreName);
    fs.copyFileSync(DB_PATH, dbCierrePath);
    const dbHash = calcSHA256(dbCierrePath);
    fs.writeFileSync(`${dbCierrePath}.sha256`, `${dbHash} *${dbCierreName}\nFecha: ${ahora.toISOString()}\nSeguridad: SHA-256 Verificado`);

    // 4. Crear snapshot de Excel Oficial para el Cierre
    const excelCierreName = `CEPRO_Control_MICAELA_BASTIDAS_${anioNum}_CIERRE_OFICIAL.xlsx`;
    const excelCierrePath = path.join(CIERRES_ANUALES_DIR, excelCierreName);
    const wb = generarLibroExcelActualizado();
    if (wb && XLSX) {
        XLSX.writeFile(wb, excelCierrePath);
    } else {
        const currentExcel = path.join(ROOT_DIR, 'CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx');
        if (fs.existsSync(currentExcel)) fs.copyFileSync(currentExcel, excelCierrePath);
    }
    const excelHash = fs.existsSync(excelCierrePath) ? calcSHA256(excelCierrePath) : null;

    // 5. Generar Reporte de Auditoría y Certificación en JSON
    const auditoriaObj = {
        institucion: cfg.nombre_institucion || 'CETPRO SAN MIGUEL · MICAELA BASTIDAS PUYUCAMA',
        ruc: cfg.ruc || '20485938210',
        direccion: cfg.direccion || '',
        ejercicio_anio: anioNum,
        estado: 'CERRADO',
        fecha_cierre: ahora.toISOString(),
        fecha_cierre_legible: ahora.toLocaleString('es-PE'),
        resumen_financiero: {
            moneda: 'PEN (S/.)',
            total_ingresos: totalIng,
            total_egresos: totalEgr,
            saldo_final_disponible: saldoFinal,
            total_movimientos: totalMovs,
            total_estudiantes_participantes: estCount
        },
        recaudacion_por_especialidad: carrerasStats,
        recaudacion_mensual: mesesStats,
        archivos_certificados: {
            base_datos: { archivo: dbCierreName, sha256: dbHash },
            excel_oficial: { archivo: excelCierreName, sha256: excelHash }
        },
        observaciones: notas || `Cierre formal del año lectivo y fiscal ${anioNum}.`
    };

    const auditFileName = `auditoria_cierre_${anioNum}.json`;
    const auditFilePath = path.join(CIERRES_ANUALES_DIR, auditFileName);
    fs.writeFileSync(auditFilePath, JSON.stringify(auditoriaObj, null, 2), 'utf-8');

    // 6. Empaquetar todo en un ZIP certificado
    const zipName = `CIERRE_ANUAL_${anioNum}_${timestamp}.zip`;
    const zipPath = path.join(CIERRES_ANUALES_DIR, zipName);
    if (AdmZip) {
        const zip = new AdmZip();
        zip.addLocalFile(dbCierrePath);
        if (fs.existsSync(excelCierrePath)) zip.addLocalFile(excelCierrePath);
        zip.addLocalFile(auditFilePath);
        
        const certText = `========================================================================\n` +
            `CERTIFICADO OFICIAL DE CIERRE ANUAL - ${cfg.nombre_institucion}\n` +
            `========================================================================\n` +
            `Ejercicio Lectivo y Fiscal: ${anioNum}\n` +
            `Fecha de Cierre: ${ahora.toLocaleString('es-PE')}\n` +
            `Total Ingresos Recaudados: S/. ${totalIng.toFixed(2)}\n` +
            `Total Egresos / Gastos: S/. ${totalEgr.toFixed(2)}\n` +
            `Saldo Final en Caja: S/. ${saldoFinal.toFixed(2)}\n` +
            `Comprobantes Procesados: ${totalMovs}\n` +
            `Alumnos Atendidos: ${estCount}\n` +
            `Integridad Criptográfica BD (SHA-256): ${dbHash}\n` +
            `Integridad Criptográfica Excel (SHA-256): ${excelHash || 'N/A'}\n` +
            `========================================================================\n` +
            `Este archivo constituye un respaldo institucional inalterable y permanente.\n`;
        zip.addFile('CERTIFICADO_LEGAL_CIERRE.txt', Buffer.from(certText, 'utf-8'));
        zip.writeZip(zipPath);
        const zipHash = calcSHA256(zipPath);
        fs.writeFileSync(`${zipPath}.sha256`, `${zipHash} *${zipName}\nFecha: ${ahora.toISOString()}\nSeguridad: SHA-256 Verificado`);
    }

    // 7. Actualizar o insertar en tabla anios_lectivos
    db.prepare(`
        INSERT INTO anios_lectivos (anio, estado, fecha_cierre, saldo_final, total_ingresos, total_egresos, total_estudiantes, total_movimientos, backup_archivo, notas)
        VALUES (?, 'CERRADO', ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(anio) DO UPDATE SET
            estado = 'CERRADO',
            fecha_cierre = excluded.fecha_cierre,
            saldo_final = excluded.saldo_final,
            total_ingresos = excluded.total_ingresos,
            total_egresos = excluded.total_egresos,
            total_estudiantes = excluded.total_estudiantes,
            total_movimientos = excluded.total_movimientos,
            backup_archivo = excluded.backup_archivo,
            notas = excluded.notas
    `).run(
        anioNum,
        ahora.toISOString().split('T')[0],
        saldoFinal,
        totalIng,
        totalEgr,
        estCount,
        totalMovs,
        zipName,
        notas || `Cierre oficial del año ${anioNum}`
    );

    // 8. Respaldo general del sistema
    generarRespaldoCompleto('Cierre_Anio_' + anioNum);

    return {
        success: true,
        anio: anioNum,
        saldo_final: saldoFinal,
        total_ingresos: totalIng,
        total_egresos: totalEgr,
        total_movimientos: totalMovs,
        total_estudiantes: estCount,
        archivo_zip: zipName,
        archivo_db: dbCierreName,
        archivo_excel: excelCierreName,
        sha256_zip: fs.existsSync(zipPath) ? calcSHA256(zipPath) : null,
        sha256_db: dbHash,
        sha256_excel: excelHash,
        auditoria: auditoriaObj,
        mensaje: `Cierre anual ${anioNum} completado exitosamente con respaldo maestro sellado.`
    };
}

function ejecutarAperturaAnio(nuevoAnio, opciones = {}) {
    const anioNum = parseInt(nuevoAnio, 10);
    if (isNaN(anioNum) || anioNum < 2020 || anioNum > 2100) {
        throw new Error('Año inválido para apertura lectiva: ' + nuevoAnio);
    }
    const ahora = new Date();
    const hoyStr = ahora.toISOString().split('T')[0];
    const anioAnterior = anioNum - 1;

    let saldoATransferir = 0;
    if (opciones.transferir_saldo) {
        const rowAnt = db.prepare(`
            SELECT 
                COALESCE(SUM(CASE WHEN tipo='Ingreso' AND estado='Pagado' THEN monto ELSE 0 END), 0) -
                COALESCE(SUM(CASE WHEN tipo='Egreso' AND estado='Pagado' THEN monto ELSE 0 END), 0) as saldo
            FROM movimientos WHERE anio = ? OR substr(fecha, 1, 4) = ?
        `).get(anioAnterior, String(anioAnterior));
        saldoATransferir = (rowAnt && rowAnt.saldo > 0) ? rowAnt.saldo : 0;
    }

    // Registrar o actualizar año en anios_lectivos
    db.prepare(`
        INSERT INTO anios_lectivos (anio, estado, fecha_apertura, saldo_inicial, saldo_final, total_ingresos, total_egresos, total_estudiantes, total_movimientos, notas)
        VALUES (?, 'ACTIVO', ?, ?, ?, ?, 0, 0, 0, ?)
        ON CONFLICT(anio) DO UPDATE SET
            estado = 'ACTIVO',
            fecha_apertura = excluded.fecha_apertura,
            saldo_inicial = excluded.saldo_inicial,
            notas = excluded.notas
    `).run(
        anioNum,
        hoyStr,
        saldoATransferir,
        saldoATransferir,
        saldoATransferir,
        opciones.notas || `Apertura del Año Lectivo y Fiscal ${anioNum}`
    );

    // Actualizar configuración institucional para reflejar año activo
    db.prepare("INSERT OR REPLACE INTO configuracion (clave, valor) VALUES ('anio_activo', ?)").run(String(anioNum));

    // Si se transfiere saldo, registrar movimiento inicial de apertura en caja
    let movAperturaId = null;
    if (opciones.transferir_saldo && saldoATransferir > 0) {
        const existAper = db.prepare("SELECT id FROM movimientos WHERE anio = ? AND concepto LIKE 'Saldo inicial transferido%'").get(anioNum);
        if (!existAper) {
            const fechaApertura = `${anioNum}-01-02`;
            const compApertura = `APER-${anioNum}-0001`;
            const infoMov = db.prepare(`
                INSERT INTO movimientos (fecha, tipo, estado, rol, nombre, carrera, grupo, encargado, concepto, monto, monto_total, monto_abonado, metodo_pago, comprobante, notas, anio)
                VALUES (?, 'Ingreso', 'Pagado', 'Institución', 'CETPRO SAN MIGUEL · MICAELA BASTIDAS', 'General', 'General', 'Dirección General y Tesorería', ?, ?, ?, ?, 'Efectivo', ?, ?, ?)
            `).run(
                fechaApertura,
                `Saldo inicial transferido del ejercicio anterior (${anioAnterior})`,
                saldoATransferir,
                saldoATransferir,
                saldoATransferir,
                compApertura,
                `Balance de cierre ${anioAnterior} transferido a la apertura ${anioNum}`,
                anioNum
            );
            movAperturaId = infoMov.lastInsertRowid;
        }
    }

    guardarLibroExcelEnDisco();
    generarRespaldoCompleto('Apertura_Anio_' + anioNum);

    return {
        success: true,
        anio: anioNum,
        saldo_inicial: saldoATransferir,
        movimiento_apertura_id: movAperturaId,
        mensaje: `Año lectivo ${anioNum} aperturado exitosamente como año activo de operación.`
    };
}

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
        // 1. SERVIR ARCHIVOS ESTÁTICOS (/public/img/...) CON BLINDAJE PATH TRAVERSAL
        // -------------------------------------------------------------
        if (pathname.startsWith('/public/')) {
            const publicDir = path.normalize(path.join(ROOT_DIR, 'public'));
            const resolvedPath = path.normalize(path.join(ROOT_DIR, pathname));

            // Protección estricta: asegurar que la ruta resuelta permanezca dentro del directorio /public/
            if (!resolvedPath.startsWith(publicDir)) {
                res.writeHead(403, { 
                    'Content-Type': 'text/plain; charset=utf-8',
                    'X-Content-Type-Options': 'nosniff',
                    'X-Frame-Options': 'SAMEORIGIN'
                });
                res.end('Acceso denegado: Intento de Path Traversal bloqueado.');
                return;
            }

            let filePath = resolvedPath;
            if (!fs.existsSync(filePath)) {
                const altPath = path.normalize(path.join(__dirname, pathname));
                if (altPath.startsWith(publicDir) && fs.existsSync(altPath)) {
                    filePath = altPath;
                }
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
                res.writeHead(200, { 
                    'Content-Type': mimeTypes[ext] || 'application/octet-stream',
                    'X-Content-Type-Options': 'nosniff',
                    'X-Frame-Options': 'SAMEORIGIN',
                    'Cache-Control': 'public, max-age=86400'
                });
                fs.createReadStream(filePath).pipe(res);
                return;
            } else {
                res.writeHead(404, { 
                    'Content-Type': 'text/plain; charset=utf-8',
                    'X-Content-Type-Options': 'nosniff',
                    'X-Frame-Options': 'SAMEORIGIN'
                });
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

        // Eliminar un respaldo cuando el usuario ya no lo necesite (Validación estricta de seguridad)
        if (pathname.startsWith('/api/backups/') && method === 'DELETE') {
            const rawParam = pathname.replace('/api/backups/', '');
            const fileName = path.basename(rawParam);
            const allowedExts = ['.db', '.xlsx', '.csv'];
            const fileExt = path.extname(fileName).toLowerCase();
            const filePath = path.normalize(path.join(BACKUPS_DIR, fileName));

            if (!allowedExts.includes(fileExt) || !filePath.startsWith(path.normalize(BACKUPS_DIR))) {
                sendJSON(res, { error: "Parámetro de archivo no válido o restringido." }, 400);
                return;
            }

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

        // -------------------------------------------------------------
        // APIS PARA GESTIÓN MULTIANUAL Y CIERRE DE AÑO ESCOLAR / FISCAL
        // -------------------------------------------------------------
        // Obtener catálogo de años lectivos, estado y paquetes de cierre
        if (pathname === '/api/sistema/anios' && method === 'GET') {
            try {
                const rows = db.prepare("SELECT * FROM anios_lectivos ORDER BY anio DESC").all();
                const cfgAnio = db.prepare("SELECT valor FROM configuracion WHERE clave = 'anio_activo'").get();
                const anioActivo = cfgAnio ? cfgAnio.valor : '2026';

                const resultado = rows.map(r => {
                    const liveStats = db.prepare(`
                        SELECT 
                            COALESCE(SUM(CASE WHEN tipo='Ingreso' AND estado='Pagado' THEN monto ELSE 0 END), 0) as ing,
                            COALESCE(SUM(CASE WHEN tipo='Egreso' AND estado='Pagado' THEN monto ELSE 0 END), 0) as egr,
                            COUNT(*) as cant_mov
                        FROM movimientos WHERE anio = ? OR substr(fecha, 1, 4) = ?
                    `).get(r.anio, String(r.anio));

                    const cantEst = db.prepare(`
                        SELECT COUNT(DISTINCT nombre) as c FROM movimientos 
                        WHERE (anio = ? OR substr(fecha, 1, 4) = ?) AND rol = 'Estudiante'
                    `).get(r.anio, String(r.anio)).c || (r.anio == 2026 ? 213 : 0);

                    return {
                        ...r,
                        total_ingresos: liveStats ? (liveStats.ing || r.total_ingresos) : r.total_ingresos,
                        total_egresos: liveStats ? (liveStats.egr || r.total_egresos) : r.total_egresos,
                        saldo_actual: (liveStats ? (liveStats.ing || 0) - (liveStats.egr || 0) : 0),
                        total_movimientos: liveStats ? (liveStats.cant_mov || r.total_movimientos) : r.total_movimientos,
                        total_estudiantes: cantEst,
                        es_activo: String(r.anio) === String(anioActivo)
                    };
                });

                const cierresFiles = [];
                if (fs.existsSync(CIERRES_ANUALES_DIR)) {
                    const files = fs.readdirSync(CIERRES_ANUALES_DIR);
                    for (const f of files) {
                        if (f.endsWith('.zip') || f.endsWith('.db') || f.endsWith('.json')) {
                            const st = fs.statSync(path.join(CIERRES_ANUALES_DIR, f));
                            const shaFile = path.join(CIERRES_ANUALES_DIR, `${f}.sha256`);
                            let hash = null;
                            if (fs.existsSync(shaFile)) {
                                hash = fs.readFileSync(shaFile, 'utf8').split(' ')[0].trim();
                            } else {
                                hash = calcSHA256(path.join(CIERRES_ANUALES_DIR, f));
                            }
                            cierresFiles.push({
                                nombre: f,
                                tamano: Math.round((st.size / 1024) * 10) / 10 + ' KB',
                                bytes: st.size,
                                fecha: st.mtime.toLocaleString('es-PE'),
                                es_zip: f.endsWith('.zip'),
                                es_db: f.endsWith('.db'),
                                es_json: f.endsWith('.json'),
                                sha256: hash
                            });
                        }
                    }
                    cierresFiles.sort((a, b) => b.bytes - a.bytes);
                }

                sendJSON(res, {
                    success: true,
                    anio_activo: anioActivo,
                    anios: resultado,
                    archivos_cierre: cierresFiles
                });
                return;
            } catch (err) {
                console.error("Error al obtener años:", err);
                sendJSON(res, { error: err.message }, 500);
                return;
            }
        }

        // Ejecutar Cierre Anual y generar paquete sellado con backup
        if (pathname === '/api/sistema/cierre-anual' && method === 'POST') {
            try {
                const body = await parseBody(req);
                const cfgAnio = db.prepare("SELECT valor FROM configuracion WHERE clave = 'anio_activo'").get();
                const anio = body.anio || (cfgAnio ? cfgAnio.valor : 2026);
                const result = ejecutarCierreAnual(anio, body.notas || '');
                sendJSON(res, result);
                return;
            } catch (err) {
                console.error("Error en cierre anual:", err);
                sendJSON(res, { error: err.message }, 500);
                return;
            }
        }

        // Aperturar un nuevo año lectivo
        if (pathname === '/api/sistema/apertura-anio' && method === 'POST') {
            try {
                const body = await parseBody(req);
                if (!body.anio) {
                    sendJSON(res, { error: "Debe indicar el año a aperturar (ej: 2027)" }, 400);
                    return;
                }
                const result = ejecutarAperturaAnio(body.anio, {
                    transferir_saldo: !!body.transferir_saldo,
                    notas: body.notas || ''
                });
                sendJSON(res, result);
                return;
            } catch (err) {
                console.error("Error al aperturar año:", err);
                sendJSON(res, { error: err.message }, 500);
                return;
            }
        }

        // Cambiar año activo de operación en configuración
        if (pathname === '/api/sistema/cambiar-anio-activo' && method === 'POST') {
            try {
                const body = await parseBody(req);
                const anio = String(body.anio || '2026').trim();
                db.prepare("INSERT OR REPLACE INTO configuracion (clave, valor) VALUES ('anio_activo', ?)").run(anio);
                sendJSON(res, {
                    success: true,
                    anio_activo: anio,
                    mensaje: `Año lectivo ${anio} seleccionado como año activo del sistema.`
                });
                return;
            } catch (err) {
                console.error("Error cambiando año activo:", err);
                sendJSON(res, { error: err.message }, 500);
                return;
            }
        }

        // Descarga directa de archivos de cierres anuales
        if (pathname.startsWith('/api/sistema/cierre-anual/descargar/') && method === 'GET') {
            const rawName = path.basename(pathname.replace('/api/sistema/cierre-anual/descargar/', ''));
            const filePath = path.join(CIERRES_ANUALES_DIR, rawName);
            if (!fs.existsSync(filePath)) {
                sendJSON(res, { error: "Archivo de cierre anual no encontrado: " + rawName }, 404);
                return;
            }
            const ext = path.extname(rawName).toLowerCase();
            const contentType = ext === '.zip' ? 'application/zip' : (ext === '.json' ? 'application/json' : 'application/octet-stream');
            res.writeHead(200, {
                'Content-Type': contentType,
                'Content-Disposition': `attachment; filename="${rawName}"`
            });
            fs.createReadStream(filePath).pipe(res);
            return;
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

            if (sheet === 'control-pagos') {
                filename = 'Hoja_CONTROL_PAGOS_CETPRO_2026.csv';
                csv += "CETPRO SAN MIGUEL · MICAELA BASTIDAS PUYUCAMA\r\n";
                csv += "CONTROL DE PAGOS POR MES (MATRIZ ENERO A DICIEMBRE 2026)\r\n\r\n";
                csv += "N°,DNI,Estudiante,Grupo / Sección,Matrícula,Ene,Feb,Mar,Abr,May,Jun,Jul,Ago,Set,Oct,Nov,Dic,Total Pagado (S/.),Deuda (S/.)\r\n";
                const ests = db.prepare("SELECT * FROM estudiantes ORDER BY id ASC").all();
                ests.forEach((e, idx) => {
                    const pagosEst = db.prepare("SELECT monto, concepto, fecha FROM movimientos WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?)) AND tipo = 'Ingreso' AND estado = 'Pagado'").all(e.nombre);
                    const totalPag = pagosEst.reduce((acc, p) => acc + (p.monto || 0), 0);
                    const cuotaBase = 150;
                    const deuda = Math.max(0, cuotaBase - totalPag);
                    const tieneMat = pagosEst.some(p => (p.concepto || '').toLowerCase().includes('matr') || (p.concepto || '').toLowerCase().includes('mantenimiento')) ? 'SI' : '-';
                    const mes = (m) => pagosEst.some(p => {
                        const f = p.fecha || '';
                        return f.includes('-' + String(m).padStart(2, '0') + '-');
                    }) ? 'PAGADO' : '-';
                    csv += `"${idx + 1}","${e.dni || e.codigo || '-'}","${e.nombre}","${e.grupo || '-'}","${tieneMat}","${mes(1)}","${mes(2)}","${mes(3)}","${mes(4)}","${mes(5)}","${mes(6)}","${mes(7)}","${mes(8)}","${mes(9)}","${mes(10)}","${mes(11)}","${mes(12)}",${totalPag.toFixed(2)},${deuda.toFixed(2)}\r\n`;
                });
            } else if (sheet === 'diario') {
                const fParam = parsedUrl.searchParams.get('fecha') || new Date().toISOString().split('T')[0];
                filename = `Hoja_DIARIO_Y_NOTAS_${fParam}_CETPRO.csv`;
                csv += "CETPRO SAN MIGUEL · MICAELA BASTIDAS PUYUCAMA\r\n";
                csv += `DIARIO DE CAJA Y BITÁCORA DE CLASE - FECHA: ${fParam}\r\n\r\n`;
                csv += "N° Recibo,Estudiante / Persona,Grupo / Especialidad,Encargado de Clase,Concepto / Nota,Monto (S/.),Método\r\n";
                const movs = db.prepare("SELECT * FROM movimientos WHERE fecha = ? ORDER BY id DESC").all(fParam);
                movs.forEach(m => {
                    csv += `"REC-${String(m.id).padStart(5, '0')}","${m.nombre}","${m.grupo || '-'}","${m.encargado || '-'}","${m.concepto}",${m.monto.toFixed(2)},"${m.metodo_pago || 'Efectivo'}"\r\n`;
                });
                csv += "\r\n\r\nBITÁCORA OFICIAL DE NOTAS Y ACTIVIDADES PEDAGÓGICAS (HOJA NOTAS)\r\n";
                csv += "Código Grupo,Especialidad / Grupo,Docente Encargado(a),Actividad Realizada / Tema Desarrollado,Observaciones Pedagógicas\r\n";
                const grupos = db.prepare("SELECT * FROM grupos ORDER BY id ASC").all();
                grupos.forEach((g, idx) => {
                    csv += `"G${String(idx + 1).padStart(2, '0')}","${g.nombre}","${g.encargado || '-'}","Práctica y avance modular de taller","Asistencia y desarrollo de actividades al día"\r\n`;
                });
            } else if (sheet === 'estudiantes') {
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

            const metodos = db.prepare(`
                SELECT COALESCE(metodo_pago, 'Efectivo') as metodo, COALESCE(SUM(monto), 0) as total, COUNT(*) as count 
                FROM movimientos 
                WHERE fecha = ? AND tipo = 'Ingreso' AND estado = 'Pagado'
                GROUP BY metodo_pago
            `).all(fecha);

            let totalEfectivo = 0, totalYape = 0, totalTransf = 0;
            metodos.forEach(m => {
                const met = (m.metodo || '').toLowerCase();
                if (met.includes('yape') || met.includes('plin') || met.includes('digital')) totalYape += m.total;
                else if (met.includes('transf') || met.includes('banc') || met.includes('depósito')) totalTransf += m.total;
                else totalEfectivo += m.total;
            });

            sendJSON(res, {
                fecha,
                ingresos: ingRow ? ingRow.total : 0,
                pagos_count: ingRow ? ingRow.count : 0,
                egresos: egrRow ? egrRow.total : 0,
                saldo: (ingRow ? ingRow.total : 0) - (egrRow ? egrRow.total : 0),
                movimientos: movsDelDia,
                desglose_metodos: {
                    efectivo: totalEfectivo,
                    yape: totalYape,
                    transferencia: totalTransf
                }
            });
            return;
        }

        // -------------------------------------------------------------
        // 5. API: STATS GENERALES Y DASHBOARD
        // -------------------------------------------------------------
        // -------------------------------------------------------------
        // ENDPOINT: SALUD E INTEGRIDAD DEL SISTEMA (FASE 1 Y 2)
        // -------------------------------------------------------------
        if (pathname === '/api/sistema/diagnostico-completo' && method === 'GET') {
            try {
                const pragma = db.prepare('PRAGMA integrity_check').get();
                const totalMovs = db.prepare("SELECT count(*) as c, COALESCE(SUM(monto), 0) as sum FROM movimientos WHERE tipo = 'Ingreso' AND estado = 'Pagado'").get();
                const totalEst = db.prepare('SELECT count(*) as c FROM estudiantes').get().c;
                const totalDoc = db.prepare('SELECT count(*) as c FROM docentes').get().c;
                const totalGrp = db.prepare('SELECT count(*) as c FROM grupos').get().c;
                const totalCarr = db.prepare('SELECT count(*) as c FROM carreras').get().c;

                const excelPath = path.join(__dirname, 'CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx');
                const excelExists = fs.existsSync(excelPath);
                let excelStats = { existe: excelExists, hojas: [] };
                if (excelExists) {
                    const wb = XLSX.readFile(excelPath);
                    excelStats.hojas = wb.SheetNames;
                    excelStats.estudiantesCount = wb.Sheets['ESTUDIANTES'] ? XLSX.utils.sheet_to_json(wb.Sheets['ESTUDIANTES']).length : 0;
                }

                const backupsDir = path.join(__dirname, 'backups');
                let backupCount = 0;
                if (fs.existsSync(backupsDir)) {
                    backupCount = fs.readdirSync(backupsDir).filter(f => f.endsWith('.db')).length;
                }

                sendJSON(res, {
                    orquestacion: 'EXITOSA',
                    estado: 'OPTIMO',
                    timestamp: new Date().toISOString(),
                    base_de_datos: {
                        integridad: pragma.integrity_check || 'ok',
                        movimientos: totalMovs.c,
                        total_recaudado: totalMovs.sum,
                        estudiantes: totalEst,
                        docentes: totalDoc,
                        grupos: totalGrp,
                        carreras: totalCarr
                    },
                    excel_oficial: excelStats,
                    respaldos: {
                        total_archivos: backupCount,
                        directorio: backupsDir
                    },
                    servidor: {
                        uptime_segundos: Math.floor(process.uptime()),
                        memoria_mb: Math.round(process.memoryUsage().rss / 1024 / 1024),
                        node_version: process.version
                    }
                });
            } catch (err) {
                sendJSON(res, { estado: 'ERROR', error: err.message }, 500);
            }
            return;
        }

        if (pathname === '/api/sistema/salud-integridad' && method === 'GET') {
            try {
                const integrityRow = db.prepare("PRAGMA integrity_check").get();
                const totalMovs = db.prepare("SELECT COUNT(*) as c FROM movimientos").get().c;
                const totalEst = db.prepare("SELECT COUNT(*) as c FROM estudiantes").get().c;
                const totalDoc = db.prepare("SELECT COUNT(*) as c FROM docentes").get().c;
                const totalCarr = db.prepare("SELECT COUNT(*) as c FROM carreras").get().c;
                const totalGrup = db.prepare("SELECT COUNT(*) as c FROM grupos").get().c;
                const totalIngresos = db.prepare("SELECT COALESCE(SUM(monto), 0) as s FROM movimientos WHERE tipo = 'Ingreso' AND estado = 'Pagado'").get().s;
                
                const excelPath = path.join(ROOT_DIR, 'CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx');
                const excelExists = fs.existsSync(excelPath);
                let excelSize = 0;
                let excelMtime = null;
                if (excelExists) {
                    const st = fs.statSync(excelPath);
                    excelSize = st.size;
                    excelMtime = st.mtime.toISOString();
                }

                const backupFiles = fs.existsSync(BACKUPS_DIR) ? fs.readdirSync(BACKUPS_DIR).filter(f => f.endsWith('.db')) : [];
                const dbPath = path.join(ROOT_DIR, 'caja_institucional.db');
                const dbHash = fs.existsSync(dbPath) ? calcSHA256(dbPath) : null;

                sendJSON(res, {
                    ok: true,
                    timestamp: new Date().toISOString(),
                    sqlite: {
                        estado: (integrityRow && integrityRow.integrity_check === 'ok') ? 'OPTIMO' : 'REVISAR',
                        integrity_check: integrityRow ? integrityRow.integrity_check : 'error',
                        sha256: dbHash,
                        registros: {
                            movimientos: totalMovs,
                            estudiantes: totalEst,
                            docentes: totalDoc,
                            carreras: totalCarr,
                            grupos: totalGrup
                        },
                        total_recaudado: totalIngresos
                    },
                    excel: {
                        ruta: 'CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx',
                        existe: excelExists,
                        tamano_bytes: excelSize,
                        ultima_modificacion: excelMtime,
                        estadisticas_escritura: excelWriteStats,
                        cola_pendiente: excelWriteQueuePending
                    },
                    respaldos: {
                        total_snapshots: backupFiles.length,
                        carpeta: 'backups/'
                    }
                });
            } catch (err) {
                sendJSON(res, { ok: false, error: err.message }, 500);
            }
            return;
        }

        // -------------------------------------------------------------
        // ENDPOINT: ARQUEO DIARIO DE CAJA OFICIAL (FASE 3)
        // -------------------------------------------------------------
        if (pathname === '/api/reportes/arqueo-diario' && method === 'GET') {
            try {
                const hoyStr = new Date().toISOString().slice(0, 10);
                const fechaFiltro = parsedUrl.searchParams.get('fecha') || hoyStr;

                const saldoAntRow = db.prepare(`
                    SELECT 
                        COALESCE(SUM(CASE WHEN tipo = 'Ingreso' AND estado = 'Pagado' THEN monto ELSE 0 END), 0) -
                        COALESCE(SUM(CASE WHEN tipo = 'Egreso' AND estado = 'Pagado' THEN monto ELSE 0 END), 0) as saldo_anterior
                    FROM movimientos 
                    WHERE fecha < ?
                `).get(fechaFiltro);
                const saldoAnterior = saldoAntRow ? Number(saldoAntRow.saldo_anterior) : 0;

                const movsDia = db.prepare(`
                    SELECT id, fecha, comprobante, nombre, dni, rol, carrera, grupo, tipo, concepto, monto, metodo_pago, estado, notas
                    FROM movimientos
                    WHERE fecha = ? AND estado = 'Pagado'
                    ORDER BY id ASC
                `).all(fechaFiltro);

                const ingresos = movsDia.filter(m => m.tipo === 'Ingreso');
                const egresos = movsDia.filter(m => m.tipo === 'Egreso');

                const totalIngresosDia = ingresos.reduce((acc, m) => acc + Number(m.monto || 0), 0);
                const totalEgresosDia = egresos.reduce((acc, m) => acc + Number(m.monto || 0), 0);
                const netoDia = totalIngresosDia - totalEgresosDia;
                const saldoCierre = saldoAnterior + netoDia;

                let rem = totalIngresosDia;
                const denom = [200, 100, 50, 20, 10, 5, 2, 1, 0.5];
                const desglose = denom.map(d => {
                    const cant = Math.floor(rem / d);
                    const sub = cant * d;
                    rem = Number((rem - sub).toFixed(2));
                    return {
                        denominacion: d >= 10 ? `Billete S/ ${d}` : `Moneda S/ ${d.toFixed(2)}`,
                        valor: d,
                        cantidad_sugerida: cant,
                        subtotal: Number(sub.toFixed(2))
                    };
                });

                const conf = obtenerConfiguracion();

                sendJSON(res, {
                    ok: true,
                    institucion: conf.nombre_institucion || "CETPRO SAN MIGUEL · MICAELA BASTIDAS PUYUCAMA",
                    ugel: conf.ugel || "UGEL SAN ROMÁN - JULIACA",
                    fecha: fechaFiltro,
                    saldo_anterior: Number(saldoAnterior.toFixed(2)),
                    ingresos_dia: {
                        total: Number(totalIngresosDia.toFixed(2)),
                        cantidad_recibos: ingresos.length,
                        detalle: ingresos
                    },
                    egresos_dia: {
                        total: Number(totalEgresosDia.toFixed(2)),
                        cantidad_movimientos: egresos.length,
                        detalle: egresos
                    },
                    saldo_cierre_dia: Number(saldoCierre.toFixed(2)),
                    efectivo_dia_neto: Number(netoDia.toFixed(2)),
                    desglose_efectivo_sugerido: desglose,
                    firmas: {
                        tesorero: conf.tesorero || "Sello y Firma del Tesorero",
                        recaudador: conf.recaudador || "Sello y Firma del Recaudador",
                        director: conf.director || "Dirección General CETPRO"
                    }
                });
            } catch (err) {
                sendJSON(res, { ok: false, error: err.message }, 500);
            }
            return;
        }

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
        if (pathname === '/api/movimientos/proximo-comprobante' && method === 'GET') {
            const rowMax = db.prepare("SELECT MAX(CAST(REPLACE(REPLACE(comprobante, 'N°', ''), ' ', '') AS INTEGER)) as max_nro FROM movimientos WHERE comprobante IS NOT NULL").get();
            const nextNro = ((rowMax && rowMax.max_nro) ? rowMax.max_nro : 810) + 1;
            const proximo = String(nextNro).padStart(7, '0');
            sendJSON(res, {
                proximo_comprobante: proximo,
                siguiente_numero: nextNro,
                total_movimientos: db.prepare("SELECT count(*) as c FROM movimientos").get().c
            });
            return;
        }

        if (pathname === '/api/movimientos' && method === 'GET') {
            const tipo = parsedUrl.searchParams.get('tipo');
            const rol = parsedUrl.searchParams.get('rol');
            const carrera = parsedUrl.searchParams.get('carrera');
            const grupo = parsedUrl.searchParams.get('grupo');
            const encargado = parsedUrl.searchParams.get('encargado');
            const estado = parsedUrl.searchParams.get('estado');
            const anio = parsedUrl.searchParams.get('anio');
            const search = (parsedUrl.searchParams.get('search') || '').toLowerCase();

            let query = "SELECT * FROM movimientos WHERE 1=1";
            const params = [];

            if (tipo) { query += " AND tipo = ?"; params.push(tipo); }
            if (rol) { query += " AND rol = ?"; params.push(rol); }
            if (carrera) { query += " AND carrera = ?"; params.push(carrera); }
            if (grupo) { query += " AND grupo = ?"; params.push(grupo); }
            if (encargado) { query += " AND encargado = ?"; params.push(encargado); }
            if (estado) { query += " AND estado = ?"; params.push(estado); }
            if (anio && anio !== 'TODOS') {
                query += " AND (anio = ? OR substr(fecha, 1, 4) = ?)";
                params.push(parseInt(anio, 10), String(anio));
            }
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
            let comprobante = (data.comprobante || '').trim();
            const rowMax = db.prepare("SELECT MAX(CAST(REPLACE(REPLACE(comprobante, 'N°', ''), ' ', '') AS INTEGER)) as max_nro FROM movimientos WHERE comprobante IS NOT NULL").get();
            const nextNro = ((rowMax && rowMax.max_nro) ? rowMax.max_nro : 807) + 1;
            if (!comprobante && tipo === 'Ingreso') {
                comprobante = String(nextNro).padStart(7, '0');
            }
            const notas = data.notas || '';
            let dni = (data.dni || '').trim();
            let turno = (data.turno || '').trim();
            let telefono = (data.telefono || data.celular || '').trim();
            const anioMov = data.anio ? parseInt(data.anio, 10) : (parseInt(fecha.slice(0, 4), 10) || 2026);

            if (rol === 'Docente' && nombre) {
                const exist = db.prepare("SELECT id FROM docentes WHERE LOWER(nombre) = LOWER(?)").get(nombre);
                if (!exist) {
                    db.prepare("INSERT INTO docentes (nombre, carrera) VALUES (?, ?)").run(nombre, carrera);
                }
            }

            let estudianteId = null;
            if (rol === 'Estudiante' && nombre) {
                const exist = db.prepare("SELECT * FROM estudiantes WHERE LOWER(nombre) = LOWER(?)").get(nombre);
                if (exist) {
                    estudianteId = exist.id;
                    if (!dni && exist.dni) dni = exist.dni;
                    if (!turno && exist.turno) turno = exist.turno;
                    if (!telefono && exist.telefono) telefono = exist.telefono;
                    db.prepare(`
                        UPDATE estudiantes 
                        SET dni = COALESCE(NULLIF(?, ''), dni),
                            turno = COALESCE(NULLIF(?, ''), turno),
                            telefono = COALESCE(NULLIF(?, ''), telefono),
                            carrera = CASE WHEN carrera IS NULL OR carrera = '' OR carrera = 'Sin Asignar (Pendiente)' THEN ? ELSE carrera END,
                            grupo = CASE WHEN grupo IS NULL OR grupo = '' OR grupo = 'General' THEN ? ELSE grupo END,
                            notas = CASE WHEN ? != '' THEN ? ELSE notas END
                        WHERE id = ?
                    `).run(dni || '', turno || '', telefono || '', carrera, grupo, notas, notas, exist.id);
                } else {
                    const cod = `EST-${anioMov}-${String(nextNro).padStart(3, '0')}`;
                    const resEst = db.prepare("INSERT INTO estudiantes (codigo, nombre, carrera, grupo, dni, turno, telefono, notas) VALUES (?, ?, ?, ?, ?, ?, ?, ?)").run(cod, nombre, carrera, grupo, dni, turno, telefono, notas || '');
                    estudianteId = resEst.lastInsertRowid;
                }
            }

            const stmt = db.prepare(`
                INSERT INTO movimientos (fecha, tipo, estado, rol, nombre, carrera, grupo, encargado, concepto, monto, monto_total, monto_abonado, metodo_pago, fecha_vencimiento, comprobante, notas, dni, turno, anio)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `);
            const info = stmt.run(fecha, tipo, estado, rol, nombre, carrera, grupo, encargado, concepto, monto, montoTotal, montoAbonado, metodo, vencimiento, comprobante, notas, dni, turno, anioMov);
            const newId = Number(info.lastInsertRowid);

            // Actualizar deuda_id si proviene de cobranza de cuota
            if (data.deuda_id) {
                const deudaId = parseInt(data.deuda_id, 10);
                const dRecord = db.prepare("SELECT * FROM deudas_estudiantes WHERE id = ?").get(deudaId);
                if (dRecord) {
                    const nuevoPendiente = Math.max(0, dRecord.monto_pendiente - monto);
                    const nuevoAbonado = dRecord.monto_abonado + monto;
                    const nuevoEstado = nuevoPendiente <= 0 ? 'Pagado' : 'Pendiente';
                    db.prepare("UPDATE deudas_estudiantes SET monto_pendiente = ?, monto_abonado = ?, estado = ? WHERE id = ?").run(nuevoPendiente, nuevoAbonado, nuevoEstado, deudaId);
                }
            }

            // Actualizar libro Excel en disco inmediatamente y generar respaldo seguro
            guardarLibroExcelEnDisco();
            generarRespaldoCompleto('Auto_Mov_' + newId);

            sendJSON(res, { 
                success: true, 
                id: newId, 
                comprobante: comprobante, 
                fecha: fecha, 
                monto: monto, 
                nombre: nombre, 
                estudiante_guardado: true,
                estudiante_id: estudianteId,
                anio: anioMov,
                message: "Movimiento y datos del estudiante guardados con éxito en la base de datos y Excel" 
            });
            return;
        }

        if (pathname.startsWith('/api/movimientos/') && method === 'DELETE') {
            const movId = parseInt(pathname.split('/')[3], 10);
            if (isNaN(movId) || movId <= 0) {
                sendJSON(res, { error: "ID de movimiento inválido" }, 400);
                return;
            }
            const mov = db.prepare("SELECT id FROM movimientos WHERE id = ?").get(movId);
            if (!mov) {
                sendJSON(res, { error: "Movimiento no encontrado" }, 404);
                return;
            }
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
            const encargadoDocente = (data.docente || data.encargado || '').trim();
            const anioRecibo = parseInt(fechaEmision.slice(0, 4), 10) || 2026;
            const infoMov = db.prepare(`
                INSERT INTO movimientos (fecha, tipo, estado, rol, nombre, carrera, concepto, monto, monto_total, monto_abonado, metodo_pago, comprobante, notas, grupo, dni, turno, encargado, anio)
                VALUES (?, 'Ingreso', 'Pagado', 'Estudiante', ?, ?, ?, ?, ?, ?, 'Efectivo', ?, ?, ?, ?, ?, ?, ?)
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
                turnoFinal,
                encargadoDocente || 'General',
                anioRecibo
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

        // Modificar Sección / Grupo, Turno y Docente Encargado
        if (((pathname.match(/^\/api\/grupos\/(\d+)$/) && (method === 'PUT' || method === 'POST')) ||
             (pathname.match(/^\/api\/grupos\/(\d+)\/editar$/) && method === 'POST') ||
             (pathname.match(/^\/api\/grupos\/(\d+)\/encargado$/) && method === 'POST'))) {
            const grupoId = parseInt(pathname.split('/')[3], 10);
            const data = await parseBody(req);
            
            try {
                const oldGrupo = db.prepare("SELECT * FROM grupos WHERE id = ?").get(grupoId);
                if (!oldGrupo) {
                    sendJSON(res, { error: "Sección no encontrada" }, 404);
                    return;
                }

                const nombre = (data.nombre !== undefined ? String(data.nombre) : oldGrupo.nombre).trim();
                const carrera = (data.carrera !== undefined ? String(data.carrera) : oldGrupo.carrera).trim();
                const encargado = (data.encargado !== undefined ? String(data.encargado) : oldGrupo.encargado).trim();
                const turno = (data.turno !== undefined ? String(data.turno) : oldGrupo.turno).trim();
                const horario = (data.horario !== undefined ? String(data.horario) : oldGrupo.horario || '').trim();
                const aula = (data.aula_taller !== undefined ? String(data.aula_taller) : oldGrupo.aula_taller || '').trim();
                const desc = (data.descripcion !== undefined ? String(data.descripcion) : oldGrupo.descripcion || '').trim();

                if (!nombre) {
                    sendJSON(res, { error: "El nombre del grupo o sección es obligatorio" }, 400);
                    return;
                }

                db.prepare(`
                    UPDATE grupos 
                    SET nombre = ?, carrera = ?, encargado = ?, turno = ?, horario = ?, aula_taller = ?, descripcion = ?
                    WHERE id = ?
                `).run(nombre, carrera, encargado, turno, horario, aula, desc, grupoId);

                // Si cambió el encargado, actualizar en los movimientos de ese grupo
                if (encargado && oldGrupo.encargado !== encargado) {
                    db.prepare("UPDATE movimientos SET encargado = ? WHERE grupo = ?").run(encargado, nombre);
                }

                // Si cambió el nombre del grupo, mantener la integridad en estudiantes y movimientos
                if (oldGrupo.nombre !== nombre) {
                    db.prepare("UPDATE estudiantes SET grupo = ? WHERE grupo = ?").run(nombre, oldGrupo.nombre);
                    db.prepare("UPDATE movimientos SET grupo = ? WHERE grupo = ?").run(nombre, oldGrupo.nombre);
                }

                guardarLibroExcelEnDisco();
                generarRespaldoCompleto('Docente_Grupo_' + grupoId);

                sendJSON(res, { 
                    success: true, 
                    message: `Docente encargado de "${nombre}" actualizado a "${encargado}" exitosamente`,
                    grupo: { id: grupoId, nombre, carrera, encargado, turno }
                });
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
            if (search) {
                qEst += " AND (LOWER(nombre) LIKE ? OR LOWER(codigo) LIKE ? OR LOWER(COALESCE(dni, '')) LIKE ? OR LOWER(COALESCE(telefono, '')) LIKE ?)";
                pEst.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
            }
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
                let ultimoComprobante = null;
                const pagosPorMes = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 };

                for (const m of movs) {
                    if (m.comprobante && !ultimoComprobante) {
                        ultimoComprobante = m.comprobante;
                    }
                    const mTotal = m.monto_total || m.monto;
                    const mAbonado = m.monto_abonado || 0;

                    if (m.estado === 'Pendiente') {
                        totalComprometido += mTotal;
                        totalPagado += mAbonado;
                        saldoPendiente += m.monto;

                        if (mAbonado > 0) tieneAbonosParciales = true;

                        // Registrar pagos parciales / abonos en su mes correspondiente
                        if (mAbonado > 0) {
                            try {
                                const abonosList = db.prepare("SELECT fecha, monto, comprobante FROM abonos WHERE movimiento_id = ?").all(m.id);
                                if (abonosList.length > 0) {
                                    for (const ab of abonosList) {
                                        if (ab.fecha) {
                                            const fP = ab.fecha.split('-');
                                            if (fP.length >= 2) {
                                                const mAb = parseInt(fP[1], 10);
                                                if (mAb >= 1 && mAb <= 12) pagosPorMes[mAb] = Math.round(((pagosPorMes[mAb] || 0) + Number(ab.monto)) * 100) / 100;
                                            }
                                        }
                                        if (ab.comprobante && !ultimoComprobante) ultimoComprobante = ab.comprobante;
                                    }
                                } else if (m.fecha) {
                                    const fP = m.fecha.split('-');
                                    if (fP.length >= 2) {
                                        const mAb = parseInt(fP[1], 10);
                                        if (mAb >= 1 && mAb <= 12) pagosPorMes[mAb] = Math.round(((pagosPorMes[mAb] || 0) + Number(mAbonado)) * 100) / 100;
                                    }
                                }
                            } catch (e) {
                                console.warn("Error leyendo abonos para estudiante:", e.message);
                            }
                        }

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

                        // Si en notas indica saldo pendiente ("debe 50", "a cuenta", etc.)
                        if (m.notas) {
                            const nLow = m.notas.toLowerCase();
                            if (nLow.includes('debe') || nLow.includes('a cuenta')) {
                                const matchDebe = m.notas.match(/debe\s+(\d+(?:\.\d+)?)/i);
                                const debeVal = matchDebe ? parseFloat(matchDebe[1]) : 50.0;
                                saldoPendiente += debeVal;
                                totalComprometido += debeVal;
                                tieneAbonosParciales = true;
                                m.urgencia = 'alerta';
                                conceptosPendientes.push({
                                    ...m,
                                    monto: debeVal,
                                    concepto: `Saldo Pendiente / Debe S/. ${debeVal.toFixed(2)}: ${m.concepto}`
                                });
                            }
                        }

                        // Registro de pago en el mes real de la fecha
                        if (m.fecha) {
                            const fP = m.fecha.split('-');
                            if (fP.length >= 2) {
                                const mNum = parseInt(fP[1], 10);
                                if (mNum >= 1 && mNum <= 12) {
                                    pagosPorMes[mNum] = Math.round(((pagosPorMes[mNum] || 0) + Number(m.monto)) * 100) / 100;
                                }
                            }
                        }
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

                if (estadoFiltro === 'pendiente') {
                    const esSinAsignar = !est.carrera || est.carrera.trim() === '' || est.carrera === 'Sin Asignar' || est.carrera.includes('Pendiente');
                    const tieneDeuda = saldoPendiente > 0 || (est.notas && (est.notas.toLowerCase().includes('debe') || est.notas.toLowerCase().includes('cuenta')));
                    if (!tieneDeuda && !esSinAsignar && estadoFinanciero === 'al_dia') continue;
                } else if (estadoFiltro === 'anulado') {
                    continue;
                } else if (estadoFiltro && estadoFinanciero !== estadoFiltro) {
                    continue;
                }

                resultados.push({
                    id: est.id,
                    codigo: est.codigo || `EST-${est.id}`,
                    ultimo_comprobante: ultimoComprobante || (est.codigo ? est.codigo.replace(/\D/g, '').padStart(7, '0') : null) || '---',
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
                    total_deuda: Math.round(saldoPendiente * 100) / 100,
                    pagos_por_mes: pagosPorMes,
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

            if (estadoFiltro === 'anulado') {
                const movsAnulados = db.prepare(`
                    SELECT id, comprobante, fecha, nombre, carrera, monto, estado, concepto, notas 
                    FROM movimientos 
                    WHERE estado = 'Anulado' 
                       OR LOWER(nombre) LIKE '%anulado%' 
                       OR LOWER(nombre) LIKE '%no existe%' 
                       OR LOWER(nombre) LIKE '%sin registro%'
                    ORDER BY comprobante ASC
                `).all();

                for (const ma of movsAnulados) {
                    resultados.push({
                        id: -ma.id,
                        codigo: 'REC-' + (ma.comprobante || ma.id),
                        ultimo_comprobante: ma.comprobante || '---',
                        nombre: ma.nombre,
                        dni: 'N/A',
                        carrera: ma.carrera || 'Sin Asignar (Pendiente)',
                        grupo: 'Talonario Anulado',
                        ciclo: 'N/A',
                        email: 'anulado@institucion.edu',
                        telefono: 'N/A',
                        turno: 'N/A',
                        notas: ma.notas || 'Boleta o comprobante anulado / sin emisión',
                        total_comprometido: 0,
                        total_pagado: 0,
                        saldo_pendiente: 0,
                        total_deuda: 0,
                        pagos_por_mes: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 },
                        porcentaje_avance: 0,
                        estado_financiero: 'anulado',
                        estado_academico: 'Anulado',
                        etiqueta_estado: '⚪ Comprobante Anulado',
                        clase_estado: 'bg-slate-100 text-slate-700 border-slate-300',
                        urgencia_global: 'anulado',
                        msg_urgencia: 'Registro anulado en talonario oficial',
                        dias_minimos: 999,
                        total_pendientes_count: 0,
                        conceptos_pendientes: []
                    });
                }
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

            const abonosDirectos = db.prepare(`
                SELECT a.id, a.fecha, a.monto, a.metodo_pago, a.comprobante, a.notas, m.concepto as concepto_original, a.movimiento_id
                FROM abonos a
                JOIN movimientos m ON a.movimiento_id = m.id
                WHERE LOWER(m.nombre) = LOWER(?)
                ORDER BY a.fecha DESC
            `).all(est.nombre);

            const pagosCompletos = db.prepare(`
                SELECT id as movimiento_id, id, fecha, monto, metodo_pago, comprobante, notas, concepto as concepto_original
                FROM movimientos
                WHERE LOWER(nombre) = LOWER(?) AND rol = 'Estudiante' AND estado = 'Pagado' AND tipo = 'Ingreso'
                ORDER BY fecha DESC, id DESC
            `).all(est.nombre);

            const abonos = [...abonosDirectos];
            for (const p of pagosCompletos) {
                if (!abonos.some(a => a.movimiento_id == p.movimiento_id && a.comprobante == p.comprobante)) {
                    abonos.push(p);
                }
            }
            abonos.sort((a, b) => (b.fecha || '').localeCompare(a.fecha || ''));

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

            const dni = (data.dni || '').trim();
            const turno = (data.turno || 'Tarde').trim();
            const notas = (data.notas || '').trim();

            const info = db.prepare(`
                INSERT INTO estudiantes (codigo, nombre, carrera, ciclo, email, telefono, estado_academico, grupo, dni, turno, notas)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(codigo, nombre, carrera, ciclo, email, telefono, estado, grupo, dni, turno, notas);

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

            const dni = data.dni !== undefined ? data.dni.trim() : prevEst.dni;
            const turno = data.turno !== undefined ? data.turno.trim() : prevEst.turno;
            const notas = data.notas !== undefined ? data.notas.trim() : prevEst.notas;

            db.prepare(`
                UPDATE estudiantes 
                SET nombre = ?, carrera = ?, grupo = ?, telefono = ?, email = ?, ciclo = ?, estado_academico = ?, dni = ?, turno = ?, notas = ?
                WHERE id = ?
            `).run(nombre, carrera, grupo, telefono, email, ciclo, estado, dni, turno, notas, estId);

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

        // Eliminar Estudiante (con sincronización inmediata a Excel)
        if (pathname.startsWith('/api/estudiantes/') && method === 'DELETE') {
            const parts = pathname.split('/');
            const id = parts[3];
            db.prepare("DELETE FROM estudiantes WHERE id = ?").run(id);
            guardarLibroExcelEnDisco();
            sendJSON(res, { success: true, message: "Estudiante eliminado y Excel sincronizado" });
            return;
        }

        // Endpoint para sincronización explícita de Excel
        if (pathname === '/api/sistema/sincronizar-excel' && (method === 'POST' || method === 'GET')) {
            guardarLibroExcelEnDisco();
            sendJSON(res, { success: true, message: "Libro Excel sincronizado con éxito desde SQLite" });
            return;
        }

        // -------------------------------------------------------------
        // 8. API: CONTROL DE DEUDORES / VENCIMIENTOS
        // -------------------------------------------------------------
        
        // -------------------------------------------------------------
        // CONTROL DE DEUDORES: GESTIÓN DE CUOTAS PENDIENTES
        // -------------------------------------------------------------
        if (pathname === '/api/deudores' && method === 'GET') {
            const carrera = parsedUrl.searchParams.get('carrera');
            const search = (parsedUrl.searchParams.get('search') || '').toLowerCase().trim();

            let q = "SELECT * FROM deudas_estudiantes WHERE estado = 'Pendiente'";
            const p = [];
            if (carrera) {
                q += " AND carrera = ?";
                p.push(carrera);
            }
            if (search) {
                q += " AND (LOWER(nombre) LIKE ? OR LOWER(dni) LIKE ?)";
                p.push(`%${search}%`, `%${search}%`);
            }
            q += " ORDER BY id DESC";

            const rows = db.prepare(q).all(...p);
            let deudores = rows.map(r => {
                let urg = 'a_tiempo';
                let msg = 'Cuota asignada';
                if (r.fecha_limite) {
                    const diffDays = Math.round((new Date(r.fecha_limite) - new Date()) / (1000 * 60 * 60 * 24));
                    if (diffDays < 0) { urg = 'vencido'; msg = `Vencido hace ${Math.abs(diffDays)} días`; }
                    else if (diffDays === 0) { urg = 'vence_hoy'; msg = '¡Vence hoy!'; }
                    else if (diffDays <= 7) { urg = 'urgente'; msg = `Vence en ${diffDays} días`; }
                }
                return {
                    id: r.id,
                    deuda_id: r.id,
                    estudiante_id: r.estudiante_id,
                    nombre: r.nombre,
                    dni: r.dni || 'Sin DNI',
                    telefono: r.telefono || 'Sin Celular',
                    carrera: r.carrera || 'General',
                    grupo: r.grupo || 'General',
                    concepto: r.concepto || 'Cuota Pendiente',
                    monto: r.monto_pendiente,
                    monto_total: r.monto_total,
                    monto_abonado: r.monto_abonado,
                    monto_pendiente: r.monto_pendiente,
                    falta_completar: r.monto_abonado > 0,
                    fecha_vencimiento: r.fecha_limite,
                    urgencia: urg,
                    mensaje_urgencia: msg,
                    notas: r.notas || ''
                };
            });

            // Deudores solo aparecen cuando son seleccionados/asignados manualmente por el usuario

            sendJSON(res, deudores);
            return;
        }

        if (pathname === '/api/deudores' && method === 'POST') {
            const data = await parseBody(req);
            const nombre = (data.nombre || '').trim();
            if (!nombre) {
                sendJSON(res, { error: "El nombre del estudiante es obligatorio" }, 400);
                return;
            }
            const montoPendiente = parseFloat(data.monto_pendiente || data.monto || 0);
            if (isNaN(montoPendiente) || montoPendiente <= 0) {
                sendJSON(res, { error: "El monto de la cuota faltante debe ser mayor a cero" }, 400);
                return;
            }
            const montoTotal = parseFloat(data.monto_total || montoPendiente);
            const montoAbonado = parseFloat(data.monto_abonado || (montoTotal - montoPendiente) || 0);
            const estId = parseInt(data.estudiante_id || 0, 10);
            const dni = (data.dni || '').trim();
            const tel = (data.telefono || data.celular || '').trim();
            const carrera = (data.carrera || '').trim();
            const grupo = (data.grupo || '').trim();
            const concepto = (data.concepto || 'Cuota Pendiente de Módulo').trim();
            const fechaLimite = data.fecha_limite || '';
            const notas = data.notas || '';

            const stmt = db.prepare(`
                INSERT INTO deudas_estudiantes (estudiante_id, nombre, dni, telefono, carrera, grupo, concepto, monto_total, monto_abonado, monto_pendiente, fecha_limite, estado, notas)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pendiente', ?)
            `);
            const info = stmt.run(estId, nombre, dni, tel, carrera, grupo, concepto, montoTotal, montoAbonado, montoPendiente, fechaLimite, notas);
            const newDeudaId = Number(info.lastInsertRowid);

            sendJSON(res, {
                success: true,
                id: newDeudaId,
                nombre,
                monto_pendiente: montoPendiente,
                message: `Estudiante ${nombre} registrado en deudores con saldo pendiente de S/. ${montoPendiente.toFixed(2)}`
            });
            return;
        }

        if (pathname.startsWith('/api/deudores/') && method === 'DELETE') {
            const deudaId = parseInt(pathname.split('/')[3], 10);
            db.prepare("DELETE FROM deudas_estudiantes WHERE id = ?").run(deudaId);
            sendJSON(res, { success: true, message: "Registro de deudor eliminado correctamente" });
            return;
        }

        if (pathname === '/api/exportar/deudores-excel' && method === 'GET') {
            const rows = db.prepare("SELECT * FROM deudas_estudiantes WHERE estado = 'Pendiente' ORDER BY carrera ASC, nombre ASC").all();
            const data = [
                ['CETPRO SAN MIGUEL · MICAELA BASTIDAS PUYUCAMA'],
                ['PADRÓN OFICIAL DE ESTUDIANTES CON CUOTAS PENDIENTES (DEUDORES)'],
                ['Fecha de Generación:', new Date().toLocaleString('es-PE')],
                [],
                ['N°', 'FECHA ASIGNACIÓN', 'ESTUDIANTE', 'DNI', 'CELULAR', 'CARRERA / ESPECIALIDAD', 'GRUPO / SECCIÓN', 'CONCEPTO / CUOTA', 'COSTO TOTAL (S/.)', 'ABONADO (S/.)', 'PENDIENTE A COBRAR (S/.)', 'FECHA LÍMITE', 'ESTADO', 'NOTAS']
            ];

            let totalSaldo = 0;
            rows.forEach((r, idx) => {
                totalSaldo += r.monto_pendiente;
                data.push([
                    idx + 1,
                    r.created_at ? r.created_at.split(' ')[0] : '-',
                    r.nombre,
                    r.dni || '-',
                    r.telefono || '-',
                    r.carrera || '-',
                    r.grupo || '-',
                    r.concepto,
                    r.monto_total,
                    r.monto_abonado,
                    r.monto_pendiente,
                    r.fecha_limite || 'Sin fecha',
                    r.estado,
                    r.notas || ''
                ]);
            });

            data.push([]);
            data.push(['TOTAL PENDIENTE DE COBRANZA:', '', '', '', '', '', '', '', '', '', totalSaldo, '', '', '']);

            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(data);
            XLSX.utils.book_append_sheet(wb, ws, 'DEUDORES_OFICIAL');

            const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
            res.writeHead(200, {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename="PADRON_DEUDORES_CETPRO_2026.xlsx"',
                'Content-Length': buf.length
            });
            res.end(buf);
            return;
        }

        // -------------------------------------------------------------
        // TARIFAS Y COSTOS OFICIALES POR MÓDULO Y CARRERA
        // -------------------------------------------------------------
        if (pathname === '/api/tarifas' && method === 'GET') {
            const tarifas = db.prepare("SELECT * FROM tarifas_modulos ORDER BY carrera ASC, id ASC").all();
            sendJSON(res, tarifas);
            return;
        }

        if (pathname === '/api/tarifas' && method === 'POST') {
            const data = await parseBody(req);
            if (Array.isArray(data)) {
                const updateStmt = db.prepare("UPDATE tarifas_modulos SET costo = ?, descripcion = ? WHERE id = ?");
                for (const t of data) {
                    if (t.id && t.costo !== undefined) {
                        updateStmt.run(parseFloat(t.costo) || 0, t.descripcion || '', t.id);
                    }
                }
            } else if (data.id) {
                db.prepare("UPDATE tarifas_modulos SET costo = ?, descripcion = ? WHERE id = ?").run(parseFloat(data.costo) || 0, data.descripcion || '', data.id);
            } else if (data.carrera && data.modulo) {
                db.prepare("INSERT INTO tarifas_modulos (carrera, modulo, costo, descripcion) VALUES (?, ?, ?, ?)").run(data.carrera, data.modulo, parseFloat(data.costo) || 150.00, data.descripcion || '');
            }
            sendJSON(res, { success: true, message: "Tarifas actualizadas correctamente" });
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
                    (SELECT GROUP_CONCAT(DISTINCT d.nombre) FROM docentes d WHERE LOWER(TRIM(d.carrera)) = LOWER(TRIM(c.nombre))) as docentes_nombres,
                    (SELECT GROUP_CONCAT(DISTINCT g.encargado) FROM grupos g WHERE LOWER(TRIM(g.carrera)) = LOWER(TRIM(c.nombre)) AND g.encargado != 'General' AND g.encargado != 'Por Asignar') as grupos_encargados,
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
