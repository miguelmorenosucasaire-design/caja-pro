const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');

const db = new DatabaseSync('caja_institucional.db');

console.log('--- ESTADO PREVIO DE ESTUDIANTES POR CARRERA ---');
const prevEst = db.prepare('SELECT carrera, COUNT(*) as c FROM estudiantes GROUP BY carrera').all();
console.table(prevEst);

console.log('\n--- ACTUALIZANDO TODOS LOS ESTUDIANTES A "Sin Asignar (Pendiente)" ---');
db.prepare("UPDATE estudiantes SET carrera = 'Sin Asignar (Pendiente)', grupo = 'Sin Asignar'").run();

console.log('--- ACTUALIZANDO MOVIMIENTOS DE ESTUDIANTES A "Sin Asignar (Pendiente)" ---');
db.prepare("UPDATE movimientos SET carrera = 'Sin Asignar (Pendiente)', grupo = 'General' WHERE rol = 'Estudiante'").run();

const newEst = db.prepare('SELECT carrera, COUNT(*) as c FROM estudiantes GROUP BY carrera').all();
console.log('\n--- NUEVO ESTADO DE ESTUDIANTES POR CARRERA ---');
console.table(newEst);

const newMov = db.prepare('SELECT carrera, COUNT(*) as c FROM movimientos GROUP BY carrera').all();
console.log('\n--- NUEVO ESTADO DE MOVIMIENTOS POR CARRERA ---');
console.table(newMov);

const totEst = db.prepare('SELECT COUNT(*) as c FROM estudiantes').get().c;
const totMov = db.prepare('SELECT COUNT(*) as c FROM movimientos').get().c;
const totIng = db.prepare("SELECT SUM(monto) as s FROM movimientos WHERE tipo = 'Ingreso' AND estado = 'Pagado'").get().s;

console.log(`\nTotal Estudiantes: ${totEst} (Esperado 147)`);
console.log(`Total Movimientos: ${totMov} (Esperado 202)`);
console.log(`Total Ingresos: S/. ${totIng} (Esperado 24630.00)`);

if (totEst !== 147 || totMov !== 202 || totIng !== 24630) {
    throw new Error('Inconsistencia en los totales globales');
}

console.log('\n✅ Todos los estudiantes han sido desasignados exitosamente (Pendientes de Asignación Oficial)');
