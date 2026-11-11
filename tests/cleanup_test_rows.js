const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const testRows = db.prepare("SELECT id, nombre, monto FROM movimientos WHERE nombre LIKE '%Test%'").all();
console.log('Filas Test en movimientos:', testRows);
if (testRows.length > 0) {
    db.prepare("DELETE FROM movimientos WHERE nombre LIKE '%Test%'").run();
    console.log('Eliminadas filas Test de movimientos.');
}

const testCarreras = db.prepare("SELECT id, nombre FROM carreras WHERE nombre LIKE '%Test%'").all();
console.log('Carreras Test encontradas:', testCarreras);
if (testCarreras.length > 0) {
    db.prepare("DELETE FROM carreras WHERE nombre LIKE '%Test%'").run();
    console.log('Eliminadas carreras Test.');
}
