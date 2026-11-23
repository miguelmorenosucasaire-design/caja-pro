const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');
const testEst = db.prepare("SELECT * FROM estudiantes WHERE nombre LIKE '%TEST%'").all();
console.log('Test students in DB:', testEst);
if (testEst.length > 0) {
    db.prepare("DELETE FROM estudiantes WHERE nombre LIKE '%TEST%'").run();
    db.prepare("DELETE FROM movimientos WHERE nombre LIKE '%TEST%'").run();
    console.log('Cleaned test students from DB');
}
console.log('Current DB students count:', db.prepare('SELECT count(*) as c FROM estudiantes').get().c);
