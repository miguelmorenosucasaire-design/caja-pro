const { DatabaseSync } = require('node:sqlite');
const path = require('node:path');
const db = new DatabaseSync('caja_institucional.db');

console.log('--- APLICANDO CORRECCIÓN DE NOMBRES EN MOVIMIENTOS ---');

db.exec("BEGIN TRANSACTION;");
try {
    const upd1 = db.prepare("UPDATE movimientos SET nombre = 'Maopele Machaca Adco' WHERE id = 690 AND nombre = 'Mao Pele Machaca Adco'").run();
    console.log(`Mov 690 actualizado (${upd1.changes} filas afectadas)`);

    const upd2 = db.prepare("UPDATE movimientos SET nombre = 'Yuly Noemi Hilasaca Colquehuanca' WHERE id IN (698, 699) AND nombre = 'Yuly Noemí Hilasaca Colquehuanca'").run();
    console.log(`Mov 698 y 699 actualizados (${upd2.changes} filas afectadas)`);

    db.exec("COMMIT;");
    console.log('✔ Transacción completada con éxito.');
} catch (e) {
    db.exec("ROLLBACK;");
    console.error('Error en transacción:', e);
}
