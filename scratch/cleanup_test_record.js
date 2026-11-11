const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

db.prepare("DELETE FROM movimientos WHERE id = 713").run();
db.prepare("DELETE FROM estudiantes WHERE id = 508").run();
const estCount = db.prepare("SELECT count(*) as c FROM estudiantes").get().c;
const movCount = db.prepare("SELECT count(*) as c FROM movimientos").get().c;
console.log('Database restored: Students =', estCount, 'Movimientos =', movCount);
