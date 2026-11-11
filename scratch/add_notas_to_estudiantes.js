const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

try {
    db.exec("ALTER TABLE estudiantes ADD COLUMN notas TEXT DEFAULT ''");
    console.log("Column 'notas' added to estudiantes.");
} catch (e) {
    console.log("Column 'notas' already exists or:", e.message);
}

const cols = db.prepare("PRAGMA table_info(estudiantes)").all().map(c => c.name);
console.log("Updated estudiantes columns:", cols);
