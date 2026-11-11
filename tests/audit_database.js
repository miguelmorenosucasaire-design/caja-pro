// =====================================================================
// EDUCAJA PRO - AUDITORÍA EXHAUSTIVA DE BASE DE DATOS Y RELACIONES
// =====================================================================
const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');

const DB_PATH = path.join(__dirname, '..', 'caja_institucional.db');
const db = new DatabaseSync(DB_PATH);

console.log('=== AUDITORIA DE INTEGRIDAD DE BASE DE DATOS ===');

// 1. Integridad física de SQLite
const pragma = db.prepare('PRAGMA integrity_check').get();
console.log('1. PRAGMA integrity_check:', pragma.integrity_check);

// 2. Revisar estudiantes sin carrera o sin grupo
const estSinCarrera = db.prepare("SELECT COUNT(*) as c FROM estudiantes WHERE carrera IS NULL OR carrera = '' OR carrera = 'Sin Asignar (Pendiente)'").get().c;
const estSinGrupo = db.prepare("SELECT COUNT(*) as c FROM estudiantes WHERE grupo IS NULL OR grupo = '' OR grupo = 'Sin Asignar'").get().c;
console.log('2. Estudiantes sin carrera asignada:', estSinCarrera);
console.log('   Estudiantes sin grupo asignado:', estSinGrupo);

// 3. Revisar consistencia de nombres de carreras entre estudiantes y la tabla carreras
const carrerasEst = db.prepare("SELECT DISTINCT carrera FROM estudiantes WHERE carrera IS NOT NULL AND carrera != '' AND carrera != 'Sin Asignar (Pendiente)'").all().map(r => r.carrera);
const carrerasOficiales = db.prepare("SELECT nombre FROM carreras").all().map(r => r.nombre);
const carrerasHuerfanas = carrerasEst.filter(c => !carrerasOficiales.includes(c));
console.log('3. Carreras en estudiantes que no estan en tabla carreras:', carrerasHuerfanas);

// 4. Revisar consistencia de grupos entre estudiantes y tabla grupos
const gruposEst = db.prepare("SELECT DISTINCT grupo FROM estudiantes WHERE grupo IS NOT NULL AND grupo != '' AND grupo != 'Sin Asignar'").all().map(r => r.grupo);
const gruposOficiales = db.prepare("SELECT nombre FROM grupos").all().map(r => r.nombre);
const gruposHuerfanos = gruposEst.filter(g => !gruposOficiales.includes(g));
console.log('4. Grupos en estudiantes que no estan en tabla grupos:', gruposHuerfanos);

// 5. Revisar movimientos financieros huérfanos o con datos nulos
const movsSinFecha = db.prepare("SELECT COUNT(*) as c FROM movimientos WHERE fecha IS NULL OR fecha = ''").get().c;
const movsSinMonto = db.prepare("SELECT COUNT(*) as c FROM movimientos WHERE monto IS NULL OR monto <= 0").get().c;
const movsSinTipo = db.prepare("SELECT COUNT(*) as c FROM movimientos WHERE tipo NOT IN ('Ingreso', 'Egreso')").get().c;
const movsEstudianteHuerfanos = db.prepare(`
    SELECT COUNT(*) as c 
    FROM movimientos m 
    WHERE m.rol = 'Estudiante' 
      AND LOWER(TRIM(m.nombre)) NOT IN (SELECT LOWER(TRIM(e.nombre)) FROM estudiantes e)
`).get().c;

console.log('5. Movimientos sin fecha válida:', movsSinFecha);
console.log('   Movimientos con monto <= 0 o nulo:', movsSinMonto);
console.log('   Movimientos con tipo inválido:', movsSinTipo);
console.log('   Movimientos de rol Estudiante cuyo nombre no coincide con ningún estudiante:', movsEstudianteHuerfanos);

// 6. Verificar recibos duplicados
const recibosDuplicados = db.prepare(`
    SELECT comprobante, COUNT(*) as c 
    FROM movimientos 
    WHERE comprobante IS NOT NULL AND comprobante != '' 
    GROUP BY comprobante 
    HAVING c > 1
`).all();
console.log('6. Comprobantes duplicados:', recibosDuplicados.length > 0 ? recibosDuplicados : 'Ninguno (todos únicos)');

// 7. Configuración institucional
const configRows = db.prepare("SELECT clave, valor FROM configuracion").all();
console.log('7. Parámetros de configuración institucional:', configRows.length);
for (const row of configRows) {
    console.log(`   - ${row.clave}: "${row.valor}"`);
}
