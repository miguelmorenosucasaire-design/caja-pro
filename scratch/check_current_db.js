const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('caja_institucional.db');

db.serialize(() => {
    db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
        console.log('Tables:', tables.map(t => t.name));
    });

    db.all("SELECT COUNT(*) as count FROM estudiantes", (err, r) => {
        console.log('Estudiantes count:', r[0].count);
    });

    db.all("SELECT COUNT(*) as count FROM movimientos", (err, r) => {
        console.log('Movimientos count:', r[0].count);
    });

    db.all("SELECT * FROM grupos", (err, r) => {
        console.log('Grupos in DB:', r);
    });

    db.all("SELECT * FROM docentes", (err, r) => {
        console.log('Docentes in DB:', r);
    });
});

db.close();
