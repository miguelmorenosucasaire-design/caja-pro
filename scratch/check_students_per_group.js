const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('caja_institucional.db');

const grupos = db.prepare("SELECT id, nombre FROM grupos").all();
console.log('--- Grupos and their students count ---');
grupos.forEach(g => {
    const count = db.prepare("SELECT COUNT(*) as c FROM estudiantes WHERE grupo = ?").get(g.nombre).c;
    console.log(`${g.id}: ${g.nombre} -> ${count} estudiantes`);
});

const unassigned = db.prepare("SELECT COUNT(*) as c FROM estudiantes WHERE grupo IS NULL OR grupo = '' OR grupo NOT IN (SELECT nombre FROM grupos)").get().c;
console.log('Estudiantes sin grupo o con grupo que no existe en grupos:', unassigned);
