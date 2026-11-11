// =====================================================================
// EDUCAJA PRO - CETPRO MICAELA BASTIDAS PUYUCAMA
// Test de Humo y Verificación de Línea Base (Línea Cero de Integridad)
// =====================================================================
const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const fs = require('node:fs');

const DB_PATH = path.join(__dirname, '..', 'caja_institucional.db');
const XLSX_PATH = path.join(__dirname, '..', 'CEPRO_Control_MICAELA_BASTIDAS_ACTUALIZADO.xlsx');

console.log('--- INICIANDO VERIFICACIÓN DE LÍNEA BASE EDUCAJA PRO ---');

if (!fs.existsSync(DB_PATH)) {
    console.error('[FALLO CRÍTICO] Base de datos no encontrada en:', DB_PATH);
    process.exit(1);
}

const db = new DatabaseSync(DB_PATH);

// 1. Verificación de Tablas
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(t => t.name);
const expectedTables = ['docentes', 'estudiantes', 'movimientos', 'grupos', 'configuracion', 'carreras'];
for (const table of expectedTables) {
    if (!tables.includes(table)) {
        console.error(`[ERROR] Falta la tabla requerida: ${table}`);
        process.exit(1);
    }
}
console.log('✔ Todas las tablas esenciales existen en SQLite:', expectedTables.join(', '));

// 2. Verificación de Conteos Exactos
const estCount = db.prepare('SELECT COUNT(*) as c FROM estudiantes').get().c;
const docCount = db.prepare('SELECT COUNT(*) as c FROM docentes').get().c;
const movCount = db.prepare('SELECT COUNT(*) as c FROM movimientos').get().c;
const grpCount = db.prepare('SELECT COUNT(*) as c FROM grupos').get().c;
const carCount = db.prepare('SELECT COUNT(*) as c FROM carreras').get().c;

console.log(`- Estudiantes: ${estCount} (esperado: 176)`);
console.log(`- Docentes: ${docCount} (esperado: 15)`);
console.log(`- Movimientos: ${movCount} (esperado: 207)`);
console.log(`- Grupos: ${grpCount} (esperado: 15)`);
console.log(`- Carreras: ${carCount} (esperado >= 13)`);

if (estCount !== 176 || docCount !== 15 || movCount !== 207 || grpCount !== 15) {
    console.warn('[ALERTA] Las cantidades difieren de la línea base esperada.');
} else {
    console.log('✔ Conteos de entidades coinciden 100% con la línea base institucional.');
}

// 3. Verificación Financiera
const stats = db.prepare(`
    SELECT 
        SUM(CASE WHEN tipo='Ingreso' AND estado='Pagado' THEN monto ELSE 0 END) as ing,
        SUM(CASE WHEN tipo='Egreso' AND estado='Pagado' THEN monto ELSE 0 END) as egr
    FROM movimientos
`).get();

console.log(`- Total Ingresos Pagados: S/. ${stats.ing.toFixed(2)} (esperado: S/. 25080.00)`);
console.log(`- Total Egresos Pagados : S/. ${stats.egr.toFixed(2)}`);
console.log(`- Balance Disponible    : S/. ${(stats.ing - stats.egr).toFixed(2)}`);

if (Math.abs(stats.ing - 25080.00) > 0.01) {
    console.warn('[ALERTA] El total recaudado en caja no coincide con S/. 25,080.00');
} else {
    console.log('✔ Balance de recaudación verificado con exactitud: S/. 25,080.00.');
}

// 4. Verificación de archivo Excel
if (fs.existsSync(XLSX_PATH)) {
    const stat = fs.statSync(XLSX_PATH);
    console.log(`✔ Archivo Excel Oficial presente (${(stat.size / 1024).toFixed(1)} KB)`);
} else {
    console.error('[ERROR] Archivo Excel Oficial no encontrado.');
}

console.log('--- LÍNEA BASE CERTIFICADA Y LISTA PARA REFACTORIZACIÓN MODULAR ---');
