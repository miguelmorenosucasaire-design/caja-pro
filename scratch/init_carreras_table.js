const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

// Create table if not exists
db.prepare(`
    CREATE TABLE IF NOT EXISTS carreras (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT UNIQUE NOT NULL,
        codigo TEXT,
        descripcion TEXT,
        activo INTEGER DEFAULT 1
    )
`).run();

// Distinct careers across students, docentes, and movimientos
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

console.log('Carreras encontradas para inicializar:', carrerasEnUso.map(c => c.carrera));

const stmt = db.prepare("INSERT OR IGNORE INTO carreras (nombre, codigo) VALUES (?, ?)");
let codeNum = 1;
for (const c of carrerasEnUso) {
    const code = `ESP-${String(codeNum++).padStart(2, '0')}`;
    stmt.run(c.carrera, code);
}

const list = db.prepare("SELECT * FROM carreras").all();
console.log('\nCarreras registradas en la tabla:', list);
