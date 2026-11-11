const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

console.log('--- SYNC OFFICIAL RECURSOS PROPIOS (RECEIPTS 601 - 807) ---');

const DB_PATH = path.join(__dirname, '..', 'caja_institucional.db');
const csvFile = path.join(__dirname, 'user_provided_recursos_propios.csv');
const content = fs.readFileSync(csvFile, 'utf8');
const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);

function parseCSVLine(line) {
    const res = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (c === '"') {
            if (inQuotes && line[i+1] === '"') {
                cur += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (c === ',' && !inQuotes) {
            res.push(cur.trim());
            cur = '';
        } else {
            cur += c;
        }
    }
    res.push(cur.trim());
    return res;
}

function cleanStudentName(raw) {
    if (!raw) return '';
    let s = raw.trim();
    if (s === 'ANULADO' || s === 'NO EXISTE BOLETA') return s;

    if (s.includes('Hilasaca Colqueh.Yuly Noemi')) return 'Yuly Noemi Hilasaca Colquehuanca';
    if (s.includes('CABRERA L Naleli Lisbeth Cabrera L.')) return 'Nayeli Lisbeth Cabrera Larico';
    if (s.includes('Apaza,Nory Yoselin')) return 'Nory Yoselin Pomari Apaza';
    if (s.includes('Rios Quinto Vilca Chino')) return 'Rios Quinto Vilca Chino';
    if (s.includes('Jhon Lincol Laura Ojeda')) return 'Jhon Lincol Laura Ojeda';
    if (s.includes('Alan Ronald Hanasi Morales')) return 'Alan Ronald Hanasi Morales';
    if (s.includes('Juana Lidia Ponce Mamanchura')) return 'Juana Lidia Ponce Mamanchura';
    if (s.includes('Magda Chuahuara Cordova')) return 'Magda Chuahuara Cordova';

    if (s.includes(',')) {
        const parts = s.split(',');
        const ape = parts[0].trim();
        const nom = parts.slice(1).join(' ').trim();
        return `${nom} ${ape}`.replace(/\s+/g, ' ');
    }
    return s.replace(/\s+/g, ' ');
}

function normalizeKey(str) {
    return str.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]/g, '')
        .trim();
}

function mapProgramaToCarrera(prog) {
    if (!prog) return 'Sin Asignar (Pendiente)';
    const p = prog.toUpperCase().trim();
    if (p.includes('MOTOS')) return 'Mecánica de Motos';
    if (p.includes('COMPUTACION') || p.includes('INFORMATICA')) return 'Computación e Informática';
    if (p.includes('CORTE') || p.includes('ENSAMBL')) return 'Corte y Ensamblaje';
    if (p.includes('PELUQUERIA') || p.includes('BARBERIA')) return 'Peluquería y Barbería';
    if (p.includes('CARPINTERIA') || p.includes('METALICA')) return 'Carpintería Metálica';
    if (p.includes('AUTOMOTORIZ') || p.includes('AUTOMOTRIZ')) return 'Mecánica Automotriz';
    if (p.includes('ELECTRONICA') || p.includes('ELECTRICIDAD')) return 'Electricidad y Electrónica';
    return 'Sin Asignar (Pendiente)';
}

function cleanDate(d) {
    if (!d) return null;
    let s = d.trim().replace(/\/\//g, '/');
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
    if (s.includes('/')) {
        const parts = s.split('/');
        if (parts.length === 3) {
            const day = parts[0].padStart(2, '0');
            const month = parts[1].padStart(2, '0');
            const year = parts[2];
            return `${year}-${month}-${day}`;
        }
    }
    return s;
}

function mapConcepto(prog, mod) {
    const p = (prog || '').toUpperCase();
    const m = (mod || '').toUpperCase();
    if (p.includes('TITULACION') || m.includes('TITULO')) return 'Titulación';
    if (m.includes('MODULO  II') || m.includes('MODULO II')) return 'Módulo II';
    if (m.includes('MODULO  I-II') || m.includes('MODULO I-II')) return 'Módulo I-II';
    if (m.includes('MODULO')) return 'Módulo I';
    return 'Matrícula';
}

function assignDocente(carrera, turno, observ) {
    const o = (observ || '').toUpperCase();
    if (o.includes('CARMEN')) return 'Carmen Y. Vilca Puma';

    const t = (turno || '').toUpperCase();
    if (carrera === 'Mecánica de Motos') return 'Aníbal Bruno Maquera Gil';
    if (carrera === 'Peluquería y Barbería') {
        if (t.includes('NOCHE')) return 'Fidela Gutierrez Loza';
        if (t.includes('TARDE')) return 'María Azucena Ccolla Villanueva';
        return 'Alejandrina Ayna Cabrera';
    }
    if (carrera === 'Corte y Ensamblaje') {
        if (t.includes('NOCHE')) return 'Teófilo Larico Canahuire';
        if (t.includes('TARDE')) return 'René Prudencio Chura Mamani';
        return 'Liz Elvira Flores Llano';
    }
    if (carrera === 'Computación e Informática') return 'Magda Chura Coaquipa';
    if (carrera === 'Carpintería Metálica') return 'Cesáreo Julio Ccosi Quenaya';
    if (carrera === 'Mecánica Automotriz') return 'Edgar Velasquez Vilca';
    if (carrera === 'Electricidad y Electrónica') return 'Serafín Huanca Castro';
    return 'Eloy Valerio Paredes Feliciano';
}

// 1. Parse CSV
let header = false;
const rawRows = [];

for (const l of lines) {
    if (l.includes('N° RECIBO')) { header = true; continue; }
    if (!header) continue;
    const p = parseCSVLine(l);
    if (!p[0]) continue;
    const recibo = parseInt(p[0], 10);
    if (isNaN(recibo)) continue;

    const fechaRaw = p[1];
    const nombreRaw = p[2];
    const progRaw = p[3];
    const montoRaw = p[4];
    const modRaw = p[5];
    const turnoRaw = p[6];
    const dniRaw = (p[7] || '').trim();
    const celRaw = (p[8] || '').trim();
    const obsRaw = (p[9] || '').trim();

    const isAnulado = nombreRaw === 'ANULADO' || nombreRaw === 'NO EXISTE BOLETA' || (obsRaw && obsRaw.includes('ANULADO')) || (progRaw && progRaw.includes('ANULADO'));
    const cleanNom = cleanStudentName(nombreRaw);
    const carrera = isAnulado ? 'Sin Asignar (Pendiente)' : mapProgramaToCarrera(progRaw);
    const monto = isAnulado ? 0 : (parseFloat(montoRaw) || 0);
    const fecha = cleanDate(fechaRaw) || '2026-01-19';
    const concepto = isAnulado ? 'Anulado' : mapConcepto(progRaw, modRaw);
    const turno = turnoRaw || 'Mañana';
    const comprobante = String(recibo).padStart(7, '0');
    const encargado = assignDocente(carrera, turno, obsRaw);

    rawRows.push({
        recibo,
        comprobante,
        fecha,
        nombre: cleanNom,
        carrera,
        concepto,
        monto,
        turno,
        dni: dniRaw,
        cel: celRaw,
        obs: obsRaw,
        isAnulado,
        encargado
    });
}

console.log(`Parsed ${rawRows.length} rows.`);

// 2. Identify students
const studentMap = new Map();

for (const r of rawRows) {
    if (r.isAnulado || !r.nombre) continue;
    const nKey = normalizeKey(r.nombre);

    if (!studentMap.has(nKey)) {
        studentMap.set(nKey, {
            nombre: r.nombre,
            carrera: r.carrera,
            dni: r.dni,
            telefono: r.cel,
            turno: r.turno,
            pagos: []
        });
    }

    const st = studentMap.get(nKey);
    st.pagos.push(r);
    if (!st.dni && r.dni) st.dni = r.dni;
    if (!st.telefono && r.cel) st.telefono = r.cel;
    if (r.carrera && r.carrera !== 'Sin Asignar (Pendiente)') {
        st.carrera = r.carrera;
    }
    if (r.turno && (!st.turno || st.turno === 'Mañana')) {
        st.turno = r.turno;
    }
}

console.log(`Unique students count: ${studentMap.size}`);

// Open DB and update
const db = new DatabaseSync(DB_PATH);

// Add columns if not exist
const estCols = db.prepare('PRAGMA table_info(estudiantes)').all().map(c => c.name);
if (!estCols.includes('dni')) {
    db.exec('ALTER TABLE estudiantes ADD COLUMN dni TEXT;');
    console.log('[+] Added column dni to estudiantes');
}
if (!estCols.includes('turno')) {
    db.exec('ALTER TABLE estudiantes ADD COLUMN turno TEXT;');
    console.log('[+] Added column turno to estudiantes');
}

const movCols = db.prepare('PRAGMA table_info(movimientos)').all().map(c => c.name);
if (!movCols.includes('dni')) {
    db.exec('ALTER TABLE movimientos ADD COLUMN dni TEXT;');
    console.log('[+] Added column dni to movimientos');
}
if (!movCols.includes('turno')) {
    db.exec('ALTER TABLE movimientos ADD COLUMN turno TEXT;');
    console.log('[+] Added column turno to movimientos');
}

// Clear and repopulate movimientos
db.exec('DELETE FROM movimientos;');
console.log('[+] Cleared old movimientos');

const insertMov = db.prepare(`
    INSERT INTO movimientos (
        fecha, tipo, estado, rol, nombre, carrera, concepto, monto, monto_total, monto_abonado,
        metodo_pago, comprobante, notas, created_at, grupo, encargado, dni, turno
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

for (const r of rawRows) {
    const estado = r.isAnulado ? 'Anulado' : 'Pagado';
    const tipo = 'Ingreso';
    const rol = 'Estudiante';
    const notas = r.obs ? `${r.concepto} - ${r.obs}` : `${r.concepto} (${r.carrera})`;
    const createdAt = `${r.fecha} 10:00:00`;
    const grupo = 'General';

    insertMov.run(
        r.fecha,
        tipo,
        estado,
        rol,
        r.nombre,
        r.carrera,
        r.concepto,
        r.monto,
        r.monto,
        r.monto,
        'Efectivo',
        r.comprobante,
        notas,
        createdAt,
        grupo,
        r.encargado,
        r.dni,
        r.turno
    );
}
console.log(`[+] Inserted ${rawRows.length} movimientos`);

// Clear and repopulate estudiantes
db.exec('DELETE FROM estudiantes;');
console.log('[+] Cleared old estudiantes');

const insertEst = db.prepare(`
    INSERT INTO estudiantes (
        codigo, nombre, carrera, ciclo, email, telefono, estado_academico, grupo, dni, turno
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let estIdx = 1;
for (const st of studentMap.values()) {
    const cod = `EST-${String(estIdx).padStart(3, '0')}`;
    const ciclo = 'Ciclo I';
    const email = '';
    const estadoAcad = 'Matriculado';
    const grupo = 'General';

    insertEst.run(
        cod,
        st.nombre,
        st.carrera,
        ciclo,
        email,
        st.telefono,
        estadoAcad,
        grupo,
        st.dni,
        st.turno
    );
    estIdx++;
}
console.log(`[+] Inserted ${studentMap.size} estudiantes with official carreras, DNIs, and phones!`);

// Print summary
const sumPagado = db.prepare("SELECT COALESCE(SUM(monto), 0) as s FROM movimientos WHERE tipo = 'Ingreso' AND estado = 'Pagado'").get().s;
const countEst = db.prepare("SELECT COUNT(*) as c FROM estudiantes").get().c;
const countMov = db.prepare("SELECT COUNT(*) as c FROM movimientos").get().c;

console.log('--- RESUMEN FINAL ---');
console.log(`Total Ingresos Pagados: S/. ${sumPagado.toFixed(2)}`);
console.log(`Total Movimientos: ${countMov}`);
console.log(`Total Estudiantes: ${countEst}`);

const carrerasCount = db.prepare("SELECT carrera, count(*) as count FROM estudiantes GROUP BY carrera ORDER BY count DESC").all();
console.log('Estudiantes por Carrera:', carrerasCount);

db.close();
console.log('✅ Base de datos actualizada con éxito!');
